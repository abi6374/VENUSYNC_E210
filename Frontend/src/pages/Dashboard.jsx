import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  Zap,
  Users,
  X
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  PieChart,
  Pie
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMembers, setEditingMembers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, analyticsRes] = await Promise.all([
        axios.get(`/api/projects/${projectId}`),
        axios.get(`/api/analytics/${projectId}`)
      ]);
      setProject(projRes.data);
      setTeamData(analyticsRes.data.members || []);
      setEditingMembers(projRes.data.members || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTeam = async () => {
    try {
      setSaving(true);
      await axios.put(`/api/projects/${projectId}`, { members: editingMembers });
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving team:', err);
      alert('Failed to save team members');
    } finally {
      setSaving(false);
    }
  };

  const handleMemberChange = (idx, field, value) => {
    const updated = [...editingMembers];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditingMembers(updated);
  };

  const handleAddMember = () => {
    setEditingMembers([...editingMembers, { name: '', github: '' }]);
  };

  const handleRemoveMember = (idx) => {
    setEditingMembers(editingMembers.filter((_, i) => i !== idx));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-name">{data.name}</p>
          <div className="tooltip-stats">
            <span>Impact: {data.impact}%</span>
            <span>Visibility: {data.visibility}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-page">
      <header className="dash-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/projects')}>
            <ArrowLeft size={16} />
          </button>
          <div className="header-text">
            <span className="breadcrumb">{project?.name || 'Project'} / Data Analysis</span>
            <h1>Engineering Impact</h1>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          <button className="btn-secondary" onClick={() => setShowEditModal(true)}>
            <Edit size={14} /> Edit Members
          </button>
          <button className="btn-primary">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </header>

      <div className="metrics-summary">
        <div className="metric-card glass-card">
          <div className="metric-icon"><TrendingUp size={20} color="#1a73e8" /></div>
          <div className="metric-info">
            <span className="label">Performance Index</span>
            <span className="value">84.2</span>
          </div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-icon"><Zap size={20} color="#188038" /></div>
          <div className="metric-info">
            <span className="label">Active Sprint Impact</span>
            <span className="value">{teamData.length > 0 ? (teamData.reduce((acc, m) => acc + (m.raw?.commits || 0), 0) / 10).toFixed(1) : '0.0'}</span>
          </div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-icon"><Users size={20} color="#d93025" /></div>
          <div className="metric-info">
            <span className="label">Team Load</span>
            <span className="value">{teamData.length} members</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-wrapper glass-card">
          <div className="chart-header">
            <h3>Visibility vs. Impact Map</h3>
            <p>Monitors alignment between execution and perception</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                <XAxis type="number" dataKey="visibility" stroke="#5f6368" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="impact" stroke="#5f6368" fontSize={10} axisLine={false} tickLine={false} />
                <ZAxis type="number" range={[40, 40]} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={teamData} fill="#1a73e8">
                  {teamData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.impact > 60 && entry.visibility < 40 ? '#188038' : entry.visibility > 70 && entry.impact < 50 ? '#d93025' : '#1a73e8'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-wrapper glass-card">
          <div className="chart-header">
            <h3>Execution Volume</h3>
            <p>Weighted contribution metrics per individual</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={teamData.map(m => ({ name: m.name.split(' ')[0], val: (m.raw?.commits || 0) + (m.raw?.prs || 0) }))}>
                <XAxis dataKey="name" stroke="#5f6368" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#5f6368" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#202124', border: '1px solid #3c4043', fontSize: '12px' }} />
                <Bar dataKey="val" fill="#1a73e8" radius={[2, 2, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-wrapper glass-card">
          <div className="chart-header">
            <h3>Equity Distribution</h3>
            <p>Relative ownership of project success</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={teamData}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="impact"
                  nameKey="name"
                  stroke="none"
                >
                  {teamData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`rgba(26, 115, 232, ${1 - index * 0.12})`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#202124', border: '1px solid #3c4043', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="table-wrapper glass-card full-width">
          <div className="chart-header">
            <h3>Squad Execution Matrix</h3>
            <p>Deep-dive into individual contributor performance levels</p>
          </div>
          <div className="data-table">
            <div className="table-row head">
              <div className="cell member">Collaborator</div>
              <div className="cell tags">Classification</div>
              <div className="cell metric">Impact</div>
              <div className="cell stat">Commits</div>
              <div className="cell stat">PRs</div>
              <div className="cell stat">Merges</div>
              <div className="cell trend">Execution</div>
            </div>
            {teamData.sort((a, b) => b.impact - a.impact).map((m, i) => (
              <div className="table-row" key={i}>
                <div className="cell member">
                  <span className="member-name">{m.name}</span>
                  <span className="member-github">@{m.github || 'no-login'}</span>
                </div>
                <div className="cell tags">
                  <span className={`status-pill ${m.type ? m.type.replace(/\s+/g, '-').toLowerCase() : ''}`}>
                    {m.type}
                  </span>
                </div>
                <div className="cell metric impact">{m.impact}%</div>
                <div className="cell stat">{m.raw?.commits || 0}</div>
                <div className="cell stat">{m.raw?.prs || 0}</div>
                <div className="cell stat">{m.raw?.merged || 0}</div>
                <div className="cell trend">
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: `${m.impact}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <div className="modal-overlay">
            <motion.div className="modal-content glass-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <div className="modal-header">
                <h2>Manage Collaborators</h2>
                <button className="close-btn" onClick={() => setShowEditModal(false)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                {editingMembers.map((m, idx) => (
                  <div key={idx} className="input-group">
                    <input value={m.name} onChange={(e) => handleMemberChange(idx, 'name', e.target.value)} placeholder="Display Name" />
                    <input value={m.github} onChange={(e) => handleMemberChange(idx, 'github', e.target.value)} placeholder="GitHub ID" />
                    <button onClick={() => handleRemoveMember(idx)} className="trash-btn"><Trash2 size={14} /></button>
                  </div>
                ))}
                <button className="add-btn" onClick={handleAddMember}><Plus size={14} /> Add Associate</button>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveTeam} disabled={saving}>{saving ? 'Saving...' : 'Apply Changes'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .dashboard-page { padding: 40px 60px; min-height: 100vh; background: var(--bg-darker); }
        .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .header-left { display: flex; align-items: center; gap: 20px; }
        .btn-back { border: 1px solid var(--border-color); background: transparent; color: white; padding: 6px; border-radius: 6px; cursor: pointer; }
        .breadcrumb { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px; }
        .header-text h1 { font-size: 1.5rem; font-weight: 500; color: #fff; }
        .header-actions { display: flex; gap: 10px; }
        .btn-secondary { background: transparent; border: 1px solid var(--border-color); color: var(--text-muted); padding: 8px 16px; border-radius: 4px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .btn-secondary:hover { border-color: var(--text-main); color: #fff; }

        .metrics-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }
        .metric-card { padding: 20px; display: flex; align-items: center; gap: 16px; }
        .metric-icon { background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; }
        .metric-info .label { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; display: block; margin-bottom: 2px; }
        .metric-info .value { font-size: 1.4rem; font-weight: 500; color: #fff; }

        .dashboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .full-width { grid-column: 1 / -1; }
        .chart-wrapper { display: flex; flex-direction: column; overflow: hidden; }
        .chart-header { padding: 16px 20px; border-bottom: 1px solid var(--border-color); }
        .chart-header h3 { font-size: 0.9rem; font-weight: 500; color: #fff; }
        .chart-header p { font-size: 0.7rem; color: var(--text-dim); margin-top: 2px; }
        .chart-content { padding: 20px 10px 10px 10px; }

        .data-table { width: 100%; }
        .table-row { display: grid; grid-template-columns: 1.5fr 150px 80px 80px 80px 80px 1.2fr; padding: 12px 20px; border-bottom: 1px solid var(--border-color); align-items: center; font-size: 0.85rem; }
        .table-row.head { background: rgba(255,255,255,0.02); color: var(--text-dim); text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; font-weight: 600; }
        .member-name { font-weight: 500; color: #fff; display: block; }
        .member-github { font-size: 0.7rem; color: var(--text-dim); }
        .status-pill { font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); color: var(--text-muted); }
        .status-pill.core-contributor { background: rgba(26,115,232,0.1); color: #8ab4f8; }
        .status-pill.silent-architect { background: rgba(24,128,56,0.1); color: #81c995; }
        .metric.impact { color: var(--primary); font-weight: 600; }
        .cell.stat { font-family: monospace; color: var(--text-muted); text-align: center; }
        .mini-bar-track { height: 4px; background: #3c4043; border-radius: 2px; width: 100%; max-width: 140px; overflow: hidden; }
        .mini-bar-fill { height: 100%; background: var(--primary); }

        .custom-tooltip { background: #202124; border: 1px solid #3c4043; padding: 10px; border-radius: 4px; font-size: 0.75rem; }
        .tooltip-name { font-weight: 600; margin-bottom: 4px; }
        .tooltip-stats { display: flex; flex-direction: column; color: var(--text-dim); }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-content { width: 100%; max-width: 500px; padding: 24px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-header h2 { font-size: 1.1rem; font-weight: 500; }
        .close-btn { background: transparent; border: none; color: var(--text-dim); cursor: pointer; }
        .input-group { display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; margin-bottom: 10px; }
        .input-group input { background: #121212; border: 1px solid #3c4043; padding: 8px 12px; border-radius: 4px; color: #fff; font-size: 0.8rem; outline: none; }
        .input-group input:focus { border-color: var(--primary); }
        .trash-btn { background: rgba(217,48,37,0.1); border: none; color: #f28b82; padding: 8px; border-radius: 4px; cursor: pointer; }
        .add-btn { width: 100%; background: transparent; border: 1px dashed #3c4043; color: var(--text-dim); padding: 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; }
        .add-btn:hover { border-color: var(--text-muted); color: #fff; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
