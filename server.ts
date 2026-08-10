import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import iconv from 'iconv-lite';
import jschardet from 'jschardet';
import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseTagValue: false,
  trimValues: true,
  isArray: (name) => ['item', 'row', 'list', 'items'].includes(name)
});

/**
 * 텍스트 내 깨진 한글(EUC-KR가 UTF-8/Latin1로 오디코딩된 CJK 한자 媛먮 등)을 감지하여 
 * CP949로 재복원하는 유틸리티
 */
function fixKoreanText(str: string): string {
  if (!str || typeof str !== 'string') return str;

  const hasFFFD = str.includes('\uFFFD') || str.includes('ï¿½');
  const cjkMatches = str.match(/[\u4E00-\u9FFF]/g) || [];
  const hangulMatches = str.match(/[가-힣]/g) || [];

  if (hasFFFD || cjkMatches.length > 0) {
    try {
      const buf = Buffer.from(str, 'binary');
      const decodedCp949 = iconv.decode(buf, 'cp949');
      const fixedHangulMatches = decodedCp949.match(/[가-힣]/g) || [];
      const fixedCjkMatches = decodedCp949.match(/[\u4E00-\u9FFF]/g) || [];

      if (fixedHangulMatches.length > hangulMatches.length && fixedCjkMatches.length < cjkMatches.length) {
        return decodedCp949;
      }
    } catch (e) {
      // ignore
    }
  }
  return str;
}

function recursiveFixObjectEncodings(obj: any): any {
  if (typeof obj === 'string') {
    return fixKoreanText(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(recursiveFixObjectEncodings);
  }
  if (obj && typeof obj === 'object') {
    const newObj: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const fixedKey = fixKoreanText(key);
      newObj[fixedKey] = recursiveFixObjectEncodings(obj[key]);
    }
    return newObj;
  }
  return obj;
}

/**
 * 아이템의 필드 전체를 검사하여 검색어(키워드)가 포함되어 있는지 엄격하게 확인하는 판별 함수
 */
function isMatchItem(item: any, searchWord: string): boolean {
  if (!searchWord || !searchWord.trim()) return true;
  const clean = searchWord.trim().toLowerCase();

  // 검색어를 공백/괄호/슬래시 등으로 분리 (예: "둥굴레 (옥죽)" -> ["둥굴레", "옥죽"])
  const subTerms = clean
    .split(/[\s(),/]+/)
    .map(s => s.trim())
    .filter(s => s.length >= 1);

  if (subTerms.length === 0) return true;

  let itemText = '';
  if (typeof item === 'string') {
    itemText = item;
  } else if (item && typeof item === 'object') {
    itemText = Object.values(item)
      .map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v || '')))
      .join(' ')
      .toLowerCase();
  }

  return subTerms.some(term => itemText.includes(term));
}

/**
 * Buffer를 UTF-8 또는 EUC-KR / CP949 중 가장 정확한 한글 텍스트로 복원하는 디코딩 전용 유틸리티
 */
function decodeKoreanBuffer(buffer: Buffer, contentTypeHeader?: string): string {
  if (!buffer || buffer.length === 0) return '';

  // 1. Content-Type 헤더에서 charset 인코딩 검사
  const contentType = contentTypeHeader || '';
  const isHeaderEucKr = /euc-kr|euc_kr|cp949|ksc5601|ks_c_5601/i.test(contentType);

  // 2. XML / HTML 문서 헤더 500바이트 내 encoding / charset 속성 검사
  const headerSnippet = buffer.subarray(0, 500).toString('latin1');
  const xmlMatch = headerSnippet.match(/<\?xml[^>]*encoding=["']([^"']+)["']/i) ||
                   headerSnippet.match(/<meta[^>]*charset=["']?([^"'\s>]+)/i);
  const xmlEncoding = xmlMatch ? xmlMatch[1].toLowerCase() : '';
  const isXmlEucKr = /euc-kr|euc_kr|cp949|ksc5601|ks_c_5601/i.test(xmlEncoding);

  const cp949Text = iconv.decode(buffer, 'cp949');

  // 헤더나 XML 선언부에서 명시적으로 EUC-KR / CP949를 표시한 경우 무조건 CP949 디코딩 사용
  if (isHeaderEucKr || isXmlEucKr) {
    return fixKoreanText(cp949Text);
  }

  // 3. UTF-8 디코딩 결과와 CP949 디코딩 결과의 한글(가-힣) 계측 비교
  const utf8Text = iconv.decode(buffer, 'utf-8');

  // UTF-8 디코딩 시 대체문자(\uFFFD)나 ï¿½가 포함된 경우 EUC-KR/CP949로 판단
  if (utf8Text.includes('\uFFFD') || utf8Text.includes('ï¿½')) {
    return fixKoreanText(cp949Text);
  }

  const utf8HangulMatch = utf8Text.match(/[가-힣]/g);
  const utf8HangulCount = utf8HangulMatch ? utf8HangulMatch.length : 0;

  const cp949HangulMatch = cp949Text.match(/[가-힣]/g);
  const cp949HangulCount = cp949HangulMatch ? cp949HangulMatch.length : 0;

  const utf8CjkMatch = utf8Text.match(/[\u4E00-\u9FFF]/g);
  const utf8CjkCount = utf8CjkMatch ? utf8CjkMatch.length : 0;

  const cp949CjkMatch = cp949Text.match(/[\u4E00-\u9FFF]/g);
  const cp949CjkCount = cp949CjkMatch ? cp949CjkMatch.length : 0;

  // 디코딩 판별 규칙:
  // 1) CP949 디코딩 결과 한글 수가 UTF-8보다 많거나 CJK 깨짐이 감소하는 경우
  if (cp949HangulCount > utf8HangulCount) {
    return fixKoreanText(cp949Text);
  }

  if (utf8CjkCount > cp949CjkCount && cp949HangulCount > 0) {
    return fixKoreanText(cp949Text);
  }

  // 2) jschardet 감지 보조
  try {
    const detection = jschardet.detect(buffer);
    const detected = (detection.encoding || '').toLowerCase();
    if (['euc-kr', 'cp949', 'windows-1252', 'iso-8859-1', 'euc-jp'].includes(detected)) {
      if (cp949HangulCount >= utf8HangulCount && cp949HangulCount > 0) {
        return fixKoreanText(cp949Text);
      }
    }
  } catch (e) {}

  return fixKoreanText(utf8Text);
}

/**
 * [공공데이터포털 (data.go.kr) 10개 오픈 API 엔드포인트 URL 모음]
 * 공공데이터포털에서 확인하신 최신 공식 주소로 교체하거나 수정할 경우, 아래 객체의 URL을 직접 변경해 주시면 됩니다.
 */
export const API_ENDPOINTS = {
  /** 백두대간 약용식물 */
  백두대간: 'https://apis.data.go.kr/B554620/mdcnlPrntInfoService/getMdcnlPrntInfoList',
  /** 병증 검색 */
  병증검색: 'https://apis.data.go.kr/1430000/NatDisInfoService/getNatDisFieldSearch',
  /** 약재 검색 */
  약재검색: 'https://apis.data.go.kr/1430000/MatInfoService/getMatFieldSearch',
  /** 용어사전 검색 */
  용어사전: 'https://apis.data.go.kr/1430000/TermDicInfoService/getTermDicSearch',
  /** 표준생약정보 */
  표준생약: 'https://apis.data.go.kr/1471057/HerbStdhbdcService/getStdhbdc',
  /** 생약 약재정보 */
  생약약재: 'https://apis.data.go.kr/1471057/HerbMdntfService/getMdntf',
  /** 약용식물 목록 */
  약용식물목록: 'https://apis.data.go.kr/1400000/mclltInfoService/getMclltSearch',
  /** 유사처방 검색 */
  유사처방: 'https://apis.data.go.kr/1430000/SimPreInfoService/getSimPreSearch',
  /** 처방 검색 */
  처방검색: 'https://apis.data.go.kr/1430000/PreInfoService/getPreFieldSearch',
  /** 한약재 허가 기원 */
  한약재허가가원: 'https://apis.data.go.kr/1471057/MedihubPrmsnOrigInfoService/getMedihubPrmsnOrigInfoService'
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const port = 3000;

  // 1. JSON 파싱 미들웨어
  app.use(express.json());

  // 2. Naver API Proxy Endpoint (Vite 미들웨어보다 먼저 정의)
  app.post('/api/naver/proxy', async (req, res) => {
    const { url, method = 'GET', headers = {}, params = {} } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const response = await axios({
        url,
        method,
        headers: {
          'X-Naver-Client-Id': req.headers['x-naver-client-id'] || process.env.VITE_NAVER_CLIENT_ID || process.env.NAVER_CLIENT_ID || '',
          'X-Naver-Client-Secret': req.headers['x-naver-client-secret'] || process.env.VITE_NAVER_CLIENT_SECRET || process.env.NAVER_CLIENT_SECRET || '',
          ...headers
        },
        params,
        responseType: 'arraybuffer', // 인코딩 문제를 방지하기 위해 바이너리로 받음
        timeout: 10000
      });

      const buffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'] || '';
      const decodedData = decodeKoreanBuffer(buffer, contentType);
      
      try {
        // JSON으로 파싱 시도
        const jsonData = JSON.parse(decodedData);
        res.json(jsonData);
      } catch (e) {
        // JSON이 아니면 텍스트로 응답
        res.send(decodedData);
      }
    } catch (error: any) {
      console.error('Naver Proxy Error:', error.response?.data || error.message);
      
      if (error.response && error.response.data instanceof Buffer) {
          const contentType = error.response.headers?.['content-type'] || '';
          const errorData = decodeKoreanBuffer(error.response.data, contentType);
          try {
              return res.status(error.response.status).json(JSON.parse(errorData));
          } catch {
              return res.status(error.response.status).send(errorData);
          }
      }
      
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
  });

  // 3. SanYakBoGam (data.go.kr) 10 OpenAPI Proxy Endpoint
  app.post('/api/sanyakbogam/proxy', async (req, res) => {
    const { 
      url, 
      serviceKey = "vJK%2Ba4qCOBq%2Buwuu6d9OAQTrf%2FmZ%2Fr7bLHCQdBFjTqhrfhdAG2MKW3IAKXx0dMkpIEnxR3bU5jL9VLDAd8hIxw%3D%3D", 
      searchWord, 
      searchParamKeys = ['stSearchValue', 'searchWord', 'item_name', 'herb_name', 'sickName', 'matName', 'termName', 'preName', 'bneNm', 'searchWrd', 'prscrptnNm', 'word'] 
    } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Target URL is required' });
    }

    // Ensure serviceKey parameter is safely encoded with encodeURIComponent
    const rawServiceKey = String(serviceKey || process.env.VITE_PUBLIC_API_KEY || process.env.PUBLIC_API_KEY || '').trim();
    let encodedServiceKey = rawServiceKey;
    if (rawServiceKey.includes('%')) {
      try {
        encodedServiceKey = encodeURIComponent(decodeURIComponent(rawServiceKey));
      } catch {
        encodedServiceKey = encodeURIComponent(rawServiceKey);
      }
    } else {
      encodedServiceKey = encodeURIComponent(rawServiceKey);
    }

    const paramKeysToTest = Array.isArray(searchParamKeys) && searchParamKeys.length > 0 
      ? searchParamKeys 
      : ['stSearchValue', 'searchWord', 'item_name', 'herb_name', 'sickName', 'matName', 'termName', 'preName', 'bneNm', 'searchWrd', 'prscrptnNm', 'word'];

    const cleanWord = typeof searchWord === 'string' ? searchWord.trim() : '';

    let lastErrorMsg = '';

    // Helper to determine if an object is an actual data item record rather than a root/body wrapper
    const isRecordItem = (obj: any): boolean => {
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
      // If object contains fields typical of public herb/medical APIs
      if ('bneNm' in obj || 'item_name' in obj || 'herb_name' in obj || 'matName' in obj || 
          'sickName' in obj || 'termName' in obj || 'preName' in obj || 'plantNm' in obj || 
          'mdcnlPrntNm' in obj || 'mclltNm' in obj || 'prductNm' in obj || 'scienNm' in obj || 
          'efcy' in obj || 'efft' in obj || 'cn' in obj || 'usePart' in obj || 'itemNm' in obj || 
          'herbNm' in obj || 'sickNm' in obj || 'termNm' in obj || 'preNm' in obj || 
          'stSearchValue' in obj || 'korNm' in obj || 'entpName' in obj || 'prscrptnNm' in obj ||
          'mdcnlPrntKnm' in obj || 'plantKnm' in obj || 'mdcnlPart' in obj || 'mdcnlPrntCn' in obj ||
          'mdcnlPrntEfcy' in obj || 'mdcnlPrntInfo' in obj || 'plantScienNm' in obj || 'scifi_name' in obj ||
          'krnm' in obj || 'kor_name' in obj || 'knm' in obj) {
        return true;
      }
      // Check keys: if it contains wrapper keys like header/body/response, it's NOT a record item
      const keys = Object.keys(obj);
      if (keys.includes('header') || keys.includes('cmmMsgHeader') || keys.includes('response') || keys.includes('body')) {
        return false;
      }
      // Count primitive leaf values
      let primitiveCount = 0;
      for (const k of keys) {
        const val = obj[k];
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
          primitiveCount++;
        }
      }
      return keys.length > 0 && primitiveCount >= keys.length / 2;
    };

    // Recursive unwrapper to reach response.body.items.item array or single record
    const extractDataRecords = (data: any, depth = 0): any[] => {
      if (!data || depth > 8) return [];

      if (Array.isArray(data)) {
        const records: any[] = [];
        for (const item of data) {
          if (item && typeof item === 'object') {
            if (isRecordItem(item)) {
              records.push(item);
            } else {
              const sub = extractDataRecords(item, depth + 1);
              if (sub.length > 0) records.push(...sub);
            }
          }
        }
        return records;
      }

      if (typeof data === 'object') {
        if (isRecordItem(data)) {
          return [data];
        }

        const nestedKeys = [
          'item', 'items', 'body', 'response', 'OpenAPI_ServiceResponse', 
          'data', 'list', 'result', 'rows', 'row', 'mdcnlPrntInfo', 'mclltInfo', 'plantInfo'
        ];

        for (const key of nestedKeys) {
          if (data[key] !== undefined && data[key] !== null) {
            const sub = extractDataRecords(data[key], depth + 1);
            if (sub.length > 0) return sub;
          }
        }

        for (const key of Object.keys(data)) {
          if (key === 'header' || key === 'cmmMsgHeader' || key === 'resultCode' || key === 'resultMsg') continue;
          if (data[key] && typeof data[key] === 'object') {
            const sub = extractDataRecords(data[key], depth + 1);
            if (sub.length > 0) return sub;
          }
        }
      }

      return [];
    };

    // Function to safely extract item objects from JSON or XML
    const extractItems = (decodedText: string): any[] => {
      const trimmed = decodedText.trim();
      if (!trimmed) return [];

      // 1. Try JSON Parsing first
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          const extracted = extractDataRecords(parsed);
          if (extracted.length > 0) {
            return extracted;
          }
        } catch (e) {
          // JSON parse failed, fallback to XML
        }
      }

      // 2. Try XML Parsing via fast-xml-parser (Convert XML to JS Object)
      if (trimmed.includes('<') && trimmed.includes('>')) {
        try {
          const parsedXml = xmlParser.parse(trimmed);
          if (parsedXml && typeof parsedXml === 'object') {
            const extracted = extractDataRecords(parsedXml);
            if (extracted.length > 0) {
              return extracted;
            }
          }
        } catch (xmlErr) {
          // XMLParser fallback to regex XML matching below
        }

        // 3. Fallback: Regex-based XML tag extraction
        const items: any[] = [];
        const itemMatches = trimmed.match(/<(item|row|list|mdcnlPrntInfo|mclltInfo|plantInfo|result)[\s>][\s\S]*?<\/\1>/gi) || [];
        for (const itemXml of itemMatches) {
          const itemObj: Record<string, string> = {};
          const fieldMatches = itemXml.match(/<([a-zA-Z0-9_]+)>([\s\S]*?)<\/\1>/g) || [];
          for (const fieldXml of fieldMatches) {
            const match = fieldXml.match(/<([a-zA-Z0-9_]+)>([\s\S]*?)<\/\1>/);
            if (match) {
              const key = match[1];
              let val = match[2] || '';
              val = val.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
              if (val && !val.startsWith('<')) {
                itemObj[key] = val;
              }
            }
          }
          if (Object.keys(itemObj).length > 0) {
            items.push(itemObj);
          }
        }
        if (items.length > 0) {
          return items;
        }
      }

      return [];
    };

    const paramKeys = Array.isArray(paramKeysToTest) && paramKeysToTest.length > 0
      ? Array.from(new Set(paramKeysToTest))
      : ['stSearchWrd', 'item_name', 'sickName', 'matName', 'termName', 'preName', 'prductNm', 'bneNm', 'searchWord', 'stSearchValue', 'word'];

    const attemptUrls: { fullUrl: string; pKey: string }[] = [];

    for (const pKey of paramKeys) {
      const qParts = [
        `serviceKey=${encodedServiceKey}`,
        `pageNo=1`,
        `numOfRows=50`,
        `_type=json`
      ];
      if (cleanWord) {
        qParts.push(`${pKey}=${encodeURIComponent(cleanWord)}`);
      }
      attemptUrls.push({ fullUrl: `${url}?${qParts.join('&')}`, pKey });
    }

    lastErrorMsg = '';

    const primaryKey = (Array.isArray(paramKeysToTest) && paramKeysToTest.length > 0) ? paramKeysToTest[0] : 'stSearchWrd';
    const fallbackDirectUrl = `${url}?serviceKey=${encodedServiceKey}&pageNo=1&numOfRows=100&_type=json&${primaryKey}=${encodeURIComponent(cleanWord)}`;

    // Execute direct server fetch attempts concurrently with generous timeout (15000ms)
    try {
      const fetchAttempt = async (attempt: { fullUrl: string; pKey: string }) => {
        try {
          const response = await axios({
            url: attempt.fullUrl,
            method: 'GET',
            responseType: 'arraybuffer',
            timeout: 15000,
            validateStatus: () => true,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
            }
          });

          const buffer = Buffer.from(response.data);
          const contentType = response.headers['content-type'] || '';
          const decoded = decodeKoreanBuffer(buffer, contentType);

          if (response.status >= 200 && response.status < 300) {
            let items = extractItems(decoded);
            if (items.length > 0) {
              // 1. 인코딩 결함 재복원 (媛먮 등 깨짐 교정)
              let fixedItems = items.map(recursiveFixObjectEncodings);

              // 2. 검색어 엄격 필터링 (API 서버가 검색어를 무시하고 첫 페이지 무작위 데이터를 보낸 경우 필터링)
              if (cleanWord) {
                fixedItems = fixedItems.filter(item => isMatchItem(item, cleanWord));
              }

              if (fixedItems.length > 0) {
                return {
                  success: true,
                  items: fixedItems,
                  usedParamKey: attempt.pKey,
                  debugUrl: attempt.fullUrl,
                  rawResponseText: decoded.slice(0, 3000)
                };
              }
            }
          }
          return {
            success: false,
            items: [],
            usedParamKey: attempt.pKey,
            debugUrl: attempt.fullUrl,
            rawResponseText: decoded.slice(0, 3000),
            status: response.status
          };
        } catch (e: any) {
          return {
            success: false,
            items: [],
            usedParamKey: attempt.pKey,
            debugUrl: attempt.fullUrl,
            rawResponseText: e?.message || 'Network/Timeout Error',
            status: 500
          };
        }
      };

      const results = await Promise.allSettled(attemptUrls.map(fetchAttempt));
      const allResults = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);

      const successfulResult = allResults.find(r => r && r.success && r.items && r.items.length > 0);

      if (successfulResult) {
        return res.json({
          success: true,
          count: successfulResult.items.length,
          items: successfulResult.items,
          usedParamKey: successfulResult.usedParamKey,
          debugUrl: successfulResult.debugUrl,
          rawResponseText: successfulResult.rawResponseText || ''
        });
      }

      // If no items found, pick the rawResponseText from the best attempt that returned string data
      const bestFailedAttempt = allResults.find(r => r && r.rawResponseText && r.rawResponseText.trim().length > 0) || allResults[0];
      const rawTextCaptured = bestFailedAttempt?.rawResponseText || '';
      const debugUrlCaptured = bestFailedAttempt?.debugUrl || fallbackDirectUrl;

      let extractedError = '';
      if (rawTextCaptured) {
        const errMatch = rawTextCaptured.match(/<(errMsg|resultMsg|returnAuthMsg|returnReasonCode|cmmMsgHeader|header)>([\s\S]*?)<\/\1>/i);
        if (errMatch) {
          extractedError = errMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }
      }

      return res.json({
        success: false,
        count: 0,
        items: [],
        error: extractedError ? `공공 API 응답 메시지: ${extractedError}` : (lastErrorMsg || '공공 API 조회 결과 0건 (수신된 원문 참조)'),
        rawResponseText: rawTextCaptured || '수신된 데이터가 없거나 서버 응답 실패',
        debugUrl: debugUrlCaptured
      });
    } catch (err: any) {
      lastErrorMsg = err?.message || '공공데이터 API 통신 예외';
    }

    // Return 0 items gracefully with full debug URL info
    return res.json({
      success: false,
      count: 0,
      items: [],
      error: lastErrorMsg || '공공 API 조회 결과 0건 (또는 XML/JSON 파싱 불가)',
      rawResponseText: '서버 연동 예외 발생',
      debugUrl: fallbackDirectUrl
    });
  });

  // 3. Vite 미들웨어 설정 (개발 환경)
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      host: '0.0.0.0',
      port: 3000
    },
    appType: 'spa', // SPA 모드로 설정하여 Vite가 HTML 서빙을 담당하게 함
  });

  app.use(vite.middlewares);

  // 서버 시작
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
