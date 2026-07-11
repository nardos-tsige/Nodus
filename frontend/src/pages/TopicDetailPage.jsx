// src/pages/TopicDetailPage.jsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Edit2, X, Sparkles } from 'lucide-react'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'
import ResourceList from '../components/ResourceList'
import NoteList from '../components/NoteList'
import ConfirmDialog from '../components/ConfirmDialog'

function TopicDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [topic, setTopic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [newResource, setNewResource] = useState({ url: '', label: '' })
  const [newNote, setNewNote] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchTopic()
  }, [id])

  const fetchTopic = async () => {
    try {
      const res = await api.getTopic(id)
      setTopic(res.data)
      setEditTitle(res.data.title)
      setEditDescription(res.data.description || '')
    } catch (err) {
      setError('Failed to load topic')
    } finally {
      setLoading(false)
    }
  }

  const handleAddResource = async (e) => {
    e.preventDefault()
    if (!newResource.url || !newResource.label) return

    try {
      const res = await api.createResource(topic.id, newResource)
      setTopic({
        ...topic,
        resources: [...topic.resources, res.data]
      })
      setNewResource({ url: '', label: '' })
      setShowResourceForm(false)
    } catch (err) {
      setError('Failed to add resource')
    }
  }

  const handleDeleteResource = async (resourceId) => {
    try {
      await api.deleteResource(resourceId)
      setTopic({
        ...topic,
        resources: topic.resources.filter(r => r.id !== resourceId)
      })
    } catch (err) {
      setError('Failed to delete resource')
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      const res = await api.createNote(topic.id, { body: newNote.trim() })
      setTopic({
        ...topic,
        notes: [...topic.notes, res.data]
      })
      setNewNote('')
      setShowNoteForm(false)
    } catch (err) {
      setError('Failed to add note')
    }
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await api.deleteNote(noteId)
      setTopic({
        ...topic,
        notes: topic.notes.filter(n => n.id !== noteId)
      })
    } catch (err) {
      setError('Failed to delete note')
    }
  }

  const handleUpdateNote = async (noteId, data) => {
    try {
      const res = await api.updateNote(noteId, data)
      setTopic({
        ...topic,
        notes: topic.notes.map(n =>
          n.id === noteId ? res.data : n
        )
      })
    } catch (err) {
      setError('Failed to update note')
    }
  }

  const handleUpdateTitle = async () => {
    if (!editTitle.trim()) return
    try {
      const res = await api.updateTopic(topic.id, { title: editTitle.trim() })
      setTopic({ ...topic, title: res.data.title })
      setIsEditingTitle(false)
    } catch (err) {
      setError('Failed to update title')
    }
  }

  const handleUpdateDescription = async () => {
    try {
      const res = await api.updateTopic(topic.id, { description: editDescription.trim() || null })
      setTopic({ ...topic, description: res.data.description })
      setIsEditingDescription(false)
    } catch (err) {
      setError('Failed to update description')
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.updateTopic(topic.id, { status: newStatus })
      setTopic({ ...topic, status: res.data.status })
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const handleDeleteTopic = async () => {
    try {
      await api.deleteTopic(topic.id)
      navigate('/topics')
    } catch (err) {
      setError('Failed to delete topic')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="spin">🌀</div>
            <p>Loading topic...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !topic) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="error-banner">{error || 'Topic not found'}</div>
          <Link to="/topics" className="btn-primary-modern">
            <ArrowLeft size={18} /> Back to Topics
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container" style={{ paddingTop: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link to="/topics" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <ArrowLeft size={18} /> Back to Topics
          </Link>
        </div>

        <div className="topic-detail-card">
          <div className="topic-detail-header">
            <div className="topic-detail-title-section">
              <div className="topic-title-display">
                {isEditingTitle ? (
                  <div className="topic-title-edit">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleUpdateTitle} className="save-btn">Save</button>
                    <button onClick={() => { setIsEditingTitle(false); setEditTitle(topic.title) }} className="cancel-btn">Cancel</button>
                  </div>
                ) : (
                  <>
                    <h2>{topic.title}</h2>
                    <button onClick={() => setIsEditingTitle(true)} className="edit-btn">
                      <Edit2 size={16} />
                    </button>
                  </>
                )}
              </div>
              <div className="topic-status-section">
                <select 
                  value={topic.status} 
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`status-select status-${topic.status}`}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="complete">Complete</option>
                </select>
                <StatusBadge status={topic.status} />
              </div>
            </div>

            {isEditingDescription ? (
              <div className="topic-desc-edit">
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <div>
                  <button onClick={handleUpdateDescription} className="save-btn">Save</button>
                  <button onClick={() => { setIsEditingDescription(false); setEditDescription(topic.description || '') }} className="cancel-btn">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="topic-desc-display">
                <p>{topic.description || 'No description'}</p>
                <button onClick={() => setIsEditingDescription(true)} className="edit-btn">
                  <Edit2 size={14} />
                </button>
              </div>
            )}

            <div className="topic-detail-meta">
              <span>Created: {new Date(topic.created_at).toLocaleDateString()}</span>
              <span>Updated: {new Date(topic.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <div className="section-card">
          <div className="section-header">
            <h3>Resources</h3>
            <button
              className="add-btn"
              onClick={() => setShowResourceForm(!showResourceForm)}
            >
              {showResourceForm ? <X size={16} /> : <Plus size={16} />}
              {showResourceForm ? 'Cancel' : 'Add Resource'}
            </button>
          </div>

          {showResourceForm && (
            <form className="resource-form" onSubmit={handleAddResource}>
              <div className="resource-form-row">
                <input
                  value={newResource.label}
                  onChange={(e) => setNewResource({ ...newResource, label: e.target.value })}
                  placeholder="Label (e.g., Official Docs)"
                />
                <input
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  placeholder="URL (https://example.com)"
                />
                <button type="submit" className="submit-btn">
                  <Sparkles size={16} /> Add
                </button>
              </div>
            </form>
          )}

          <ResourceList
            resources={topic.resources}
            onDelete={handleDeleteResource}
          />
        </div>

        {/* Notes Section */}
        <div className="section-card">
          <div className="section-header">
            <h3>Notes</h3>
            <button
              className="add-btn"
              onClick={() => setShowNoteForm(!showNoteForm)}
            >
              {showNoteForm ? <X size={16} /> : <Plus size={16} />}
              {showNoteForm ? 'Cancel' : 'Add Note'}
            </button>
          </div>

          {showNoteForm && (
            <form className="note-form" onSubmit={handleAddNote}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your thoughts..."
              />
              <button type="submit" className="submit-btn">
                <Sparkles size={16} /> Add Note
              </button>
            </form>
          )}

          <NoteList
            notes={topic.notes}
            onDelete={handleDeleteNote}
            onUpdate={handleUpdateNote}
          />
        </div>

        {/* Delete Topic */}
        <button onClick={() => setShowDeleteConfirm(true)} className="delete-topic-btn">
          <Trash2 size={18} /> Delete Topic
        </button>
      </div>

      {/* Confirm Dialog for Delete Topic */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTopic}
        title="Delete Topic?"
        message={`Are you sure you want to delete "${topic?.title}" and all its resources and notes? This action cannot be undone.`}
        confirmText="Delete Topic"
      />
    </div>
  )
}

export default TopicDetailPage