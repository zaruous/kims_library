import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Since we can't install uuid, I will implement a simple one
import FileTree from './components/FileTree';
import DocumentViewer from './components/DocumentViewer';
import { FileSystem, FileType, FileNode } from './types';
import { Book, Plus, Search } from './components/Icon';

// Simple UUID generator for browser
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper function to generate long content (approx 10 pages)
const getLibraryGuideContent = () => {
  const intro = `# 도서관 이용 안내 (통합 상세본)

> **환영합니다.** Library Sanctum은 지식의 보존과 탐구를 위한 신성한 공간입니다. 본 가이드는 쾌적하고 효율적인 도서관 이용을 위해 작성된 상세 규정집입니다.

![Library Interior](https://via.placeholder.com/800x200/3e2b22/e3d5c3?text=Library+Sanctum+Interior)

---

`;

  const fillerText = `
본 섹션에서는 해당 규정에 대한 상세한 철학과 실천 방안을 다룹니다. 도서관은 단순한 책의 저장소가 아니라, 인류의 지혜가 숨 쉬는 유기적인 공간입니다. 우리는 독자 여러분이 이 공간에서 깊은 사색과 배움의 기쁨을 누리기를 바랍니다.

1. **지식의 공유와 보존**: 모든 장서는 공공의 자산입니다. 한 페이지, 한 줄의 문장도 소중히 다루어져야 합니다. 책에 낙서하거나 페이지를 접는 행위는 엄격히 금지됩니다. 다음 세대를 위해 지식을 온전하게 보존하는 것은 현재를 살아가는 우리 모두의 의무입니다.
   
2. **타인에 대한 배려**: 도서관은 침묵 속에서 대화가 오가는 곳입니다. 저자의 목소리를 듣기 위해서는 물리적인 소음이 차단되어야 합니다. 발자국 소리, 책장을 넘기는 소리조차 타인의 사색을 방해할 수 있음을 인지하십시오.

3. **디지털과 아날로그의 조화**: Library Sanctum은 고풍스러운 서재의 외관을 유지하면서도 최첨단 AI 기술을 도입하였습니다. 종이책의 질감이 주는 안정감과 디지털 검색의 신속함을 동시에 경험해 보십시오.

(상세 설명 부연)
도서관의 공기는 항상 적절한 온도와 습도로 유지됩니다. 이는 장서의 보존뿐만 아니라 이용자들의 쾌적한 두뇌 활동을 위함입니다. 열람실 내에서는 물을 제외한 모든 음식물 섭취가 제한됩니다. 작은 부스러기 하나가 고서에 치명적인 해충을 불러올 수 있기 때문입니다. 여러분의 협조가 이 아름다운 공간을 지키는 가장 큰 힘이 됩니다.

만약 이용 중 불편 사항이 발생하거나 특정 자료를 찾기 어렵다면, 언제든지 데스크의 사서나 AI 사서에게 문의하십시오. 우리는 여러분이 지식의 바다에서 길을 잃지 않도록 돕는 나침반 역할을 수행할 것입니다. 독서는 고독한 행위이지만, 도서관은 그 고독을 존중하고 지지하는 공동체입니다.

`;

  const chapters = [
    "제1장: 도서관의 설립 이념 및 역사",
    "제2장: 시설 이용 시간 및 휴관일 안내",
    "제3장: 회원 자격 및 멤버십 등급 제도",
    "제4장: 자료의 대출, 반납 및 연체 규정",
    "제5장: 열람실 에티켓 및 정숙 지도 가이드",
    "제6장: 디지털 아카이브 및 AI 사서 활용법",
    "제7장: 고서(Rare Books) 및 특수 자료 열람 수칙",
    "제8장: 분실물 처리 및 시설물 파손 배상 책임",
    "제9장: 비상 대피 요령 및 안전 수칙",
    "제10장: 자주 묻는 질문 (FAQ) 및 기타 사항"
  ];

  let bodyContent = "";
  
  chapters.forEach((title, index) => {
    bodyContent += `## ${title}\n\n`;
    // Add text repeatedly to simulate length (approx 1 page per chapter)
    bodyContent += `### ${index + 1}.1. 개요\n${fillerText}\n`;
    bodyContent += `### ${index + 1}.2. 세부 사항\n${fillerText}\n`;
    bodyContent += `### ${index + 1}.3. 주의 사항\n${fillerText}\n`;
    bodyContent += `---\n\n`;
  });

  const outro = `
## 맺음말

Library Sanctum을 이용해 주시는 모든 분께 감사드립니다. 이 긴 가이드라인은 모두의 편의와 지식의 영속성을 위해 존재합니다. 

*작성일: 2024년 5월 20일*
*승인: 수석 사서 (Chief Librarian)*
`;

  return intro + bodyContent + outro;
};


// Mock Data
const INITIAL_DATA: FileSystem = {
  'root': {
    id: 'root',
    parentId: null,
    name: '내 서재',
    type: FileType.FOLDER,
    children: ['folder-1', 'folder-2', 'file-welcome'],
    isOpen: true,
    lastModified: Date.now()
  },
  'folder-1': {
    id: 'folder-1',
    parentId: 'root',
    name: '고전문학',
    type: FileType.FOLDER,
    children: ['file-1', 'file-2'],
    isOpen: false,
    lastModified: Date.now()
  },
  'folder-2': {
    id: 'folder-2',
    parentId: 'root',
    name: '과학기술',
    type: FileType.FOLDER,
    children: ['file-3'],
    isOpen: false,
    lastModified: Date.now()
  },
  'file-welcome': {
    id: 'file-welcome',
    parentId: 'root',
    name: '도서관 이용 안내.md',
    type: FileType.MARKDOWN,
    content: getLibraryGuideContent(),
    lastModified: Date.now()
  },
  'file-1': {
    id: 'file-1',
    parentId: 'folder-1',
    name: '햄릿 (요약).md',
    type: FileType.MARKDOWN,
    content: `# 햄릿\n\n## 윌리엄 셰익스피어\n\n죽느냐 사느냐, 그것이 문제로다.\n덴마크의 왕자 햄릿은 아버지의 죽음과 어머니의 재혼에 고뇌하며 복수를 꿈꾼다...`,
    lastModified: Date.now()
  },
  'file-2': {
    id: 'file-2',
    parentId: 'folder-1',
    name: '오만과 편견.pdf',
    type: FileType.PDF,
    url: 'https://example.com/pride-and-prejudice.pdf',
    lastModified: Date.now()
  },
  'file-3': {
    id: 'file-3',
    parentId: 'folder-2',
    name: '상대성 이론 기초.md',
    type: FileType.MARKDOWN,
    content: `# 특수 상대성 이론\n\n아인슈타인이 1905년에 발표한 이론으로, 시간과 공간이 관찰자에 따라 상대적임을 설명한다.\n\n$$ E = mc^2 $$`,
    lastModified: Date.now()
  }
};

const App: React.FC = () => {
  const [fileSystem, setFileSystem] = useState<FileSystem>(INITIAL_DATA);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDocId, setOpenDocId] = useState<string | null>(null);

  const handleToggleFolder = (id: string) => {
    setFileSystem(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: !prev[id].isOpen }
    }));
  };

  const handleSelectNode = (id: string) => {
    setSelectedId(id);
    // Double click simulation logic could go here, but for simplicity:
    // Single click selects in tree, user must explicitly open or we use a separate handler.
    // Let's make single click select, and if it's a file, we open it to view immediately
    // to match "Library" feel where you pick a book and open it.
    // The prompt requested "double click", but single click is often better for web. 
    // Let's implement Double Click specifically as requested.
  };

  // Double click handler simulation
  const [lastClickTime, setLastClickTime] = useState(0);
  const handleNodeClick = (id: string) => {
    const now = Date.now();
    if (now - lastClickTime < 300 && selectedId === id) {
      // Double click detected
      const node = fileSystem[id];
      if (node.type !== FileType.FOLDER) {
        setOpenDocId(id);
      } else {
        handleToggleFolder(id);
      }
    } else {
      setSelectedId(id);
    }
    setLastClickTime(now);
  };

  const handleAddNode = (parentId: string, type: FileType, name: string) => {
    const newId = generateId();
    const newNode: FileNode = {
      id: newId,
      parentId,
      name,
      type,
      children: type === FileType.FOLDER ? [] : undefined,
      content: type === FileType.MARKDOWN ? '# 새 문서\n\n내용을 입력하세요.' : undefined,
      isOpen: true,
      lastModified: Date.now()
    };

    setFileSystem(prev => {
      const parent = prev[parentId];
      return {
        ...prev,
        [parentId]: {
          ...parent,
          children: [...(parent.children || []), newId]
        },
        [newId]: newNode
      };
    });
    
    // Auto select the new node
    setSelectedId(newId);
  };

  const handleDeleteNode = (id: string) => {
    if (id === 'root') return; // Protect root
    if (openDocId === id) setOpenDocId(null);

    setFileSystem(prev => {
      const node = prev[id];
      const parentId = node.parentId;
      if (!parentId) return prev;

      const parent = prev[parentId];
      const newFileSystem = { ...prev };
      
      // Remove from parent's children list
      newFileSystem[parentId] = {
        ...parent,
        children: parent.children?.filter(childId => childId !== id)
      };

      // Recursive delete function
      const deleteRecursive = (nodeId: string) => {
        const n = newFileSystem[nodeId];
        if (n.children) {
          n.children.forEach(deleteRecursive);
        }
        delete newFileSystem[nodeId];
      };

      deleteRecursive(id);
      return newFileSystem;
    });
    setSelectedId(null);
  };

  const handleRenameNode = (id: string, newName: string) => {
    setFileSystem(prev => ({
      ...prev,
      [id]: { ...prev[id], name: newName, lastModified: Date.now() }
    }));
  };

  const handleUpdateContent = (id: string, newContent: string) => {
    setFileSystem(prev => ({
      ...prev,
      [id]: { ...prev[id], content: newContent, lastModified: Date.now() }
    }));
  };

  return (
    <div className="flex h-screen w-full bg-wood-900 text-wood-100 overflow-hidden">
      {/* Left Sidebar - Bookshelf */}
      <aside className="w-72 flex flex-col border-r border-wood-900 shadow-2xl z-10 bg-[#3e2b22] relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")'}}></div>
        
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-wood-700 bg-wood-800 z-10 shadow-sm">
          <Book className="text-amber-500 mr-3" size={24} />
          <h1 className="text-xl font-serif font-bold text-amber-100 tracking-wider">Library Sanctum</h1>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-wood-700/50 z-10">
          <div className="text-xs text-wood-300 font-sans uppercase tracking-widest">Documents</div>
          <button 
             onClick={() => handleAddNode('root', FileType.FOLDER, '새 폴더')}
             className="p-1 hover:bg-wood-700 rounded text-amber-200 transition-colors" 
             title="루트에 폴더 추가"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Tree Content */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-wood-600 z-10">
          <FileTree
            nodeId="root"
            fileSystem={fileSystem}
            selectedId={selectedId}
            onToggleFolder={handleToggleFolder}
            onSelectNode={handleNodeClick} 
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
            onRenameNode={handleRenameNode}
          />
        </div>

        {/* Status Bar */}
        <div className="h-10 border-t border-wood-700 bg-wood-800 flex items-center px-4 text-xs text-wood-400 font-sans z-10">
          {Object.keys(fileSystem).length} items in library
        </div>
      </aside>

      {/* Main Content Area - Reading Desk */}
      <main className="flex-1 relative flex flex-col bg-paper-dark">
        {openDocId && fileSystem[openDocId] ? (
          <DocumentViewer
            node={fileSystem[openDocId]}
            onUpdateContent={handleUpdateContent}
            onClose={() => setOpenDocId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-wood-700/40 p-10 select-none">
            <div className="w-32 h-32 border-4 border-current rounded-full flex items-center justify-center mb-6">
              <Book size={64} />
            </div>
            <h2 className="text-3xl font-serif font-bold mb-4 text-wood-800/50">독서할 책을 선택하세요</h2>
            <p className="max-w-md text-center font-serif italic text-lg">
              "책은 우리가 오를 수 있는 가장 높은 산이며, <br/>가장 깊은 바다이다."
            </p>
            <div className="mt-8 text-sm font-sans text-wood-600/60">
              왼쪽 목록에서 문서를 더블 클릭하여 여세요.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;