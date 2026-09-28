import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const EMPTY_FORM = { name: '', email: '', password: '' };

const UserManagement = () => {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showCreate, setShowCreate]   = useState(false);
  const [createForm, setCreateForm]   = useState(EMPTY_FORM);
  const [creating, setCreating]       = useState(false);

  const [editUser, setEditUser]       = useState(null);
  const [editForm, setEditForm]       = useState({ name: '', email: '' });
  const [saving, setSaving]           = useState(false);

  const [resetId, setResetId]         = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = useCallback(() => {
    setLoading(true);
    adminService.getUsers(page, 20, search)
      .then(res => {
        const d = res.data.data;
        setUsers(d.content || []);
        setTotalPages(d.totalPages || 0);
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // search debounce — reset to page 0
  const handleSearch = (e) => { setSearch(e.target.value); setPage(0); };

  // ── CREATE ────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.warn('All fields are required'); return;
    }
    setCreating(true);
    try {
      await adminService.createUser(createForm);
      toast.success('User created');
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      fetchUsers();
    } catch { toast.error('Failed to create user'); }
    finally { setCreating(false); }
  };

  // ── EDIT ──────────────────────────────────────────────────────
  const openEdit = (u) => { setEditUser(u); setEditForm({ name: u.name, email: u.email }); };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await adminService.updateUser(editUser.id, editForm);
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
    finally { setSaving(false); }
  };

  // ── ROLE ──────────────────────────────────────────────────────
  const handleRoleToggle = async (u) => {
    const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await adminService.changeUserRole(u.id, newRole);
      toast.success(`Role changed to ${newRole}`);
      fetchUsers();
    } catch { toast.error('Failed to change role'); }
  };

  // ── DISABLE / ENABLE ─────────────────────────────────────────
  const handleToggleDisable = async (u) => {
    try {
      if (u.isDisabled) {
        await adminService.enableUser(u.id);
        toast.success('User enabled');
      } else {
        await adminService.disableUser(u.id, 'Disabled by admin');
        toast.success('User disabled');
      }
      fetchUsers();
    } catch { toast.error('Failed to update user status'); }
  };

  // ── RESET PASSWORD ────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.warn('Min 6 characters'); return; }
    try {
      await adminService.resetUserPassword(resetId, newPassword);
      toast.success('Password reset');
      setResetId(null); setNewPassword('');
    } catch { toast.error('Failed to reset password'); }
  };

  // ── DELETE ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      await adminService.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <h2 className="admin-page-title">User Management</h2>
        <button className="admin-btn admin-btn-primary" onClick={() => setShowCreate(v => !v)}>
          + Create User
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          className="admin-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={handleSearch}
          style={{ width: 300 }}
        />
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="admin-card" style={{ marginBottom: 24, padding: 20 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Create New User</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="admin-input" placeholder="Full Name"
              value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
            <input className="admin-input" type="email" placeholder="Email"
              value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
            <input className="admin-input" type="password" placeholder="Password"
              value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="admin-btn" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-card" style={{ width: 400, padding: 24 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Edit User</h3>
            <input className="admin-input" placeholder="Name" style={{ width: '100%', marginBottom: 12 }}
              value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            <input className="admin-input" type="email" placeholder="Email" style={{ width: '100%', marginBottom: 16 }}
              value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="admin-btn" onClick={() => setEditUser(null)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-card" style={{ width: 360, padding: 24 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Reset Password</h3>
            <input className="admin-input" type="password" placeholder="New password (min 6 chars)"
              style={{ width: '100%', marginBottom: 16 }}
              value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="admin-btn" onClick={() => { setResetId(null); setNewPassword(''); }}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleResetPassword}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="admin-card">
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', padding: 'var(--space-4)' }}>Loading users…</p>
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', padding: 'var(--space-4)' }}>No users found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`admin-badge ${u.role?.toLowerCase()}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`admin-badge ${u.isDisabled ? 'danger' : 'success'}`}>
                      {u.isDisabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button className="admin-btn admin-btn-sm" onClick={() => openEdit(u)}>Edit</button>
                    <button className="admin-btn admin-btn-sm" onClick={() => handleRoleToggle(u)}>
                      {u.role === 'ADMIN' ? 'Make User' : 'Make Admin'}
                    </button>
                    <button className="admin-btn admin-btn-sm" onClick={() => handleToggleDisable(u)}>
                      {u.isDisabled ? 'Enable' : 'Disable'}
                    </button>
                    <button className="admin-btn admin-btn-sm" onClick={() => setResetId(u.id)}>Reset Pwd</button>
                    <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: '12px 0', justifyContent: 'center' }}>
            <button className="admin-btn admin-btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span style={{ padding: '4px 8px' }}>Page {page + 1} / {totalPages}</span>
            <button className="admin-btn admin-btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
