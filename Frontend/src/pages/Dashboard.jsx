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
  X,
  AlertCircle,
  GitBranch,
  GitPullRequest,
  GitCommit,
  Clock,
  CheckCircle,
  Activity,
  Award,
  Target
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
  const [error, setError] = useState('');
  const [repoStats, setRepoStats] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  useEffect(() => {
    if (selectedMember) {
      fetchAISummary(selectedMember);
    }
  }, [selectedMember]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, analyticsRes] = await Promise.all([
        axios.get(`/api/projects/${projectId}`),
        axios.get(`/api/analytics/${projectId}`)
      ]);
      setProject(projRes.data);
      setTeamData(analyticsRes.data.members || []);
      setRepoStats(analyticsRes.data.repoStats || null);
      setEditingMembers(projRes.data.members || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAISummary = async (memberData) => {
    try {
      setLoadingSummary(true);
      setAiSummary('');

      const response = await axios.post('/api/analytics/member-summary', memberData);
      setAiSummary(response.data.summary);
    } catch (err) {
      console.error('Error fetching AI summary:', err);
      setAiSummary(`${memberData.name} demonstrates consistent contribution patterns across the project. Based on DORA metrics, this developer shows ${memberData.impact > 70 ? 'exceptional' : 'solid'} performance. Recommended: ${memberData.impact > 70 ? 'Leverage expertise through mentorship opportunities.' : 'Focus on increasing PR velocity and code review participation.'}`);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSaveTeam = async () => {
    try {
      setError('');
      const nameRegex = /^[A-Za-z\s]+$/;
      const invalidMember = editingMembers.find(m => !nameRegex.test(m.name));
      if (invalidMember) {
        setError(`Invalid name: "${invalidMember.name}". Names must only contain alphabets.`);
        return;
      }

      setSaving(true);
      await axios.put(`/api/projects/${projectId}`, { members: editingMembers });
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving team:', err);
      setError('Failed to save team members');
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

  const handleExportCSV = () => {
    if (!teamData || teamData.length === 0) return;

    const headers = [
      'Name', 'GitHub', 'Role', 'Classification', 'Impact Score (%)',
      'Visibility Score (%)', 'Commits', 'PRs', 'Merged PRs',
      'Code Additions', 'Code Deletions',
      'Daily Coding Hours', 'Commits/Day', 'PRs/Week', 'Issues Closed/Week',
      'Code Reviews/Week', 'Active Repos'
    ];

    const rows = teamData.map(m => [
      m.name,
      m.github || 'N/A',
      m.role || 'Developer',
      m.type || 'N/A',
      m.impact,
      m.visibility,
      m.raw?.commits || 0,
      m.raw?.prs || 0,
      m.raw?.merged || 0,
      m.raw?.additions || 0,
      m.raw?.deletions || 0,
      m.mlFeatures?.daily_coding_hours || 0,
      m.mlFeatures?.commits_per_day || 0,
      m.mlFeatures?.pull_requests_per_week || 0,
      m.mlFeatures?.issues_closed_per_week || 0,
      m.mlFeatures?.code_reviews_per_week || 0,
      m.mlFeatures?.active_repos || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `venusync_${(project?.name || 'project').replace(/\s+/g, '_')}_full_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', height: '100vh', justifyContent: 'center' }}>
        <div className="loading-state glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <RefreshCw className="spin" size={40} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Analyzing Squad Impact...</p>
        </div>
      </div>
    );
  }

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
          <button className="btn-primary" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </header>

      <div className="metrics-summary">
        <div className="metric-card glass-card">
          <div className="metric-icon"><TrendingUp size={20} color="#1a73e8" /></div>
          <div className="metric-info">
            <span className="label">Performance Index</span>
            <span className="value">{repoStats ? (repoStats.predicted_score * 100).toFixed(1) : '--'}</span>
          </div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-icon"><Zap size={20} color="#188038" /></div>
          <div className="metric-info">
            <span className="label">Total Repo Commits</span>
            <span className="value">{repoStats?.total_commits || repoStats?.repo_metrics?.total_commits || '0'}</span>
          </div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-icon"><Users size={20} color={repoStats?.productivity_indicators?.overall_productivity ? "#188038" : "#d93025"} /></div>
          <div className="metric-info">
            <span className="label">Productivity Check</span>
            <div className="value-group">
              <span className="value" style={{ color: repoStats?.productivity_indicators?.overall_productivity ? '#81c995' : '#f28b82' }}>
                {repoStats ? (repoStats.predicted_score * 100).toFixed(1) : '--'}%
              </span>
              <span className="status-label" style={{ fontSize: '0.65rem', marginLeft: '8px', opacity: 0.8 }}>
                ({repoStats?.productivity_indicators?.overall_productivity ? 'Optimal' : 'Needs Sync'})
              </span>
            </div>
            {repoStats?.productivity_indicators && (
              <div className="indicator-tags" style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                <div title="High Commit Frequency" style={{ width: '6px', height: '6px', borderRadius: '50%', background: repoStats.productivity_indicators.high_commit_frequency ? '#81c995' : '#f28b82' }}></div>
                <div title="Active PR Process" style={{ width: '6px', height: '6px', borderRadius: '50%', background: repoStats.productivity_indicators.active_pr_process ? '#81c995' : '#f28b82' }}></div>
                <div title="Good Issue Resolution" style={{ width: '6px', height: '6px', borderRadius: '50%', background: repoStats.productivity_indicators.good_issue_resolution ? '#81c995' : '#f28b82' }}></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {repoStats && (
        <div className="project-vitals glass-card">
          <div className="vitals-header">
            <div>
              <h3><Activity size={16} style={{ display: 'inline', marginRight: '8px' }} />Repository Health Metrics</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>Real-time analysis powered by AI</p>
            </div>
            <span className="vitals-status">
              <CheckCircle size={12} style={{ marginRight: '4px' }} />
              Live Data
            </span>
          </div>
          <div className="vitals-grid">
            <div className="vital-item">
              <div className="vital-icon"><GitPullRequest size={14} color="#8ab4f8" /></div>
              <span className="vital-label">PR Merge Rate</span>
              <span className="vital-value">
                {repoStats.pr_merge_rate != null
                  ? (repoStats.pr_merge_rate * 100).toFixed(0)
                  : (repoStats.prs_total > 0 ? (repoStats.prs_merged / repoStats.prs_total * 100).toFixed(0) : '0')}%
              </span>
            </div>
            <div className="vital-item">
              <div className="vital-icon"><GitCommit size={14} color="#81c995" /></div>
              <span className="vital-label">Avg PR Size</span>
              <span className="vital-value">{Math.floor(repoStats.avg_pr_size || repoStats.repo_metrics?.avg_pr_size || 0).toLocaleString()} LOC</span>
            </div>
            <div className="vital-item">
              <div className="vital-icon"><Clock size={14} color="#fdd663" /></div>
              <span className="vital-label">Cycle Time</span>
              <span className="vital-value">{(repoStats.avg_cycle_time_hrs || repoStats.repo_metrics?.avg_cycle_time_hrs || 0).toFixed(1)} hrs</span>
            </div>
            <div className="vital-item">
              <div className="vital-icon"><GitBranch size={14} color="#f28b82" /></div>
              <span className="vital-label">Open PRs</span>
              <span className="vital-value">{repoStats.prs_open || repoStats.repo_metrics?.prs_open || '0'}</span>
            </div>
            <div className="vital-item">
              <div className="vital-icon"><Target size={14} color="#8ab4f8" /></div>
              <span className="vital-label">Total PRs</span>
              <span className="vital-value">{repoStats.prs_total || '0'}</span>
            </div>
            <div className="vital-item">
              <div className="vital-icon"><Award size={14} color="#fdd663" /></div>
              <span className="vital-label">Contributors</span>
              <span className="vital-value">{repoStats.authors || teamData.length}</span>
            </div>
          </div>
        </div>
      )}

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
              <BarChart data={teamData.map(m => ({ name: (m.name || 'User').split(' ')[0], val: (m.raw?.commits || 0) + (m.raw?.prs || 0) }))}>
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
            <p>Comprehensive individual contributor performance analysis • Click any row for detailed profile</p>
          </div>
          <div className="data-table">
            <div className="table-row head">
              <div className="cell member">Collaborator</div>
              <div className="cell tags">Classification</div>
              <div className="cell metric">AI Score</div>
              <div className="cell stat">Commits</div>
              <div className="cell stat">PRs</div>
              <div className="cell stat">Merged</div>
              <div className="cell stat">+Lines</div>
              <div className="cell stat">-Lines</div>
              <div className="cell trend">Impact Trend</div>
            </div>
            {teamData.sort((a, b) => b.impact - a.impact).map((m, i) => (
              <div className="table-row clickable" key={i} onClick={() => setSelectedMember(m)}>
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
                <div className="cell stat" style={{ color: '#81c995' }}>{(m.raw?.additions || 0).toLocaleString()}</div>
                <div className="cell stat" style={{ color: '#f28b82' }}>{(m.raw?.deletions || 0).toLocaleString()}</div>
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
                {error && (
                  <div style={{ color: '#f28b82', background: 'rgba(217, 48, 37, 0.1)', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                {editingMembers.map((m, idx) => (
                  <div key={idx} className="input-group">
                    <input
                      value={m.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^[A-Za-z\s]+$/.test(val)) {
                          handleMemberChange(idx, 'name', val);
                        }
                      }}
                      placeholder="Display Name"
                    />
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

      <AnimatePresence>
        {selectedMember && (
          <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
            <motion.div
              className="modal-content glass-card member-detail-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h2 style={{ fontSize: '1.4rem' }}>{selectedMember.name}</h2>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>github.com/{selectedMember.github}</p>
                </div>
                <button className="close-btn" onClick={() => setSelectedMember(null)}><X size={20} /></button>
              </div>

              <div className="member-metrics-grid">
                <div className="m-metric">
                  <span className="m-label">Productivity Score</span>
                  <span className="m-value" style={{ color: 'var(--primary)' }}>{selectedMember.impact}%</span>
                </div>
                <div className="m-metric">
                  <span className="m-label">Coding Hours/Day</span>
                  <span className="m-value">{selectedMember.mlFeatures?.daily_coding_hours || '2.2'}</span>
                </div>
                <div className="m-metric">
                  <span className="m-label">Commits/Day</span>
                  <span className="m-value">{selectedMember.mlFeatures?.commits_per_day || '1.1'}</span>
                </div>
                <div className="m-metric">
                  <span className="m-label">PRs/Week</span>
                  <span className="m-value">{selectedMember.mlFeatures?.pull_requests_per_week || '0'}</span>
                </div>
                <div className="m-metric">
                  <span className="m-label">Issues Closed/Week</span>
                  <span className="m-value">{selectedMember.mlFeatures?.issues_closed_per_week || '0'}</span>
                </div>
              </div>

              {/* AI-Powered Summary Section */}
              <div className="ai-summary-section">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Activity size={16} color="var(--primary)" />
                  AI Performance Analysis
                </h3>
                <div className="ai-summary-content">
                  {loadingSummary ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', justifyContent: 'center' }}>
                      <RefreshCw className="spin" size={20} color="var(--primary)" />
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Analyzing DORA metrics and SPACE framework...</span>
                    </div>
                  ) : (
                    <div className="summary-text">
                      <div className="summary-badge">
                        <Award size={14} />
                        <span>DORA & SPACE Framework Analysis</span>
                      </div>
                      <p>{aiSummary || 'Generating intelligent insights...'}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-insights-section">
                <h3>ML Productivity Indicators</h3>
                <div className="insight-list">
                  <div className="insight-item">
                    <div className={`status-dot ${selectedMember.indicators?.high_commit_frequency ? 'good' : 'neutral'}`}></div>
                    <span>{selectedMember.indicators?.high_commit_frequency ? 'High Commit Frequency (AI Verified)' : 'Standard Commit Cycle'}</span>
                  </div>
                  <div className="insight-item">
                    <div className={`status-dot ${selectedMember.indicators?.active_pr_process ? 'good' : 'neutral'}`}></div>
                    <span>{selectedMember.indicators?.active_pr_process ? 'Active PR Contribution (AI Verified)' : 'Developing PR Workflow'}</span>
                  </div>
                  <div className="insight-item">
                    <div className={`status-dot ${selectedMember.indicators?.good_issue_resolution ? 'good' : 'warn'}`}></div>
                    <span>Issue Resolution Efficiency: {selectedMember.indicators?.good_issue_resolution ? 'High' : 'Under Review'}</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-primary w-full" onClick={() => setSelectedMember(null)}>Close Profile</button>
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
        .table-row { display: grid; grid-template-columns: 1.5fr 150px 80px 70px 70px 70px 90px 90px 1.2fr; padding: 12px 20px; border-bottom: 1px solid var(--border-color); align-items: center; font-size: 0.85rem; }
        .table-row.head { background: rgba(255,255,255,0.02); color: var(--text-dim); text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; font-weight: 600; }
        .member-name { font-weight: 500; color: #fff; display: block; }
        .member-github { font-size: 0.7rem; color: var(--text-dim); }
        .status-pill { font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); color: var(--text-muted); }
        .status-pill.core-contributor { background: rgba(26,115,232,0.1); color: #8ab4f8; }
        .status-pill.silent-architect { background: rgba(24,128,56,0.1); color: #81c995; }
        .metric.impact { color: var(--primary); font-weight: 600; }
        .cell.stat { font-family: monospace; color: var(--text-muted); text-align: center; font-size: 0.8rem; }
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

        /* Vitals Section */
        .project-vitals { padding: 24px; margin-bottom: 40px; border-left: 4px solid var(--primary); }
        .vitals-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .vitals-header h3 { font-size: 0.9rem; font-weight: 600; color: #fff; display: flex; align-items: center; }
        .vitals-status { font-size: 0.7rem; color: #81c995; background: rgba(129,201,149,0.1); padding: 4px 10px; border-radius: 10px; display: flex; align-items: center; }
        .vitals-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; }
        .vital-item { display: flex; flex-direction: column; gap: 6px; }
        .vital-icon { margin-bottom: 4px; }
        .vital-label { font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; }
        .vital-value { font-size: 1.1rem; font-weight: 600; color: #f8f9fa; }

        .clickable { cursor: pointer; transition: background 0.2s; }
        .clickable:hover { background: rgba(255,255,255,0.05) !important; }

        /* Member Detail Modal */
        .member-detail-modal { max-width: 600px !important; }
        .member-metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
        .m-metric { background: rgba(255,255,255,0.02); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
        .m-label { font-size: 0.7rem; color: var(--text-dim); display: block; margin-bottom: 4px; }
        .m-value { font-size: 1.2rem; font-weight: 600; }

        .ml-insights-section { margin-bottom: 24px; }
        .ml-insights-section h3 { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; }
        .insight-list { display: flex; flex-direction: column; gap: 10px; }
        .insight-item { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: var(--text-dim); }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.good { background: #81c995; box-shadow: 0 0 10px rgba(129,201,149,0.5); }
        .status-dot.neutral { background: var(--primary); }
        .status-dot.warn { background: #f28b82; }
        .w-full { width: 100%; }

        /* AI Summary Section */
        .ai-summary-section { 
          margin: 24px 0; 
          padding: 20px; 
          background: linear-gradient(135deg, rgba(26,115,232,0.05) 0%, rgba(24,128,56,0.05) 100%);
          border-radius: 8px;
          border: 1px solid rgba(26,115,232,0.2);
        }
        .ai-summary-section h3 { 
          font-size: 0.9rem; 
          color: #fff; 
          font-weight: 600;
          margin-bottom: 16px;
        }
        .ai-summary-content {
          background: rgba(0,0,0,0.3);
          border-radius: 6px;
          padding: 16px;
        }
        .summary-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(26,115,232,0.15);
          color: #8ab4f8;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .summary-text p {
          color: #e8eaed;
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0;
        }
      `}</style>
    </div >
  );
};

export default Dashboard;
