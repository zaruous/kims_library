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
  Book
} from './Icon';

interface FileTreeProps {
  nodeId: string;
  fileSystem: FileSystem;
  selectedId: string | null;
  onToggleFolder: (id: string) => void;
  onSelectNode: (id: string) => void;
  onAddNode: (parentId: string, type: FileType, name: string) => void;
  onDeleteNode: (id: string) => void;
  onRenameNode: (id: string, newName: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  nodeId,
  fileSystem,
  selectedId,
  onToggleFolder,
  onSelectNode,
  onAddNode,
  onDeleteNode,
  onRenameNode
}) => {
  const node = fileSystem[nodeId];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    setIsMenuOpen(!isMenuOpen);
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim()) {
      onRenameNode(nodeId, renameValue);
    }
    setIsRenaming(false);
    setIsMenuOpen(false);
  };

  const getIcon = () => {
    if (isFolder) {
      return node.isOpen ? <FolderOpen size={16} className="text-amber-400" /> : <Folder size={16} className="text-amber-400" />;
    }
    if (node.type === FileType.PDF) {
      return <Book size={16} className="text-red-400" />;
    }
    return <FileText size={16} className="text-blue-300" />;
  };

  return (
    <div className="select-none font-sans text-sm">
      <div
        className={`
          group flex items-center gap-2 py-1.5 px-2 cursor-pointer transition-colors duration-200
          ${isSelected ? 'bg-wood-700 text-white' : 'text-wood-100 hover:bg-wood-800'}
        `}
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
           {/* Context Menu Trigger (visible on hover or if menu open) */}
           <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className={`p-1 rounded hover:bg-white/20 ${isMenuOpen || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
           >
              <MoreVertical size={14} />
           </button>
           
           {/* Context Menu Dropdown */}
           {isMenuOpen && (
             <div className="absolute right-0 top-6 w-40 bg-paper-DEFAULT text-wood-900 shadow-xl rounded-md border border-wood-300 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                {isFolder && (
                  <>
                    <button 
                      className="flex items-center gap-2 px-3 py-2 hover:bg-wood-300 hover:text-white text-left text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddNode(nodeId, FileType.FOLDER, "새 폴더");
                        setIsMenuOpen(false);
                      }}
                    >
                      <Folder size={12} /> 폴더 추가
                    </button>
                    <button 
                      className="flex items-center gap-2 px-3 py-2 hover:bg-wood-300 hover:text-white text-left text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddNode(nodeId, FileType.MARKDOWN, "새 문서.md");
                        setIsMenuOpen(false);
                      }}
                    >
                      <FileText size={12} /> 문서 추가
                    </button>
                    <div className="h-px bg-wood-300/50 my-0.5"></div>
                  </>
                )}
                <button 
                  className="flex items-center gap-2 px-3 py-2 hover:bg-wood-300 hover:text-white text-left text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <Edit2 size={12} /> 이름 변경
                </button>
                <button 
                  className="flex items-center gap-2 px-3 py-2 hover:red-500 hover:bg-red-50 hover:text-red-700 text-left text-xs text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNode(nodeId);
                    setIsMenuOpen(false);
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
              onToggleFolder={onToggleFolder}
              onSelectNode={onSelectNode}
              onAddNode={onAddNode}
              onDeleteNode={onDeleteNode}
              onRenameNode={onRenameNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTree;