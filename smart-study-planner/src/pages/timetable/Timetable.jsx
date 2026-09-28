import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MdAdd, MdEdit, MdDelete, MdCalendarViewWeek } from 'react-icons/md';
import { toast } from 'react-toastify';

import timetableService from '../../services/timetableService';
import PageHeader        from '../../components/common/PageHeader';
import EmptyState        from '../../components/ui/EmptyState/EmptyState';
import { SkeletonList }  from '../../components/ui/Skeleton/Skeleton';
import ConfirmDialog     from '../../components/ui/ConfirmDialog/ConfirmDialog';
import TimetableForm     from './TimetableForm';
import { DAYS }          from '../../utils/constants';
import './Timetable.css';

const DAY_SHORT = { MONDAY:'Mon', TUESDAY:'Tue', WEDNESDAY:'Wed', THURSDAY:'Thu', FRIDAY:'Fri', SATURDAY:'Sat', SUNDAY:'Sun' };

function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const disp = hour % 12 || 12;
  return `${disp}:${m} ${ampm}`;
}

function duration(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60), r = mins % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export default function Timetable() {
  const [slots,        setSlots]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [formOpen,     setFormOpen]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [activeDay,    setActiveDay]    = useState('ALL');

  const load = useCallback(async () => {
    try {
      const res = await timetableService.getWeekly();
      setSlots(res.data?.data ?? []);
    } catch { toast.error('Failed to load timetable'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit   = (s) => { setEditTarget(s);   setFormOpen(true); };

  const handleSave = useCallback(async (data) => {
    if (editTarget) {
      const res = await timetableService.update(editTarget.id, data);
      setSlots(prev => prev.map(s => s.id === editTarget.id ? res.data?.data : s));
      toast.success('Slot updated');
    } else {
      const res = await timetableService.create(data);
      setSlots(prev => [...prev, res.data?.data]);
      toast.success('Slot added');
    }
  }, [editTarget]);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      await timetableService.delete(deleteTarget.id);
      setSlots(prev => prev.filter(s => s.id !== deleteTarget.id));
      toast.success('Slot deleted');
      setDeleteTarget(null);
    } catch { toast.error('Failed to delete slot'); }
    finally { setDeleting(false); }
  }, [deleteTarget]);

  /* Group by day */
  const byDay = useMemo(() => {
    const map = {};
    DAYS.forEach(d => { map[d] = []; });
    slots.forEach(s => { if (map[s.dayOfWeek]) map[s.dayOfWeek].push(s); });
    Object.values(map).forEach(arr => arr.sort((a, b) => (a.startTime > b.startTime ? 1 : -1)));
    return map;
  }, [slots]);

  const displayDays = activeDay === 'ALL' ? DAYS : [activeDay];

  const DAY_FILTERS = [{ value: 'ALL', label: 'All Days' }, ...DAYS.map(d => ({ value: d, label: DAY_SHORT[d] }))];

  return (
    <div className="page-enter timetable-page">
      <PageHeader
        title="Timetable"
        subtitle="Your weekly class schedule"
        accentColor="#34D399"
        action={{ label: 'Add Slot', onClick: openCreate, icon: <MdAdd size={18} /> }}
      />

      {/* Day filter */}
      <div className="tt-filter">
        {DAY_FILTERS.map(f => (
          <button
            key={f.value}
            className={`tt-filter__btn${activeDay === f.value ? ' tt-filter__btn--active' : ''}`}
            onClick={() => setActiveDay(f.value)}
          >{f.label}</button>
        ))}
      </div>

      {loading && <SkeletonList count={4} />}

      {!loading && slots.length === 0 && (
        <EmptyState
          icon={<MdCalendarViewWeek size={40} />}
          title="No timetable slots yet"
          message="Add your class schedule to stay organised."
          action={<button className="empty-state-action-btn" onClick={openCreate}>+ Add Slot</button>}
        />
      )}

      {!loading && slots.length > 0 && (
        <div className="tt-grid">
          {displayDays.map(day => {
            const daySlots = byDay[day] || [];
            if (activeDay === 'ALL' && daySlots.length === 0) return null;
            return (
              <div key={day} className="tt-day">
                <div className="tt-day__header">
                  <span className="tt-day__name">{day.charAt(0) + day.slice(1).toLowerCase()}</span>
                  <span className="tt-day__count">{daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}</span>
                </div>

                {daySlots.length === 0
                  ? <p className="tt-day__empty">No classes</p>
                  : (
                    <div className="tt-day__slots">
                      {daySlots.map(slot => (
                        <div
                          key={slot.id}
                          className="tt-slot"
                          style={{ '--slot-color': slot.subjectColorHex || '#7C6FCD' }}
                        >
                          <div className="tt-slot__time">
                            <span className="tt-slot__start">{fmtTime(slot.startTime)}</span>
                            <span className="tt-slot__end">{fmtTime(slot.endTime)}</span>
                          </div>
                          <div className="tt-slot__info">
                            <span className="tt-slot__label">{slot.label || slot.subjectName || 'Class'}</span>
                            {slot.subjectName && (
                              <span className="tt-slot__subject" style={{ color: slot.subjectColorHex || 'var(--text-muted)' }}>
                                {slot.subjectName}
                              </span>
                            )}
                            <span className="tt-slot__duration">{duration(slot.startTime, slot.endTime)}</span>
                          </div>
                          <div className="tt-slot__actions">
                            <button className="tt-slot__btn" onClick={() => openEdit(slot)}><MdEdit size={14} /></button>
                            <button className="tt-slot__btn tt-slot__btn--danger" onClick={() => setDeleteTarget(slot)}><MdDelete size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            );
          })}
        </div>
      )}

      <TimetableForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSaved={handleSave} initial={editTarget} />
      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm} loading={deleting}
        title="Delete Slot?" message={`"${deleteTarget?.label || 'This slot'}" will be permanently deleted.`}
      />
    </div>
  );
}
