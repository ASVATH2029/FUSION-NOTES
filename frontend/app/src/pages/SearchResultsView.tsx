import React, { useState } from 'react';
import styles from './SearchResultsView.module.css';

interface SearchResultsViewProps {
  query: string;
  onBack: () => void;
}

const SOURCES: any[] = [];

const SNIPPETS: string[] = [];

const TABS = ['Summary', 'Detailed', 'Flashcards'];

const SearchResultsView: React.FC<SearchResultsViewProps> = ({ query, onBack }) => {
  const [tab, setTab] = useState('Summary');

  return (
    <div className={styles.page}>
      {/* Back + Query */}
      <div className={styles.topRow}>
        <button className="btn-ghost" onClick={onBack} id="search-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <div className={styles.queryBadge}>"{query}"</div>
      </div>

      {/* Answer Card */}
      <div className={styles.answerCard}>
        {/* Title + confidence */}
        <div className={styles.answerHeader}>
          <h2 className={`${styles.answerTitle} text-heading`}>Answer: {query}</h2>
          <div className={styles.confidenceRow}>
            <span className={styles.dot} />
            <span className={styles.confLabel}>Confidence: <strong>High (88%)</strong></span>
            <div className={styles.confBar}><div className={styles.confFill} style={{ width: '88%' }} /></div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
              id={`tab-${t.toLowerCase()}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className={styles.answerBody}>
          {SOURCES.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No AI-powered summary available for this query yet. Try uploading more notes!
            </div>
          ) : (
            <>
              {tab === 'Summary' && (
                <>
                  <h3 className={styles.answerSubTitle}>{query}</h3>
                  <p className={styles.answerText}>
                    AI Summary goes here when real data is available...
                  </p>
                </>
              )}
              {tab === 'Detailed' && (
                <p className={styles.answerText}>
                  Detailed AI content goes here...
                </p>
              )}
              {tab === 'Flashcards' && (
                <div className={styles.fcList}>
                  <div style={{ color: 'var(--text-muted)' }}>No flashcards generated for this query.</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Snippets */}
        {SNIPPETS.length > 0 && (
          <>
            <div className={styles.snippetsLabel}>Context Used for Answer:</div>
            <div className={styles.snippets}>
              {SNIPPETS.map((s, i) => (
                <div key={i} className={styles.snippet}>{s}</div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className="btn-accent" id="gen-flashcards-btn" disabled={SOURCES.length === 0}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/></svg>
          Generate Flashcards
        </button>
        <button className="btn-ghost" id="ask-followup-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Ask Follow-Up
        </button>
      </div>

      {/* Sources side note */}
      <div className={styles.sources}>
        <div className={styles.sourcesTitle}>Sources from Your Notes</div>
        {SOURCES.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No matching notes found.</div>
        ) : (
          SOURCES.map(s => (
            <div key={s.id} className={styles.sourceCard} id={`source-${s.id}`}>
              <div className={styles.sourceAvatar}>{s.initial}</div>
              <div className={styles.sourceInfo}>
                <div className={styles.sourceTitle}>{s.title}</div>
                <div className={styles.sourceAuthor}>— {s.author}</div>
              </div>
              <button className="btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }}>View</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchResultsView;
