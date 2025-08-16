import React, { useState, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Folder, 
  FolderOpen, 
  File, 
  Star, 
  Calendar, 
  Bell, 
  Palette, 
  Bold, 
  Italic, 
  Underline, 
  Highlighter,
  Link,
  Image,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Save,
  X,
  MoreHorizontal,
  Tag,
  Clock,
  Archive,
  Share,
  BookOpen,
  Bookmark,
  Filter,
  SortAsc,
  Grid,
  Menu,
  CheckSquare
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import './NotionLikeNotes.css';
import useCourseStore from '../../store/courseStore';

// Note data structure example
const initialNotes = [
  {
    id: '1',
    title: 'Database Fundamentals',
    content: 'A database is a structured collection of data...',
    folderId: 'intro',
    tags: ['database', 'fundamentals'],
    starred: true,
    color: '#fef3c7',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    reminder: null,
    isPublic: false
  },
  {
    id: '2',
    title: 'SQL Queries',
    content: 'SELECT statements are used to query data...',
    folderId: 'sql',
    tags: ['sql', 'queries'],
    starred: false,
    color: '#dbeafe',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    reminder: new Date('2024-01-20'),
    isPublic: true
  }
];

const initialFolders = [
  { id: 'intro', name: 'Introduction to Databases', parentId: null, expanded: true, color: '#f3f4f6' },
  { id: 'sql', name: 'SQL Fundamentals', parentId: null, expanded: false, color: '#e5e7eb' },
  { id: 'advanced', name: 'Advanced Topics', parentId: null, expanded: false, color: '#f9fafb' }
];

const NotesPage = () => {
  const { currentCourse } = useCourseStore();
  
  // State management
  const [notes, setNotes] = useState(initialNotes);
  const [folders, setFolders] = useState(initialFolders);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'minimal'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('updatedAt'); // 'updatedAt', 'createdAt', 'title', 'starred'
  const [isEditing, setIsEditing] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  
  // Editor state
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editorMode, setEditorMode] = useState('edit'); // 'edit', 'preview'
  const [currentColor, setCurrentColor] = useState('#ffffff');
  
  const editorRef = useRef(null);

  // Color palette for notes
  const colorPalette = [
    '#ffffff', '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', 
    '#f3e8ff', '#fed7d7', '#fef0e7', '#e0f2fe', '#f0f9ff'
  ];

  // Function to determine if a color is light or dark
  const isLightColor = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
  };

  // Get text color based on background
  const getTextColor = (backgroundColor) => {
    return isLightColor(backgroundColor) ? '#1f2937' : '#ffffff';
  };

  // Get all unique tags
  const allTags = [...new Set(notes.flatMap(note => note.tags))];

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => note.tags.includes(tag));
      const matchesFolder = !selectedFolder || note.folderId === selectedFolder;
      return matchesSearch && matchesTags && matchesFolder;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'starred':
          return b.starred - a.starred;
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

  // Toolbar functions
  const insertText = (before, after = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editContent.substring(start, end);
    
    const newText = editContent.substring(0, start) + 
                   before + selectedText + after + 
                   editContent.substring(end);
    
    setEditContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const toolbarItems = [
    { icon: Bold, action: () => insertText('**', '**'), tooltip: 'Bold' },
    { icon: Italic, action: () => insertText('*', '*'), tooltip: 'Italic' },
    { icon: Underline, action: () => insertText('<u>', '</u>'), tooltip: 'Underline' },
    { icon: Highlighter, action: () => insertText('==', '=='), tooltip: 'Highlight' },
    { icon: Code, action: () => insertText('`', '`'), tooltip: 'Inline Code' },
    { icon: Heading1, action: () => insertText('# '), tooltip: 'Heading 1' },
    { icon: Heading2, action: () => insertText('## '), tooltip: 'Heading 2' },
    { icon: Heading3, action: () => insertText('### '), tooltip: 'Heading 3' },
    { icon: List, action: () => insertText('- '), tooltip: 'Bullet List' },
    { icon: ListOrdered, action: () => insertText('1. '), tooltip: 'Numbered List' },
    { icon: Quote, action: () => insertText('> '), tooltip: 'Quote' },
    { icon: Link, action: () => insertText('[', '](url)'), tooltip: 'Link' },
    { icon: Image, action: () => insertText('![alt](', ')'), tooltip: 'Image' },
  ];

  const createNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      folderId: selectedFolder || folders[0]?.id || null,
      tags: [],
      starred: false,
      color: '#ffffff',
      createdAt: new Date(),
      updatedAt: new Date(),
      reminder: null,
      isPublic: false
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setCurrentColor(newNote.color);
    setShowNewNoteModal(false);
  };

  const saveNote = () => {
    if (!selectedNote) return;
    
    const updatedNotes = notes.map(note => 
      note.id === selectedNote.id 
        ? { 
            ...note, 
            title: editTitle || 'Untitled Note',
            content: editContent,
            color: currentColor,
            updatedAt: new Date()
          }
        : note
    );
    setNotes(updatedNotes);
    setSelectedNote({ ...selectedNote, title: editTitle, content: editContent, color: currentColor });
    setIsEditing(false);
  };

  const deleteNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const toggleStar = (noteId) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, starred: !note.starred } : note
    ));
  };

  const createFolder = (name, parentId = null) => {
    const newFolder = {
      id: Date.now().toString(),
      name,
      parentId,
      expanded: true,
      color: '#f3f4f6'
    };
    setFolders([...folders, newFolder]);
    setShowNewFolderModal(false);
  };

  const toggleFolder = (folderId) => {
    setFolders(folders.map(folder => 
      folder.id === folderId ? { ...folder, expanded: !folder.expanded } : folder
    ));
  };

  const renderFolderTree = (parentId = null, level = 0) => {
    return folders
      .filter(folder => folder.parentId === parentId)
      .map(folder => (
        <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
          <div 
            className={`flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors ${
              selectedFolder === folder.id ? 'bg-blue-100 border-l-2 border-blue-500' : ''
            }`}
            onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }}
              className="mr-1 p-1 hover:bg-gray-200 rounded transition-colors"
              title={folder.expanded ? 'Collapse folder' : 'Expand folder'}
            >
              {folder.expanded ? 
                <ChevronDown className="h-4 w-4 text-gray-600" /> : 
                <ChevronRight className="h-4 w-4 text-gray-600" />
              }
            </button>
            {folder.expanded ? 
              <FolderOpen className="h-4 w-4 mr-2 text-yellow-600" /> :
              <Folder className="h-4 w-4 mr-2 text-yellow-600" />
            }
            <span className="text-sm font-medium text-gray-800 truncate flex-1">{folder.name}</span>
            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
              {notes.filter(note => note.folderId === folder.id).length}
            </span>
          </div>
          {folder.expanded && renderFolderTree(folder.id, level + 1)}
        </div>
      ));
  };

  const renderMarkdown = (content) => {
    const textColor = getTextColor(currentColor);
    const isDark = !isLightColor(currentColor);
    
    // Dynamic color classes based on background
    const strongClass = isDark ? 'text-white font-bold' : 'text-gray-900 font-bold';
    const emClass = isDark ? 'text-gray-100 italic' : 'text-gray-800 italic';
    const underlineClass = isDark ? 'text-white underline' : 'text-gray-900 underline';
    const markClass = isDark ? 'bg-yellow-400 text-gray-900 px-1 rounded' : 'bg-yellow-200 text-gray-900 px-1 rounded';
    const codeClass = isDark ? 'bg-gray-700 text-gray-100 px-1.5 py-0.5 rounded font-mono text-sm' : 'bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded font-mono text-sm';
    const h1Class = isDark ? 'text-2xl font-bold text-white mb-4 mt-6' : 'text-2xl font-bold text-gray-900 mb-4 mt-6';
    const h2Class = isDark ? 'text-xl font-bold text-white mb-3 mt-5' : 'text-xl font-bold text-gray-900 mb-3 mt-5';
    const h3Class = isDark ? 'text-lg font-bold text-white mb-2 mt-4' : 'text-lg font-bold text-gray-900 mb-2 mt-4';
    const blockquoteClass = isDark ? 'border-l-4 border-gray-400 pl-4 text-gray-200 italic my-4' : 'border-l-4 border-gray-300 pl-4 text-gray-700 italic my-4';
    const liClass = isDark ? 'text-gray-100 mb-1' : 'text-gray-800 mb-1';
    const linkClass = isDark ? 'text-blue-400 hover:text-blue-300 underline' : 'text-blue-600 hover:text-blue-800 underline';
    
    // Simple markdown rendering with LaTeX support
    let html = content
      .replace(/\*\*(.*?)\*\*/g, `<strong class="${strongClass}">$1</strong>`)
      .replace(/\*(.*?)\*/g, `<em class="${emClass}">$1</em>`)
      .replace(/<u>(.*?)<\/u>/g, `<u class="${underlineClass}">$1</u>`)
      .replace(/==(.*?)==/g, `<mark class="${markClass}">$1</mark>`)
      .replace(/`(.*?)`/g, `<code class="${codeClass}">$1</code>`)
      .replace(/^# (.*$)/gim, `<h1 class="${h1Class}">$1</h1>`)
      .replace(/^## (.*$)/gim, `<h2 class="${h2Class}">$1</h2>`)
      .replace(/^### (.*$)/gim, `<h3 class="${h3Class}">$1</h3>`)
      .replace(/^> (.*$)/gim, `<blockquote class="${blockquoteClass}">$1</blockquote>`)
      .replace(/^- (.*$)/gim, `<li class="${liClass}">$1</li>`)
      .replace(/^1\. (.*$)/gim, `<li class="${liClass}">$1</li>`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" class="${linkClass}">$1</a>`)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-sm my-4" />');
    
    return (
      <div className="prose prose-enhanced prose-gray max-w-none">
        <div 
          className="leading-relaxed"
          style={{ color: textColor }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="mt-4">
          <Latex>{content}</Latex>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden relative">
      {/* Mobile overlay */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 backdrop-blur-sm"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ 
          width: sidebarCollapsed ? (window.innerWidth < 1024 ? 0 : 64) : 320,
          x: sidebarCollapsed && window.innerWidth < 1024 ? -320 : 0
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="bg-white border-r border-gray-200/80 flex flex-col shadow-lg backdrop-blur-sm z-40 relative overflow-hidden"
      >
        {/* Sidebar Header */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200/60 bg-white/95 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="min-w-0 flex-1"
              >
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Notes</h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 truncate">
                  {currentCourse?.title || 'All Courses'}
                </p>
              </motion.div>
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="touch-target p-2 lg:p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:scale-105 active:scale-95"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className={`${sidebarCollapsed ? 'h-5 w-5' : 'h-5 w-5 lg:h-6 lg:w-6'} text-gray-700`} />
            </button>
          </div>
          
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.2 }}
                className="mt-3 sm:mt-4 lg:mt-6 space-y-2 sm:space-y-3"
              >
                <button 
                  onClick={() => setShowNewNoteModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 lg:py-3.5 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 font-semibold text-xs sm:text-sm lg:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] touch-feedback"
                >
                  <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="hidden xs:inline">New Note</span>
                </button>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowNewFolderModal(true)}
                    className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 sm:py-2.5 lg:py-3 rounded-xl transition-all duration-200 text-xs sm:text-sm lg:text-base font-medium hover:scale-[1.02] active:scale-[0.98] touch-feedback"
                  >
                    <Folder className="h-3 w-3 sm:h-4 sm:w-4 lg:h-4 lg:w-4" />
                    <span className="hidden sm:inline lg:inline">New Folder</span>
                    <span className="sm:hidden lg:hidden">Folder</span>
                  </button>
                  
                  <button 
                    onClick={() => setShowTagFilter(!showTagFilter)}
                    className="touch-target px-2 sm:px-3 py-2 sm:py-2.5 lg:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:scale-105 active:scale-95"
                    title="Filters"
                  >
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 lg:h-4 lg:w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!sidebarCollapsed && (
            <>
              {/* Search */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.1 }}
                className="p-3 sm:p-4 lg:p-6 border-b border-gray-200/60 flex-shrink-0"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 lg:pl-12 pr-4 py-2.5 sm:py-3 lg:py-3.5 border border-gray-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 text-gray-900 placeholder-gray-500 transition-all duration-200 text-sm lg:text-base bg-gray-50/50 hover:bg-white touch-feedback"
                  />
                </div>
                
                {/* Filters */}
                <AnimatePresence>
                  {showTagFilter && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/60 shadow-sm backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm lg:text-base font-semibold text-gray-700">Tags</span>
                        <select 
                          value={sortBy} 
                          onChange={(e) => setSortBy(e.target.value)}
                          className="text-xs lg:text-sm border border-gray-300/60 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 bg-white"
                        >
                          <option value="updatedAt">Last Modified</option>
                          <option value="createdAt">Date Created</option>
                          <option value="title">Title</option>
                          <option value="starred">Starred</option>
                        </select>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => {
                              if (selectedTags.includes(tag)) {
                                setSelectedTags(selectedTags.filter(t => t !== tag));
                              } else {
                                setSelectedTags([...selectedTags, tag]);
                              }
                            }}
                            className={`px-3 py-1.5 text-xs lg:text-sm rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 touch-feedback ${
                              selectedTags.includes(tag) 
                                ? 'bg-blue-500 text-white shadow-md' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Folders */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.2 }}
                className="flex-1 overflow-y-auto scrollbar-thin scroll-optimized"
              >
                <div className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm lg:text-base font-bold text-gray-700">Folders</h3>
                    <button 
                      onClick={() => setSelectedFolder(null)}
                      className={`text-xs lg:text-sm px-3 py-1.5 rounded-lg transition-all duration-200 font-medium hover:scale-105 touch-feedback ${
                        !selectedFolder ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      All
                    </button>
                  </div>
                  {renderFolderTree()}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0 overflow-hidden">
        {/* Notes List */}
        <motion.div 
          initial={false}
          animate={{ 
            x: selectedNote && isEditing && window.innerWidth < 1024 ? -100 : 0,
            opacity: selectedNote && isEditing && window.innerWidth < 1024 ? 0 : 1
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={`${selectedNote && isEditing ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 xl:w-96 bg-white border-r border-gray-200/60 flex-col shadow-lg`}
        >
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200/60 bg-white/95 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 truncate text-sm sm:text-base lg:text-lg tracking-tight">
                {selectedFolder ? folders.find(f => f.id === selectedFolder)?.name : 'All Notes'}
              </h2>
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                <button 
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="touch-target p-1.5 sm:p-2 lg:p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:scale-105 active:scale-95"
                  title={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}
                >
                  <Grid className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-gray-600" />
                </button>
                <span className="text-xs sm:text-sm lg:text-base text-gray-500 font-semibold bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                  {filteredNotes.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin bg-gradient-to-b from-white to-gray-50/30 scroll-optimized">
            <AnimatePresence mode="wait">
              {filteredNotes.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="p-4 sm:p-6 lg:p-8 text-center text-gray-500"
                >
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mx-auto mb-4 text-gray-300" />
                  <p className="mb-2 font-semibold text-gray-600 text-sm sm:text-base lg:text-lg">No notes found</p>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-500 mb-4 sm:mb-6">Create your first note to get started</p>
                  <button
                    onClick={() => setShowNewNoteModal(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 font-semibold text-xs sm:text-sm lg:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1 touch-feedback"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                    Create Note
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={viewMode === 'grid' ? 'p-3 sm:p-4 lg:p-6 grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4 mobile-grid' : 'space-y-1'}
                >
                  {filteredNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      onClick={() => {
                        setSelectedNote(note);
                        setEditTitle(note.title);
                        setEditContent(note.content);
                        setCurrentColor(note.color);
                        setIsEditing(false);
                      }}
                      className={`note-card note-card-mobile group ${viewMode === 'grid' ? 'p-3 sm:p-4 lg:p-5 rounded-xl min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] shadow-sm hover:shadow-lg' : 'p-3 sm:p-4 lg:p-5'} cursor-pointer border-l-4 hover:bg-gray-50/80 transition-all duration-300 gpu-accelerated touch-feedback ${
                        selectedNote?.id === note.id 
                          ? 'bg-blue-50/80 border-l-blue-500 shadow-md ring-1 ring-blue-200/50' 
                          : 'border-l-transparent hover:border-l-gray-300 hover:shadow-sm'
                      }`}
                      style={{ backgroundColor: viewMode === 'grid' ? `${note.color}20` : 'transparent' }}
                    >
                      <div className="flex items-start justify-between h-full">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2 mb-2">
                            <h3 className="font-semibold text-xs sm:text-sm lg:text-base truncate text-gray-900 group-hover:text-gray-800">
                              {note.title}
                            </h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {note.starred && <Star className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-500 fill-current" />}
                              {note.reminder && <Bell className="h-3 w-3 lg:h-4 lg:w-4 text-orange-500" />}
                            </div>
                          </div>
                          
                          <p className="text-xs lg:text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {note.content.substring(0, 120)}...
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex gap-1 flex-wrap">
                              {note.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg font-medium transition-colors">
                                  {tag}
                                </span>
                              ))}
                              {note.tags.length > 2 && (
                                <span className="text-xs text-gray-500 font-medium">+{note.tags.length - 2}</span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStar(note.id);
                                }}
                                className="touch-target p-1 sm:p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:scale-110 active:scale-95"
                                title={note.starred ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <Star className={`h-3 w-3 lg:h-4 lg:w-4 ${note.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Are you sure you want to delete this note?')) {
                                    deleteNote(note.id);
                                  }
                                }}
                                className="touch-target p-1 sm:p-1.5 lg:p-2 hover:bg-red-50 rounded-lg text-red-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 hover:scale-110 active:scale-95"
                                title="Delete note"
                              >
                                <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-xs lg:text-sm text-gray-500 mt-2 font-medium">
                            {note.updatedAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-white min-w-0 shadow-xl border-l border-gray-200/60 overflow-hidden">
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="p-4 lg:p-6 border-b border-gray-200/60 bg-white/95 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4 lg:mb-6 gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Mobile sidebar toggle */}
                  {sidebarCollapsed && (
                    <button
                      onClick={() => setSidebarCollapsed(false)}
                      className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:scale-105"
                      title="Open sidebar"
                    >
                      <Menu className="h-5 w-5 text-gray-600" />
                    </button>
                  )}
                  
                  {/* Back button for mobile */}
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:scale-105"
                    title="Back to notes list"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                  
                  {isEditing ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-xl lg:text-2xl xl:text-3xl font-bold bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 min-w-0 flex-1 focus:ring-2 focus:ring-blue-500/40 rounded-lg px-3 py-2 tracking-tight"
                      placeholder="Note title..."
                    />
                  ) : (
                    <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 truncate tracking-tight">
                      {selectedNote.title}
                    </h1>
                  )}
                  
                  <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                    {selectedNote.starred && <Star className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-500 fill-current" />}
                    {selectedNote.reminder && <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-orange-500" />}
                    {selectedNote.isPublic && <Share className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />}
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                  {/* Color Picker */}
                  <div className={`${isEditing ? 'hidden sm:flex' : 'flex'} items-center gap-1 lg:gap-2`}>
                    {colorPalette.map(color => (
                      <button
                        key={color}
                        onClick={() => setCurrentColor(color)}
                        className={`w-6 h-6 lg:w-8 lg:h-8 rounded-xl border-2 transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                          currentColor === color ? 'border-gray-400 shadow-lg scale-110' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        title="Change note color"
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1 lg:gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')}
                          className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 text-sm lg:text-base border border-gray-300/60 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:scale-105"
                        >
                          {editorMode === 'edit' ? <Eye className="h-4 w-4 lg:h-5 lg:w-5" /> : <Edit className="h-4 w-4 lg:h-5 lg:w-5" />}
                          <span className="hidden sm:inline">{editorMode === 'edit' ? 'Preview' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={saveNote}
                          className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 text-sm lg:text-base bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                          <Save className="h-4 w-4 lg:h-5 lg:w-5" />
                          <span className="hidden sm:inline">Save</span>
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="p-2 lg:p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:scale-105"
                          title="Cancel editing"
                        >
                          <X className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 text-sm lg:text-base border border-gray-300/60 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:scale-105"
                      >
                        <Edit className="h-4 w-4 lg:h-5 lg:w-5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              {isEditing && editorMode === 'edit' && (
                <div className="flex items-center gap-1 lg:gap-2 p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl overflow-x-auto scrollbar-thin border border-gray-200/60 shadow-sm">
                  {toolbarItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.action}
                      className="p-2 lg:p-2.5 hover:bg-gray-200 rounded-xl transition-all duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:scale-105 active:scale-95"
                      title={item.tooltip}
                    >
                      <item.icon className="h-4 w-4 lg:h-5 lg:w-5 text-gray-700" />
                    </button>
                  ))}
                  <div className="w-px h-6 lg:h-8 bg-gray-300 mx-2 flex-shrink-0" />
                  <button
                    onClick={() => insertText('$$', '$$')}
                    className="px-3 lg:px-4 py-1.5 lg:py-2 text-sm lg:text-base bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-xl hover:from-blue-200 hover:to-blue-100 transition-all duration-200 font-semibold flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:scale-105"
                    title="LaTeX Block"
                  >
                    LaTeX
                  </button>
                </div>
              )}
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-4 lg:p-6 xl:p-8 overflow-hidden" style={{ 
              backgroundColor: currentColor,
              color: getTextColor(currentColor)
            }}>
              {isEditing ? (
                editorMode === 'edit' ? (
                  <textarea
                    ref={editorRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full resize-none border-none outline-none bg-transparent font-mono text-sm lg:text-base text-gray-900 placeholder-gray-500 leading-relaxed focus:ring-2 focus:ring-blue-500/40 rounded-xl p-4 lg:p-6"
                    placeholder="Start writing your note... Use $...$ for inline LaTeX or $$...$$ for display LaTeX."
                    style={{ color: getTextColor(currentColor) }}
                  />
                ) : (
                  <div className="h-full overflow-y-auto scrollbar-thin animate-fade-in">
                    {renderMarkdown(editContent)}
                  </div>
                )
              ) : (
                <div className="h-full overflow-y-auto scrollbar-thin">
                  {renderMarkdown(selectedNote.content)}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 lg:p-6 border-t border-gray-200/60 bg-gradient-to-r from-gray-50 to-white backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:gap-4 text-sm lg:text-base text-gray-600">
                <div className="flex flex-wrap items-center gap-3 lg:gap-6">
                  <span className="font-medium">Created: {selectedNote.createdAt.toLocaleDateString()}</span>
                  <span className="font-medium">Modified: {selectedNote.updatedAt.toLocaleDateString()}</span>
                  <span className="font-medium">Words: {selectedNote.content.split(' ').filter(word => word.length > 0).length}</span>
                  <span className="font-medium">Characters: {selectedNote.content.length}</span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedNote.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs lg:text-sm rounded-lg font-semibold transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-6 lg:p-12 animate-fade-in">
            <div className="text-center max-w-md lg:max-w-lg">
              <BookOpen className="h-16 w-16 lg:h-20 lg:w-20 xl:h-24 xl:w-24 mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-4 text-gray-700 tracking-tight">Select a note to start</h3>
              <p className="text-sm lg:text-base xl:text-lg text-gray-500 mb-8 leading-relaxed">Choose a note from the sidebar or create a new one to begin writing</p>
              <button
                onClick={() => setShowNewNoteModal(true)}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3 lg:py-4 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 font-bold text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
              >
                <Plus className="h-5 w-5 lg:h-6 lg:w-6" />
                Create Note
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Responsive Modals */}
      <AnimatePresence>
        {showNewNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => setShowNewNoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md shadow-enhanced animate-slide-up modal-responsive"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 responsive-text-lg">Create New Note</h3>
                <p className="text-xs sm:text-sm text-gray-600 responsive-text-base">Start writing your thoughts and ideas in a new note.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowNewNoteModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium focus-visible-ring touch-target"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewNote}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 focus-visible-ring touch-feedback"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  Create Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showNewFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => setShowNewFolderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md shadow-enhanced animate-slide-up modal-responsive"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Folder className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 responsive-text-lg">Create New Folder</h3>
                <p className="text-xs sm:text-sm text-gray-600 responsive-text-base">Organize your notes by creating a new folder.</p>
              </div>
              <input
                type="text"
                placeholder="Enter folder name..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-200 text-sm sm:text-base"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    createFolder(e.target.value.trim());
                  }
                }}
                autoFocus
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium focus-visible-ring touch-target"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter folder name..."]');
                    if (input && input.value.trim()) {
                      createFolder(input.value.trim());
                    }
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 focus-visible-ring touch-feedback"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesPage;
