import React, { useState } from 'react';
import { X, CloudDownload, Check, Loader2, FileText, Book } from './Icon';
import { FileNode, FileType } from '../types';
import { notionService, NotionPage } from '../services/notionService';

interface NotionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (files: Partial<FileNode>[]) => void;
}

const NotionImportModal: React.FC<NotionImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [step, setStep] = useState<'connect' | 'select' | 'importing'>('connect');
  const [apiKey, setApiKey] = useState('');
  const [fetchedPages, setFetchedPages] = useState<NotionPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async () => {
    if (!apiKey.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const pages = await notionService.searchPages(apiKey);
      setFetchedPages(pages);
      setStep('select');
    } catch (err) {
      setError('Notion 연동에 실패했습니다. API Key를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedPages(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleImport = async () => {
    setStep('importing');
    setError(null);
    
    try {
      const filesToImport = await Promise.all(
        fetchedPages
          .filter(page => selectedPages.includes(page.id))
          .map(async (page) => {
            const content = await notionService.getPageContent(apiKey, page.id);
            return {
              name: `${page.icon} ${page.title}.md`,
              type: FileType.MARKDOWN,
              content: content
            };
          })
      );

      onImport(filesToImport);
      
      // Reset and close
      setTimeout(() => {
        onClose();
        setStep('connect');
        setApiKey('');
        setSelectedPages([]);
        setFetchedPages([]);
      }, 500);
    } catch (err) {
      setError('문서를 가져오는 중 오류가 발생했습니다.');
      setStep('select'); // Go back to selection on error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[500px] bg-paper-DEFAULT rounded-lg shadow-2xl border-4 border-wood-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="h-14 bg-wood-800 flex items-center justify-between px-6 border-b border-wood-600">
          <div className="flex items-center gap-2 text-wood-100 font-serif font-bold text-lg">
            <CloudDownload size={20} className="text-amber-400" />
            <span>외부 자료 요청서 (Notion)</span>
          </div>
          <button onClick={onClose} className="text-wood-300 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          {error && (
             <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
               {error}
             </div>
          )}

          {step === 'connect' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-wood-200 rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-wood-400">
                  <span className="text-3xl">N</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-wood-900">Notion 계정 연동</h3>
                <p className="text-sm text-wood-600">
                  외부 기록 보관소(Notion)에 접근하기 위해<br/>접근 권한(API Key)을 제시해 주십시오.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-wood-700 uppercase tracking-wider">Integration Token</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="secret_..."
                  className="w-full bg-white border border-wood-300 rounded px-4 py-2 focus:outline-none focus:border-wood-600 font-mono text-sm"
                />
                <p className="text-[10px] text-wood-500">
                  * Notion 'My Integrations'에서 발급받은 'Internal Integration Token'을 입력하세요.<br/>
                  * 연결하려는 페이지의 설정 메뉴(...)에서 'Add connections'를 통해 해당 Integration을 추가해야 합니다.
                </p>
              </div>

              <button 
                onClick={handleConnect}
                disabled={!apiKey || isLoading}
                className="w-full bg-wood-700 text-wood-100 py-3 rounded font-bold shadow-md hover:bg-wood-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : '연동 확인'}
              </button>
            </div>
          )}

          {step === 'select' && (
            <div className="space-y-4">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-serif font-bold text-wood-900">가져올 문서 선택</h3>
                 <span className="text-xs text-wood-500">{selectedPages.length}개 선택됨</span>
               </div>
               
               <div className="border border-wood-300 rounded bg-white max-h-60 overflow-y-auto">
                 {fetchedPages.length === 0 ? (
                   <div className="p-4 text-center text-wood-500 text-sm">
                     검색된 페이지가 없습니다.<br/>Notion 페이지에 Integration이 연결되었는지 확인하세요.
                   </div>
                 ) : (
                   fetchedPages.map(page => (
                     <div 
                       key={page.id}
                       onClick={() => toggleSelection(page.id)}
                       className={`flex items-center gap-3 p-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-wood-100 transition-colors ${selectedPages.includes(page.id) ? 'bg-wood-100/50' : ''}`}
                     >
                       <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedPages.includes(page.id) ? 'bg-library-green border-library-green text-white' : 'border-wood-300 bg-white'}`}>
                         {selectedPages.includes(page.id) && <Check size={14} />}
                       </div>
                       <span className="text-lg">{page.icon}</span>
                       <div className="flex-1">
                         <p className="text-sm font-medium text-wood-900">{page.title}</p>
                         <p className="text-xs text-wood-500">ID: {page.id.slice(0, 8)}...</p>
                       </div>
                     </div>
                   ))
                 )}
               </div>

               <button 
                onClick={handleImport}
                disabled={selectedPages.length === 0}
                className="w-full bg-library-green text-white py-3 rounded font-bold shadow-md hover:bg-library-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                선택한 문서 가져오기
              </button>
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 size={48} className="text-library-green animate-spin" />
              <div className="text-center">
                <h3 className="text-lg font-serif font-bold text-wood-900">문서 이관 중...</h3>
                <p className="text-sm text-wood-600 mt-2">외부 지식을 서재로 옮기고 있습니다.<br/>잠시만 기다려 주십시오.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotionImportModal;