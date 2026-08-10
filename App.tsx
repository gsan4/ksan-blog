import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { COLOR_THEMES } from './constants';
import { ColorTheme, GeneratedContent, GeneratedTopic, HotPlaceInfo, RealEstateInfo, SanYakBoGamInfo, MainTab } from './types';
import { generateBlogPost, generateEeatTopicSuggestions, generateCategoryTopicSuggestions, generateEvergreenTopicSuggestions, suggestInteractiveElementForTopic, generateImage, generateTopicsFromMemo, generateLongtailTopicSuggestions, regenerateBlogPostHtml, generateHotPlaceBlogPost, analyzeRealEstateImages, generateSanYakBoGamBlogPost } from './services/geminiService';
import { formatErrorMessage } from './lib/utils';
import { testNaverCredentials } from './services/keywordService';
import { KeywordFighter } from './components/KeywordFighter';
import { CurrentStatus } from './components/CurrentStatus';
import { Shortcuts } from './components/Shortcuts';
import { HotPlaceAnalyzer } from './components/HotPlaceAnalyzer';
import { RealEstateAnalyzer } from './components/RealEstateAnalyzer';
import { SanYakBoGamAnalyzer } from './components/SanYakBoGamAnalyzer';
import { HomeGuide } from './components/HomeGuide';

const Header: React.FC<{ 
  onGoHome: () => void; 
  onOpenSettings: () => void; 
  onOpenDrawer: () => void;
}> = ({ onGoHome, onOpenSettings, onOpenDrawer }) => (
  <header className="bg-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-neutral-100 sticky top-0 z-30">
    <div className="flex items-center space-x-3">
      <button
        onClick={onOpenDrawer}
        className="text-neutral-700 hover:text-black p-1.5 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
        aria-label="메뉴 열기"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div 
        onClick={onGoHome}
        className="flex items-center space-x-1.5 cursor-pointer hover:opacity-80 transition-opacity select-none"
        title="부동산/분양 메인 화면으로 이동"
      >
        <span className="text-xl">📝</span>
        <h1 className="text-base sm:text-lg font-semibold text-neutral-800 tracking-tight flex items-center space-x-1.5">
          <span>부동산약보감 Blog</span>
          <span className="text-[10px] font-normal text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">Ver.1</span>
        </h1>
      </div>
    </div>
    <div className="flex items-center space-x-3">
      <CurrentStatus />
    </div>
  </header>
);

const SidebarDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onOpenSettings: () => void;
}> = ({ isOpen, onClose, activeTab, onSelectTab, onOpenSettings }) => {
  if (!isOpen) return null;

  const menuItems: { id: MainTab; label: string; icon: string }[] = [
    { id: 'realEstate', label: '부동산/분양', icon: '🏢' },
    { id: 'hotPlace', label: '맛집/카페/여행', icon: '☕' },
    { id: 'sanYakBoGam', label: '산약보감', icon: '🌿' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer Container */}
      <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-xl flex flex-col justify-between p-5 z-10 transition-transform duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
            <div 
              onClick={() => {
                onSelectTab('realEstate');
                onClose();
              }}
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-xl">📝</span>
              <span className="font-bold text-neutral-800 text-base">부동산약보감 Blog Ver.1</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
              aria-label="닫기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-xs font-semibold text-neutral-400 px-3 py-1 uppercase tracking-wider">메인 메뉴</div>
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-neutral-100 text-neutral-900 font-semibold' 
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="pt-4 border-t border-neutral-100 text-xs text-neutral-400 text-center">
          부동산약보감 Blog Ver.1 • Notion Style
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC = () => (
  <footer className="text-center py-8 mt-12 border-t border-neutral-100 text-neutral-400 text-xs bg-white">
    <p>부동산약보감 Blog Ver.1</p>
  </footer>
);

const CopyToClipboardButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="flex items-center space-x-1 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md hover:bg-slate-200 border border-slate-200 transition-colors disabled:opacity-50" disabled={copied}>
      {copied ? <span className="text-emerald-600">✅</span> : <span>📋</span>}
      <span>{copied ? '복사됨!' : '복사'}</span>
    </button>
  );
};

const SocialMediaPostCard: React.FC<{ platform: string; content: string; icon: string }> = ({ platform, content, icon }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg text-slate-800 flex items-center">
          <span className="mr-2 text-xl">{icon}</span>
          {platform} 포스트
        </h3>
        <CopyToClipboardButton textToCopy={content} />
      </div>
      <p className="text-slate-700 text-sm bg-slate-50 border border-slate-200 p-3 rounded-md whitespace-pre-wrap font-korean">{content}</p>
    </div>
  );
};

const InteractiveCodeModal: React.FC<{
  code: string;
  onClose: () => void;
}> = ({ code, onClose }) => {
  const [copied, setCopied] = useState(false);

  const highlightedCode = useMemo(() => {
    if (!code) return '';
    const formattedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tokenizer = /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?[\w-]+)|(\s+[\w-:]+="[^"]*")|(&gt;)|([^&<>]+)/g;

    return formattedCode.replace(tokenizer, (match, comment, tag, attribute, closingBracket, text) => {
        if (comment) return `<span class="text-slate-400">${comment}</span>`;
        if (tag) {
            const tagName = tag.replace(/&lt;\/?/, '');
            const bracket = tag.substring(0, tag.indexOf(tagName));
            return `<span class="text-slate-400">${bracket}</span><span class="text-rose-400">${tagName}</span>`;
        }
        if (attribute) {
            const parts = attribute.match(/(\s+)([\w-:]+)=(".*")/);
            if (parts) {
                const [, whitespace, attrName, attrValue] = parts;
                return `${whitespace}<span class="text-emerald-300">${attrName}</span>=<span class="text-amber-300">${attrValue}</span>`;
            }
        }
        if (closingBracket) return `<span class="text-slate-400">${closingBracket}</span>`;
        if (text) return `<span class="text-white">${text}</span>`;
        return match;
    });
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">인터랙티브 요소 코드</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl font-light">&times;</button>
        </div>
        <pre className="p-4 text-sm bg-slate-900 text-slate-100 overflow-y-auto whitespace-pre-wrap break-all font-mono flex-grow custom-scrollbar">
            <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
        <div className="p-4 border-t border-slate-100 flex justify-end">
            <button onClick={handleCopy} className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50" disabled={copied}>
              {copied ? <span>✅</span> : <span>📋</span>}
              <span>{copied ? '복사 완료!' : '코드 복사'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};


const ResultDisplay: React.FC<{
  htmlContent: string;
  isLoading: boolean;
  supplementaryInfo: GeneratedContent['supplementaryInfo'] | null;
  socialMediaPosts: GeneratedContent['socialMediaPosts'] | null;
  imageBase64: string | null;
  subImages: GeneratedContent['subImages'] | null;
  onGenerateImage: () => Promise<void>;
  isGeneratingImage: boolean;
  onGenerateSubImage: (index: number) => Promise<void>;
  isGeneratingSubImages: Record<number, boolean>;
  shouldAddThumbnailText: boolean;
  onGenerateThumbnail: () => Promise<void>;
  isGeneratingThumbnail: boolean;
  thumbnailDataUrl: string | null;
  thumbnailAspectRatio: '16:9' | '1:1';
}> = ({
  htmlContent,
  isLoading,
  supplementaryInfo,
  socialMediaPosts,
  imageBase64,
  subImages,
  onGenerateImage,
  isGeneratingImage,
  onGenerateSubImage,
  isGeneratingSubImages,
  shouldAddThumbnailText,
  onGenerateThumbnail,
  isGeneratingThumbnail,
  thumbnailDataUrl,
  thumbnailAspectRatio
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');
  const previewRef = useRef<HTMLDivElement>(null);
  const [isInteractiveCodeModalOpen, setInteractiveCodeModalOpen] = useState(false);

  const interactiveCode = useMemo(() => {
    if (!htmlContent) return null;
    const startComment = '<!-- Interactive Element Start -->';
    const endComment = '<!-- Interactive Element End -->';
    
    const startIndex = htmlContent.indexOf(startComment);
    const endIndex = htmlContent.indexOf(endComment);
    
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const codeStartIndex = startIndex + startComment.length;
        return htmlContent.substring(codeStartIndex, endIndex).trim();
    }
    
    return null;
  }, [htmlContent]);


  const charCountNoSpaces = useMemo(() => {
    if (!htmlContent) {
      return 0;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Explicitly remove script and style tags to prevent their content from being counted.
    tempDiv.querySelectorAll('script, style').forEach(el => el.remove());

    // Use textContent for a more reliable result on non-rendered elements.
    const textOnly = tempDiv.textContent || '';

    // Remove all whitespace characters (spaces, newlines, tabs) and get the length.
    return textOnly.replace(/\s/g, '').length;
  }, [htmlContent]);


  const imageUrl = imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : null;
  
  const imageHtml = imageUrl
    ? `<figure style="margin: 25px 0;">
         <img src="${imageUrl}" alt="${supplementaryInfo?.altText || 'Blog post image'}" style="width: 100%; max-height: 500px; border-radius: 12px; object-fit: contain; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
         <figcaption style="text-align: center; font-size: 14px; color: #6c757d; margin-top: 10px; font-style: italic;">${supplementaryInfo?.altText || ''}</figcaption>
       </figure>`
    : '';

  const htmlToCopyAndShow = htmlContent
    .replace('<!--THUMBNAIL_PLACEHOLDER-->', '')
    .replace('<!--IMAGE_PLACEHOLDER-->', '')
    .replace(/<!--SUB_IMAGE_PLACEHOLDER_\d+-->/g, '');
  
  const highlightedHtmlCode = useMemo(() => {
    if (!htmlToCopyAndShow) return '';

    const code = htmlToCopyAndShow
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // This regex tokenizes the HTML string into parts for highlighting
    const tokenizer = /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?[\w-]+)|(\s+[\w-:]+="[^"]*")|(&gt;)|([^&<>]+)/g;

    return code.replace(tokenizer, (match, comment, tag, attribute, closingBracket, text) => {
        if (comment) return `<span class="text-slate-500">${comment}</span>`;
        if (tag) {
            const tagName = tag.replace(/&lt;\/?/, '');
            const bracket = tag.substring(0, tag.indexOf(tagName));
            return `<span class="text-slate-400">${bracket}</span><span class="text-rose-400">${tagName}</span>`;
        }
        if (attribute) {
            const parts = attribute.match(/(\s+)([\w-:]+)=(".*")/);
            if (parts) {
                const [, whitespace, attrName, attrValue] = parts;
                return `${whitespace}<span class="text-emerald-300">${attrName}</span>=<span class="text-amber-300">${attrValue}</span>`;
            }
        }
        if (closingBracket) return `<span class="text-slate-400">${closingBracket}</span>`;
        if (text) return `<span class="text-white">${text}</span>`;
        return match; // Fallback
    });
  }, [htmlToCopyAndShow]);


  const handleCopy = () => {
    navigator.clipboard.writeText(htmlToCopyAndShow);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
    useEffect(() => {
    // Increase robustness of preview rendering with a retry mechanism
    const renderPreview = () => {
        if (viewMode === 'preview' && previewRef.current && htmlContent && !isLoading) {
            const container = previewRef.current;
            container.innerHTML = ''; // Clear previous content

            let htmlToPreview = htmlContent;

            // Replace thumbnail placeholder if available
            if (thumbnailDataUrl) {
                const thumbnailHtml = `<figure style="margin: 0 0 30px; text-align: center;">
                                          <img src="${thumbnailDataUrl}" alt="Generated Thumbnail" style="width: 100%; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); transition: transform 0.3s ease;">
                                        </figure>`;
                htmlToPreview = htmlToPreview.replace('<!--THUMBNAIL_PLACEHOLDER-->', thumbnailHtml);
            } else {
                htmlToPreview = htmlToPreview.replace('<!--THUMBNAIL_PLACEHOLDER-->', '');
            }

            // Replace original image placeholder
            htmlToPreview = htmlToPreview.replace('<!--IMAGE_PLACEHOLDER-->', imageHtml);

            // Replace sub-image placeholders
            if (subImages) {
                subImages.forEach((image, index) => {
                    if (image.base64) {
                        const subImageUrl = `data:image/jpeg;base64,${image.base64}`;
                        const subImageHtml = `<figure style="margin: 30px 0; text-align: center;">
                                                   <img src="${subImageUrl}" alt="${image.altText || 'Sub image'}" style="width: 100%; max-height: 500px; border-radius: 12px; object-fit: contain; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                                                   <figcaption style="text-align: center; font-size: 14px; color: #6c757d; margin-top: 10px;">${image.altText || ''}</figcaption>
                                               </figure>`;
                        htmlToPreview = htmlToPreview.replace(`<!--SUB_IMAGE_PLACEHOLDER_${index + 1}-->`, subImageHtml);
                    }
                });
            }
            
            // Use a temporary div to parse the HTML string and extract scripts
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlToPreview;

            const scripts = Array.from(tempDiv.getElementsByTagName('script'));
            
            // Remove script tags from the temporary div before appending its content
            scripts.forEach(script => script.parentNode?.removeChild(script));

            // Append the sanitized HTML (without scripts) to the container
            while (tempDiv.firstChild) {
                container.appendChild(tempDiv.firstChild);
            }

            // Create new script elements and append them to the container to execute them
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                newScript.text = oldScript.text;
                container.appendChild(newScript);
            });
            return true;
        }
        return false;
    };

    let retryCount = 0;
    const maxRetries = 20; // Try for about 300ms if needed

    const tryRender = () => {
        if (viewMode === 'preview') {
            const success = renderPreview();
            if (!success && retryCount < maxRetries) {
                retryCount++;
                requestAnimationFrame(tryRender);
            }
        }
    };

    // Initial attempt plus scheduled attempts
    tryRender();
}, [htmlContent, viewMode, imageHtml, subImages, thumbnailDataUrl, isLoading]);


  if (isLoading) {
    return (
      <div id="generation-results" className="mt-8 flex flex-col items-center justify-center p-8 sm:p-12 bg-white border border-neutral-200/90 rounded-2xl shadow-xs min-h-[320px] text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md mb-4">
          <svg
            className="w-7 h-7 text-white animate-pulse filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              fill="#FFFFFF"
            />
            <path
              d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
              fill="#E0E0E0"
            />
            <path
              d="M16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
        <p className="text-neutral-900 text-lg font-bold mb-1">블로그 포스트를 생성 중입니다...</p>
        <p className="text-neutral-500 text-sm max-w-md leading-relaxed">잠시만 기다려 주세요. AI가 분석한 완벽한 원고를 작성하고 있습니다 (약 1분 소요).</p>
      </div>
    );
  }

  if (!htmlContent) {
    return (
      <div id="generation-results" className="mt-8 flex flex-col items-center justify-center p-8 sm:p-12 bg-white border border-neutral-200/90 rounded-2xl shadow-xs min-h-[320px] text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md mb-4">
          <svg
            className="w-7 h-7 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              fill="#FFFFFF"
            />
            <path
              d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
              fill="#E0E0E0"
            />
            <path
              d="M16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-1.5">
          전문적인 분석 포스트를 작성할 준비가 되었습니다.
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md leading-relaxed">
          상단의 필수 정보를 입력하고 생성 버튼을 누르면, AI가 분석한 완벽한 초안이 이곳에 완성됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">생성된 콘텐츠</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="flex justify-between items-center p-3 bg-slate-50 border-b border-slate-200">
            <div className="flex space-x-1 items-center">
              <button onClick={() => setViewMode('preview')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'preview' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                <span role="img" aria-label="preview" className="mr-1">👀</span>미리보기
              </button>
              <button onClick={() => setViewMode('html')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'html' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                <span role="img" aria-label="code" className="mr-1">💻</span>HTML
              </button>
              <button 
                onClick={() => setInteractiveCodeModalOpen(true)} 
                className={`px-3 py-1 text-sm rounded-md transition-colors ${!interactiveCode ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                disabled={!interactiveCode}
                title={!interactiveCode ? "인터랙티브 요소가 없습니다." : "인터랙티브 요소 코드 보기"}
              >
                <span role="img" aria-label="interactive" className="mr-1">⚡</span>인터랙티브 코드
              </button>
               <div className="text-xs text-slate-500 ml-4 border-l border-slate-200 pl-4">
                  <span>글자수(공백제외): {charCountNoSpaces.toLocaleString()}자</span>
              </div>
            </div>
            <button onClick={handleCopy} className="flex items-center space-x-2 bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50" disabled={copied}>
              {copied ? <span>✅</span> : <span>📋</span>}
              <span>{copied ? '복사 완료!' : 'HTML 복사'}</span>
            </button>
          </div>

          {viewMode === 'preview' ? (
            <div ref={previewRef} className="p-6 bg-white font-korean" />
          ) : (
            <pre className="p-4 text-sm bg-slate-900 text-slate-100 overflow-y-auto whitespace-pre-wrap break-all font-mono custom-scrollbar">
              <code dangerouslySetInnerHTML={{ __html: highlightedHtmlCode }} />
            </pre>
          )}
        </div>

        {/* Right Column Wrapper */}
        <div className="flex flex-col gap-6">
          {supplementaryInfo && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col space-y-6">
              
              {/* Image Section */}
              <div>
                 <h3 className="font-semibold text-lg text-slate-800 mb-2 border-b border-slate-100 pb-2">대표 이미지</h3>
                 <div className="mt-4">
                    {imageUrl ? (
                        <img src={imageUrl} alt={supplementaryInfo.altText} className="rounded-lg mb-3 w-full" style={{ aspectRatio: thumbnailAspectRatio === '16:9' ? '16 / 9' : '1 / 1', objectFit: 'cover' }} />
                    ): (
                        <div className="rounded-lg mb-3 w-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400" style={{ aspectRatio: thumbnailAspectRatio === '16:9' ? '16 / 9' : '1 / 1' }}>이미지가 생성되지 않았습니다</div>
                    )}
                    {supplementaryInfo.imagePrompt && (
                      <>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-md text-slate-700">이미지 생성 프롬프트</h4>
                            <CopyToClipboardButton textToCopy={supplementaryInfo.imagePrompt} />
                        </div>
                        <p className="text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-md text-sm mb-3">{supplementaryInfo.imagePrompt}</p>
                      </>
                    )}

                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-md text-slate-700">Alt 태그</h4>
                        <CopyToClipboardButton textToCopy={supplementaryInfo.altText} />
                    </div>
                    <p className="text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-md text-sm mb-3">{supplementaryInfo.altText}</p>

                    <div className="grid grid-cols-2 gap-2">
                        {imageUrl && (
                             <a href={imageUrl} download="featured-image.jpeg" className="text-center bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors duration-200 inline-block text-sm">
                                다운로드
                            </a>
                        )}
                        <button
                            onClick={onGenerateImage}
                            disabled={isGeneratingImage}
                            className={`text-center bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 transition-colors duration-200 disabled:bg-slate-300 flex items-center justify-center text-sm ${!imageUrl ? 'col-span-2' : ''}`}
                        >
                        {isGeneratingImage ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                        ) : (imageBase64 ? '재생성' : '생성')}
                        </button>
                    </div>

                    {shouldAddThumbnailText && (
                      <button
                        onClick={onGenerateThumbnail}
                        disabled={isGeneratingThumbnail || !imageBase64}
                        className="mt-3 w-full text-center bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 transition-colors duration-200 disabled:bg-slate-300 flex items-center justify-center"
                      >
                        {isGeneratingThumbnail ? (
                           <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                            생성 중...
                          </>
                        ) : '🖼️ 썸네일 생성'}
                      </button>
                    )}
                 </div>
                 {thumbnailDataUrl && (
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-slate-600 mb-2">생성된 썸네일</h4>
                    <img src={thumbnailDataUrl} alt="Generated thumbnail" className="rounded-lg mb-3 w-full border border-slate-200" />
                    <a href={thumbnailDataUrl} download="thumbnail.jpeg" className="w-full text-center bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors duration-200 inline-block">
                      썸네일 다운로드
                    </a>
                  </div>
                )}
              </div>

              {/* Sub Images Section */}
              {subImages && subImages.length > 0 && (
                 <div>
                    <h3 className="font-semibold text-lg text-slate-800 mb-2 border-b border-slate-100 pb-2">서브 이미지 (16:9)</h3>
                    <div className="space-y-6 mt-4">
                        {subImages.map((subImage, index) => (
                            <div key={index}>
                                <h4 className="text-md font-medium text-slate-600 mb-2">서브 이미지 #{index + 1}</h4>
                                {subImage.base64 ? (
                                    <img src={`data:image/jpeg;base64,${subImage.base64}`} alt={subImage.altText} className="rounded-lg mb-3 w-full" style={{ aspectRatio: '16 / 9', objectFit: 'cover' }} />
                                ) : (
                                    <div className="rounded-lg mb-3 w-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400" style={{ aspectRatio: '16 / 9' }}>이미지가 생성되지 않았습니다</div>
                                )}
                                {subImage.prompt && (
                                  <>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-md text-slate-700">이미지 생성 프롬프트</h4>
                                        <CopyToClipboardButton textToCopy={subImage.prompt} />
                                    </div>
                                    <p className="text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-md text-sm mb-3">{subImage.prompt}</p>
                                  </>
                                )}

                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-md text-slate-700">Alt 태그</h4>
                                    <CopyToClipboardButton textToCopy={subImage.altText} />
                                </div>
                                <p className="text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-md text-sm mb-3">{subImage.altText}</p>

                                <div className="grid grid-cols-2 gap-2">
                                    {subImage.base64 && (
                                        <a href={`data:image/jpeg;base64,${subImage.base64}`} download={`sub-image-${index + 1}.jpeg`} className="text-center bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors duration-200 inline-block text-sm">
                                            다운로드
                                        </a>
                                    )}
                                    <button onClick={() => onGenerateSubImage(index)} disabled={isGeneratingSubImages[index]} className={`text-center bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 transition-colors duration-200 disabled:bg-slate-300 flex items-center justify-center text-sm ${!subImage.base64 ? 'col-span-2' : ''}`}>
                                         {isGeneratingSubImages[index] ? (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                        ) : (subImage.base64 ? '재생성' : '생성')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}

              {/* SEO and Prompt Section */}
              <div>
                <h3 className="font-semibold text-lg text-slate-800 mb-2">SEO 제목 제안</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
                  {supplementaryInfo.seoTitles.map((title, i) => <li key={i}>{title}</li>)}
                </ul>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                   <h3 className="font-semibold text-lg text-slate-800">핵심 키워드</h3>
                   <CopyToClipboardButton textToCopy={supplementaryInfo.keywords.join(', ')} />
                </div>
                <p className="text-teal-800 text-sm bg-teal-50 border border-teal-100 p-3 rounded-md font-medium">
                  {supplementaryInfo.keywords.join(', ')}
                </p>
              </div>
            </div>
          )}
          {socialMediaPosts && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col space-y-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-2 border-b border-slate-100 pb-2">소셜 미디어 포스트</h2>
              <SocialMediaPostCard platform="Threads" content={socialMediaPosts.threads} icon="🧵" />
              <SocialMediaPostCard platform="Instagram" content={socialMediaPosts.instagram} icon="📸" />
              <SocialMediaPostCard platform="Facebook" content={socialMediaPosts.facebook} icon="👥" />
              <SocialMediaPostCard platform="X (Twitter)" content={socialMediaPosts.x} icon="🐦" />
            </div>
          )}
        </div>
      </div>

      {isInteractiveCodeModalOpen && (
        <InteractiveCodeModal code={interactiveCode || ''} onClose={() => setInteractiveCodeModalOpen(false)} />
      )}
    </div>
  );
};
const HELP_MARKDOWN = `
# 📘 Ksan블로그Ver.0 가이드

> AI와 함께 **아이디어 발굴 → 키워드 분석 → SEO 포스트 생성**을 한 곳에서 끝내는 도구

---

## 🚀 V2의 4대 강점

| 아이콘 | 기능 | 한 줄 요약 |
|:---:|---|---|
| 📸 | **핫플 사진 분석기** | 사진만 올리면 AI가 멀티모달로 리뷰 작성 |
| ⚔️ | **키워드 파이터** | 자동완성·경쟁력·SERP를 실시간 분석 |
| ✨ | **인터랙티브 요소** | 계산기·퀴즈 HTML이 본문에 자동 포함 |
| ✍️ | **인간적 글쓰기 A/B** | AI 티 안 나는 두 가지 전문 문체 |

---

## 🗂 4개 메인 탭

### ① 주제 아이디어 얻기
5가지 방식으로 주제 발굴 → 클릭 한 번에 본문 생성으로 연결

- **E-E-A-T** : 경험·전문성 기반 (구글 SEO 핵심)
- **카테고리** : 9개 분야 트렌드 주제
- **에버그린** : 시간 무관 꾸준한 트래픽용
- **롱테일** : 실시간 구글 검색 반영 (전환율 ↑)
- **메모/파일** : 내 초안을 분석해 주제 10개 제안

### ② 맛집/카페/여행 (핫플 분석기)
1. 사진 여러 장 업로드 → 클릭으로 **대표 이미지** 지정
2. 장소명·카테고리·동행·인상 입력 (자세할수록 좋음)
3. FAQ·썸네일 텍스트·이미지 비율(16:9 / 1:1) 선택
4. **생성 버튼** → 사진 순서 그대로 본문에 자동 배치

### ③ 키워드 파이터 PRO
7가지 분석 도구

- 🔘 **키워드 경쟁력** — 성공 가능성·경쟁 난이도 점수화
- 🔘 **자동완성** — Google / Naver 실시간 연관어
- 🔘 **AI 연관검색어** — SERP·PAA·콘텐츠 갭 분석
- 🟢 **네이버 뉴스** — 실시간 뉴스 + AI 공략 전략 *(API 필요)*
- 🟢 **상위 블로그 분석** — Top 10 패턴 + 1위 공략법 *(API 필요)*
- 🔘 **다각도 주제 발굴** — 키워드 1개 → 4가지 관점 확장
- 🔴 **오늘의 전략 키워드** — 오늘 기준 정책 5 + 이슈 5

### ④ 트렌드 바로가기
실시간 검색어·정책 포털·데이터랩 등 외부 사이트 큐레이션

---

## ✨ 포스트 생성 — 출력물 한 번에

주제 하나 입력으로 다음을 **동시 생성**

- 📝 본문 HTML (2,500~3,000자, 인라인 스타일)
- 🎯 SEO 제목 5 + 썸네일 제목 3~5
- 🔑 SEO 키워드 10
- 🖼 대표 이미지 + 서브 이미지 2~3장 (alt 자동)
- ❓ FAQ + JSON-LD 스키마 (구글 리치 결과용)
- 💡 핵심 요약 카드
- 📲 Threads / Instagram / Facebook / X 4종 홍보 문구

---

## ⚙️ 고급 옵션 핵심

| 옵션 | 효과 |
|---|---|
| **컬러 테마 7종** | 메타박스·헤딩·표·카드 등 모든 색상 자동 통일 |
| **이미지 비율** | 16:9 (와이드) / 1:1 (정사각형) |
| **썸네일 텍스트** | 폰트 8종·색상 18종·크기·외곽선 조정 |
| **인터랙티브 요소** | 주제에 맞는 계산기·퀴즈 자동 제안 |
| **글쓰기 스타일 A** | 감정·짧은 문장·리듬감 (블로그 최적화) |
| **글쓰기 스타일 B** | 전문성·독자 호명 (정보성 포스팅) |

---

## 🛠 결과물 후처리

- **미리보기 / HTML** 토글로 즉시 확인·복사
- 대표/서브 이미지 **개별 재생성**
- 썸네일 **Canvas 합성** (1200×N 자동 크롭)
- 인터랙티브 코드만 별도 모달에서 추출

### 피드백 재작성
"수정 요청사항"을 적으면 **본문만** 다시 씀.
이미지·SEO·키워드·소셜 문구는 그대로 보존.

---

## 🔧 사전 준비

| 키 | 용도 | 필수 여부 |
|---|---|:---:|
| **Gemini API Key** | 모든 AI 기능 | ✅ 필수 |
| **Naver API Key** | 상위 블로그·실시간 뉴스 | ⚠️ 일부만 |

> Naver API는 우측 상단 **⚙️ 설정**에서 등록 ('localStorage' 저장)

---

## 💡 자주 묻는 질문

**Q. "할당량 소진" 메시지가 나와요**
→ 무료 등급 분당 호출 한도 초과. 약 1분 후 재시도

**Q. 본문에 연도가 들어갔어요**
→ 피드백 재작성에 "연도 표기 모두 제거"로 요청

**Q. 사진 순서가 섞여요**
→ 핫플 분석기에서 **대표 이미지를 명시적으로 클릭** 지정

**Q. 인터랙티브 요소가 작동 안 해요**
→ 일부 블로그 플랫폼은 인라인 \`<script>\` 차단. 코드 모달에서 추출 후 별도 사용

---

> Made by **GPT PARK** · YouTube '@AIFACT-GPTPARK'
`;

const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center">
            <span className="bg-teal-500 p-1.5 rounded-lg mr-3 shadow-md text-white">📘</span>
            도움말 및 가이드
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-3xl font-light transition-colors hover:rotate-90 duration-200 focus:outline-none">&times;</button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50">
          <div className="markdown-body text-slate-700 leading-relaxed">
            <ReactMarkdown
              children={HELP_MARKDOWN}
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-slate-800 mb-6 border-b-2 border-teal-500 pb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-teal-700 mt-10 mb-4 flex items-center" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 text-slate-600" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1 text-slate-600" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1 text-slate-600" {...props} />,
                li: ({node, ...props}) => <li className="ml-4" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-teal-500 pl-4 py-2 italic bg-teal-50/50 rounded mb-4 text-slate-700" {...props} />,
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 shadow-xs bg-white">
                    <table className="w-full text-sm border-collapse" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-slate-100 text-slate-800" {...props} />,
                th: ({node, ...props}) => <th className="border border-slate-200 p-3 text-left font-bold text-slate-800" {...props} />,
                td: ({node, ...props}) => <td className="border border-slate-200 p-3 text-slate-700" {...props} />,
                tr: ({node, ...props}) => <tr className="hover:bg-slate-50 transition-colors" {...props} />,
                hr: ({node, ...props}) => <hr className="border-slate-200 my-8" {...props} />,
                code: ({node, inline, ...props}: any) => 
                  inline 
                    ? <code className="bg-slate-100 px-1.5 py-0.5 rounded text-teal-800 text-xs border border-slate-200" {...props} />
                    : <code className="block bg-slate-900 p-4 rounded-lg my-4 text-emerald-300 text-xs overflow-x-auto border border-slate-800" {...props} />
              }}
            />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 text-center bg-white sticky bottom-0">
          <button onClick={onClose} className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-12 py-3 rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-all font-bold shadow-md shadow-teal-600/20 active:scale-95">
            이해했습니다
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void;
    clientId: string;
    setClientId: (id: string) => void;
    clientSecret: string;
    setClientSecret: (secret: string) => void;
    status: 'unconfigured' | 'testing' | 'success' | 'error';
    error: string | null;
    onTestAndSave: () => void;
}> = ({ isOpen, onClose, clientId, setClientId, clientSecret, setClientSecret, status, error, onTestAndSave }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">설정</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl font-light">&times;</button>
                </div>
                <div className="p-6 space-y-6">
                     <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">Naver 검색 API 설정</h3>
                        <p className="text-sm text-slate-500 mb-4">'상위 블로그 분석', '네이버 실시간 뉴스' 등 일부 기능을 사용하려면 Naver Developers에서 발급받은 API 키가 필요합니다.</p>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                placeholder="Naver API Client ID"
                                className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                            />
                            <input
                                type="password"
                                value={clientSecret}
                                onChange={(e) => setClientSecret(e.target.value)}
                                placeholder="Naver API Client Secret"
                                className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                            />
                            <button
                                onClick={onTestAndSave}
                                disabled={status === 'testing' || !clientId || !clientSecret}
                                className="w-full bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-slate-300 flex items-center justify-center shadow-xs"
                            >
                                {status === 'testing' ? (
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                ) : "연결 테스트 및 저장"}
                            </button>
                        </div>
                        <div className="mt-3 text-sm h-5">
                            {status === 'unconfigured' && <p className="text-amber-600 font-medium">💡 Naver API 키를 등록해주세요.</p>}
                            {status === 'success' && <p className="text-emerald-600 font-medium">✅ API가 성공적으로 연결되었습니다.</p>}
                            {status === 'error' && <p className="text-rose-600 font-medium">❌ 연결 실패: {error}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EEAT_SUB_CATEGORIES_MAP: Record<string, string[]> = {
  "심층 가이드 및 'How-to'": ["IT/기술", "건강/피트니스", "금융/투자", "요리/레시피", "DIY/공예", "학습/교육"],
  "비교 및 분석": ["전자기기", "소프트웨어/앱", "금융 상품", "자동차", "여행지/숙소", "온라인 강의"],
  "최신 정보 및 트렌드": ["기술 동향", "사회/문화", "경제 뉴스", "패션/뷰티", "엔터테인먼트", "스포츠"],
  "사례 연구 및 성공 사례": ["비즈니스/마케팅", "자기계발", "재테크 성공기", "건강 개선", "학습법", "커리어 전환"],
  "개인 경험 (후기, 경험담)": ["제품 사용 후기", "여행기", "맛집 탐방", "도서/영화 리뷰", "육아 일기", "취미 생활"],
};


function App() {
  const [topic, setTopic] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [isGeneratingSubImages, setIsGeneratingSubImages] = useState<Record<number, boolean>>({});
  const [regenerationFeedback, setRegenerationFeedback] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isAnalyzingHotPlace, setIsAnalyzingHotPlace] = useState<boolean>(false);

  const handleAnalyzeHotPlace = async (
    images: { data: string; mimeType: string }[], 
    additionalRequest: string, 
    visitInfo: HotPlaceInfo,
    options: {
        shouldIncludeFAQ: boolean;
        shouldAddThumbnailText: boolean;
        thumbnailAspectRatio: '16:9' | '1:1';
        humanLikeWritingStyle: 'none' | 'A' | 'B';
        isHiking?: boolean;
    }
  ) => {
    setIsAnalyzingHotPlace(true);
    setError(null);
    setGeneratedContent(null);
    
    // Sync current app settings with hot place options for result display
    setShouldAddThumbnailText(options.shouldAddThumbnailText);
    setThumbnailAspectRatio(options.thumbnailAspectRatio);
    setHumanLikeWritingStyle(options.humanLikeWritingStyle);

    try {
        const currentDate = new Date();
        const formattedDate = new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
        }).format(currentDate);

        const content = await generateHotPlaceBlogPost(
            images,
            visitInfo,
            {
                shouldIncludeFAQ: options.shouldIncludeFAQ,
                shouldAddThumbnailText: options.shouldAddThumbnailText,
                thumbnailAspectRatio: options.thumbnailAspectRatio,
                humanLikeWritingStyle: options.humanLikeWritingStyle,
                isHiking: options.isHiking
            },
            selectedTheme,
            additionalRequest
        );

        setGeneratedContent(content);
        
        // Scroll to results
        setTimeout(() => {
            document.getElementById('generation-results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

    } catch (err) {
        console.error("Analysis failed:", err);
        setError(formatErrorMessage(err));
    } finally {
        setIsAnalyzingHotPlace(false);
    }
  };

  const [isAnalyzingRealEstate, setIsAnalyzingRealEstate] = useState<boolean>(false);

  const handleAnalyzeRealEstate = async (
    images: { data: string; mimeType: string }[],
    additionalReq: string,
    realEstateInfo: RealEstateInfo,
    options: {
      shouldIncludeFAQ: boolean;
      shouldAddThumbnailText: boolean;
      thumbnailAspectRatio: '16:9' | '1:1';
      humanLikeWritingStyle: 'none' | 'A' | 'B';
    }
  ) => {
    setError(null);
    setIsAnalyzingRealEstate(true);
    setGeneratedContent(null);

    try {
      setShouldAddThumbnailText(options.shouldAddThumbnailText);
      setThumbnailAspectRatio(options.thumbnailAspectRatio);

      const content = await analyzeRealEstateImages(
        images,
        additionalReq,
        realEstateInfo,
        options,
        selectedTheme
      );
      setGeneratedContent(content);

      if (options.shouldAddThumbnailText && content.imageBase64 && thumbnailText) {
        try {
          const imageSrc = `data:image/jpeg;base64,${content.imageBase64}`;
          const dataUrl = await createThumbnail(imageSrc, thumbnailText, options.thumbnailAspectRatio, thumbnailFont, thumbnailColor, thumbnailFontSize, thumbnailOutlineWidth);
          setThumbnailDataUrl(dataUrl);
        } catch (thumbnailErr) {
          console.error("Failed to auto-generate thumbnail:", thumbnailErr);
        }
      }

      setTimeout(() => {
        document.getElementById('generation-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setIsAnalyzingRealEstate(false);
    }
  };

  const [isAnalyzingSanYakBoGam, setIsAnalyzingSanYakBoGam] = useState<boolean>(false);

  const handleAnalyzeSanYakBoGam = async (
    images: { data: string; mimeType: string }[],
    additionalReq: string,
    sanYakBoGamInfo: SanYakBoGamInfo,
    options: {
      shouldIncludeFAQ: boolean;
      shouldAddThumbnailText: boolean;
      thumbnailAspectRatio: '16:9' | '1:1';
      humanLikeWritingStyle: 'none' | 'A' | 'B';
    }
  ) => {
    setError(null);
    setIsAnalyzingSanYakBoGam(true);
    setGeneratedContent(null);

    try {
      setShouldAddThumbnailText(options.shouldAddThumbnailText);
      setThumbnailAspectRatio(options.thumbnailAspectRatio);

      const content = await generateSanYakBoGamBlogPost(
        images,
        additionalReq,
        sanYakBoGamInfo,
        options,
        selectedTheme
      );
      setGeneratedContent(content);

      if (options.shouldAddThumbnailText && content.imageBase64 && thumbnailText) {
        try {
          const imageSrc = `data:image/jpeg;base64,${content.imageBase64}`;
          const dataUrl = await createThumbnail(imageSrc, thumbnailText, options.thumbnailAspectRatio, thumbnailFont, thumbnailColor, thumbnailFontSize, thumbnailOutlineWidth);
          setThumbnailDataUrl(dataUrl);
        } catch (thumbnailErr) {
          console.error("Failed to auto-generate thumbnail:", thumbnailErr);
        }
      }

      setTimeout(() => {
        document.getElementById('generation-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setIsAnalyzingSanYakBoGam(false);
    }
  };

  // --- Main Tab State ---
  const [mainTab, setMainTab] = useState<MainTab>('realEstate');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // --- Naver API State ---
  const [naverClientId, setNaverClientId] = useState('');
  const [naverClientSecret, setNaverClientSecret] = useState('');
  const [apiStatus, setApiStatus] = useState<'unconfigured' | 'testing' | 'success' | 'error'>('unconfigured');
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
      try {
          const envId = ((import.meta as any).env?.VITE_NAVER_CLIENT_ID as string) || '';
          const envSecret = ((import.meta as any).env?.VITE_NAVER_CLIENT_SECRET as string) || '';

          const id_b64 = localStorage.getItem('naverClientId_b64');
          const secret_b64 = localStorage.getItem('naverClientSecret_b64');

          let id = envId;
          let secret = envSecret;

          if (id_b64 && secret_b64) {
              id = atob(id_b64);
              secret = atob(secret_b64);
          }

          if (id && secret) {
              setNaverClientId(id);
              setNaverClientSecret(secret);
              setApiStatus('success');
          } else if (envId || envSecret) {
              setNaverClientId(envId);
              setNaverClientSecret(envSecret);
          }
      } catch (e) {
          console.error("Failed to load or decode API keys from localStorage:", e);
          // Clear potentially corrupted keys
          localStorage.removeItem('naverClientId_b64');
          localStorage.removeItem('naverClientSecret_b64');
          setApiStatus('unconfigured');
      }
  }, []);

  const handleTestAndSaveCredentials = async () => {
      if (!naverClientId.trim() || !naverClientSecret.trim()) {
          setApiError('클라이언트 ID와 시크릿을 모두 입력해주세요.');
          setApiStatus('error');
          return;
      }
      setApiStatus('testing');
      setApiError(null);
      try {
          await testNaverCredentials(naverClientId, naverClientSecret);
          // Use btoa for simple obfuscation, not strong encryption.
          localStorage.setItem('naverClientId_b64', btoa(naverClientId));
          localStorage.setItem('naverClientSecret_b64', btoa(naverClientSecret));
          setApiStatus('success');
      } catch (err) {
          setApiStatus('error');
          setApiError(formatErrorMessage(err));
      }
  };


  // --- Topic Suggestion State ---
  type TopicSuggestionTab = 'eeat' | 'category' | 'evergreen' | 'longtail' | 'memo';
  const [activeSuggestionTab, setActiveSuggestionTab] = useState<TopicSuggestionTab>('eeat');
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [isSuggestingTopics, setIsSuggestingTopics] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  
  const GENERAL_CATEGORIES = [
    "재정/투자 (부동산, 주식, 연금, 세금, 대출 등)",
    "IT/기술 (프로그래밍, 앱 사용법, 소프트웨어, 디지털기기 등)",
    "생활/라이프스타일 (인테리어, 요리, 미니멀라이프, 반려동물 등)",
    "건강/자기계발 (운동, 독서, 습관, 정신건강 등)",
    "교육/학습 (외국어, 자격증, 온라인강의, 공부법 등)",
    "쇼핑/소비 (온라인쇼핑, 중고거래, 할인혜택, 가성비제품 등)",
    "자동차/교통 (자동차보험, 중고차, 대중교통, 주차 등)",
    "취업/직장 (이직, 연차, 퇴사, 직장생활, 4대보험 등)",
    "기타(사용자입력)"
  ];

  // E-E-A-T Tab State
  const EEAT_CATEGORIES = [
    "심층 가이드 및 'How-to'", "비교 및 분석", "최신 정보 및 트렌드", 
    "사례 연구 및 성공 사례", "개인 경험 (후기, 경험담)"
  ];
  const [selectedEeatCategory, setSelectedEeatCategory] = useState<string>(EEAT_CATEGORIES[0]);
  const [selectedEeatSubCategory, setSelectedEeatSubCategory] = useState<string>(EEAT_SUB_CATEGORIES_MAP[EEAT_CATEGORIES[0]][0]);

  // Category Tab State
  const [selectedGenCategory, setSelectedGenCategory] = useState<string>(GENERAL_CATEGORIES[0]);
  const [customGenCategory, setCustomGenCategory] = useState<string>('');
  
  // Evergreen Tab State
  const EVERGREEN_CATEGORIES = [
    "사례 연구(Case Study)",
    "백서(White Paper)",
    "통계 및 데이터 정리",
    "제품 리뷰 (업데이트 가능)",
    "역사적 배경 설명",
    "How-to 가이드",
    "초보자 가이드",
    "리스트 콘텐츠 (Top 10, 체크리스트 등)",
    "체크리스트",
    "용어집(Glossary) & 정의",
    "베스트 프랙티스 (Best Practices)",
    "실패 사례 공유",
    "성공 사례 공유",
    "스토리텔링 기반 글",
    "FAQ(자주 묻는 질문) 정리",
    "튜토리얼 (단계별 안내)",
    "리소스 모음/큐레이션 (추천 툴·사이트 모음)",
    "비교 콘텐츠 (제품·서비스 비교)",
    "전문가 인터뷰",
    "종합 가이드(Ultimate Guide)",
    "문제 해결형 글 (솔루션 제시)",
    "핵심 팁 모음 (Tips & Tricks)",
    "오해와 진실(신화 깨기, Myth Busting)",
    "업계/분야 베스트 사례 아카이브"
  ];
  const [selectedEvergreenCategory, setSelectedEvergreenCategory] = useState<string>(EVERGREEN_CATEGORIES[0]);
  const [selectedEvergreenField, setSelectedEvergreenField] = useState<string>(GENERAL_CATEGORIES[0]);
  const [customEvergreenField, setCustomEvergreenField] = useState<string>('');

  // Long-tail Tab State
  const LONGTAIL_CATEGORIES = [
    "계절/이벤트",
    "건강/피트니스",
    "재테크/금융",
    "IT/기술/소프트웨어",
    "부동산/인테리어",
    "교육/학습/자기계발",
    "취업/커리어",
    "쇼핑/제품 리뷰",
    "여행 (국내/해외)",
    "자동차 (구매/관리)",
    "법률/세금",
  ];
  const [selectedLongtailCategory, setSelectedLongtailCategory] = useState<string>(LONGTAIL_CATEGORIES[0]);
  
  // Memo Tab State
  const [memoContent, setMemoContent] = useState<string>('');
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);
  const [additionalRequest, setAdditionalRequest] = useState<string>('');

  // --- Generation Options State ---
  const [shouldGenerateImage, setShouldGenerateImage] = useState<boolean>(true);
  const [shouldGenerateSubImages, setShouldGenerateSubImages] = useState<boolean>(true);
  const [shouldIncludeInteractiveElement, setShouldIncludeInteractiveElement] = useState<boolean>(false);
  const [interactiveElementIdea, setInteractiveElementIdea] = useState<string | null>(null);
  const [isSuggestingInteractiveElement, setIsSuggestingInteractiveElement] = useState<boolean>(false);
  const [humanLikeWritingStyle, setHumanLikeWritingStyle] = useState<'none' | 'A' | 'B'>('none');
  
  // --- Thumbnail Generation State ---
  const [shouldAddThumbnailText, setShouldAddThumbnailText] = useState<boolean>(false);
  const [thumbnailText, setThumbnailText] = useState<string>('');
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState<boolean>(false);
  const [thumbnailAspectRatio, setThumbnailAspectRatio] = useState<'16:9' | '1:1'>('16:9');
  const [thumbnailFont, setThumbnailFont] = useState<string>('Pretendard');
  const [thumbnailColor, setThumbnailColor] = useState<string>('#FFFFFF');
  const [thumbnailFontSize, setThumbnailFontSize] = useState<number>(100);
  const [thumbnailOutlineWidth, setThumbnailOutlineWidth] = useState<number>(8);

  const resetGenerationSettings = useCallback(() => {
    setTopic('');
    setAdditionalRequest('');
    setSelectedTheme(COLOR_THEMES[0]);
    
    // Reset advanced options
    setShouldGenerateImage(true);
    setShouldGenerateSubImages(true);
    setShouldIncludeInteractiveElement(false);
    setInteractiveElementIdea(null);
    setHumanLikeWritingStyle('none');
    
    // Reset thumbnail options
    setShouldAddThumbnailText(false);
    setThumbnailText('');
    setThumbnailDataUrl(null);
    setThumbnailAspectRatio('16:9');
    setThumbnailFont('Pretendard');
    setThumbnailColor('#FFFFFF');
    setThumbnailFontSize(100);
    setThumbnailOutlineWidth(8);

    // Also clear previous results
    setGeneratedContent(null);
    setError(null);
  }, []);

  const handleManualTabSwitch = (tab: MainTab) => {
    if (mainTab === tab) return;

    resetGenerationSettings();
    setSuggestedTopics([]);
    setSuggestionError(null);
    setMemoContent('');
    setUploadedFileNames([]);
    
    setMainTab(tab);
  };

  useEffect(() => {
    const newSubCategories = EEAT_SUB_CATEGORIES_MAP[selectedEeatCategory] || [];
    setSelectedEeatSubCategory(newSubCategories[0] || '');
  }, [selectedEeatCategory]);

  useEffect(() => {
    if (generatedContent?.supplementaryInfo?.thumbnailTitles?.length) {
      setThumbnailText(generatedContent.supplementaryInfo.thumbnailTitles[0]);
    } else if (generatedContent?.supplementaryInfo?.seoTitles?.length) {
      setThumbnailText(generatedContent.supplementaryInfo.seoTitles[0]);
    } else {
      setThumbnailText('');
    }
    setThumbnailDataUrl(null);
  }, [generatedContent]);

  useEffect(() => {
    if (!shouldGenerateImage) {
        setShouldAddThumbnailText(false);
    }
  }, [shouldGenerateImage]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  const handleSuggestionTabChange = (tab: TopicSuggestionTab) => {
    setActiveSuggestionTab(tab);
    setSuggestedTopics([]);
    setSuggestionError(null);
    resetGenerationSettings();
  }
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      let combinedText = '';
      const names: string[] = [];
      let totalSize = 0;

      // FIX: Iterate directly over the FileList to ensure 'file' is correctly typed as File, not unknown. This resolves errors when accessing file.size.
      for (const file of files) {
        totalSize += file.size;
      }

      if (totalSize > 5 * 1024 * 1024) { // 5MB total limit
        setSuggestionError("총 파일 크기는 5MB를 초과할 수 없습니다.");
        return;
      }

      try {
        // FIX: Iterate directly over the FileList to ensure 'file' is correctly typed as File, not unknown. This resolves errors when accessing file.name and file.text().
        for (const file of files) {
          names.push(file.name);
          const text = await file.text();
          combinedText += `\n\n--- START OF FILE: ${file.name} ---\n\n${text}\n\n--- END OF FILE: ${file.name} ---\n\n`;
        }
        setMemoContent(combinedText.trim());
        setUploadedFileNames(names);
        setSuggestionError(null);
      } catch (err) {
        setSuggestionError("파일을 읽는 중 오류가 발생했습니다.");
      }
    }
  };

  const handleSuggestTopics = useCallback(async (generator: (currentDate: string) => Promise<string[]>) => {
    setIsSuggestingTopics(true);
    setSuggestionError(null);
    setSuggestedTopics([]);
    try {
      const currentDate = new Date();
      const formattedDate = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
      }).format(currentDate);
      const topics = await generator(formattedDate);
      setSuggestedTopics(topics);
    } catch (err) {
      setSuggestionError(formatErrorMessage(err));
    } finally {
      setIsSuggestingTopics(false);
    }
  }, []);

  const handleTopicSelect = async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setThumbnailText(selectedTopic); // Set default thumbnail text when topic is selected
    if (activeSuggestionTab !== 'memo') {
      setAdditionalRequest('');
    }
    
    // Auto-generate interactive element idea for the selected topic
    if (shouldIncludeInteractiveElement) {
        setIsSuggestingInteractiveElement(true);
        try {
            const idea = await suggestInteractiveElementForTopic(selectedTopic);
            setInteractiveElementIdea(idea);
        } catch (e) {
            console.error("Failed to auto-suggest interactive element", e);
        } finally {
            setIsSuggestingInteractiveElement(false);
        }
    }

    document.getElementById('generation-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    // For the integrated version in manual tab
    document.getElementById('generation-section-manual')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
  };

  const handleTopicSelectFromFighter = async (title: string, context: string) => {
    setTopic(title);
    setThumbnailText(title);
    setAdditionalRequest(context);
    
    // Auto-generate interactive element idea for the selected topic
    setIsSuggestingInteractiveElement(true);
    try {
        const idea = await suggestInteractiveElementForTopic(title);
        setInteractiveElementIdea(idea);
    } catch (e) {
        console.error("Failed to auto-suggest interactive element", e);
    } finally {
        setIsSuggestingInteractiveElement(false);
    }

    // The main tab no longer needs to be switched.
    // The generation section is always visible, so just scroll to it.
    document.getElementById('generation-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
  };

  const handleSuggestInteractiveElement = async () => {
    if (!topic.trim()) return;
    setIsSuggestingInteractiveElement(true);
    try {
      const idea = await suggestInteractiveElementForTopic(topic);
      setInteractiveElementIdea(idea);
    } catch (e) {
      console.error("Failed to suggest interactive element", e);
      setInteractiveElementIdea("오류: 인터랙티브 요소 아이디어를 가져오지 못했습니다.");
    } finally {
      setIsSuggestingInteractiveElement(false);
    }
  };
  
  useEffect(() => {
    setInteractiveElementIdea(null);
    if (shouldIncludeInteractiveElement && topic.trim()) {
      setIsSuggestingInteractiveElement(true);
      const handler = setTimeout(async () => {
        try {
          const idea = await suggestInteractiveElementForTopic(topic);
          setInteractiveElementIdea(idea);
        } catch (e) {
          console.error("Failed to suggest interactive element", e);
          setInteractiveElementIdea("오류: 인터랙티브 요소 아이디어를 가져오지 못했습니다.");
        } finally {
          setIsSuggestingInteractiveElement(false);
        }
      }, 800); // Debounce API call

      return () => {
        clearTimeout(handler);
        setIsSuggestingInteractiveElement(false);
      };
    }
  }, [shouldIncludeInteractiveElement, topic]);


  const handleGenerate = useCallback(async () => {
    if (!topic) {
      setError('블로그 주제를 입력해주세요.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedContent(null);

    try {
      let finalInteractiveElementIdea = shouldIncludeInteractiveElement ? interactiveElementIdea : null;
      
      // If we need an interactive element but it's not ready yet, try to get it now
      if (shouldIncludeInteractiveElement && !finalInteractiveElementIdea && topic) {
          try {
              finalInteractiveElementIdea = await suggestInteractiveElementForTopic(topic);
              setInteractiveElementIdea(finalInteractiveElementIdea);
          } catch (e) {
              console.error("Failed to generate interactive element idea on the fly", e);
          }
      }

      const finalRawContent = activeSuggestionTab === 'memo' ? memoContent : null;
      
      const currentDate = new Date();
      const formattedDate = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
      }).format(currentDate);

      const content = await generateBlogPost(topic, selectedTheme, shouldGenerateImage, shouldGenerateSubImages, finalInteractiveElementIdea, finalRawContent, humanLikeWritingStyle === 'none' ? null : humanLikeWritingStyle, additionalRequest, thumbnailAspectRatio, formattedDate);
      setGeneratedContent(content);

      // Auto-generate thumbnail if option is enabled and we have an image
      if (shouldAddThumbnailText && content.imageBase64 && thumbnailText) {
          try {
              const imageSrc = `data:image/jpeg;base64,${content.imageBase64}`;
              const dataUrl = await createThumbnail(imageSrc, thumbnailText, thumbnailAspectRatio, thumbnailFont, thumbnailColor, thumbnailFontSize, thumbnailOutlineWidth);
              setThumbnailDataUrl(dataUrl);
          } catch (thumbnailErr) {
              console.error("Failed to auto-generate thumbnail:", thumbnailErr);
              // We don't necessarily want to block the whole process if only thumbnail fails
          }
      }
    } catch (err) {
        setError(formatErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [topic, selectedTheme, shouldGenerateImage, shouldGenerateSubImages, interactiveElementIdea, shouldIncludeInteractiveElement, activeSuggestionTab, memoContent, humanLikeWritingStyle, additionalRequest, thumbnailAspectRatio]);

  const handleGenerateImage = async () => {
    if (!generatedContent?.supplementaryInfo.imagePrompt) return;

    setIsGeneratingImage(true);
    setError(null);
    try {
        const newImageBase64 = await generateImage(generatedContent.supplementaryInfo.imagePrompt, thumbnailAspectRatio);
        if (newImageBase64) {
            setGeneratedContent(prev => {
                if (!prev) return null;
                return { ...prev, imageBase64: newImageBase64 };
            });
        } else {
             setError("이미지를 생성하지 못했습니다.");
        }
    } catch (err) {
        setError(formatErrorMessage(err));
    } finally {
        setIsGeneratingImage(false);
    }
  };
  
  const handleGenerateSubImage = async (index: number) => {
    if (!generatedContent?.subImages?.[index]?.prompt) return;

    setIsGeneratingSubImages(prev => ({ ...prev, [index]: true }));
    setError(null);
    try {
        const prompt = generatedContent.subImages[index].prompt;
        const newImageBase64 = await generateImage(prompt, '16:9');
        if (newImageBase64) {
            setGeneratedContent(prev => {
                if (!prev || !prev.subImages) return prev;
                const newSubImages = [...prev.subImages];
                newSubImages[index] = { ...newSubImages[index], base64: newImageBase64 };
                return { ...prev, subImages: newSubImages };
            });
        } else {
            setError(`서브 이미지 #${index + 1}을(를) 생성하지 못했습니다.`);
        }
    } catch (err) {
        setError(formatErrorMessage(err));
    } finally {
        setIsGeneratingSubImages(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleRegenerate = useCallback(async () => {
    if (!regenerationFeedback.trim() || !generatedContent) {
      setError('피드백을 입력해주세요.');
      return;
    }
    setError(null);
    setIsRegenerating(true);

    try {
      const currentDate = new Date();
      const formattedDate = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
      }).format(currentDate);
      
      const newHtml = await regenerateBlogPostHtml(generatedContent.blogPostHtml, regenerationFeedback, selectedTheme, formattedDate);
      setGeneratedContent(prev => {
        if (!prev) return null;
        return { ...prev, blogPostHtml: newHtml };
      });
      setRegenerationFeedback('');
      document.querySelector('.md\\:col-span-2.bg-gray-800')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setIsRegenerating(false);
    }
  }, [generatedContent, regenerationFeedback, selectedTheme]);

  const createThumbnail = (
      baseImageSrc: string, 
      text: string, 
      aspectRatio: '16:9' | '1:1',
      font: string,
      color: string,
      size: number,
      outlineWidth: number
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return reject(new Error('Could not get canvas context'));
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const targetWidth = 1200;
            const targetAspectRatioValue = aspectRatio === '16:9' ? 16 / 9 : 1;
            const targetHeight = Math.round(targetWidth / targetAspectRatioValue);

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            // Center-crop logic
            const sourceAspectRatio = img.width / img.height;
            let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

            if (sourceAspectRatio > targetAspectRatioValue) {
                sWidth = img.height * targetAspectRatioValue;
                sx = (img.width - sWidth) / 2;
            } else if (sourceAspectRatio < targetAspectRatioValue) {
                sHeight = img.width / targetAspectRatioValue;
                sy = (img.height - sHeight) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
            
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const padding = Math.floor(targetWidth * 0.1);
            const maxWidth = targetWidth - padding;
            const maxHeight = targetHeight - padding;

            const getWrappedLines = (context: CanvasRenderingContext2D, textToWrap: string, maxWidth: number): string[] => {
                const words = textToWrap.trim().split(/\s+/).filter(w => w.length > 0);
                if (words.length === 0) return [];
                let line = '';
                const lines: string[] = [];
                
                if (words.length === 1 && context.measureText(words[0]).width > maxWidth) {
                    return [words[0]];
                }

                for (const word of words) {
                    const testLine = line ? `${line} ${word}` : word;
                    if (context.measureText(testLine).width > maxWidth && line) {
                        lines.push(line);
                        line = word;
                    } else {
                        line = testLine;
                    }
                }
                if (line) lines.push(line);
                
                // Balance the last line if it's too short
                if (lines.length > 1) {
                    const lastLine = lines[lines.length - 1];
                    const secondLastLine = lines[lines.length - 2];
                    const lastLineWords = lastLine.split(' ');
                    if (lastLineWords.length <= 2) {
                        const secondLastLineWords = secondLastLine.split(' ');
                        if (secondLastLineWords.length > 1) {
                            const wordToMove = secondLastLineWords.pop();
                            lines[lines.length - 2] = secondLastLineWords.join(' ');
                            lines[lines.length - 1] = `${wordToMove} ${lastLine}`;
                        }
                    }
                }
                
                return lines;
            };

            const textForWrapping = text.replace(/\s*\/\s*/g, '\n');
            let fontSize = size;
            let lines: string[] = [];
            let lineHeight = 0;

            while (fontSize > 20) {
                ctx.font = `700 ${fontSize}px '${font}', sans-serif`;
                lineHeight = fontSize * 1.2;
                
                const paragraphs = textForWrapping.split('\n');
                const tempLines: string[] = [];
                paragraphs.forEach(p => {
                    tempLines.push(...getWrappedLines(ctx, p, maxWidth));
                });
                lines = tempLines;
                
                const totalTextHeight = lines.length * lineHeight;
                const isAnyWordTooWide = textForWrapping.replace('\n', ' ').split(/\s+/).some(word => ctx.measureText(word).width > maxWidth);

                if (totalTextHeight <= maxHeight && !isAnyWordTooWide) {
                    break;
                }
                fontSize -= 4;
            }

            const totalTextHeight = lines.length * lineHeight;
            let currentY = (targetHeight - totalTextHeight) / 2 + lineHeight / 2;

            // Set styles for text outline to ensure readability on any background
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.lineWidth = outlineWidth;
            ctx.lineJoin = 'round';

            for (const line of lines) {
                if (outlineWidth > 0) {
                    // Draw outline first
                    ctx.strokeText(line, targetWidth / 2, currentY);
                }
                // Draw white text on top
                ctx.fillStyle = color;
                ctx.fillText(line, targetWidth / 2, currentY);
                currentY += lineHeight;
            }
            
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = () => reject(new Error('Failed to load image for thumbnail.'));
        img.src = baseImageSrc;
    });
  };

  const handleGenerateThumbnail = async () => {
      if (!generatedContent?.imageBase64 || !thumbnailText) return;
      setIsGeneratingThumbnail(true);
      setError(null);
      try {
          const imageSrc = `data:image/jpeg;base64,${generatedContent.imageBase64}`;
          const dataUrl = await createThumbnail(imageSrc, thumbnailText, thumbnailAspectRatio, thumbnailFont, thumbnailColor, thumbnailFontSize, thumbnailOutlineWidth);
          setThumbnailDataUrl(dataUrl);
      } catch (err) {
          setError(formatErrorMessage(err));
      } finally {
          setIsGeneratingThumbnail(false);
      }
  };
  
  const mainTabButtonStyle = (tabName: MainTab) => 
    `px-3.5 sm:px-4 py-2 text-sm sm:text-base font-bold transition-all duration-200 rounded-t-lg focus:outline-none ${
      mainTab === tabName
      ? 'bg-white text-slate-900 border-t-2 border-teal-600 shadow-xs'
      : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
    }`;
  
  const suggestionTabButtonStyle = (tabName: TopicSuggestionTab) => 
    `px-4 py-2 text-base font-semibold border-b-2 transition-colors duration-200 focus:outline-none ${
      activeSuggestionTab === tabName
      ? 'border-teal-600 text-teal-700'
      : 'border-transparent text-slate-500 hover:text-slate-800'
    }`;
  
  const SuggestionButton: React.FC<{ onClick: () => void, disabled: boolean, text: string }> = ({ onClick, disabled, text }) => (
     <button
        onClick={onClick}
        disabled={disabled}
        className="w-full bg-teal-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-teal-700 transition-all duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center shadow-xs"
      >
        {disabled ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        ) : text}
      </button>
  );

  const WritingStyleButton: React.FC<{
    style: 'none' | 'A' | 'B';
    currentStyle: 'none' | 'A' | 'B';
    onClick: (style: 'none' | 'A' | 'B') => void;
    tooltip: string;
    children: React.ReactNode;
  }> = ({ style, currentStyle, onClick, tooltip, children }) => (
    <div className="relative group flex items-center">
      <button onClick={() => onClick(style)}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${currentStyle === style ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
        {children}
      </button>
      <span className="ml-2 text-slate-400 cursor-help border border-slate-300 rounded-full w-4 h-4 flex items-center justify-center text-xs">?</span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {tooltip}
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col">
      <Header 
        onGoHome={() => handleManualTabSwitch('realEstate')} 
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={mainTab}
        onSelectTab={handleManualTabSwitch}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      <div className="flex-grow">
        <main className="w-full max-w-[850px] mx-auto px-4 sm:px-6 py-6">
          <div className="mb-6 pb-3 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 tracking-tight flex items-center space-x-2">
              <span>{
                mainTab === 'realEstate' ? '🏢 부동산/분양' :
                mainTab === 'hotPlace' ? '☕ 맛집/카페/여행' :
                mainTab === 'sanYakBoGam' ? '🌿 산약보감' :
                mainTab === 'generator' ? '💡 주제 아이디어 얻기' :
                mainTab === 'keywordFighter' ? '⚔️ 키워드 파이터 PRO' :
                '🔗 트렌드 바로가기'
              }</span>
            </h2>
          </div>

          <div className="bg-white py-2">
            {mainTab === 'realEstate' && (
              <RealEstateAnalyzer 
                onAnalyze={handleAnalyzeRealEstate}
                isAnalyzing={isAnalyzingRealEstate}
                selectedTheme={selectedTheme}
                onThemeChange={setSelectedTheme}
                thumbnailSettings={{
                  text: thumbnailText,
                  font: thumbnailFont,
                  color: thumbnailColor,
                  fontSize: thumbnailFontSize,
                  outlineWidth: thumbnailOutlineWidth,
                  setText: setThumbnailText,
                  setFont: setThumbnailFont,
                  setColor: setThumbnailColor,
                  setFontSize: setThumbnailFontSize,
                  setOutlineWidth: setThumbnailOutlineWidth
                }}
              />
            )}

            {mainTab === 'generator' && (
              <div>
                {/* --- Topic Suggestion Section --- */}
                <div>
                  {/* Tab Navigation */}
                  <div className="border-b border-slate-200 mb-4">
                      <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                          <button onClick={() => handleSuggestionTabChange('eeat')} className={suggestionTabButtonStyle('eeat')}>E-E-A-T 기반</button>
                          <button onClick={() => handleSuggestionTabChange('category')} className={suggestionTabButtonStyle('category')}>카테고리별</button>
                          <button onClick={() => handleSuggestionTabChange('evergreen')} className={suggestionTabButtonStyle('evergreen')}>에버그린 콘텐츠</button>
                          <button onClick={() => handleSuggestionTabChange('longtail')} className={suggestionTabButtonStyle('longtail')}>롱테일 키워드 주제</button>
                          <button onClick={() => handleSuggestionTabChange('memo')} className={suggestionTabButtonStyle('memo')}>메모/파일 기반</button>
                      </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="pt-4">
                    {activeSuggestionTab === 'eeat' && (
                      <div className="space-y-4">
                        <p className="text-slate-500 text-sm">구글 SEO의 핵심인 E-E-A-T(경험, 전문성, 권위성, 신뢰성) 원칙을 만족시키는 주제를 추천받으세요. 사용자의 실제 경험과 전문 지식을 효과적으로 보여주어 블로그의 신뢰도를 높이고 검색 순위 상승을 목표로 합니다.</p>
                        <div>
                            <label htmlFor="eeat-category" className="block text-sm font-medium text-slate-700 mb-2">콘텐츠 유형 선택</label>
                            <select id="eeat-category" value={selectedEeatCategory} onChange={(e) => setSelectedEeatCategory(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white">
                              {EEAT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="eeat-sub-category" className="block text-sm font-medium text-slate-700 mb-2">콘텐츠 분야 선택</label>
                            <select id="eeat-sub-category" value={selectedEeatSubCategory} onChange={(e) => setSelectedEeatSubCategory(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white">
                              {(EEAT_SUB_CATEGORIES_MAP[selectedEeatCategory] || []).map(subCat => (
                                <option key={subCat} value={subCat}>{subCat}</option>
                              ))}
                            </select>
                        </div>
                        <SuggestionButton
                              onClick={() => {
                                handleSuggestTopics((currentDate) => generateEeatTopicSuggestions(selectedEeatSubCategory, selectedEeatCategory, currentDate));
                              }}
                              disabled={isSuggestingTopics || !selectedEeatSubCategory}
                              text="E-E-A-T 주제 추천받기"
                          />
                      </div>
                    )}
                    {activeSuggestionTab === 'category' && (
                      <div className="space-y-4">
                        <p className="text-slate-500 text-sm">선택한 카테고리 내에서 독자의 흥미를 끌고 소셜 미디어 공유를 유도할 만한 최신 트렌드 및 인기 주제를 추천받으세요. 광범위한 독자층을 대상으로 하는 매력적인 콘텐츠 아이디어를 얻을 수 있습니다.</p>
                        <div>
                          <label htmlFor="gen-category" className="block text-sm font-medium text-slate-700 mb-2">카테고리 선택</label>
                          <select id="gen-category" value={selectedGenCategory} onChange={(e) => setSelectedGenCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white">
                            {GENERAL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                        {selectedGenCategory === '기타(사용자입력)' && (
                          <div>
                            <label htmlFor="custom-gen-category" className="block text-sm font-medium text-slate-700 mb-2">사용자 입력</label>
                            <input type="text" id="custom-gen-category" value={customGenCategory} onChange={(e) => setCustomGenCategory(e.target.value)} placeholder="관심 카테고리를 입력하세요" className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white" />
                          </div>
                        )}
                        <SuggestionButton 
                          onClick={() => handleSuggestTopics((currentDate) => generateCategoryTopicSuggestions(selectedGenCategory === '기타(사용자입력)' ? customGenCategory : selectedGenCategory, currentDate))}
                          disabled={isSuggestingTopics || (selectedGenCategory === '기타(사용자입력)' && !customGenCategory.trim())}
                          text="카테고리별 주제 추천받기"
                        />
                      </div>
                    )}

                    {activeSuggestionTab === 'evergreen' && (
                      <div className="space-y-4">
                        <p className="text-slate-500 text-sm">시간이 흘러도 가치가 변하지 않아 꾸준한 검색 트래픽을 유도할 수 있는 '에버그린' 주제를 추천받으세요. 'How-to 가이드', '궁극의 가이드' 등 한번 작성해두면 장기적으로 블로그의 자산이 되는 콘텐츠 아이디어를 얻을 수 있습니다.</p>
                        <div>
                          <label htmlFor="evergreen-category" className="block text-sm font-medium text-slate-700 mb-2">콘텐츠 유형 선택</label>
                          <select id="evergreen-category" value={selectedEvergreenCategory} onChange={(e) => setSelectedEvergreenCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white">
                            {EVERGREEN_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="evergreen-field" className="block text-sm font-medium text-slate-700 mb-2">콘텐츠 분야 선택</label>
                            <select id="evergreen-field" value={selectedEvergreenField} onChange={(e) => setSelectedEvergreenField(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white">
                              {GENERAL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        {selectedEvergreenField === '기타(사용자입력)' && (
                          <div>
                            <label htmlFor="custom-evergreen-field" className="block text-sm font-medium text-slate-700 mb-2">분야 직접 입력</label>
                            <input type="text" id="custom-evergreen-field" value={customEvergreenField} onChange={(e) => setCustomEvergreenField(e.target.value)} placeholder="관심 분야를 입력하세요" className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white" />
                          </div>
                        )}
                        <SuggestionButton 
                           onClick={() => {
                                const field = selectedEvergreenField === '기타(사용자입력)' ? customEvergreenField : selectedEvergreenField;
                                handleSuggestTopics((currentDate) => generateEvergreenTopicSuggestions(field, selectedEvergreenCategory, currentDate));
                            }}
                          disabled={isSuggestingTopics || (selectedEvergreenField === '기타(사용자입력)' && !customEvergreenField.trim())}
                          text="에버그린 주제 추천받기"
                        />
                      </div>
                    )}

                    {activeSuggestionTab === 'longtail' && (
                      <div className="space-y-4">
                          <p className="text-slate-500 text-sm">실시간 구글 검색을 활용하여, 검색량은 적지만 명확한 목적을 가진 사용자를 타겟으로 하는 '롱테일 키워드' 주제를 추천받으세요. 경쟁이 낮아 상위 노출에 유리하며, 구매나 특정 행동으로 이어질 확률이 높은 잠재고객을 유치하는 데 효과적입니다.</p>
                          <div>
                              <label htmlFor="longtail-category" className="block text-sm font-medium text-slate-700 mb-2">콘텐츠 유형 선택</label>
                              <select id="longtail-category" value={selectedLongtailCategory} onChange={(e) => setSelectedLongtailCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:bg-white">
                                  {LONGTAIL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                          </div>
                          <SuggestionButton 
                              onClick={() => handleSuggestTopics((currentDate) => generateLongtailTopicSuggestions(selectedLongtailCategory, currentDate))}
                              disabled={isSuggestingTopics}
                              text="롱테일 주제 추천받기"
                          />
                      </div>
                    )}

                    {activeSuggestionTab === 'memo' && (
                      <div className="space-y-4">
                        <p className="text-slate-500 text-sm">가지고 있는 아이디어 메모, 초안, 강의 노트, 관련 자료 파일 등을 기반으로 블로그 주제를 추천받으세요. AI가 핵심 내용을 분석하여 가장 매력적이고 발전 가능성이 높은 포스트 제목을 제안해 드립니다.</p>
                        <div>
                          <label htmlFor="memo-content" className="block text-sm font-medium text-slate-700 mb-2">메모/초안 입력</label>
                          <textarea id="memo-content" value={memoContent} onChange={(e) => setMemoContent(e.target.value)} rows={6} placeholder="여기에 아이디어를 자유롭게 작성하거나 아래 버튼을 통해 파일을 업로드하세요." className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:bg-white"></textarea>
                        </div>
                        <div className="flex items-center space-x-2">
                            <label htmlFor="file-upload" className="cursor-pointer bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-md hover:bg-slate-200 transition-colors duration-200 inline-flex items-center border border-slate-200 shadow-2xs">
                                <span className="mr-2">📤</span>
                                <span>파일 업로드 (.txt, .md 등)</span>
                            </label>
                            <input id="file-upload" type="file" multiple accept=".txt,.md,.html,.js,.jsx,.ts,.tsx,.json,.css" className="hidden" onChange={handleFileChange} />
                            {uploadedFileNames.length > 0 && (
                                <span className="text-sm text-slate-500 truncate">{uploadedFileNames.join(', ')}</span>
                            )}
                        </div>
                        <SuggestionButton 
                          onClick={() => handleSuggestTopics((currentDate) => generateTopicsFromMemo(memoContent, currentDate))}
                          disabled={isSuggestingTopics || !memoContent.trim()}
                          text="메모 기반 주제 추천받기"
                        />
                      </div>
                    )}
                  </div>

                  {/* Topic Suggestion Results */}
                  {suggestionError && (
                    <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-sm">{suggestionError}</div>
                  )}
                  {suggestedTopics.length > 0 && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <h4 className="text-md font-semibold text-slate-800 mb-3">추천 주제:</h4>
                        <ul className="space-y-2">
                            {suggestedTopics.map((sTopic, index) => (
                                <li key={index} 
                                    onClick={() => handleTopicSelect(sTopic)}
                                    className="p-3 bg-white border border-slate-200 rounded-md cursor-pointer hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 transition-colors duration-200 text-sm text-slate-700 shadow-2xs">
                                    {sTopic}
                                </li>
                            ))}
                        </ul>
                    </div>
                  )}
                </div>

                {/* --- Integrated Main Generation Section --- */}
                <div id="generation-section" className="mt-12 pt-10 border-t border-neutral-200 space-y-8">
                    <h3 className="text-lg font-bold text-neutral-900 flex items-center">
                      <span className="mr-2">✨</span> 포스트 생성하기
                    </h3>
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-8 flex flex-col">
                          {/* Blog Topic Input */}
                          <div>
                            <label htmlFor="blog-topic" className="block text-neutral-900 font-bold text-xs uppercase tracking-wider mb-2">블로그 주제</label>
                            <input
                                type="text"
                                id="blog-topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="예: 2024년 최고의 AI 생산성 도구 5가지"
                                className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-900 rounded-none px-1 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none transition-colors text-base"
                            />
                          </div>

                          {/* Color Theme Selector */}
                          <div>
                            <label className="block text-neutral-900 font-bold text-xs uppercase tracking-wider mb-3">컬러 테마</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {COLOR_THEMES.map((theme) => (
                                <button
                                    key={theme.name}
                                    type="button"
                                    onClick={() => setSelectedTheme(theme)}
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

                          {/* Additional Request Input */}
                          <div className="flex-grow flex flex-col">
                              <label htmlFor="additional-request" className="block text-neutral-900 font-bold text-xs uppercase tracking-wider mb-2">
                                  {activeSuggestionTab === 'memo' ? '메모 기반 생성 추가 요청사항' : '기사에 반영할 추가 요청사항'}
                              </label>
                              <textarea
                                  id="additional-request"
                                  value={additionalRequest}
                                  onChange={(e) => setAdditionalRequest(e.target.value)}
                                  placeholder={activeSuggestionTab === 'memo' ? "예: 초보자의 시각에서 더 쉽게 설명해주세요." : "예: 글 마지막에 행동 촉구 문구를 추가해주세요."} 
                                  className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-900 rounded-none px-1 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none transition-colors h-28 resize-none text-base"
                              ></textarea>
                          </div>
                      </div>

                      <div className="space-y-8 flex flex-col justify-between">
                          {/* Advanced Options Card */}
                          <div className="space-y-6">
                            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-200 pb-2">
                              고급 옵션
                            </h4>
                            
                            <div className="space-y-5">
                                {/* AI Image Option */}
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                      <input id="gen-image" type="checkbox" checked={shouldGenerateImage} onChange={(e) => setShouldGenerateImage(e.target.checked)} className="h-4 w-4 text-neutral-900 border-neutral-300 rounded focus:ring-0 cursor-pointer" />
                                  </div>
                                  <div className="ml-3 text-sm">
                                      <label htmlFor="gen-image" className="font-semibold text-neutral-800 cursor-pointer">대표 이미지 생성 (Gemini 2.5 Flash Image)</label>
                                      <p className="text-neutral-400 text-xs mt-0.5">포스트 주제에 딱 맞는 고품질 AI 이미지를 생성합니다.</p>
                                  </div>
                                </div>

                                {/* Sub Images Option */}
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                      <input id="gen-sub-images" type="checkbox" checked={shouldGenerateSubImages} onChange={(e) => setShouldGenerateSubImages(e.target.checked)} className="h-4 w-4 text-neutral-900 border-neutral-300 rounded focus:ring-0 cursor-pointer" />
                                  </div>
                                  <div className="ml-3 text-sm">
                                      <label htmlFor="gen-sub-images" className="font-semibold text-neutral-800 cursor-pointer">본문 서브 이미지 추가 (2~3장)</label>
                                      <p className="text-neutral-400 text-xs mt-0.5">글 중간중간 맥락에 맞는 이미지를 배치하여 가독성을 높입니다.</p>
                                  </div>
                                </div>
                                
                                {/* Thumbnail Text Option */}
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input id="add-thumbnail-text" type="checkbox" checked={shouldAddThumbnailText} onChange={(e) => setShouldAddThumbnailText(e.target.checked)} className="h-4 w-4 text-neutral-900 border-neutral-300 rounded focus:ring-0 cursor-pointer" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="add-thumbnail-text" className="font-semibold text-neutral-800 cursor-pointer">썸네일용 텍스트 추가 (대표 이미지)</label>
                                        <p className="text-neutral-400 text-xs mt-0.5">이미지 위에 클릭을 유도하는 제목 텍스트를 합성합니다.</p>
                                    </div>
                                </div>

                                {shouldAddThumbnailText && (
                                    <div className="pl-7 space-y-4 pt-2 border-t border-neutral-100 mt-2">
                                        <div>
                                            <label htmlFor="thumbnail-text-new" className="block text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">썸네일 텍스트</label>
                                            <input 
                                                type="text" 
                                                id="thumbnail-text-new" 
                                                value={thumbnailText} 
                                                onChange={(e) => setThumbnailText(e.target.value)} 
                                                placeholder="글 생성 후 SEO 제목이 자동으로 제안됩니다." 
                                                className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-2 text-neutral-800 focus:outline-none transition-colors text-base placeholder-neutral-400" 
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Aspect Ratio Selection */}
                                <div className="pt-2 border-t border-neutral-100">
                                    <label className="block text-neutral-900 font-bold text-xs uppercase tracking-wider mb-2">이미지 비율 (Gemini 2.5 Image)</label>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setThumbnailAspectRatio('16:9')}
                                            className={`px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${thumbnailAspectRatio === '16:9' ? 'bg-neutral-900 text-white font-medium' : 'bg-transparent border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
                                        >
                                            16:9 와이드
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setThumbnailAspectRatio('1:1')}
                                            className={`px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${thumbnailAspectRatio === '1:1' ? 'bg-neutral-900 text-white font-medium' : 'bg-transparent border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
                                        >
                                            1:1 정사각형
                                        </button>
                                    </div>
                                </div>

                                {/* Interactive Element Option */}
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                      <input id="gen-interactive" type="checkbox" checked={shouldIncludeInteractiveElement} onChange={(e) => setShouldIncludeInteractiveElement(e.target.checked)} className="h-4 w-4 text-neutral-900 border-neutral-300 rounded focus:ring-0 cursor-pointer" />
                                  </div>
                                  <div className="ml-3 text-sm">
                                      <label htmlFor="gen-interactive" className="font-semibold text-neutral-800 cursor-pointer">인터랙티브 요소 추가</label>
                                      <p className="text-neutral-400 text-xs mt-0.5">계산기, 대화형 퀴즈 등 독자가 참여할 수 있는 요소를 포함합니다.</p>
                                  </div>
                                </div>

                                {shouldIncludeInteractiveElement && (
                                  <div className="pl-7 space-y-2 pt-1">
                                      <div className="flex items-center justify-between">
                                        <label className="block text-neutral-500 text-xs font-semibold uppercase tracking-wider">요소 아이디어</label>
                                        <button
                                            onClick={handleSuggestInteractiveElement}
                                            disabled={isSuggestingInteractiveElement || !topic}
                                            className="text-xs text-neutral-700 underline font-semibold disabled:opacity-50 cursor-pointer"
                                        >
                                            {isSuggestingInteractiveElement ? '생각 중...' : '아이디어 추천받기'}
                                        </button>
                                      </div>
                                      <input
                                        type="text"
                                        value={interactiveElementIdea || ''}
                                        onChange={(e) => setInteractiveElementIdea(e.target.value)}
                                        placeholder="예: 나에게 맞는 다이어트 식단 추천 퀴즈"
                                        className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-800 rounded-none px-1 py-1.5 text-neutral-800 focus:outline-none transition-colors text-sm"
                                      />
                                  </div>
                                )}

                                {/* Human-like Writing Option */}
                                <div className="pt-2 border-t border-neutral-100">
                                    <label className="block text-neutral-900 font-bold text-xs uppercase tracking-wider mb-2 flex items-center">
                                        인간적인 글쓰기 스타일 (GEMS V3.0)
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

                          {/* Generate Button Container */}
                          <div className="pt-4">
                              <button
                                  onClick={handleGenerate}
                                  disabled={isLoading || !topic}
                                  className="w-full h-14 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-base rounded-lg transition-all disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                              >
                                  {isLoading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        <span>AI 포스트 생성 중... (약 1분 소요)</span>
                                    </div>
                                  ) : (
                                    <>
                                        <span>🚀</span>
                                        <span>블로그 포스트 생성하기</span>
                                    </>
                                  )}
                              </button>
                          </div>
                      </div>
                  </div>
                </div>
              </div>
            )}

            {mainTab === 'hotPlace' && (
              <HotPlaceAnalyzer 
                onAnalyze={handleAnalyzeHotPlace}
                isAnalyzing={isAnalyzingHotPlace}
                selectedTheme={selectedTheme}
                onThemeChange={setSelectedTheme}
                thumbnailSettings={{
                  text: thumbnailText,
                  font: thumbnailFont,
                  color: thumbnailColor,
                  fontSize: thumbnailFontSize,
                  outlineWidth: thumbnailOutlineWidth,
                  setText: setThumbnailText,
                  setFont: setThumbnailFont,
                  setColor: setThumbnailColor,
                  setFontSize: setThumbnailFontSize,
                  setOutlineWidth: setThumbnailOutlineWidth
                }}
              />
            )}

            {mainTab === 'sanYakBoGam' && (
              <SanYakBoGamAnalyzer 
                onAnalyze={handleAnalyzeSanYakBoGam}
                isAnalyzing={isAnalyzingSanYakBoGam}
                selectedTheme={selectedTheme}
                onThemeChange={setSelectedTheme}
                thumbnailSettings={{
                  text: thumbnailText,
                  font: thumbnailFont,
                  color: thumbnailColor,
                  fontSize: thumbnailFontSize,
                  outlineWidth: thumbnailOutlineWidth,
                  setText: setThumbnailText,
                  setFont: setThumbnailFont,
                  setColor: setThumbnailColor,
                  setFontSize: setThumbnailFontSize,
                  setOutlineWidth: setThumbnailOutlineWidth
                }}
              />
            )}

            {mainTab === 'keywordFighter' && (
               <div className="space-y-10">
                 <KeywordFighter 
                      onTopicSelect={handleTopicSelectFromFighter} 
                      isNaverApiConfigured={apiStatus === 'success'}
                      naverClientId={naverClientId}
                      naverClientSecret={naverClientSecret}
                  />
                  
                  {/* --- Integrated Generation Section for Keyword Fighter --- */}
                  <div id="generation-section-kf" className="mt-12 pt-10 border-t border-neutral-200 space-y-8">
                      <h3 className="text-lg font-bold text-neutral-900 flex items-center">
                        <span className="mr-2">✨</span> 포스트 생성하기
                      </h3>
                      <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-8 flex flex-col">
                              <div>
                                  <label htmlFor="blog-topic-kf" className="block text-neutral-900 font-bold text-xs uppercase tracking-wider mb-2">블로그 주제</label>
                                  <input
                                      type="text"
                                      id="blog-topic-kf"
                                      value={topic}
                                      onChange={(e) => setTopic(e.target.value)}
                                      placeholder="키워드 분석 후 주제가 여기에 입력됩니다."
                                      className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-900 rounded-none px-1 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none transition-colors text-base"
                                  />
                              </div>

                              <div>
                                  <label className="block text-neutral-900 font-bold text-xs uppercase tracking-wider mb-3">컬러 테마</label>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                      {COLOR_THEMES.map((theme) => (
                                      <button
                                          key={theme.name}
                                          type="button"
                                          onClick={() => setSelectedTheme(theme)}
                                          className={`flex items-center p-3 rounded-lg border transition-all text-left cursor-pointer ${
                                          selectedTheme.name === theme.name 
                                              ? 'border-neutral-900 bg-neutral-50/80 font-bold' 
                                              : 'border-neutral-200 bg-transparent hover:border-neutral-400'
                                          }`}
                                      >
                                          <div className="w-3.5 h-3.5 rounded-full mr-3 border border-neutral-300 shrink-0" style={{ backgroundColor: theme.colors.primary }} />
                                          <div>
                                              <div className="text-sm font-semibold text-neutral-800">{theme.name.replace(/^[^\s]+\s/, '')}</div>
                                              <div className="text-[11px] text-neutral-400 mt-0.5">{theme.description}</div>
                                          </div>
                                      </button>
                                      ))}
                                  </div>
                              </div>

                              <div className="flex-grow flex flex-col">
                                  <label htmlFor="additional-request-kf" className="block text-neutral-900 font-bold text-xs uppercase tracking-wider mb-2">기사에 반영할 추가 요청사항</label>
                                  <textarea
                                      id="additional-request-kf"
                                      value={additionalRequest}
                                      onChange={(e) => setAdditionalRequest(e.target.value)}
                                      placeholder="예: 글 마지막에 행동 촉구 문구를 추가해주세요." 
                                      className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-900 rounded-none px-1 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none transition-colors h-28 resize-none text-base"
                                  ></textarea>
                              </div>
                          </div>

                          <div className="space-y-8 flex flex-col justify-between">
                              <div className="space-y-6">
                                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-200 pb-2">
                                      고급 옵션
                                  </h4>
                                  <div className="space-y-4">
                                      <div className="flex items-center"><input type="checkbox" id="kf-image" checked={shouldGenerateImage} onChange={(e) => setShouldGenerateImage(e.target.checked)} className="h-4 w-4 text-neutral-900 border-neutral-300 rounded focus:ring-0 cursor-pointer" /><label htmlFor="kf-image" className="ml-3 text-sm text-neutral-800 cursor-pointer">대표 이미지 생성</label></div>
                                      <div className="flex items-center"><input type="checkbox" id="kf-sub-image" checked={shouldGenerateSubImages} onChange={(e) => setShouldGenerateSubImages(e.target.checked)} className="h-4 w-4 text-neutral-900 border-neutral-300 rounded focus:ring-0 cursor-pointer" /><label htmlFor="kf-sub-image" className="ml-3 text-sm text-neutral-800 cursor-pointer">본문 서브 이미지 추가</label></div>
                                      
                                      <div className="pt-2 border-t border-neutral-100">
                                          <label className="block text-neutral-900 font-bold text-xs uppercase tracking-wider mb-2 flex items-center">
                                              인간적인 글쓰기 스타일
                                              <sup className="text-rose-500 ml-1.5 font-semibold">PRO</sup>
                                          </label>
                                          <div className="flex space-x-2">
                                              <button onClick={() => setHumanLikeWritingStyle('none')} className={`px-4 py-2 text-sm rounded-md transition-all cursor-pointer ${humanLikeWritingStyle === 'none' ? 'bg-neutral-900 text-white font-medium' : 'bg-transparent border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>기본</button>
                                              <button onClick={() => setHumanLikeWritingStyle('A')} className={`px-4 py-2 text-sm rounded-md transition-all cursor-pointer ${humanLikeWritingStyle === 'A' ? 'bg-neutral-900 text-white font-medium' : 'bg-transparent border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>유형 A</button>
                                              <button onClick={() => setHumanLikeWritingStyle('B')} className={`px-4 py-2 text-sm rounded-md transition-all cursor-pointer ${humanLikeWritingStyle === 'B' ? 'bg-neutral-900 text-white font-medium' : 'bg-transparent border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>유형 B</button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="pt-4">
                                  <button
                                      onClick={handleGenerate}
                                      disabled={isLoading || !topic}
                                      className="w-full h-14 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-base rounded-lg transition-all disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                                  >
                                      {isLoading ? '생성 중...' : <><span>🚀</span><span>블로그 포스트 생성하기</span></>}
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
               </div>
            )}

            {mainTab === 'shortcuts' && (
                <Shortcuts />
            )}
          </div>


          <ResultDisplay
            htmlContent={generatedContent?.blogPostHtml || ''}
            isLoading={isLoading || isAnalyzingHotPlace || isAnalyzingRealEstate || isAnalyzingSanYakBoGam}
            supplementaryInfo={generatedContent?.supplementaryInfo || null}
            socialMediaPosts={generatedContent?.socialMediaPosts || null}
            imageBase64={generatedContent?.imageBase64 || null}
            subImages={generatedContent?.subImages || null}
            onGenerateImage={handleGenerateImage}
            isGeneratingImage={isGeneratingImage}
            onGenerateSubImage={handleGenerateSubImage}
            isGeneratingSubImages={isGeneratingSubImages}
            shouldAddThumbnailText={shouldAddThumbnailText}
            onGenerateThumbnail={handleGenerateThumbnail}
            isGeneratingThumbnail={isGeneratingThumbnail}
            thumbnailDataUrl={thumbnailDataUrl}
            thumbnailAspectRatio={thumbnailAspectRatio}
          />

          {/* --- Regeneration Section --- */}
          {!isLoading && generatedContent && (
            <div className="mt-12 pt-8 border-t border-neutral-200 space-y-4">
              <h3 className="text-base font-bold text-neutral-900 flex items-center">
                <span className="mr-2">📝</span> 피드백 및 재작성
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                생성된 기사가 마음에 들지 않으시나요? 아래에 수정하고 싶은 부분을 구체적으로 작성하고 '기사 재작성' 버튼을 클릭하세요. <br />
                이미지, SEO 제목, 키워드 등은 그대로 유지한 채 기사 본문만 피드백에 맞춰 다시 생성됩니다.
              </p>
              <div>
                <label htmlFor="regeneration-feedback" className="block text-neutral-900 font-bold text-xs uppercase tracking-wider mb-2">수정 요청사항</label>
                <textarea
                  id="regeneration-feedback"
                  value={regenerationFeedback}
                  onChange={(e) => setRegenerationFeedback(e.target.value)}
                  rows={3}
                  placeholder="예: 전체적으로 좀 더 전문적인 용어를 사용해주세요. / 3번째 문단의 내용을 더 자세하게 설명해주세요."
                  className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-900 rounded-none px-1 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none transition-colors text-base resize-none"
                />
              </div>
              <div className="pt-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating || !regenerationFeedback.trim()}
                  className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg transition-all disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center justify-center text-sm cursor-pointer"
                >
                  {isRegenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      재작성 중...
                    </>
                  ) : (
                    '기사 재작성'
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        clientId={naverClientId}
        setClientId={setNaverClientId}
        clientSecret={naverClientSecret}
        setClientSecret={setNaverClientSecret}
        status={apiStatus}
        error={apiError}
        onTestAndSave={handleTestAndSaveCredentials}
      />
    </div>
  );
}

export default App;
