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
import './notes.css';
import useCourseStore from '../../store/courseStore';

// Note data structure example
const initialNotes = [
  {
    id: '1',
    title: 'Database Fundamentals',
    content: 'A database is a structured collection of data that is organized for efficient storage, retrieval, and management. Databases are fundamental to modern computing and are used in virtually every application that requires data persistence.\n\n## Key Concepts\n\n- **Tables**: Store data in rows and columns\n- **Primary Keys**: Unique identifiers for table rows\n- **Foreign Keys**: References to primary keys in other tables\n- **ACID Properties**: Atomicity, Consistency, Isolation, Durability\n\n### Mathematical Foundations\n\nThe relational model is based on set theory. A relation $R$ is a subset of the Cartesian product:\n\n$$R \\subseteq D_1 \\times D_2 \\times ... \\times D_n$$\n\nWhere $D_i$ represents the domain of the $i$-th attribute.',
    folderId: 'intro',
    tags: ['database', 'fundamentals', 'theory'],
    starred: true,
    color: '#fef3c7',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    reminder: null,
    isPublic: false
  },
  {
    id: '2',
    title: 'SQL Query Fundamentals',
    content: '# SQL Query Fundamentals\n\nSQL (Structured Query Language) is the standard language for relational database management systems.\n\n## Basic SELECT Statements\n\n```sql\nSELECT column1, column2\nFROM table_name\nWHERE condition;\n```\n\n### Common Operations\n\n- **SELECT**: Retrieve data from tables\n- **INSERT**: Add new records\n- **UPDATE**: Modify existing records\n- **DELETE**: Remove records\n\n### Joins\n\nJoins combine data from multiple tables:\n\n- **INNER JOIN**: Returns matching records\n- **LEFT JOIN**: Returns all records from left table\n- **RIGHT JOIN**: Returns all records from right table\n- **FULL OUTER JOIN**: Returns all records when there is a match\n\n> **Note**: Always use proper indexing for optimal query performance.',
    folderId: 'sql',
    tags: ['sql', 'queries', 'joins'],
    starred: false,
    color: '#dbeafe',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    reminder: new Date('2024-01-20'),
    isPublic: true
  },
  {
    id: '3',
    title: 'Database Normalization',
    content: '# Database Normalization\n\nNormalization is the process of organizing data in a database to reduce redundancy and improve data integrity.\n\n## Normal Forms\n\n### First Normal Form (1NF)\n- Eliminate duplicate columns\n- Create separate tables for related data\n- Identify unique columns (primary key)\n\n### Second Normal Form (2NF)\n- Must be in 1NF\n- Remove subsets of data that apply to multiple rows\n- Create separate tables for values that apply to multiple records\n\n### Third Normal Form (3NF)\n- Must be in 2NF\n- Remove columns not dependent on primary key\n\n### Mathematical Definition\n\nA relation $R$ is in 3NF if for every functional dependency $X \\rightarrow A$ in $R$, either:\n\n$$X \\text{ is a superkey of } R \\text{ or } A \\text{ is a prime attribute}$$\n\n**Benefits of Normalization:**\n- Reduced data redundancy\n- Improved data consistency\n- Easier maintenance\n- Better storage efficiency',
    folderId: 'advanced',
    tags: ['normalization', 'database-design', 'theory'],
    starred: true,
    color: '#dcfce7',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    reminder: null,
    isPublic: false
  }
];

const initialFolders = [
  { id: 'intro', name: 'Introduction to Databases', parentId: null, expanded: true, color: '#f3f4f6' },
  { id: 'sql', name: 'SQL Fundamentals', parentId: null, expanded: false, color: '#e5e7eb' },
  { id: 'advanced', name: 'Advanced Topics', parentId: null, expanded: false, color: '#f9fafb' },
  { id: 'exercises', name: 'Practice Exercises', parentId: null, expanded: false, color: '#fef3c7' }
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
            className={`flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer ${
              selectedFolder === folder.id ? 'bg-blue-100' : ''
            }`}
            onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }}
              className="mr-1"
            >
              {folder.expanded ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </button>
            {folder.expanded ? 
              <FolderOpen className="h-4 w-4 mr-2 text-yellow-600" /> :
              <Folder className="h-4 w-4 mr-2 text-yellow-600" />
            }
            <span className="text-sm font-medium">{folder.name}</span>
            <span className="ml-auto text-xs text-gray-500">
              {notes.filter(note => note.folderId === folder.id).length}
            </span>
          </div>
          {folder.expanded && renderFolderTree(folder.id, level + 1)}
        </div>
      ));
  };

  const renderMarkdown = (content) => {
    // Simple markdown rendering with LaTeX support
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/==(.*?)==/g, '<mark>$1</mark>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^1\. (.*$)/gim, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
    
    return (
      <div className="prose max-w-none">
        <Latex>{html}</Latex>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold">Notes</h1>
                <p className="text-sm text-gray-500">
                  {currentCourse?.title || 'All Courses'}
                </p>
              </div>
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          
          {!sidebarCollapsed && (
            <div className="mt-4 space-y-2">
              <button 
                onClick={() => setShowNewNoteModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Note
              </button>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowNewFolderModal(true)}
                  className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <Folder className="h-4 w-4" />
                  New Folder
                </button>
                
                <button 
                  onClick={() => setShowTagFilter(!showTagFilter)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <>
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Filters */}
              <AnimatePresence>
                {showTagFilter && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Tags</span>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="updatedAt">Last Modified</option>
                        <option value="createdAt">Date Created</option>
                        <option value="title">Title</option>
                        <option value="starred">Starred</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-1">
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
                          className={`px-2 py-1 text-xs rounded ${
                            selectedTags.includes(tag) 
                              ? 'bg-blue-500 text-white' 
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
            </div>

            {/* Folders */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Folders</h3>
                  <button 
                    onClick={() => setSelectedFolder(null)}
                    className={`text-xs px-2 py-1 rounded ${
                      !selectedFolder ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                </div>
                {renderFolderTree()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Notes List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              {selectedFolder ? folders.find(f => f.id === selectedFolder)?.name : 'All Notes'}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Grid className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-500">{filteredNotes.length}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-2">No notes found</p>
              <p className="text-sm">Create your first note to get started</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'p-4 grid grid-cols-2 gap-3' : 'space-y-1'}>
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setEditTitle(note.title);
                    setEditContent(note.content);
                    setCurrentColor(note.color);
                    setIsEditing(false);
                  }}
                  className={`${viewMode === 'grid' ? 'p-3 rounded-lg aspect-square' : 'p-4'} cursor-pointer border-l-4 hover:bg-gray-50 transition-colors ${
                    selectedNote?.id === note.id ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'
                  }`}
                  style={{ backgroundColor: viewMode === 'grid' ? note.color : 'transparent' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{note.title}</h3>
                        {note.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        {note.reminder && <Bell className="h-3 w-3 text-orange-500" />}
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {note.content.substring(0, 100)}...
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {note.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="text-xs text-gray-400">+{note.tags.length - 2}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(note.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Star className={`h-3 w-3 ${note.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-400 mt-1">
                        {note.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-xl font-bold bg-transparent border-none outline-none"
                      placeholder="Note title..."
                    />
                  ) : (
                    <h1 className="text-xl font-bold">{selectedNote.title}</h1>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {selectedNote.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    {selectedNote.reminder && <Bell className="h-4 w-4 text-orange-500" />}
                    {selectedNote.isPublic && <Share className="h-4 w-4 text-green-500" />}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Color Picker */}
                  <div className="flex items-center gap-1">
                    {colorPalette.map(color => (
                      <button
                        key={color}
                        onClick={() => setCurrentColor(color)}
                        className={`w-6 h-6 rounded border-2 ${
                          currentColor === color ? 'border-gray-400' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')}
                          className="flex items-center gap-1 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
                        >
                          {editorMode === 'edit' ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                          {editorMode === 'edit' ? 'Preview' : 'Edit'}
                        </button>
                        <button
                          onClick={saveNote}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              {isEditing && editorMode === 'edit' && (
                <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg">
                  {toolbarItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.action}
                      className="p-2 hover:bg-gray-200 rounded"
                      title={item.tooltip}
                    >
                      <item.icon className="h-4 w-4" />
                    </button>
                  ))}
                  <div className="w-px h-6 bg-gray-300 mx-2" />
                  <button
                    onClick={() => insertText('$$', '$$')}
                    className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    title="LaTeX Block"
                  >
                    LaTeX
                  </button>
                </div>
              )}
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-4" style={{ backgroundColor: currentColor }}>
              {isEditing ? (
                editorMode === 'edit' ? (
                  <textarea
                    ref={editorRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full resize-none border-none outline-none bg-transparent font-mono text-sm"
                    placeholder="Start writing your note... Use $...$ for inline LaTeX or $$...$$ for display LaTeX."
                  />
                ) : (
                  <div className="h-full overflow-y-auto">
                    {renderMarkdown(editContent)}
                  </div>
                )
              ) : (
                <div className="h-full overflow-y-auto">
                  {renderMarkdown(selectedNote.content)}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Created: {selectedNote.createdAt.toLocaleDateString()}</span>
                  <span>Modified: {selectedNote.updatedAt.toLocaleDateString()}</span>
                  <span>Words: {selectedNote.content.split(' ').length}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedNote.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select a note to start</h3>
              <p className="text-sm">Choose a note from the sidebar or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showNewNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowNewNoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Create New Note</h3>
              <button
                onClick={createNewNote}
                className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Note
              </button>
            </motion.div>
          </motion.div>
        )}

        {showNewFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowNewFolderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
              <input
                type="text"
                placeholder="Folder name..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    createFolder(e.target.value.trim());
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Folder name..."]');
                    if (input.value.trim()) {
                      createFolder(input.value.trim());
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
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