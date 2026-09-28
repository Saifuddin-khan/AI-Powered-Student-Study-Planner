import React, { useState, useEffect } from 'react';
import Modal          from '../../components/ui/Modal/Modal';
import Button         from '../../components/ui/Button/Button';
import subjectService from '../../services/subjectService';

const EMPTY = { title: '', description: '', subjectId: '', priority: 'MEDIUM', status: 'PENDING', dueDate: '' };

export default function TaskForm({ isOpen, onClose, onSaved, initial }) {
  const [form,     setForm]     = useState(EMPTY);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setForm(initial ? {
        title:       initial.title,
        description: initial.description || '',
        subjectId:   initial.subjectId   || '',
        priority:    initial.priority    || 'MEDIUM',
        status:      initial.status      || 'PENDING',
        dueDate:     initial.dueDate     || '',
      } : EMPTY);
      setErrors({});
      subjectService.getAll().then(r => setSubjects(r.data?.data ?? [])).catch(() => {});
    }
  }, [isOpen, initial]);

  function validate() {
    const e = {};
    if (!form.title.trim())   e.title    = 'Title is required';
    if (!form.priority)       e.priority = 'Priority is required';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try {
      await onSaved({
        title:       form.title.trim(),
        description: form.description.trim() || null,
        subjectId:   form.subjectId          || null,
        priority:    form.priority,
        status:      form.status,
        dueDate:     form.dueDate            || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Edit Task' : 'Add Task'}
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Task'}
          </Button>
        </div>
      }
    >
      <form className="tf-form" onSubmit={handleSubmit} noValidate>

        <div className="tf-form__group">
          <label className="tf-form__label">Title *</label>
          <input type="text" className={`tf-form__input${errors.title ? ' tf-form__input--err' : ''}`}
            value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="Task title" maxLength={255} />
          {errors.title && <p className="tf-form__error">{errors.title}</p>}
        </div>

        <div className="tf-form__group">
          <label className="tf-form__label">Description</label>
          <textarea className="tf-form__input tf-form__textarea"
            value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Optional details…" rows={3} />
        </div>

        <div className="tf-form__row">
          <div className="tf-form__group">
            <label className="tf-form__label">Priority *</label>
            <select className={`tf-form__input${errors.priority ? ' tf-form__input--err' : ''}`}
              value={form.priority} onChange={e => set('priority', e.target.value)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            {errors.priority && <p className="tf-form__error">{errors.priority}</p>}
          </div>

          <div className="tf-form__group">
            <label className="tf-form__label">Status</label>
            <select className="tf-form__input" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="tf-form__row">
          <div className="tf-form__group">
            <label className="tf-form__label">Subject</label>
            <select className="tf-form__input" value={form.subjectId} onChange={e => set('subjectId', e.target.value)}>
              <option value="">— None —</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="tf-form__group">
            <label className="tf-form__label">Due Date</label>
            <input type="date" className="tf-form__input"
              value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
        </div>

      </form>
    </Modal>
  );
}
