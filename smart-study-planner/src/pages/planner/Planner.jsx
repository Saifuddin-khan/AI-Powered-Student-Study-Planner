import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MdAdd, MdEdit, MdDelete, MdCheckCircle, MdCheckCircleOutline,
  MdChevronLeft, MdChevronRight, MdCalendarToday, MdTimer, MdMenuBook,
} from 'react-icons/md';
import { toast }          from 'react-toastify';
import plannerService     from '../../services/plannerService';
import PageHeader         from '../../components/common/PageHeader';
import EmptyState         from '../../components/ui/EmptyState/EmptyState';
import { SkeletonList }   from '../../components/ui/Skeleton/Skeleton';
import ConfirmDialog      from '../../components/ui/ConfirmDialog/ConfirmDialog';
import PlannerForm        from './PlannerForm';
import './Planner.css';

/* ── helpers ─────────────────────────────────────────────── */
function toIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fmtDisplay(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtDuration(mins) {
  if (!mins) return '—';
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/* ── component ───────────────────────────────────────────── */
export default function Planner() {
  const [plans,        setPlans]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedDate, setSelectedDate] = useState(toIso(new Date()));
  const [showPicker,   setShowPicker]   = useState(false);
  const [formOpen,     setFormOpen]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const load = useCallback(async (date) => {
    setLoading(true);
    try {
      const res = await plannerService.getByDate(date);
      setPlans(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(selectedDate); }, [load, selectedDate]);

  const isToday = selectedDate === toIso(new Date());

  function changeDay(delta) {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(toIso(d));
  }

  const openCreate = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit   = (p)  => { setEditTarget(p);  setFormOpen(true); };

  const handleSave = useCallback(async (data) => {
    if (editTarget) {
      const res = await plannerService.update(editTarget.id, data);
      setPlans(prev => prev
        .map(p => p.id === editTarget.id ? res.data?.data : p)
        .filter(p => p?.planDate === selectedDate));
      toast.success('Plan updated');
    } else {
      const res = await plannerService.create(data);
      const newPlan = res.data?.data;
      if (newPlan?.planDate === selectedDate) {
        setPlans(prev => [...prev, newPlan]);
      }
      toast.success('Plan added');
    }
  }, [editTarget, selectedDate]);

  const handleToggle = useCallback(async (plan) => {
    try {
      const res = await plannerService.toggleComplete(plan.id);
      setPlans(prev => prev.map(p => p.id === plan.id ? res.data?.data : p));
    } catch {
      toast.error('Failed to update plan');
    }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      await plannerService.delete(deleteTarget.id);
      setPlans(prev => prev.filter(p => p.id !== deleteTarget.id));
      toast.success('Plan deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete plan');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const stats = useMemo(() => {
    const total     = plans.length;
    const done      = plans.filter(p => p.isCompleted).length;
    const totalMins = plans.reduce((s, p) => s + (p.durationMinutes || 0), 0);
    const doneMins  = plans.filter(p => p.isCompleted).reduce((s, p) => s + (p.durationMinutes || 0), 0);
    return { total, done, totalMins, doneMins };
  }, [plans]);

  return (
    <div className="page-enter planner-page">
      <PageHeader
        title="Study Planner"
        subtitle="Plan your daily study sessions"
        accentColor="var(--primary)"
        action={{ label: 'Add Plan', onClick: openCreate, icon: <MdAdd size={18} /> }}
      />

      {/* Date navigation */}
      <div className="planner-nav">
        <button className="planner-nav__btn" onClick={() => changeDay(-1)}>
          <MdChevronLeft size={18} /> Prev
        </button>

        <div className="planner-nav__center">
          {showPicker ? (
            <input
              type="date"
              className="planner-nav__date-input"
              value={selectedDate}
              onChange={e => { setSelectedDate(e.target.value); setShowPicker(false); }}
              onBlur={() => setShowPicker(false)}
              autoFocus
            />
          ) : (
            <span className="planner-nav__date" onClick={() => setShowPicker(true)}>
              {fmtDisplay(selectedDate)}
            </span>
          )}
          {!isToday && (
            <button className="planner-nav__today-btn" onClick={() => setSelectedDate(toIso(new Date()))}>
              Back to Today
            </button>
          )}
        </div>

        <button className="planner-nav__btn" onClick={() => changeDay(1)}>
          Next <MdChevronRight size={18} />
        </button>
      </div>

      {/* Stats strip */}
      {!loading && plans.length > 0 && (
        <div className="planner-stats">
          <div className="planner-stat">
            <div className="planner-stat__value">{stats.total}</div>
            <div className="planner-stat__label">Sessions Planned</div>
          </div>
          <div className="planner-stat">
            <div className="planner-stat__value">{stats.done}</div>
            <div className="planner-stat__label">Completed</div>
          </div>
          <div className="planner-stat">
            <div className="planner-stat__value">{fmtDuration(stats.totalMins)}</div>
            <div className="planner-stat__label">Total Planned</div>
          </div>
          <div className="planner-stat">
            <div className="planner-stat__value">{fmtDuration(stats.doneMins)}</div>
            <div className="planner-stat__label">Time Completed</div>
          </div>
        </div>
      )}

      {/* Plan list */}
      {loading && <SkeletonList count={3} />}

      {!loading && plans.length === 0 && (
        <EmptyState
          icon={<MdCalendarToday size={40} />}
          title="No plans for this day"
          message="Add a study session to get started."
          action={<button className="empty-state-action-btn" onClick={openCreate}>+ Add Plan</button>}
        />
      )}

      {!loading && plans.length > 0 && (
        <div className="planner-list">
          {plans.map(plan => {
            const color = plan.subjectColorHex || 'var(--primary)';
            return (
              <div
                key={plan.id}
                className={`planner-card${plan.isCompleted ? ' planner-card--done' : ''}`}
                style={{ '--plan-color': color }}
              >
                {/* Checkbox */}
                <button
                  className={`planner-card__check${plan.isCompleted ? ' planner-card__check--done' : ''}`}
                  onClick={() => handleToggle(plan)}
                  title={plan.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                >
                  {plan.isCompleted && <MdCheckCircle className="planner-card__check-icon" />}
                </button>

                {/* Body */}
                <div className="planner-card__body">
                  <span className="planner-card__title">{plan.title}</span>
                  {plan.notes && <span className="planner-card__notes">{plan.notes}</span>}
                  <div className="planner-card__meta">
                    <span className="planner-card__badge planner-card__badge--duration">
                      <MdTimer size={12} /> {fmtDuration(plan.durationMinutes)}
                    </span>
                    {plan.subjectName && (
                      <span className="planner-card__badge planner-card__badge--subject">
                        <MdMenuBook size={12} /> {plan.subjectName}
                      </span>
                    )}
                    {plan.isCompleted && (
                      <span className="planner-card__badge" style={{ color: '#34D399', borderColor: '#34D399' }}>
                        <MdCheckCircleOutline size={12} /> Done
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="planner-card__actions">
                  <button className="planner-card__btn" onClick={() => openEdit(plan)} title="Edit">
                    <MdEdit size={16} />
                  </button>
                  <button className="planner-card__btn planner-card__btn--danger" onClick={() => setDeleteTarget(plan)} title="Delete">
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PlannerForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSave}
        initial={editTarget}
        defaultDate={selectedDate}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Plan?"
        message={`"${deleteTarget?.title || 'This plan'}" will be permanently deleted.`}
      />
    </div>
  );
}
