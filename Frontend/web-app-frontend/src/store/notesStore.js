import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useNotesStore = create(
  persist(
    (set, get) => ({
      // State
      notes: [],
      folders: [
        { id: 'default', name: 'General Notes', parentId: null, expanded: true, color: '#f3f4f6' },
        { id: 'course-notes', name: 'Course Notes', parentId: null, expanded: true, color: '#e5e7eb' },
        { id: 'quick-notes', name: 'Quick Notes', parentId: null, expanded: false, color: '#fef3c7' }
      ],
      selectedNote: null,
      selectedFolder: null,
      searchTerm: '',
      selectedTags: [],
      sortBy: 'updatedAt',
      viewMode: 'list',
      
      // Actions
      addNote: (note) => {
        const newNote = {
          id: Date.now().toString(),
          title: note.title || 'Untitled Note',
          content: note.content || '',
          folderId: note.folderId || 'default',
          tags: note.tags || [],
          starred: false,
          color: note.color || '#ffffff',
          createdAt: new Date(),
          updatedAt: new Date(),
          reminder: null,
          isPublic: false,
          courseId: note.courseId || null,
          topicId: note.topicId || null,
          ...note
        };
        
        set((state) => ({
          notes: [newNote, ...state.notes]
        }));
        
        return newNote;
      },
      
      updateNote: (noteId, updates) => {
        set((state) => ({
          notes: state.notes.map(note =>
            note.id === noteId
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          )
        }));
      },
      
      deleteNote: (noteId) => {
        set((state) => ({
          notes: state.notes.filter(note => note.id !== noteId),
          selectedNote: state.selectedNote?.id === noteId ? null : state.selectedNote
        }));
      },
      
      toggleStar: (noteId) => {
        set((state) => ({
          notes: state.notes.map(note =>
            note.id === noteId ? { ...note, starred: !note.starred } : note
          )
        }));
      },
      
      addFolder: (folder) => {
        const newFolder = {
          id: Date.now().toString(),
          name: folder.name || 'New Folder',
          parentId: folder.parentId || null,
          expanded: true,
          color: folder.color || '#f3f4f6',
          ...folder
        };
        
        set((state) => ({
          folders: [...state.folders, newFolder]
        }));
        
        return newFolder;
      },
      
      updateFolder: (folderId, updates) => {
        set((state) => ({
          folders: state.folders.map(folder =>
            folder.id === folderId ? { ...folder, ...updates } : folder
          )
        }));
      },
      
      deleteFolder: (folderId) => {
        set((state) => ({
          folders: state.folders.filter(folder => folder.id !== folderId),
          notes: state.notes.map(note =>
            note.folderId === folderId ? { ...note, folderId: 'default' } : note
          )
        }));
      },
      
      toggleFolder: (folderId) => {
        set((state) => ({
          folders: state.folders.map(folder =>
            folder.id === folderId ? { ...folder, expanded: !folder.expanded } : folder
          )
        }));
      },
      
      setSelectedNote: (note) => {
        set({ selectedNote: note });
      },
      
      setSelectedFolder: (folderId) => {
        set({ selectedFolder: folderId });
      },
      
      setSearchTerm: (term) => {
        set({ searchTerm: term });
      },
      
      setSelectedTags: (tags) => {
        set({ selectedTags: tags });
      },
      
      setSortBy: (sortBy) => {
        set({ sortBy });
      },
      
      setViewMode: (mode) => {
        set({ viewMode: mode });
      },
      
      // Computed getters
      getFilteredNotes: () => {
        const state = get();
        return state.notes
          .filter(note => {
            const matchesSearch = state.searchTerm === '' ||
              note.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
              note.content.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
              note.tags.some(tag => tag.toLowerCase().includes(state.searchTerm.toLowerCase()));
            
            const matchesTags = state.selectedTags.length === 0 ||
              state.selectedTags.some(tag => note.tags.includes(tag));
            
            const matchesFolder = !state.selectedFolder || note.folderId === state.selectedFolder;
            
            return matchesSearch && matchesTags && matchesFolder;
          })
          .sort((a, b) => {
            switch (state.sortBy) {
              case 'title':
                return a.title.localeCompare(b.title);
              case 'createdAt':
                return new Date(b.createdAt) - new Date(a.createdAt);
              case 'starred':
                if (a.starred === b.starred) {
                  return new Date(b.updatedAt) - new Date(a.updatedAt);
                }
                return b.starred - a.starred;
              default:
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            }
          });
      },
      
      getAllTags: () => {
        const state = get();
        return [...new Set(state.notes.flatMap(note => note.tags))];
      },
      
      getNotesInFolder: (folderId) => {
        const state = get();
        return state.notes.filter(note => note.folderId === folderId);
      },
      
      getFolderHierarchy: () => {
        const state = get();
        const buildHierarchy = (parentId = null) => {
          return state.folders
            .filter(folder => folder.parentId === parentId)
            .map(folder => ({
              ...folder,
              children: buildHierarchy(folder.id),
              noteCount: state.notes.filter(note => note.folderId === folder.id).length
            }));
        };
        return buildHierarchy();
      },
      
      // Search and filter helpers
      searchNotes: (query) => {
        const state = get();
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        
        return state.notes.filter(note => {
          const searchText = `${note.title} ${note.content} ${note.tags.join(' ')}`.toLowerCase();
          return searchTerms.every(term => searchText.includes(term));
        });
      },
      
      getRecentNotes: (count = 5) => {
        const state = get();
        return [...state.notes]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, count);
      },
      
      getStarredNotes: () => {
        const state = get();
        return state.notes.filter(note => note.starred);
      },
      
      // Import/Export functionality
      exportNotes: () => {
        const state = get();
        return {
          notes: state.notes,
          folders: state.folders,
          exportDate: new Date().toISOString(),
          version: '1.0'
        };
      },
      
      importNotes: (data) => {
        if (data.notes && Array.isArray(data.notes)) {
          set((state) => ({
            notes: [...state.notes, ...data.notes.map(note => ({
              ...note,
              id: `imported-${Date.now()}-${note.id}`,
              createdAt: new Date(note.createdAt),
              updatedAt: new Date(note.updatedAt)
            }))]
          }));
        }
        
        if (data.folders && Array.isArray(data.folders)) {
          set((state) => ({
            folders: [...state.folders, ...data.folders.map(folder => ({
              ...folder,
              id: `imported-${Date.now()}-${folder.id}`
            }))]
          }));
        }
      },
      
      // Reminder functionality
      setReminder: (noteId, reminderDate) => {
        set((state) => ({
          notes: state.notes.map(note =>
            note.id === noteId ? { ...note, reminder: reminderDate } : note
          )
        }));
      },
      
      getNotesWithReminders: () => {
        const state = get();
        return state.notes.filter(note => note.reminder && new Date(note.reminder) > new Date());
      },
      
      // Statistics
      getStats: () => {
        const state = get();
        const totalNotes = state.notes.length;
        const totalWords = state.notes.reduce((acc, note) => acc + note.content.split(' ').length, 0);
        const starredNotes = state.notes.filter(note => note.starred).length;
        const foldersCount = state.folders.length;
        const tagsCount = state.getAllTags().length;
        
        return {
          totalNotes,
          totalWords,
          starredNotes,
          foldersCount,
          tagsCount,
          averageWordsPerNote: totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0
        };
      }
    }),
    {
      name: 'notes-storage',
      partialize: (state) => ({
        notes: state.notes,
        folders: state.folders,
        selectedFolder: state.selectedFolder,
        sortBy: state.sortBy,
        viewMode: state.viewMode
      })
    }
  )
);

export default useNotesStore;
