
import React from 'react';
import type { BlogPostData } from '../types';

const BlogResultsTable: React.FC<{ data: BlogPostData[] }> = ({ data }) => {
    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                    <thead className="bg-slate-100/80 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                            <th scope="col" className="p-3 text-left w-16">No.</th>
                            <th scope="col" className="p-3 text-left">블로그 제목</th>
                            <th scope="col" className="p-3 text-left">바로가기</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-200">
                                <td className="p-3 text-slate-500 text-center">{item.id}</td>
                                <td className="p-3 font-semibold text-slate-800">{item.title}</td>
                                <td className="p-3">
                                    <a 
                                      href={item.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-teal-600 hover:text-teal-800 hover:underline font-medium transition-colors duration-200"
                                      aria-label={`${item.title} (새 탭에서 열기)`}
                                    >
                                        바로가기
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BlogResultsTable;
