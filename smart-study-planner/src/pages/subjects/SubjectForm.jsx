import React, { useState, useEffect } from 'react';
import Modal  from '../../components/ui/Modal/Modal';
import Button from '../../components/ui/Button/Button';
import { SUBJECT_COLORS } from '../../utils/constants';

const EMPTY = { name: '', colorHex: SUBJECT_COLORS[0], description: '' };

export default function SubjectForm({ isOpen, onClose, onSaved, initial }) {
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(initial
        ? { name: initial.name, colorHex: initial.colorHex, description: initial.description || '' }
        : EMPTY);
      setErrors({});
    }
  }, [isOpen, initial]);

  function validate() {
    const e = {};
    if (!form.name.trim())             e.name     = 'Subject name is required';
    if (form.name.trim().length > 100) e.name     = 'Max 100 characters';
    if (form.description.length > 255) e.description = 'Max 255 characters';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try {
      await onSaved({
        name:        form.name.trim(),
        colorHex:    form.colorHex,
        description: form.description.trim() || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function onChange(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(err => ({ ...err, [field]: undefined }));
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Edit Subject' : 'Add Subject'}
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Subject'}
          </Button>
        </div>
      }
    >
      <form className="sf-form" onSubmit={handleSubmit} noValidate>

        <div className="sf-form__group">
          <label className="sf-form__label">Subject Name *</label>
          <input
            type="text"
            className={`sf-form__input${errors.name ? ' sf-form__input--err' : ''}`}
            value={form.name}
            onChange={e => onChange('name', e.target.value)}
            placeholder="e.g. Mathematics"
            maxLength={100}
          />
          {errors.name && <p className="sf-form__error">{errors.name}</p>}
        </div>

        <div className="sf-form__group">
          <label className="sf-form__label">Color</label>
          <div className="sf-color-picker">
            {SUBJECT_COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={`sf-color-dot${form.colorHex === c ? ' sf-color-dot--active' : ''}`}
                style={{ background: c }}
                onClick={() => onChange('colorHex', c)}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div className="sf-form__group">
          <label className="sf-form__label">Description</label>
          <textarea
            className={`sf-form__input sf-form__textarea${errors.description ? ' sf-form__input--err' : ''}`}
            value={form.description}
            onChange={e => onChange('description', e.target.value)}
            placeholder="Optional description…"
            rows={3}
            maxLength={255}
          />
          <p className="sf-form__hint">{form.description.length}/255</p>
          {errors.description && <p className="sf-form__error">{errors.description}</p>}
        </div>

      </form>
    </Modal>
  );
}
