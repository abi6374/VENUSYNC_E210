import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FolderPlus,
  Search,
  LayoutGrid,
  List,
  Plus,
  Github,
  Slack,
  X,
  CreditCard,
  ChevronRight,
  User,
  AlertCircle,
  Trash2,
  CheckCircle
} from 'lucide-react';

const ProjectSelection = () => {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([
    { id: '1', name: 'Cloud Infrastructure', members: 12, lastSync: '2h ago' },
    { id: '2', name: 'Mobile App Redesign', members: 8, lastSync: '5h ago' },
    { id: '3', name: 'Payment Gateway API', members: 5, lastSync: '1d ago' },
  ]);
  const [newProject, setNewProject] = useState({ name: '', repository: '', members: [] });
  const [currentMember, setCurrentMember] = useState({ name: '', github: '', slack: '' });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = {};
    if (!newProject.name.trim()) errors.name = 'Project name is required';
    if (!newProject.repository.trim()) errors.repository = 'GitHub repository is required';

    let finalMembers = [...newProject.members];
    if (currentMember.name && currentMember.github) {
      finalMembers.push(currentMember);
    }
    if (finalMembers.length === 0) errors.members = 'At least one team member is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      // URL Cleanup
      let repoPath = newProject.repository.trim();

      // Auto-extract owner/repo if full URL is pasted
      if (repoPath.includes('github.com')) {
        const parts = repoPath.replace(/\/$/, '').split('/');
        if (parts.length >= 2) {
          repoPath = `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
        }
      }

      const nameRegex = /^[A-Za-z\s]+$/;
      const invalidMember = finalMembers.find(m => !nameRegex.test(m.name));
      if (invalidMember) {
        setFieldErrors({ members: `Invalid name: "${invalidMember.name}". Only alphabets allowed.` });
        setSubmitting(false);
        return;
      }

      const response = await axios.post('/api/projects', {
        name: newProject.name,
        repository: repoPath,
        members: finalMembers
      });

      setProjects([response.data, ...projects]);
      setShowModal(false);
      setNewProject({ name: '', repository: '', members: [] });
      setCurrentMember({ name: '', github: '', slack: '' });
    } catch (error) {
      console.error('Error creating project:', error);
      setFieldErrors({
        members: 'Failed to create project. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addMember = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    if (currentMember.name && currentMember.github) {
      if (!nameRegex.test(currentMember.name)) {
        setFieldErrors({ members: 'Team member name must only contain alphabets.' });
        return;
      }
      setFieldErrors({});
      setNewProject({
        ...newProject,
        members: [...newProject.members, currentMember]
      });
      setCurrentMember({ name: '', github: '', slack: '' });
    }
  };

  const removeMember = (index) => {
    const updatedMembers = [...newProject.members];
    updatedMembers.splice(index, 1);
    setNewProject({ ...newProject, members: updatedMembers });
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`/api/projects/${projectId}`);
      setProjects(projects.filter(p => (p._id || p.id) !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete project';
      alert(errorMessage);
    }
  };

  const handleToggleStatus = async (e, project) => {
    e.stopPropagation();
    const newStatus = project.status === 'completed' ? 'active' : 'completed';
    try {
      const response = await axios.patch(`/api/projects/${project._id || project.id}/status`, { status: newStatus });
      setProjects(projects.map(p => (p._id || p.id) === (project._id || project.id) ? response.data : p));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return 0;
  });

  const filteredProjects = sortedProjects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="projects-page">
      <header className="page-header">
        <div className="header-left">
          <h1>My Squads</h1>
          <p>Select a project to view impact metrics</p>
        </div>
        <div className="header-right">
          <div className="search-bar glass">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="manager-profile">
            <div className="profile-info">
              <span className="profile-name">{user?.name || 'Alex Rivera'}</span>
              <span className="profile-role">{user?.role || 'Senior Manager'}</span>
            </div>
            <div className="profile-avatar">
              {(user?.name || 'Alex Rivera').split(' ').map(n => n[0]).join('')}
            </div>
            <button className="btn-logout" onClick={() => {
              localStorage.removeItem('user');
              navigate('/');
            }}>Logout</button>
          </div>
        </div>
      </header>

      <div className="actions-bar">
        <div className="view-toggles">
          <button className="btn-icon active"><LayoutGrid size={20} /></button>
          <button className="btn-icon"><List size={20} /></button>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="project-grid">
        {loading ? (
          <div className="loading-state glass-card">
            <div className="spinner"></div>
            <p>Syncing Squads...</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project._id || project.id}
                className={`project-card glass-card ${project.status === 'completed' ? 'completed' : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/dashboard/${project._id || project.id}`)}
              >
                <div className="card-header-actions">
                  <div className={`status-badge ${project.status || 'active'}`}>
                    {project.status === 'completed' ? 'Completed' : 'Active'}
                  </div>
                  <button className="btn-icon-delete" onClick={(e) => handleDeleteProject(e, project._id || project.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="card-body">
                  <div className="card-icon">
                    <CreditCard size={24} className="text-primary" />
                  </div>
                  <h3>{project.name}</h3>
                  <div className="card-meta">
                    <span><User size={14} /> {Array.isArray(project.members) ? project.members.length : project.members} Members</span>
                    <span>Synced {project.lastSync || 'Recently'}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <span className="view-link">View Dashboard <ChevronRight size={16} /></span>
                  <button
                    className={`btn-status ${project.status === 'completed' ? 'mark-active' : 'mark-complete'}`}
                    onClick={(e) => handleToggleStatus(e, project)}
                  >
                    {project.status === 'completed' ? 'Reactivate' : 'Mark Completed'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-content glass-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <div className="modal-header">
                <h2>Create New Project</h2>
                <button className="btn-close" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>

              <form onSubmit={handleCreateProject} className="modal-form">
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Venusync Core"
                    className={fieldErrors.name ? 'input-error' : ''}
                    value={newProject.name}
                    onChange={(e) => {
                      setNewProject({ ...newProject, name: e.target.value });
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                    }}
                  />
                  {fieldErrors.name && <span className="error-text">{fieldErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label>GitHub Repository (owner/repo)</label>
                  <input
                    type="text"
                    placeholder="e.g. facebook/react"
                    className={fieldErrors.repository ? 'input-error' : ''}
                    value={newProject.repository}
                    onChange={(e) => {
                      setNewProject({ ...newProject, repository: e.target.value });
                      if (fieldErrors.repository) setFieldErrors({ ...fieldErrors, repository: '' });
                    }}
                  />
                  {fieldErrors.repository && <span className="error-text">{fieldErrors.repository}</span>}
                </div>

                <div className="members-section">
                  <label>Add Team Members</label>
                  <div className="member-input-row">
                    <input
                      type="text"
                      placeholder="Name"
                      value={currentMember.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^[A-Za-z\s]+$/.test(val)) {
                          setCurrentMember({ ...currentMember, name: val });
                        }
                      }}
                    />
                    <div className="input-with-icon">
                      <Github size={16} />
                      <input
                        type="text"
                        placeholder="GitHub Username"
                        value={currentMember.github}
                        onChange={(e) => setCurrentMember({ ...currentMember, github: e.target.value })}
                      />
                    </div>
                    <div className="input-with-icon">
                      <Slack size={16} />
                      <input
                        type="text"
                        placeholder="Slack ID"
                        value={currentMember.slack}
                        onChange={(e) => setCurrentMember({ ...currentMember, slack: e.target.value })}
                      />
                    </div>
                    <button type="button" className="btn-add" onClick={addMember}>
                      <Plus size={20} />
                    </button>
                  </div>
                  {fieldErrors.members && <span className="error-text" style={{ marginTop: '8px', display: 'block' }}>{fieldErrors.members}</span>}

                  <div className="members-list">
                    {newProject.members.map((m, i) => (
                      <div key={i} className="member-tag glass">
                        <span>{m.name}</span>
                        <button type="button" onClick={() => removeMember(i)}><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => {
                    setShowModal(false);
                    setFieldErrors({});
                  }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Initializing...' : 'Initialize Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .projects-page {
          padding: 40px 80px;
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .header-left h1 {
          font-size: 2.5rem;
          margin-bottom: 4px;
        }

        .header-left p {
          color: var(--text-dim);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          border-radius: 100px;
          width: 300px;
        }

        .search-bar input {
          background: transparent;
          border: none;
          color: white;
          width: 100%;
          outline: none;
        }

        .manager-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 6px;
          border-radius: 40px;
          transition: var(--transition-smooth);
        }

        .manager-profile:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .profile-name {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .profile-role {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .profile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .btn-logout {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
          margin-left: 10px;
        }

        .btn-logout:hover {
          background: rgba(234, 67, 53, 0.1);
          color: #ea4335;
          border-color: rgba(234, 67, 53, 0.2);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        .actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .view-toggles {
          display: flex;
          background: var(--glass-bg);
          padding: 4px;
          border-radius: 10px;
          gap: 4px;
        }

        .btn-icon {
          background: transparent;
          border: none;
          color: var(--text-dim);
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
        }

        .btn-icon.active {
          background: var(--glass-border);
          color: white;
        }

        .project-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .project-card {
          padding: 24px;
          cursor: pointer;
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(66, 133, 244, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .project-card h3 {
          font-size: 1.3rem;
          margin-bottom: 12px;
        }

        .card-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: var(--text-dim);
          font-size: 0.9rem;
          margin-bottom: 20px;
        }

        .card-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .project-card.completed {
          opacity: 0.6;
          filter: grayscale(0.4);
        }

        .card-header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .status-badge {
          font-size: 0.7rem;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
        }

        .status-badge.active { background: rgba(52, 168, 83, 0.1); color: #34a853; }
        .status-badge.completed { background: rgba(255, 255, 255, 0.1); color: var(--text-muted); }

        .btn-icon-delete {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn-icon-delete:hover { color: #f28b82; }

        .btn-status {
          font-size: 0.75rem;
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn-status:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .btn-status.mark-active:hover {
          border-color: #34a853;
          color: #34a853;
        }

        .view-link {
          color: var(--primary);
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          width: 100%;
          max-width: 650px;
          padding: 40px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .btn-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          padding: 12px 16px;
          border-radius: 10px;
          color: white;
          margin-top: 8px;
        }

        .form-group input.input-error {
          border-color: #f28b82;
          background: rgba(217, 48, 37, 0.05);
        }

        .error-text {
          color: #f28b82;
          font-size: 0.75rem;
          margin-top: 4px;
          display: block;
        }

        .members-section label {
          display: block;
          margin-bottom: 12px;
        }

        .member-input-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 50px;
          gap: 12px;
          margin-bottom: 16px;
        }

        .member-input-row input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          padding: 10px 12px;
          border-radius: 8px;
          color: white;
          width: 100%;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon :global(svg) {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
        }

        .input-with-icon input {
          padding-left: 36px !important;
        }

        .btn-add {
          background: var(--primary);
          border: none;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .members-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          min-height: 40px;
        }

        .member-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 0.85rem;
        }

        .member-tag button {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 10px;
        }

        @media (max-width: 900px) {
          .projects-page { padding: 40px; }
          .member-input-row { grid-template-columns: 1fr; }
        }

        .loading-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          gap: 20px;
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

export default ProjectSelection;
