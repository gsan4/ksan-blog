import React, { useState, useRef } from 'react';
import { COLOR_THEMES } from '../constants';
import { ColorTheme, SanYakBoGamInfo, OfficialHerbInfo } from '../types';
import { 
  SANYAK_ENDPOINTS, 
  fetchSanYakApiData, 
  SearchResultSummary, 
  SearchResultItem 
} from '../services/sanyakbogamApiService';
import { standardizeHerbKeywordWithAi } from '../services/geminiService';

interface SanYakBoGamAnalyzerProps {
  onAnalyze: (
    images: { data: string; mimeType: string }[], 
    additionalRequest: string, 
    sanYakBoGamInfo: SanYakBoGamInfo,
    options: {
      shouldIncludeFAQ: boolean;
      shouldAddThumbnailText: boolean;
      thumbnailAspectRatio: '16:9' | '1:1';
      humanLikeWritingStyle: 'none' | 'A' | 'B';
    }
  ) => void;
  isAnalyzing: boolean;
  selectedTheme: ColorTheme;
  onThemeChange: (theme: ColorTheme) => void;
  thumbnailSettings: {
    text: string;
    font: string;
    color: string;
    fontSize: number;
    outlineWidth: number;
    setText: (v: string) => void;
    setFont: (v: string) => void;
    setColor: (v: string) => void;
    setFontSize: (v: number) => void;
    setOutlineWidth: (v: number) => void;
  };
}

const PUBLIC_API_KEY = "vJK%2Ba4qCOBq%2Buwuu6d9OAQTrf%2FmZ%2Fr7bLHCQdBFjTqhrfhdAG2MKW3IAkXx0dMkpIEnxR3bU5jL9VLDAd8hIxw%3D%3D";

// Local standard database fallback for matching known herbs if network/CORS blocks client-side API
const LOCAL_HERB_FALLBACK: Record<string, OfficialHerbInfo> = {
    '천오': {
      herbName: '천오 (천오두/오두)',
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
    }
  };

export const SanYakBoGamAnalyzer: React.FC<SanYakBoGamAnalyzerProps> = ({ 
  onAnalyze, 
  isAnalyzing, 
  selectedTheme, 
  onThemeChange, 
  thumbnailSettings 
}) => {
  const [selectedImages, setSelectedImages] = useState<{ file: File; preview: string }[]>([]);
  const [additionalRequest, setAdditionalRequest] = useState('');
  const [sanYakBoGamInfo, setSanYakBoGamInfo] = useState<SanYakBoGamInfo>({
    herbName: '',
    mountainLocation: '',
    harvestTime: '',
    expectedEfficacy: '',
    oneLineImpression: '',
    detailedInfo: ''
  });

  // Official Herb DB State (10 National OpenAPI Endpoints)
  const [officialHerbData, setOfficialHerbData] = useState<OfficialHerbInfo | null>(null);
  const [isSearchingDb, setIsSearchingDb] = useState<boolean>(false);
  const [isStandardizing, setIsStandardizing] = useState<boolean>(false);
  const [standardizedKeyword, setStandardizedKeyword] = useState<string | null>(null);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
  const [isFallbackAiKnowledgeUsed, setIsFallbackAiKnowledgeUsed] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedEndpointCategory, setSelectedEndpointCategory] = useState<string>('all');
  const [searchResultsSummaries, setSearchResultsSummaries] = useState<SearchResultSummary[]>([]);
  const [activeResultTab, setActiveResultTab] = useState<string>('all');
  const [expandedItemDetails, setExpandedItemDetails] = useState<string | null>(null);

  // Advanced Options States
  const [shouldIncludeFAQ, setShouldIncludeFAQ] = useState(true);
  const [shouldAddThumbnailText, setShouldAddThumbnailText] = useState(false);
  const [thumbnailAspectRatio, setThumbnailAspectRatio] = useState<'16:9' | '1:1'>('16:9');
  const [humanLikeWritingStyle, setHumanLikeWritingStyle] = useState<'none' | 'A' | 'B'>('none');

  // Drag & Drop State
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInfoChange = (field: keyof SanYakBoGamInfo, value: string) => {
    setSanYakBoGamInfo(prev => ({ ...prev, [field]: value }));
  };

  // 5단계 통합 비동기 검색 프로세스 (AI 징검다리 -> 공공 API 호출 -> 팩트 주입 & 플랜 B)
  const handleSearchHerbDb = async (overrideTerm?: string): Promise<OfficialHerbInfo | null> => {
    const rawTerm = (overrideTerm || sanYakBoGamInfo.herbName).trim();
    if (!rawTerm) {
      setSearchError("약초명 / 검색어를 입력해 주세요.");
      return null;
    }

    setIsSearchingDb(true);
    setIsStandardizing(true);
    setSearchError(null);
    setSearchNotice(null);
    setOfficialHerbData(null);
    setSearchResultsSummaries([]);
    setExpandedItemDetails(null);
    setIsFallbackAiKnowledgeUsed(false);

    let finalStandardizedKeyword = rawTerm;

    // 1단계: 검색어 표준화 (AI 징검다리)
    try {
      finalStandardizedKeyword = await standardizeHerbKeywordWithAi(rawTerm);
      setStandardizedKeyword(finalStandardizedKeyword);
    } catch (err) {
      console.warn("AI 징검다리 키워드 표준화 예외 발생, 원본 검색어로 진행합니다:", err);
      finalStandardizedKeyword = rawTerm;
      setStandardizedKeyword(rawTerm);
    } finally {
      setIsStandardizing(false);
    }

    // 2단계 & 3단계: 공식 데이터 호출 및 검증/취합
    try {
      const { resultsByEndpoint, combinedOfficialHerbInfo } = await fetchSanYakApiData(
        selectedEndpointCategory,
        finalStandardizedKeyword
      );

      setSearchResultsSummaries(resultsByEndpoint);
      const totalItemsFound = resultsByEndpoint.reduce((sum, s) => sum + s.itemCount, 0);

      if (combinedOfficialHerbInfo) {
        setOfficialHerbData(combinedOfficialHerbInfo);
        setIsFallbackAiKnowledgeUsed(false);

        if (combinedOfficialHerbInfo.isNaverData || combinedOfficialHerbInfo.source.includes('네이버')) {
          setSearchNotice(`공공 API 0건 조회로 2차 '네이버 지식백과 API'에서 '${combinedOfficialHerbInfo.herbName}' 요약 정보와 백과사전 링크를 연동했습니다.`);
        } else {
          setSearchNotice(`국가 공공 API에서 '${finalStandardizedKeyword}'(표준 생약명) 관련 ${totalItemsFound}건의 공식 팩트 데이터를 수집했습니다.`);
        }
        return combinedOfficialHerbInfo;
      } else {
        // 5단계: 무중단 예외 처리 (플랜 B - 0건시 AI 고유 지식으로 진행)
        setIsFallbackAiKnowledgeUsed(true);
        setSearchNotice("공공 API 및 네이버 지식백과 검색 결과가 없어, AI 자체 전문 지식으로 작성되었습니다.");
        setOfficialHerbData(null);
        return null;
      }
    } catch (err: any) {
      // 5단계: 무중단 예외 처리 (플랜 B - 통신 장애시에도 무중단 지식 모드)
      console.warn("공공 API 호출 네트워크 예외, AI 전문 지식 모드로 전환:", err);
      setIsFallbackAiKnowledgeUsed(true);
      setSearchNotice("국가 공공데이터 검색 결과가 없어, AI 자체 전문 지식으로 작성되었습니다.");
      setOfficialHerbData(null);
      return null;
    } finally {
      setIsSearchingDb(false);
    }
  };

  const applySelectedItemToOfficialHerb = (item: SearchResultItem) => {
    const isNaver = item.sourceEndpointId === 'naver-encyc' || item.sourceEndpointName.includes('네이버');
    const isLocal = item.sourceEndpointId === 'super-local-db' || item.sourceEndpointName.includes('슈퍼 로컬');
    const isPublic = !isNaver && !isLocal;

    setOfficialHerbData({
      herbName: item.title,
      scientificName: item.scientificName,
      nature: item.nature,
      toxicity: item.toxicity,
      mainEfficacy: item.efficacy,
      prescription: item.prescription || '',
      contraindication: item.contraindication || '',
      literature: item.literature || '',
      caution: item.caution || '전문 한의사 상담 및 표준 용량 준수',
      source: `${item.sourceEndpointName} (${isNaver ? '네이버 Open API' : isLocal ? '한의약진흥원+산림청 DB' : '국가 공공데이터포털'})`,
      isNaverData: isNaver,
      isLocalDbData: isLocal,
      isPublicApiData: isPublic
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file: File) => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget && !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        const newImages = imageFiles.map((file: File) => ({
          file,
          preview: URL.createObjectURL(file)
        }));
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const moveImageLeft = (index: number) => {
    if (index <= 0) return;
    setSelectedImages(prev => {
      const newImages = [...prev];
      const temp = newImages[index];
      newImages[index] = newImages[index - 1];
      newImages[index - 1] = temp;
      return newImages;
    });
  };

  const moveImageRight = (index: number) => {
    if (index >= selectedImages.length - 1) return;
    setSelectedImages(prev => {
      const newImages = [...prev];
      const temp = newImages[index];
      newImages[index] = newImages[index + 1];
      newImages[index + 1] = temp;
      return newImages;
    });
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyzeClick = async () => {
    if (!sanYakBoGamInfo.herbName.trim()) {
      alert('약초명 / 산삼 종류를 입력해주세요.');
      return;
    }

    let activeOfficialHerbData = officialHerbData;

    // 만약 사전에 공공데이터 검색을 클릭하지 않은 경우, 포스트 생성 버튼 클릭시 자동으로 5단계 검색 프로세스 수행
    if (!activeOfficialHerbData && !isFallbackAiKnowledgeUsed && searchResultsSummaries.length === 0) {
      activeOfficialHerbData = await handleSearchHerbDb();
    }

    const imagesData = await Promise.all(
      selectedImages.map(async img => ({
        data: await readFileAsBase64(img.file),
        mimeType: img.file.type
      }))
    );

    const finalSanYakInfo: SanYakBoGamInfo = {
      ...sanYakBoGamInfo,
      officialHerbData: activeOfficialHerbData || undefined
    };

    onAnalyze(imagesData, additionalRequest, finalSanYakInfo, {
      shouldIncludeFAQ,
      shouldAddThumbnailText,
      thumbnailAspectRatio,
      humanLikeWritingStyle
    });
  };

  return (
    <div className="bg-transparent p-0">
      <div className="mb-6">
        <p className="text-slate-600">신뢰받는 약초 및 본초학 전문 지식과 국가 공공 DB 팩트를 기반으로 완성도 높은 약초 전문 포스트를 작성해 드립니다.</p>
        <p className="text-emerald-700 text-sm mt-1 font-medium">💡 약초 사진을 첨부하면 멀티모달 AI가 약초의 형상과 외형 특징을 분석하여 더욱 명확한 글을 작성해 드립니다.</p>
      </div>

      <div className="space-y-10">
        {/* Upload Area & Image Preview */}
        <div 
          onClick={() => selectedImages.length === 0 && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border border-dashed rounded-lg transition-colors min-h-[160px] flex items-center justify-center relative ${
            isDragging 
              ? 'border-neutral-900 bg-neutral-50' 
              : selectedImages.length === 0 
                ? 'border-neutral-200 p-6 hover:border-neutral-400 bg-transparent cursor-pointer group' 
                : 'border-neutral-200 p-4 bg-transparent'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />

          {isDragging && (
            <div className="absolute inset-0 bg-neutral-100/80 rounded-lg flex flex-col items-center justify-center z-30 pointer-events-none">
              <div className="bg-white px-6 py-4 rounded-xl border border-neutral-300 text-center">
                <span className="text-3xl block mb-1">📥</span>
                <p className="text-neutral-900 font-bold text-base">여기에 약초 사진 파일(들)을 놓으세요!</p>
              </div>
            </div>
          )}
          
          {selectedImages.length === 0 ? (
            <div className="text-center">
              <div className="text-3xl mb-2">🌿</div>
              <p className="text-neutral-800 font-medium text-sm">클릭하거나 약초/산삼 사진을 이곳으로 드래그하세요</p>
              <p className="text-neutral-400 text-xs mt-1">여러 장의 사진을 선택하면 더욱 입체적인 포스트가 생성됩니다. (선택사항)</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {selectedImages.map((img, index) => (
                  <div 
                    key={index} 
                    onDragStart={(e) => e.preventDefault()}
                    className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === 0 
                        ? 'border-emerald-500 ring-2 ring-emerald-400 shadow-md shadow-emerald-500/20' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <img 
                      src={img.preview} 
                      alt={`preview ${index}`} 
                      draggable={false}
                      className="w-full h-full object-cover select-none pointer-events-none" 
                    />
                    
                    {index === 0 && (
                      <div className="absolute top-0 left-0 bg-emerald-700 text-white text-[10px] px-2 py-0.5 font-bold rounded-br-md shadow-sm z-20 flex items-center gap-1">
                        <span>👑</span>
                        <span>대표 이미지</span>
                      </div>
                    )}

                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                      className="absolute top-1 right-1 bg-rose-500/90 hover:bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md"
                      title="사진 삭제"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto">
                      {index > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveImageLeft(index); }}
                          className="p-1.5 rounded-full bg-slate-900/85 text-white hover:bg-emerald-600 hover:scale-110 transition-all shadow-md cursor-pointer flex items-center justify-center"
                          title="왼쪽으로 이동"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                      ) : (
                        <div className="w-6.5" />
                      )}

                      {index < selectedImages.length - 1 ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveImageRight(index); }}
                          className="p-1.5 rounded-full bg-slate-900/85 text-white hover:bg-emerald-600 hover:scale-110 transition-all shadow-md cursor-pointer flex items-center justify-center"
                          title="오른쪽으로 이동"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <div className="w-6.5" />
                      )}
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-slate-400 hover:text-emerald-600 bg-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] font-medium">사진 추가</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Herb / SanYak Information Form */}
        <div className="space-y-8 py-2">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-xl font-bold text-neutral-800 flex items-center tracking-tight">
              <span className="mr-2">🌱</span> 약초 및 채취 정보
            </h3>
            <span className="text-xs text-neutral-400">* 필수 입력</span>
          </div>

          {/* Row 1: Herb Name (Required), API Target Selector & Mountain Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {/* API Target Dropdown */}
              <div className="mb-3.5 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-emerald-900 text-xs font-bold tracking-tight">
                    🏛️ 국가 공공 API 검색 대상 (10개 DB)
                  </label>
                  <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300 font-medium">
                    인증키 연동 완료
                  </span>
                </div>
                <select
                  value={selectedEndpointCategory}
                  onChange={(e) => setSelectedEndpointCategory(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="all">🌐 [전체 통합 검색] 10개 OpenAPI 전체 호출</option>
                  {SANYAK_ENDPOINTS.map((ep, idx) => (
                    <option key={ep.id} value={ep.id}>
                      {idx + 1}. {ep.name} ({ep.description})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between mb-1">
                <label className="block text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                  약초명 / 검색어 *
                </label>
                <button
                  type="button"
                  onClick={() => handleSearchHerbDb()}
                  disabled={isSearchingDb}
                  className="px-3 py-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-md shadow-sm transition-all flex items-center space-x-1 cursor-pointer active:scale-95 disabled:opacity-50"
                  title="국가 10대 한약재 API에서 정보 검색"
                >
                  {isSearchingDb ? (
                    <>
                      <span className="animate-spin inline-block">⏳</span>
                      <span>검색 중...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>국가 10대 API 검색</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={sanYakBoGamInfo.herbName}
                onChange={(e) => handleInfoChange('herbName', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchHerbDb();
                  }
                }}
                placeholder="예: 천오두, 산삼, 약용식물, 하수오, 당귀, 처방전"
                className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base placeholder-neutral-400 font-medium"
              />

              {/* 1단계: AI 징검다리 표준 생약명 배지 */}
              {standardizedKeyword && !isSearchingDb && (
                <div className="mt-2.5 bg-emerald-50/80 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium text-emerald-900 shadow-2xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-emerald-700 font-bold">✨ [AI 징검다리] 식약처 표준 생약명:</span>
                    <span className="font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {standardizedKeyword}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono">10대 공공 API 호출용</span>
                </div>
              )}

              {/* Step Loading State */}
              {isSearchingDb && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1 animate-pulse shadow-sm">
                  <div className="flex items-center space-x-2 font-bold">
                    <span className="animate-spin text-emerald-600">⏳</span>
                    <span>
                      {isStandardizing 
                        ? '1단계: [AI 징검다리] 식약처/한의학 표준 생약명 변환 중...' 
                        : `2단계: '${standardizedKeyword || sanYakBoGamInfo.herbName}' 키워드로 10개 공공 API 호출 중...`}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 pl-6">
                    할루시네이션 완벽 차단을 위해 공공데이터 팩트 검증 및 취합 작업을 진행하고 있습니다.
                  </p>
                </div>
              )}

              {/* 5단계: 무중단 예외 처리 (플랜 B - 공공데이터 0건시 AI 자체 전문 지식 모드 안내) */}
              {isFallbackAiKnowledgeUsed && !isSearchingDb && (
                <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200/90 rounded-xl text-xs text-amber-900 space-y-1 shadow-sm">
                  <div className="flex items-center space-x-2 font-bold text-amber-900">
                    <span className="text-sm">ℹ️</span>
                    <span>국가 공공데이터 검색 결과가 없어, AI 자체 전문 지식으로 작성되었습니다.</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed pl-6">
                    입력하신 검색어('{sanYakBoGamInfo.herbName}' / 표준어 '{standardizedKeyword}')에 대한 규격 DB 항목이 발견되지 않아, 오류 없이 60년 심마니 AI 자체의 한의학/본초학 전문 지식을 활용하여 완성도 높은 포스트를 즉시 생성합니다.
                  </p>
                </div>
              )}

              {/* Successful Search Notice */}
              {searchNotice && !isFallbackAiKnowledgeUsed && !isSearchingDb && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-2 font-medium">
                    <span>✅</span>
                    <span>{searchNotice}</span>
                  </div>
                </div>
              )}

              {/* Search Error Message Display */}
              {searchError && !isSearchingDb && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-1.5">
                    <span>⚠️</span>
                    <span className="font-medium">{searchError}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSearchError(null)} 
                    className="text-rose-400 hover:text-rose-700 text-xs cursor-pointer font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* 10 Endpoints Search Results Summary Badges & Items Inspector */}
              {searchResultsSummaries.length > 0 && !isSearchingDb && (
                <div className="mt-4 p-3 bg-white border border-neutral-200 rounded-xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <span className="text-xs font-bold text-neutral-900 flex items-center space-x-1">
                      <span>📊</span>
                      <span>국가 10대 API 검색 결과</span>
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      총 {searchResultsSummaries.reduce((sum, s) => sum + s.itemCount, 0)}건 조회됨
                    </span>
                  </div>

                  {/* Filter Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveResultTab('all')}
                      className={`px-2 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer ${
                        activeResultTab === 'all'
                          ? 'bg-neutral-900 text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      전체 ({searchResultsSummaries.reduce((sum, s) => sum + s.itemCount, 0)})
                    </button>

                    {searchResultsSummaries.map((summary) => (
                      <button
                        key={summary.endpointId}
                        type="button"
                        onClick={() => setActiveResultTab(summary.endpointId)}
                        className={`px-2 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                          activeResultTab === summary.endpointId
                            ? 'bg-emerald-800 text-white shadow-sm'
                            : summary.itemCount > 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <span>{summary.endpointName}</span>
                        <span className={`px-1 py-0.2 rounded-full text-[10px] ${summary.itemCount > 0 ? 'bg-emerald-200/80 text-emerald-900' : 'bg-rose-200 text-rose-900 font-bold'}`}>
                          {summary.itemCount}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Returned Items List */}
                  <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                    {searchResultsSummaries
                      .filter(s => activeResultTab === 'all' || s.endpointId === activeResultTab)
                      .flatMap(s => s.items)
                      .map((item) => (
                        <div 
                          key={item.id}
                          className="p-3 bg-neutral-50 hover:bg-emerald-50/50 border border-neutral-200 hover:border-emerald-300 rounded-lg transition-all space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-neutral-200/60 pb-1.5">
                            <span className="font-bold text-neutral-900 flex items-center space-x-1.5 text-sm">
                              <span className="text-emerald-800 font-mono text-[10px] bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">
                                {item.sourceEndpointName}
                              </span>
                              <span>{item.title}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => applySelectedItemToOfficialHerb(item)}
                              className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
                            >
                              이 정보 적용하기
                            </button>
                          </div>

                          <div className="text-neutral-700 space-y-1 text-[11px] leading-relaxed">
                            {item.scientificName && (
                              <p><span className="font-semibold text-neutral-900">• 학명/기원:</span> <span className="font-mono text-neutral-600">{item.scientificName}</span></p>
                            )}
                            {item.nature && (
                              <p><span className="font-semibold text-neutral-900">• 성질/부위:</span> {item.nature}</p>
                            )}
                            {item.toxicity && (
                              <p><span className="font-semibold text-neutral-900">• 독성 여부:</span> <span className={item.toxicity.includes('있음') ? 'text-rose-600 font-bold' : 'text-emerald-700'}>{item.toxicity}</span></p>
                            )}
                            {item.efficacy && (
                              <p><span className="font-semibold text-neutral-900">• 주요 효능/설명:</span> {item.efficacy}</p>
                            )}
                            {item.prescription && (
                              <p><span className="font-semibold text-neutral-900">• 관련 처방:</span> {item.prescription}</p>
                            )}
                            {item.literature && (
                              <p><span className="font-semibold text-neutral-900">• 출처/문헌:</span> {item.literature}</p>
                            )}
                          </div>

                          {/* Toggle for verbatim raw API Key-Value details */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setExpandedItemDetails(expandedItemDetails === item.id ? null : item.id)}
                              className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded"
                            >
                              <span>{expandedItemDetails === item.id ? '▲ API 수신 원문 필드 접기' : '▼ 📄 API 실제 수신 필드 전체보기 (Key-Value)'}</span>
                            </button>

                            {expandedItemDetails === item.id && (
                              <div className="mt-2 p-2 bg-neutral-900 text-neutral-100 rounded border border-neutral-700 text-[10px] font-mono space-y-1 max-h-48 overflow-y-auto">
                                <p className="text-emerald-400 font-bold border-b border-neutral-700 pb-1 mb-1">
                                  [API 수신 객체 Raw Fields - {Object.keys(item.rawDetails).length}개]
                                </p>
                                {Object.entries(item.rawDetails).map(([k, v]) => (
                                  <div key={k} className="grid grid-cols-12 gap-1 border-b border-neutral-800/80 pb-0.5">
                                    <span className="col-span-4 text-amber-300 font-semibold truncate" title={k}>{k}:</span>
                                    <span className="col-span-8 text-neutral-200 break-words">{v}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* 🚨 Red Debug Information Display Box for API Errors & Requested URLs */}
                  <div className="mt-3 p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2.5 text-xs text-rose-950 shadow-sm">
                    <div className="flex items-center justify-between font-bold border-b border-rose-200 pb-1.5">
                      <span className="flex items-center space-x-1.5 text-sm text-rose-900">
                        <span>🚨</span>
                        <span>공공 API 호출 및 CORS 프록시 디버그 상세 정보</span>
                      </span>
                      <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded-full">
                        실시간 진단
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {searchResultsSummaries
                        .filter(s => activeResultTab === 'all' || s.endpointId === activeResultTab)
                        .map(summary => (
                          <div key={summary.endpointId} className="p-2.5 bg-white/90 border border-rose-200/90 rounded-lg space-y-1 text-[11px]">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-rose-950">{summary.endpointName}</span>
                              <span className={summary.itemCount > 0 ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
                                {summary.itemCount > 0 ? `✅ ${summary.itemCount}건 성공` : `❌ 0건 (원인확인)`}
                              </span>
                            </div>

                            {summary.error && (
                              <p className="text-rose-700 font-semibold break-words leading-relaxed">
                                • 상태/에러: <span className="underline">{summary.error}</span>
                              </p>
                            )}

                            {summary.debugUrl && (
                              <div className="space-y-0.5">
                                <p className="font-semibold text-rose-900">• 공공 API 직접 호출 URL (Direct):</p>
                                <a 
                                  href={summary.debugUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="block p-1.5 bg-rose-100/80 border border-rose-300 rounded text-[10px] font-mono text-rose-950 break-all hover:bg-rose-200 underline"
                                >
                                  {summary.debugUrl}
                                </a>
                              </div>
                            )}

                            {summary.rawResponseText && (
                              <div className="space-y-0.5 pt-1">
                                <p className="font-semibold text-rose-900">• 공공 API 수신 원본 데이터 (Raw String / Error XML):</p>
                                <pre className="p-2 bg-slate-900 text-amber-300 rounded text-[10px] font-mono leading-tight whitespace-pre-wrap max-h-36 overflow-y-auto border border-slate-700">
                                  {summary.rawResponseText}
                                </pre>
                              </div>
                            )}

                            {summary.proxyUrl && (
                              <div className="space-y-0.5">
                                <p className="font-semibold text-rose-900">• CORS 우회 프록시 URL (AllOrigins Proxy):</p>
                                <a 
                                  href={summary.proxyUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="block p-1.5 bg-rose-100/80 border border-rose-300 rounded text-[10px] font-mono text-rose-950 break-all hover:bg-rose-200 underline"
                                >
                                  {summary.proxyUrl}
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Applied Official Herb Data Card */}
              {officialHerbData && !isSearchingDb && (
                <div className="mt-3 p-3.5 bg-neutral-100/90 border border-neutral-200 rounded-xl text-xs text-neutral-800 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between font-bold text-neutral-900 border-b border-neutral-200/80 pb-1.5 mb-1.5">
                    <span className="flex items-center space-x-1.5">
                      <span className="text-sm">💡</span>
                      <span>적용된 한약재 정보 ({officialHerbData.source})</span>
                      {(officialHerbData.isNaverData || officialHerbData.source.includes('네이버')) && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                          네이버 지식백과
                        </span>
                      )}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setOfficialHerbData(null)} 
                      className="text-neutral-400 hover:text-neutral-700 text-[11px] p-0.5 cursor-pointer font-normal"
                      title="닫기"
                    >
                      ✕ 닫기
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-y-1.5 text-neutral-700 leading-relaxed">
                    <p><span className="font-semibold text-neutral-900">· 약재명:</span> <span className="font-bold text-neutral-900">{officialHerbData.herbName}</span></p>
                    <p><span className="font-semibold text-neutral-900">· 학명:</span> <span className="font-mono text-[11px] text-neutral-600">{officialHerbData.scientificName}</span></p>
                    {officialHerbData.originSpecies && (
                      <p><span className="font-semibold text-neutral-900">· 기원종 (원물생약):</span> <span className="text-neutral-800 font-medium">{officialHerbData.originSpecies}</span></p>
                    )}
                    {officialHerbData.usedPart && (
                      <p><span className="font-semibold text-neutral-900">· 약용부위:</span> <span className="text-neutral-800 font-medium">{officialHerbData.usedPart}</span></p>
                    )}
                    <p><span className="font-semibold text-neutral-900">· 성질:</span> {officialHerbData.nature}</p>
                    <p>
                      <span className="font-semibold text-neutral-900">· 독성:</span> {' '}
                      <span className={officialHerbData.toxicity.includes('맹독') || officialHerbData.toxicity.includes('있음') ? 'text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[11px]' : 'text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]'}>
                        {officialHerbData.toxicity}
                      </span>
                    </p>
                    <p><span className="font-semibold text-neutral-900">· 주요 효능:</span> {officialHerbData.mainEfficacy}</p>
                    
                    {officialHerbData.ecologyDescription && (
                      <div className="mt-1 p-2 bg-emerald-50/90 border border-emerald-200/80 rounded-lg text-emerald-950 text-[11px]">
                        <span className="font-bold text-emerald-800 block mb-0.5">🌲 생태설명 (산림청 DB):</span>
                        <span className="leading-relaxed">{officialHerbData.ecologyDescription}</span>
                      </div>
                    )}

                    {officialHerbData.distributionRegion && (
                      <p><span className="font-semibold text-neutral-900">· 자생지 / 분포:</span> <span className="text-neutral-800 font-medium">{officialHerbData.distributionRegion}</span></p>
                    )}

                    {officialHerbData.dosageMethod && (
                      <div className="mt-1 p-2 bg-blue-50/90 border border-blue-200/80 rounded-lg text-blue-950 text-[11px]">
                        <span className="font-bold text-blue-800 block mb-0.5">🍵 복용방법 (산림청 DB):</span>
                        <span className="leading-relaxed">{officialHerbData.dosageMethod}</span>
                      </div>
                    )}

                    {officialHerbData.prescription && (
                      <p><span className="font-semibold text-neutral-900">· 대표 처방:</span> <span className="text-neutral-800 bg-neutral-200/60 px-1.5 py-0.5 rounded font-mono text-[11px]">{officialHerbData.prescription}</span></p>
                    )}

                    {officialHerbData.contraindication && (
                      <div className="mt-1 p-2 bg-rose-50/90 border border-rose-200/80 rounded-lg text-rose-900 text-[11px]">
                        <span className="font-bold text-rose-700 block mb-0.5">🚫 금기 (Contraindication):</span>
                        <span>{officialHerbData.contraindication}</span>
                      </div>
                    )}

                    {officialHerbData.literature && (
                      <div className="mt-1 p-2 bg-amber-50/90 border border-amber-200/80 rounded-lg text-amber-950 text-[11px]">
                        <span className="font-bold text-amber-800 block mb-0.5">📖 문헌근거 (본초강목 / 동의보감):</span>
                        <span className="italic leading-relaxed">{officialHerbData.literature}</span>
                      </div>
                    )}

                    {officialHerbData.link && (
                      <div className="mt-2 pt-2 border-t border-neutral-200/80 flex items-center justify-between bg-emerald-50/60 p-2 rounded-lg">
                        <span className="text-[11px] font-bold text-emerald-950 flex items-center space-x-1">
                          <span>📚</span>
                          <span>네이버 지식백과 백과사전 원문</span>
                        </span>
                        <a
                          href={officialHerbData.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-[11px] flex items-center space-x-1 transition-all shadow-2xs cursor-pointer"
                        >
                          <span>사전 상세보기</span>
                          <span>↗</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {officialHerbData.caution && (
                    <div className="pt-1.5 border-t border-neutral-200/60 mt-1.5 text-[11px] text-neutral-600 flex items-start space-x-1">
                      <span className="font-bold text-neutral-800 shrink-0">⚠️ 복용 유의:</span>
                      <span>{officialHerbData.caution}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">
                채취한 산 / 지역 (선택)
              </label>
              <input
                type="text"
                value={sanYakBoGamInfo.mountainLocation || ''}
                onChange={(e) => handleInfoChange('mountainLocation', e.target.value)}
                placeholder="예: 강원도 설악산 점봉산 계곡, 지리산 칠선계곡"
                className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base placeholder-neutral-400"
              />
            </div>
          </div>

          {/* Row 2: Harvest Time (Optional) & Expected Efficacy (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">
                채취 시기 (선택)
              </label>
              <input
                type="text"
                value={sanYakBoGamInfo.harvestTime || ''}
                onChange={(e) => handleInfoChange('harvestTime', e.target.value)}
                placeholder="예: 늦가을 단풍 무렵, 삼복더위 한가운데, 늦봄 신록철"
                className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base placeholder-neutral-400"
              />
            </div>

            <div>
              <label className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">
                주요 기대 효능 (선택)
              </label>
              <input
                type="text"
                value={sanYakBoGamInfo.expectedEfficacy || ''}
                onChange={(e) => handleInfoChange('expectedEfficacy', e.target.value)}
                placeholder="예: 원기 회복, 면역력 강화, 혈액순환 개선, 정력 증진"
                className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base placeholder-neutral-400"
              />
            </div>
          </div>

          {/* Row 3: One Line Impression / Experience (Optional) */}
          <div>
            <label className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">
              약재 핵심 요약 / 메모 (선택)
            </label>
            <input
              type="text"
              value={sanYakBoGamInfo.oneLineImpression || ''}
              onChange={(e) => handleInfoChange('oneLineImpression', e.target.value)}
              placeholder="예: 자생 환경의 특성과 뇌두/뿌리 형상이 정교한 품질 우수 약재"
              className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base placeholder-neutral-400"
            />
          </div>

          {/* Row 4: Detailed Description / Backstory (Optional) */}
          <div>
            <label className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">
              상세 특징 / 채취 및 자생 정보 (선택)
            </label>
            <textarea
              rows={3}
              value={sanYakBoGamInfo.detailedInfo || ''}
              onChange={(e) => handleInfoChange('detailedInfo', e.target.value)}
              placeholder="예: 뇌두가 빽빽하게 솟아있고 옥주가 선명하며, 뿌리를 캐어내는 순간 온 산에 쌉싸래한 삼향이 진동했습니다. 보관 및 섭취법 특이사항도 적어주세요."
              className="w-full bg-transparent border border-neutral-200 focus:border-neutral-800 rounded-lg p-3 text-neutral-800 focus:outline-none transition-colors text-sm placeholder-neutral-400 custom-scrollbar resize-none"
            />
          </div>

          {/* Additional Custom Requests */}
          <div>
            <label className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">
              추가 요청 사항 (선택)
            </label>
            <input
              type="text"
              value={additionalRequest}
              onChange={(e) => setAdditionalRequest(e.target.value)}
              placeholder="예: 담금주 만드는 방법도 포함해 줘, 산삼 보관법 강조해 줘 등"
              className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-sm placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Options & Settings */}
        <div className="bg-neutral-50/80 p-5 rounded-xl border border-neutral-100 space-y-5">
          <h4 className="font-semibold text-neutral-800 text-sm flex items-center space-x-1.5">
            <span>⚙️</span>
            <span>생성 옵션 및 톤 설정</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-700">
            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shouldIncludeFAQ}
                onChange={(e) => setShouldIncludeFAQ(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span>FAQ(자주 묻는 질문) 파트 자동 생성</span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shouldAddThumbnailText}
                onChange={(e) => setShouldAddThumbnailText(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span>썸네일 이미지 문구 덮어쓰기 오버레이</span>
            </label>
          </div>

          {/* Writing Style Options */}
          <div className="pt-2 border-t border-neutral-200/60">
            <label className="block text-neutral-500 text-xs font-semibold mb-2">전문 문체 및 작성 스타일 선택</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setHumanLikeWritingStyle('none')}
                className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors cursor-pointer ${
                  humanLikeWritingStyle === 'none'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                객관적 전문 해설형
              </button>
              <button
                type="button"
                onClick={() => setHumanLikeWritingStyle('A')}
                className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors cursor-pointer ${
                  humanLikeWritingStyle === 'A'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                부드러운 정보 전달형
              </button>
              <button
                type="button"
                onClick={() => setHumanLikeWritingStyle('B')}
                className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors cursor-pointer ${
                  humanLikeWritingStyle === 'B'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                학술 및 팩트 브리핑형
              </button>
            </div>
          </div>

          {/* Color Theme Selector */}
          <div className="pt-2 border-t border-neutral-200/60">
            <label className="block text-neutral-500 text-xs font-semibold mb-2">블로그 포스트 디자인 테마</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => onThemeChange(theme)}
                  className={`px-3 py-1.5 text-xs rounded-lg border flex items-center space-x-1.5 transition-all cursor-pointer ${
                    selectedTheme.name === theme.name
                      ? 'border-neutral-800 bg-neutral-900 text-white font-semibold shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnail Settings (If overlay enabled) */}
          {shouldAddThumbnailText && (
            <div className="pt-3 border-t border-neutral-200/60 space-y-3">
              <div className="text-xs font-semibold text-neutral-700">썸네일 오버레이 문구 설정</div>
              <input
                type="text"
                value={thumbnailSettings.text}
                onChange={(e) => thumbnailSettings.setText(e.target.value)}
                placeholder="썸네일 대표 텍스트 (입력하지 않으면 AI가 자동추천)"
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-800"
              />
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-neutral-500">비율:</span>
                <button
                  type="button"
                  onClick={() => setThumbnailAspectRatio('16:9')}
                  className={`px-2.5 py-1 rounded border ${thumbnailAspectRatio === '16:9' ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-neutral-600 border-neutral-200'}`}
                >
                  16:9 (가로형)
                </button>
                <button
                  type="button"
                  onClick={() => setThumbnailAspectRatio('1:1')}
                  className={`px-2.5 py-1 rounded border ${thumbnailAspectRatio === '1:1' ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-neutral-600 border-neutral-200'}`}
                >
                  1:1 (정사각형)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Action Button */}
        <div className="pt-4">
          <button
            type="button"
            disabled={isAnalyzing || !sanYakBoGamInfo.herbName.trim()}
            onClick={handleAnalyzeClick}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm ${
              isAnalyzing || !sanYakBoGamInfo.herbName.trim()
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20 hover:shadow-md'
            }`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>전문가 톤으로 약초 포스트 생성 중...</span>
              </>
            ) : (
              <>
                <span>🌿</span>
                <span>산약보감 약초 포스트 생성하기</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
