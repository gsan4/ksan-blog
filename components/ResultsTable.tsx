
import React from 'react';
import type { KeywordData, Feature } from '../types';

interface ResultsTableProps {
    data: KeywordData[];
    onKeywordClick: (keyword: string) => void;
    onGenerateTopicsFromMain: () => void;
    onGenerateTopicsFromAll: () => void;
    loading: boolean;
    feature: Feature;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data, onKeywordClick, onGenerateTopicsFromMain, onGenerateTopicsFromAll, loading, feature }) => {
    
    const handleKeywordClick = (keyword: string) => {
        onKeywordClick(keyword);
    };

    const getTitle = () => {
        if (feature === 'related-keywords') {
            return '관련 검색어 (Related Searches)';
        }
        return '자동완성검색어';
    };

    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                    <thead className="bg-slate-100/80 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                            <th scope="col" className="p-3 text-left w-16">No.</th>
                            <th scope="col" className="p-3 text-left">{getTitle()}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-200">
                                <td className="p-3 text-slate-500 text-center">{item.id}</td>
                                <td className="p-3 font-semibold text-teal-700">
                                     <button 
                                        onClick={() => handleKeywordClick(item.keyword)}
                                        className="text-left w-full hover:underline hover:text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-400 rounded px-1"
                                        aria-label={`${item.keyword}로 검색하기`}
                                    >
                                        {item.keyword}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {feature === 'keywords' && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={onGenerateTopicsFromMain}
                        disabled={loading}
                        className="flex-1 bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center shadow-sm"
                    >
                        메인키워드로만 주제 만들기
                    </button>
                    <button 
                        onClick={onGenerateTopicsFromAll}
                        disabled={loading}
                        className="flex-1 bg-teal-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center shadow-sm"
                    >
                        자동완성검색어 조합으로 주제 만들기
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResultsTable;
