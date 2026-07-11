import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Trash2, BookOpen } from 'lucide-react'
import StatusBadge from './StatusBadge'
import ConfirmDialog from './ConfirmDialog'

function TopicCard({ topic, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    setShowConfirm(true)
  }

  const confirmDelete = () => {
    onDelete(topic.id)
    setShowConfirm(false)
  }

  return (
    <>
      <div className="topic-card">
        <div className="topic-card-header">
          <div className="topic-card-title-wrapper">
            <div className="topic-icon">
              <BookOpen size={16} />
            </div>
            <h3 className="topic-card-title">{topic.title}</h3>
          </div>
          <StatusBadge status={topic.status} />
        </div>

        {topic.description && (
          <p className="topic-card-description">{topic.description}</p>
        )}

        <div className="topic-card-footer">
          <span className="topic-card-date">
            <Calendar size={14} />
            Updated: {new Date(topic.updated_at).toLocaleDateString()}
          </span>
          <div className="topic-card-actions">
            <button
              onClick={handleDelete}
              className="delete-btn"
              title="Delete topic"
            >
              <Trash2 size={16} />
            </button>
            <Link to={`/topics/${topic.id}`} className="link-btn">
              View Details <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Topic?"
        message={`Are you sure you want to delete "${topic.title}"? This action cannot be undone.`}
        confirmText="Delete Topic"
      />
    </>
  )
}

export default TopicCard