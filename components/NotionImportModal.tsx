import React, { useState } from 'react';
import { X, CloudDownload, Check, Loader2, FileText, Book } from './Icon';
import { FileNode, FileType } from '../types';

interface NotionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (files: Partial<FileNode>[]) => void;
}

// Mock Notion Pages Data
const MOCK_NOTION_PAGES = [
  {
    id: 'notion-1',
    title: '2024년 독서 목록',
    icon: '📚',
    content: `# 2024년 독서 목표 및 목록\n\n## 목표\n- 한 달에 2권 읽기\n- 고전 문학 비중 늘리기\n\n## 목록\n1. [ ] 데미안 - 헤르만 헤세\n2. [x] 총, 균, 쇠 - 재레드 다이아몬드\n3. [ ] 코스모스 - 칼 세이건\n`
  },
  {
    id: 'notion-2',
    title: '프로젝트 아이디어 노트',
    icon: '💡',
    content: `# 프로젝트 아이디어\n\n> 영감이 떠오를 때마다 기록하는 공간입니다.\n\n## 웹 서비스 아이디어\n- **도서관 관리 시스템**: 고풍스러운 디자인의 개인 서재 앱\n- **AI 식단 추천**: 냉장고 재료 기반 레시피 생성\n\n## 메모\nNotion API를 활용하면 동기화 기능을 만들 수 있을 것 같다.`
  },
  {
    id: 'notion-3',
    title: '주간 업무 일지',
    icon: '📅',
    content: `# 5월 3주차 업무 일지\n\n## 주요 일정\n- 월: 기획 회의\n- 수: 디자인 리뷰\n- 금: 주간 보고\n\n## 진행 상황\nFrontend 개발이 80% 정도 진행됨. UI 폴리싱 작업 필요.`
  },
  {
    id: 'notion-4',
    title: '여행 계획: 교토',
    icon: '✈️',
    content: `# 교토 여행 계획\n\n## 방문할 곳\n- 기요미즈데라 (청수사)\n- 후시미 이나리 신사\n- 아라시야마 대나무 숲\n\n## 맛집 리스트\n- 텐동 마키노\n- % Arabica 커피`
  }
];

const NotionImportModal: React.FC<NotionImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [step, setStep] = useState<'connect' | 'select' | 'importing'>('connect');
  const [apiKey, setApiKey] = useState('');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConnect = () => {
    if (!apiKey.trim()) return;
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setStep('select');
    }, 1500);
  };

  const toggleSelection = (id: string) => {
    setSelectedPages(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleImport = () => {
    setStep('importing');
    
    // Simulate processing
    setTimeout(() => {
      const filesToImport = MOCK_NOTION_PAGES
        .filter(page => selectedPages.includes(page.id))
        .map(page => ({
          name: `${page.icon} ${page.title}.md`,
          type: FileType.MARKDOWN,
          content: page.content
        }));

      onImport(filesToImport);
      
      // Reset and close
      setTimeout(() => {
        onClose();
        setStep('connect');
        setApiKey('');
        setSelectedPages([]);
      }, 500);
    }, 2000);
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
                <p className="text-[10px] text-wood-500">* 데모 환경에서는 아무 값이나 입력하셔도 됩니다.</p>
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
                 {MOCK_NOTION_PAGES.map(page => (
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
                       <p className="text-xs text-wood-500">Notion Page</p>
                     </div>
                   </div>
                 ))}
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