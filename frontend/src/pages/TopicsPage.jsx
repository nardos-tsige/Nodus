// src/pages/TopicsPage.jsx

import { useState, useEffect } from 'react'
import { Plus, X, BookOpen, Loader2, Search, Moon, Sun, LogOut, Sparkles } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import TopicCard from '../components/TopicCard'

function TopicsPage() {
  const [topics, setTopics] = useState([])
  const [filteredTopics, setFilteredTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })
  const { user, logout } = useAuth()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    fetchTopics()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTopics(topics)
    } else {
      const filtered = topics.filter(topic =>
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredTopics(filtered)
    }
  }, [searchTerm, topics])

  const fetchTopics = async () => {
    try {
      const res = await api.getTopics()
      setTopics(res.data)
      setFilteredTopics(res.data)
    } catch (err) {
      setError('Failed to load topics')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTopic = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      const res = await api.createTopic({
        title: title.trim(),
        description: description.trim() || null,
        status: 'not_started'
      })
      const newTopics = [res.data, ...topics]
      setTopics(newTopics)
      setFilteredTopics(newTopics)
      setTitle('')
      setDescription('')
      setShowForm(false)
    } catch (err) {
      setError('Failed to create topic')
    }
  }

  const handleDeleteTopic = async (id) => {
    try {
      await api.deleteTopic(id)
      const newTopics = topics.filter(t => t.id !== id)
      setTopics(newTopics)
      setFilteredTopics(newTopics)
    } catch (err) {
      setError('Failed to delete topic')
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading-state">
            <Loader2 size={48} className="spin" />
            <p>Loading your topics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      {/* Top Navigation Bar */}
      <header className="top-nav">
        <div className="nav-content">
          <div className="nav-left">
            <div className="nav-logo">
              <span className="nav-logo-icon">N</span>
              <span className="nav-logo-text">Nodus</span>
            </div>
          </div>

          <div className="nav-right">
            <div className="nav-user">
              <span className="nav-user-email">{user?.email}</span>
            </div>
            
            <button className="nav-btn" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <button className="nav-btn logout-btn" onClick={logout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Header Section */}
          <div className="dashboard-header">
            <div className="header-left">
              <div className="header-icon-wrapper">
                <BookOpen size={24} />
              </div>
              <div>
                <h1>My Topics</h1>
                <p className="header-subtitle">{filteredTopics.length} topics • {topics.length} total</p>
              </div>
            </div>
            <button
              className="btn-primary-modern"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? (
                <>
                  <X size={18} /> Cancel
                </>
              ) : (
                <>
                  <Plus size={18} /> New Topic
                </>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {/* Add Topic Form */}
          {showForm && (
            <div className="add-topic-card">
              <form onSubmit={handleAddTopic}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Topic title..."
                    className="form-input-large"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description (optional)"
                    className="form-input-large"
                  />
                  <button type="submit" className="btn-primary-modern" style={{ alignSelf: 'flex-end' }}>
                    <Sparkles size={18} /> Create Topic
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Topics Grid */}
          {filteredTopics.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📖</div>
              <h3>No topics yet</h3>
              <p className="empty-description">
                {searchTerm ? 'No topics match your search.' : 'Start your learning journey by creating your first topic.'}
              </p>
              {!searchTerm && (
                <button
                  className="btn-primary-modern"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={18} /> Create Your First Topic
                </button>
              )}
            </div>
          ) : (
            <div className="topics-grid">
              {filteredTopics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} onDelete={handleDeleteTopic} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default TopicsPage