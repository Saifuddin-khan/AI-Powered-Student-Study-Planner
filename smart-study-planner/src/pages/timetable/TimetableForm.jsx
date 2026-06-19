import React, { useState, useEffect } from 'react';
import Modal          from '../../components/ui/Modal/Modal';
import Button         from '../../components/ui/Button/Button';
import subjectService from '../../services/subjectService';
import { DAYS }       from '../../utils/constants';

const EMPTY = { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '09:00', label: '', subjectId: '' };

export default function TimetableForm({ isOpen, onClose, onSaved, initial }) {
  const [form,     setForm]     = useState(EMPTY);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setForm(initial ? {
        dayOfWeek: initial.dayOfWeek,
        startTime: initial.startTime?.slice(0, 5) || '08:00',
        endTime:   initial.endTime?.slice(0,   5) || '09:00',
        label:     initial.label     || '',
        subjectId: initial.subjectId || '',
      } : EMPTY);
      setErrors({});
      subjectService.getAll().then(r => setSubjects(r.data?.data ?? [])).catch(() => {});
    }
  }, [isOpen, initial]);

  function validate() {
    const e = {};
    if (!form.dayOfWeek)               e.dayOfWeek = 'Day is required';
    if (!form.startTime)               e.startTime = 'Start time is required';
    if (!form.endTime)                 e.endTime   = 'End time is required';
    if (form.startTime >= form.endTime) e.endTime  = 'End time must be after start time';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try {
      await onSaved({
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime:   form.endTime,
        label:     form.label.trim() || null,
        subjectId: form.subjectId    || null,
      });
      onClose();
    } finally { setSaving(false); }
  }

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={initial ? 'Edit Slot' : 'Add Timetable Slot'} size="sm"
      footer={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Slot'}
          </Button>
        </div>
      }
    >
      <form className="tt-form" onSubmit={handleSubmit} noValidate>
        <div className="tt-form__group">
          <label className="tt-form__label">Day *</label>
          <select className={`tt-form__input${errors.dayOfWeek ? ' tt-form__input--err' : ''}`}
            value={form.dayOfWeek} onChange={e => set('dayOfWeek', e.target.value)}>
            {DAYS.map(d => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
          </select>
          {errors.dayOfWeek && <p className="tt-form__error">{errors.dayOfWeek}</p>}
        </div>

        <div className="tt-form__row">
          <div className="tt-form__group">
            <label className="tt-form__label">Start Time *</label>
            <input type="time" className={`tt-form__input${errors.startTime ? ' tt-form__input--err' : ''}`}
              value={form.startTime} onChange={e => set('startTime', e.target.value)} />
            {errors.startTime && <p className="tt-form__error">{errors.startTime}</p>}
          </div>
          <div className="tt-form__group">
            <label className="tt-form__label">End Time *</label>
            <input type="time" className={`tt-form__input${errors.endTime ? ' tt-form__input--err' : ''}`}
              value={form.endTime} onChange={e => set('endTime', e.target.value)} />
            {errors.endTime && <p className="tt-form__error">{errors.endTime}</p>}
          </div>
        </div>

        <div className="tt-form__group">
          <label className="tt-form__label">Label</label>
          <input type="text" className="tt-form__input"
            value={form.label} onChange={e => set('label', e.target.value)}
            placeholder="e.g. Mathematics Lecture" maxLength={255} />
        </div>

        <div className="tt-form__group">
          <label className="tt-form__label">Subject</label>
          <select className="tt-form__input" value={form.subjectId} onChange={e => set('subjectId', e.target.value)}>
            <option value="">— None —</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </form>
    </Modal>
  );
}
