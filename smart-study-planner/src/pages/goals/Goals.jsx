import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MdAdd, MdFlag } from 'react-icons/md';
import { toast } from 'react-toastify';

import goalService   from '../../services/goalService';
import PageHeader    from '../../components/common/PageHeader';
import FilterBar     from '../../components/common/FilterBar';
import EmptyState    from '../../components/ui/EmptyState/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog/ConfirmDialog';
import GoalCard      from './GoalCard';
import GoalForm      from './GoalForm';
import './Goals.css';

const STATUS_FILTERS = [
  { value: 'ALL',         label: 'All' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED',   label: 'Completed' },
  { value: 'ABANDONED',   label: 'Abandoned' },
];

export default function Goals() {
  const [goals,        setGoals]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('ALL');
  const [formOpen,     setFormOpen]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await goalService.getAll();
      setGoals(res.data?.data ?? []);
    } catch { toast.error('Failed to load goals'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() =>
    filter === 'ALL' ? goals : goals.filter(g => g.status === filter),
    [goals, filter]
  );

  const openCreate = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit   = (g) => { setEditTarget(g);   setFormOpen(true); };

  const handleSave = useCallback(async (data) => {
    if (editTarget) {
      const res = await goalService.update(editTarget.id, data);
      setGoals(prev => prev.map(g => g.id === editTarget.id ? res.data?.data : g));
      toast.success('Goal updated');
    } else {
      const res = await goalService.create(data);
      setGoals(prev => [res.data?.data, ...prev]);
      toast.success('Goal created');
    }
  }, [editTarget]);

  const handleUpdateProgress = useCallback(async (id, value) => {
    try {
      const res = await goalService.updateProgress(id, value);
      setGoals(prev => prev.map(g => g.id === id ? res.data?.data : g));
      toast.success('Progress updated');
    } catch { toast.error('Failed to update progress'); }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      await goalService.delete(deleteTarget.id);
      setGoals(prev => prev.filter(g => g.id !== deleteTarget.id));
      toast.success('Goal deleted');
      setDeleteTarget(null);
    } catch { toast.error('Failed to delete goal'); }
    finally { setDeleting(false); }
  }, [deleteTarget]);

  const inProgress = goals.filter(g => g.status === 'IN_PROGRESS').length;
  const completed  = goals.filter(g => g.status === 'COMPLETED').length;

  return (
    <div className="page-enter goals-page">
      <PageHeader
        title="Goals"
        subtitle="Track your academic milestones"
        accentColor="#F472B6"
        action={{ label: 'New Goal', onClick: openCreate, icon: <MdAdd size={18} /> }}
      />

      {!loading && goals.length > 0 && (
        <div className="goals-stats">
          <div className="goals-stat"><span className="goals-stat__num">{goals.length}</span><span className="goals-stat__lbl">Total</span></div>
          <div className="goals-stat"><span className="goals-stat__num goals-stat__num--blue">{inProgress}</span><span className="goals-stat__lbl">In Progress</span></div>
          <div className="goals-stat"><span className="goals-stat__num goals-stat__num--green">{completed}</span><span className="goals-stat__lbl">Completed</span></div>
        </div>
      )}

      <FilterBar filters={STATUS_FILTERS} active={filter} onChange={setFilter} />

      {loading && <SkeletonList count={4} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<MdFlag size={40} />}
          title={goals.length === 0 ? 'No goals yet' : 'No goals here'}
          message={goals.length === 0 ? 'Set your first goal to stay motivated.' : 'Try a different filter.'}
          action={goals.length === 0 && (
            <button className="empty-state-action-btn" onClick={openCreate}>+ New Goal</button>
          )}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="goals-grid">
          {filtered.map(g => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      )}

      <GoalForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSaved={handleSave} initial={editTarget} />

      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm} loading={deleting}
        title="Delete Goal?" message={`"${deleteTarget?.title}" will be permanently deleted.`}
      />
    </div>
  );
}
