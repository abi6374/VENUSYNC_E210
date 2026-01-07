import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Download,
  Calendar,
  Filter,
  ArrowLeft,
  Github,
  MessageSquare,
  Award,
  Zap
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30d');
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const handleExportPDF = () => {
    window.print();
  };

  const handleGenerateReport = () => {
    const reportData = {
      project: 'Cloud Infrastructure',
      timeRange,
      teamData,
      generatedAt: new Date().toLocaleString()
    };
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `venusync-report-${Date.now()}.json`;
    link.click();
  };

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchAnalytics();
  }, [projectId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/analytics/${projectId}`);
      setTeamData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip glass">
          <p className="tooltip-name">{data.name}</p>
          <p className="tooltip-role">{data.role}</p>
          <div className="tooltip-stats">
            <span className="stat-label">Visibility: {data.visibility}%</span>
            <span className="stat-label">Impact: {data.impact}%</span>
          </div>
          <span className={`badge-type ${data.type.replace(' ', '-').toLowerCase()}`}>
            {data.type}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-page">
      <header className="dash-header glass">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/projects')}>
            <ArrowLeft size={18} />
          </button>
          <div className="project-title">
            <span className="breadcrumb">Projects / Cloud Infrastructure</span>
            <h1>Contribution Analytics</h1>
          </div>
        </div>

        <div className="header-actions">
          <div className="range-selector glass">
            <Calendar size={16} />
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <button className="btn-secondary" onClick={handleGenerateReport}><FileText size={18} /> Report</button>
          <button className="btn-primary" onClick={handleExportPDF}><Download size={18} /> Export PDF</button>

          <div className="user-profile glass">
            <div className="user-avatar">
              {(user?.name || 'AR').split(' ').map(n => n[0]).join('')}
            </div>
            <div className="user-info">
              <span className="name">{user?.name || 'Alex'}</span>
              <span className="role">{user?.role || 'Admin'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="stats-row">
        <div className="mini-card glass-card">
          <TrendingUp className="text-secondary" />
          <div className="card-data">
            <span className="label">Team Productivity</span>
            <span className="value">+12.5%</span>
          </div>
        </div>
        <div className="mini-card glass-card">
          <Zap className="text-accent" />
          <div className="card-data">
            <span className="label">Efficiency Score</span>
            <span className="value">84/100</span>
          </div>
        </div>
        <div className="mini-card glass-card">
          <Users className="text-primary" />
          <div className="card-data">
            <span className="label">Active Squad</span>
            <span className="value">12 members</span>
          </div>
        </div>
      </div>

      <main className="dashboard-grid">
        <section className="chart-section glass-card">
          <div className="section-header">
            <h3>Visibility vs. Impact</h3>
            <p>Identifying Silent Architects and high-noise contributors</p>
          </div>
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Calculating Impact Metrics...</p>
            </div>
          ) : (
            <>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis
                      type="number"
                      dataKey="visibility"
                      name="Visibility"
                      unit="%"
                      stroke="var(--text-muted)"
                      label={{ value: 'Perceived Visibility', position: 'bottom', offset: 0, fill: 'var(--text-dim)' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="impact"
                      name="Impact"
                      unit="%"
                      stroke="var(--text-muted)"
                      label={{ value: 'Actual Impact', angle: -90, position: 'left', fill: 'var(--text-dim)' }}
                    />
                    <ZAxis type="number" range={[100, 200]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Team" data={teamData}>
                      {teamData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.impact > 80 && entry.visibility < 40 ? 'var(--secondary)' :
                            entry.visibility > 80 && entry.impact < 50 ? 'var(--danger)' :
                              'var(--primary)'}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                <div className="legend-item"><span className="dot silent"></span> Silent Architect</div>
                <div className="legend-item"><span className="dot noisy"></span> High Noise</div>
                <div className="legend-item"><span className="dot balanced"></span> Core Contributor</div>
              </div>
            </>
          )}
        </section>

        <section className="leaderboard-section glass-card">
          <div className="section-header">
            <h3>Top Contributors</h3>
            <button className="btn-icon"><Filter size={16} /></button>
          </div>
          <div className="contributor-list">
            {teamData.sort((a, b) => b.impact - a.impact).map((member, i) => (
              <motion.div
                key={i}
                className="member-row"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="rank">#{i + 1}</div>
                <div className="member-info">
                  <p className="name">{member.name}</p>
                  <p className="role">{member.role}</p>
                </div>
                <div className="member-metrics">
                  <div className="metric-group">
                    <Github size={12} className="text-muted" />
                    <span>{Math.floor(member.impact * 1.5)}</span>
                  </div>
                  <div className="metric-group">
                    <MessageSquare size={12} className="text-muted" />
                    <span>{Math.floor(member.visibility * 2)}</span>
                  </div>
                </div>
                <div className="impact-score">
                  <span className="score">{member.impact}</span>
                  <div className="score-bar">
                    <div className="bar-fill" style={{ width: `${member.impact}%` }}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <style jsx>{`
        .dashboard-page {
          padding: 30px;
          background: var(--bg-darker);
          min-height: 100vh;
        }

        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
          border-radius: 20px;
          margin-bottom: 30px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .btn-back {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: white;
          padding: 8px;
          border-radius: 10px;
          cursor: pointer;
        }

        .breadcrumb {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .project-title h1 {
          font-size: 1.5rem;
          margin-top: 4px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .range-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          border-radius: 12px;
        }

        .range-selector select {
          background: transparent;
          border: none;
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
          outline: none;
          cursor: pointer;
        }

        .range-selector select option {
          background: #1a1a2e;
          color: white;
          padding: 10px;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: white;
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 16px;
          border-radius: 12px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-info .name {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .user-info .role {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 30px;
        }

        .mini-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .mini-card :global(svg) {
          width: 32px;
          height: 32px;
        }

        .card-data .label {
          display: block;
          color: var(--text-dim);
          font-size: 0.9rem;
          margin-bottom: 4px;
        }

        .card-data .value {
          font-size: 1.8rem;
          font-weight: 700;
          font-family: 'Outfit';
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.4fr 0.6fr;
          gap: 24px;
        }

        .section-header {
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .section-header h3 {
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .section-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .chart-container {
          padding: 20px;
        }

        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-dim);
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot.silent { background: var(--secondary); }
        .dot.noisy { background: var(--danger); }
        .dot.balanced { background: var(--primary); }

        .contributor-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .member-row {
          display: grid;
          grid-template-columns: 40px 1fr auto auto;
          align-items: center;
          gap: 16px;
          padding: 12px;
          border-radius: 12px;
          transition: var(--transition-smooth);
        }

        .member-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .rank {
          font-weight: 700;
          color: var(--text-muted);
        }

        .member-info .name {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .member-info .role {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .member-metrics {
          display: flex;
          gap: 12px;
        }

        .metric-group {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: var(--text-dim);
        }

        .impact-score {
          width: 80px;
          text-align: right;
        }

        .impact-score .score {
          display: block;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .score-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: var(--primary);
        }

        /* Tooltip & Badges */
        .custom-tooltip {
          padding: 12px;
          border-radius: 12px;
        }

        .tooltip-name { font-weight: 700; margin-bottom: 2px; }
        .tooltip-role { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; }
        .tooltip-stats { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px;}
        .stat-label { font-size: 0.85rem; color: var(--text-dim); }

        .badge-type {
          font-size: 0.75rem;
          padding: 4px 8px;
          border-radius: 100px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .silent-architect { background: rgba(52, 168, 83, 0.2); color: #34a853; }
        .high-visibility { background: rgba(234, 67, 53, 0.2); color: #ea4335; }
        .core-contributor { background: rgba(66, 133, 244, 0.2); color: #4285f4; }
        .balanced { background: rgba(255, 255, 255, 0.1); color: white; }

        @media (max-width: 1100px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          gap: 20px;
          height: 400px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
