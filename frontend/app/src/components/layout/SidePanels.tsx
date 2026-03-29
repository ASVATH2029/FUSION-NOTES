import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './SidePanels.module.css';

export interface Collaborator {
  id: string;
  user_id: string;
  initial: string;
  last_subject: string;
  last_active: string;
  online?: boolean;
}

interface SidePanelProps {
  collabs: Collaborator[];
  loading: boolean;
}

const AVATAR_COLORS = ['#8b7fff', '#4ade80', '#facc15', '#f87171', '#38bdf8', '#f97316', '#ec4899'];

/* ── DASHBOARD SIDE ── */
export const DashboardSide: React.FC<SidePanelProps> = ({ collabs, loading }) => {
  const { t } = useTranslation();
  const ACTIVITY: any[] = []; // Cleared mock activity

  return (
    <div className={styles.panel}>
      <h3 className={styles.sectionTitle}>{t('side.activity')}</h3>
      {ACTIVITY.length === 0 ? (
        <div className={styles.emptyState}>{t('side.noActivity')}</div>
      ) : (
        <div className={styles.activityList}>
          {ACTIVITY.map((a, i) => (
            <div key={i} className={styles.activityItem}>
              <div className={styles.activityDot} style={{ background: a.color }} />
              <div className={styles.activityContent}>
                <div className={styles.activityText}>{a.text}</div>
                <div className={styles.activityTime}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className={styles.sectionTitle} style={{ marginTop: '24px' }}>{t('side.collaborators')}</h3>
      {loading ? (
        <div className={styles.emptyState}>Loading...</div>
      ) : collabs.length === 0 ? (
        <div className={styles.emptyState}>{t('side.noCollabs')}</div>
      ) : (
        <div className={styles.collabList}>
          {collabs.map((c, i) => (
            <div key={i} className={styles.collabItem}>
              <div 
                className={styles.collabAvatar} 
                style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              >
                {c.initial}
              </div>
              <div className={styles.collabInfo}>
                <div className={styles.collabName}>{c.user_id}</div>
                <div className={styles.collabStatus}>{c.last_subject}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── FLASHCARD SIDE ── */
export const FlashcardSide: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.panel}>
      <h3 className={styles.sectionTitle}>{t('side.stats')}</h3>
      <div className={styles.emptyState}>No flashcard stats yet. Start studying!</div>
    </div>
  );
};

/* ── CHAT SIDE ── */
export const ChatSide: React.FC<SidePanelProps> = ({ collabs, loading }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.panel}>
      <h3 className={styles.sectionTitle}>{t('side.activeNow')}</h3>
      {loading ? (
        <div className={styles.emptyState}>Loading...</div>
      ) : collabs.length === 0 ? (
        <div className={styles.emptyState}>{t('side.noOneOnline')}</div>
      ) : (
        <div className={styles.collabList}>
          {collabs.map((c, i) => (
            <div key={i} className={styles.collabItem}>
              <div 
                className={styles.collabAvatar} 
                style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              >
                {c.initial}
                <div className={styles.onlineStatus} />
              </div>
              <div className={styles.collabInfo}>
                <div className={styles.collabName}>{c.user_id}</div>
                <div className={styles.collabStatus}>{t('side.online')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── NOTES SIDE ── */
export const NotesSide: React.FC<SidePanelProps> = ({ collabs, loading }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.panel}>
      <h3 className={styles.sectionTitle}>{t('side.recentContributors')}</h3>
      {loading ? (
        <div className={styles.emptyState}>Loading...</div>
      ) : collabs.length === 0 ? (
        <div className={styles.emptyState}>{t('side.noContributors')}</div>
      ) : (
        <div className={styles.collabList}>
          {collabs.map((c, i) => (
            <div key={i} className={styles.collabItem}>
              <div 
                className={styles.collabAvatar} 
                style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              >
                {c.initial}
              </div>
              <div className={styles.collabInfo}>
                <div className={styles.collabName}>{c.user_id}</div>
                <div className={styles.collabStatus}>{c.last_subject}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
