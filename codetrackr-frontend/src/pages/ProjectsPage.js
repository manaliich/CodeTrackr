import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/projects.css';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planning',
    github_url: '',
    live_url: '',
    technologies: '',
    notes: '',
    start_date: '',
    end_date: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/projects/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setProjects(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (editingProject) {
        // Update existing project
        const response = await axios.put(
          `http://127.0.0.1:8000/api/projects/${editingProject.id}/`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setProjects(prev => prev.map(p => p.id === editingProject.id ? response.data : p));
        setSuccess('Project updated successfully!');
      } else {
        // Create new project
        const response = await axios.post('http://127.0.0.1:8000/api/projects/', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setProjects(prev => [response.data, ...prev]);
        setSuccess('Project added successfully!');
      }
      
      resetForm();
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      ...project,
      start_date: project.start_date || '',
      end_date: project.end_date || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/projects/${projectId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setSuccess('Project deleted successfully!');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'planning',
      github_url: '',
      live_url: '',
      technologies: '',
      notes: '',
      start_date: '',
      end_date: ''
    });
    setEditingProject(null);
    setShowAddForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#3b82f6';
      case 'planning': return '#8b5cf6';
      case 'on_hold': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="projects-root">
        <aside className="projects-sidebar">
          <div className="projects-logo">CodeTrackr</div>
          <nav className="projects-nav">
            <ul>
              <li><a href="/profile"><span className="projects-icon">👤</span>Profile</a></li>
              <li><a href="/dashboard"><span className="projects-icon">🏠</span>Dashboard</a></li>
              <li><a href="/questions"><span className="projects-icon">❓</span>Track Questions</a></li>
              <li className="active"><a href="/projects"><span className="projects-icon">📁</span>Track Projects</a></li>
            </ul>
          </nav>
          <div className="projects-logout"><a href="/logout"><span className="projects-icon">➲</span>Logout</a></div>
        </aside>
        <main className="projects-main">
          <div className="projects-loading">Loading projects...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="projects-root">
      <aside className="projects-sidebar">
        <div className="projects-logo">CodeTrackr</div>
        <nav className="projects-nav">
          <ul>
            <li><a href="/profile"><span className="projects-icon">👤</span>Profile</a></li>
            <li><a href="/dashboard"><span className="projects-icon">🏠</span>Dashboard</a></li>
            <li><a href="/questions"><span className="projects-icon">❓</span>Track Questions</a></li>
            <li className="active"><a href="/projects"><span className="projects-icon">📁</span>Track Projects</a></li>
          </ul>
        </nav>
        <div className="projects-logout"><a href="/logout"><span className="projects-icon">➲</span>Logout</a></div>
      </aside>
      
      <main className="projects-main">
        <div className="projects-header">
          <h1 className="projects-heading">Track Projects</h1>
          <button 
            className="projects-add-btn"
            onClick={() => setShowAddForm(true)}
          >
            + Add Project
          </button>
        </div>

        {error && <div className="projects-message error">{error}</div>}
        {success && <div className="projects-message success">{success}</div>}

        {showAddForm && (
          <div className="projects-modal">
            <div className="projects-modal-content">
              <div className="projects-modal-header">
                <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
                <button className="projects-modal-close" onClick={resetForm}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="projects-form">
                <div className="projects-form-row">
                  <div className="projects-form-group">
                    <label>Project Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="projects-input"
                    />
                  </div>
                  <div className="projects-form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="projects-select"
                    >
                      <option value="planning">Planning</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="projects-form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="projects-textarea"
                    placeholder="Brief description of your project..."
                  />
                </div>

                <div className="projects-form-row">
                  <div className="projects-form-group">
                    <label>GitHub Repository URL</label>
                    <input
                      type="url"
                      name="github_url"
                      value={formData.github_url}
                      onChange={handleInputChange}
                      className="projects-input"
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                  <div className="projects-form-group">
                    <label>Live Demo URL</label>
                    <input
                      type="url"
                      name="live_url"
                      value={formData.live_url}
                      onChange={handleInputChange}
                      className="projects-input"
                      placeholder="https://myproject.com"
                    />
                  </div>
                </div>

                <div className="projects-form-group">
                  <label>Technologies Used</label>
                  <input
                    type="text"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleInputChange}
                    className="projects-input"
                    placeholder="React, Node.js, MongoDB, Express (comma-separated)"
                  />
                </div>

                <div className="projects-form-row">
                  <div className="projects-form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="projects-input"
                    />
                  </div>
                  <div className="projects-form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className="projects-input"
                    />
                  </div>
                </div>

                <div className="projects-form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Add your thoughts, challenges faced, key learnings..."
                    className="projects-textarea"
                  />
                </div>

                <div className="projects-form-actions">
                  <button type="button" onClick={resetForm} className="projects-cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="projects-save-btn">
                    {editingProject ? 'Update Project' : 'Add Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="projects-list">
          {projects.length === 0 ? (
            <div className="projects-empty">
              <div className="projects-empty-icon">📁</div>
              <h3>No Projects Yet</h3>
              <p>Start tracking your coding projects to monitor your development journey!</p>
              <button 
                className="projects-add-btn"
                onClick={() => setShowAddForm(true)}
              >
                Add Your First Project
              </button>
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} className="projects-card">
                <div className="projects-card-header">
                  <div className="projects-card-title">
                    <h3>{project.title}</h3>
                    <span 
                      className="projects-status"
                      style={{ backgroundColor: getStatusColor(project.status) }}
                    >
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="projects-card-actions">
                    <button 
                      onClick={() => handleEdit(project)}
                      className="projects-edit-btn"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="projects-delete-btn"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {project.description && (
                  <p className="projects-card-description">{project.description}</p>
                )}

                {project.technologies && (
                  <div className="projects-technologies">
                    {project.technologies.split(',').map((tech, index) => (
                      <span key={index} className="projects-tech-badge">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="projects-card-links">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="projects-link">
                      🔗 GitHub
                    </a>
                  )}
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="projects-link">
                      🌐 Live Demo
                    </a>
                  )}
                </div>

                {(project.start_date || project.end_date) && (
                  <div className="projects-dates">
                    {project.start_date && (
                      <span className="projects-date">📅 Started: {formatDate(project.start_date)}</span>
                    )}
                    {project.end_date && (
                      <span className="projects-date">🏁 Completed: {formatDate(project.end_date)}</span>
                    )}
                  </div>
                )}

                {project.notes && (
                  <div className="projects-card-notes">
                    <strong>Notes:</strong>
                    <p>{project.notes}</p>
                  </div>
                )}

                <div className="projects-card-footer">
                  <small>Updated: {new Date(project.updated_at).toLocaleDateString()}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default ProjectsPage;