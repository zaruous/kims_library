import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FileTree from './components/FileTree';
import DocumentViewer from './components/DocumentViewer';
import NotionImportModal from './components/NotionImportModal';
import { FileSystem, FileType, FileNode } from './types';
import { Book, Plus, Search, CloudDownload, Loader2 } from './components/Icon';

// Simple UUID generator for browser
const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [fileSystem, setFileSystem] = useState<FileSystem>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetch('/api/files')
      .then(res => res.json())
      .then(data => {
        if (data.message === 'success') {
          setFileSystem(data.data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch files:", err);
        setIsLoading(false);
      });
  }, []);

  const handleToggleFolder = (id: string) => {
    setFileSystem(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: !prev[id].isOpen }
    }));
  };

  const handleSelectNode = (id: string) => {
    setSelectedId(id);
  };

  const [lastClickTime, setLastClickTime] = useState(0);
  const handleNodeClick = (id: string) => {
    const now = Date.now();
    if (now - lastClickTime < 300 && selectedId === id) {
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

  const handleAddNode = async (parentId: string, type: FileType, name: string) => {
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

    // Optimistic UI update
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
    setSelectedId(newId);

    // API Call
    try {
      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNode)
      });
    } catch (err) {
      console.error("Failed to save new node:", err);
      // Revert logic could be added here
    }
  };

  const handleDeleteNode = async (id: string) => {
    if (id === 'root') return;
    if (openDocId === id) setOpenDocId(null);

    // Optimistic UI update
    setFileSystem(prev => {
      const node = prev[id];
      const parentId = node.parentId;
      if (!parentId) return prev;

      const parent = prev[parentId];
      const newFileSystem = { ...prev };
      
      newFileSystem[parentId] = {
        ...parent,
        children: parent.children?.filter(childId => childId !== id)
      };

      const deleteRecursive = (nodeId: string) => {
        const n = newFileSystem[nodeId];
        if (n && n.children) {
          n.children.forEach(deleteRecursive);
        }
        delete newFileSystem[nodeId];
      };

      deleteRecursive(id);
      return newFileSystem;
    });
    setSelectedId(null);

    // API Call
    try {
      await fetch(`/api/files/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error("Failed to delete node:", err);
    }
  };

  const handleRenameNode = async (id: string, newName: string) => {
    setFileSystem(prev => ({
      ...prev,
      [id]: { ...prev[id], name: newName, lastModified: Date.now() }
    }));

    try {
      await fetch(`/api/files/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
    } catch (err) {
      console.error("Failed to rename node:", err);
    }
  };

  const handleUpdateContent = async (id: string, newContent: string) => {
    setFileSystem(prev => ({
      ...prev,
      [id]: { ...prev[id], content: newContent, lastModified: Date.now() }
    }));

    // Debounce or immediate save? For now, immediate save.
    try {
      await fetch(`/api/files/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
    } catch (err) {
      console.error("Failed to update content:", err);
    }
  };

  const handleMoveNode = async (nodeId: string, targetParentId: string) => {
    if (nodeId === targetParentId) return;
    
    const node = fileSystem[nodeId];
    if (!node || !node.parentId) return;

    // Check duplicate name in target folder
    const targetParent = fileSystem[targetParentId];
    let duplicateNodeId: string | undefined;

    if (targetParent.children) {
      duplicateNodeId = targetParent.children.find(childId => 
        fileSystem[childId].name === node.name && childId !== nodeId
      );
      
      if (duplicateNodeId) {
        if (!window.confirm(`'${targetParent.name}' 폴더에 이미 '${node.name}' 파일이 존재합니다.\n덮어쓰시겠습니까?`)) {
          return;
        }
        // If confirmed, proceed to delete the duplicate first
        await handleDeleteNode(duplicateNodeId);
      }
    }

    // Optimistic UI update
    setFileSystem(prev => {
      // Need to re-fetch parent because handleDeleteNode might have changed it
      // But since we are inside a functional update, 'prev' is fresh.
      // However, duplicate deletion was async, so we should rely on the state after deletion?
      // Actually, handleDeleteNode updates state. But here we are in a closure.
      // Better approach: Perform move logic directly.
      
      // If we called handleDeleteNode, the state update in there might not have reflected in 'prev' here immediately if batched,
      // but await ensures async completion. However, React state updates are not immediately reflected in 'fileSystem' variable.
      
      // Simpler approach for React State: Do everything in one setFileSystem if possible, or chain them.
      // Since handleDeleteNode is async and calls API, let's just use the logic here manually for atomic update if confirming overwrite.
      
      const currentFileSystem = duplicateNodeId ? 
        { ...prev, [duplicateNodeId]: undefined } : // This is rough, need proper deletion logic
        { ...prev };

      // Proper deletion logic copy from handleDeleteNode if duplicate exists
      if (duplicateNodeId) {
         const dupParent = currentFileSystem[targetParentId];
         if (dupParent && dupParent.children) {
           currentFileSystem[targetParentId] = {
             ...dupParent,
             children: dupParent.children.filter(id => id !== duplicateNodeId)
           };
         }
         delete currentFileSystem[duplicateNodeId];
      }

      const oldParentId = node.parentId!;
      const oldParent = currentFileSystem[oldParentId];
      const newParent = currentFileSystem[targetParentId]; // This might be modified above
      
      return {
        ...currentFileSystem,
        [oldParentId]: {
          ...oldParent,
          children: oldParent.children?.filter(id => id !== nodeId)
        },
        [targetParentId]: {
          ...newParent,
          children: [...(newParent.children || []), nodeId]
        },
        [nodeId]: {
          ...node,
          parentId: targetParentId,
          lastModified: Date.now()
        }
      };
    });

    // API Call
    try {
      if (duplicateNodeId) {
         await fetch(`/api/files/${duplicateNodeId}`, { method: 'DELETE' });
      }
      await fetch(`/api/files/${nodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: targetParentId })
      });
    } catch (err) {
      console.error("Failed to move node:", err);
    }
  };

  const handleUploadFile = async (parentId: string, file: File) => {
    const parent = fileSystem[parentId];
    let duplicateNodeId: string | undefined;

    // Check duplicate
    if (parent.children) {
       duplicateNodeId = parent.children.find(childId => 
        fileSystem[childId].name === file.name
      );
      
      if (duplicateNodeId) {
        if (!window.confirm(`'${parent.name}' 폴더에 이미 '${file.name}' 파일이 존재합니다.\n덮어쓰시겠습니까?`)) {
          return;
        }
      }
    }

    console.log('Processing file:', file.name, file.type, file.size);

    // 1. PDF Handling (Binary)
    if (file.name.toLowerCase().endsWith('.pdf')) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!uploadRes.ok) throw new Error('Upload failed');
        
        const { url } = await uploadRes.json();
        
        // Common save logic helper could be useful here, but keeping inline for now
        const nodeData = {
          name: file.name,
          type: FileType.PDF,
          url: url,
          lastModified: Date.now()
        };

        if (duplicateNodeId) {
           setFileSystem(prev => ({
            ...prev,
            [duplicateNodeId!]: { ...prev[duplicateNodeId!], ...nodeData }
          }));
          await fetch(`/api/files/${duplicateNodeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nodeData)
          });
        } else {
          const newId = generateId();
          const newNode: FileNode = {
             id: newId,
             parentId,
             ...nodeData,
             content: ''
          };
          setFileSystem(prev => {
            const parentNode = prev[parentId];
            return {
              ...prev,
              [parentId]: { ...parentNode, children: [...(parentNode.children || []), newId] },
              [newId]: newNode
            };
          });
          await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newNode)
          });
        }
      } catch (err) {
        console.error("Failed to upload PDF:", err);
        alert("PDF 업로드 실패");
      }
      return;
    }

    // 2. Text Based Handling (Google Docs or Markdown)
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      let googleType: FileType | null = null;
      let targetUrl: string | undefined;

      // A. Try to detect Google Drive Link (JSON)
      try {
        // First check extension to hint type
        const lowerName = file.name.toLowerCase();
        if (lowerName.endsWith('.gdoc')) googleType = FileType.GOOGLE_DOC;
        else if (lowerName.endsWith('.gsheet')) googleType = FileType.GOOGLE_SHEET;
        else if (lowerName.endsWith('.gslides')) googleType = FileType.GOOGLE_SLIDE;

        // Try parsing as JSON to find URL
        const json = JSON.parse(content);
        if (json.url) {
          targetUrl = json.url;
          
          // If type wasn't clear from extension, infer from URL
          if (!googleType) {
            if (targetUrl.includes('docs.google.com/document')) googleType = FileType.GOOGLE_DOC;
            else if (targetUrl.includes('docs.google.com/spreadsheets')) googleType = FileType.GOOGLE_SHEET;
            else if (targetUrl.includes('docs.google.com/presentation')) googleType = FileType.GOOGLE_SLIDE;
          }
        }
      } catch (err) {
        // Not a JSON file, ignore
      }

      // B. Determine final action
      if (googleType && targetUrl) {
         // It is a Google Doc
         const cleanName = file.name.replace(/\.g(doc|sheet|slides)$/i, '').replace(/\.json$/i, '');
         const nodeData = {
           name: duplicateNodeId ? file.name : cleanName, // Keep orig name if dup, else clean
           type: googleType,
           url: targetUrl,
           lastModified: Date.now()
         };

         if (duplicateNodeId) {
            setFileSystem(prev => ({
             ...prev,
             [duplicateNodeId!]: { ...prev[duplicateNodeId!], ...nodeData }
           }));
           await fetch(`/api/files/${duplicateNodeId}`, {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(nodeData)
           });
         } else {
           const newId = generateId();
           const newNode: FileNode = {
              id: newId,
              parentId,
              ...nodeData,
              content: ''
           };
           setFileSystem(prev => {
             const parentNode = prev[parentId];
             return {
               ...prev,
               [parentId]: { ...parentNode, children: [...(parentNode.children || []), newId] },
               [newId]: newNode
             };
           });
           await fetch('/api/files', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(newNode)
           });
         }
      } else {
        // C. Fallback: Treat as Markdown/Text
        const nodeData = {
          name: file.name,
          type: FileType.MARKDOWN,
          content: content,
          lastModified: Date.now()
        };

        if (duplicateNodeId) {
          setFileSystem(prev => ({
            ...prev,
            [duplicateNodeId!]: { ...prev[duplicateNodeId!], ...nodeData }
          }));
          await fetch(`/api/files/${duplicateNodeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content })
          });
        } else {
          const newId = generateId();
          const newNode: FileNode = {
            id: newId,
            parentId,
            ...nodeData
          };
          setFileSystem(prev => {
            const parentNode = prev[parentId];
            return {
              ...prev,
              [parentId]: { ...parentNode, children: [...(parentNode.children || []), newId] },
              [newId]: newNode
            };
          });
          await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newNode)
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleNotionImport = async (files: Partial<FileNode>[]) => {
    const newFilesMap: FileSystem = {};
    const newIds: string[] = [];

    files.forEach(file => {
      const newId = generateId();
      newIds.push(newId);
      newFilesMap[newId] = {
        id: newId,
        parentId: 'root',
        name: file.name || 'Untitled',
        type: file.type || FileType.MARKDOWN,
        content: file.content || '',
        lastModified: Date.now()
      };
    });

    setFileSystem(prev => {
      const root = prev['root'];
      return {
        ...prev,
        ...newFilesMap,
        'root': {
          ...root,
          children: [...(root.children || []), ...newIds]
        }
      };
    });

    // Batch create via API (loop for now)
    for (const id of newIds) {
      const file = newFilesMap[id];
      try {
        await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(file)
        });
      } catch (err) {
        console.error("Failed to save imported file:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-wood-900 text-wood-100 items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen w-full bg-wood-900 text-wood-100 overflow-hidden"
      onClick={() => setActiveMenuId(null)}
      onContextMenu={() => setActiveMenuId(null)} 
    >
      <NotionImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={handleNotionImport} 
      />

      <aside 
        className="w-72 flex flex-col border-r border-wood-900 shadow-2xl z-10 bg-[#3e2b22] relative"
        onContextMenu={(e) => e.stopPropagation()} 
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")'}}>
        </div>
        
        <div className="h-16 flex items-center px-6 border-b border-wood-700 bg-wood-800 z-10 shadow-sm">
          <Book className="text-amber-500 mr-3" size={24} />
          <h1 className="text-xl font-serif font-bold text-amber-100 tracking-wider">Library Sanctum</h1>
        </div>

        <div className="px-4 py-3 flex items-center justify-between border-b border-wood-700/50 z-10">
          <div className="text-xs text-wood-300 font-sans uppercase tracking-widest">Documents</div>
          <div className="flex gap-1">
            <button 
               onClick={(e) => { e.stopPropagation(); setIsImportModalOpen(true); }}
               className="p-1 hover:bg-wood-700 rounded text-amber-200 transition-colors" 
               title="외부 자료 가져오기 (Notion)"
            >
              <CloudDownload size={16} />
            </button>
            <button 
               onClick={(e) => { e.stopPropagation(); handleAddNode('root', FileType.FOLDER, '새 폴더'); }}
               className="p-1 hover:bg-wood-700 rounded text-amber-200 transition-colors" 
               title="루트에 폴더 추가"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-wood-600 z-10">
          {fileSystem['root'] && (
            <FileTree
              nodeId="root"
              fileSystem={fileSystem}
              selectedId={selectedId}
              activeMenuId={activeMenuId} 
              onToggleFolder={handleToggleFolder}
              onSelectNode={handleNodeClick} 
              onAddNode={handleAddNode}
              onDeleteNode={handleDeleteNode}
              onRenameNode={handleRenameNode}
              onMoveNode={handleMoveNode}
              onUploadFile={handleUploadFile}
              onMenuOpen={setActiveMenuId} 
            />
          )}
        </div>

        <div className="h-10 border-t border-wood-700 bg-wood-800 flex items-center px-4 text-xs text-wood-400 font-sans z-10">
          {Object.keys(fileSystem).length} items in library
        </div>
      </aside>

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
