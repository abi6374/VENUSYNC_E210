import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
    User
} from 'lucide-react';

const ProjectSelection = () => {
    const [showModal, setShowModal] = useState(false);
    const [projects, setProjects] = useState([
        { id: '1', name: 'Cloud Infrastructure', members: 12, lastSync: '2h ago' },
        { id: '2', name: 'Mobile App Redesign', members: 8, lastSync: '5h ago' },
        { id: '3', name: 'Payment Gateway API', members: 5, lastSync: '1d ago' },
    ]);
    const [newProject, setNewProject] = useState({ name: '', members: [] });
    const [currentMember, setCurrentMember] = useState({ name: '', github: '', slack: '' });
    const navigate = useNavigate();

    const handleCreateProject = (e) => {
        e.preventDefault();
        const project = {
            id: Date.now().toString(),
            name: newProject.name,
            members: newProject.members.length,
            lastSync: 'Just now'
        };
        setProjects([project, ...projects]);
        setShowModal(false);
        setNewProject({ name: '', members: [] });
    };

    const addMember = () => {
        if (currentMember.name && currentMember.github) {
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
                        <input type="text" placeholder="Search projects..." />
                    </div>
                    <div className="manager-profile" onClick={() => navigate('/dashboard/1')}>
                        <div className="profile-info">
                            <span className="profile-name">Alex Rivera</span>
                            <span className="profile-role">Senior Manager</span>
                        </div>
                        <div className="profile-avatar">AR</div>
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
                <AnimatePresence>
                    {projects.map((project) => (
                        <motion.div
                            key={project.id}
                            className="project-card glass-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            onClick={() => navigate(`/dashboard/${project.id}`)}
                        >
                            <div className="card-icon">
                                <CreditCard size={24} className="text-primary" />
                            </div>
                            <h3>{project.name}</h3>
                            <div className="card-meta">
                                <span><User size={14} /> {project.members} Members</span>
                                <span>Synced {project.lastSync}</span>
                            </div>
                            <div className="card-footer">
                                <span className="view-link">View Dashboard <ChevronRight size={16} /></span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
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
                                        value={newProject.name}
                                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="members-section">
                                    <label>Add Team Members</label>
                                    <div className="member-input-row">
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            value={currentMember.name}
                                            onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
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
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={!newProject.name}>
                                        Initialize Project
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx>{`
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
      `}</style>
        </div>
    );
};

export default ProjectSelection;
