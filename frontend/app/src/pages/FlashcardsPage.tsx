import React, { useState } from 'react';
import FlipCard from '../components/ui/FlipCard';
import UploadDropzone from '../components/ui/UploadDropzone';
import { Trash2 } from 'lucide-react';
import styles from './FlashcardsPage.module.css';
import { API_BASE_URL } from '../config';

import type { Note } from '../types/note';

interface Deck {
  id: string;
  title: string;
  count: number;
  due: number;
  color: string;
}

interface Card {
  id: string;
  question: string;
  answer: string;
}

const DECKS: Deck[] = [];

interface FlashcardsPageProps {
  token: string | null;
  notes: Note[];
}

const FlashcardsPage: React.FC<FlashcardsPageProps> = ({ token, notes }) => {
  const [decks, setDecks] = useState<Deck[]>(DECKS);
  const [activeCards, setActiveCards] = useState<Card[]>([]);
  const [deckCardsMap, setDeckCardsMap] = useState<Record<string, Card[]>>({});
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Get unique subjects from notes
  const subjects = Array.from(new Set(notes.flatMap(n => n.tags)));

  const handleCreateDeck = async () => {
    if (subjects.length === 0) {
      alert("No notes found! Upload some notes first to generate flashcards.");
      return;
    }

    // For now, we take the first subject or 'General'
    const subject = subjects[0] || 'General';
    const groupId = subject.toLowerCase();

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('group_id', groupId);

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/flashcards/generate`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const generatedCards: Card[] = data.cards.map((c: any, i: number) => ({
          id: `ai-c-${Date.now()}-${i}`,
          question: c.question,
          answer: c.answer
        }));

        const dId = `d_ai_${Date.now()}`;
        const newDeck: Deck = {
          id: dId,
          title: `${subject} AI Deck`,
          count: generatedCards.length,
          due: generatedCards.length,
          color: '#a78bfa'
        };

        setDeckCardsMap(prev => ({ ...prev, [dId]: generatedCards }));
        setDecks([newDeck, ...decks]);
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || 'Failed to generate cards'}`);
      }
    } catch (e) {
      console.error('Flashcard error:', e);
      alert("Failed to generate flashcards. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDirectDeckUpload = async (_files: File[]) => {
    // This is still a fallback but we could also pipe this to the backend
    setIsUploading(true);
    // ... (rest of the direct upload logic remains similar or we could upgrade it later)
    setIsUploading(false);
  };

  const handleDeleteDeck = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDecks(decks.filter(d => d.id !== id));
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!selectedDeck) return;
    const handleKey = (e: KeyboardEvent) => {
      // Space to flip
      if (e.code === 'Space') {
        e.preventDefault();
        const flipEl = document.getElementById(`flipcard-${activeCards[cardIdx % activeCards.length]?.id}`);
        if (flipEl) flipEl.click();
      }
      // Left/Right to navigate
      else if (e.key === 'ArrowRight') {
        if (cardIdx < activeCards.length - 1) setCardIdx(i => i + 1);
      }
      else if (e.key === 'ArrowLeft') {
        if (cardIdx > 0) setCardIdx(i => i - 1);
      }
      // 1, 2, 3 for ratings
      else if (e.key === '1') {
        document.getElementById('rate-hard')?.click();
      } else if (e.key === '2') {
        document.getElementById('rate-ok')?.click();
      } else if (e.key === '3') {
        document.getElementById('rate-easy')?.click();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedDeck, cardIdx, activeCards]);

  if (!selectedDeck) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h2 className="text-heading" style={{ fontSize: 18 }}>Your Decks</h2>
          <button className="btn-accent" id="create-deck-btn" onClick={handleCreateDeck} disabled={isUploading}>
            {isUploading ? 'Extracting...' : 'Create Deck'}
          </button>
        </div>
        
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          {isUploading && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(0,0,0,0.5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>Synthesizing Deck with Gemini Core...</span>
            </div>
          )}
          <UploadDropzone onUpload={handleDirectDeckUpload} />
        </div>

        {decks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p>You have no decks yet. Extract one from your notes!</p>
          </div>
        )}
        <div className={styles.decksGrid}>
          {decks.map(deck => (
            <div
              key={deck.id}
              className={styles.deckCard}
              onClick={() => { 
                setSelectedDeck(deck.id); 
                setActiveCards(deckCardsMap[deck.id] || []);
                setCardIdx(0); 
              }}
              id={`deck-${deck.id}`}
              style={{ borderTopColor: deck.color }}
            >
              <div 
                className={styles.deleteDeckBtn} 
                onClick={(e) => handleDeleteDeck(e, deck.id)}
                title="Delete Deck"
              >
                <Trash2 size={16} />
              </div>
              <span className={styles.deckTitle}>{deck.title}</span>
              <div className={styles.deckMeta}>
                <span className={styles.deckCount}>{deck.count} cards</span>
                <span className={styles.deckDue} style={{ background: deck.color + '30', color: deck.color }}>
                  {deck.due} due
                </span>
              </div>
              <div className={styles.deckProgress}>
                <div className={styles.progressBar} style={{ width: `${((deck.count - deck.due) / deck.count) * 100}%`, background: deck.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const deck = decks.find(d => d.id === selectedDeck)!;
  const card = activeCards[cardIdx % activeCards.length] || { id: 'null', question: 'No active cards generated...', answer: 'Add more notes.' };
  const progress = Math.round((cardIdx / Math.max(1, activeCards.length)) * 100);

  return (
    <div className={styles.page}>
      <div className={styles.studyHeader}>
        <button className="btn-ghost" onClick={() => setSelectedDeck(null)} id="back-to-decks">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Decks
        </button>
        <span className={styles.deckName}>{deck?.title}</span>
        <span className={styles.cardCount}>{cardIdx + 1} / {Math.max(1, activeCards.length)}</span>
      </div>

      {/* Progress */}
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <div className={styles.cardWrap}>
        <FlipCard
          key={card.id}
          id={`flipcard-${card.id}`}
          front={
            <div className={styles.cardFace}>
              <span className="text-label text-muted">Question</span>
              <p className={styles.cardText}>{card.question}</p>
            </div>
          }
          back={
            <div className={styles.cardFace}>
              <span className="text-label" style={{ color: 'var(--accent)' }}>Answer</span>
              <p className={styles.cardText}>{card.answer}</p>
            </div>
          }
        />
      </div>

      {/* Nav */}
      <div className={styles.cardNav}>
        <button className="btn-ghost" onClick={() => setCardIdx(i => Math.max(0, i - 1))} disabled={cardIdx === 0} id="prev-card">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Previous
        </button>
        <div className={styles.ratingRow}>
          <button className={styles.rateBtn} style={{ '--c': '#f87171' } as React.CSSProperties} id="rate-hard">Hard</button>
          <button className={styles.rateBtn} style={{ '--c': '#facc15' } as React.CSSProperties} id="rate-ok">Okay</button>
          <button className={styles.rateBtn} style={{ '--c': '#4ade80' } as React.CSSProperties} onClick={() => setCardIdx(i => i + 1)} id="rate-easy">Easy</button>
        </div>
        <button className="btn-ghost" onClick={() => setCardIdx(i => i + 1)} disabled={cardIdx >= activeCards.length - 1} id="next-card">
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
};

export default FlashcardsPage;
