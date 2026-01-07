import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap,
  Edit,
  X,
  Plus,
  Trash2,
  RefreshCw
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

  // Data State
  const [project, setProject] = useState(null);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // UI State
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMembers, setEditingMembers] = useState([]);

  // Load User
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Parallel fetch: Project Details & Analytics
      const [projectRes, analyticsRes] = await Promise.all([
        axios.get(`/api/projects/${projectId}`),
        axios.get(`/api/analytics/${projectId}`)
      ]);

      setProject(projectRes.data);
      setTeamData(analyticsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  // Handlers
  const handleExportPDF = () => {
    window.print();
  };

  const handleGenerateReport = () => {
    const reportData = {
      project: project?.name,
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

  // Edit Team Logic
  const openEditModal = () => {
    // Deep copy to strictly avoid mutating project state directly
    const membersCopy = project?.members ? project.members.map(m => ({ ...m })) : [];
    setEditingMembers(membersCopy);
    setShowEditModal(true);
  };

  // ... (rest is same)


  const handleAddMember = () => {
    setEditingMembers([...editingMembers, { name: '', github: '', slack: '' }]);
  };

  const handleRemoveMember = (index) => {
    const newMembers = [...editingMembers];
    newMembers.splice(index, 1);
    setEditingMembers(newMembers);
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = editingMembers.map((member, i) => {
      if (i === index) {
        return { ...member, [field]: value };
      }
      return member;
    });
    setEditingMembers(newMembers);
  };

  const handleSaveTeam = async () => {
    try {
      setSaving(true);
      await axios.put(`/api/projects/${projectId}`, { members: editingMembers });
      setShowEditModal(false);
      await fetchData(); // Wait for data refresh
      setSaving(false);
    } catch (error) {
      console.error("Failed to update team", error);
      alert("Failed to save changes. Please check the console for details.");
      setSaving(false);
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
          <span className={`badge-type ${data.type ? data.type.replace(/\s+/g, '-').toLowerCase() : ''}`}>
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
            <span className="breadcrumb">Projects / {project?.name || 'Loading...'}</span>
            <h1>Contribution Analytics</h1>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchData} title="Refresh Data">
            <RefreshCw size={18} />
          </button>

          <button className="btn-secondary" onClick={openEditModal}>
            <Edit size={18} /> Edit Team
          </button>

          <button className="btn-secondary" onClick={handleGenerateReport}>
            <FileText size={18} /> Report
          </button>

          <button className="btn-primary" onClick={handleExportPDF}>
            <Download size={18} /> Export PDF
          </button>

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
            <span className="value">
              {teamData.length > 0 ? `+${Math.floor(teamData.reduce((acc, curr) => acc + curr.impact, 0) / teamData.length)}%` : '0%'}
            </span>
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
            <span className="value">{teamData.length} members</span>
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
                      domain={[0, 100]}
                      unit="%"
                      stroke="var(--text-muted)"
                      label={{ value: 'Perceived Visibility', position: 'bottom', offset: 0, fill: 'var(--text-dim)' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="impact"
                      name="Impact"
                      domain={[0, 100]}
                      unit="%"
                      stroke="var(--text-muted)"
                      label={{ value: 'Actual Impact', angle: -90, position: 'left', fill: 'var(--text-dim)' }}
                    />
                    <ZAxis type="number" range={[100, 300]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Team" data={teamData}>
                      {teamData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.impact > 60 && entry.visibility < 40 ? '#34a853' : // Silent Architect (Green)
                              entry.visibility > 70 && entry.impact < 50 ? '#ea4335' : // High Noise (Red)
                                '#4285f4' // Core (Blue)
                          }
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
                  <p className="role">{member.type || member.role}</p>
                </div>
                <div className="member-metrics">
                  <div className="metric-group" title="Impact Score">
                    <Award size={14} className="text-secondary" />
                    <span className="metric-val">{member.impact}</span>
                  </div>
                  <div className="metric-group" title="Github Activity">
                    <Github size={14} className="text-muted" />
                    <span className="metric-val">{member.visibility}%</span>
                  </div>
                </div>
                <div className="impact-score">
                  <div className="score-bar">
                    <div className="bar-fill" style={{ width: `${member.impact}%` }}></div>
                  </div>
                </div>
              </motion.div>
            ))}
            {teamData.length === 0 && !loading && (
              <div className="empty-state">
                <p>No contributors found.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Edit Team Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal glass-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>Edit Team Members</h2>
                <button onClick={() => setShowEditModal(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="members-list">
                  {editingMembers.map((member, idx) => (
                    <div key={idx} className="member-input-row">
                      <input
                        type="text"
                        placeholder="Name"
                        value={member.name}
                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="GitHub Username"
                        value={member.github}
                        onChange={(e) => handleMemberChange(idx, 'github', e.target.value)}
                      />
                      <button className="btn-icon danger" onClick={() => handleRemoveMember(idx)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn-dashed" onClick={handleAddMember}>
                  <Plus size={16} /> Add Member
                </button>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowEditModal(false)} disabled={saving}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveTeam} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        /* Reuse existing styles plus Modal Styles */
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
          transition: all 0.2s;
        }
        
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .btn-primary {
            background: var(--primary);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
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

        .user-info .name { font-size: 0.85rem; font-weight: 600; }
        .user-info .role { font-size: 0.7rem; color: var(--text-muted); }

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

        .mini-card :global(svg) { width: 32px; height: 32px; }
        .card-data .label { display: block; color: var(--text-dim); font-size: 0.9rem; margin-bottom: 4px; }
        .card-data .value { font-size: 1.8rem; font-weight: 700; font-family: 'Outfit'; }

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

        .section-header h3 { font-size: 1.25rem; margin-bottom: 4px; }
        .section-header p { color: var(--text-muted); font-size: 0.9rem; }

        .chart-container { padding: 20px; }

        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }

        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-dim); }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.silent { background: #34a853; }
        .dot.noisy { background: #ea4335; }
        .dot.balanced { background: #4285f4; }
        
        .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 300px;
            color: var(--text-muted);
        }
        
        .spinner {
             width: 40px;
             height: 40px;
             border: 3px solid rgba(255, 255, 255, 0.1);
             border-top-color: var(--primary);
             border-radius: 50%;
             animation: spin 1s linear infinite;
             margin-bottom: 16px;
        }
        
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Contributor List */
        .contributor-list { display: flex; flex-direction: column; gap: 16px; }
        .member-row {
          display: grid;
          grid-template-columns: 40px 1fr auto auto;
          align-items: center;
          gap: 16px;
          padding: 12px;
          border-radius: 12px;
          transition: 0.2s;
        }
        .member-row:hover { background: rgba(255, 255, 255, 0.03); }
        .rank { font-weight: 700; color: var(--text-muted); }
        .member-info .name { font-weight: 600; font-size: 0.95rem; }
        .member-info .role { font-size: 0.8rem; color: var(--text-muted); }
        
        .member-metrics { display: flex; gap: 16px; min-width: 100px;}
        .metric-group { display: flex; align-items: center; gap: 6px; }
        .metric-val { font-weight: 600; font-size: 0.9rem; }

        .impact-score { width: 80px; }
        .score-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
          overflow: hidden;
        }
        .bar-fill { height: 100%; background: var(--primary); }

        /* Tooltip & Badges */
        .custom-tooltip { padding: 12px; border-radius: 12px; background: rgba(16, 20, 30, 0.95); border: 1px solid var(--border-color); backdrop-filter: blur(10px); }
        .tooltip-name { font-weight: 700; margin-bottom: 2px; }
        .tooltip-role { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; }
        .tooltip-stats { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px;}
        .stat-label { font-size: 0.85rem; color: var(--text-dim); }
        .badge-type { font-size: 0.75rem; padding: 4px 8px; border-radius: 100px; font-weight: 600; text-transform: uppercase; }
        
        .silent-architect { background: rgba(52, 168, 83, 0.2); color: #34a853; }
        .high-visibility, .high-noise { background: rgba(234, 67, 53, 0.2); color: #ea4335; }
        .core-contributor { background: rgba(66, 133, 244, 0.2); color: #4285f4; }
        .contributor { background: rgba(255, 255, 255, 0.1); color: white; }

        /* Modal */
        .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal {
            background: var(--bg-card);
            padding: 30px;
            border-radius: 24px;
            width: 100%;
            max-width: 600px;
            border: 1px solid var(--border-color);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        
        .modal-body {
            max-height: 60vh;
            overflow-y: auto;
            margin-bottom: 24px;
        }
        
        .members-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .member-input-row {
            display: grid;
            grid-template-columns: 1fr 1fr auto;
            gap: 12px;
        }
        
        .member-input-row input {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            padding: 10px;
            border-radius: 8px;
            color: white;
            outline: none;
        }
        
        .member-input-row input:focus {
            border-color: var(--primary);
        }
        
        .btn-icon.danger {
            color: var(--danger);
            background: rgba(234, 67, 53, 0.1);
            border: none;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
        }
        
        .btn-dashed {
            width: 100%;
            border: 1px dashed var(--border-color);
            background: transparent;
            color: var(--text-dim);
            padding: 12px;
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: 0.2s;
        }
        
        .btn-dashed:hover {
            border-color: var(--primary);
            color: var(--primary);
        }
        
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }

      `}</style>
    </div>
  );
};

export default Dashboard;
