import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import NavPills from './NavPills';
import AISearchBar from './AISearchBar';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageSelector from '../ui/LanguageSelector';
import { Bell, User, Settings, LogOut, X } from 'lucide-react';
import styles from './TopBar.module.css';

interface TopBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearch: (query: string) => void;
  user: { id: string; email: string; username?: string } | null;
  onLogout: () => void;
  isMobile?: boolean;
  onMenuClick?: () => void;
}

type PanelType = 'notifications' | 'profile' | null;

const TopBar: React.FC<TopBarProps> = ({ activeTab, onTabChange, onSearch, user, onLogout, isMobile, onMenuClick }) => {
  const { logo } = useTheme();
  const { t } = useTranslation();
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [hasUnread, setHasUnread] = useState(false);

  return (
    <>
      {/* Floating Panel Overlay */}
      {activePanel && (
        <div className={styles.panelOverlay} onClick={() => setActivePanel(null)}>
          <div className={styles.floatingPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>
                {activePanel === 'profile' ? t('topbar.accountSettings') : t('topbar.notifications')}
              </h3>
              <button className={styles.closeBtn} onClick={() => setActivePanel(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.panelContent}>
              {activePanel === 'profile' ? (
                <>
                  <div className={styles.panelItem}>
                    <User size={18} className={styles.panelItemIcon} />
                    <span>{user?.username || user?.email || 'Student'}</span>
                  </div>
                  <div className={styles.panelItem}>
                    <Settings size={18} className={styles.panelItemIcon} />
                    <span>{t('topbar.preferences')}</span>
                  </div>
                  <div className={styles.panelItem} style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={onLogout}>
                    <LogOut size={18} className={styles.panelItemIcon} />
                    <span>{t('topbar.signOut')}</span>
                  </div>
                </>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {t('topbar.noNotifications')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main TopBar */}
      <header className={styles.topbar}>
        <div className={styles.logoZone}>
          <img
            src={logo}
            alt="Fusionnotes"
            className={styles.logo}
            draggable={false}
          />
        </div>

        {!isMobile && (
          <div className={styles.centerZone}>
            <AISearchBar onSearch={onSearch} />
            <NavPills activeTab={activeTab} onTabChange={onTabChange} />
          </div>
        )}

        <div className={styles.actionsZone}>
          {isMobile ? (
            <button className="icon-btn" onClick={onMenuClick}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          ) : (
            <>
              <LanguageSelector />
              <ThemeToggle />
              <div className={styles.notifBtnWrap}>
                <button className="icon-btn" title={t('topbar.notifications')} onClick={() => { setActivePanel('notifications'); setHasUnread(false); }}>
                  <Bell size={18} />
                </button>
                {hasUnread && <span className={styles.notifBadge} />}
              </div>
              <button className={styles.avatar} title={t('topbar.accountSettings')} onClick={() => setActivePanel('profile')}>
                <span>{(user?.username || user?.email || 'S')[0].toUpperCase()}</span>
              </button>
            </>
          )}
        </div>
      </header>
    </>
  );
};

export default TopBar;
