import React, { useState, useEffect } from 'react';
import Modal  from '../../components/ui/Modal/Modal';
import Button from '../../components/ui/Button/Button';

const EMPTY = { title: '', description: '', targetDate: '' };

export default function GoalForm({ isOpen, onClose, onSaved, initial }) {
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(initial
        ? { title: initial.title, description: initial.description || '', targetDate: initial.targetDate || '' }
        : EMPTY);
      setErrors({});
    }
  }, [isOpen, initial]);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Goal title is required';
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
        targetDate:  form.targetDate         || null,
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
      title={initial ? 'Edit Goal' : 'New Goal'} size="sm"
      footer={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      }
    >
      <form className="goal-form" onSubmit={handleSubmit} noValidate>
        <div className="goal-form__group">
          <label className="goal-form__label">Title *</label>
          <input type="text"
            className={`goal-form__input${errors.title ? ' goal-form__input--err' : ''}`}
            value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Complete Calculus Module" maxLength={255} />
          {errors.title && <p className="goal-form__error">{errors.title}</p>}
        </div>

        <div className="goal-form__group">
          <label className="goal-form__label">Description</label>
          <textarea className="goal-form__input goal-form__textarea"
            value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="What do you want to achieve?" rows={3} />
        </div>

        <div className="goal-form__group">
          <label className="goal-form__label">Target Date</label>
          <input type="date" className="goal-form__input"
            value={form.targetDate} onChange={e => set('targetDate', e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}
