import React, { useState, useEffect } from 'react';
import Modal          from '../../components/ui/Modal/Modal';
import Button         from '../../components/ui/Button/Button';
import subjectService from '../../services/subjectService';

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY  = { title: '', notes: '', planDate: today(), durationMinutes: 30, subjectId: '' };

export default function PlannerForm({ isOpen, onClose, onSaved, initial, defaultDate }) {
  const [form,     setForm]     = useState(EMPTY);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setForm({
        title:           initial.title           || '',
        notes:           initial.notes           || '',
        planDate:        initial.planDate        || today(),
        durationMinutes: initial.durationMinutes || 30,
        subjectId:       initial.subjectId       || '',
      });
    } else {
      setForm({ ...EMPTY, planDate: defaultDate || today() });
    }
    setErrors({});
    subjectService.getAll().then(r => setSubjects(r.data?.data ?? [])).catch(() => {});
  }, [isOpen, initial, defaultDate]);

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim())           e.title           = 'Title is required';
    if (!form.planDate)               e.planDate        = 'Date is required';
    if (!form.durationMinutes || form.durationMinutes < 1)
                                      e.durationMinutes = 'Duration must be at least 1 minute';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try {
      await onSaved({
        title:           form.title.trim(),
        notes:           form.notes.trim() || null,
        planDate:        form.planDate,
        durationMinutes: Number(form.durationMinutes),
        subjectId:       form.subjectId || null,
      });
      onClose();
    } finally { setSaving(false); }
  }

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={initial ? 'Edit Study Plan' : 'Add Study Plan'} size="sm"
      footer={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Plan'}
          </Button>
        </div>
      }
    >
      <form className="pl-form" onSubmit={handleSubmit} noValidate>
        <div className="pl-form__group">
          <label className="pl-form__label">Title *</label>
          <input
            type="text"
            className={`pl-form__input${errors.title ? ' pl-form__input--err' : ''}`}
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Review Chapter 3"
            maxLength={255}
          />
          {errors.title && <p className="pl-form__error">{errors.title}</p>}
        </div>

        <div className="pl-form__row">
          <div className="pl-form__group">
            <label className="pl-form__label">Date *</label>
            <input
              type="date"
              className={`pl-form__input${errors.planDate ? ' pl-form__input--err' : ''}`}
              value={form.planDate}
              onChange={e => set('planDate', e.target.value)}
            />
            {errors.planDate && <p className="pl-form__error">{errors.planDate}</p>}
          </div>
          <div className="pl-form__group">
            <label className="pl-form__label">Duration (min) *</label>
            <input
              type="number"
              className={`pl-form__input${errors.durationMinutes ? ' pl-form__input--err' : ''}`}
              value={form.durationMinutes}
              onChange={e => set('durationMinutes', e.target.value)}
              min={1}
              max={600}
            />
            {errors.durationMinutes && <p className="pl-form__error">{errors.durationMinutes}</p>}
          </div>
        </div>

        <div className="pl-form__group">
          <label className="pl-form__label">Subject</label>
          <select
            className="pl-form__input"
            value={form.subjectId}
            onChange={e => set('subjectId', e.target.value)}
          >
            <option value="">— None —</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="pl-form__group">
          <label className="pl-form__label">Notes</label>
          <textarea
            className="pl-form__input"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Optional notes or topics to cover…"
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
