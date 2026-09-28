import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MdAdd, MdAssignment, MdDeleteSweep } from 'react-icons/md';
import { toast } from 'react-toastify';

import taskService   from '../../services/taskService';
import PageHeader    from '../../components/common/PageHeader';
import SearchBar     from '../../components/common/SearchBar';
import FilterBar     from '../../components/common/FilterBar';
import EmptyState    from '../../components/ui/EmptyState/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog/ConfirmDialog';
import TaskCard      from './TaskCard';
import TaskForm      from './TaskForm';
import './Tasks.css';

const STATUS_FILTERS = [
  { value: 'ALL',         label: 'All' },
  { value: 'PENDING',     label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED',   label: 'Completed' },
];

const PRIORITY_FILTERS = [
  { value: 'ALL',    label: 'Any Priority' },
  { value: 'HIGH',   label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW',    label: 'Low' },
];

export default function Tasks() {
  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [prioFilter,   setPrioFilter]   = useState('ALL');

  const [formOpen,        setFormOpen]        = useState(false);
  const [editTarget,      setEditTarget]      = useState(null);
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [deleting,        setDeleting]        = useState(false);
  const [deleteAllOpen,   setDeleteAllOpen]   = useState(false);
  const [deletingAll,     setDeletingAll]     = useState(false);

  /* ── Load ─────────────────────────────────────────────── */
  const loadTasks = useCallback(async () => {
    try {
      const res = await taskService.getAll({ size: 100 });
      setTasks(res.data?.data?.content ?? []);
    } catch (err) {
      console.error('Task load error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load tasks';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  /* ── Filtered list ────────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tasks.filter(t => {
      if (statusFilter !== 'ALL' && t.status   !== statusFilter) return false;
      if (prioFilter   !== 'ALL' && t.priority !== prioFilter)   return false;
      if (q && !t.title.toLowerCase().includes(q) && !(t.description || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tasks, search, statusFilter, prioFilter]);

  /* ── CRUD ─────────────────────────────────────────────── */
  const openCreate = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit   = (t) => { setEditTarget(t);   setFormOpen(true); };

  const handleSave = useCallback(async (data) => {
    if (editTarget) {
      const res = await taskService.update(editTarget.id, data);
      setTasks(prev => prev.map(t => t.id === editTarget.id ? res.data?.data : t));
      toast.success('Task updated');
    } else {
      const res = await taskService.create(data);
      setTasks(prev => [res.data?.data, ...prev]);
      toast.success('Task created');
    }
  }, [editTarget]);

  const handleToggle = useCallback(async (task) => {
    const next = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await taskService.updateStatus(task.id, next);
      setTasks(prev => prev.map(t => t.id === task.id ? res.data?.data : t));
      if (next === 'COMPLETED') {
        toast.success('Task completed');
      }
    } catch {
      toast.error('Failed to update task');
    }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      await taskService.delete(deleteTarget.id);
      setTasks(prev => prev.filter(t => t.id !== deleteTarget.id));
      toast.success('Task deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const handleDeleteAllConfirm = useCallback(async () => {
    setDeletingAll(true);
    try {
      await taskService.deleteAll();
      setTasks([]);
      toast.success('All tasks deleted successfully');
      setDeleteAllOpen(false);
    } catch {
      toast.error('Failed to delete all tasks');
    } finally {
      setDeletingAll(false);
    }
  }, []);

  const pending    = tasks.filter(t => t.status === 'PENDING').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completed  = tasks.filter(t => t.status === 'COMPLETED').length;

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="page-enter tasks-page">
      <PageHeader
        title="Tasks"
        subtitle="Manage your study tasks"
        accentColor="#FB923C"
        action={{ label: 'Add Task', onClick: openCreate, icon: <MdAdd size={18} /> }}
      />

      {!loading && tasks.length > 0 && (
        <div className="tasks-stats">
          <div className="tasks-stat">
            <span className="tasks-stat__num">{pending}</span>
            <span className="tasks-stat__lbl">Pending</span>
          </div>
          <div className="tasks-stat">
            <span className="tasks-stat__num tasks-stat__num--blue">{inProgress}</span>
            <span className="tasks-stat__lbl">In Progress</span>
          </div>
          <div className="tasks-stat">
            <span className="tasks-stat__num tasks-stat__num--green">{completed}</span>
            <span className="tasks-stat__lbl">Completed</span>
          </div>
        </div>
      )}

      <div className="tasks-toolbar">
        <SearchBar placeholder="Search tasks…" onSearch={setSearch} />
        <FilterBar filters={STATUS_FILTERS}   active={statusFilter} onChange={setStatusFilter} />
        <FilterBar filters={PRIORITY_FILTERS} active={prioFilter}   onChange={setPrioFilter} />
        {tasks.length > 0 && (
          <button
            className="tasks-delete-all-btn"
            onClick={() => setDeleteAllOpen(true)}
            title="Delete all tasks"
          >
            <MdDeleteSweep size={18} /> Delete All
          </button>
        )}
      </div>

      {loading && <SkeletonList count={5} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<MdAssignment size={40} />}
          title={tasks.length === 0 ? 'No tasks yet' : 'No tasks match'}
          message={tasks.length === 0 ? 'Add your first task to get started.' : 'Try different filters.'}
          action={tasks.length === 0 && (
            <button className="empty-state-action-btn" onClick={openCreate}>+ Add Task</button>
          )}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="tasks-list">
          {filtered.map(t => (
            <TaskCard
              key={t.id}
              task={t}
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <TaskForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSave}
        initial={editTarget}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Task?"
        message={`"${deleteTarget?.title}" will be permanently deleted.`}
      />

      <ConfirmDialog
        isOpen={deleteAllOpen}
        onClose={() => setDeleteAllOpen(false)}
        onConfirm={handleDeleteAllConfirm}
        loading={deletingAll}
        title="Delete All Tasks?"
        message="All your tasks will be permanently deleted. This action cannot be undone."
      />
    </div>
  );
}
