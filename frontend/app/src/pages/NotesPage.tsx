import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Note } from '../types/note';
import NoteCard from '../components/ui/NoteCard';
import UploadDropzone from '../components/ui/UploadDropzone';
import styles from './NotesPage.module.css';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { MermaidChart } from '../components/ui/MermaidChart';

const StudyGuideRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Scrub potential markdown code block wrappers if Gemini included them
  const scrubbedContent = content
    .replace(/^```markdown\n/, '')
    .replace(/^```\n/, '')
    .replace(/\n```$/, '');

  return (
    <div className={styles.markdownBody}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match && match[1] === 'mermaid') {
              return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
            }
            return (
              <code className={className} style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '3px 8px', borderRadius: '6px', fontSize: '13px', color: '#8b5cf6', fontFamily: 'monospace' }} {...props}>
                {children}
              </code>
            );
          },
          h1: ({node, ...props}) => <h1 style={{ marginTop: '0', marginBottom: '20px', color: 'var(--text-primary)', fontSize: '26px', fontWeight: 800, borderBottom: '2px solid #8b5cf6', paddingBottom: '10px', lineHeight: '1.2' }} {...props} />,
          h2: ({node, ...props}) => <h2 style={{ marginTop: '32px', marginBottom: '16px', color: 'var(--text-primary)', fontSize: '21px', fontWeight: 700, borderLeft: '4px solid #a78bfa', paddingLeft: '12px' }} {...props} />,
          h3: ({node, ...props}) => <h3 style={{ marginTop: '24px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '18px', fontWeight: 600 }} {...props} />,
          p: ({node, ...props}) => <p style={{ marginBottom: '16px', lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '15.5px' }} {...props} />,
          ul: ({node, ...props}) => <ul style={{ paddingLeft: '24px', marginBottom: '16px', color: 'var(--text-secondary)', listStyleType: 'disc' }} {...props} />,
          li: ({node, ...props}) => <li style={{ marginBottom: '8px' }} {...props} />,
          blockquote: ({node, ...props}) => <blockquote style={{ borderLeft: '4px solid #8b5cf6', paddingLeft: '16px', fontStyle: 'italic', margin: '20px 0', color: 'var(--text-muted)' }} {...props} />
        }}
      >
        {scrubbedContent}
      </ReactMarkdown>
    </div>
  );
};

const SUBJECTS = ['Physics', 'Biology', 'Math', 'History'];

type SortMode = 'newest' | 'oldest' | 'az' | 'za';

interface NotesPageProps {
  noteFilter: string;
  setNoteFilter: (tag: string) => void;
  token?: string | null;
  notes: Note[];
  onUpload: (files: File[], subject: string) => void;
  isUploading: boolean;
  statusMsg: { type: 'info' | 'error' | 'success'; text: string } | null;
  setStatusMsg: (msg: { type: 'info' | 'error' | 'success'; text: string } | null) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  fetchNotes: () => void;
}

const NotesPage: React.FC<NotesPageProps> = ({ 
  noteFilter, setNoteFilter, token, notes, onUpload, isUploading, 
  statusMsg, setStatusMsg, selectedNoteId, setSelectedNoteId, fetchNotes 
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const [masterNote, setMasterNote] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isViewingMaster, setIsViewingMaster] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const activeSubject = noteFilter === 'All Subjects' ? null : noteFilter;

  const fetchData = useCallback(async () => {
    try {
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

      if (activeSubject) {
        const masterRes = await fetch(`/api/synthesized/${activeSubject.toLowerCase()}`, { headers });
        if (masterRes.ok) {
          setMasterNote((await masterRes.json()).master_text);
        } else {
          setMasterNote(null);
        }
      } else {
        setMasterNote(null);
      }
    } catch (e) {
      console.error('Error fetching notes', e);
    }
  }, [noteFilter, token, activeSubject]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  useEffect(() => {
    if (selectedNoteId) {
      const found = notes.find(n => n.id === selectedNoteId);
      if (found) {
        setSelectedNote(found);
        if (found.tags[0]) setNoteFilter(found.tags[0]);
      }
    }
  }, [selectedNoteId, notes, setSelectedNote, setNoteFilter]);

  const handleUpload = (files: File[]) => {
    if (activeSubject) onUpload(files, activeSubject);
  };

  const handleSynthesize = async () => {
    if (!activeSubject) return;
    if (!token) {
      setStatusMsg({ type: 'error', text: 'You must be signed in to synthesize notes.' });
      return;
    }
    setIsSynthesizing(true);
    setStatusMsg({ type: 'info', text: `Gemini is synthesizing all ${activeSubject} notes into a master guide…` });
    const formData = new FormData();
    formData.append('group_id', activeSubject.toLowerCase());
    const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
    try {
      const res = await fetch('/api/synthesize', { method: 'POST', headers, body: formData });
      if (res.ok) {
        await fetchNotes();
        await fetchData();
        setStatusMsg({ type: 'success', text: `✓ ${activeSubject} master guide synthesized!` });
        setIsViewingMaster(true); // Automatically open the "form" (detailed view)
      } else {
        const errData = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        setStatusMsg({ type: 'error', text: `Synthesize failed: ${errData.detail}` });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatusMsg({ type: 'error', text: `Network error: ${msg}` });
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Sort & filter
  const sortedFiltered = notes
    .filter(n => !activeSubject || n.tags.includes(activeSubject))
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.excerpt.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortMode === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortMode === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortMode === 'az') return a.title.localeCompare(b.title);
      if (sortMode === 'za') return b.title.localeCompare(a.title);
      return 0;
    });

  // ---- Master Full View ----
  if (isViewingMaster && masterNote) {
    return (
      <div className={styles.page}>
        <button onClick={() => setIsViewingMaster(false)} className={styles.backBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to {activeSubject} Notes
        </button>
        <div className={styles.detailCard}>
          <div className={styles.detailCardHeader}>
            <h2 className={styles.detailTitle}>★ Master {activeSubject} Study Guide</h2>
            <div className={styles.masterBadge}>{t('notes.aiSynthesized')}</div>
          </div>
          <div className={styles.detailMeta}>
             <span className={styles.detailDate}>Generated with Gemini 1.5 Pro</span>
          </div>
          <div className={styles.detailBody}>
            <StudyGuideRenderer content={masterNote} />
          </div>
        </div>
      </div>
    );
  }

  // ---- Detail view ----
  if (selectedNote) {
    return (
      <div className={styles.page}>
        <button onClick={() => { setSelectedNote(null); setSelectedNoteId(null); }} className={styles.backBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {t('notes.backToNotes')}
        </button>
        <div className={styles.detailCard}>
          <h2 className={styles.detailTitle}>{selectedNote.title}</h2>
          <div className={styles.detailMeta}>
            {selectedNote.tags.map((tag: string) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
            <span className={styles.detailDate}>
              {t('notes.extractedViaOCR')} · {new Date(selectedNote.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className={styles.detailBody}>
            <StudyGuideRenderer content={selectedNote.fullText || ''} />
          </div>
        </div>
      </div>
    );
  }

  // ---- Main view ----
  return (
    <div className={styles.page}>

      {/* ── Status Banner ── */}
      {statusMsg && (
        <div className={`${styles.statusBanner} ${styles[statusMsg.type]}`}>
          {statusMsg.type === 'info' && <span className={styles.spinner} style={{ width: 14, height: 14, borderWidth: 2 }} />}
          {statusMsg.text}
        </div>
      )}

      {/* ── Top toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder={t('notes.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="notes-search"
          />
        </div>

        {/* Sort control */}
        <div className={styles.sortWrap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/></svg>
          <select
            className={styles.sortSelect}
            value={sortMode}
            onChange={e => setSortMode(e.target.value as SortMode)}
            title="Sort notes"
          >
            <option value="newest">{t('notes.newestFirst')}</option>
            <option value="oldest">{t('notes.oldestFirst')}</option>
            <option value="az">{t('notes.aToZ')}</option>
            <option value="za">{t('notes.zToA')}</option>
          </select>
        </div>
      </div>

      {/* ── Subject tabs ── */}
      <div className={styles.subjectRow}>
        <button
          className={`${styles.subjectChip} ${!activeSubject ? styles.subjectChipActive : ''}`}
          onClick={() => setNoteFilter('All Subjects')}
        >All</button>
        {SUBJECTS.map(s => (
          <button
            key={s}
            className={`${styles.subjectChip} ${activeSubject === s ? styles.subjectChipActive : ''}`}
            onClick={() => setNoteFilter(s)}
            id={`subject-${s.toLowerCase()}`}
          >
            {s}
            {activeSubject === s && (
              <span className={styles.subjectBadge}>
                {notes.filter(n => n.tags.includes(s)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Subject context bar (Always visible to avoid confusion) ── */}
      <div className={styles.subjectContextBar}>
        {activeSubject ? (
          <>
            <div className={styles.subjectContextLeft}>
              <span className={styles.subjectContextTitle}>{activeSubject}</span>
              <span className={styles.subjectContextCount}>
                {sortedFiltered.length} note{sortedFiltered.length !== 1 ? 's' : ''}
                {masterNote ? ' · synthesized ✧' : ''}
              </span>
            </div>
            <div className={styles.subjectContextActions}>
              <label className={styles.uploadBtn} title={`Upload to ${activeSubject}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {isUploading ? t('notes.uploading') : `${t('notes.uploadTo')} ${activeSubject}`}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => e.target.files && handleUpload(Array.from(e.target.files))}
                  disabled={isUploading}
                />
              </label>
              <button
                className={styles.synthesizeBtn}
                onClick={handleSynthesize}
                disabled={isSynthesizing || sortedFiltered.length === 0}
                title="Synthesize all notes in this subject into a master guide"
              >
                {isSynthesizing
                  ? <><span className={styles.spinner}/> {t('notes.synthesizing')}</>
                  : <>✧ {t('notes.synthesizeGuide')}</>}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.subjectContextEmpty}>
            <span className={styles.emptyPrompt}>✧ Select a subject above to upload notes and synthesize your master guide</span>
          </div>
        )}
      </div>

      {/* ── Pinned synthesized note (starred at top) ── */}
      {masterNote && activeSubject && (
        <div className={styles.masterCardCompact} onClick={() => setIsViewingMaster(true)}>
          <div className={styles.masterCardCompactContent}>
            <span className={styles.masterStar}>★</span>
            <div className={styles.masterCardCompactText}>
              <span className={styles.masterCardCompactTitle}>Master {activeSubject} Study Guide</span>
              <span className={styles.masterCardCompactSub}>Click to view the full synthesized guide</span>
            </div>
          </div>
          <button className={styles.viewGuideBtn}>
            View Guide
          </button>
        </div>
      )}


      {/* ── Notes grid ── */}
      {sortedFiltered.length > 0 ? (
        <div className={styles.grid}>
          {sortedFiltered.map(note => (
            <div key={note.id} onClick={() => setSelectedNote(note)}>
              <NoteCard note={note} onTagClick={setNoteFilter} />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          {activeSubject ? (
            <div className={styles.emptySubject}>
              <div className={styles.emptyIcon}>📂</div>
              <p className={styles.emptyText}>{t('notes.noNotesIn')} <strong>{activeSubject}</strong> {t('notes.yet')}</p>
              <p className={styles.emptyHint}>{t('notes.uploadHint')}</p>
            </div>
          ) : (
            <UploadDropzone onUpload={handleUpload} />
          )}
          {isUploading && <p className={styles.uploadingText}>{t('notes.uploadingOCR')}</p>}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
