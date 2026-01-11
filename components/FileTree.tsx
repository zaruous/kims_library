import React, { useState } from 'react';
import { FileNode, FileType, FileSystem } from '../types';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  File, 
  ChevronRight, 
  ChevronDown, 
  MoreVertical, 
  Trash2,
  Edit2,
  Plus,
  Book,
  FileSpreadsheet,
  Presentation
} from './Icon';

interface FileTreeProps {
  nodeId: string;
  fileSystem: FileSystem;
  selectedId: string | null;
  activeMenuId: string | null;
  onToggleFolder: (id: string) => void;
  onSelectNode: (id: string) => void;
  onAddNode: (parentId: string, type: FileType, name: string) => void;
  onDeleteNode: (id: string) => void;
  onRenameNode: (id: string, newName: string) => void;
  onMoveNode: (nodeId: string, targetParentId: string) => void;
  onUploadFile: (parentId: string, file: File) => void;
  onMenuOpen: (id: string | null) => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  nodeId,
  fileSystem,
  selectedId,
  activeMenuId,
  onToggleFolder,
  onSelectNode,
  onAddNode,
  onDeleteNode,
  onRenameNode,
  onMoveNode,
  onUploadFile,
  onMenuOpen
}) => {
  const node = fileSystem[nodeId];
  const isMenuOpen = activeMenuId === nodeId;
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node?.name || "");

  if (!node) return null;

  const isSelected = selectedId === nodeId;
  const isFolder = node.type === FileType.FOLDER;
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      onToggleFolder(nodeId);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNode(nodeId);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeMenuId === nodeId) {
      onMenuOpen(null);
    } else {
      onMenuOpen(nodeId);
    }
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim()) {
      onRenameNode(nodeId, renameValue);
    }
    setIsRenaming(false);
    onMenuOpen(null);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    // Only allow dragging if not editing
    if (isRenaming) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/json', JSON.stringify({ nodeId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only allow dropping on folders
    if (isFolder) {
      e.dataTransfer.dropEffect = 'move';
      e.currentTarget.classList.add('bg-wood-600', 'ring-2', 'ring-amber-400');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFolder) {
      e.currentTarget.classList.remove('bg-wood-600', 'ring-2', 'ring-amber-400');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-wood-600', 'ring-2', 'ring-amber-400');

    if (!isFolder) return;

    // 1. Handle External File Upload
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
        onUploadFile(nodeId, file);
      });
      return;
    }

    // 2. Handle Internal Node Move
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      try {
        const { nodeId: draggedNodeId } = JSON.parse(data);
        if (draggedNodeId) {
          onMoveNode(draggedNodeId, nodeId);
        }
      } catch (err) {
        console.error("Failed to parse drag data", err);
      }
    }
  };

  const getIcon = () => {
    if (isFolder) {
      return node.isOpen ? <FolderOpen size={16} className="text-amber-400" /> : <Folder size={16} className="text-amber-400" />;
    }
    if (node.type === FileType.PDF) {
      return <Book size={16} className="text-red-400" />;
    }
    if (node.type === FileType.GOOGLE_DOC) {
      return <FileText size={16} className="text-blue-400" />;
    }
    if (node.type === FileType.GOOGLE_SHEET) {
      return <FileSpreadsheet size={16} className="text-green-400" />;
    }
    if (node.type === FileType.GOOGLE_SLIDE) {
      return <Presentation size={16} className="text-orange-400" />;
    }
    return <FileText size={16} className="text-blue-300" />;
  };

  return (
    <div className="select-none font-sans text-sm">
      <div
        className={`
          group flex items-center gap-2 py-1.5 px-2 cursor-pointer transition-colors duration-200 border-2 border-transparent
          ${isSelected ? 'bg-wood-700 text-white' : 'text-wood-100 hover:bg-wood-800'}
        `}
        draggable={!isRenaming}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <span 
          onClick={handleToggle} 
          className={`p-0.5 rounded hover:bg-white/10 ${hasChildren || isFolder ? 'opacity-100' : 'opacity-0'}`}
        >
          {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>

        {getIcon()}

        {isRenaming ? (
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
              autoFocus
              className="bg-wood-900 text-white px-1 border border-amber-500 outline-none rounded w-full h-6"
              onClick={(e) => e.stopPropagation()}
            />
        ) : (
          <span className="truncate flex-1 font-medium tracking-wide">{node.name}</span>
        )}

        <div className="relative ml-auto">
           {/* Context Menu Trigger */}
           <button 
              onClick={(e) => {
                e.stopPropagation();
                if (activeMenuId === nodeId) onMenuOpen(null);
                else onMenuOpen(nodeId);
              }}
              className={`p-1 rounded hover:bg-white/20 ${isMenuOpen || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
           >
              <MoreVertical size={14} />
           </button>
           
           {/* Context Menu Dropdown */}
           {isMenuOpen && (
             <div className="absolute right-0 top-6 w-40 bg-wood-800 text-amber-200 shadow-2xl rounded border border-wood-700 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                {isFolder && (
                  <>
                    <button 
                      className="flex items-center gap-2 px-3 py-2 hover:bg-wood-700 text-left text-xs transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddNode(nodeId, FileType.FOLDER, "새 폴더");
                        onMenuOpen(null);
                      }}
                    >
                      <Folder size={12} className="text-amber-400" /> 폴더 추가
                    </button>
                    <button 
                      className="flex items-center gap-2 px-3 py-2 hover:bg-wood-700 text-left text-xs transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddNode(nodeId, FileType.MARKDOWN, "새 문서.md");
                        onMenuOpen(null);
                      }}
                    >
                      <FileText size={12} className="text-amber-400" /> 문서 추가
                    </button>
                    <div className="h-px bg-wood-700/50 my-0.5"></div>
                  </>
                )}
                <button 
                  className="flex items-center gap-2 px-3 py-2 hover:bg-wood-700 text-left text-xs transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                    onMenuOpen(null);
                  }}
                >
                  <Edit2 size={12} className="text-amber-400" /> 이름 변경
                </button>
                <button 
                  className="flex items-center gap-2 px-3 py-2 hover:bg-red-900/40 hover:text-red-300 text-left text-xs text-red-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNode(nodeId);
                    onMenuOpen(null);
                  }}
                >
                  <Trash2 size={12} /> 삭제
                </button>
             </div>
           )}
        </div>
      </div>

      {node.isOpen && node.children && (
        <div className="pl-4 border-l border-wood-700/30 ml-3">
          {node.children.map(childId => (
            <FileTree
              key={childId}
              nodeId={childId}
              fileSystem={fileSystem}
              selectedId={selectedId}
              activeMenuId={activeMenuId}
              onToggleFolder={onToggleFolder}
              onSelectNode={onSelectNode}
              onAddNode={onAddNode}
              onDeleteNode={onDeleteNode}
              onRenameNode={onRenameNode}
              onMoveNode={onMoveNode}
              onUploadFile={onUploadFile}
              onMenuOpen={onMenuOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTree;