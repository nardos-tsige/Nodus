// src/components/NoteList.jsx

import { useState } from 'react'
import { Pencil, Trash2, X, Maximize2, Calendar, Sparkles } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

function NoteList({ notes, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [expandedNote, setExpandedNote] = useState(null)
  const [isEditingInOverlay, setIsEditingInOverlay] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleEdit = (note) => {
    setEditingId(note.id)
    setEditContent(note.body)
    if (expandedNote && expandedNote.id === note.id) {
      setIsEditingInOverlay(true)
    }
  }

  const handleSave = (id) => {
    if (editContent.trim()) {
      onUpdate(id, { body: editContent.trim() })
    }
    setEditingId(null)
    setEditContent('')
    setIsEditingInOverlay(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditContent('')
    setIsEditingInOverlay(false)
  }

  const openExpanded = (note) => {
    setExpandedNote(note)
    setIsEditingInOverlay(false)
    document.body.style.overflow = 'hidden'
  }

  const closeExpanded = () => {
    setExpandedNote(null)
    setIsEditingInOverlay(false)
    document.body.style.overflow = 'auto'
  }

  const handleDeleteClick = (noteId) => {
    setDeleteTarget(noteId)
    setShowConfirm(true)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget)
      setDeleteTarget(null)
      if (expandedNote && expandedNote.id === deleteTarget) {
        closeExpanded()
      }
    }
    setShowConfirm(false)
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="notes-empty">
        <span className="notes-empty-icon">📝</span>
        <p>No notes yet. Start writing your thoughts!</p>
      </div>
    )
  }

  return (
    <>
      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            {editingId === note.id && !isEditingInOverlay ? (
              <div className="note-edit-form">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your note..."
                  autoFocus
                />
                <div className="note-edit-actions">
                  <button onClick={() => handleSave(note.id)} className="note-save-btn">
                    <Sparkles size={14} /> Save
                  </button>
                  <button onClick={handleCancel} className="note-cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="note-content" onClick={() => openExpanded(note)}>
                  <p className="note-text">{note.body}</p>
                </div>
                <div className="note-footer">
                  <span className="note-date">
                    <Calendar size={12} />
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                  <div className="note-actions">
                    <button
                      onClick={() => handleEdit(note)}
                      className="note-action-btn edit"
                      title="Edit note"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(note.id)}
                      className="note-action-btn delete"
                      title="Delete note"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => openExpanded(note)}
                      className="note-action-btn expand"
                      title="Expand note"
                    >
                      <Maximize2 size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Expanded Note Overlay - Edit in Place */}
      {expandedNote && (
        <div className="note-overlay" onClick={closeExpanded}>
          <div className="note-overlay-content" onClick={(e) => e.stopPropagation()}>
            <button className="note-overlay-close" onClick={closeExpanded}>
              <X size={28} />
            </button>

            <div className="note-overlay-header">
              <div className="note-overlay-meta">
                <span className="note-overlay-date">
                  <Calendar size={16} />
                  Created: {new Date(expandedNote.created_at).toLocaleString()}
                </span>
                <span className="note-overlay-date">
                  <Calendar size={16} />
                  Updated: {new Date(expandedNote.updated_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Edit Mode inside Overlay */}
            {isEditingInOverlay ? (
              <div className="note-overlay-edit-mode">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your note..."
                  autoFocus
                />
                <div className="note-overlay-edit-actions">
                  <button onClick={() => handleSave(expandedNote.id)} className="note-overlay-save-btn">
                    <Sparkles size={16} /> Save Changes
                  </button>
                  <button onClick={handleCancel} className="note-overlay-cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="note-overlay-body">
                  <p>{expandedNote.body}</p>
                </div>

                <div className="note-overlay-actions">
                  <button
                    onClick={() => handleEdit(expandedNote)}
                    className="note-overlay-edit"
                  >
                    <Pencil size={18} /> Edit Note
                  </button>
                  <button
                    onClick={() => {
                      closeExpanded()
                      handleDeleteClick(expandedNote.id)
                    }}
                    className="note-overlay-delete"
                  >
                    <Trash2 size={18} /> Delete Note
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false)
          setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Note?"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete Note"
      />
    </>
  )
}

export default NoteList