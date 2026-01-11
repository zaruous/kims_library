import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Since we can't install uuid, I will implement a simple one
import FileTree from './components/FileTree';
import DocumentViewer from './components/DocumentViewer';
import { FileSystem, FileType, FileNode } from './types';
import { Book, Plus, Search } from './components/Icon';

// Simple UUID generator for browser
const generateId = () => Math.random().toString(36).substring(2, 9);

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
    content: `# 도서관에 오신 것을 환영합니다.\n\n이 프로그램은 고풍스러운 도서관 경험을 디지털로 제공합니다.\n\n### 기능 안내\n- **문서 트리**: 왼쪽 사이드바에서 폴더와 문서를 관리하세요.\n- **읽기 및 쓰기**: 문서를 더블 클릭하여 열고, 내용을 수정하면 즉시 반영됩니다.\n- **AI 사서**: 우측 상단의 'AI 사서' 버튼을 눌러 문서 요약이나 질문을 할 수 있습니다.\n\n편안한 독서 되세요.`,
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