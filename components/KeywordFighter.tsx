import React, { useState, useEffect, FC } from 'react';
import { generateTopicsFromMainKeyword, generateTopicsFromAllKeywords, generateBlogStrategy, fetchRecommendedKeywords, generateSustainableTopics, generateSerpStrategy, generateStrategyFromNews } from '../services/keywordService';
import type { SearchSource, Feature, KeywordData, BlogPostData, KeywordMetrics, GeneratedTopic, BlogStrategyReportData, RecommendedKeyword, SustainableTopicCategory, GoogleSerpData, SerpStrategyReportData, PaaItem, SustainableTopicSuggestion, NaverNewsData, NewsStrategyIdea } from '../types';
import { useSearch } from '../hooks/useSearch';
import { formatErrorMessage } from '../lib/utils';
import ResultsTable from './ResultsTable';
import BlogResultsTable from './BlogResultsTable';
import NaverNewsResults from './NaverNewsResults';


// --- UI Components (Inlined for simplicity) ---

const LoadingSpinner: FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="w-12 h-12 border-4 border-t-transparent border-teal-500 rounded-full animate-spin"></div>
    </div>
);

const ErrorMessage: FC<{ message: string | null }> = ({ message }) => (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg my-4" role="alert">
        <strong className="font-bold">오류: </strong>
        <span className="block sm:inline">{message}</span>
    </div>
);

const FeatureSelector: FC<{
    selectedFeature: Feature;
    onSelectFeature: (feature: Feature) => void;
    loading: boolean;
    onReset: () => void;
}> = ({ selectedFeature, onSelectFeature, loading, onReset }) => {
    const features: { id: Feature; name: string; description: string }[] = [
        { id: 'competition', name: '키워드 경쟁력 분석', description: 'AI 기반 키워드 성공 가능성 및 전략 분석' },
        { id: 'keywords', name: '자동완성 키워드 분석', description: 'Google/Naver 자동완성 키워드 조회 및 주제 생성' },
        { id: 'related-keywords', name: 'AI 연관검색어 분석', description: 'Google SERP & PAA 분석 및 콘텐츠 갭 전략' },
        { id: 'naver-news', name: '네이버 실시간 뉴스', description: '키워드 관련 최신 뉴스를 분석하여 AI 전략 수립 (API 필요)' },
        { id: 'blogs', name: '상위 블로그 분석', description: 'Naver 상위 10개 블로그 분석 및 1위 공략법 (API 필요)' },
        { id: 'sustainable-topics', name: '다각도 블로그 주제 발굴', description: '하나의 키워드를 4가지 다른 관점으로 확장' },
        { id: 'recommended', name: '오늘의 전략 키워드', description: 'AI가 실시간으로 발굴한 최신 이슈 키워드를 추천합니다' },
    ];
    
    const tabButtonStyle = (featureId: Feature) => {
        const baseClasses = "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer";

        if (selectedFeature === featureId) {
            return `${baseClasses} bg-neutral-900 text-white`;
        }
        
        return `${baseClasses} bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100`;
    };

    return (
        <div className="mb-6 space-y-4">
             <div className="border-b border-neutral-200 pb-2">
                <nav className="flex space-x-1.5 overflow-x-auto" aria-label="Tabs">
                    {features.map(f => (
                         <button
                            key={f.id}
                            onClick={() => onSelectFeature(f.id)}
                            disabled={loading}
                            className={tabButtonStyle(f.id)}
                        >
                            {f.name}
                        </button>
                    ))}
                </nav>
            </div>
            
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                 <p className="text-neutral-500">
                    💡 {features.find(f => f.id === selectedFeature)?.description}
                </p>
                 <button
                    onClick={onReset}
                    disabled={loading}
                    className="text-neutral-400 hover:text-neutral-700 underline text-xs transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                >
                    초기화
                </button>
            </div>
        </div>
    );
};

const SearchEngineSelector: FC<{
    selectedSource: SearchSource;
    onSelectSource: (source: SearchSource) => void;
    loading: boolean;
}> = ({ selectedSource, onSelectSource, loading }) => {
    const baseStyle = "px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-150 cursor-pointer disabled:opacity-50";
    
    return (
        <div className="mb-4 flex gap-1.5">
            <button 
                onClick={() => onSelectSource('google')} 
                disabled={loading} 
                className={`${baseStyle} ${selectedSource === 'google' ? 'bg-neutral-900 text-white' : 'bg-transparent text-neutral-600 border border-neutral-200 hover:bg-neutral-50'}`}
            >
                Google
            </button>
            <button 
                onClick={() => onSelectSource('naver')} 
                disabled={loading} 
                className={`${baseStyle} ${selectedSource === 'naver' ? 'bg-neutral-900 text-white' : 'bg-transparent text-neutral-600 border border-neutral-200 hover:bg-neutral-50'}`}
            >
                Naver
            </button>
        </div>
    );
};

const KeywordInputForm: FC<{
    onSearch: (keyword: string) => void;
    loading: boolean;
    keyword: string;
    setKeyword: (keyword: string) => void;
    feature: Feature;
    apiOk: boolean;
}> = ({ onSearch, loading, keyword, setKeyword, feature, apiOk }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(keyword);
    };

    const getPlaceholder = () => {
        switch(feature) {
            case 'keywords': return "예: 캠핑";
            case 'related-keywords': return "예: 여름 휴가";
            case 'blogs': return "예: 제주도 맛집";
            case 'naver-news': return "예: 부동산 정책";
            case 'sustainable-topics': return "예: 인공지능";
            case 'competition':
            default:
                return "예: 재택근무";
        }
    }

    const isApiFeature = feature === 'blogs' || feature === 'naver-news';
    const isDisabled = loading || !keyword.trim() || (isApiFeature && !apiOk);

    return (
        <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={getPlaceholder()}
                className="flex-grow bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-900 rounded-none px-1 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none transition-colors text-base"
                disabled={loading}
            />
            <button 
                type="submit" 
                disabled={isDisabled} 
                className="bg-neutral-900 text-white font-medium py-2 px-5 rounded-md hover:bg-neutral-800 transition-colors duration-150 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed shrink-0 text-sm cursor-pointer"
            >
                {loading ? '검색중...' : '키워드 검색'}
            </button>
        </form>
    );
};

const CompetitionAnalysisResults: FC<{ data: KeywordMetrics; onTopicSelect: (title: string, context: string) => void; }> = ({ data, onTopicSelect }) => {
    const scoreColor = (score: number) => score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-rose-600';
    
    const handleSelect = (topic: {title: string, description: string}) => {
        const context = `[경쟁력 분석 기반 컨텍스트]\n- 확장 키워드: ${data.strategy?.expandedKeywords.join(', ')}\n- 상세 공략법: ${topic.description}`;
        onTopicSelect(topic.title, context);
    };

    const removeMarkdown = (text: string) => {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/^- /gm, '');
    };
    
    return (
        <div className="bg-white rounded-lg p-6 space-y-6 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">'{data.keyword}' 키워드 경쟁력 분석</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="text-sm text-slate-600 font-medium">성공 가능성 점수</div>
                    <div className={`text-4xl font-bold ${scoreColor(data.opportunityScore)}`}>{data.opportunityScore}<span className="text-lg text-slate-500">/100</span></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="text-sm text-slate-600 font-medium">검색 관심도 지수</div>
                    <div className={`text-4xl font-bold ${scoreColor(data.searchVolumeEstimate)}`}>{data.searchVolumeEstimate}<span className="text-lg text-slate-500">/100</span></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="text-sm text-slate-600 font-medium">경쟁 난이도 지수</div>
                    <div className={`text-4xl font-bold ${scoreColor(100 - data.competitionScore)}`}>{data.competitionScore}<span className="text-lg text-slate-500">/100</span></div>
                </div>
            </div>
            
            <div className="bg-slate-50/80 p-5 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-lg text-teal-800 mb-2">{removeMarkdown(data.analysis.title)}</h3>
                <p className="text-sm text-slate-700 mb-4">{removeMarkdown(data.analysis.reason)}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-emerald-50/80 p-3 rounded-md border border-emerald-100">
                        <h4 className="font-bold text-emerald-800 mb-1">✅ 기회 요인</h4>
                        <ul className="list-disc list-inside text-slate-700 space-y-1">
                            {data.analysis.opportunity.split('\n').map((item, i) => item && <li key={i}>{removeMarkdown(item)}</li>)}
                        </ul>
                    </div>
                    <div className="bg-rose-50/80 p-3 rounded-md border border-rose-100">
                        <h4 className="font-bold text-rose-800 mb-1">🚨 위협 요인</h4>
                        <ul className="list-disc list-inside text-slate-700 space-y-1">
                            {data.analysis.threat.split('\n').map((item, i) => item && <li key={i}>{removeMarkdown(item)}</li>)}
                        </ul>
                    </div>
                </div>
                 <div className="mt-4 bg-amber-50/80 p-3 rounded-md border border-amber-200">
                    <h4 className="font-bold text-amber-900 mb-1">📊 현재 소비 현황 및 최신 이슈</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 text-sm">
                        {data.analysis.consumptionAndIssues.split('\n').map((item, i) => item && <li key={i}>{removeMarkdown(item)}</li>)}
                    </ul>
                </div>
                <div className="mt-4 border-t border-slate-200 pt-4">
                     <h4 className="font-bold text-slate-800 mb-1">📝 최종 결론 및 실행 전략</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">{removeMarkdown(data.analysis.conclusion)}</p>
                </div>
            </div>

            {data.opportunityScore < 80 ? (
                data.strategy ? (
                    <div className="bg-sky-50 p-4 rounded-lg border border-sky-200">
                        <h3 className="font-semibold text-lg text-sky-900 mb-3">🚀 SEO 공략 전략 제안 (성공 가능성 80점 미만)</h3>
                        <div className="mb-4">
                            <h4 className="font-bold text-slate-800 mb-1 text-sm">확장 키워드</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.strategy.expandedKeywords.map((kw, i) => <span key={i} className="bg-sky-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{kw}</span>)}
                            </div>
                        </div>
                        <div>
                             <h4 className="font-bold text-slate-800 mb-2 text-sm">추천 블로그 주제</h4>
                             <div className="space-y-3">
                                {data.strategy.blogTopics.map((topic, i) => (
                                    <div key={i} onClick={() => handleSelect(topic)} className="bg-white p-3 rounded-md cursor-pointer hover:border-sky-400 border border-slate-200 transition-colors shadow-sm">
                                        <p className="font-semibold text-sky-800">{removeMarkdown(topic.title)}</p>
                                        <p className="text-xs text-slate-600 mt-1">{removeMarkdown(topic.description)}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h3 className="font-semibold text-lg text-slate-700 mb-2">🚀 SEO 공략 전략 제안</h3>
                        <p className="text-sm text-slate-600">AI가 이 키워드에 대한 구체적인 공략 전략을 생성하지 않았습니다. 일반적으로 성공 가능성이 높은 키워드는 별도 전략 없이 바로 콘텐츠를 제작해도 좋습니다.</p>
                    </div>
                )
            ) : (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-lg text-slate-700 mb-2">🚀 SEO 공략 전략 제안</h3>
                    <p className="text-sm text-slate-600">성공 가능성 점수가 80점 이상으로 높아, 별도의 확장 키워드 전략 없이 바로 콘텐츠 제작을 시작하는 것을 추천합니다.</p>
                </div>
            )}
        </div>
    );
};

const BlogTopicSuggestions: FC<{ title: string; data: GeneratedTopic[]; onTopicSelect: (title: string, context: string) => void; }> = ({ title, data, onTopicSelect }) => {
    const handleSelect = (topic: GeneratedTopic) => {
        const context = `[AI 추천 컨텍스트]\n- 썸네일 문구: ${topic.thumbnailCopy}\n- 공략법: ${topic.strategy}`;
        onTopicSelect(topic.title, context);
    };

    return (
        <div className="bg-white rounded-lg p-6 space-y-4 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {data.map(topic => (
                <div key={topic.id} onClick={() => handleSelect(topic)} className="bg-slate-50 p-4 rounded-lg cursor-pointer hover:bg-teal-50/50 hover:border-teal-300 border border-slate-200 transition-colors">
                    <h3 className="font-semibold text-teal-800">{topic.id}. {topic.title}</h3>
                    <p className="text-sm text-emerald-900 my-2 bg-emerald-50 p-2 rounded-md border border-emerald-100 font-medium">💡 썸네일 문구: {topic.thumbnailCopy}</p>
                    <p className="text-sm text-slate-600">{topic.strategy}</p>
                </div>
            ))}
        </div>
    );
};

const BlogStrategyReport: FC<{ data: BlogStrategyReportData; onTopicSelect: (title: string, context: string) => void; }> = ({ data, onTopicSelect }) => {
    const handleSelect = (topic: GeneratedTopic) => {
        const context = `[상위 블로그 분석 기반 컨텍스트]\n- 썸네일 문구: ${topic.thumbnailCopy}\n- 공략법: ${topic.strategy}`;
        onTopicSelect(topic.title, context);
    };
    return (
        <div className="bg-white rounded-lg p-6 space-y-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">상위 블로그 분석 및 1위 공략 제안</h2>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-lg text-teal-800 mb-2">상위 10개 포스트 제목 분석</h3>
                <div className="space-y-2 text-sm text-slate-700">
                    <p><strong className="text-slate-900">구조적 특징:</strong> {data.analysis.structure}</p>
                    <p><strong className="text-slate-900">감성적 특징:</strong> {data.analysis.characteristics}</p>
                    <p><strong className="text-slate-900">공통 키워드:</strong> {data.analysis.commonKeywords}</p>
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-lg text-teal-800 mb-2">1위 공략을 위한 콘텐츠 제안</h3>
                <div className="space-y-4">
                    {data.suggestions.map(topic => (
                        <div key={topic.id} onClick={() => handleSelect(topic)} className="bg-slate-50 p-4 rounded-lg cursor-pointer hover:bg-teal-50/50 hover:border-teal-300 border border-slate-200 transition-colors">
                            <h4 className="font-semibold text-slate-900">{topic.id}. {topic.title}</h4>
                            <p className="text-sm text-emerald-900 my-2 bg-emerald-50 p-2 rounded-md border border-emerald-100 font-medium">💡 썸네일 문구: {topic.thumbnailCopy}</p>
                            <p className="text-sm text-slate-600">{topic.strategy}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const RecommendedKeywordsDisplay: FC<{ data: RecommendedKeyword[]; onTopicSelect: (title: string, context: string) => void; }> = ({ data, onTopicSelect }) => {
    const handleSelect = (topic: RecommendedKeyword) => {
        const context = `[오늘의 전략 키워드 컨텍스트]\n- 핵심 키워드: ${topic.keyword}\n- 선정 이유: ${topic.reason}\n- 썸네일 문구: ${topic.thumbnailCopy}\n- 공략법: ${topic.strategy}`;
        onTopicSelect(topic.title, context);
    };

    return (
        <div className="bg-white rounded-lg p-6 space-y-6 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">오늘의 전략 키워드 추천 (AI 기반)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.map(item => (
                    <div key={item.id} onClick={() => handleSelect(item)} className="bg-slate-50 p-4 rounded-lg flex flex-col cursor-pointer hover:border-teal-400 hover:shadow-md border border-slate-200 transition-all">
                        <h3 className="font-bold text-lg text-teal-800 mb-1">{item.keyword}</h3>
                        <p className="text-xs text-slate-500 mb-3">{item.reason}</p>
                        <div className="bg-white p-3 rounded-md flex-grow border border-slate-200">
                            <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                            <p className="text-xs text-emerald-800 font-medium my-2 bg-emerald-50 p-1.5 rounded">썸네일: {item.thumbnailCopy}</p>
                            <p className="text-xs text-slate-600">{item.strategy}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SustainableTopicsResults: FC<{ data: SustainableTopicCategory[]; onTopicSelect: (title: string, context: string) => void; }> = ({ data, onTopicSelect }) => {
    const [openCategory, setOpenCategory] = useState<string | null>(data[0]?.category || null);
    
    const handleSelect = (suggestion: SustainableTopicSuggestion) => {
        const context = `[다각도 주제 컨텍스트]\n- 핵심 키워드: ${suggestion.keywords.join(', ')}\n- SEO 글쓰기 전략: ${suggestion.strategy}`;
        onTopicSelect(suggestion.title, context);
    };

    return (
        <div className="bg-white rounded-lg p-6 space-y-2 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">다각도 블로그 주제 발굴</h2>
            {data.map(category => (
                <div key={category.category}>
                    <button
                        onClick={() => setOpenCategory(openCategory === category.category ? null : category.category)}
                        className="w-full text-left font-semibold text-lg text-slate-800 bg-slate-100 p-4 rounded-md hover:bg-slate-200/80 transition-colors flex justify-between items-center"
                    >
                        {category.category}
                        <span className={`transform transition-transform ${openCategory === category.category ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {openCategory === category.category && (
                        <div className="p-4 bg-slate-50 rounded-b-md border-x border-b border-slate-200">
                           <div className="overflow-x-auto">
                                <table className="w-full min-w-max text-sm text-left text-slate-700">
                                    <thead className="text-xs text-teal-800 uppercase bg-teal-50 border-b border-teal-100 font-semibold">
                                        <tr>
                                            <th scope="col" className="px-4 py-3">블로그 제목</th>
                                            <th scope="col" className="px-4 py-3">핵심 키워드</th>
                                            <th scope="col" className="px-4 py-3">SEO 글쓰기 전략</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {category.suggestions.map((s: SustainableTopicSuggestion, i: number) => (
                                            <tr key={i} onClick={() => handleSelect(s)} className="hover:bg-white cursor-pointer transition-colors">
                                                <td className="px-4 py-3 font-semibold text-slate-900">{s.title}</td>
                                                <td className="px-4 py-3 text-xs">
                                                    <div className="flex flex-wrap gap-1">
                                                        {s.keywords.map(kw => <span key={kw} className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-medium">{kw}</span>)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 text-xs">{s.strategy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const PeopleAlsoAsk: FC<{ data: PaaItem[] }> = ({ data }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
         <h2 className="text-xl font-bold text-slate-900 mb-4">다른 사람들이 함께 찾는 질문 (PAA) & 콘텐츠 갭 분석</h2>
         <div className="space-y-4">
            {data.map((item, index) => (
                <details key={index} className="bg-slate-50 rounded-lg p-4 group border border-slate-200">
                    <summary className="font-semibold text-teal-800 cursor-pointer list-none flex items-center">
                         <span className="mr-2 transform transition-transform group-open:rotate-90">▶</span>
                        {item.question}
                    </summary>
                    <div className="mt-3 pl-6 text-sm">
                        <p className="text-slate-700 mb-2">{item.answer}</p>
                        <p className="text-emerald-900 bg-emerald-50 p-2.5 rounded-md border border-emerald-100">
                            <strong className="font-bold">🚀 공략 포인트:</strong> {item.content_gap_analysis}
                        </p>
                    </div>
                </details>
            ))}
         </div>
    </div>
);

const SerpStrategyReport: FC<{ data: SerpStrategyReportData; onTopicSelect: (title: string, context: string) => void; }> = ({ data, onTopicSelect }) => {
    const handleSelect = (topic: GeneratedTopic) => {
        const context = `[SERP 분석 기반 컨텍스트]\n- 썸네일 문구: ${topic.thumbnailCopy}\n- 공략법: ${topic.strategy}`;
        onTopicSelect(topic.title, context);
    };

    return (
        <div className="bg-white rounded-lg p-6 space-y-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">AI SERP 분석 기반 콘텐츠 전략</h2>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-lg text-teal-800 mb-2">핵심 분석</h3>
                <div className="space-y-2 text-sm text-slate-700">
                    <p><strong className="text-slate-900">🎯 핵심 사용자 의도 및 콘텐츠 갭:</strong> {data.analysis.userIntent}</p>
                    <p><strong className="text-slate-900">🏛️ 필러 포스트 제안:</strong> {data.analysis.pillarPostSuggestion}</p>
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-lg text-teal-800 mb-2">콘텐츠 갭 공략을 위한 주제 제안</h3>
                <div className="space-y-4">
                    {data.suggestions.map(topic => (
                        <div key={topic.id} onClick={() => handleSelect(topic)} className="bg-slate-50 p-4 rounded-lg cursor-pointer hover:bg-teal-50/50 hover:border-teal-300 border border-slate-200 transition-colors">
                            <h4 className="font-semibold text-slate-900">{topic.id}. {topic.title}</h4>
                            <p className="text-sm text-emerald-900 my-2 bg-emerald-50 p-2 rounded-md border border-emerald-100 font-medium">💡 썸네일 문구: {topic.thumbnailCopy}</p>
                            <p className="text-sm text-slate-600">{topic.strategy}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface KeywordFighterProps {
    onTopicSelect: (title: string, context: string) => void;
    isNaverApiConfigured: boolean;
    naverClientId: string;
    naverClientSecret: string;
}

// --- Main KeywordFighter Component ---
export const KeywordFighter: FC<KeywordFighterProps> = ({ onTopicSelect, isNaverApiConfigured, naverClientId, naverClientSecret }) => {
    // FIX: Destructure 'setLoading' from the useSearch hook to manage loading state.
    const { results, loading, error, search, initialLoad, setResults, setError, setInitialLoad, setLoading } = useSearch();
    const [source, setSource] = useState<SearchSource>('google');
    const [feature, setFeature] = useState<Feature>('competition');

    const [keyword, setKeyword] = useState<string>('');
    const [mainKeyword, setMainKeyword] = useState<string>('');
    const [blogTopics, setBlogTopics] = useState<GeneratedTopic[] | null>(null);
    const [topicTitle, setTopicTitle] = useState<string>('');
    const [topicLoading, setTopicLoading] = useState<boolean>(false);
    const [topicError, setTopicError] = useState<string | null>(null);

    const [blogStrategy, setBlogStrategy] = useState<BlogStrategyReportData | null>(null);
    const [strategyLoading, setStrategyLoading] = useState<boolean>(false);
    const [strategyError, setStrategyError] = useState<string | null>(null);
    
    const [newsStrategy, setNewsStrategy] = useState<NewsStrategyIdea[] | null>(null);
    const [newsStrategyLoading, setNewsStrategyLoading] = useState<boolean>(false);
    const [newsStrategyError, setNewsStrategyError] = useState<string | null>(null);
    
    const [serpStrategy, setSerpStrategy] = useState<SerpStrategyReportData | null>(null);
    const [serpStrategyLoading, setSerpStrategyLoading] = useState<boolean>(false);
    const [serpStrategyError, setSerpStrategyError] = useState<string | null>(null);

    const [recommendedKeywords, setRecommendedKeywords] = useState<RecommendedKeyword[] | null>(null);

    const [sustainableTopics, setSustainableTopics] = useState<SustainableTopicCategory[] | null>(null);
    const [sustainableTopicsLoading, setSustainableTopicsLoading] = useState<boolean>(false);
    const [sustainableTopicsError, setSustainableTopicsError] = useState<string | null>(null);
    
    const handleFetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        setResults([]);
        setInitialLoad(false);

        try {
            const recommendations = await fetchRecommendedKeywords();
            setRecommendedKeywords(recommendations);
        } catch (err) {
            setError(formatErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (feature === 'recommended') {
            handleFetchRecommendations();
        }
    }, [feature]);


    const resetAllState = () => {
        setResults([]);
        setError(null);
        setInitialLoad(true);
        setKeyword('');
        setMainKeyword('');
        setBlogTopics(null);
        setTopicTitle('');
        setTopicLoading(false);
        setTopicError(null);
        setBlogStrategy(null);
        setStrategyLoading(false);
        setStrategyError(null);
        setSerpStrategy(null);
        setSerpStrategyLoading(false);
        setSerpStrategyError(null);
        setRecommendedKeywords(null);
        setSustainableTopics(null);
        setSustainableTopicsError(null);
        setSustainableTopicsLoading(false);
        setNewsStrategy(null);
        setNewsStrategyLoading(false);
        setNewsStrategyError(null);
    };

    const handleFeatureSelect = (newFeature: Feature) => {
        if (feature === newFeature) return;
        resetAllState();
        setFeature(newFeature);
    };

    const handleSearch = async (searchKeyword: string) => {
        if (!searchKeyword.trim()) return;

        resetAllState();
        setInitialLoad(false);
        setMainKeyword(searchKeyword);
        
        if (feature === 'sustainable-topics') {
            setSustainableTopicsLoading(true);
            try {
                const data = await generateSustainableTopics(searchKeyword);
                setSustainableTopics(data);
            } catch (err) {
                setSustainableTopicsError(formatErrorMessage(err));
            } finally {
                setSustainableTopicsLoading(false);
            }
        } else {
            search(searchKeyword, feature, source, { naverClientId, naverClientSecret });
        }
    };

    const handleKeywordClick = (clickedKeyword: string) => {
        setKeyword(clickedKeyword);
        handleSearch(clickedKeyword);
    };
    
    const isBlogResults = (data: any[]): data is BlogPostData[] => {
        return data.length > 0 && 'url' in data[0] && !('pubDate' in data[0]);
    }
    
    const isCompetitionResult = (data: any[]): data is KeywordMetrics[] => {
        return data.length > 0 && 'analysis' in data[0] && !('url' in data[0]);
    }

    const isKeywordResults = (data: any[]): data is KeywordData[] => {
        return data.length > 0 && 'keyword' in data[0] && !('url' in data[0]) && !('analysis' in data[0]);
    }
    
    const isNaverNewsData = (data: any[]): data is NaverNewsData[] => {
        return data.length > 0 && 'pubDate' in data[0];
    }

    const isGoogleSerpResult = (data: any[]): data is GoogleSerpData[] => {
        return data.length > 0 && 'related_searches' in data[0] && 'people_also_ask' in data[0];
    }

    const handleGenerateTopics = async (type: 'main' | 'all') => {
        setTopicLoading(true);
        setTopicError(null);
        setBlogTopics(null);

        try {
            let topics;
            if (type === 'main') {
                setTopicTitle(`'${mainKeyword}' 키워드 블로그 주제 추천`);
                topics = await generateTopicsFromMainKeyword(mainKeyword);
            } else {
                const relatedKeywords = (results as KeywordData[]).map(r => r.keyword);
                setTopicTitle(`'${mainKeyword}' 및 자동완성 키워드 조합 블로그 주제 추천`);
                topics = await generateTopicsFromAllKeywords(mainKeyword, relatedKeywords);
            }
            setBlogTopics(topics);
        } catch (err) {
            setTopicError(formatErrorMessage(err));
        } finally {
            setTopicLoading(false);
        }
    };
    
    const analyzeBlogStrategy = async () => {
        if (!loading && !error && feature === 'blogs' && isBlogResults(results) && results.length > 0) {
            setStrategyLoading(true);
            setStrategyError(null);
            try {
                const strategyData = await generateBlogStrategy(mainKeyword, results);
                setBlogStrategy(strategyData);
            } catch (err) {
                setStrategyError(formatErrorMessage(err));
            } finally {
                setStrategyLoading(false);
            }
        }
    };

    const handleGenerateNewsStrategy = async () => {
        if (!loading && !error && feature === 'naver-news' && isNaverNewsData(results) && results.length > 0) {
            setNewsStrategyLoading(true);
            setNewsStrategyError(null);
            setNewsStrategy(null);
            try {
                const strategy = await generateStrategyFromNews(results as NaverNewsData[]);
                setNewsStrategy(strategy);
            } catch (err) {
                setNewsStrategyError(formatErrorMessage(err));
            } finally {
                setNewsStrategyLoading(false);
            }
        }
    };

    const analyzeSerpStrategy = async () => {
        if (!loading && !error && feature === 'related-keywords' && isGoogleSerpResult(results) && results.length > 0) {
            setSerpStrategyLoading(true);
            setSerpStrategyError(null);
            try {
                const strategyData = await generateSerpStrategy(mainKeyword, results[0]);
                setSerpStrategy(strategyData);
            } catch (err) {
                setSerpStrategyError(formatErrorMessage(err));
            } finally {
                setSerpStrategyLoading(false);
            }
        }
    };

    useEffect(() => {
        if (feature === 'blogs') {
            analyzeBlogStrategy();
        } else {
            setBlogStrategy(null);
            setStrategyError(null);
        }
        
        if (feature === 'related-keywords' && results.length > 0 && isGoogleSerpResult(results)) {
            analyzeSerpStrategy();
        } else {
            setSerpStrategy(null);
            setSerpStrategyError(null);
        }

    }, [results, feature]);

    const handleReset = () => {
        resetAllState();
        setFeature('competition');
        setSource('google');
    };

    const getWelcomeMessage = () => {
        if (feature === 'blogs') return "'상위 블로그 분석' 기능을 사용하려면 먼저 Naver API 설정을 완료하고 키워드를 검색해주세요.";
        if (feature === 'naver-news') return "'네이버 실시간 뉴스' 기능을 사용하려면 먼저 Naver API 설정을 완료하고 키워드를 검색해주세요.";
        if (feature === 'keywords') return "분석할 키워드를 입력하고 '키워드 검색' 버튼을 눌러주세요.";
        if (feature === 'related-keywords') return "Google SERP를 분석하고 콘텐츠 전략을 수립할 기준 키워드를 입력해주세요.";
        if (feature === 'sustainable-topics') return "하나의 키워드를 다양한 관점으로 확장할 '다각도 블로그 주제'를 발굴할 키워드를 입력해주세요.";
        if (feature === 'recommended') return "AI가 실시간으로 대한민국 최신 이슈를 분석하여 블로그 전략 키워드를 추천합니다.";
        return "경쟁력을 분석할 키워드를 입력하고 '키워드 검색' 버튼을 눌러주세요.";
    }
    
    const getNoResultsMessage = () => {
        if (feature === 'keywords') return "해당 키워드에 대한 자동완성검색어를 찾을 수 없습니다.";
        if (feature === 'related-keywords') return "해당 키워드에 대한 SERP 데이터(관련 검색어, PAA)를 찾을 수 없습니다.";
        if (feature === 'blogs') return "해당 키워드에 대한 블로그 포스트를 찾을 수 없습니다. API 키가 정확한지 확인해주세요.";
        if (feature === 'naver-news') return "해당 키워드에 대한 최신 뉴스를 찾을 수 없습니다. API 키가 정확한지 확인해주세요.";
        if (feature === 'sustainable-topics') return "해당 키워드에 대한 '다각도 블로그 주제'를 발굴할 수 없습니다.";
        if (feature === 'recommended') return "추천 키워드를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.";
        return "키워드 경쟁력 분석 결과를 가져올 수 없습니다. 다른 키워드로 시도해보세요.";
    }

    const anyLoading = loading || sustainableTopicsLoading;

    return (
        <div className="font-sans">
            <div className="w-full">
                <main className="flex-grow">
                    <FeatureSelector 
                        selectedFeature={feature} 
                        onSelectFeature={handleFeatureSelect} 
                        loading={anyLoading}
                        onReset={handleReset}
                    />
                    
                    {feature === 'keywords' && (
                        <SearchEngineSelector selectedSource={source} onSelectSource={setSource} loading={anyLoading} />
                    )}

                    {feature !== 'recommended' && (
                        <KeywordInputForm 
                            onSearch={handleSearch} 
                            loading={anyLoading} 
                            keyword={keyword} 
                            setKeyword={setKeyword} 
                            feature={feature}
                            apiOk={isNaverApiConfigured}
                        />
                    )}
                    
                    <div className="mt-8 min-h-[300px]">
                        {(loading || sustainableTopicsLoading) && <LoadingSpinner />}
                        {error && <ErrorMessage message={error} />}
                        {sustainableTopicsError && <ErrorMessage message={sustainableTopicsError} />}
                        
                        {!anyLoading && !error && !sustainableTopicsError && (
                             <>
                                {feature === 'recommended' && recommendedKeywords && <RecommendedKeywordsDisplay data={recommendedKeywords} onTopicSelect={onTopicSelect} />}
                                {isCompetitionResult(results) && <CompetitionAnalysisResults data={results[0]} onTopicSelect={onTopicSelect}/>}
                                {isBlogResults(results) && (
                                    <div className="space-y-6">
                                        <BlogResultsTable data={results} />
                                        {strategyLoading && <LoadingSpinner />}
                                        {strategyError && <ErrorMessage message={strategyError} />}
                                        {blogStrategy && <BlogStrategyReport data={blogStrategy} onTopicSelect={onTopicSelect} />}
                                    </div>
                                )}
                                {isNaverNewsData(results) && (
                                    <div className="space-y-6">
                                        <NaverNewsResults 
                                            data={results as NaverNewsData[]} 
                                            onGenerateStrategy={handleGenerateNewsStrategy}
                                            strategyLoading={newsStrategyLoading}
                                            strategy={newsStrategy}
                                            onTopicSelect={onTopicSelect}
                                        />
                                        {newsStrategyError && <ErrorMessage message={newsStrategyError} />}
                                    </div>
                                )}
                                {isGoogleSerpResult(results) && (
                                    <div className="space-y-6">
                                        <ResultsTable
                                            data={results[0].related_searches.map((kw, i) => ({ id: i + 1, keyword: kw }))}
                                            onKeywordClick={handleKeywordClick}
                                            onGenerateTopicsFromMain={() => {}}
                                            onGenerateTopicsFromAll={() => {}}
                                            loading={false}
                                            feature={feature}
                                        />
                                        <PeopleAlsoAsk data={results[0].people_also_ask} />
                                        {serpStrategyLoading && <LoadingSpinner />}
                                        {serpStrategyError && <ErrorMessage message={serpStrategyError} />}
                                        {serpStrategy && <SerpStrategyReport data={serpStrategy} onTopicSelect={onTopicSelect} />}
                                    </div>
                                )}
                                {isKeywordResults(results) && (
                                    <div className="space-y-6">
                                        <ResultsTable 
                                            data={results}
                                            onKeywordClick={handleKeywordClick}
                                            onGenerateTopicsFromMain={() => handleGenerateTopics('main')}
                                            onGenerateTopicsFromAll={() => handleGenerateTopics('all')}
                                            loading={topicLoading}
                                            feature={feature}
                                        />
                                        {topicLoading && <LoadingSpinner />}
                                        {topicError && <ErrorMessage message={topicError} />}
                                        {blogTopics && <BlogTopicSuggestions title={topicTitle} data={blogTopics} onTopicSelect={onTopicSelect} />}
                                    </div>
                                )}
                                {sustainableTopics && <SustainableTopicsResults data={sustainableTopics} onTopicSelect={onTopicSelect} />}
                            </>
                        )}
                    
                        {(initialLoad || (feature === 'recommended' && loading)) && !error && (
                            <div className="text-center p-8 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <p className="text-slate-600 font-medium">{getWelcomeMessage()}</p>
                            </div>
                        )}
                        {!initialLoad && results.length === 0 && !sustainableTopics && !anyLoading && !error && !recommendedKeywords && (
                            <div className="text-center p-8 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <p className="text-slate-600 font-medium">{getNoResultsMessage()}</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};