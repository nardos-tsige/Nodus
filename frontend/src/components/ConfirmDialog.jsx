import { X, AlertTriangle } from 'lucide-react'

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel' }) {
  if (!isOpen) return null

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="confirm-icon-wrapper">
          <div className="confirm-icon">
            <AlertTriangle size={28} />
          </div>
        </div>

        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="confirm-delete" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog