import React, { useState, useEffect } from 'react';
import Modal          from '../../components/ui/Modal/Modal';
import Button         from '../../components/ui/Button/Button';
import subjectService from '../../services/subjectService';

const today = () => new Date().toISOString().split('T')[0];
const EMPTY  = { sessionDate: today(), durationMinutes: 60, notes: '', subjectId: '' };

export default function ProgressForm({ isOpen, onClose, onSaved }) {
  const [form,     setForm]     = useState(EMPTY);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...EMPTY, sessionDate: today() });
      setErrors({});
      subjectService.getAll().then(r => setSubjects(r.data?.data ?? [])).catch(() => {});
    }
  }, [isOpen]);

  function validate() {
    const e = {};
    if (!form.sessionDate)                                  e.sessionDate      = 'Date is required';
    if (!form.durationMinutes || form.durationMinutes < 1) e.durationMinutes  = 'Duration must be at least 1 min';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try {
      await onSaved({
        sessionDate:     form.sessionDate,
        durationMinutes: Number(form.durationMinutes),
        notes:           form.notes.trim() || null,
        subjectId:       form.subjectId    || null,
      });
      onClose();
    } finally { setSaving(false); }
  }

  function set(f, v) {
    setForm(p => ({ ...p, [f]: v }));
    setErrors(e => ({ ...e, [f]: undefined }));
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Study Session" size="sm"
      footer={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>
            {saving ? 'Saving…' : 'Log Session'}
          </Button>
        </div>
      }
    >
      <form className="pg-form" onSubmit={handleSubmit} noValidate>
        <div className="pg-form__row">
          <div className="pg-form__group">
            <label className="pg-form__label">Date *</label>
            <input type="date" className={`pg-form__input${errors.sessionDate ? ' pg-form__input--err' : ''}`}
              value={form.sessionDate} onChange={e => set('sessionDate', e.target.value)} />
            {errors.sessionDate && <p className="pg-form__error">{errors.sessionDate}</p>}
          </div>
          <div className="pg-form__group">
            <label className="pg-form__label">Duration (min) *</label>
            <input type="number" min={1} max={720}
              className={`pg-form__input${errors.durationMinutes ? ' pg-form__input--err' : ''}`}
              value={form.durationMinutes} onChange={e => set('durationMinutes', e.target.value)} />
            {errors.durationMinutes && <p className="pg-form__error">{errors.durationMinutes}</p>}
          </div>
        </div>

        <div className="pg-form__group">
          <label className="pg-form__label">Subject</label>
          <select className="pg-form__input" value={form.subjectId} onChange={e => set('subjectId', e.target.value)}>
            <option value="">— None —</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="pg-form__group">
          <label className="pg-form__label">Notes</label>
          <textarea className="pg-form__input pg-form__textarea" rows={2}
            value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="What did you study?" />
        </div>
      </form>
    </Modal>
  );
}
