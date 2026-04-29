import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AuthPage.module.css';
import AnimatedBackground from '../components/AnimatedBackground';
import { LogIn, UserPlus, User, Mail, Loader } from 'lucide-react';
import { API_BASE_URL } from '../config';

type Mode = 'login' | 'register';

export const AuthPage: React.FC<{ onLogin: (token: string, user: any) => void }> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('login');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setIsLoading(true);
    setErrorMsg('');
    
    // Create a timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Probably hit a 404 or SPA fallback (HTML)
        throw new Error("Server returned non-JSON response. Check if VITE_API_URL is correct.");
      }

      const data = await res.json();
      if (res.ok && data.access_token) {
        onLogin(data.access_token, data.user);
      } else {
        setErrorMsg(data.detail || 'Authentication failed');
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.name === 'AbortError') {
        setErrorMsg('Connection timed out. The server might be unreachable.');
      } else {
        setErrorMsg(err.message || 'Could not connect to backend.');
      }
    } finally {
      setIsLoading(false);
      clearTimeout(timeoutId);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword || !regConfirm) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (regPassword !== regConfirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, email: regEmail, password: regPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Account created! You can now sign in.');
        setRegUsername(''); setRegEmail(''); setRegPassword(''); setRegConfirm('');
        setTimeout(() => switchMode('login'), 1500);
      } else {
        setErrorMsg(data.detail || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <AnimatedBackground />
      <div className={styles.authPanel}>
        <div className={styles.authCore}>

          {/* Mode tabs */}
          <div className={styles.modeTabs}>
            <button
              className={`${styles.modeTab} ${mode === 'login' ? styles.modeTabActive : ''}`}
              onClick={() => switchMode('login')}
              type="button"
            >
              {t('auth.signIn')}
            </button>
            <button
              className={`${styles.modeTab} ${mode === 'register' ? styles.modeTabActive : ''}`}
              onClick={() => switchMode('register')}
              type="button"
            >
              {t('auth.register')}
            </button>
          </div>

          {mode === 'login' ? (
            <>
              <h1 className={styles.title}>{t('auth.welcomeBack')}</h1>
              <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>

              <div className={styles.providers}>
                <button className={`${styles.btnProvider} pill-btn`} onClick={() => onLogin('mock-github-jwt', { id: 'github-user-123', username: 'GitHub User', email: 'github@example.com' })}>
                  <User size={20} />
                  {t('auth.continueGithub')}
                </button>
                <button className={`${styles.btnProvider} pill-btn`} onClick={() => onLogin('mock-email-jwt', { id: 'email-user-456', username: 'Email User', email: 'email@example.com' })}>
                  <Mail size={20} />
                  {t('auth.continueEmail')}
                </button>
              </div>

              <div className={styles.divider}><span>{t('auth.or')}</span></div>

              <form className={styles.loginForm} onSubmit={handleLogin}>
                <div className={styles.inputGroup}>
                  <label>{t('auth.email')}</label>
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    className={styles.inputField}
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t('auth.password')}</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={styles.inputField}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {errorMsg && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '-4px' }}>{errorMsg}</div>}
                <button className={`pill-btn btn-accent ${styles.loginBtn}`} type="submit" disabled={isLoading}>
                  {isLoading ? <Loader size={18} className="spin" /> : <LogIn size={18} />}
                  {isLoading ? t('auth.verifying') : t('auth.signInSecurely')}
                </button>
              </form>

              <p className={styles.footerText}>
                {t('auth.noAccount')}{' '}
                <a href="#" onClick={e => { e.preventDefault(); switchMode('register'); }}>{t('auth.register')}</a>
              </p>
            </>
          ) : (
            <>
              <h1 className={styles.title}>{t('auth.createAccount')}</h1>
              <p className={styles.subtitle}>{t('auth.joinSubtitle')}</p>

              <form className={styles.loginForm} onSubmit={handleRegister}>
                <div className={styles.inputGroup}>
                  <label>{t('auth.username')}</label>
                  <input
                    type="text"
                    placeholder="alex.student"
                    className={styles.inputField}
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t('auth.email')}</label>
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    className={styles.inputField}
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t('auth.password')}</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={styles.inputField}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{t('auth.confirmPassword')}</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={styles.inputField}
                    value={regConfirm}
                    onChange={e => setRegConfirm(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {errorMsg && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '-4px' }}>{errorMsg}</div>}
                {successMsg && <div style={{ color: '#22c55e', fontSize: '12px', marginTop: '-4px' }}>{successMsg}</div>}
                <button className={`pill-btn btn-accent ${styles.loginBtn}`} type="submit" disabled={isLoading}>
                  {isLoading ? <Loader size={18} className="spin" /> : <UserPlus size={18} />}
                  {isLoading ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
                </button>
              </form>

              <p className={styles.footerText}>
                {t('auth.haveAccount')}{' '}
                <a href="#" onClick={e => { e.preventDefault(); switchMode('login'); }}>{t('auth.signIn')}</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
