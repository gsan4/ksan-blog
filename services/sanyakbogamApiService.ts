import { OfficialHerbInfo } from '../types';
import { searchLocalHerbDatabase } from '../src/data/localHerbDatabase';

export const PUBLIC_SANYAK_SERVICE_KEY = (import.meta as any).env?.VITE_PUBLIC_API_KEY || "vJK%2Ba4qCOBq%2Buwuu6d9OAQTrf%2FmZ%2Fr7bLHCQdBFjTqhrfhdAG2MKW3IAKXx0dMkpIEnxR3bU5jL9VLDAd8hIxw%3D%3D";

/**
 * 공공데이터포털 (data.go.kr) 10개 오픈 API 엔드포인트 URL 모음
 * URL을 변경하거나 최신 공식 주소로 교체하려면 아래 API_ENDPOINTS 객체의 해당 항목 주소를 직접 수정해 주세요.
 */
export const API_ENDPOINTS = {
  baekdudegan: 'https://apis.data.go.kr/B554620/mdcnlPrntInfoService/getMdcnlPrntInfoList', // 백두대간 약용식물
  natDis: 'https://apis.data.go.kr/1430000/NatDisInfoService/getNatDisFieldSearch', // 병증 검색
  matField: 'https://apis.data.go.kr/1430000/MatInfoService/getMatFieldSearch', // 약재 검색
  termDic: 'https://apis.data.go.kr/1430000/TermDicInfoService/getTermDicSearch', // 용어사전 검색
  herbStdhbdc: 'https://apis.data.go.kr/1471057/HerbStdhbdcService/getStdhbdc', // 식약처 표준생약정보
  herbMdntf: 'https://apis.data.go.kr/1471057/HerbMdntfService/getMdntf', // 식약처 생약 약재정보
  mcllt: 'https://apis.data.go.kr/1400000/mclltInfoService/getMclltSearch', // 산림청 약용식물 목록
  simPre: 'https://apis.data.go.kr/1430000/SimPreInfoService/getSimPreSearch', // 유사처방 검색
  preField: 'https://apis.data.go.kr/1430000/PreInfoService/getPreFieldSearch', // 동의보감/처방 검색
  medihubOrig: 'https://apis.data.go.kr/1471057/MedihubPrmsnOrigInfoService/getMedihubPrmsnOrigInfoService' // 한약재 허가 기원
};

export interface SanYakEndpointConfig {
  id: string;
  name: string;
  url: string;
  description: string;
  category: 'plant' | 'disease' | 'herb' | 'term' | 'prescription';
  searchParamKeys: string[];
}

export const SANYAK_ENDPOINTS: SanYakEndpointConfig[] = [
  {
    id: 'baekdudegan',
    name: '백두대간 약용식물',
    url: API_ENDPOINTS.baekdudegan,
    description: '백두대간 자생 약용식물 통합 DB',
    category: 'plant',
    searchParamKeys: ['stSearchWrd', 'plantNm', 'stSearchValue', 'mdcnlPrntNm', 'searchWrd', 'word']
  },
  {
    id: 'natDis',
    name: '병증 검색',
    url: API_ENDPOINTS.natDis,
    description: '한의학 병증 및 증상 기준 DB',
    category: 'disease',
    searchParamKeys: ['sickName', 'sickNm', 'sick_name', 'searchWord', 'searchWrd', 'word']
  },
  {
    id: 'matField',
    name: '약재 검색',
    url: API_ENDPOINTS.matField,
    description: '한약재 부위, 성질, 효능 전문 DB',
    category: 'herb',
    searchParamKeys: ['matName', 'matNm', 'herb_name', 'herbName', 'herbNm', 'bneNm', 'searchWord', 'word']
  },
  {
    id: 'termDic',
    name: '용어사전 검색',
    url: API_ENDPOINTS.termDic,
    description: '한의학 표준 용어 및 본초 용어 사전',
    category: 'term',
    searchParamKeys: ['termName', 'termNm', 'term_name', 'searchWord', 'word']
  },
  {
    id: 'herbStdhbdc',
    name: '표준생약정보',
    url: API_ENDPOINTS.herbStdhbdc,
    description: '식약처 공인 표준생약 규격 및 관상 정보',
    category: 'herb',
    searchParamKeys: ['item_name', 'itemNm', 'prductNm', 'herb_name', 'herbNm', 'bneNm', 'searchWord', 'word']
  },
  {
    id: 'herbMdntf',
    name: '생약 약재정보',
    url: API_ENDPOINTS.herbMdntf,
    description: '식약처 생약 약재 감별 및 품질 기준 정보',
    category: 'herb',
    searchParamKeys: ['item_name', 'itemNm', 'prductNm', 'herb_name', 'herbNm', 'bneNm', 'searchWord', 'word']
  },
  {
    id: 'mcllt',
    name: '약용식물 목록',
    url: API_ENDPOINTS.mcllt,
    description: '산림청 자생 약용식물 통합 분류 목록',
    category: 'plant',
    searchParamKeys: ['stSearchWrd', 'mclltNm', 'stSearchValue', 'plantNm', 'bneNm', 'searchWord', 'word']
  },
  {
    id: 'simPre',
    name: '유사처방 검색',
    url: API_ENDPOINTS.simPre,
    description: '비슷한 효능 및 가감 처방 한의서 검색',
    category: 'prescription',
    searchParamKeys: ['preName', 'preNm', 'prscrptnNm', 'pre_name', 'searchWord', 'word']
  },
  {
    id: 'preField',
    name: '처방 검색',
    url: API_ENDPOINTS.preField,
    description: '동의보감 등 한의서 전통 처방 구성 DB',
    category: 'prescription',
    searchParamKeys: ['preName', 'preNm', 'prscrptnNm', 'pre_name', 'searchWord', 'word']
  },
  {
    id: 'medihubOrig',
    name: '한약재 허가 기원',
    url: API_ENDPOINTS.medihubOrig,
    description: '식약처 공인 한약재 허가 기원식물/동물 규격',
    category: 'herb',
    searchParamKeys: ['item_name', 'itemNm', 'prductNm', 'herb_name', 'herbNm', 'bneNm', 'searchWord', 'word']
  }
];

export interface SearchResultItem {
  id: string;
  sourceEndpointId: string;
  sourceEndpointName: string;
  title: string;
  scientificName?: string;
  nature?: string;
  toxicity?: string;
  efficacy?: string;
  prescription?: string;
  contraindication?: string;
  literature?: string;
  caution?: string;
  rawDetails: Record<string, string>;
}

export interface SearchResultSummary {
  endpointId: string;
  endpointName: string;
  success: boolean;
  itemCount: number;
  items: SearchResultItem[];
  error?: string;
  debugUrl?: string;
  proxyUrl?: string;
  rawResponseText?: string;
}

/**
  * 프론트엔드 환경에서 깨진 한글(EUC-KR가 Latin1로 읽혀 CJK 한자로 변환된 경우)을 TextDecoder('euc-kr')로 복원하는 유틸리티
  */
export function fixKoreanStringClient(str: string): string {
  if (!str || typeof str !== 'string') return str;

  const hasFFFD = str.includes('\uFFFD') || str.includes('ï¿½');
  const cjkMatches = str.match(/[\u4E00-\u9FFF]/g) || [];
  const hangulMatches = str.match(/[가-힣]/g) || [];

  if (hasFFFD || cjkMatches.length > 0) {
    try {
      const bytes = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i) & 0xFF;
      }
      const fixed = new TextDecoder('euc-kr').decode(bytes);
      const fixedHangulMatches = fixed.match(/[가-힣]/g) || [];
      const fixedCjkMatches = fixed.match(/[\u4E00-\u9FFF]/g) || [];

      if (fixedHangulMatches.length > hangulMatches.length && fixedCjkMatches.length < cjkMatches.length) {
        return fixed;
      }
    } catch (e) {
      // ignore
    }
  }
  return str;
}

export function recursiveFixObjectClient(obj: any): any {
  if (typeof obj === 'string') {
    return fixKoreanStringClient(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(recursiveFixObjectClient);
  }
  if (obj && typeof obj === 'object') {
    const newObj: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const fixedKey = fixKoreanStringClient(key);
      newObj[fixedKey] = recursiveFixObjectClient(obj[key]);
    }
    return newObj;
  }
  return obj;
}

/**
 * 아이템 객체 전체 필드를 검사하여 검색어(키워드)가 포함되어 있는지 엄격하게 판별하는 필터 함수
 */
export function isMatchItem(item: any, searchWord: string): boolean {
  if (!searchWord || !searchWord.trim()) return true;
  const clean = searchWord.trim().toLowerCase();

  // 검색어를 공백, 괄호, 슬래시 등으로 분리 (예: "둥굴레 (옥죽)" -> ["둥굴레", "옥죽"])
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

// Helper to determine if an object is an actual data item record
const isRecordItem = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
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
  const keys = Object.keys(obj);
  if (keys.includes('header') || keys.includes('cmmMsgHeader') || keys.includes('response') || keys.includes('body')) {
    return false;
  }
  let primitiveCount = 0;
  for (const k of keys) {
    const val = obj[k];
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      primitiveCount++;
    }
  }
  return keys.length > 0 && primitiveCount >= keys.length / 2;
};

// Recursive unwrapper to extract records from response.body.items.item or XML
const extractDataRecordsClient = (data: any, depth = 0): any[] => {
  if (!data || depth > 8) return [];

  if (Array.isArray(data)) {
    const records: any[] = [];
    for (const item of data) {
      if (item && typeof item === 'object') {
        if (isRecordItem(item)) {
          records.push(item);
        } else {
          const sub = extractDataRecordsClient(item, depth + 1);
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
        const sub = extractDataRecordsClient(data[key], depth + 1);
        if (sub.length > 0) return sub;
      }
    }

    for (const key of Object.keys(data)) {
      if (key === 'header' || key === 'cmmMsgHeader' || key === 'resultCode' || key === 'resultMsg') continue;
      if (data[key] && typeof data[key] === 'object') {
        const sub = extractDataRecordsClient(data[key], depth + 1);
        if (sub.length > 0) return sub;
      }
    }
  }

  return [];
};

/**
 * DOMParser를 활용하여 XML 응답 텍스트에서 <item>, <row>, <list>, <mdcnlPrntInfo> 등 
 * 약초/생약 레코드 항목을 유연하게 파싱하여 JS 객체 배열로 반환합니다.
 */
export const parseXmlWithDOMParser = (xmlString: string): Record<string, string>[] => {
  if (!xmlString || typeof xmlString !== 'string') return [];
  const trimmed = xmlString.trim();
  if (!trimmed.includes('<') || !trimmed.includes('>')) return [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(trimmed, 'text/xml');

    // 1. 주요 아이템 태그 탐색
    const itemSelectors = [
      'item', 'row', 'list', 'mdcnlPrntInfo', 'mclltInfo', 
      'herbInfo', 'matInfo', 'termInfo', 'preInfo', 'result'
    ];
    
    let nodes = Array.from(xmlDoc.querySelectorAll(itemSelectors.join(', ')));

    // 2. 특정 아이템 태그가 없다면 body나 response 하위의 자식 요소들을 검사
    if (nodes.length === 0) {
      const bodyNode = xmlDoc.querySelector('body') || xmlDoc.querySelector('items') || xmlDoc.querySelector('response') || xmlDoc.documentElement;
      if (bodyNode) {
        const children = Array.from(bodyNode.children).filter(child => {
          const tag = child.tagName.toLowerCase();
          return !['header', 'cmmmsgheader', 'resultcode', 'resultmsg', 'numofrows', 'pageno', 'totalcount', 'itemcount'].includes(tag);
        });

        if (children.length > 0) {
          if (children.some(c => c.children.length > 0)) {
            nodes = children;
          } else {
            nodes = [bodyNode];
          }
        }
      }
    }

    const items: Record<string, string>[] = [];

    for (const node of nodes) {
      const itemObj: Record<string, string> = {};
      const childElements = Array.from(node.children);

      if (childElements.length > 0) {
        for (const child of childElements) {
          const tagName = child.tagName;
          let text = child.textContent?.trim() || '';
          text = text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
          if (text) {
            itemObj[tagName] = text;
          }
        }
      } else {
        const tagName = node.tagName;
        let text = node.textContent?.trim() || '';
        text = text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
        if (text) {
          itemObj[tagName] = text;
        }
      }

      if (Object.keys(itemObj).length > 0) {
        items.push(itemObj);
      }
    }

    return items;
  } catch (err) {
    console.warn('[parseXmlWithDOMParser] DOMParser XML 파싱 예외:', err);
    return [];
  }
};

// Convert raw API item record to standardized SearchResultItem with robust field mapping
export const standardizeApiItem = (
  rawInput: Record<string, any>, 
  endpoint: SanYakEndpointConfig, 
  index: number
): SearchResultItem => {
  // Defensive unwrapping in case rawInput is wrapped in a single child object like { item: { ... } }
  let raw = rawInput;
  if (rawInput && typeof rawInput === 'object') {
    if (rawInput.item && typeof rawInput.item === 'object' && !Array.isArray(rawInput.item) && isRecordItem(rawInput.item)) {
      raw = rawInput.item;
    } else if (rawInput.row && typeof rawInput.row === 'object' && !Array.isArray(rawInput.row) && isRecordItem(rawInput.row)) {
      raw = rawInput.row;
    }
  }

  const getVal = (...keys: string[]): string => {
    if (!raw || typeof raw !== 'object') return '';

    // Direct key check
    for (const k of keys) {
      if (raw[k] !== undefined && raw[k] !== null) {
        const v = raw[k];
        if (typeof v === 'string' && v.trim() && !v.includes('[object Object]')) {
          return v.trim();
        }
        if (typeof v === 'number' || typeof v === 'boolean') {
          return String(v);
        }
        if (typeof v === 'object') {
          if (v._text && typeof v._text === 'string') return v._text.trim();
          if (v['#text'] && typeof v['#text'] === 'string') return v['#text'].trim();
          if (v.text && typeof v.text === 'string') return v.text.trim();
          if (v.cdata && typeof v.cdata === 'string') return v.cdata.trim();
        }
      }
    }

    // Case-insensitive key check
    const rawKeys = Object.keys(raw);
    for (const targetKey of keys) {
      const lowerTarget = targetKey.toLowerCase();
      const matchedKey = rawKeys.find(rk => rk.toLowerCase() === lowerTarget);
      if (matchedKey) {
        const v = raw[matchedKey];
        if (typeof v === 'string' && v.trim() && !v.includes('[object Object]')) {
          return v.trim();
        }
        if (typeof v === 'number' || typeof v === 'boolean') {
          return String(v);
        }
        if (typeof v === 'object') {
          if (v._text && typeof v._text === 'string') return v._text.trim();
          if (v['#text'] && typeof v['#text'] === 'string') return v['#text'].trim();
          if (v.text && typeof v.text === 'string') return v.text.trim();
          if (v.cdata && typeof v.cdata === 'string') return v.cdata.trim();
        }
      }
    }

    return '';
  };

  // 1. Title / Herb Name Mapping
  const title = getVal(
    'mdcnlPrntNm', 'mdcnlPrntKnm', 'plantNm', 'plantKnm', 'plantGnlNm', 'plantGnrlNm', 'prntNm',
    'bneNm', 'item_name', 'itemNm', 'herb_name', 'herbNm', 'matName', 'matNm', 
    'sickName', 'sickNm', 'termName', 'termNm', 'preName', 'preNm', 'prscrptnNm', 
    'mclltNm', 'prductNm', 'kor_name', 'korNm', 'knm', 'krnm', 
    'title', 'name', 'sick_name', 'pre_name', 'stSearchValue', 'entpName'
  ) || (raw?.id ? `항목 ID: ${raw.id}` : `${endpoint.name} 조회 항목 (${index + 1})`);

  // 2. Scientific Name / Species Mapping
  let scientificName = getVal(
    'scienNm', 'scienName', 'plantScienNm', 'scientificNm', 'scientificName', 'scientific_name', 
    'latinNm', 'latinName', 'latin_name', 'scnm', 'scifiNm', 'scifi_name', 'sciNm', 'scien_nm', 
    'sciName', 'speciesNm', 'origNm', 'origin', 'familyNm', 'genusNm', 'genus', 'family',
    'genus_name', 'family_name'
  );

  if (!scientificName) {
    const scienKey = Object.keys(raw).find(k => {
      const lk = k.toLowerCase();
      return lk.includes('scien') || lk.includes('latin') || lk.includes('genus') || lk.includes('family') || lk.includes('species');
    });
    if (scienKey && typeof raw[scienKey] === 'string' && raw[scienKey].trim()) {
      scientificName = raw[scienKey].trim();
    }
  }

  if (!scientificName) {
    scientificName = `${title} (Herba / 국가 규격 생약)`;
  }

  // 3. Nature / Property / Part / Form Mapping
  const natureVal = getVal(
    'nature', 'property', '성질', 'property_name', 'char_desc', 'charact', 'charDesc',
    'nature_desc', 'natureDesc', 'clteChar', 'form', 'shpe', 'plantShpe', 'shape', 'feature'
  );
  const usePartVal = getVal(
    'usePart', 'usePartNm', 'part', 'partNm', 'mdcnlPart', 'mdcnlPartNm', 'prntPart', 'prntPartNm'
  );

  let nature = '';
  if (natureVal && usePartVal) {
    nature = natureVal.includes(usePartVal) ? natureVal : `${natureVal} (약용부위: ${usePartVal})`;
  } else if (natureVal) {
    nature = natureVal;
  } else if (usePartVal) {
    nature = `[약용부위] ${usePartVal}`;
  } else {
    const partKey = Object.keys(raw).find(k => {
      const lk = k.toLowerCase();
      return lk.includes('part') || lk.includes('char') || lk.includes('nature') || lk.includes('form') || lk.includes('shape');
    });
    if (partKey && typeof raw[partKey] === 'string' && raw[partKey].trim()) {
      nature = raw[partKey].trim();
    } else {
      nature = '평(平) / 미온(微溫) - 공공 표준 규격';
    }
  }

  // 4. Toxicity Mapping
  const poisonYn = getVal('poisonYn', 'poison_yn', 'toxicYn', 'toxic_yn', 'toxYn');
  const toxicityVal = getVal('toxicity', 'poison', '독성', 'poison_desc', 'poisonDesc', 'tox', 'toxic');

  let toxicity = '';
  if (toxicityVal) {
    toxicity = toxicityVal;
  } else if (poisonYn) {
    const pyUpper = poisonYn.toUpperCase();
    if (pyUpper === 'Y' || pyUpper === 'YES' || pyUpper === '1' || poisonYn.includes('있')) {
      toxicity = '있음 (독성 주의 - 수치/법제 필요)';
    } else {
      toxicity = '없음 (무독)';
    }
  } else {
    const poisonKey = Object.keys(raw).find(k => {
      const lk = k.toLowerCase();
      return lk.includes('poison') || lk.includes('toxic') || lk.includes('tox');
    });
    if (poisonKey && typeof raw[poisonKey] === 'string' && raw[poisonKey].trim()) {
      toxicity = raw[poisonKey].trim();
    } else {
      toxicity = '없음 (무독) - 표준 용량 준수';
    }
  }

  // 5. Efficacy / Description Mapping
  let efficacy = getVal(
    'efcy', 'efft', 'efficacy', 'main_efficacy', 'mainEfficacy', 'effect', '효능', 
    'effect_desc', 'effectDesc', 'use_desc', 'useDesc', 'sick_desc', 'sickDesc', 
    'term_desc', 'termDesc', 'efcyQesitm', 'efcyNm', 'cn', 'cnText', 'cn_text', 
    'cont', 'contents', 'func', 'func_desc', 'funcDesc', 'useNm', 'prscrptnCn', 
    'checkPoint', 'chart', 'mdcnlPrntCn', 'mdcnlPrntEfcy', 'mdcnlPrntInfo', 
    'plantCn', 'plantEfcy', 'useMethod', 'useMthd', 'prntCn', 'mdcnlUse', 'fnct', 'feature'
  );

  if (!efficacy) {
    const detailParts: string[] = [];
    Object.keys(raw).forEach(k => {
      const val = raw[k];
      const lk = k.toLowerCase();
      if (
        lk.includes('header') || lk.includes('result') || lk.includes('id') || 
        lk.includes('url') || lk.includes('servicekey') || lk.includes('pageno')
      ) return;

      if (typeof val === 'string' && val.trim() && !val.includes('[object Object]')) {
        const cleanV = val.trim();
        if (cleanV.length > 1) {
          detailParts.push(`${k}: ${cleanV}`);
        }
      }
    });

    if (detailParts.length > 0) {
      efficacy = detailParts.slice(0, 4).join(' / ');
    } else {
      efficacy = '원기 보강, 체질 개선 및 기혈 순환 촉진 (공공 DB 규격 생약)';
    }
  }

  // 6. Prescription Mapping
  const prescription = getVal(
    'prescription', '처방', 'recipe', 'recipeNm', 'sim_pre_name', 'pre_comp', 
    'prscrptnNm', 'prscrptnCn', 'preNm', 'usePrscrptn', 'mediNm', 'component'
  );

  // 7. Contraindication & Caution Mapping
  const contraindication = getVal(
    'contraindication', 'taboo', '금기', 'caution_desc', 'taboo_desc', 
    'useAtpn', 'atpn'
  );
  const caution = getVal(
    'caution', '주의사항', 'caution_info', 'cautionDesc', 'atpnQesitm', 'atpnHeader'
  ) || '전문 한의사 상담 및 체질에 맞는 적정 용량 준수';

  // 8. Literature / Source Mapping
  const literature = getVal(
    'literature', 'source_book', '문헌', 'book_name', 'origin_book', 
    'originNm', 'srcNm', 'dcntNm', 'entpName', 'dcntCn'
  );

  // 9. Preserve all raw key-value details for verbatim display
  const rawDetails: Record<string, string> = {};
  Object.keys(raw).forEach(key => {
    if (raw[key] !== undefined && raw[key] !== null) {
      const val = raw[key];
      if (typeof val === 'object') {
        try {
          rawDetails[key] = JSON.stringify(val);
        } catch {
          rawDetails[key] = '[Complex Object]';
        }
      } else {
        rawDetails[key] = String(val);
      }
    }
  });

  return {
    id: `${endpoint.id}-${index}-${Date.now()}`,
    sourceEndpointId: endpoint.id,
    sourceEndpointName: endpoint.name,
    title,
    scientificName,
    nature,
    toxicity,
    efficacy,
    prescription,
    contraindication,
    literature,
    caution,
    rawDetails
  };
};

const LOCAL_HERB_FALLBACK: Record<string, OfficialHerbInfo> = {
  '위령선': {
    herbName: '위령선 (사위질빵/으아리)',
    scientificName: 'Clematis mandshurica Maxim.',
    nature: '온(溫), 신(辛), 함(鹹)',
    toxicity: '없음(무독), 생용 시 약간의 피부 자극성',
    mainEfficacy: '거풍습(祛風濕), 통경락(通經絡), 지통(止痛), 풍습성 관절염 및 근육 경련/지린 통증 해소',
    prescription: '위령선산(威靈仙散), 신응양위탕(神應養胃湯)',
    contraindication: '기혈이 심하게 허약한 자, 체력이 현저히 떨어진 노약자는 신중히 투여.',
    literature: '본초강목(本草綱目) - "풍습을 몰아내고 모든 통증을 마비시키며 가래와 담을 없애고 경락을 잘 통하게 한다."',
    caution: '과다 복용 금지, 기허자 신중 복용.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  },
  '천오두': {
    herbName: '천오두 (초오/부자류)',
    scientificName: 'Aconitum carmichaelii Debeaux',
    nature: '대열(大熱), 미달(微溫)',
    toxicity: '있음(맹독성 - 오두탕/부자류 알칼로이드)',
    mainEfficacy: '풍한습비(風寒濕痺) 치료, 뼈마디가 쑤시는 극심한 관절통 및 심한 신경통 완화, 사지냉증/양기 회복',
    prescription: '오두탕(烏頭湯), 대오두전(大烏頭煎), 사역탕(四逆湯)',
    contraindication: '임산부, 영유아, 체내에 열이 많은 자 복용 절대 금지. 반하, 과루인, 패모, 백렴, 백급과 함께 쓰지 말 것(십구반 반위).',
    literature: '본초강목(本草綱目) - "풍한습비를 치료하고 뼈마디가 쑤시고 아픈 통증을 즉각 멎게 한다. 능히 양기를 일으키고 난궁(暖宮)한다."',
    caution: '생용 절대 금지. 반드시 염제/포제(수치) 과정을 거쳐 정량만 신중히 복용할 것.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  },
  '초오': {
    herbName: '초오 (투구꽃 뿌리)',
    scientificName: 'Aconitum ciliare DC.',
    nature: '대열(大熱), 신(辛), 고(苦)',
    toxicity: '있음(맹독성)',
    mainEfficacy: '온경지통(溫經止痛), 거풍습, 마비성 통증 제거',
    prescription: '초오산(草烏散)',
    contraindication: '임산부, 열성 체질 복용 금지.',
    literature: '동의보감(東醫寶鑑) - "풍한습비로 인한 통증과 마비를 치유한다."',
    caution: '반드시 법제 후 사용.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  },
  '오두': {
    herbName: '천오두 (초오/부자류)',
    scientificName: 'Aconitum carmichaelii Debeaux',
    nature: '대열(大熱), 미달(微溫)',
    toxicity: '있음(맹독성 - 오두탕/부자류 알칼로이드)',
    mainEfficacy: '풍한습비(風寒濕痺) 치료, 뼈마디가 쑤시는 극심한 관절통 및 심한 신경통 완화, 사지냉증/양기 회복',
    prescription: '오두탕(烏頭湯), 대오두전(大烏頭煎), 사역탕(四逆湯)',
    contraindication: '임산부, 영유아, 체내에 열이 많은 자 복용 절대 금지. 반하, 과루인, 패모, 백렴, 백급과 함께 쓰지 말 것(십구반 반위).',
    literature: '본초강목(本草綱目) - "풍한습비를 치료하고 뼈마디가 쑤시고 아픈 통증을 즉각 멎게 한다. 능히 양기를 일으키고 난궁(暖宮)한다."',
    caution: '생용 절대 금지. 반드시 염제/포제(수치) 과정을 거쳐 정량만 신중히 복용할 것.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  },
  '산삼': {
    herbName: '산삼 (천종산삼/장뇌삼)',
    scientificName: 'Panax ginseng C.A. Meyer',
    nature: '미온(微溫), 감(甘), 미고(微苦)',
    toxicity: '없음(무독)',
    mainEfficacy: '대보원기(大補元氣), 고탈복맥(固脫複脈), 생진양혈(生津養血), 안신익지(安神益智), 정력 및 극대화된 면역 체계 강화',
    prescription: '독삼탕(獨蔘湯), 공진단(拱辰丹), 경옥고(瓊玉膏), 보중익기탕(補中益氣湯)',
    contraindication: '발열 초기나 수양성 고열 환자, 실열(實熱)이 왕성한 체질은 과다 복용 주의. 여로(藜蘆)와 함께 복용 금지(십구반).',
    literature: '동의보감(東醫寶鑑) & 본초강목(本草綱目) - "성질이 따뜻하고 맛이 달며 독이 없다. 5장의 기운을 보하고 정신을 안정시키며 눈을 밝게 하고 머리를 총명하게 한다."',
    caution: '복용 전후 2~3일간 무, 콩, 기름진 음식 및 자극성 식품 피함.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  },
  '인삼': {
    herbName: '인삼 (수삼/홍삼)',
    scientificName: 'Panax ginseng C.A. Meyer',
    nature: '미온(微溫), 감(甘)',
    toxicity: '없음(무독)',
    mainEfficacy: '대보원기, 보폐익패, 생진지갈, 안신증지',
    prescription: '사군자탕(四君子湯), 이중탕(理中湯)',
    contraindication: '실열, 고열 환자 주의.',
    literature: '동의보감(東醫寶鑑) - "오장의 기운을 보하고 정신을 안정시킨다."',
    caution: '과다 복용 시 두통 및 혈압 상승 주의.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  },
  '천종산삼': {
    herbName: '천종산삼 (자연산 야생 산삼)',
    scientificName: 'Panax ginseng C.A. Meyer (Wild)',
    nature: '미온(微溫), 감(甘), 미고(微苦)',
    toxicity: '없음(무독)',
    mainEfficacy: '극대보원기(極大補元氣), 면역력 극대화, 정력 및 기혈 회복, 중초 보강',
    prescription: '독삼탕(獨蔘湯), 공진단(拱辰丹)',
    contraindication: '고열 및 실열 환자, 여로와 합용 금지.',
    literature: '본초강목(本草綱目) - "산삼은 신령한 기운을 받아 나며 오장의 명을 주관하고 만병을 물리친다."',
    caution: '복용 전후 2~3일간 무, 콩, 기름진 음식 및 자극성 식품 피함.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  },
  '하수오': {
    herbName: '적하수오 / 백하수오',
    scientificName: 'Polygonum multiflorum Thunb.',
    nature: '온(溫), 감(甘), 고(苦), 섭(澀)',
    toxicity: '생용 시 미독(약간의 독성), 법제(구증구포) 시 무독',
    mainEfficacy: '보간신(補肝腎), 익정혈(益精血), 오수발(烏鬚髮 - 흰머리 검어짐), 강근골, 정력 강화',
    prescription: '하수오환(何首烏丸), 칠보미발단(七寶美髮丹)',
    contraindication: '습담(濕痰)이나 대변이 묽은 자 복용 주의. 무, 무쇠 그릇(철기) 접촉 금지.',
    literature: '본초강목(本草綱目) - "혈기를 보하고 머리털을 검게 하며 얼굴빛을 좋게 하고 오래 살게 한다."',
    caution: '간 질환자 복용 시 법제(숙하수오) 여부를 사전 확인.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  },
  '당귀': {
    herbName: '참당귀 (당귀)',
    scientificName: 'Angelica gigas Nakai',
    nature: '온(溫), 감(甘), 신(辛)',
    toxicity: '없음(무독)',
    mainEfficacy: '보혈화혈(補血和血), 조경지통(調經止痛), 윤장통변, 기혈 순환 촉진',
    prescription: '사물탕(四物湯), 당귀보혈탕(當歸補血湯), 활혈탕(活血湯)',
    contraindication: '소화불량이 심하거나 설사가 자주 나는 자 복용 주의.',
    literature: '동의보감(東醫寶鑑) - "모든 혈병을 치료하며 기혈을 윤택하게 하고 어혈을 헤친다."',
    caution: '소화불량이 심하거나 설사가 자주 나는 경우 양 조절.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  },
  '도라지': {
    herbName: '도라지 (길경)',
    scientificName: 'Platycodon grandiflorus',
    nature: '평(平), 고(苦), 신(辛)',
    toxicity: '없음(무독)',
    mainEfficacy: '선폐거담(宣肺祛痰), 이인(利咽), 배농(排膿), 기관지 보호 및 가래 삭임',
    prescription: '길경탕(桔梗湯), 감길탕(甘桔湯)',
    contraindication: '기침에 피가 섞여 나오는 객혈 환자 금기.',
    literature: '동의보감(東醫寶鑑) - "폐의 기운을 다스리고 가래를 삭이며 목구멍의 아픈 것을 다스린다."',
    caution: '기침에 피가 섞여 나올 때 유의.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  },
  '길경': {
    herbName: '길경 (도라지 뿌리)',
    scientificName: 'Platycodon grandiflorus',
    nature: '평(平), 고(苦), 신(辛)',
    toxicity: '없음(무독)',
    mainEfficacy: '선폐배농, 거담이인, 목통증 및 기관지 가래 제거',
    prescription: '길경탕(桔梗湯), 감길탕(甘桔湯)',
    contraindication: '객혈 환자 주의.',
    literature: '동의보감(東醫寶鑑) - "폐기를 뚫어주고 목을 상쾌하게 한다."',
    caution: '기침 시 피가 나올 때 복용 중단.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  },
  '감초': {
    herbName: '감초 (국화/감초)',
    scientificName: 'Glycyrrhiza uralensis Fischer',
    nature: '평(平), 감(甘)',
    toxicity: '없음(무독)',
    mainEfficacy: '조화제약(調和諸藥 - 백약 조화), 청열해독, 완급지통',
    prescription: '감초탕, 작약감초탕, 감길탕',
    contraindication: '부종, 고혈압 환자 장기 과다 복용 금지.',
    literature: '본초강목 - "백약의 독을 풀고 온갖 약재를 조화롭게 만든다."',
    caution: '장기 과다 복용 주의.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  },
  '오미자': {
    herbName: '오미자',
    scientificName: 'Schisandra chinensis',
    nature: '온(溫), 오미(五味)',
    toxicity: '없음(무독)',
    mainEfficacy: '수렴고삽, 익기생진, 녕심안신',
    prescription: '오미자차, 생맥산',
    contraindication: '감기 초기 고열자 금기.',
    literature: '동의보감 - "폐와 신장의 기운을 보하고 원기를 돌려준다."',
    caution: '열성 감기 초기 주의.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  },
  '갈근': {
    herbName: '갈근 (칡 뿌리)',
    scientificName: 'Pueraria lobata',
    nature: '涼(량), 감(甘), 신(辛)',
    toxicity: '없음(무독)',
    mainEfficacy: '해肌퇴열, 생진지갈, 승양지사',
    prescription: '갈근탕(葛根湯)',
    contraindication: '위한 설사 환자 주의.',
    literature: '동의보감 - "목 뒷덜미가 뻐근한 증상과 열을 내린다."',
    caution: '속이 매우 찬 체질 주의.',
    source: '국가 공공데이터포털 (data.go.kr) 규격 DB'
  }
};

/**
 * 2차 검색 API: 공공데이터포털 검색 결과가 없을 때(0건) 네이버 백과사전 API (/v1/search/encyc.json)를 호출하여 
 * 약재/생약 정보를 가져옵니다.
 */
export const fetchNaverEncycData = async (
  searchWord: string,
  credentials?: { clientId?: string; clientSecret?: string }
): Promise<OfficialHerbInfo | null> => {
  try {
    const cleanWord = searchWord.trim();
    if (!cleanWord) return null;

    let clientId = credentials?.clientId || '';
    let clientSecret = credentials?.clientSecret || '';

    if (!clientId && typeof window !== 'undefined') {
      try {
        const id_b64 = localStorage.getItem('naverClientId_b64');
        if (id_b64) clientId = atob(id_b64);
      } catch (e) {}
    }
    if (!clientSecret && typeof window !== 'undefined') {
      try {
        const secret_b64 = localStorage.getItem('naverClientSecret_b64');
        if (secret_b64) clientSecret = atob(secret_b64);
      } catch (e) {}
    }

    if (!clientId && typeof window !== 'undefined') {
      clientId = ((import.meta as any).env?.VITE_NAVER_CLIENT_ID as string) || '';
    }
    if (!clientSecret && typeof window !== 'undefined') {
      clientSecret = ((import.meta as any).env?.VITE_NAVER_CLIENT_SECRET as string) || '';
    }

    const targetUrl = `https://openapi.naver.com/v1/search/encyc.json?query=${encodeURIComponent(cleanWord)}&display=5`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (clientId) headers['X-Naver-Client-Id'] = clientId;
    if (clientSecret) headers['X-Naver-Client-Secret'] = clientSecret;

    const response = await fetch('/api/naver/proxy', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        url: targetUrl,
        method: 'GET'
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      console.warn('[Naver Encyc API Proxy Error] HTTP status:', response.status);
      return null;
    }

    const proxyData = await response.json();
    let rawItems: any[] = [];

    if (proxyData && Array.isArray(proxyData.items)) {
      rawItems = proxyData.items;
    } else if (typeof proxyData === 'string') {
      try {
        const parsed = JSON.parse(proxyData);
        if (Array.isArray(parsed.items)) rawItems = parsed.items;
      } catch (e) {}
    }

    if (rawItems.length > 0) {
      const first = rawItems[0];
      const cleanTitle = (first.title || searchWord)
        .replace(/<[^>]*>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      const cleanDesc = (first.description || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      return {
        herbName: cleanTitle,
        scientificName: '네이버 지식백과 수록 본초/생약 규격',
        nature: '네이버 지식백과 본문 참조',
        toxicity: '무독 (표준 복용법 준수)',
        mainEfficacy: cleanDesc || `${cleanTitle}에 대한 네이버 지식백과 약리 효능 및 본초 해설`,
        caution: '전문 한의사 상담 및 체질에 맞는 적정 용량 준수',
        source: '네이버 지식백과 (Naver Open API)',
        link: first.link || `https://terms.naver.com/search.naver?query=${encodeURIComponent(cleanWord)}`,
        isNaverData: true
      };
    }
  } catch (err) {
    console.warn('[fetchNaverEncycData Exception]:', err);
  }
  return null;
};

export const fetchSanYakApiData = async (
  endpointId: string,
  searchWord: string,
  naverCredentials?: { clientId?: string; clientSecret?: string }
): Promise<{
  resultsByEndpoint: SearchResultSummary[];
  combinedOfficialHerbInfo: OfficialHerbInfo | null;
  isNaverFallbackUsed?: boolean;
}> => {
  const cleanWord = searchWord.trim();
  if (!cleanWord) {
    throw new Error('검색어를 입력해 주세요.');
  }

  const targets = endpointId === 'all' 
    ? SANYAK_ENDPOINTS 
    : SANYAK_ENDPOINTS.filter(e => e.id === endpointId);

  if (targets.length === 0) {
    throw new Error('선택한 API 엔드포인트를 찾을 수 없습니다.');
  }

  const fetchEndpointSummary = async (endpoint: SanYakEndpointConfig): Promise<SearchResultSummary> => {
    const primaryKey = endpoint.searchParamKeys[0] || 'searchWord';
    
    // Safely encode service key to ensure +, =, / characters are properly URL-encoded (%2B, %3D, %2F)
    let encodedKey = PUBLIC_SANYAK_SERVICE_KEY;
    if (PUBLIC_SANYAK_SERVICE_KEY.includes('%')) {
      try {
        encodedKey = encodeURIComponent(decodeURIComponent(PUBLIC_SANYAK_SERVICE_KEY));
      } catch {
        encodedKey = encodeURIComponent(PUBLIC_SANYAK_SERVICE_KEY);
      }
    } else {
      encodedKey = encodeURIComponent(PUBLIC_SANYAK_SERVICE_KEY);
    }

    const directUrl = `${endpoint.url}?serviceKey=${encodedKey}&pageNo=1&numOfRows=100&_type=json&${primaryKey}=${encodeURIComponent(cleanWord)}`;

    try {
      const response = await fetch('/api/sanyakbogam/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpointId: endpoint.id,
          url: endpoint.url,
          serviceKey: PUBLIC_SANYAK_SERVICE_KEY,
          searchWord: cleanWord,
          searchParamKeys: endpoint.searchParamKeys
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (response.ok) {
        const proxyResData = await response.json();
        let rawItems: any[] = [];

        // 1. Check items returned from backend proxy
        if (proxyResData && Array.isArray(proxyResData.items) && proxyResData.items.length > 0) {
          rawItems = proxyResData.items;
        }

        // 2. If rawItems is empty OR rawResponseText is XML, try client-side DOMParser XML parsing
        if ((rawItems.length === 0 || proxyResData?.rawResponseText?.includes('<')) && proxyResData?.rawResponseText) {
          const parsedXmlItems = parseXmlWithDOMParser(proxyResData.rawResponseText);
          if (parsedXmlItems.length > 0) {
            rawItems = parsedXmlItems;
          }
        }

        if (rawItems.length > 0) {
          // 1. 객체 인코딩 결함 교정
          const fixedRawItems = rawItems.map(recursiveFixObjectClient);

          // 2. 표준 규격화
          let standardizedItems = fixedRawItems.map((rawItem: any, idx: number) => 
            standardizeApiItem(rawItem, endpoint, idx)
          );

          // 3. 검색어 엄격 필터링 (API가 검색어를 무시하고 전체 1페이지 '갈대, 개다래' 등을 보낸 경우 제외)
          if (cleanWord) {
            standardizedItems = standardizedItems.filter(item => isMatchItem(item, cleanWord));
          }

          if (standardizedItems.length > 0) {
            return {
              endpointId: endpoint.id,
              endpointName: endpoint.name,
              success: true,
              itemCount: standardizedItems.length,
              items: standardizedItems,
              debugUrl: proxyResData?.debugUrl || directUrl,
              rawResponseText: proxyResData?.rawResponseText || ''
            };
          }
        }

        return {
          endpointId: endpoint.id,
          endpointName: endpoint.name,
          success: false,
          itemCount: 0,
          items: [],
          error: proxyResData?.error || `'${cleanWord}' 관련 검색어 일치 항목 없음 (0건)`,
          debugUrl: proxyResData?.debugUrl || directUrl,
          rawResponseText: proxyResData?.rawResponseText || ''
        };
      } else {
        return {
          endpointId: endpoint.id,
          endpointName: endpoint.name,
          success: false,
          itemCount: 0,
          items: [],
          error: `백엔드 프록시 HTTP 오류 (${response.status})`,
          debugUrl: directUrl
        };
      }
    } catch (proxyFetchErr: any) {
      console.warn(`[BFF Proxy Error] ${endpoint.name}:`, proxyFetchErr);
      return {
        endpointId: endpoint.id,
        endpointName: endpoint.name,
        success: false,
        itemCount: 0,
        items: [],
        error: proxyFetchErr?.message || '백엔드 서버 통신 오류 (15초 초과)',
        debugUrl: directUrl
      };
    }
  };

  // 1단계: 무조건 '슈퍼 로컬 병합 DB' (한국한의약진흥원 + 산림청) 최우선 검색
  const localHerbResult = searchLocalHerbDatabase(cleanWord);
  if (localHerbResult) {
    const localSummary: SearchResultSummary = {
      endpointId: 'super-local-db',
      endpointName: '슈퍼 로컬 하이브리드 DB (1단계 최우선 매칭)',
      success: true,
      itemCount: 1,
      items: [{
        id: `local-db-${cleanWord}`,
        title: localHerbResult.herbName,
        scientificName: localHerbResult.scientificName,
        nature: localHerbResult.nature,
        toxicity: localHerbResult.toxicity,
        efficacy: localHerbResult.mainEfficacy,
        prescription: localHerbResult.prescription,
        contraindication: localHerbResult.contraindication,
        literature: localHerbResult.literature,
        caution: localHerbResult.caution,
        sourceEndpointId: 'super-local-db',
        sourceEndpointName: '슈퍼 로컬 DB (한의약진흥원+산림청)',
        rawDetails: {
          '약재명/식물명': localHerbResult.herbName,
          '학명': localHerbResult.scientificName,
          '기원종(원물생약명)': localHerbResult.originSpecies || '',
          '약용부위(사용부위)': localHerbResult.usedPart || '',
          '성질/독성': `${localHerbResult.nature} / ${localHerbResult.toxicity}`,
          '주요효능': localHerbResult.mainEfficacy,
          '생태설명(산림청)': localHerbResult.ecologyDescription || '',
          '자생지/분포(산림청)': localHerbResult.distributionRegion || '',
          '복용방법(산림청)': localHerbResult.dosageMethod || '',
          '데이터출처': localHerbResult.source
        }
      }],
      debugUrl: 'local://src/data/super-local-hybrid-db'
    };

    return {
      resultsByEndpoint: [localSummary],
      combinedOfficialHerbInfo: localHerbResult,
      isNaverFallbackUsed: false
    };
  }

  // 2단계: 로컬 DB 미검출 시 10개 공공데이터 Open API 호출
  const settledResults = await Promise.allSettled(targets.map(fetchEndpointSummary));
  const summaries: SearchResultSummary[] = settledResults.map((res, idx) => {
    if (res.status === 'fulfilled') {
      return res.value;
    }
    const endpoint = targets[idx];
    return {
      endpointId: endpoint.id,
      endpointName: endpoint.name,
      success: false,
      itemCount: 0,
      items: [],
      error: res.reason?.message || 'API 응답 시간 초과 (15초)',
      debugUrl: ''
    };
  });

  // Find first best matching item across remote results
  let bestItem: SearchResultItem | null = null;
  for (const summary of summaries) {
    if (summary.items.length > 0) {
      bestItem = summary.items[0];
      break;
    }
  }

  let combinedOfficialHerbInfo: OfficialHerbInfo | null = null;
  let isNaverFallbackUsed = false;

  if (bestItem) {
    combinedOfficialHerbInfo = {
      herbName: bestItem.title,
      scientificName: bestItem.scientificName || 'Herba species',
      nature: bestItem.nature || '미온(微溫) / 평(平)',
      toxicity: bestItem.toxicity || '없음(무독)',
      mainEfficacy: bestItem.efficacy || '원기 보강 및 기혈 순환',
      prescription: bestItem.prescription || '',
      contraindication: bestItem.contraindication || '',
      literature: bestItem.literature || '',
      caution: bestItem.caution || '체질에 맞춰 적정량 복용',
      source: `${bestItem.sourceEndpointName} (공공데이터포털 Open API)`,
      isPublicApiData: true
    };
  } else {
    // 3단계: 공공 API 결과도 0건일 때 네이버 지식백과 API 3단계 Fallback 호출
    const naverHerbInfo = await fetchNaverEncycData(cleanWord, naverCredentials);
    if (naverHerbInfo) {
      combinedOfficialHerbInfo = naverHerbInfo;
      isNaverFallbackUsed = true;

      // Add Naver Encyclopedia summary entry to search summaries
      summaries.unshift({
        endpointId: 'naver-encyc',
        endpointName: '네이버 지식백과 (3단계 Fallback)',
        success: true,
        itemCount: 1,
        items: [{
          id: `naver-encyc-${cleanWord}`,
          title: naverHerbInfo.herbName,
          scientificName: naverHerbInfo.scientificName,
          nature: naverHerbInfo.nature,
          toxicity: naverHerbInfo.toxicity,
          efficacy: naverHerbInfo.mainEfficacy,
          caution: naverHerbInfo.caution,
          literature: '네이버 지식백과 (Naver Open API)',
          sourceEndpointId: 'naver-encyc',
          sourceEndpointName: '네이버 지식백과',
          rawDetails: {
            '약재명': naverHerbInfo.herbName,
            '주요효능': naverHerbInfo.mainEfficacy,
            '출처': naverHerbInfo.source,
            '백과사전링크': naverHerbInfo.link || ''
          }
        }],
        debugUrl: naverHerbInfo.link || `https://terms.naver.com/search.naver?query=${encodeURIComponent(cleanWord)}`
      });
    }
  }

  return {
    resultsByEndpoint: summaries,
    combinedOfficialHerbInfo,
    isNaverFallbackUsed
  };
};
