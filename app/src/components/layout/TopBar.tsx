import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import NavPills from './NavPills';
import AISearchBar from './AISearchBar';
import ThemeToggle from '../ui/ThemeToggle';
import { Bell, User, Settings, LogOut, X } from 'lucide-react';
import styles from './TopBar.module.css';

interface TopBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearch: (query: string) => void;
}

type PanelType = 'notifications' | 'profile' | null;

const TopBar: React.FC<TopBarProps> = ({ activeTab, onTabChange, onSearch }) => {
  const { logo } = useTheme();
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  return (
    <>
      {/* Floating Panel Overlay */}
      {activePanel && (
        <div className={styles.panelOverlay} onClick={() => setActivePanel(null)}>
          <div className={styles.floatingPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>
                {activePanel === 'profile' ? 'Account Settings' : 'Notifications'}
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
                    <span>Alex Student</span>
                  </div>
                  <div className={styles.panelItem}>
                    <Settings size={18} className={styles.panelItemIcon} />
                    <span>Preferences</span>
                  </div>
                  <div className={styles.panelItem} style={{ color: 'var(--accent)' }}>
                    <LogOut size={18} className={styles.panelItemIcon} />
                    <span>Sign out</span>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.panelItem}>
                    <Bell size={18} className={styles.panelItemIcon} />
                    <div>
                      <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Jason attached a file</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Biology — Cell Division</div>
                    </div>
                  </div>
                  <div className={styles.panelItem}>
                    <Bell size={18} className={styles.panelItemIcon} />
                    <div>
                      <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Sarah commented</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>WWII Timeline</div>
                    </div>
                  </div>
                </>
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

      <div className={styles.centerZone}>
        <AISearchBar onSearch={onSearch} />
        <NavPills activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      <div className={styles.actionsZone}>
        <ThemeToggle />
        <button className="icon-btn" title="Notifications" onClick={() => setActivePanel('notifications')}>
          <Bell size={18} />
        </button>
        <button className={styles.avatar} title="Account" onClick={() => setActivePanel('profile')}>
          <span>A</span>
        </button>
      </div>
    </header>
    </>
  );
};

export default TopBar;
