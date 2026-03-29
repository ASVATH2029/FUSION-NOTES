import React, { useState, useEffect, useCallback } from 'react';
import type { Note } from './types/note';
import { ThemeProvider } from './context/ThemeContext';
import AnimatedBackground from './components/AnimatedBackground';
import TopBar from './components/layout/TopBar';
import MobileSidebar from './components/layout/MobileSidebar';
import PageLayout from './components/layout/PageLayout';
import { DashboardSide, FlashcardSide, ChatSide, NotesSide } from './components/layout/SidePanels';
import type { Collaborator } from './components/layout/SidePanels';
import DashboardPage from './pages/DashboardPage';
import NotesPage from './pages/NotesPage';
import FlashcardsPage from './pages/FlashcardsPage';
import ChatPage from './pages/ChatPage';
import SearchResultsView from './pages/SearchResultsView';
import { AuthPage } from './pages/AuthPage';
import styles from './App.module.css';

type Tab = 'dashboard' | 'notes' | 'flashcard' | 'chat';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string; username?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [noteFilter, setNoteFilter] = useState('All Subjects');
  
  // Collaborators State
  const [collabs, setCollabs] = useState<Collaborator[]>([]);
  const [collabLoading, setCollabLoading] = useState(true);

  // Mobile UI State
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchCollabs = useCallback(async () => {
    try {
      const res = await fetch('/api/collaborators');
      if (res.ok) {
        const data = await res.json();
        setCollabs(data);
      }
    } catch (e) {
      console.error('Error fetching collabs', e);
    } finally {
      setCollabLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Lifted Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const headers: Record<string, string> = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
      const res = await fetch(`/api/notes`, { headers });
      if (res.ok) {
        const rawData = await res.json();
        const mappedNotes: Note[] = rawData.map((dbNote: any) => ({
          id: dbNote.id,
          title: dbNote.group_id.charAt(0).toUpperCase() + dbNote.group_id.slice(1) + ' Notes',
          excerpt: dbNote.extracted_text.substring(0, 150) + '...',
          fullText: dbNote.extracted_text,
          tags: [dbNote.group_id.charAt(0).toUpperCase() + dbNote.group_id.slice(1)],
          date: dbNote.created_at,
          author: dbNote.user_id,
          authorInitial: dbNote.user_id.charAt(0).toUpperCase(),
          color: '#4ade80'
        }));
        setNotes(mappedNotes);
      }
    } catch (e) {
      console.error('Error fetching notes', e);
    }
  }, [jwtToken]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes();
      fetchCollabs();
      const id = setInterval(fetchCollabs, 30_000);
      return () => clearInterval(id);
    }
  }, [isAuthenticated, fetchNotes, fetchCollabs]);

  const handleUpload = async (files: File[], subject: string = 'General') => {
    if (!files.length) return;
    if (!jwtToken) {
      setStatusMsg({ type: 'error', text: 'Sign in with a real account to upload.' });
      return;
    }
    setIsUploading(true);
    setStatusMsg({ type: 'info', text: `Uploading to ${subject}...` });
    try {
      const headers: HeadersInit = { 'Authorization': `Bearer ${jwtToken}` };
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('group_id', subject.toLowerCase());
        await fetch('/api/upload', { method: 'POST', headers, body: formData });
      }
      await fetchNotes();
      await fetchCollabs(); // Refresh collabs to show activity
      setStatusMsg({ type: 'success', text: `✓ ${files.length} note(s) uploaded!` });
    } catch (e) {
      setStatusMsg({ type: 'error', text: 'Upload failed.' });
    } finally {
      setIsUploading(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const handleSearch = (q: string) => setSearchQuery(q);
  const handleBackFromSearch = () => setSearchQuery(null);
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as Tab);
    setSearchQuery(null);
  };

  const navigateToNotesWithFilter = (tag: string) => {
    setNoteFilter(tag);
    setActiveTab('notes');
    setSearchQuery(null);
  };

  const handleLogout = () => {
    setJwtToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('dashboard');
  };

  const mainContent = searchQuery ? (
    <SearchResultsView query={searchQuery} onBack={handleBackFromSearch} />
  ) : activeTab === 'dashboard' ? (
    <DashboardPage 
      onNavigate={handleTabChange} 
      onTagClick={navigateToNotesWithFilter} 
      notes={notes}
      onUpload={handleUpload}
      isUploading={isUploading}
      onSelectNote={(id: string) => { setSelectedNoteId(id); setActiveTab('notes'); }}
      user={user}
      isMobile={isMobile}
      onSearch={handleSearch}
      activeTab={activeTab}
      onLogout={handleLogout}
      collabsCount={collabs.length}
    />
  ) : activeTab === 'notes' ? (
    <NotesPage 
      noteFilter={noteFilter} 
      setNoteFilter={setNoteFilter} 
      token={jwtToken} 
      notes={notes}
      onUpload={handleUpload}
      isUploading={isUploading}
      statusMsg={statusMsg}
      setStatusMsg={setStatusMsg}
      selectedNoteId={selectedNoteId}
      setSelectedNoteId={setSelectedNoteId}
      fetchNotes={fetchNotes}
    />
  ) : activeTab === 'flashcard' ? (
    <FlashcardsPage token={jwtToken} notes={notes} />
  ) : (
    <ChatPage 
      collabs={collabs} 
      collabLoading={collabLoading}
      user={user}
    />
  );

  const sideContent = searchQuery ? null
    : activeTab === 'dashboard' ? <DashboardSide collabs={collabs} loading={collabLoading} />
    : activeTab === 'notes' ? <NotesSide collabs={collabs} loading={collabLoading} />
    : activeTab === 'flashcard' ? <FlashcardSide />
    : <ChatSide collabs={collabs} loading={collabLoading} />;

  return (
    <ThemeProvider>
      {!isAuthenticated ? (
        <AuthPage onLogin={(token, userData) => { 
          setJwtToken(token); 
          setUser(userData);
          setIsAuthenticated(true); 
        }} />
      ) : (
        <div className={styles.appShell}>
          <AnimatedBackground />
          <MobileSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            user={user} 
            onLogout={handleLogout} 
          />
          <TopBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onSearch={handleSearch}
            user={user}
            onLogout={handleLogout}
            isMobile={isMobile}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          <PageLayout
            main={
              <div key={searchQuery ? 'search' : activeTab} className="animate-hypr" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                <div className={styles.mainInner}>{mainContent}</div>
              </div>
            }
            side={
              <div key={activeTab} className="animate-hypr" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                <div className={styles.sideInner}>{sideContent}</div>
              </div>
            }
          />
        </div>
      )}
    </ThemeProvider>
  );
};

export default App;
