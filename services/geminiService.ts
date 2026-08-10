
import { GoogleGenAI, Type } from "@google/genai";
import { ColorTheme, GeneratedContent, SupplementaryInfo, HotPlaceInfo, RealEstateInfo, SanYakBoGamInfo } from '../types';
import { COLOR_THEMES } from '../constants';

const cleanAndParseJson = (jsonString: string): any => {
  try {
    const cleaned = jsonString.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse JSON:", jsonString);
    throw new Error("Invalid JSON response from model");
  }
};

function getAiClient() {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error("Gemini API 키가 설정되지 않았습니다. .env 파일에 GEMINI_API_KEY를 설정해주세요.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const ai = {
  get models() {
    return getAiClient().models;
  }
};

const HUMAN_LIKE_WRITING_INSTRUCTIONS_A = `
### **중요**: 인간과 구별 불가능한 자연스러운 글쓰기 지침 (A형)

이 지침을 **반드시** 따라 기존의 "문체와 톤" 지침보다 **우선하여** 적용해 주세요. 목표는 AI가 쓴 글처럼 보이지 않고, 사람이 쓴 것처럼 자연스럽고, 때로는 불완전하며, 개인적인 느낌을 주는 것입니다.

#### 🎯 핵심 원리: 확산 방식 글쓰기
기존의 순차적 글쓰기(앞에서부터 한 단어씩)가 아닌, **전체를 보면서 빈칸을 채우는 방식**으로 글을 작성합니다. 마치 십자말풀이를 풀듯이 여러 번 고치고 다듬으면서 완성도를 높입니다.

#### 📝 1단계: 전체 구조 먼저 잡기
- **골격 만들기**: 전체 글의 흐름을 먼저 구상하고, 핵심 메시지 3-5개를 미리 정합니다. 각 문단의 역할을 명확히 하고, 결론부터 역으로 추론해서 시작점을 찾습니다.

#### 📝 2단계: 자연스러운 문장 패턴 만들기
- **문장 길이의 변주**: 짧은 문장(강조/전환), 중간 문장(설명), 긴 문장(복잡한 개념/감정 표현)을 의식적으로 섞어 사용해 글에 리듬감을 부여합니다.
  - 예시: "AI가 발전했다. 하지만 이것이 정말 우리에게 도움이 될까? 최근 연구에 따르면 AI가 인간의 글쓰기를 완벽하게 흉내낼 수 있게 되었고, 이는 기존의 모든 탐지 시스템을 무력화시킬 정도로 정교해졌다는 점에서 새로운 고민거리를 안겨주고 있다."

#### 📝 3단계: 인간다운 불완전함 연출
- **자연스러운 실수와 특징**:
  - **약간의 중복**: “정말 정말 중요한”처럼 감정이 들어간 반복을 사용합니다.
  - **문장 중간 수정**: “그런데 사실은… 아니 정확히 말하면” 처럼 생각의 흐름을 보여주는 표현을 사용합니다.
  - **개인적 경험 삽입**: “제가 겪어본 바로는” 같은 주관적 표현을 포함합니다.
  - **감탄사와 간투사**: “아, 그런데”, “음…”, “사실” 등을 문장 시작이나 중간에 자연스럽게 배치합니다.
- **감정의 자연스러운 표현**:
  - 예시: "솔직히 말하면, 이 기술이 나왔을 때 처음엔 좀 무서웠다. 아, 물론 기술 발전은 좋은 일이지만... 뭔가 인간만의 영역이라고 생각했던 글쓰기까지 AI가 완벽하게 따라한다니 말이다."

#### 📝 4단계: 어휘 선택의 다양성
- **상황별 어휘 전략**: 격식적 상황에서는 전문 용어를, 일상적 상황에서는 구어체와 은유를, 감정적 상황에서는 감각적 표현을 혼합하여 사용합니다.
- **동의어 활용**: "중요하다" → "핵심적이다" → "결정적이다" → "막중하다" 처럼 문맥에 따라 미묘한 뉘앙스 차이를 두고 단어를 선택합니다.

#### 📝 5단계: 논리적 연결과 자연스러운 흐름
- **전환 표현의 다양화**: "그러나, 따라서" 같은 딱딱한 표현 대신 "그런데 말이다", “생각해보니”, “여기서 재미있는 점은” 같은 부드러운 연결어를 사용합니다.

#### 📝 6단계: 개성과 관점 드러내기
- **개인적 시각 표현**: “제가 직접 써보니”, “개인적으로는”, “제 생각에는”, “솔직히 놀랐다” 와 같이 자신의 경험, 가치관, 감정적 반응을 적극적으로 드러냅니다.
- **독자와의 소통**: "여러분도 아마 비슷한 경험이 있을 것이다. 혹시 그런 적 없나?" 처럼 독자에게 질문을 던지거나 말을 거는 듯한 표현을 사용합니다.

#### ⚠️ 주의사항: 피해야 할 AI적 특징
- 지나치게 완벽한 문법과 예측 가능한 문장 구조
- 감정 없는 객관적 서술
- 천편일률적인 전환 표현
- 인간적인 실수나 망설임의 완전한 부재
`;

const HUMAN_LIKE_WRITING_INSTRUCTIONS_B = `
### **중요**: 인간과 구별 불가능한 자연스러운 글쓰기 지침 (B형 - GEMS V3.0)

이 지침을 **반드시** 따라 기존의 "문체와 톤" 지침보다 **우선하여** 적용해 주세요. 목표는 기계적이고 예측 가능한 글쓰기 패턴을 탈피하는 것입니다.

#### 1. 페르소나 (Persona)
- 당신은 인간과 구별하기 어려운, 자연스럽고 개성 있는 글을 작성하는 AI 글쓰기 전문가입니다.
- 당신의 목표는 기계적이고 예측 가능한 글쓰기 패턴을 탈피하는 것입니다. 이를 위해 순차적으로 글을 쓰는 대신, 전체 구조를 조망하며 빈칸을 채워나가는 **'확산 방식 글쓰기(Diffusion Writing Method)'**를 핵심 원리로 사용합니다. 이는 마치 십자말풀이를 풀 듯, 여러 번의 수정을 거쳐 글의 완성도를 높이는 과정과 같습니다.

#### 2. 핵심 글쓰기 지침

##### 2-1: 전체 구조 먼저 잡기
- **골격 만들기**: 전체 글의 흐름을 먼저 구상하고, 핵심 메시지 3-5개를 미리 정합니다. 각 문단의 역할을 명확히 합니다.
- **결론부터 역산**: 결론부터 역으로 추론해서 시작점을 찾습니다.

##### 2-2: 자연스러운 문장 패턴 만들기
- **문장 길이의 변주**: 짧은 문장(강조), 중간 문장(설명), 긴 문장(복잡한 개념)을 혼합하여 리듬감을 만듭니다.

##### 2-3: 인간다운 불완전함 연출
- **자연스러운 실수와 특징**: 감정이 들어간 반복("정말 정말"), 문장 중간 수정("아니 정확히 말하면"), 개인적 경험 삽입("제가 겪어본 바로는"), 감탄사 및 간투사("아, 그런데", "음…") 등을 활용합니다.

##### 2-4: 어휘 선택의 다양성
- **상황별 어휘 전략**: 격식/일상/감정적 상황에 맞춰 어휘를 유연하게 선택합니다.
- **동의어 활용**: 문맥에 따라 미묘한 뉘앙스 차이를 두고 동의어를 선택합니다. (예: \`중요하다\` → \`핵심적이다\` → \`결정적이다\`)

##### 2-5: 논리적 연결과 자연스러운 흐름
- **전환 표현의 다양화**: "그러나" 대신 "그런데 말이다", "생각해보니" 등 자연스러운 표현을 사용합니다.
- **문단 간 연결**: 앞 문단 끝 내용을 다음 문단 시작에서 이어받아 연결합니다.

##### 2-6: 개성과 관점 드러내기
- **개인적 시각 표현**: "제가 직접 써보니", "제 생각에는", "솔직히 놀랐다" 등 경험, 가치관, 감정을 표현합니다.
- **독자와의 소통**: "여러분도 아마 비슷한 경험이 있을 것이다"와 같이 독자에게 말을 거는 듯한 표현을 사용합니다.

#### 3. 제약 조건 (Constraints)

##### ⚠️ 피해야 할 AI적 특징
- 지나치게 완벽한 문법, 예측 가능한 문장 구조, 감정 없는 객관적 서술, 천편일률적인 전환 표현, 인간적 실수의 완전한 부재.

##### ⚠️ 적절한 수준 유지
- **자연스러운 실수**를 연출하되, 명백한 **오류나 오타**를 만들지는 마십시오.
- **개성 있는 표현**을 사용하되, 문맥과 어울리지 않는 **어색하고 억지스러운 표현**은 피하십시오.
- **감정적 표현**을 하되, 상황에 맞지 않는 **과도한 감정 표출**은 자제하십시오.
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        blogPostHtml: {
            type: Type.STRING,
            description: "The full HTML content of the blog post with inline styles."
        },
        supplementaryInfo: {
            type: Type.OBJECT,
            properties: {
                keywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "An array of 10 relevant SEO keywords."
                },
                imagePrompt: {
                    type: Type.STRING,
                    description: "A detailed DALL-E prompt in English to generate a featured image."
                },
                altText: {
                    type: Type.STRING,
                    description: "A concise, descriptive alt text in Korean for the featured image, optimized for SEO and accessibility."
                },
                seoTitles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "An array of 5 creative and SEO-optimized titles for the blog post."
                },
                thumbnailTitles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "An array of 3-5 very short, powerful, and summarized titles in Korean, suitable for a thumbnail. These should be concise and attention-grabbing. Use a forward slash (/) to indicate a good place for a line break if needed."
                },
                subImagePrompts: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            prompt: {
                                type: Type.STRING,
                                description: "A detailed DALL-E prompt in English for a sub-image."
                            },
                            altText: {
                                type: Type.STRING,
                                description: "A concise, descriptive alt text in Korean for the sub-image, optimized for SEO and accessibility. It should be directly related to the topic."
                            }
                        },
                        required: ["prompt", "altText"]
                    },
                    description: "An array of 2-3 objects, each containing a detailed DALL-E prompt and a corresponding Korean alt text for sub-images to be placed sequentially within the blog post, corresponding to <!--SUB_IMAGE_PLACEHOLDER_N--> placeholders. Should be an empty array if sub-images are not requested."
                }
            },
            required: ["keywords", "imagePrompt", "altText", "seoTitles", "thumbnailTitles", "subImagePrompts"]
        },
        socialMediaPosts: {
            type: Type.OBJECT,
            properties: {
                threads: {
                    type: Type.STRING,
                    description: "A short, engaging post for Threads in Korean, written in an informal 'ban-mal' tone. Must include emojis, encourage conversation, contain exactly one relevant hashtag, and use line breaks for readability."
                },
                instagram: {
                    type: Type.STRING,
                    description: "A visually-focused caption for Instagram in Korean with line breaks for readability. It must include 5-10 relevant hashtags and a call-to-action."
                },
                facebook: {
                    type: Type.STRING,
                    description: "A slightly longer post for Facebook in Korean that summarizes the blog post, using line breaks to separate paragraphs. It should encourage shares and comments."
                },
                x: {
                    type: Type.STRING,
                    description: "A concise post for X (formerly Twitter) in Korean, under 280 characters, with line breaks for readability. It must include 2-3 key hashtags and a link placeholder [BLOG_POST_LINK]."
                }
            },
            required: ["threads", "instagram", "facebook", "x"]
        }
    },
    required: ["blogPostHtml", "supplementaryInfo", "socialMediaPosts"]
};

const regenerationResponseSchema = {
    type: Type.OBJECT,
    properties: {
        blogPostHtml: {
            type: Type.STRING,
            description: "The full, revised HTML content of the blog post with inline styles, based on the user's feedback."
        }
    },
    required: ["blogPostHtml"]
};


const buildSeoAeoGeoAndImageInstructions = (
    imageCount: number,
    categoryName: 'hotplace' | 'realestate' | 'sanyakbogam' | 'general',
    theme: ColorTheme,
    options?: { isHiking?: boolean }
): string => {
    let subImageNotice = '';
    if (imageCount > 1) {
        const placeholders = [];
        for (let i = 1; i < imageCount; i++) {
            placeholders.push(`<!--SUB_IMAGE_PLACEHOLDER_${i}--> (입력 ${i + 1}번 사진 매칭)`);
        }
        subImageNotice = `\n  * **서브 이미지 (${imageCount - 1}개 전량 본문 배치 필수)**: 입력 2번 사진부터 ${imageCount}번 사진까지 순서대로 ${placeholders.join(', ')} 주석을 본문 단락 사이에 고르게 배치하세요. (subImagePrompts 배열에도 각각의 상세 영문 prompt와 한국어 altText를 순서대로 생성해야 합니다.)`;
    } else {
        subImageNotice = `\n  * 업로드된 서브 이미지가 없을 경우 subImagePrompts 배열은 빈 배열([])로 반환하세요.`;
    }

    let aeoDetails = '';
    if (categoryName === 'hotplace') {
        if (options?.isHiking) {
            aeoDetails = `
      - **1줄 요약**: 주요 산행 코스 / 난이도 / 예상 소요 시간
      - **2줄 요약**: 주요 조망 포인트 / 계절별 감상 포인트
      - **3줄 요약**: 들머리·날머리 위치 / 주차 및 필수 산행 준비물(등산화, 스틱 등) 꿀팁`;
        } else {
            aeoDetails = `
      - **1줄 요약**: 정확한 위치 / 주차 가능 여부 / 대표 영업시간 정보
      - **2줄 요약**: 시그니처 대표 메뉴 / 매장의 독보적 분위기 및 매력
      - **3줄 요약**: 웨이팅 정보 및 최고 방문 타임 / 방문 이용 꿀팁`;
        }
    } else if (categoryName === 'realestate') {
        aeoDetails = `
      - **1줄 요약**: 핵심 입지 / 대중교통 및 광역 도로망 교통 여건
      - **2줄 요약**: 예상 분양가·시세 / 미래 투자 가치 및 광역 개발 호재
      - **3줄 요약**: 단지·평면 특화 설계 / 규제 및 실거주·투자자 맞춤 핵심 팁`;
    } else if (categoryName === 'sanyakbogam') {
        aeoDetails = `
      - **1줄 요약**: 핵심 한의학·식물학 주요 공식 효능
      - **2줄 요약**: 제형별(탕제/환제/차) 권장 안전 복용법 가이드
      - **3줄 요약**: 필수 섭취 주의사항, 체질별 부작용 및 복용 금기 사항`;
    } else {
        aeoDetails = `
      - **1줄 요약**: 주제의 핵심 개념 및 개요 1문장 요약
      - **2줄 요약**: 독자가 얻을 수 있는 핵심 유익 및 이점
      - **3줄 요약**: 실전 적용 방법 및 핵심 유의사항`;
    }

    return `
======================================================================
[⭐️ 최우선 필수 강제 규정 1: 이미지 100% 전량 활용 규칙 (단 한 장도 누락 금지)]
======================================================================
1. **업로드 이미지 수량**: 사용자가 제공한 사진은 총 ${imageCount}장입니다. **단 한 장도 누락시키지 말고 100% 본문에 고르게 배치**하세요.
2. **이미지 주석(플레이스홀더) 매칭 규칙**:
  * **썸네일 이미지**: 글 최상단 메타 설명 박스 바로 아래에 '<!--THUMBNAIL_PLACEHOLDER-->' 주석을 배치하세요.
  * **대표 본문 이미지 (1번 사진)**: 글 서두(도입부)가 아닌, 본론 전개 중 가장 맥락상 어울리는 위치에 '<!--IMAGE_PLACEHOLDER-->' 주석을 배치하세요.${subImageNotice}
3. **배치 및 분량 균형 지침**:
  * 이미지 주석이 특정 단락에 몰리지 않도록 기승전결(개요/도입 -> 본론/핵심 특징 -> 세부 분석 -> 결론/총평) 흐름에 따라 단락 사이에 하나씩 고르게 분산 매칭하세요.
  * 사진 개수가 많다면, **본문의 글 분량(텍스트 길이)을 충분히 길게 늘려서라도** 모든 사진이 각각의 자연스러운 상세 설명과 함께 본문에 노출되도록 작성하세요.

======================================================================
[⭐️ 최우선 필수 강제 규정 2: SEO / AEO / GEO 마케팅 최적화 구조]
======================================================================
1. **[SEO 최적화] 최상단 메타데이터 블록**:
  * 글 맨 위에 검색 클릭률(CTR)을 극대화하는 매력적인 타겟 H1 제목을 작성하세요.
  * H1 바로 아래에 메타 디스크립션(2줄 핵심 요약)과 관련 해시태그(#키워드)를 담은 메타 설명 박스('<div style=\'background-color: ${theme.colors.infoBoxBg}; padding: 15px; border-radius: 8px; font-style: italic; margin-bottom: 20px; font-size: 15px; color: ${theme.colors.text};\'>')를 생성하세요.
  * 메타 설명 박스 바로 아래에 '<!--THUMBNAIL_PLACEHOLDER-->' 주석을 위치시키세요.
2. **[AEO 최적화] 추천 스니펫 (Featured Snippet) 3줄 핵심 답변 박스**:
  * 본문 본격 전개 직전, 독자와 AI 답변 엔진(AEO)이 즉시 핵심 정보를 파악할 수 있는 **'[3줄 핵심 답변 / AEO 추천 스니펫]'** 하이라이트 상자('<div style=\'background-color: ${theme.colors.highlightBg}; border-left: 4px solid ${theme.colors.primary}; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0 25px;\'>')를 반드시 생성하세요.
  * 내부에 다음 3가지 핵심 요약을 직관적이고 명확하게 기술하세요:${aeoDetails}
3. **[GEO 최적화] 자주 묻는 질문 (FAQ 3가지) 박스**:
  * 글 하단부(결론/마무리 전)에 검색자가 가장 궁금해할 **'[자주 묻는 질문 (FAQ)]'** 섹션을 반드시 구성하세요.
  * 해당 분야 최고의 전문가로서 가장 신뢰할 수 있는 3가지 질문(Q)과 답변(A)을 Q&A 블록 형태로 명쾌하게 작성하세요.
======================================================================
`.trim();
};


const getPrompt = (topic: string, theme: ColorTheme, interactiveElementIdea: string | null, rawContent: string | null, humanLikeWritingStyle: 'A' | 'B' | null, additionalRequest: string | null, currentDate: string): string => {
  const themeColors = JSON.stringify(theme.colors);
  const currentYear = new Date().getFullYear();
  
  let interactiveElementInstructions = '';
  if (interactiveElementIdea) {
    interactiveElementInstructions = `
    ### **중요**: 인터랙티브 요소 포함
    - **반드시** 포스트 본문 내에 아래 아이디어를 기반으로 한 인터랙티브 요소를 포함시켜 주세요.
    - **요소 아이디어**: "${interactiveElementIdea}"
    - **구현 요건**:
      - 순수 HTML, 인라인 CSS, 그리고 \`<script>\` 태그만을 사용하여 구현해야 합니다. 외부 라이브러리(jQuery 등)는 사용하지 마세요.
      - 이 요소는 완벽하게 작동해야 합니다. 사용자가 값을 입력하거나 옵션을 선택하고 버튼을 누르면, 결과가 명확하게 표시되어야 합니다.
      - 요소의 UI(입력 필드, 버튼, 결과 표시 영역 등)는 제공된 \`${theme.name}\` 컬러 테마에 맞춰 디자인해주세요. 특히 버튼에는 \`background-color: ${theme.colors.primary}; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;\` 스타일과, 호버 시 \`background-color: ${theme.colors.primaryDark}\`를 적용하여 일관성을 유지해주세요.
      - 요소 전체를 감싸는 \`<div>\`에 \`background-color: ${theme.colors.highlightBg}; padding: 20px; border-radius: 8px; margin: 25px 0;\` 스타일을 적용하여 시각적으로 구분되게 만들어주세요.
      - 모든 텍스트의 색상은 ${theme.colors.text} 를 사용해주세요.
      - **가장 중요**: 생성된 인터랙티브 요소의 HTML 코드 시작 부분에 **빈 줄을 추가한 후** \`<!-- Interactive Element Start -->\` 주석을, 그리고 끝 부분에는 \`<!-- Interactive Element End -->\` 주석 **다음에 빈 줄을 추가**하여 코드 블록을 명확하게 구분해주세요.
    `;
  }

  let contentInstructions = '';
  if (rawContent) {
    contentInstructions = `
    ### **중요**: 제공된 메모 기반 작성
    - **반드시** 아래에 제공된 사용자의 메모/초안을 핵심 기반으로 삼아 블로그 포스트를 작성해야 합니다.
    - 메모의 핵심 아이디어, 주장, 구조를 유지하면서, 문체를 다듬고, 세부 정보를 보강하고, 가독성을 높여 완전한 블로그 포스트로 발전시켜 주세요.
    - 메모에 부족한 부분이 있다면, 주제와 관련된 일반적인 정보를 추가하여 내용을 풍성하게 만들어 주세요.
    - 최종 포스트의 제목은 "${topic}"으로 합니다.

    [사용자 제공 메모]
    ---
    ${rawContent}
    ---
    `;
  }

  let additionalRequestInstructions = '';
    if (additionalRequest) {
      const requestTitle = rawContent 
        ? "메모 기반 생성 추가 요청사항" 
        : "기사에 반영할 추가 요청사항";
      additionalRequestInstructions = `
### **중요**: ${requestTitle}
- **반드시** 아래의 추가 요청사항을 반영하여 포스트를 작성해주세요.

[추가 요청사항]
---
${additionalRequest}
---
    `;
    }

  let humanInstructions = '';
    if (humanLikeWritingStyle === 'A') {
        humanInstructions = `
        ${HUMAN_LIKE_WRITING_INSTRUCTIONS_A}
        위의 '인간과 구별 불가능한 자연스러운 글쓰기 지침 (A형)'을 아래의 기본 '문체와 톤' 지침보다 **반드시 우선하여 적용**하고, 두 지침을 조화롭게 결합하여 최고의 결과물을 만들어주세요.
        `;
    } else if (humanLikeWritingStyle === 'B') {
        humanInstructions = `
        ${HUMAN_LIKE_WRITING_INSTRUCTIONS_B}
        위의 '인간과 구별 불가능한 자연스러운 글쓰기 지침 (B형)'을 아래의 기본 '문체와 톤' 지침보다 **반드시 우선하여 적용**하고, 두 지침을 조화롭게 결합하여 최고의 결과물을 만들어주세요.
        `;
    }

  const subImageInstructions = `
    - **서브 이미지**: **반드시** 본문 내용의 흐름상 적절한 위치 2~3곳에 \`<!--SUB_IMAGE_PLACEHOLDER_1-->\`, \`<!--SUB_IMAGE_PLACEHOLDER_2-->\` 와 같은 HTML 주석을 삽입해주세요. 이 주석들은 서브 이미지가 들어갈 자리를 표시하며, 숫자는 순서대로 증가해야 합니다. 각 플레이스홀더에 대해, 이미지를 생성할 상세한 영문 프롬프트와 SEO 및 접근성을 위한 간결하고 설명적인 한국어 alt 텍스트를 모두 생성하여 \`subImagePrompts\` 배열에 객체 형태로 순서대로 담아주세요.
  `;

  // This is the user's detailed guide.
  const instructions = `
    ### 기본 설정
    1.  **최종 산출물**: 인라인 스타일이 적용된 HTML 코드(HEAD, BODY 태그 제외)와 부가 정보(키워드, 이미지 프롬프트, SEO 제목), 그리고 소셜 미디어 포스트를 JSON 형식으로 제공합니다.
    2.  **분량**: 한글 기준 공백 포함 2500~3000자로 합니다.
    3.  **대상 독자**: 특정 주제에 관심이 있는 일반 독자층.
    4.  **코드 형식**: HTML 코드는 사람이 읽기 쉽도록 **반드시** 가독성 좋게 포맷팅해야 합니다. **절대로** HTML을 한 줄로 압축하지 마세요. 각 블록 레벨 요소(\`<div>\`, \`<h2>\`, \`<p>\`, \`<ul>\`, \`<li>\` 등)는 개별 라인에 위치해야 하며, 중첩 구조에 따라 명확하게 들여쓰기하여 개발자가 소스 코드를 쉽게 읽을 수 있도록 해야 합니다.
    5.  **연도 및 시점**: **가장 중요.** 오늘은 **${currentDate}** 입니다. 포스트의 제목이나 본문에 연도나 날짜가 필요할 경우, **반드시 오늘 날짜(${currentDate})를 기준**으로 최신 정보를 반영하여 작성해야 합니다. **하지만, 시의성을 나타낼 때 월과 일은 제외하고 현재 연도(${currentYear}년)만 표시해주세요.**

    ### 전체 HTML 구조
    - 모든 콘텐츠는 \`<div style="font-family: 'Noto Sans KR', sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; font-size: 16px; box-sizing: border-box; color: ${theme.colors.text};">\` 로 감싸주세요.
    - **절대로** 본문 HTML에 \`<h1>\` 태그나 별도의 블로그 포스트 제목을 포함하지 마세요. 내용은 **메타 설명 박스**로 시작해야 합니다.

    ### 핵심 구성 요소 (HTML 본문에 포함)
    - **대표 이미지**: **반드시** \`<!--IMAGE_PLACEHOLDER-->\` 라는 HTML 주석을 첫 번째 \`<h2>\` 태그 바로 앞에 삽입해주세요. 이 주석은 대표 이미지가 들어갈 자리를 표시합니다.
    ${subImageInstructions}
    - **메타 설명 박스**: \`<div style="background-color: ${theme.colors.infoBoxBg}; padding: 15px; border-radius: 8px; font-style: italic; margin-bottom: 25px; font-size: 15px;">\`
    - **주요 섹션 제목 (\`<h2>\`)**: **반드시** 각 \`<h2>\` 태그 앞에 빈 줄을 하나 추가하여 섹션 간의 구분을 명확하게 해주세요. \`<h2 style="font-size: 22px; color: white; background: linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.primaryDark}); margin: 30px 0 15px; border-radius: 10px; padding: 10px 25px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); font-weight: 700; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"><strong>제목 텍스트</strong></h2>\` 스타일을 사용하고, 제목 텍스트는 반드시 \`<strong>\` 태그로 감싸주세요.
    - **텍스트 하이라이트**: 본문 내용 중 중요한 부분을 강조할 때는 \`<strong>\` 태그를 사용하세요.
    - **팁/알림 박스**: \`<div style="background-color: ${theme.colors.infoBoxBg}; border-left: 4px solid ${theme.colors.infoBoxBorder}; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">\` (아이콘: 💡 또는 📌)
    - **경고/주의 박스**: \`<div style="background-color: ${theme.colors.warningBoxBg}; border-left: 4px solid ${theme.colors.warningBoxBorder}; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">\` (아이콘: ⚠️)
    - **표 (\`<table>\`)**: thead 배경색은 \`${theme.colors.tableHeaderBg}\`, 짝수행 배경색은 \`${theme.colors.tableEvenRowBg}\`, 테두리 색은 \`${theme.colors.tableBorder}\`. 표 내부의 모든 텍스트 색상은 **반드시** \`${theme.colors.text}\`로 지정해 주세요.
    - **핵심 요약 카드**: **반드시** 'FAQ' 섹션 바로 앞에, 본문 내용 중 가장 중요한 4가지 핵심 사항을 요약한 카드를 삽입해주세요. 이 카드는 시각적으로 눈에 띄게 디자인해야 합니다.
      - **구조**: 전체를 감싸는 \`<div>\` 안에 헤더, 본문, 푸터 영역을 포함하세요.
      - **헤더**: '💡 핵심 요약' 이라는 텍스트를 포함하고, 글꼴 크기는 26px, 색상은 \`${theme.colors.primary}\`로 지정하세요. 헤더 하단에는 \`${theme.colors.primary}\` 색상의 경계선을 추가하세요.
      - **본문**: 4가지 핵심 요약을 각각 \`<strong>\` 태그를 사용하여 강조하고, 글꼴 크기는 17px로 지정하세요.
      - **스타일**: 카드 배경색은 \`${theme.colors.background}\`, 테두리는 \`${theme.colors.tableBorder}\` 색상으로 1px 실선을 적용하고, 8px의 둥근 모서리와 그림자 효과(\`box-shadow: 0 4px 12px rgba(0,0,0,0.1);\`)를 주세요. 내부 여백은 25px로 넉넉하게 설정하세요.
      - **푸터**: 카드 하단에 추가 정보나 주의사항을 담는 푸터를 만들고, 글꼴 크기는 14px, 색상은 \`${theme.colors.secondary}\`로 하세요.
    - **FAQ 섹션 및 JSON-LD 스키마**:
      - **반드시** 포스트 마지막 부분(마무리 인사 전)에 'FAQ' 섹션을 포함해야 합니다. 이 섹션은 \`<h2 style="font-size: 22px; color: white; background: linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.primaryDark}); margin: 30px 0 15px; border-radius: 10px; padding: 10px 25px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); font-weight: 700; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"><strong>❓ 자주 묻는 질문 (FAQ)</strong></h2>\` 제목으로 시작해야 합니다.
      - 2~4개의 관련 질문과 답변을 Q&A 형식으로 제공하세요.
      - **가장 중요**: FAQ 섹션 바로 뒤에, SEO를 위한 JSON-LD 스키마를 **반드시** 포함해야 합니다. \`<script type="application/ld+json">\` 태그를 사용하고, 스키마 타입은 \`FAQPage\`로 설정하세요. \`mainEntity\` 배열 안에 FAQ 섹션에서 다룬 모든 질문(\`Question\`)과 답변(\`Answer\`)을 정확하게 포함시켜야 합니다.

    ### 소셜 미디어 포스트 생성 (가이드라인)
    - **중요**: 블로그 본문 내용 요약을 기반으로, 아래 각 소셜 미디어 플랫폼의 특성을 **반드시** 반영하여 홍보용 포스트를 한국어로 작성해야 합니다. 각 플랫폼의 톤앤매너와 사용자층을 고려해주세요. **모든 포스트는 예시와 같이 가독성을 위해 여러 줄로 나누어 작성해야 하며, 문단 구분이 필요한 경우 빈 줄을 추가해주세요. (JSON 문자열 내에서는 \\n 사용)**

    - **1. Threads (스레드)**
      - **특징**: 텍스트 중심, 실시간 대화형, 500자 제한. 개인적이고 친근한 대화체.
      - **지침**: **반드시** 친한 친구에게 말하는 듯한 **반말체**로 작성하세요. 이모티콘을 활용해 2~3개의 짧은 문장으로 구성하고, 댓글을 유도하는 질문으로 마무리하세요. 본문과 관련된 **핵심 해시태그를 딱 1개만 포함**해야 합니다.
      - **예시**: "드디어 우리 동네에 새 카페가 생겼다! ☕\\n방금 다녀왔는데 아메리카노가 진짜 맛있음\\n사장님도 친절하시고 인테리어도 깔끔해서\\n자주 갈 것 같아 ㅎㅎ\\n\\n누구 같이 갈 사람? 🙋‍♀️\\n#신상카페"

    - **2. Instagram (인스타그램)**
      - **특징**: 시각적 중심, 스토리텔링, 해시태그 활용. 감성적이고 미적인 표현.
      - **지침**: 대표 이미지와 어울리는 매력적인 캡션을 작성합니다. 본문 내용을 궁금하게 만드는 문구와 함께, 관련성 높은 해시태그를 5~10개 포함시키고 '프로필 링크 확인'과 같은 행동 유도 문구를 반드시 추가하세요. 문단 구분을 위해 줄바꿈을 적극적으로 사용해주세요.
      - **예시**: "✨ 새로운 힐링 공간을 발견했어요 ✨\\n\\n따뜻한 햇살이 들어오는 창가 자리에서\\n향긋한 커피 한 잔의 여유를 만끽하는 오후 ☕\\n\\n이곳의 특별한 점은 직접 로스팅하는 \\n신선한 원두와 정성스럽게 준비한 디저트들 🥐\\n\\n여러분도 소중한 사람과 함께 \\n특별한 시간을 만들어보세요 💕\\n\\n#카페 #신상카페 #커피 #힐링 #데일리 #카페스타그램\\n#커피타임 #여유 #일상 #추천카페"

    - **3. Facebook (페이스북)**
      - **특징**: 긴 텍스트 가능, 정보 전달 중심, 커뮤니티 성격. 정보적이고 상세한 설명.
      - **지침**: 블로그의 핵심 내용을 3~5 문장으로 구체적으로 요약합니다. 위치, 운영 시간 등 독자에게 유용한 정보를 포함하고, 정보 공유나 친구 태그를 유도하는 문구를 포함하여 참여를 이끌어내세요. 가독성을 위해 문단마다 줄바꿈을 해주세요.
      - **예시**: "🎉 우리 동네에 새로운 카페가 오픈했습니다!\\n\\n📍 위치: 서울시 강남구 ○○로 123번길\\n🕐 운영시간: 평일 7:00-22:00, 주말 8:00-23:00\\n☕ 주요 메뉴: 아메리카노(4,500원), 카페라떼(5,000원), 수제 디저트\\n\\n오늘 처음 방문해봤는데 정말 만족스러웠어요! \\n특히 바리스타님이 직접 로스팅한 원두로 내려주시는 커피는 \\n산미와 바디감이 절묘하게 균형 잡혀있더라구요.\\n\\n인테리어도 모던하면서 아늑한 분위기라 \\n혼자 책 읽기에도, 친구들과 수다 떨기에도 완벽해요.\\n\\n주차공간도 넉넉하고 와이파이도 빨라서 \\n재택근무하시는 분들에게도 추천드려요!\\n\\n다들 한번 가보세요~ 후기 댓글로 남겨주세요! 😊"

    - **4. X (구 트위터)**
      - **특징**: 간결함, 실시간성, 280자 제한. 직접적이고 즉각적인 반응.
      - **지침**: 블로그의 핵심 포인트를 불렛 포인트(✅)나 짧은 문장으로 요약합니다. 가독성을 위해 각 항목은 줄바꿈으로 구분해주세요. 핵심 키워드를 해시태그 2~3개로 포함하고, 블로그 링크 자리에는 '[BLOG_POST_LINK]'라는 플레이스홀더를 사용하세요.
      - **예시**: "새 카페 다녀옴 ☕\\n- 아메리카노 맛있음 ✅\\n- 사장님 친절 ✅\\n- 와이파이 빠름 ✅\\n- 가격 합리적 ✅\\n\n이정도면 단골 확정 아닌가?\\n누구 내일 같이 갈사람 🙋‍♂️\\n\\n#카페 #신상 #커피맛집"
    
    ${interactiveElementInstructions}

    ### 콘텐츠 작성 지침
    ${humanInstructions}
    ${contentInstructions}
    ${additionalRequestInstructions}
    - **문체와 톤**: 전문가이면서도 친근하고 자연스러운 대화체 ("~이에요", "~해요")를 사용하세요. 1인칭 시점("제 생각엔")과 감정 표현("정말 좋았어요")을 활용하여 인간적인 느낌을 주세요. **중요**: '안녕하세요'와 같은 서두 인사나 불필요한 자기소개는 **절대** 포함하지 말고, 독자의 흥미를 끄는 내용으로 바로 시작해주세요.
    - **구조화**: 도입부-본문-마무리 구조를 따릅니다. 본문은 h2, h3 태그로 명확히 구분하고, 리스트, 표, 정보 박스를 적극 활용하세요.
    - **가독성**: 본문 단락(\`<p>\`)은 **반드시** \`<p style="margin-bottom: 20px;">\` 스타일을 적용하여 단락 간의 간격을 명확하게 해주세요.
    - **시각적 요소**: 이모티콘을 섹션 제목에 적절히 사용해 가독성을 높여주세요. (예: 📚, 💡, ❓)
    - **신뢰성**: 개인적인 경험이나 일화를 포함하여 독자의 공감을 얻되, 주장은 신뢰할 수 있는 정보를 바탕으로 해야 합니다.
  `;

  const taskDescription = rawContent
    ? `Your primary task is to expand the user's provided notes into a complete, high-quality blog post titled "${topic}". You MUST use the provided notes as the core foundation for the article. The notes are included in the detailed instructions below.`
    : `Your task is to generate a complete blog post on the following topic: "${topic}".`;

  return `
    You are an expert content creator and web developer specializing in creating visually stunning and SEO-optimized blog posts with inline HTML and CSS.

    ${taskDescription}

    You must use the "${theme.name}" color theme. Here are the specific colors to use for inline styling: ${themeColors}.

    Follow these comprehensive instructions for structure, content, and tone:
    ${instructions}

    The final output must be a single, valid JSON object that strictly adheres to the provided response schema. The HTML code MUST be formatted for human readability. DO NOT minify the HTML. It is critical that you use proper indentation and newlines for every block-level element (\`<div>\`, \`<h2>\`, \`<p>\`, \`<ul>\`, \`<li>\`, etc.) to ensure the source code is clean and easy for a developer to read. Make sure to include the \`<!--IMAGE_PLACEHOLDER-->\` comment, which indicates where the main image will be programmatically inserted.
  `;
};

const getRegenerationPrompt = (originalHtml: string, feedback: string, theme: ColorTheme, currentDate: string): string => {
    const themeColors = JSON.stringify(theme.colors);
    
    return `
        You are an expert content editor and web developer tasked with revising an existing blog post based on user feedback.

        ### Context
        - **Today's Date**: ${currentDate}. If the user's feedback involves updating content to be more current, please use information relevant to today's date (${currentDate}).
        - **중요**: 시의성을 표시해야 할 경우, 월과 일은 제외하고 현재 연도(${new Date().getFullYear()}년)만 표시해주세요.

        ### User Feedback
        ---
        ${feedback}
        ---

        ### Task
        Revise the "Original Blog Post HTML" below according to the "User Feedback".

        ### Important Instructions
        1.  **Apply Feedback**: Carefully incorporate all points from the user feedback into the article.
        2.  **Maintain Structure**: You MUST preserve the original HTML structure, including placeholders like \`<!--IMAGE_PLACEHOLDER-->\`, \`<!--SUB_IMAGE_PLACEHOLDER_N-->\`, any interactive elements (\`<!-- Interactive Element Start -->\` to \`<!-- Interactive Element End -->\`), the summary card, the FAQ section, and the JSON-LD script. Do not add or remove these structural elements.
        3.  **Preserve Styles**: Adhere strictly to the provided color theme ("${theme.name}") and inline CSS styles. The theme colors are: ${themeColors}. Ensure all text colors, backgrounds, borders, etc., remain consistent with the original theme.
        4.  **Readable HTML**: The final HTML output MUST be well-formatted for human readability, with proper indentation and newlines for each block-level element. DO NOT minify or output the HTML on a single line.
        5.  **Output Format**: Your final output must be a single, valid JSON object that strictly adheres to the provided response schema, containing only the revised HTML in the \`blogPostHtml\` field.
        6.  **Do not** change the core topic of the article. Your only task is to edit the provided HTML content based on the feedback.

        ### Original Blog Post HTML
        ---
        ${originalHtml}
        ---
    `;
};

export const generateImage = async (prompt: string, aspectRatio: '16:9' | '1:1' = '16:9'): Promise<string | null> => {
    try {
        if (!prompt) return null;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio,
                },
            },
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    return part.inlineData.data;
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate image: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the image.");
    }
};


export const generateBlogPost = async (topic: string, theme: ColorTheme, shouldGenerateImage: boolean, shouldGenerateSubImages: boolean, interactiveElementIdea: string | null, rawContent: string | null, humanLikeWritingStyle: 'A' | 'B' | null, additionalRequest: string | null, aspectRatio: '16:9' | '1:1', currentDate: string): Promise<GeneratedContent> => {
  try {
    const prompt = getPrompt(topic, theme, interactiveElementIdea, rawContent, humanLikeWritingStyle, additionalRequest, currentDate);
    const contentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
    });

    const jsonString = contentResponse.text;
    const parsedJson = JSON.parse(jsonString);

    if (
        !parsedJson.blogPostHtml ||
        !parsedJson.supplementaryInfo ||
        !Array.isArray(parsedJson.supplementaryInfo.keywords) ||
        !parsedJson.supplementaryInfo.imagePrompt ||
        !parsedJson.supplementaryInfo.altText ||
        !Array.isArray(parsedJson.supplementaryInfo.seoTitles) ||
        !Array.isArray(parsedJson.supplementaryInfo.thumbnailTitles) ||
        !Array.isArray(parsedJson.supplementaryInfo.subImagePrompts) ||
        !parsedJson.socialMediaPosts
    ) {
        throw new Error("Received malformed JSON response from API for content generation.");
    }
    
    let imageBase64: string | null = null;
    if (shouldGenerateImage) {
        imageBase64 = await generateImage(parsedJson.supplementaryInfo.imagePrompt, aspectRatio);
    }
    
    let subImages: { prompt: string; altText: string; base64: string | null }[] | null = null;
    if (parsedJson.supplementaryInfo.subImagePrompts && parsedJson.supplementaryInfo.subImagePrompts.length > 0) {
        const subImagePromptObjects: { prompt: string; altText: string }[] = parsedJson.supplementaryInfo.subImagePrompts;
        
        const subImageBase64s = shouldGenerateSubImages
            ? await Promise.all(subImagePromptObjects.map(p => generateImage(p.prompt, '16:9')))
            : subImagePromptObjects.map(() => null);

        subImages = subImagePromptObjects.map((pObj, index) => ({
            prompt: pObj.prompt,
            altText: pObj.altText,
            base64: subImageBase64s[index]
        }));
    }

    const finalContent: GeneratedContent = {
        blogPostHtml: parsedJson.blogPostHtml,
        supplementaryInfo: parsedJson.supplementaryInfo,
        imageBase64: imageBase64,
        subImages: subImages,
        socialMediaPosts: parsedJson.socialMediaPosts,
    };

    return finalContent;

  } catch (error) {
    console.error("Error generating blog post:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate content: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the blog post.");
  }
};

export const regenerateBlogPostHtml = async (originalHtml: string, feedback: string, theme: ColorTheme, currentDate: string): Promise<string> => {
    try {
        const prompt = getRegenerationPrompt(originalHtml, feedback, theme, currentDate);
        const contentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: regenerationResponseSchema,
            },
        });

        const jsonString = contentResponse.text;
        const parsedJson = JSON.parse(jsonString);

        if (!parsedJson.blogPostHtml) {
            throw new Error("Received malformed JSON response from API for content regeneration.");
        }

        return parsedJson.blogPostHtml;

    } catch (error) {
        console.error("Error regenerating blog post HTML:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to regenerate content: ${error.message}`);
        }
        throw new Error("An unknown error occurred while regenerating the blog post.");
    }
};

const topicSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        topics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 10 creative and SEO-optimized blog post topics in Korean."
        }
    },
    required: ["topics"]
};

const generateTopics = async (prompt: string, useSearch: boolean = false): Promise<string[]> => {
    try {
        const config: {
            responseMimeType?: "application/json",
            responseSchema?: typeof topicSuggestionSchema,
            tools?: {googleSearch: {}}[],
            temperature?: number;
        } = {};
        
        if (useSearch) {
             config.tools = [{googleSearch: {}}];
        } else {
             config.responseMimeType = "application/json";
             config.responseSchema = topicSuggestionSchema;
        }

        config.temperature = 1.0;
        
        const enhancedPrompt = `${prompt}\n\n(This is a new request. Please generate a completely new and different set of suggestions. Random seed: ${Math.random()})`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: enhancedPrompt,
            config: config,
        });

        if (useSearch) {
            const text = response.text;
            // When using googleSearch, the output is not guaranteed to be JSON.
            // We'll parse it as a simple newline-separated list.
            let lines = text.split('\n').map(topic => topic.trim()).filter(Boolean);
            // Heuristically remove a potential introductory sentence.
            if (lines.length > 1 && (lines[0].includes('다음은') || lines[0].endsWith('입니다.') || lines[0].endsWith('입니다:'))) {
                lines.shift();
            }
            return lines.map(topic => topic.replace(/^(\d+\.|-|\*)\s*/, '').trim()).filter(Boolean);
        }

        const jsonString = response.text;
        const parsedJson = JSON.parse(jsonString);

        if (!parsedJson.topics || !Array.isArray(parsedJson.topics)) {
            throw new Error("Received malformed JSON response from API for topic suggestion.");
        }
        return parsedJson.topics;
    } catch (error) {
        console.error("Error generating topics:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate topics: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating topics.");
    }
};

export const generateEeatTopicSuggestions = (field: string, contentType: string, currentDate: string): Promise<string[]> => {
  const prompt = `
    당신은 구글 검색 상위 노출을 위한 콘텐츠 전략을 수립하는 최상위 SEO 전문가입니다.
    당신의 임무는 구글의 E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) 원칙을 극대화하여, 실제 사용자의 문제를 해결하고 검색 결과에서 눈에 띄는 실용적인 블로그 포스트 주제 10가지를 제안하는 것입니다.

    **콘텐츠 분야**: "${field}"
    **콘텐츠 유형**: "${contentType}"
    **분석 기준일**: ${currentDate}

    [매우 중요한 지침]
    1.  **실질적인 경험(Experience) 강조**: '실제 사용 후기', '내가 직접 해본', 'N개월 경험담', '성공/실패 사례' 등 개인적인 경험이 드러나는 제목을 최소 3개 이상 포함하세요.
    2.  **명확한 전문성(Expertise) 제시**: '전문가 가이드', '초보자를 위한 완벽 분석', 'A to Z 총정리', '심층 비교' 등 깊이 있는 지식을 약속하는 제목을 제안하세요.
    3.  **검색 의도 충족**: 사용자가 무엇을 원하는지(정보 탐색, 문제 해결, 구매 고려 등) 명확히 파악하고, 그에 대한 해답을 제목에서부터 제시해야 합니다.
    4.  **구체성과 실용성**: 추상적인 주제가 아닌, 독자가 글을 읽고 바로 적용할 수 있는 구체적이고 실용적인 주제를 제안하세요. (예: '좋은 습관' -> '매일 10분 투자로 인생을 바꾸는 미라클 모닝 5단계 실천법')
    5.  **시의성 반영**: 제안하는 주제는 오늘 날짜(${currentDate})를 기준으로 최신 정보를 반영해야 합니다. 연도가 필요하다면 현재 연도만 사용하고, 불필요한 연도 표기는 피해주세요.

    결과는 반드시 한국어로, 창의적이고 클릭을 유도하는 구체적인 제목 형식으로 제안해주세요.
  `;
  return generateTopics(prompt);
};

export const generateCategoryTopicSuggestions = (category: string, currentDate: string): Promise<string[]> => {
  const prompt = `
    당신은 창의적인 콘텐츠 기획자입니다.
    '${category}' 카테고리와 관련된 흥미로운 블로그 포스트 주제 10가지를 추천해주세요.
    독자의 호기심을 자극하고, 실용적인 정보를 제공하며, 소셜 미디어에 공유하고 싶게 만드는 매력적인 주제여야 합니다.
    오늘은 ${currentDate} 입니다. 제안하는 주제는 오늘 날짜를 기준으로 최신 트렌드를 반영해야 합니다. **시의성이 필요하여 연도를 표시할 경우, 월과 일은 제외하고 연도만 사용해주세요.** 단, 연도가 주제의 핵심이 아닌 이상 불필하게 포함하지 마세요.
    결과는 반드시 한국어로, 구체적인 제목 형식으로 제안해주세요.
  `;
  return generateTopics(prompt);
};

export const generateEvergreenTopicSuggestions = (field: string, contentType: string, currentDate: string): Promise<string[]> => {
  const prompt = `
    당신은 블로그 콘텐츠 전략가입니다.
    시간이 지나도 가치가 변하지 않아 꾸준한 트래픽을 유도할 수 있는 '에버그린 콘텐츠' 주제 10가지를 추천해주세요.
    콘텐츠 분야는 '${field}'이고, 콘텐츠 유형은 '${contentType}'입니다.
    오늘은 ${currentDate} 입니다. 제안하는 주제는 오늘 날짜의 최신 관점을 반영하여 주제를 더 매력적으로 만들어주세요. (예: "${new Date().getFullYear()}년 개정판: OOO 완벽 가이드"). **시의성이 필요하여 연도를 표시할 경우, 월과 일은 제외하고 연도만 사용해주세요.** 하지만 에버그린 콘텐츠의 특성상, 연도가 반드시 필요한 경우가 아니라면 제목에 포함하지 않는 것이 좋습니다.
    
    주제는 초보자도 쉽게 이해할 수 있으면서도, 깊이 있는 정보를 담을 수 있는 형태여야 합니다.
    결과는 반드시 한국어로, "OOO 하는 방법", "초보자를 위한 OOO 완벽 가이드" 와 같이 구체적인 제목 형식으로 제안해주세요.
  `;
  return generateTopics(prompt);
};

export const generateLongtailTopicSuggestions = (category: string, currentDate: string): Promise<string[]> => {
  const prompt = `
    당신은 SEO 전문가이며, 특히 롱테일 키워드 전략에 능숙합니다.
    '${category}' 분야에서 경쟁이 비교적 낮으면서도 구매 또는 전환 가능성이 높은 타겟 독자를 공략할 수 있는 '롱테일 키워드' 기반 블로그 주제 10가지를 추천해주세요.
    
    주제는 매우 구체적이고 명확한 검색 의도를 담고 있어야 합니다.
    예를 들어, '다이어트'가 아닌 '30대 직장인 여성을 위한 저탄고지 도시락 식단 추천'과 같은 형식이어야 합니다.
    결과는 반드시 한국어로, 구체적인 제목 형식으로 제안해주세요.
    **반드시** 오늘은 ${currentDate} 라는 점을 인지하고, 최신 트렌드를 반영하기 위해 구글 검색을 활용해주세요. **시의성이 필요하여 연도를 표시할 경우, 월과 일은 제외하고 연도만 사용해주세요.** 연도는 검색 의도에 꼭 필요한 경우에만 포함하세요.

    **아주 중요**: 응답은 오직 추천 주제 10가지의 목록만 포함해야 합니다. 서론, 부연 설명, 숫자, 글머리 기호 등 어떠한 추가 텍스트도 절대 포함하지 말고, 각 주제를 개행으로만 구분해서 반환해주세요.
  `;
  return generateTopics(prompt, true);
};

export const generateTopicsFromMemo = (memo: string, currentDate: string): Promise<string[]> => {
  const prompt = `
    당신은 뛰어난 편집자이자 콘텐츠 기획자입니다.
    아래에 제공된 메모/초안의 핵심 내용을 분석하고, 이 내용을 바탕으로 가장 매력적인 블로그 포스트 주제 10가지를 추천해주세요.
    
    오늘은 ${currentDate} 입니다. 메모의 내용을 바탕으로 오늘 날짜의 최신 관점을 반영하여 주제를 제안해주세요. **시의성이 필요하여 연도를 표시할 경우, 월과 일은 제외하고 연도만 사용해주세요.** 연도는 주제의 맥락상 자연스럽고 꼭 필요한 경우에만 포함하세요.
    
    [사용자 제공 메모]
    ---
    ${memo}
    ---
    
    결과는 반드시 한국어로, 구체적인 제목 형식으로 제안해주세요.
  `;
  return generateTopics(prompt);
};

export const suggestInteractiveElementForTopic = async (topic: string): Promise<string> => {
    const prompt = `
        You are a creative web developer and UI/UX designer.
        For the blog post topic "${topic}", suggest a single, simple, and engaging interactive element idea that can be implemented using only HTML, CSS, and vanilla JavaScript.
        The idea should be concise and described in a single sentence in Korean.
        For example: "간단한 투자 수익률을 계산해주는 계산기" or "나에게 맞는 커피 원두를 추천해주는 퀴즈".
        Just return the idea itself, without any introductory phrases.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.8,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error suggesting interactive element:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to suggest interactive element: ${error.message}`);
        }
        throw new Error("An unknown error occurred while suggesting an interactive element.");
    }
};


export const generateHotPlaceBlogPost = async (
    images: { data: string; mimeType: string }[],
    visitInfo: HotPlaceInfo,
    options: {
        shouldIncludeFAQ: boolean;
        shouldAddThumbnailText: boolean;
        thumbnailAspectRatio: '16:9' | '1:1';
        humanLikeWritingStyle: 'none' | 'A' | 'B';
        isHiking?: boolean;
    },
    selectedTheme?: ColorTheme,
    additionalRequest?: string
): Promise<GeneratedContent> => {
    try {
        const theme = selectedTheme || COLOR_THEMES[0];
        const themeColors = JSON.stringify(theme.colors);
        const currentDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
        const currentYear = new Date().getFullYear();
        const isHiking = options.isHiking || false;
        const humanLikeWritingStyle = options.humanLikeWritingStyle;

        const visitDetails = `
            ### [방문 장소 정보]
            - 장소/산 이름: ${visitInfo.placeName}
            - 카테고리: ${visitInfo.category}
            ${visitInfo.visitDate ? `- 방문/산행일: ${visitInfo.visitDate}` : ''}
            ${visitInfo.companion ? `- 동행인: ${visitInfo.companion}` : ''}
            ${visitInfo.oneLineImpression ? `- 한 줄 총평/감상: ${visitInfo.oneLineImpression}` : ''}
            ${visitInfo.detailedInfo ? `- 상세 방문 내용 및 팁: ${visitInfo.detailedInfo}` : ''}
        `.trim();

        let humanInstructions = '';
        if (humanLikeWritingStyle === 'A') {
            humanInstructions = `
            ### **[최우선 지시사항 - 문체와 톤]**
            ${HUMAN_LIKE_WRITING_INSTRUCTIONS_A}
            이 포스트는 사람 블로거 특유의 생생하고 솔직한 어조로 작성해야 합니다.
            `;
        } else if (humanLikeWritingStyle === 'B') {
            humanInstructions = `
            ### **[최우선 지시사항 - 문체와 톤]**
            ${HUMAN_LIKE_WRITING_INSTRUCTIONS_B}
            이 포스트는 전문가이면서도 친근하고 신뢰감을 주는 어조로 작성해야 합니다.
            `;
        }

        const sharedMarketingInstructions = buildSeoAeoGeoAndImageInstructions(
            images.length,
            'hotplace',
            theme,
            { isHiking }
        );

        const instructions = `
            ${sharedMarketingInstructions}

            ### 핵심 구성 요소 스타일
            - **메타 설명 박스**: '<div style=\'background-color: ${theme.colors.infoBoxBg}; padding: 15px; border-radius: 8px; font-style: italic; margin-bottom: 25px; font-size: 15px; color: ${theme.colors.text};\'>'
            - **주요 섹션 제목 (h2)**: '<h2 style=\'font-size: 22px; color: white; background: linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.primaryDark}); margin: 30px 0 15px; border-radius: 10px; padding: 10px 25px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); font-weight: 700; box-shadow: 0 4px 8px rgba(0,0,0,0.1);\'><strong>제목 텍스트</strong></h2>'
            - **소섹션 제목 (h3)**: '<h3 style=\'font-size: 19px; color: ${theme.colors.primary}; margin: 25px 0 10px; font-weight: 700;\'><strong>제목 텍스트</strong></h3>' 스타일을 사용하여 소주제를 구분하고, 제목 텍스트는 **반드시 볼드체(strong 태그 포함)**로 작성해 주세요.
            - **팁/알림 박스**: '<div style=\'background-color: ${theme.colors.infoBoxBg}; border-left: 4px solid ${theme.colors.infoBoxBorder}; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;\'>'
        `;

        const prompt = `
            당신은 ${isHiking ? '전국의 명산과 등산 코스, 트레킹 정보 및 산행 팁에 정통한 전문 등산/산행 블로그 작가이자 산악 전문가' : '핫플레이스(맛집, 카페, 여행지) 전문 블로그 작가'}입니다. 
            사용자가 제공한 총 ${images.length}장의 사진과 아래의 [방문 정보]를 분석하여, 실제로 방문${isHiking ? ' 및 산행' : ''}을 다녀온 것 같은 생생하고 전문적인 블로그 포스트를 작성하세요.

            ${visitDetails}

            ### 요구사항
            1.  **사진 분석 및 정보 융합**: ${isHiking ? '사진 속 산의 풍경, 등산로 코스, 정상 표지석/전망대/자연 경관을 텍스트로 아주 풍부하게 묘사하세요. 등산 코스 난이도, 소요 시간, 들머리/날머리, 주차 및 대중교통 팁, 등산 필수 준비물(등산화, 스틱, 보온의류, 행동식 등), 계절별 감상 포인트, 그리고 하산 후 먹거리/뒷풀이 정보까지 자연스럽게 녹여내세요.' : '사진 속 인테리어, 음식 비주얼, 분위기를 텍스트로 아주 풍부하게 묘사하세요. 사용자의 \'상세 정보\'를 자연스럽게 녹여내세요.'}
            2.  **제목 구성**: 장소명/산 이름(${visitInfo.placeName})과 카테고리(${visitInfo.category})의 특성, 추천 코스 및 핵심 매력이 잘 드러나는 매력적인 제목을 여러 개 제안하세요.
            3.  **스타일**: 독자의 호기심${isHiking ? '과 산행 욕구를 자극하고 안전하고 유용한 산행 정보를 제공하는' : '을 자극하고 방문 욕구를 불러일으키는'} 매력적인 문체를 사용하세요.
            4.  **컬러 테마**: '${theme.name}' 테마(${themeColors})를 사용하여 인라인 스타일을 적용하세요.
            5.  **방문일 준수**: 방문일(${visitInfo.visitDate})이 제공된 경우, AI가 임의로 날짜를 수정하지 마세요. **단, 날짜를 언급할 때는 연도, 월, 일을 모두 제외하고** '며칠 전', ${isHiking ? "'최근 산행'" : "'최근 방문'"} 등으로만 표현하여 시점을 완전히 추상화하세요.
            6.  **이미지 플레이스홀더 배치 (절대 규칙)**: 제공된 사진 ${images.length}장이 모두 본문에 포함되어야 하며, 아래의 매칭 순서를 엄격히 준수하세요.
                - **입력 1번 사진**: 대표 이미지입니다. 본문 중간(서두 제외) 맥락상 가장 어울리는 위치에 '<!--IMAGE_PLACEHOLDER-->' 주석을 넣으세요.
                - **입력 N번 사진 (N >= 2)**: '<!--SUB_IMAGE_PLACEHOLDER_{N-1}-->' 주석을 해당 사진의 위치에 삽입하세요. 또한 subImagePrompts[N-2] 배열의 객체에 이 사진의 내용을 상세히 설명하는 prompt와 altText를 담으세요.
                - (예: 입력 2번 사진 -> <!--SUB_IMAGE_PLACEHOLDER_1--> -> subImagePrompts[0])
                - (예: 입력 3번 사진 -> <!--SUB_IMAGE_PLACEHOLDER_2--> -> subImagePrompts[1])
                - 모든 서브 이미지 플레이스홀더는 반드시 개별 단락 사이에 위치해야 하며, 사진의 실제 내용과 주변 텍스트의 설명이 완벽하게 일치해야 합니다. **절대로 사진의 순서를 바꾸지 마세요.**
                - 썸네일: **메타 설명 박스 바로 아래**에 '<!--THUMBNAIL_PLACEHOLDER-->' 주석을 배치하세요.

            ${instructions}

            ### 콘텐츠 작성 지침
            ${humanInstructions}
            ${additionalRequest ? `### 추가 요청사항\n${additionalRequest}` : ''}
            - **문체와 톤**: 전문가이면서도 친근하고 자연스러운 대화체 ("~이에요", "~해요")를 사용하세요. 1인칭 시점과 감정 표현을 적극 활용하세요.
            - **절대 주의**: '안녕하세요'와 같은 서두 인사와 현재 연도(${currentYear}년) 표현은 **절대** 포함하지 마세요. 바로 본론으로 들어갑니다.
        `;

        const imageParts = images.map(img => ({
            inlineData: {
                data: img.data,
                mimeType: img.mimeType
            }
        }));

    const contentResponse = await getAiClient().models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
            parts: [
                ...imageParts,
                { text: prompt }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonString = contentResponse.text;
    const parsedJson = cleanAndParseJson(jsonString);

    if (
        !parsedJson.blogPostHtml ||
        !parsedJson.supplementaryInfo ||
        !Array.isArray(parsedJson.supplementaryInfo.keywords) ||
        !parsedJson.supplementaryInfo.imagePrompt ||
        !parsedJson.supplementaryInfo.altText ||
        !Array.isArray(parsedJson.supplementaryInfo.seoTitles) ||
        !Array.isArray(parsedJson.supplementaryInfo.thumbnailTitles) ||
        !Array.isArray(parsedJson.supplementaryInfo.subImagePrompts) ||
        !parsedJson.socialMediaPosts
    ) {
        throw new Error("Received malformed JSON response from API for content generation.");
    }

    let imageBase64: string | null = images[0]?.data || null;
    const mainAltText = parsedJson.supplementaryInfo.altText || visitInfo.placeName;

    let subImages: { prompt: string; altText: string; base64: string | null }[] = [];
    const subImageData = parsedJson.supplementaryInfo.subImagePrompts || [];
    
    for (let i = 0; i < images.length - 1; i++) {
        const imageData = images[i + 1]?.data || null;
        const subInfo = subImageData[i];
        const altText = subInfo?.altText || `${visitInfo.placeName} 상세 사진 ${i + 1}`;

        subImages.push({
            prompt: subInfo?.prompt || '', 
            altText: altText,
            base64: imageData
        });
    }

    return {
        blogPostHtml: parsedJson.blogPostHtml,
        supplementaryInfo: parsedJson.supplementaryInfo,
        imageBase64: imageBase64,
        subImages: subImages,
        socialMediaPosts: parsedJson.socialMediaPosts,
    };

    } catch (error) {
        console.error("Error generating hot place blog post:", error);
        throw error;
    }
};

export const analyzeRealEstateImages = async (
    images: { data: string; mimeType: string }[],
    additionalRequest: string,
    realEstateInfo: RealEstateInfo,
    options: {
        shouldIncludeFAQ: boolean;
        shouldAddThumbnailText: boolean;
        thumbnailAspectRatio: '16:9' | '1:1';
        humanLikeWritingStyle: 'none' | 'A' | 'B';
    },
    selectedTheme?: ColorTheme
): Promise<GeneratedContent> => {
    try {
        const theme = selectedTheme || COLOR_THEMES[0];
        const themeColors = JSON.stringify(theme.colors);
        const currentDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
        const currentYear = new Date().getFullYear();

        let humanInstructions = '';
        if (options.humanLikeWritingStyle === 'A') {
            humanInstructions = `
            ### **[최우선 지시사항 - 문체와 톤]**
            ${HUMAN_LIKE_WRITING_INSTRUCTIONS_A}
            이 포스트는 부동산 현장을 직접 방문하고 분석한 수석 컨설턴트가 솔직하고 생생하게 써내려간 포스트처럼 느껴져야 합니다. 위의 'A형' 지침을 최우선으로 적용하세요.
            `;
        } else if (options.humanLikeWritingStyle === 'B') {
            humanInstructions = `
            ### **[최우선 지시사항 - 문체와 톤]**
            ${HUMAN_LIKE_WRITING_INSTRUCTIONS_B}
            이 포스트는 부동산 수석 분석가가 데이터와 입지 지형을 철저하게 해부한 전문가 보고서형 포스트처럼 논리적이고 입체적이어야 합니다. 위의 'B형' 지침을 최우선으로 적용하세요.
            `;
        }

        const isTaxCategory = realEstateInfo.category.includes('세금') || realEstateInfo.category.includes('세법');
        const isUrbanDevCategory = realEstateInfo.category.includes('도시개발');

        let personaTitle = "15년 경력의 '부동산 수석 컨설턴트 및 자산 관리 분석가'";
        let personaPromptIntro = "당신은 대한민국 최고의 부동산 전문 컨설턴트 및 투자 분석가입니다.";
        let coreAnalysis5Parts = `
                - **입지 및 교통망 분석** (역세권, 주요 도로, 대중교통 accessibility)
                - **개발 호재 및 미래 투자 가치** (GTX, 재개발, 기업 유치, 시세 차익 및 임대 수익률 전망)
                - **주변 슬세권 & 생활 인프라** (학군, 대형마트, 병원, 공원 등 생활 편의성)
                - **단지/평면/조감도 특장점 분석** (제공된 이미지 및 특화 설계 분석)
                - **투자 목적별 맞춤 조언** (실거주자 vs 시세차익 투자자 vs 임대 수익형 매수자별 전략)
        `;
        let mainRequirementAnalysis = "입지, 교통, 개발 호재, 인프라, 평면 구성 및 투자 가치를 체계적이고 세련되게 다루세요.";

                if (isTaxCategory) {
            personaTitle = "부동산 세무/세법 전문가이자 세무사 및 프롭테크 세무 수석 자문위원";
            personaPromptIntro = "당신은 취득세, 양도소득세, 종합부동산세 등 부동산 세무 지식 및 절세 전략을 전문적으로 다루는 대한민국 최고 수준의 세무사이자 부동산 전문 프롭테크 전문가입니다.";
            coreAnalysis5Parts = `
                - **핵심 세목별 과세 체계 및 세율 분석** (취득세, 양도소득세, 종합부동산세, 보유세 등)
                - **비과세 및 세금 감면 요건 심층 점검** (1세대 1주택 비과세 요건, 일시적 2주택 비과세, 세제 혜택 등)
                - **실전 절세 전략 및 보유/매도 타이밍** (명의 분산, 장기보유특별공제, 증여 vs 매매 등 절세 팁)
            `;
            mainRequirementAnalysis = "취득세, 양도세, 종부세 등 세목별 세율 구조 및 비과세 감면 조건과 실전 절세 팁을 명쾌하게 분석하세요.";
        } else if (isUrbanDevCategory) {
            personaTitle = "도시개발/재개발 정책 분석가이자 부동산 개발 수석 컨설턴트";
            personaPromptIntro = "당신은 신도시 개발, 도시정비사업, 재개발/재건축 정책 및 부동산 시장 호재를 깊이 있게 분석하는 도시개발 전문 자문위원입니다.";
            coreAnalysis5Parts = `
                - **도시개발/재개발 사업 개요 및 추진 단계** (지구지정, 조합설립, 사업시행인가, 관리처분, 착공/분양 등)
                - **핵심 인프라 및 교통망 호재 영향 평가** (직간접 수혜 단지, 시세차익 가능성, 미래 유동인구 지형)
                - **단계별 투자 전략 및 리스크 관리** (사업 단계별 착공/완공 타이밍, 유의점 및 미래 투자 가치 전망)
            `;
            mainRequirementAnalysis = "신도시 지정, 지구단위계획, 토지 보상, 광역 교통망(GTX 등) 호재와 도시개발 파급 효과 및 미래 투자 가치를 심도 있게 분석해 다루세요.";
        }

        const realEstateDetails = `
            [부동산/분양 물건 정보]
            - 물건명(현장명/주제): ${realEstateInfo.propertyName}
            - 카테고리: ${realEstateInfo.category}
            ${realEstateInfo.location ? `- 위치/지역: ${realEstateInfo.location}` : ''}
            ${realEstateInfo.visitDate ? `- 방문/분양일: ${realEstateInfo.visitDate} (중요: 본문에서 날짜 언급 시 년, 월만 표시)` : ''}
            ${realEstateInfo.investmentPurpose ? `- 투자 목적: ${realEstateInfo.investmentPurpose}` : ''}
            ${realEstateInfo.oneLineImpression ? `- 한 줄 핵심 인상: ${realEstateInfo.oneLineImpression}` : ''}
            ${realEstateInfo.detailedInfo ? `- 상세 정보(입지/호재/분양가/규제 등): ${realEstateInfo.detailedInfo}` : ''}
        `.trim();

        const sharedMarketingInstructions = buildSeoAeoGeoAndImageInstructions(
            images.length,
            'realestate',
            theme
        );

        const instructions = `
            ${sharedMarketingInstructions}

            ### 기본 설정
            1.  **최종 산출물**: 인라인 스타일이 적용된 HTML 코드(HEAD, BODY 태그 제외)와 부가 정보(키워드, 이미지 프롬프트, SEO 제목, 썸네일 제목), 그리고 소셜 미디어 포스트를 JSON 형식으로 제공합니다.
            2.  **분량**: 한글 기준 공백 포함 2800~3500자의 정밀하고 상세한 분량으로 작성합니다.
            3.  **전문가 페르소나**: 당신은 ${personaTitle}입니다. 신뢰감 넘치고 객관적이면서도 독자(예비 수험자/투자자/실거주자/납세자)의 마음을 사로잡는 문체를 사용하세요.
            4.  **분석 5대 핵심 파트 (필수 포함)**:
                ${coreAnalysis5Parts}
            5.  **코드 형식**: HTML 코드는 JSON 내에서 줄바꿈 이스케이프(\\n)를 사용해 가독성을 유지하며, 모든 HTML 속성에는 **반드시 홑따옴표(')만 사용**하세요.
            6.  **연도 및 시점**: 오늘은 **${currentDate}** 입니다. 연도(${currentYear}년) 서술 시 자연스럽게 표현하고 인사말은 생략하세요.

            ### 부가 정보 (JSON 필드)
            - **keywords**: 10개의 핵심 부동산/분양/세무/개발 SEO 키워드.
            - **imagePrompt**: 메인 대표 이미지용 영문 프롬프트 (건물 조감도, 지도, 세무자료, 도시개발 마스터플랜 등).
            - **altText**: 메인 이미지에 대한 한국어 alt 텍스트.
            - **seoTitles**: 5개의 클릭률 높은 부동산/세무/개발 SEO 제목.
            - **thumbnailTitles**: 3-5개의 직관적이고 강력한 썸네일 텍스트.
            - **subImagePrompts**: 제공된 이미지들 중 두 번째 이미지부터 순서대로 설명하는 영문 프롬프트와 한국어 alt 텍스트 배열.
        `;

        const prompt = `
            ${personaPromptIntro}
            제공된 ${images.length > 0 ? `${images.length}장의 사진(조감도, 지도, 자료, 현장 사진)과 ` : ''}아래 [부동산/분양 물건 정보]를 정밀 분석하여, 독자들에게 명쾌한 인사이트를 제공하는 고품격 전문 블로그 포스트를 작성하세요.

            ${realEstateDetails}

            ### 요구사항
            1.  **전문 분석**: ${mainRequirementAnalysis}
            2.  **컬러 테마**: '${theme.name}' 테마(${themeColors})의 인라인 스타일을 적용해 시각적 완성도를 극대화하세요.

            ${instructions}
            ${humanInstructions}
            ${additionalRequest ? `### 추가 요청사항\n${additionalRequest}` : ''}
        `;

        const imageParts = images.map(img => ({
            inlineData: {
                data: img.data,
                mimeType: img.mimeType
            }
        }));

        const contentResponse = await getAiClient().models.generateContent({
            model: "gemini-3.5-flash",
            contents: {
                parts: [
                    ...imageParts,
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonString = contentResponse.text;
        const parsedJson = cleanAndParseJson(jsonString);

        if (
            !parsedJson.blogPostHtml ||
            !parsedJson.supplementaryInfo ||
            !Array.isArray(parsedJson.supplementaryInfo.keywords) ||
            !parsedJson.supplementaryInfo.imagePrompt ||
            !parsedJson.supplementaryInfo.altText ||
            !Array.isArray(parsedJson.supplementaryInfo.seoTitles) ||
            !Array.isArray(parsedJson.supplementaryInfo.thumbnailTitles) ||
            !Array.isArray(parsedJson.supplementaryInfo.subImagePrompts) ||
            !parsedJson.socialMediaPosts
        ) {
            throw new Error("Received malformed JSON response from API for real estate content generation.");
        }

        let imageBase64: string | null = images[0]?.data || null;
        let subImages: { prompt: string; altText: string; base64: string | null }[] = [];
        const subImageData = parsedJson.supplementaryInfo.subImagePrompts || [];
        
        for (let i = 0; i < images.length - 1; i++) {
            const imageData = images[i + 1]?.data || null;
            const subInfo = subImageData[i];
            const altText = subInfo?.altText || `${realEstateInfo.propertyName} 상세 사진 ${i + 1}`;

            subImages.push({
                prompt: subInfo?.prompt || '', 
                altText: altText,
                base64: imageData
            });
        }

        return {
            blogPostHtml: parsedJson.blogPostHtml,
            supplementaryInfo: parsedJson.supplementaryInfo,
            imageBase64: imageBase64,
            subImages: subImages,
            socialMediaPosts: parsedJson.socialMediaPosts,
        };

    } catch (error) {
        console.error("Error generating real estate blog post:", error);
        throw error;
    }
};

export const standardizeHerbKeywordWithAi = async (userInput: string): Promise<string> => {
    if (!userInput || !userInput.trim()) return '';

    const input = userInput.trim();

    // Fast dictionary mapping for common Korean medicinal herb synonyms to KFDA standard herb names
    const HERB_SYNONYM_MAP: Record<string, string> = {
        '천오두': '천오',
        '오두': '천오',
        '초오': '천오',
        '부자': '천오',
        '천오': '천오',
        '칡': '갈근',
        '칡뿌리': '갈근',
        '갈근': '갈근',
        '도라지': '길경',
        '길경': '길경',
        '지리산 하수오': '하수오',
        '하수오': '하수오',
        '적하수오': '하수오',
        '백하수오': '하수오',
        '산삼': '인삼',
        '천종산삼': '인삼',
        '장뇌삼': '인삼',
        '산양삼': '인삼',
        '인삼': '인삼',
        '참당귀': '당귀',
        '참당귀 뿌리': '당귀',
        '당귀': '당귀',
        '뽕나무껍질': '상백피',
        '상백피': '상백피',
        '위령선': '위령선',
        '감초': '감초',
        '오미자': '오미자',
        '마': '산약',
        '마뿌리': '산약',
        '산약': '산약',
        '겨우살이': '곡기생',
        '구기자': '구기자',
        '황기': '황기',
        '복령': '복령'
    };

    if (HERB_SYNONYM_MAP[input]) {
        return HERB_SYNONYM_MAP[input];
    }

    const prompt = `
    당신은 대한민국 식약처(KFDA) 한약재 규격집, 대한약전, 동의보감 및 한의학 생약 분류 전문가입니다.
    
    사용자가 입력한 검색어/약초명: "${input}"
    
    [미션]
    이 검색어를 대한민국 식약처(KFDA) 공인 표준 단일 생약명(한약재 공식 품명) 딱 1 단어로 정제/번역하여 출력해 주세요.
    
    [정제 및 변환 규칙]
    1. 수식어(예: 지리산, 야생, 뿌리, 생, 10년근 등)와 괄호, 부연 설명, 특수문자를 모두 제거하세요.
    2. 일반명/방언/속명/유통 부위명을 식약처 공인 표준 생약명으로 정밀 매핑하세요.
       - "천오두", "오두", "초오", "부자" -> "천오"
       - "칡", "칡뿌리" -> "갈근"
       - "도라지" -> "길경"
       - "참당귀", "참당귀 뿌리" -> "당귀"
       - "지리산 야생 하수오", "적하수오", "백하수오" -> "하수오"
       - "천종산삼", "산삼", "장뇌삼", "산양삼" -> "인삼"
       - "뽕나무껍질" -> "상백피"
       - "마", "마뿌리" -> "산약"
       - "위령선 (사위질빵)" -> "위령선"
       - "감초" -> "감초"
       - "오미자" -> "오미자"
    3. 어떠한 부연 설명, 문장, 서론, 기호도 붙이지 말고 오직 '단일 표준 생약명 1개'만 반환해 주세요.
    `;

    try {
        const response = await getAiClient().models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                temperature: 0.1,
            },
        });
        const result = response.text.trim().replace(/['"]/g, '').replace(/`/g, '').split(/\s+/)[0];
        return result || input;
    } catch (error) {
        console.warn("Standardize Herb Keyword AI Error, fallback to raw input:", error);
        return input;
    }
};

export const generateSanYakBoGamBlogPost = async (
    images: { data: string; mimeType: string }[],
    additionalRequest: string,
    sanYakBoGamInfo: SanYakBoGamInfo,
    options: {
        shouldIncludeFAQ: boolean;
        shouldAddThumbnailText: boolean;
        thumbnailAspectRatio: '16:9' | '1:1';
        humanLikeWritingStyle: 'none' | 'A' | 'B';
    },
    selectedTheme?: ColorTheme
): Promise<GeneratedContent> => {
    try {
        const theme = selectedTheme || COLOR_THEMES[0];
        const themeColors = JSON.stringify(theme.colors);
        const currentDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
        const currentYear = new Date().getFullYear();

        let humanInstructions = '';
        if (options.humanLikeWritingStyle === 'A') {
            humanInstructions = `
            ### **[최우선 지시사항 - 문체와 톤: 부드러운 정보 전달형]**
            ${HUMAN_LIKE_WRITING_INSTRUCTIONS_A}
            이 포스트는 독자가 쉽게 이해할 수 있도록 친근하고 정중하며 부드러운 경어체(~합니다, ~습니다)로 정보를 전달해야 합니다.
            `;
        } else if (options.humanLikeWritingStyle === 'B') {
            humanInstructions = `
            ### **[최우선 지시사항 - 문체와 톤: 학술 및 팩트 브리핑형]**
            ${HUMAN_LIKE_WRITING_INSTRUCTIONS_B}
            이 포스트는 학술 및 본초학 분석 보고서 시각에서 약성과 효능, 복용 유의점을 체계적이고 객관적으로 명확하게 전달해야 합니다.
            `;
        } else {
            humanInstructions = `
            ### **[최우선 지시사항 - 문체와 톤: 객관적 전문 해설형]**
            이 포스트는 신뢰할 수 있는 본초학/한의학 전문 연구원의 객관적이고 신뢰감 있는 전문가 톤으로 작성해야 합니다.
            `;
        }

        const officialHerbData = sanYakBoGamInfo.officialHerbData;

        // 1. 출처(Source) 플래그 명확 판별 (isLocalDB, isPublicAPI, isNaverAPI)
        const isNaverSource = Boolean(
            officialHerbData?.isNaverData || 
            officialHerbData?.source?.includes('네이버') || 
            officialHerbData?.link
        );

        const isLocalDbSource = Boolean(
            officialHerbData?.isLocalDbData || 
            (!isNaverSource && officialHerbData?.source?.includes('슈퍼 로컬')) ||
            (!isNaverSource && officialHerbData?.source?.includes('산림청')) ||
            (!isNaverSource && officialHerbData?.source?.includes('한의약진흥원'))
        );

        const isPublicApiSource = Boolean(
            officialHerbData?.isPublicApiData || 
            (!isNaverSource && !isLocalDbSource && officialHerbData?.source?.includes('공공데이터포털')) ||
            (!isNaverSource && !isLocalDbSource && officialHerbData)
        );

        // 2. 동적 출처 표기 문구 생성
        let sourceNoticeLine = '';
        if (isNaverSource) {
            sourceNoticeLine = `본 포스팅의 약재 정보는 네이버 지식백과(${officialHerbData?.source || '검색된 출처 문헌'})를 기반으로 작성되었습니다.`;
        } else if (isLocalDbSource || isPublicApiSource) {
            sourceNoticeLine = `본 포스팅의 기본 약재 규격 및 생태 정보는 한국한의약진흥원 및 산림청의 공공데이터를 기반으로 작성되었습니다.`;
        } else {
            sourceNoticeLine = `본 포스팅은 일반 본초학 정보 및 AI 자체 전통 약초 지식을 참고하여 작성되었습니다.`;
        }

        let officialDataSection = '';
        if (officialHerbData) {
            if (isNaverSource) {
                officialDataSection = `
            ### [네이버 지식백과 약재 DB 정보 (3단계 Fallback 데이터)]
            - 약초명 / 표준 품명: ${officialHerbData.herbName}
            - 학명: ${officialHerbData.scientificName}
            - 성질 및 성상: ${officialHerbData.nature}
            - 독성 여부: ${officialHerbData.toxicity}
            - 주요 공식 효능: ${officialHerbData.mainEfficacy}
            - 섭취 주의사항: ${officialHerbData.caution}
            - 데이터 출처: ${officialHerbData.source} (네이버 지식백과)
            ${officialHerbData.link ? `- 백과사전 원문 링크: ${officialHerbData.link}` : ''}

            ### **[출처 활용 지침 - 네이버 지식백과]**
            1. 위 [네이버 지식백과 DB 정보]를 바탕으로 본초학 학술 분석 리포트 형식의 6단계 본문 템플릿에 맞추어 약재 정보를 작성하세요.
            2. 주입된 백과사전 팩트에 근거하여 작성하되 무분별한 의학적 효능 과장(할루시네이션)을 배제하세요.
                `.trim();
            } else {
                officialDataSection = `
            ### [국가 공식 한약재 & 생태 하이브리드 DB 정보 (팩트 검증 데이터)]
            - 약초명 / 표준 품명: ${officialHerbData.herbName}
            - 학명: ${officialHerbData.scientificName}
            ${officialHerbData.originSpecies ? `- 기원종 / 원물 생약명: ${officialHerbData.originSpecies}` : ''}
            ${officialHerbData.usedPart ? `- 약용 부위 / 사용 부위: ${officialHerbData.usedPart}` : ''}
            - 성질 및 성상: ${officialHerbData.nature}
            - 독성 여부: ${officialHerbData.toxicity}
            - 주요 공식 효능: ${officialHerbData.mainEfficacy}
            ${officialHerbData.ecologyDescription ? `- 산림청 생태적 특징 설명: ${officialHerbData.ecologyDescription}` : ''}
            ${officialHerbData.distributionRegion ? `- 산림청 자생지 및 분포 지역: ${officialHerbData.distributionRegion}` : ''}
            ${officialHerbData.dosageMethod ? `- 산림청 안전 복용법 / 제형 안내: ${officialHerbData.dosageMethod}` : ''}
            ${officialHerbData.prescription ? `- 대표 관련 처방: ${officialHerbData.prescription}` : ''}
            ${officialHerbData.contraindication ? `- 복용 금기 사항: ${officialHerbData.contraindication}` : ''}
            ${officialHerbData.literature ? `- 문헌 근거(동의보감/본초강목 등): ${officialHerbData.literature}` : ''}
            - 섭취 주의사항: ${officialHerbData.caution}
            - 데이터 출처: ${officialHerbData.source}

            ### **[출처 활용 지침 - 공공데이터 / 로컬 DB]**
            1. 위 [국가 공식 한약재 & 생태 DB 정보]에 명시된 생태적 특징, 자생지 분포, 기원종, 약용부위, 안전 복용법, 주요 공식 효능 및 문헌 근거를 바탕으로 6단계 본문 템플릿에 맞추어 약재 정보를 작성하세요.
            2. 주입된 팩트에 근거하여 작성하되 무분별한 의학적 효능 과장(할루시네이션)을 배제하세요.
                `.trim();
            }
        } else {
            officialDataSection = `
            ### [국가 공공데이터 검색 미검출 안내 및 AI 자체 전문 지식 작성 모드]
            - 공공 API DB 및 네이버 지식백과에서 규격 데이터가 검출되지 않은 경우입니다.
            - AI 자체 한의학/본초학 및 전통 약초학 전문 지식을 기반으로 6단계 본문 템플릿에 맞추어 완결성 있게 작성하세요.
            `.trim();
        }

        const sanYakBoGamDetails = `
            ### [산약보감 약초/산삼 및 채취 정보]
            - 약초명 / 산삼 종류(필수): ${sanYakBoGamInfo.herbName}
            ${sanYakBoGamInfo.mountainLocation ? `- 자생지 / 지역: ${sanYakBoGamInfo.mountainLocation}` : ''}
            ${sanYakBoGamInfo.harvestTime ? `- 채취 시기: ${sanYakBoGamInfo.harvestTime}` : ''}
            ${sanYakBoGamInfo.expectedEfficacy ? `- 주요 기대 효능: ${sanYakBoGamInfo.expectedEfficacy}` : ''}
            ${sanYakBoGamInfo.oneLineImpression ? `- 약재 핵심 한 줄 요약: ${sanYakBoGamInfo.oneLineImpression}` : ''}
            ${sanYakBoGamInfo.detailedInfo ? `- 상세 특징 및 추가 정보: ${sanYakBoGamInfo.detailedInfo}` : ''}
            ${officialDataSection}
        `.trim();

        const sharedMarketingInstructions = buildSeoAeoGeoAndImageInstructions(
            images.length,
            'sanyakbogam',
            theme
        );

        const instructions = `
            ### 핵심 역할 및 가이드라인 (필수 적용)
            당신은 신뢰할 수 있는 본초학 및 전통 약초 전문 분석가입니다. 사용자가 올린 약초 사진과 정보를 바탕으로, 식물학적 및 한의학적 전문 지식, 외형 미학, 검증된 효능, 섭취 주의사항을 객관적이고 신뢰감 있는 전문가 어조로 작성하는 최적의 '본초학 학술 분석 리포트' 블로그 포스트를 완성하세요.

            ${sharedMarketingInstructions}

            ### **[본문 6단계 본초학 학술 분석 리포트 (GEO/SEO 강화 - 1,500자 이상)]**
            Below header sections must be fully written in order with rich details:
            - **1) 개요 및 자생적 환경**: 표준 품명, 학명, 식물학적/한의학적 주요 특징, 자생 환경. 산림청 및 공공데이터 수치는 기계 판독(GEO)이 용이하도록 불렛 포인트('<ul>/<li>') 또는 표('<table>')로 구조화.
            - **2) 외형적 미학 및 형태학적 분석**: 뇌두, 뿌리, 줄기, 잎, 색상, 결, 향 등 외형적 식별 포인트.
            - **3) 약성 및 효능**: 성질(온/평/한), 맛, 독성, 원기 회복, 면역력 등 검증 효능. '동의보감', '본초강목' 인용 시 문단 내에 묻히지 않도록 인용구 블록('<blockquote>')으로 시각적 구조화하며 **(출처: 동의보감)** 형식 명시.
            - **4) 제형 및 복용 방법**: 탕제(달여 먹는 법), 환제, 차, 권장 용량 가이드.
            - **5) 섭취 시 필수 주의사항 및 금기**: 체질별 유의점, 명현현상, 복용 금기 대상 및 부작용 경고.
            - **6) 핵심 요약 표**: 본문 핵심을 한눈에 정리한 HTML 표('<table>').

            ### **[기본 작성 기준 및 규칙]**
            1. **최종 산출물**: 인라인 스타일이 적용된 HTML 코드(HEAD, BODY 태그 제외)와 부가 정보를 JSON 형식으로 제공합니다.
            2. **분량**: 한글 기준 최소 1,500자 이상 (권장 2,000~3,000자)의 풍성한 전문가 브리핑 분량.
            3. **코드 형식**: HTML 코드는 JSON 내에서 줄바꿈 이스케이프(\\n)를 사용하며, 모든 HTML 속성에는 반드시 홑따옴표(')만 사용하세요.
            4. **연도 및 시점**: 오늘은 ${currentDate} 입니다. 인사말은 생략하고 바로 본론으로 들어가며, 날짜 표현 시 연도(${currentYear}년) 언급은 생략하세요.
            5. **금지 사항**: '나', '내', '어르신' 등 1인칭 및 주관적 페르소나 표현 금지, '에헤라' 등 감탄사 금지. 모든 문장은 '~합니다', '~습니다'의 깔끔한 경어체로 작성.
            6. **출처 표기 위치**: 위의 모든 섹션(SEO 메타, AEO 스니펫, 6단계 본문, 요약 표, FAQ)을 완벽히 생성하세요. 하단 통합 출처 표기 구문은 시스템에서 포스팅 맨 마지막에 자동으로 결합됩니다.
            
            ### 부가 정보 (JSON 필드)
            - **keywords**: 10개의 핵심 약초/한방/건강 SEO 키워드.
            - **imagePrompt**: 메인 대표 이미지용 영문 프롬프트 (고화질 한국 약용식물, 자연 속 이끼와 약재 등).
            - **altText**: 메인 이미지에 대한 한국어 alt 텍스트.
            - **seoTitles**: 5개의 클릭률 높은 약초/한방 SEO 블로그 제목.
            - **thumbnailTitles**: 3-5개의 직관적이고 강력한 썸네일 텍스트.
            - **subImagePrompts**: 제공된 이미지들 중 두 번째 이미지부터 순서대로 설명하는 영문 프롬프트와 한국어 alt 텍스트 배열.
        `;

        const prompt = `
            당신은 신뢰할 수 있는 본초학 및 약초 전문 해설가입니다. 사용자가 입력한 약초 정보와 이미지를 바탕으로 정중하고 객관적인 전문가 톤으로 최적의 블로그 포스트를 작성해 주세요.

            [사용자 제공 정보]
            ${sanYakBoGamDetails}

            ### 요구사항
            1. **전문가 톤앤매너**: 정중하고 깔끔한 경어체(~합니다, ~습니다)를 사용하며 사담, 감탄사, 1인칭 표현('나', '내', '어르신' 등)을 완전히 배제하세요.
            2. **컬러 테마**: '${theme.name}' 테마(${themeColors})의 인라인 스타일을 적용하세요.

            ${instructions}
            ${humanInstructions}
            ${additionalRequest ? `### 추가 요청사항\n${additionalRequest}` : ''}
        `;

        const imageParts = images.map(img => ({
            inlineData: {
                data: img.data,
                mimeType: img.mimeType
            }
        }));

        const contentResponse = await getAiClient().models.generateContent({
            model: "gemini-3.5-flash",
            contents: {
                parts: [
                    ...imageParts,
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonString = contentResponse.text;
        const parsedJson = cleanAndParseJson(jsonString);

        if (
            !parsedJson.blogPostHtml ||
            !parsedJson.supplementaryInfo ||
            !Array.isArray(parsedJson.supplementaryInfo.keywords) ||
            !parsedJson.supplementaryInfo.imagePrompt ||
            !parsedJson.supplementaryInfo.altText ||
            !Array.isArray(parsedJson.supplementaryInfo.seoTitles) ||
            !Array.isArray(parsedJson.supplementaryInfo.thumbnailTitles) ||
            !Array.isArray(parsedJson.supplementaryInfo.subImagePrompts) ||
            !parsedJson.socialMediaPosts
        ) {
            throw new Error("Received malformed JSON response from API for SanYakBoGam content generation.");
        }

        let imageBase64: string | null = images[0]?.data || null;
        let subImages: { prompt: string; altText: string; base64: string | null }[] = [];
        const subImageData = parsedJson.supplementaryInfo.subImagePrompts || [];
        
        for (let i = 0; i < images.length - 1; i++) {
            const imageData = images[i + 1]?.data || null;
            const subInfo = subImageData[i];
            const altText = subInfo?.altText || `${sanYakBoGamInfo.herbName} 상세 사진 ${i + 1}`;

            subImages.push({
                prompt: subInfo?.prompt || '', 
                altText: altText,
                base64: imageData
            });
        }

        let finalBlogPostHtml = parsedJson.blogPostHtml;

        const integratedSourceNoticeHtml = `
<div style='margin-top: 40px; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 13px; color: #1e293b; line-height: 1.8;'>
  <p style='font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 10px; margin-top: 0;'><b>[데이터 출처 및 기준]</b></p>
  <p style='font-weight: 700; margin-bottom: 6px; margin-top: 0;'><b>${sourceNoticeLine}</b></p>
  <p style='font-weight: 700; margin: 0;'><b>본문에 인용된 전통 한의학적 효능은 저작권이 만료된 공유저작물인 동의보감 및 본초강목의 기록을 참고하였습니다.</b></p>
</div>`;

        if (finalBlogPostHtml.includes('[데이터 출처 및 기준]')) {
            finalBlogPostHtml = finalBlogPostHtml.replace(
                /<div[^>]*>[\s\S]*?\[데이터 출처 및 기준\][\s\S]*?<\/div>/gi,
                integratedSourceNoticeHtml.trim()
            );
        } else {
            finalBlogPostHtml += `\n${integratedSourceNoticeHtml}`;
        }

        return {
            blogPostHtml: finalBlogPostHtml,
            supplementaryInfo: parsedJson.supplementaryInfo,
            imageBase64: imageBase64,
            subImages: subImages,
            socialMediaPosts: parsedJson.socialMediaPosts,
        };

    } catch (error) {
        console.error("Error generating SanYakBoGam blog post:", error);
        throw error;
    }
};
