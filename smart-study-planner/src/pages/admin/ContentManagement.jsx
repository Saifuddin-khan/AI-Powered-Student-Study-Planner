import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const CONTENT_TYPES = [
  { key: 'subjects', label: 'Subjects', icon: '📚', fetch: adminService.getAllSubjects, del: adminService.deleteSubject },
  { key: 'tasks',    label: 'Tasks',    icon: '📋', fetch: adminService.getAllTasks,    del: adminService.deleteTask    },
  { key: 'notes',    label: 'Notes',    icon: '📝', fetch: adminService.getAllNotes,    del: adminService.deleteNote    },
  { key: 'goals',    label: 'Goals',    icon: '🎯', fetch: adminService.getAllGoals,    del: adminService.deleteGoal    },
];

const ContentTable = ({ type, onClose }) => {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchItems = (p = 0) => {
    setLoading(true);
    type.fetch(p, 15)
      .then(res => {
        const d = res.data.data;
        const content = d.content || d;
        setItems(Array.isArray(content) ? content : []);
        setTotalPages(d.totalPages || 1);
        setPage(p);
      })
      .catch(() => toast.error(`Failed to load ${type.label}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(0); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${type.label.slice(0, -1)}?`)) return;
    try {
      await type.del(id);
      toast.success('Deleted');
      fetchItems(page);
    } catch { toast.error('Failed to delete'); }
  };

  const getTitle = (item) =>
    item.title || item.name || item.content?.substring(0, 40) || `ID: ${item.id}`;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="admin-card" style={{ width: '90%', maxWidth: 700, maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>{type.icon} All {type.label}</h3>
          <button className="admin-btn" onClick={onClose}>✕ Close</button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        ) : items.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No {type.label.toLowerCase()} found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Title / Name</th><th>Owner</th><th>Action</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getTitle(item)}
                  </td>
                  <td>{item.user?.name || item.user?.email || '—'}</td>
                  <td>
                    <button className="admin-btn admin-btn-sm admin-btn-danger"
                      onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
            <button className="admin-btn admin-btn-sm" disabled={page === 0} onClick={() => fetchItems(page - 1)}>Prev</button>
            <span style={{ padding: '4px 8px' }}>Page {page + 1} / {totalPages}</span>
            <button className="admin-btn admin-btn-sm" disabled={page >= totalPages - 1} onClick={() => fetchItems(page + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

const ContentManagement = () => {
  const [stats,        setStats]        = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [openType,     setOpenType]     = useState(null);

  useEffect(() => {
    adminService.getContentStats()
      .then(res => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const getCount = (key) => {
    if (!stats) return '…';
    return stats[key] ?? stats[key + 'Count'] ?? '?';
  };

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Content Management</h2>
      </div>

      <div className="admin-stats-grid">
        {CONTENT_TYPES.map(type => (
          <div key={type.key} className="admin-card"
            style={{ cursor: 'pointer', transition: 'all 0.2s', border: '2px solid transparent' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#4f46e5'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            onClick={() => setOpenType(type)}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{type.icon}</div>
            <h3 style={{ fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>{type.label}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
              {loadingStats ? 'Loading…' : `${getCount(type.key)} total`}
            </p>
            <p style={{ color: 'var(--primary-light)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>Click to manage →</p>
          </div>
        ))}
      </div>

      {openType && (
        <ContentTable type={openType} onClose={() => setOpenType(null)} />
      )}
    </div>
  );
};

export default ContentManagement;
