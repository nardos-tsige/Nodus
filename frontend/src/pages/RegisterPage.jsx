// src/pages/RegisterPage.jsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Sparkles, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await register(email, password)
      navigate('/topics')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
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
            Join Nodus and take control of your learning.
            Organize topics, save resources, and capture notes.
          </p>
          <div className="hero-features">
            <div className="hero-feature">
              <span className="hero-dot" />
              <span>Track multiple topics</span>
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
            <span>Start your journey today</span>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="login-form-section">
        <div className="form-container">
          <div className="form-header">
            <h2>Create Account</h2>
            <p>Start your learning journey today</p>
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
                  placeholder="Min 6 characters"
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label>Confirm Password</label>
              <div className="field-wrapper">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="form-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage