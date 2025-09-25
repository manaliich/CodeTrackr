import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/questions.css';

function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    status: 'not_started',
    platform: '',
    problem_url: '',
    solution_url: '',
    notes: '',
    time_spent: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/questions/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setQuestions(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions');
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
      if (editingQuestion) {
        // Update existing question
        const response = await axios.put(
          `http://127.0.0.1:8000/api/questions/${editingQuestion.id}/`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? response.data : q));
        setSuccess('Question updated successfully!');
      } else {
        // Create new question
        const response = await axios.post('http://127.0.0.1:8000/api/questions/', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setQuestions(prev => [response.data, ...prev]);
        setSuccess('Question added successfully!');
      }
      
      resetForm();
    } catch (err) {
      console.error('Error saving question:', err);
      setError('Failed to save question');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData(question);
    setShowAddForm(true);
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/questions/${questionId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      setSuccess('Question deleted successfully!');
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'easy',
      status: 'not_started',
      platform: '',
      problem_url: '',
      solution_url: '',
      notes: '',
      time_spent: 0
    });
    setEditingQuestion(null);
    setShowAddForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'needs_revision': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="questions-root">
        <aside className="questions-sidebar">
          <div className="questions-logo">CodeTrackr</div>
          <nav className="questions-nav">
            <ul>
              <li><a href="/profile"><span className="questions-icon">👤</span>Profile</a></li>
              <li><a href="/dashboard"><span className="questions-icon">🏠</span>Dashboard</a></li>
              <li className="active"><a href="/questions"><span className="questions-icon">❓</span>Track Questions</a></li>
              <li><a href="/projects"><span className="questions-icon">📁</span>Track Projects</a></li>
            </ul>
          </nav>
          <div className="questions-logout"><a href="/logout"><span className="questions-icon">➲</span>Logout</a></div>
        </aside>
        <main className="questions-main">
          <div className="questions-loading">Loading questions...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="questions-root">
      <aside className="questions-sidebar">
        <div className="questions-logo">CodeTrackr</div>
        <nav className="questions-nav">
          <ul>
            <li><a href="/profile"><span className="questions-icon">👤</span>Profile</a></li>
            <li><a href="/dashboard"><span className="questions-icon">🏠</span>Dashboard</a></li>
            <li className="active"><a href="/questions"><span className="questions-icon">❓</span>Track Questions</a></li>
            <li><a href="/projects"><span className="questions-icon">📁</span>Track Projects</a></li>
          </ul>
        </nav>
        <div className="questions-logout"><a href="/logout"><span className="questions-icon">➲</span>Logout</a></div>
      </aside>
      
      <main className="questions-main">
        <div className="questions-header">
          <h1 className="questions-heading">Track Questions</h1>
          <button 
            className="questions-add-btn"
            onClick={() => setShowAddForm(true)}
          >
            + Add Question
          </button>
        </div>

        {error && <div className="questions-message error">{error}</div>}
        {success && <div className="questions-message success">{success}</div>}

        {showAddForm && (
          <div className="questions-modal">
            <div className="questions-modal-content">
              <div className="questions-modal-header">
                <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
                <button className="questions-modal-close" onClick={resetForm}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="questions-form">
                <div className="questions-form-row">
                  <div className="questions-form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="questions-input"
                    />
                  </div>
                  <div className="questions-form-group">
                    <label>Platform</label>
                    <input
                      type="text"
                      name="platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      placeholder="LeetCode, HackerRank, etc."
                      className="questions-input"
                    />
                  </div>
                </div>

                <div className="questions-form-row">
                  <div className="questions-form-group">
                    <label>Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="questions-select"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="questions-form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="questions-select"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="needs_revision">Needs Revision</option>
                    </select>
                  </div>
                </div>

                <div className="questions-form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="questions-textarea"
                  />
                </div>

                <div className="questions-form-row">
                  <div className="questions-form-group">
                    <label>Problem URL</label>
                    <input
                      type="url"
                      name="problem_url"
                      value={formData.problem_url}
                      onChange={handleInputChange}
                      className="questions-input"
                    />
                  </div>
                  <div className="questions-form-group">
                    <label>Solution URL</label>
                    <input
                      type="url"
                      name="solution_url"
                      value={formData.solution_url}
                      onChange={handleInputChange}
                      className="questions-input"
                    />
                  </div>
                </div>

                <div className="questions-form-group">
                  <label>Time Spent (minutes)</label>
                  <input
                    type="number"
                    name="time_spent"
                    value={formData.time_spent}
                    onChange={handleInputChange}
                    min="0"
                    className="questions-input"
                  />
                </div>

                <div className="questions-form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Add your thoughts, approach, key learnings..."
                    className="questions-textarea"
                  />
                </div>

                <div className="questions-form-actions">
                  <button type="button" onClick={resetForm} className="questions-cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="questions-save-btn">
                    {editingQuestion ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="questions-list">
          {questions.length === 0 ? (
            <div className="questions-empty">
              <div className="questions-empty-icon">❓</div>
              <h3>No Questions Yet</h3>
              <p>Start tracking your coding questions to monitor your progress!</p>
              <button 
                className="questions-add-btn"
                onClick={() => setShowAddForm(true)}
              >
                Add Your First Question
              </button>
            </div>
          ) : (
            questions.map(question => (
              <div key={question.id} className="questions-card">
                <div className="questions-card-header">
                  <div className="questions-card-title">
                    <h3>{question.title}</h3>
                    {question.platform && (
                      <span className="questions-platform">{question.platform}</span>
                    )}
                  </div>
                  <div className="questions-card-actions">
                    <button 
                      onClick={() => handleEdit(question)}
                      className="questions-edit-btn"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(question.id)}
                      className="questions-delete-btn"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="questions-card-meta">
                  <span 
                    className="questions-status"
                    style={{ backgroundColor: getStatusColor(question.status) }}
                  >
                    {question.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span 
                    className="questions-difficulty"
                    style={{ backgroundColor: getDifficultyColor(question.difficulty) }}
                  >
                    {question.difficulty.toUpperCase()}
                  </span>
                  {question.time_spent > 0 && (
                    <span className="questions-time">⏱️ {formatTime(question.time_spent)}</span>
                  )}
                </div>

                {question.description && (
                  <p className="questions-card-description">{question.description}</p>
                )}

                <div className="questions-card-links">
                  {question.problem_url && (
                    <a href={question.problem_url} target="_blank" rel="noopener noreferrer" className="questions-link">
                      🔗 Problem
                    </a>
                  )}
                  {question.solution_url && (
                    <a href={question.solution_url} target="_blank" rel="noopener noreferrer" className="questions-link">
                      💡 Solution
                    </a>
                  )}
                </div>

                {question.notes && (
                  <div className="questions-card-notes">
                    <strong>Notes:</strong>
                    <p>{question.notes}</p>
                  </div>
                )}

                <div className="questions-card-footer">
                  <small>Updated: {new Date(question.updated_at).toLocaleDateString()}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default QuestionsPage;