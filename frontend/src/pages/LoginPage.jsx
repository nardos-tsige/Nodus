// src/pages/LoginPage.jsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/topics')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Left Side - Hero Section */}
      <div className="login-hero-section">
        <div className="hero-content">
          <div className="hero-logo">N</div>
          <h1>Nodus</h1>
          <p className="hero-tagline">Your Personal Learning Tracker</p>
          <div className="hero-divider" />
          <p className="hero-description">
            Organize your learning topics, save resources, 
            and capture notes — all in one place.
          </p>
          <div className="hero-features">
            <div className="hero-feature">
              <span className="hero-dot" />
              <span>Track topics by status</span>
            </div>
            <div className="hero-feature">
              <span className="hero-dot" />
              <span>Save resources and links</span>
            </div>
            <div className="hero-feature">
              <span className="hero-dot" />
              <span>Write and edit notes</span>
            </div>
          </div>
          <div className="hero-sparkle">
            <Sparkles size={14} />
            <span>Start learning today</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="form-container">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue your learning journey</p>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-fields">
            <div className="field-group">
              <label>Email Address</label>
              <div className="field-wrapper">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label>Password</label>
              <div className="field-wrapper">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="form-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage