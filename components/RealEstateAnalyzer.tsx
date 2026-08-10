import React, { useState, useRef } from 'react';

import { COLOR_THEMES } from '../constants';
import { ColorTheme, RealEstateInfo } from '../types';

interface RealEstateAnalyzerProps {
  onAnalyze: (
    images: { data: string; mimeType: string }[], 
    additionalRequest: string, 
    realEstateInfo: RealEstateInfo,
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

const THUMBNAIL_COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#000080',
  '#FFC0CB', '#A52A2A', '#808080', '#D2B48C', '#E6E6FA', '#008080'
];

export const RealEstateAnalyzer: React.FC<RealEstateAnalyzerProps> = ({ 
  onAnalyze, 
  isAnalyzing, 
  selectedTheme, 
  onThemeChange, 
  thumbnailSettings 
}) => {
  const [selectedImages, setSelectedImages] = useState<{ file: File; preview: string }[]>([]);
  const [additionalRequest, setAdditionalRequest] = useState('');
  const [realEstateInfo, setRealEstateInfo] = useState<RealEstateInfo>({
    propertyName: '',
    category: '아파트',
    location: '',
    visitDate: '',
    investmentPurpose: '',
    oneLineImpression: '',
    detailedInfo: ''
  });
  
  // Advanced Options States
  const [shouldIncludeFAQ, setShouldIncludeFAQ] = useState(true);
  const [shouldAddThumbnailText, setShouldAddThumbnailText] = useState(false);
  const [thumbnailAspectRatio, setThumbnailAspectRatio] = useState<'16:9' | '1:1'>('16:9');
  const [humanLikeWritingStyle, setHumanLikeWritingStyle] = useState<'none' | 'A' | 'B'>('none');

  // Drag & Drop State
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInfoChange = (field: keyof RealEstateInfo, value: string) => {
    setRealEstateInfo(prev => ({ ...prev, [field]: value }));
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
    if (!realEstateInfo.propertyName.trim()) {
      alert("물건명(현장명)을 입력해주세요.");
      return;
    }

    let imagesData: { data: string; mimeType: string }[] = [];
    if (selectedImages.length > 0) {
      imagesData = await Promise.all(
        selectedImages.map(async img => ({
          data: await readFileAsBase64(img.file),
          mimeType: img.file.type
        }))
      );
    }

    onAnalyze(imagesData, additionalRequest, realEstateInfo, {
      shouldIncludeFAQ,
      shouldAddThumbnailText,
      thumbnailAspectRatio,
      humanLikeWritingStyle
    });
  };

  return (
    <div className="bg-transparent p-0">
      <div className="mb-6">
        <p className="text-slate-600">
          조감도, 평면도, 현장 사진을 업로드하고 상세 분양/물건 정보를 입력하면 AI 부동산 전문 분석가가 투자 가치, 입지, 교통, 슬세권 인프라를 분석해 전문 블로그 포스트를 작성해 드립니다.
        </p>
        <p className="text-teal-600 text-sm mt-1 font-medium">💡 화살표 버튼(⬅️ ➡️)을 이용해 이미지 순서를 변경할 수 있습니다. 첫 번째(맨 왼쪽) 이미지가 대표 이미지(썸네일)가 됩니다. (이미지 없이도 정보만으로 작성 가능)</p>
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
                <span className="text-3xl block mb-1">🏢</span>
                <p className="text-neutral-900 font-bold text-base">여기에 이미지 파일을 놓으세요!</p>
              </div>
            </div>
          )}
          
          {selectedImages.length === 0 ? (
            <div className="text-center">
              <div className="text-3xl mb-2">🏢</div>
              <p className="text-neutral-800 font-medium text-sm">조감도 / 평면도 / 현장 사진 드래그 & 클릭 업로드</p>
              <p className="text-neutral-400 text-xs mt-1">여러 장의 이미지를 한 번에 선택할 수 있습니다 (선택사항).</p>
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
                        ? 'border-teal-500 ring-2 ring-teal-400 shadow-md shadow-teal-500/20' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <img 
                      src={img.preview} 
                      alt={`preview ${index}`} 
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="w-full h-full object-cover select-none pointer-events-none" 
                    />
                    
                    {/* Representative Badge for Index 0 */}
                    {index === 0 && (
                      <div className="absolute top-0 left-0 bg-teal-600 text-white text-[10px] px-2 py-0.5 font-bold rounded-br-md shadow-sm z-20 flex items-center gap-1">
                        <span>👑</span>
                        <span>대표 이미지</span>
                      </div>
                    )}

                    {/* Delete button (Top Right) */}
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                      className="absolute top-1 right-1 bg-rose-500/90 hover:bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md"
                      title="이미지 삭제"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Left / Right Arrow buttons (Hover controls) */}
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto">
                      {index > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveImageLeft(index); }}
                          className="p-1.5 rounded-full bg-slate-900/85 text-white hover:bg-teal-600 hover:scale-110 transition-all shadow-md cursor-pointer flex items-center justify-center"
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
                          className="p-1.5 rounded-full bg-slate-900/85 text-white hover:bg-teal-600 hover:scale-110 transition-all shadow-md cursor-pointer flex items-center justify-center"
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
                  className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-teal-500 hover:bg-teal-50/50 transition-all text-slate-400 hover:text-teal-600 bg-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] font-medium font-sans">이미지 추가</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real Estate Information Form */}
        <div className="space-y-8 py-2">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-xl font-bold text-neutral-800 flex items-center tracking-tight">
              <span className="mr-2">📋</span> 부동산/분양 현장 정보
            </h3>
            <span className="text-xs text-neutral-400">* 필수 입력</span>
          </div>

          {/* Row 1: Property Name and Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">물건명(현장명) *</label>
              <input
                type="text"
                value={realEstateInfo.propertyName}
                onChange={(e) => handleInfoChange('propertyName', e.target.value)}
                placeholder={
                  realEstateInfo.category === '세금/세법'
                    ? "예: 2026년 다주택자 양도세 중과 한시적 배제 / 취득세 감면 조건 분석"
                    : realEstateInfo.category === '도시개발사업'
                    ? "예: 용인 남사 반도체 클러스터 도시개발구역 / 창릉 3기 신도시 지구단위계획"
                    : "예: 힐스테이트 둔산 리버뷰 / 강남 르피에드"
                }
                className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base placeholder-neutral-400"
              />
            </div>
            <div>
              <label className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">카테고리</label>
              <select
                value={realEstateInfo.category}
                onChange={(e) => handleInfoChange('category', e.target.value)}
                className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base"
              >
                <option value="아파트">아파트</option>
                <option value="민간임대아파트">민간임대아파트</option>
                <option value="오피스텔/도시형">오피스텔 / 도시형생활주택</option>
                <option value="지식산업센터/오피스">지식산업센터 / 오피스</option>
                <option value="상가/근린생활시설">상가 / 근린생활시설</option>
                <option value="토지/임야">토지 / 임야</option>
                <option value="빌라/단독/전원주택">빌라 / 단독 / 전원주택</option>
                <option value="세금/세법">세금/세법</option>
                <option value="도시개발사업">도시개발사업</option>
                <option value="재개발/재건축">재개발 / 재건축</option>
                <option value="기타">기타 부동산</option>
              </select>
            </div>
          </div>

          {/* Row 2: Location, Visit Date, Investment Purpose */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">위치/지역 (선택)</label>
              <input
                type="text"
                value={realEstateInfo.location}
                onChange={(e) => handleInfoChange('location', e.target.value)}
                placeholder="예: 서울시 서초구 반포동"
                className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base placeholder-neutral-400"
              />
            </div>
            <div>
              <label className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">방문/분양일 (선택)</label>
              <input
                type="date"
                value={realEstateInfo.visitDate}
                onChange={(e) => handleInfoChange('visitDate', e.target.value)}
                className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base"
              />
            </div>
            <div>
              <label className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">투자 목적 (선택)</label>
              <input
                type="text"
                value={realEstateInfo.investmentPurpose}
                onChange={(e) => handleInfoChange('investmentPurpose', e.target.value)}
                placeholder="예: 실거주 / 시세차익 투자 / 월세 임대수익"
                className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base placeholder-neutral-400"
              />
            </div>
          </div>

          {/* Row 3: One Line Impression */}
          <div>
            <label className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">한 줄 핵심 요약/인상 (선택)</label>
            <input
              type="text"
              value={realEstateInfo.oneLineImpression}
              onChange={(e) => handleInfoChange('oneLineImpression', e.target.value)}
              placeholder="예: 초역세권 프리미엄과 GTX 호재를 품은 신규 분양 단지"
              className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base placeholder-neutral-400"
            />
          </div>

          {/* Row 4: Detailed Info */}
          <div>
            <label className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">상세 정보 (입지, 호재, 분양가 등) (선택)</label>
            <textarea
              value={realEstateInfo.detailedInfo}
              onChange={(e) => handleInfoChange('detailedInfo', e.target.value)}
              placeholder="분양가, 전용면적, 지하철역 거리, GTX/고속도로 개발 호재, 주변 학군·마트·공원 인프라, 시공사 브랜드 등 본문에 포함할 상세 정보를 자유롭게 적어주세요."
              className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors h-24 resize-none text-base placeholder-neutral-400"
            />
            <p className="text-[11px] text-neutral-400 mt-1.5">
              * 입력하신 입지 및 세부 정보는 AI 분석가가 전문적인 분석 보고서 형태로 본문에 구성합니다.
            </p>
          </div>
        </div>

        {/* Color Theme & Options */}
        <div className="space-y-8 py-2">
          <h3 className="text-xl font-bold text-neutral-800 flex items-center tracking-tight pb-2 border-b border-neutral-100">
            컬러 테마 및 고급 옵션
          </h3>

          <div className="space-y-8">
            <div>
              <label className="block text-neutral-900 font-bold text-xs uppercase tracking-wider mb-3">컬러 테마 선택</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => onThemeChange(theme)}
                    className={`flex items-center p-3 rounded-lg border transition-all text-left cursor-pointer ${
                      selectedTheme.name === theme.name 
                        ? 'border-neutral-900 bg-neutral-50/80 font-bold' 
                        : 'border-neutral-200 bg-transparent hover:border-neutral-400'
                    }`}
                  >
                    <div 
                      className="w-3.5 h-3.5 rounded-full mr-3 border border-neutral-300 shrink-0" 
                      style={{ backgroundColor: theme.colors.primary }} 
                    />
                    <div>
                      <div className="text-sm font-semibold text-neutral-800">
                        {theme.name.replace(/^[^\s]+\s/, '')}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{theme.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                  id="re-include-faq" 
                  type="checkbox" 
                  checked={shouldIncludeFAQ} 
                  onChange={(e) => setShouldIncludeFAQ(e.target.checked)} 
                  className="h-4 w-4 text-neutral-900 border-neutral-300 rounded focus:ring-0 cursor-pointer" 
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="re-include-faq" className="font-semibold text-neutral-800 cursor-pointer">부동산 Q&A (FAQ) 섹션 포함</label>
                <p className="text-neutral-400 text-xs mt-0.5">분양 자격, 전매제한, 세금, 대출 조건 등 독자들이 궁금해하는 Q&A 섹션을 자동 생성합니다.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                  id="re-add-thumbnail-text" 
                  type="checkbox" 
                  checked={shouldAddThumbnailText} 
                  onChange={(e) => setShouldAddThumbnailText(e.target.checked)} 
                  className="h-4 w-4 text-neutral-900 border-neutral-300 rounded focus:ring-0 cursor-pointer" 
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="re-add-thumbnail-text" className="font-semibold text-neutral-800 cursor-pointer">썸네일용 텍스트 추가</label>
                <p className="text-neutral-400 text-xs mt-0.5">대표 이미지에 텍스트를 합성하여 클릭률 높은 부동산 썸네일을 생성합니다.</p>
              </div>
            </div>

            {shouldAddThumbnailText && (
                <div className="pl-7 space-y-5 pt-4 border-t border-neutral-100 mt-2">
                    <div>
                        <label htmlFor="re-thumbnail-text" className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">썸네일 텍스트</label>
                        <input 
                            type="text" 
                            id="re-thumbnail-text" 
                            value={thumbnailSettings.text} 
                            onChange={(e) => thumbnailSettings.setText(e.target.value)} 
                            placeholder="글 생성 후 SEO 제목이 자동으로 제안됩니다." 
                            className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base placeholder-neutral-400" 
                        />
                        <p className="text-[11px] text-neutral-400 mt-1">/ 를 사용하여 강제로 줄바꿈할 수 있습니다.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="re-thumbnail-font" className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">글꼴</label>
                            <select 
                                id="re-thumbnail-font" 
                                value={thumbnailSettings.font} 
                                onChange={(e) => thumbnailSettings.setFont(e.target.value)} 
                                className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base"
                            >
                                <option value="Pretendard">Pretendard (고딕)</option>
                                <option value="Gmarket Sans">Gmarket Sans (고딕)</option>
                                <option value="Noto Sans KR">Noto Sans KR (고딕)</option>
                                <option value="Cafe24Ssurround">카페24 써라운드 (장식)</option>
                                <option value="Gowun Dodum">Gowun Dodum (명조)</option>
                                <option value="Black Han Sans">Black Han Sans (두꺼운)</option>
                                <option value="Jua">Jua (손글씨)</option>
                                <option value="Nanum Pen Script">나눔 손글씨 펜 (손글씨)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-neutral-500 text-xs font-semibold mb-2 uppercase tracking-wider">글자 색상</label>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {THUMBNAIL_COLORS.slice(0, 12).map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => thumbnailSettings.setColor(color)}
                                        className={`w-5 h-5 rounded-full border border-neutral-300 transition-transform ${thumbnailSettings.color === color ? 'scale-125 border-neutral-900 ring-2 ring-neutral-400' : 'hover:scale-110'}`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="block text-neutral-500 text-xs font-semibold uppercase tracking-wider">크기</label>
                                <span className="text-xs text-neutral-400">{thumbnailSettings.fontSize}px</span>
                            </div>
                            <input 
                                type="range" 
                                min="20" 
                                max="200" 
                                value={thumbnailSettings.fontSize} 
                                onChange={(e) => thumbnailSettings.setFontSize(parseInt(e.target.value))} 
                                className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900" 
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="block text-neutral-500 text-xs font-semibold uppercase tracking-wider">외곽선</label>
                                <span className="text-xs text-neutral-400">{thumbnailSettings.outlineWidth}px</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="20" 
                                value={thumbnailSettings.outlineWidth} 
                                onChange={(e) => thumbnailSettings.setOutlineWidth(parseInt(e.target.value))} 
                                className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900" 
                            />
                        </div>
                    </div>
                </div>
            )}

            <div>
              <label className="block text-neutral-900 font-bold text-xs uppercase tracking-wider mb-2">대표 이미지/썸네일 비율</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setThumbnailAspectRatio('16:9')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${thumbnailAspectRatio === '16:9' ? 'bg-neutral-900 text-white font-medium' : 'bg-transparent border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>
                  16:9 (와이드)
                </button>
                <button
                  type="button"
                  onClick={() => setThumbnailAspectRatio('1:1')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${thumbnailAspectRatio === '1:1' ? 'bg-neutral-900 text-white font-medium' : 'bg-transparent border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>
                  1:1 (정사각형)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-neutral-900 font-bold text-xs uppercase tracking-wider mb-2 flex items-center">
                인간적인 글쓰기 스타일
                <sup className="text-rose-500 ml-1.5 font-semibold">PRO</sup>
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setHumanLikeWritingStyle('none')}
                  className={`px-4 py-2 text-sm rounded-md transition-all cursor-pointer ${humanLikeWritingStyle === 'none' ? 'bg-neutral-900 text-white font-medium' : 'bg-transparent border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
                >
                  기본
                </button>
                <button
                  type="button"
                  onClick={() => setHumanLikeWritingStyle('A')}
                  className={`px-4 py-2 text-sm rounded-md transition-all cursor-pointer ${humanLikeWritingStyle === 'A' ? 'bg-neutral-900 text-white font-medium' : 'bg-transparent border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
                >
                  유형 A
                </button>
                <button
                  type="button"
                  onClick={() => setHumanLikeWritingStyle('B')}
                  className={`px-4 py-2 text-sm rounded-md transition-all cursor-pointer ${humanLikeWritingStyle === 'B' ? 'bg-neutral-900 text-white font-medium' : 'bg-transparent border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
                >
                  유형 B
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Request */}
        <div className="pt-2">
          <label className="block text-neutral-500 text-xs font-semibold mb-2 uppercase tracking-wider">추가 요청사항 (선택)</label>
          <textarea
            value={additionalRequest}
            onChange={(e) => setAdditionalRequest(e.target.value)}
            placeholder="예: GTX-A 연장 호재를 강조해줘, 3040 실거주 수요층을 타깃으로 작성해줘, 분양가 대비 시세차익 가능성 서술 등"
            className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors h-24 resize-none text-base placeholder-neutral-400"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing || !realEstateInfo.propertyName.trim()}
          className="w-full bg-neutral-900 hover:bg-black text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-base cursor-pointer shadow-xs"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>부동산 정보 & 입지 분석 중... (약 1분 소요)</span>
            </>
          ) : (
            <>
              <span>🏢 부동산 전문 분석 포스트 생성하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
