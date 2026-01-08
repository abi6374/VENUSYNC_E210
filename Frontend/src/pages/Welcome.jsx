import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Github, Slack, Zap, BarChart3, Users, Mail, User, Lock, ChevronDown, AlertCircle, Sun, Moon } from 'lucide-react';
import axios from 'axios';

const Welcome = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('Super Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const navigate = useNavigate();

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? 'api/auth/login' : 'api/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password, role };

      const response = await axios.post(endpoint, payload);

      // Store user info
      localStorage.setItem('user', JSON.stringify(response.data));

      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-page">
      {/* Animated Background Elements */}
      <div className="bg-gradient-sphere sphere-1"></div>
      <div className="bg-gradient-sphere sphere-2"></div>

      <nav className="navbar glass">
        <div className="nav-logo">
          <ShieldCheck className="text-primary" size={32} />
          <span>Venusync</span>
        </div>
        <div className="nav-links">
          <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="btn-primary" onClick={() => setIsLogin(true)}>Login</button>
          <button className="btn-primary" onClick={() => setIsLogin(false)}>Get Started</button>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Quantify Impact, <br />
            <span className="text-gradient">Beyond the Noise.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-subtitle"
          >
            Empower your engineering teams with data-driven insights.
            Identify silent architects and bridge the gap between activity and true execution.
          </motion.p>

          <motion.div
            className="feature-badges"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="badge"><Github size={16} /> GitHub Insights</div>
            <div className="badge"><Slack size={16} /> Slack Analytics</div>
            <div className="badge"><Zap size={16} /> ML Rankings</div>
          </motion.div>
        </div>

        <motion.div
          className="auth-container glass-card"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="auth-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Login to manage your squads' : 'Start monitoring team impact today'}</p>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            {error && (
              <div className="error-message glass">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <User size={18} />
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Select Your Role</label>
                  <div className="role-selector-grid">
                    {['Super Admin', 'Manager', 'Team Lead'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`role-btn ${role === r ? 'active' : ''}`}
                        onClick={() => {
                          setRole(r);
                          setError('');
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Work Email</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder={isLogin ? "name@gmail.com" : "your.email@gmail.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-footer">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </motion.div>
      </main>

      <section className="stats-preview">
        <div className="stat-card glass">
          <Users className="text-primary" />
          <h3>Scalable</h3>
          <p>Works for teams of 3 to 50+ without noise.</p>
        </div>
        <div className="stat-card glass">
          <BarChart3 className="text-secondary" />
          <h3>Fair Metrics</h3>
          <p>Scoring logic that values quality over raw volume.</p>
        </div>
        <div className="stat-card glass">
          <ShieldCheck className="text-accent" />
          <h3>Secure</h3>
          <p>Enterprise-grade data encryption & privacy.</p>
        </div>
      </section>

      <style>{`
        .welcome-page {
          min-height: 100vh;
          padding: 20px 80px;
          position: relative;
          overflow: hidden;
        }

        .bg-gradient-sphere {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: -1;
        }

        .sphere-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
          top: -100px;
          left: -100px;
          opacity: 0.15;
        }

        .sphere-2 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #8a2be2 0%, transparent 70%);
          bottom: -200px;
          right: -100px;
          opacity: 0.1;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          border-radius: 100px;
          margin-bottom: 60px;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          font-size: 1.5rem;
          font-family: 'Outfit', sans-serif;
        }

        .nav-links {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .btn-icon {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-main);
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: var(--transition-smooth);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary);
          color: var(--primary);
        }

        .btn-ghost {
          background: transparent;
          border: none;
          color: var(--text-main);
          cursor: pointer;
          font-weight: 500;
        }

        .hero-section {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          align-items: center;
          padding: 40px 0;
        }

        h1 {
          font-size: 4.5rem;
          line-height: 1.1;
          margin-bottom: 24px;
        }

        .text-gradient {
          background: linear-gradient(90deg, var(--primary), #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-dim);
          max-width: 540px;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .feature-badges {
          display: flex;
          gap: 15px;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 100px;
          font-size: 0.9rem;
          color: var(--text-dim);
        }

        .auth-container {
          padding: 48px;
          max-width: 480px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .auth-header h2 {
          font-size: 2.2rem;
          margin-bottom: 8px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .auth-header p {
          color: var(--text-muted);
          margin-bottom: 36px;
          font-size: 1rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 4px;
        }

        .form-group label {
          font-size: 0.875rem;
          color: var(--text-dim);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group input {
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          padding: 14px 18px;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon :global(svg) {
          position: absolute;
          left: 16px;
          color: var(--text-muted);
        }

        .input-with-icon input {
          width: 100%;
          padding-left: 48px !important;
        }

        .role-selector-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .role-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          color: var(--text-dim);
          padding: 12px 8px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .role-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }

        .role-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
        }

        .error-message {
          background: rgba(234, 67, 53, 0.1);
          border: 1px solid rgba(234, 67, 53, 0.2);
          color: #ea4335;
          padding: 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
        }

        .w-full { 
          width: 100%; 
          justify-content: center; 
          margin-top: 16px;
          padding: 14px 24px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .w-full:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(66, 133, 244, 0.4);
        }

        .w-full:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .auth-footer {
          margin-top: 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .auth-footer button {
          background: transparent;
          border: none;
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
          margin-left: 5px;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 10px 0;
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .auth-divider span {
          margin: 0 10px;
        }

        .google-login-container {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .stats-preview {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-top: 100px;
          padding-bottom: 100px;
        }

        .stat-card {
          padding: 30px;
          text-align: left;
        }

        .stat-card h3 {
          margin: 15px 0 8px;
          font-size: 1.2rem;
        }

        .stat-card p {
          color: var(--text-dim);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        @media (max-width: 1200px) {
          .welcome-page { padding: 20px 40px; }
          h1 { font-size: 3.5rem; }
          .hero-section { grid-template-columns: 1fr; gap: 40px; }
          .auth-container { max-width: 500px; margin: 0 auto; }
        }
      `}</style>
    </div >
  );
};

export default Welcome;
