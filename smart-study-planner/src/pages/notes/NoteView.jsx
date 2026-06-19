import React from 'react';
import { MdEdit, MdDelete, MdCalendarToday } from 'react-icons/md';
import Modal  from '../../components/ui/Modal/Modal';
import Button from '../../components/ui/Button/Button';

function formatDt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function NoteView({ isOpen, onClose, note, onEdit, onDelete }) {
  if (!note) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={note.title}
      size="md"
      footer={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="danger"    onClick={() => { onClose(); onDelete(note); }}>
            <MdDelete size={15} /> Delete
          </Button>
          <Button variant="secondary" onClick={() => { onClose(); onEdit(note);   }}>
            <MdEdit   size={15} /> Edit
          </Button>
        </div>
      }
    >
      <div className="note-view">
        {note.subjectName && (
          <span
            className="note-view__subject"
            style={{ borderColor: note.subjectColorHex || 'var(--border-medium)', color: note.subjectColorHex || 'var(--text-muted)' }}
          >
            {note.subjectName}
          </span>
        )}

        <div className="note-view__meta">
          <MdCalendarToday size={13} />
          {formatDt(note.updatedAt || note.createdAt)}
        </div>

        {note.content
          ? <pre className="note-view__content">{note.content}</pre>
          : <p className="note-view__empty">No content added yet.</p>
        }
      </div>
    </Modal>
  );
}
