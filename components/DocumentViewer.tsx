import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileNode, FileType } from '../types';
import { Edit2, Save, X, Bot, BookOpen, Book } from './Icon';
import { summarizeDocument, askLibrarian } from '../services/geminiService';

interface DocumentViewerProps {
  node: FileNode;
  onUpdateContent: (id: string, content: string) => void;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ node, onUpdateContent, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [content, setContent] = useState(node.content || "");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'bot', text: string}[]>([]);

  useEffect(() => {
    setContent(node.content || "");
    setAiResponse(null);
    setChatHistory([]);
    setIsEditing(false);
    setIsPreview(false);
  }, [node.id, node.content]);

  const handleSave = () => {
    onUpdateContent(node.id, content);
    setIsEditing(false);
    setIsPreview(false);
  };

  const handleSummarize = async () => {
    setShowAiPanel(true);
    setAiLoading(true);
    const summary = await summarizeDocument(content, node.type === FileType.MARKDOWN ? 'md' : 'pdf');
    setAiResponse(summary);
    setAiLoading(false);
    // Add to chat history as a starting point
    setChatHistory([{ role: 'bot', text: `[문서 요약]\n${summary}` }]);
  };

  const handleAskLibrarian = async () => {
    if (!chatQuery.trim()) return;
    
    const userQ = chatQuery;
    setChatQuery("");
    setChatHistory(prev => [...prev, { role: 'user', text: userQ }]);
    
    // Simulate thinking if needed, or just loading state
    setAiLoading(true);
    const answer = await askLibrarian(userQ, content);
    setAiLoading(false);
    
    setChatHistory(prev => [...prev, { role: 'bot', text: answer }]);
  };

  const isPdf = node.type === FileType.PDF;

  return (
    <div className="flex flex-col h-full bg-paper-DEFAULT relative overflow-hidden shadow-inner">
      {/* Document Header */}
      <div className="h-16 border-b border-wood-300 flex items-center justify-between px-8 bg-paper-dark shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-wood-800 rounded-full text-wood-100">
             {isPdf ? <BookOpen size={20} /> : <Book size={20} />}
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-wood-900">{node.name}</h1>
            <p className="text-xs text-wood-500 font-sans">Last modified: {new Date(node.lastModified).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {!isPdf && (
             isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-wood-800 hover:bg-wood-300/20 rounded font-medium text-sm transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-library-green text-white rounded shadow-md hover:bg-library-green/90 transition-colors"
                >
                  <Save size={16} /> 저장
                </button>
              </>
             ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-wood-800 border border-wood-300 rounded hover:bg-white transition-colors shadow-sm"
              >
                <Edit2 size={16} /> 수정
              </button>
             )
           )}
           
           <button 
             onClick={() => setShowAiPanel(!showAiPanel)}
             className={`flex items-center gap-2 px-4 py-2 rounded shadow-sm transition-colors ${showAiPanel ? 'bg-library-gold text-white' : 'bg-wood-100 text-wood-900 hover:bg-wood-300'}`}
           >
             <Bot size={16} /> AI 사서
           </button>

           <div className="w-px h-6 bg-wood-300 mx-2"></div>
           
           <button onClick={onClose} className="text-wood-500 hover:text-red-500 transition-colors">
             <X size={20} />
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Body */}
        <div className={`flex-1 overflow-auto p-8 md:p-12 transition-all ${showAiPanel ? 'w-2/3' : 'w-full'}`}>
          <div className="max-w-4xl mx-auto bg-white p-12 min-h-full shadow-lg border border-wood-100">
            {isPdf ? (
              <div className="flex flex-col items-center justify-center h-full text-wood-500 gap-4 opacity-70">
                <BookOpen size={64} strokeWidth={1} />
                <div className="text-center">
                  <h3 className="text-xl font-serif mb-2">PDF 미리보기</h3>
                  <p className="max-w-md text-sm">
                    실제 PDF 렌더링은 백엔드 파일 서버가 필요합니다. <br/>
                    이 데모에서는 시뮬레이션된 뷰어를 제공합니다.
                  </p>
                  {node.url && (
                    <div className="mt-4 p-4 bg-gray-100 rounded text-xs break-all">
                      Source: {node.url}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              isEditing ? (
                <textarea 
                  className="w-full h-full min-h-[500px] outline-none resize-none font-mono text-sm leading-relaxed text-gray-800 bg-transparent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="여기에 내용을 입력하세요..."
                />
              ) : (
                <div className="prose prose-stone prose-lg max-w-none font-serif text-wood-900">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )
            )}
          </div>
        </div>

        {/* AI Librarian Panel */}
        {showAiPanel && (
          <div className="w-96 bg-wood-100 border-l border-wood-300 flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
            <div className="p-4 bg-wood-300 text-wood-900 font-bold border-b border-wood-400 flex justify-between items-center">
              <span className="flex items-center gap-2"><Bot size={18}/> 도서관 사서</span>
              <button onClick={() => setShowAiPanel(false)}><X size={16}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {chatHistory.length === 0 && !aiLoading && (
                 <div className="text-center py-8 text-wood-700">
                   <p className="mb-4">이 문서에 대해 무엇이든 물어보세요.</p>
                   <button 
                     onClick={handleSummarize}
                     className="px-4 py-2 bg-white border border-wood-400 rounded-lg shadow-sm hover:bg-wood-50 transition-colors text-sm font-medium"
                   >
                     ✨ 이 문서 요약하기
                   </button>
                 </div>
               )}

               {chatHistory.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-3 rounded-lg text-sm shadow-sm whitespace-pre-wrap ${
                     msg.role === 'user' 
                       ? 'bg-wood-700 text-white rounded-br-none' 
                       : 'bg-white text-wood-900 border border-wood-200 rounded-bl-none'
                   }`}>
                     {msg.text}
                   </div>
                 </div>
               ))}

               {aiLoading && (
                 <div className="flex justify-start">
                   <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-sm border border-wood-200">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-wood-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-wood-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-wood-400 rounded-full animate-bounce delay-150"></span>
                      </div>
                   </div>
                 </div>
               )}
            </div>

            <div className="p-4 bg-wood-200 border-t border-wood-300">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskLibrarian()}
                  placeholder="질문을 입력하세요..."
                  className="flex-1 px-3 py-2 rounded border border-wood-400 focus:outline-none focus:border-wood-700 bg-white"
                />
                <button 
                  onClick={handleAskLibrarian}
                  disabled={aiLoading || !chatQuery.trim()}
                  className="bg-wood-700 text-white px-3 py-2 rounded hover:bg-wood-800 disabled:opacity-50"
                >
                  전송
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;