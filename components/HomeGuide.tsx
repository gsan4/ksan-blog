import React from 'react';

interface HomeGuideProps {
  onSelectTab?: (tab: 'realEstate' | 'generator' | 'hotPlace' | 'keywordFighter' | 'shortcuts') => void;
  onOpenSettings?: () => void;
}

export const HomeGuide: React.FC<HomeGuideProps> = ({ onSelectTab, onOpenSettings }) => {
  return (
    <div className="space-y-10 py-2">
      {/* 📢 공지사항 Section (Notion Callout Box Style) */}
      <section className="bg-neutral-50/80 border border-neutral-200/80 rounded-2xl p-6 sm:p-7 shadow-2xs">
        <div className="flex items-center space-x-2.5 mb-4">
          <span className="text-xl">📢</span>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">공지사항 & 최신 소식</h3>
          <span className="text-[10px] font-semibold bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full">
            UPDATED
          </span>
        </div>
        
        <div className="space-y-3.5 text-sm text-neutral-700 leading-relaxed">
          <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-neutral-100 shadow-2xs">
            <span className="text-base shrink-0 mt-0.5">🚀</span>
            <div>
              <div className="font-semibold text-neutral-900 flex items-center space-x-2">
                <span>부동산약보감 Blog Ver.1 오픈을 환영합니다</span>
                <span className="text-[10px] text-neutral-400 font-mono">2026.08</span>
              </div>
              <p className="text-neutral-600 text-xs mt-1">
                주제 아이디어 발굴부터 키워드 경쟁력 분석, 멀티모달 사진 포스트 생성까지 블로그 운영에 필요한 전 과정을 통합 제공합니다.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-neutral-100 shadow-2xs">
            <span className="text-base shrink-0 mt-0.5">⚡</span>
            <div>
              <div className="font-semibold text-neutral-900 flex items-center space-x-2">
                <span>Gemini 2.5 Flash & 멀티모달 가속 적용</span>
              </div>
              <p className="text-neutral-600 text-xs mt-1">
                맛집/부동산 멀티 사진 분석 및 AI 대표/서브 이미지 생성을 1분 이내에 속도감 있게 처리합니다.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-neutral-100 shadow-2xs">
            <span className="text-base shrink-0 mt-0.5">🔑</span>
            <div>
              <div className="font-semibold text-neutral-900 flex items-center space-x-2">
                <span>네이버 API 연동으로 '상위 블로그 분석' 및 '실시간 뉴스' 활성화</span>
              </div>
              <p className="text-neutral-600 text-xs mt-1">
                상단 <button onClick={onOpenSettings} className="underline text-neutral-800 font-medium cursor-pointer hover:text-black">⚙️ 설정</button> 메뉴에서 네이버 Client ID와 Secret을 입력하면 상위 블로그 1위 공략법 및 뉴스 전략 키워드를 실시간 분석할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 V2의 4대 강점 Grid */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-neutral-200 pb-3">
          <span className="text-lg">✨</span>
          <h3 className="text-base font-bold text-neutral-900">부동산약보감 Blog 핵심 주요 기능</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-2 hover:border-neutral-400 transition-colors">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">📸</span>
              <h4 className="font-bold text-neutral-900 text-sm">멀티모달 핫플 & 부동산 분석기</h4>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              현장 사진 여러 장을 업로드하면 AI가 사진 속 분위기와 정보를 파악하여 실제 다녀온 듯 자연스러운 리뷰 및 분양 포스트를 작성합니다.
            </p>
          </div>

          <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-2 hover:border-neutral-400 transition-colors">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">⚔️</span>
              <h4 className="font-bold text-neutral-900 text-sm">키워드 파이터 PRO</h4>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Google/Naver 자동완성, 키워드 경쟁력 점수, 상위 블로그 1위 공략법, SERP 갭 분석을 실시간으로 수행하여 상위 노출 전략을 제시합니다.
            </p>
          </div>

          <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-2 hover:border-neutral-400 transition-colors">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">💡</span>
              <h4 className="font-bold text-neutral-900 text-sm">인터랙티브 대화형 요소 생성</h4>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              주제에 맞춰 독자가 참여할 수 있는 계산기, 자가진단 퀴즈 등의 대화형 HTML 코드가 본문에 포함되어 체류 시간을 극대화합니다.
            </p>
          </div>

          <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-2 hover:border-neutral-400 transition-colors">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">✍️</span>
              <h4 className="font-bold text-neutral-900 text-sm">인간적 글쓰기 스타일 (GEMS V3)</h4>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              AI 특유의 기계적인 어투를 배제하고 자연스러운 호흡의 블로그형 어투(유형 A: 리듬감/공감, 유형 B: 전문성/정보제공)를 지원합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 🧭 메인 메뉴 및 빠른 실행 바로가기 */}
      {onSelectTab && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-neutral-200 pb-3">
            <span className="text-lg">🧭</span>
            <h3 className="text-base font-bold text-neutral-900">원하는 작업을 선택해 시작하세요</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onSelectTab('realEstate')}
              className="p-4 bg-neutral-50 hover:bg-neutral-900 hover:text-white transition-all rounded-xl border border-neutral-200 text-left group cursor-pointer"
            >
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🏢</div>
              <div className="font-bold text-sm">부동산 / 분양</div>
              <div className="text-[11px] text-neutral-500 group-hover:text-neutral-300 mt-0.5">매물 사진 AI 분석 & 포스트</div>
            </button>

            <button
              onClick={() => onSelectTab('generator')}
              className="p-4 bg-neutral-50 hover:bg-neutral-900 hover:text-white transition-all rounded-xl border border-neutral-200 text-left group cursor-pointer"
            >
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">💡</div>
              <div className="font-bold text-sm">주제 아이디어</div>
              <div className="text-[11px] text-neutral-500 group-hover:text-neutral-300 mt-0.5">E-E-A-T & 롱테일 키워드</div>
            </button>

            <button
              onClick={() => onSelectTab('hotPlace')}
              className="p-4 bg-neutral-50 hover:bg-neutral-900 hover:text-white transition-all rounded-xl border border-neutral-200 text-left group cursor-pointer"
            >
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">☕</div>
              <div className="font-bold text-sm">맛집 / 카페 / 여행</div>
              <div className="text-[11px] text-neutral-500 group-hover:text-neutral-300 mt-0.5">현장 사진 후기 자동 생성</div>
            </button>

            <button
              onClick={() => onSelectTab('keywordFighter')}
              className="p-4 bg-neutral-50 hover:bg-neutral-900 hover:text-white transition-all rounded-xl border border-neutral-200 text-left group cursor-pointer"
            >
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">⚔️</div>
              <div className="font-bold text-sm">키워드 파이터 PRO</div>
              <div className="text-[11px] text-neutral-500 group-hover:text-neutral-300 mt-0.5">경쟁도 & SERP 실시간 분석</div>
            </button>

            <button
              onClick={() => onSelectTab('shortcuts')}
              className="p-4 bg-neutral-50 hover:bg-neutral-900 hover:text-white transition-all rounded-xl border border-neutral-200 text-left group cursor-pointer"
            >
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🔗</div>
              <div className="font-bold text-sm">트렌드 바로가기</div>
              <div className="text-[11px] text-neutral-500 group-hover:text-neutral-300 mt-0.5">실시간 검색어 & 데이터랩</div>
            </button>

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-4 bg-neutral-50 hover:bg-neutral-900 hover:text-white transition-all rounded-xl border border-neutral-200 text-left group cursor-pointer"
              >
                <div className="text-xl mb-1 group-hover:scale-110 transition-transform">⚙️</div>
                <div className="font-bold text-sm">API 키 설정</div>
                <div className="text-[11px] text-neutral-500 group-hover:text-neutral-300 mt-0.5">Naver API 연결 관리</div>
              </button>
            )}
          </div>
        </section>
      )}

      {/* 📘 단계별 이용 안내 (Notion List Style) */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center space-x-2 border-b border-neutral-200 pb-3">
          <span className="text-lg">📘</span>
          <h3 className="text-base font-bold text-neutral-900">사용법 상세 가이드</h3>
        </div>

        <div className="space-y-4 text-sm text-neutral-700 leading-relaxed">
          {/* Step 1 */}
          <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-1.5">
            <div className="font-bold text-neutral-900 flex items-center space-x-2">
              <span className="text-xs font-mono bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded">STEP 1</span>
              <span>주제 선정 또는 사진 준비</span>
            </div>
            <p className="text-xs text-neutral-600 pl-1">
              '주제 아이디어 얻기'에서 E-E-A-T/에버그린/롱테일 키워드를 추천받거나, '맛집/부동산' 메뉴에서 리뷰할 현장 사진을 업로드하세요.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-1.5">
            <div className="font-bold text-neutral-900 flex items-center space-x-2">
              <span className="text-xs font-mono bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded">STEP 2</span>
              <span>옵션 설정 (컬러 테마, 썸네일, 인터랙티브 요소)</span>
            </div>
            <p className="text-xs text-neutral-600 pl-1">
              블로그의 컬러 테마(7종), 썸네일 제목 및 폰트, 대화형 퀴즈/계산기 포함 여부, 글쓰기 스타일(A/B)을 취향에 맞게 조정하세요.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-1.5">
            <div className="font-bold text-neutral-900 flex items-center space-x-2">
              <span className="text-xs font-mono bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded">STEP 3</span>
              <span>AI 포스트 생성 및 후처리 피드백</span>
            </div>
            <p className="text-xs text-neutral-600 pl-1">
              '블로그 포스트 생성하기'를 실행하면 2,500자 이상의 본문 HTML, SEO 키워드, 소셜 포스트 문구, AI 대표 이미지가 생성됩니다. 마음에 들지 않으면 '피드백 및 재작성' 기능을 통해 본문만 선택적으로 재작성할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 💡 자주 묻는 질문 (FAQ) */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center space-x-2 border-b border-neutral-200 pb-3">
          <span className="text-lg">❓</span>
          <h3 className="text-base font-bold text-neutral-900">자주 묻는 질문 (FAQ)</h3>
        </div>

        <div className="space-y-3">
          <details className="group bg-neutral-50/60 border border-neutral-200 rounded-xl p-4 [&_summary::-webkit-details-marker]:none">
            <summary className="flex items-center justify-between font-semibold text-neutral-900 cursor-pointer text-sm">
              <span>Q. Naver API Key는 필수인가요?</span>
              <span className="transition group-open:rotate-180 text-neutral-400">▼</span>
            </summary>
            <p className="mt-3 text-xs text-neutral-600 leading-relaxed border-t border-neutral-200/60 pt-2.5">
              아닙니다. Gemini AI 기반의 포스트 생성, 부동산/핫플 사진 분석, 키워드 경쟁력 도구는 Naver API 없이도 바로 사용 가능합니다. 다만 네이버 실시간 뉴스 검색 및 상위 블로그 패턴 분석 기능에는 Naver API Key가 필요합니다.
            </p>
          </details>

          <details className="group bg-neutral-50/60 border border-neutral-200 rounded-xl p-4 [&_summary::-webkit-details-marker]:none">
            <summary className="flex items-center justify-between font-semibold text-neutral-900 cursor-pointer text-sm">
              <span>Q. 생성된 포스트는 네이버/티스토리 등에 바로 붙여넣을 수 있나요?</span>
              <span className="transition group-open:rotate-180 text-neutral-400">▼</span>
            </summary>
            <p className="mt-3 text-xs text-neutral-600 leading-relaxed border-t border-neutral-200/60 pt-2.5">
              네! 결과창의 'HTML 복사' 버튼을 눌러 블로그 에디터의 HTML 편집 모드에 붙여넣으시면 인라인 스타일이 깔끔하게 반영된 표, 강조 박스, 카드 등의 포맷이 그대로 들어갑니다.
            </p>
          </details>

          <details className="group bg-neutral-50/60 border border-neutral-200 rounded-xl p-4 [&_summary::-webkit-details-marker]:none">
            <summary className="flex items-center justify-between font-semibold text-neutral-900 cursor-pointer text-sm">
              <span>Q. 포스트 생성 시 소요 시간이 얼마나 걸리나요?</span>
              <span className="transition group-open:rotate-180 text-neutral-400">▼</span>
            </summary>
            <p className="mt-3 text-xs text-neutral-600 leading-relaxed border-t border-neutral-200/60 pt-2.5">
              대표/서브 이미지 및 인터랙티브 요소 합성에 따라 평균 30초 ~ 1분 정도 소요됩니다.
            </p>
          </details>
        </div>
      </section>

      {/* Footer Info */}
      <div className="pt-6 text-center text-xs text-neutral-400 border-t border-neutral-100">
        Ksan 블로그
      </div>
    </div>
  );
};
