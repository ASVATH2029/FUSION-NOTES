import React, { useState } from 'react';
import styles from './AuthPage.module.css';
import AnimatedBackground from '../components/AnimatedBackground';
import { LogIn, UserPlus, User, Mail, Loader } from 'lucide-react';

type Mode = 'login' | 'register';

export const AuthPage: React.FC<{ onLogin: (token: string) => void }> = ({ onLogin }) => {
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
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        onLogin(data.access_token);
      } else {
        setErrorMsg(data.detail || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not connect to backend.');
    } finally {
      setIsLoading(false);
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
      const res = await fetch('/api/auth/register', {
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
              Sign In
            </button>
            <button
              className={`${styles.modeTab} ${mode === 'register' ? styles.modeTabActive : ''}`}
              onClick={() => switchMode('register')}
              type="button"
            >
              Register
            </button>
          </div>

          {mode === 'login' ? (
            <>
              <h1 className={styles.title}>Welcome back.</h1>
              <p className={styles.subtitle}>Log in to access your intelligent workspace.</p>

              <div className={styles.providers}>
                <button className={`${styles.btnProvider} pill-btn`} onClick={() => onLogin('mock-github-jwt')}>
                  <User size={20} />
                  Continue with GitHub
                </button>
                <button className={`${styles.btnProvider} pill-btn`} onClick={() => onLogin('mock-email-jwt')}>
                  <Mail size={20} />
                  Continue with Email
                </button>
              </div>

              <div className={styles.divider}><span>Or</span></div>

              <form className={styles.loginForm} onSubmit={handleLogin}>
                <div className={styles.inputGroup}>
                  <label>Email</label>
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
                  <label>Password</label>
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
                  {isLoading ? 'Verifying...' : 'Sign in securely'}
                </button>
              </form>

              <p className={styles.footerText}>
                Don't have an account?{' '}
                <a href="#" onClick={e => { e.preventDefault(); switchMode('register'); }}>Register</a>
              </p>
            </>
          ) : (
            <>
              <h1 className={styles.title}>Create account.</h1>
              <p className={styles.subtitle}>Join FusionNotes and start collaborating.</p>

              <form className={styles.loginForm} onSubmit={handleRegister}>
                <div className={styles.inputGroup}>
                  <label>Username</label>
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
                  <label>Email</label>
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
                  <label>Password</label>
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
                  <label>Confirm Password</label>
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
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <p className={styles.footerText}>
                Already have an account?{' '}
                <a href="#" onClick={e => { e.preventDefault(); switchMode('login'); }}>Sign in</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
