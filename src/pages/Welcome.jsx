import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Github, Slack, Zap, BarChart3, Users } from 'lucide-react';

const Welcome = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const handleAuth = (e) => {
        e.preventDefault();
        // Simulate auth
        navigate('/projects');
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
                    <button className="btn-ghost" onClick={() => setIsLogin(true)}>Login</button>
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
                        {!isLogin && (
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" placeholder="Manager Name" required />
                            </div>
                        )}
                        <div className="form-group">
                            <label>Work Email</label>
                            <input type="email" placeholder="name@company.com" required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" placeholder="••••••••" required />
                        </div>

                        <button type="submit" className="btn-primary w-full">
                            {isLogin ? 'Sign In' : 'Create Admin Account'}
                            <ArrowRight size={18} />
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

            <style jsx>{`
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
          padding: 40px;
        }

        .auth-header h2 {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .auth-header p {
          color: var(--text-muted);
          margin-bottom: 32px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.9rem;
          color: var(--text-dim);
          font-weight: 500;
        }

        .form-group input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          padding: 12px 16px;
          border-radius: 10px;
          color: white;
          font-size: 1rem;
          transition: var(--transition-smooth);
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .w-full { width: 100%; justify-content: center; margin-top: 10px; }

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
        </div>
    );
};

export default Welcome;
