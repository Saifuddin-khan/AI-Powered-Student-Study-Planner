import React, { useState, useEffect } from 'react';
import Modal          from '../../components/ui/Modal/Modal';
import Button         from '../../components/ui/Button/Button';
import subjectService from '../../services/subjectService';

const EMPTY = { title: '', content: '', subjectId: '' };

export default function NoteForm({ isOpen, onClose, onSaved, initial }) {
  const [form,     setForm]     = useState(EMPTY);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setForm(initial
        ? { title: initial.title, content: initial.content || '', subjectId: initial.subjectId || '' }
        : EMPTY);
      setErrors({});
      subjectService.getAll().then(r => setSubjects(r.data?.data ?? [])).catch(() => {});
    }
  }, [isOpen, initial]);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try {
      await onSaved({
        title:     form.title.trim(),
        content:   form.content.trim() || null,
        subjectId: form.subjectId      || null,
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
      title={initial ? 'Edit Note' : 'New Note'}
      size="md"
      footer={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      }
    >
      <form className="nf-form" onSubmit={handleSubmit} noValidate>
        <div className="nf-form__group">
          <label className="nf-form__label">Title *</label>
          <input type="text"
            className={`nf-form__input${errors.title ? ' nf-form__input--err' : ''}`}
            value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="Note title" maxLength={255} />
          {errors.title && <p className="nf-form__error">{errors.title}</p>}
        </div>

        <div className="nf-form__group">
          <label className="nf-form__label">Subject</label>
          <select className="nf-form__input" value={form.subjectId} onChange={e => set('subjectId', e.target.value)}>
            <option value="">— None —</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="nf-form__group">
          <label className="nf-form__label">Content</label>
          <textarea
            className="nf-form__input nf-form__textarea"
            value={form.content} onChange={e => set('content', e.target.value)}
            placeholder="Write your notes here…" rows={10} />
        </div>
      </form>
    </Modal>
  );
}
