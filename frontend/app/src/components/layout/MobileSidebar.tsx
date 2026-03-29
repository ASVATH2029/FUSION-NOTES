import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, LogOut, Globe, Settings } from 'lucide-react';
import LanguageSelector from '../ui/LanguageSelector';
import ThemeToggle from '../ui/ThemeToggle';
import styles from './MobileSidebar.module.css';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; email: string; username?: string } | null;
  onLogout: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, user, onLogout }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sidebar} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>
              {(user?.username || 'S')[0].toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.username}>{user?.username || 'Student'}</div>
              <div className={styles.email}>{user?.email}</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{t('topbar.preferences')}</h4>
            <div className={styles.item}>
              <div className={styles.itemLabel}>
                <Globe size={18} />
                <span>{t('topbar.language')}</span>
              </div>
              <LanguageSelector />
            </div>
            <div className={styles.item}>
              <div className={styles.itemLabel}>
                <Settings size={18} />
                <span>Theme</span>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Account</h4>
            <button className={styles.actionItem} onClick={onLogout}>
              <LogOut size={18} />
              <span>{t('topbar.signOut')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
