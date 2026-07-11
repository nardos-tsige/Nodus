import { Link, ExternalLink, Trash2 } from 'lucide-react'

function ResourceList({ resources, onDelete }) {
  if (!resources || resources.length === 0) {
    return (
      <div className="resources-empty">
        <span className="resources-empty-icon">🔗</span>
        <p>No resources yet. Add your first resource!</p>
      </div>
    )
  }

  return (
    <div className="resources-grid">
      {resources.map((resource) => (
        <div key={resource.id} className="resource-card">
          <div className="resource-content">
            <div className="resource-icon-wrapper">
              <Link size={16} />
            </div>
            <div className="resource-info">
              <div className="resource-label">{resource.label}</div>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-url"
              >
                {resource.url.length > 35 ? resource.url.substring(0, 35) + '...' : resource.url}
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
          <button
            onClick={() => onDelete(resource.id)}
            className="resource-delete"
            title="Delete resource"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default ResourceList