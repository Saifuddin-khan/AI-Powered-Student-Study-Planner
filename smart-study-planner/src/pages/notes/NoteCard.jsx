import React, { memo } from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { truncate } from '../../utils/helpers';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins  / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return 'Just now';
}

function NoteCard({ note, onClick, onEdit, onDelete }) {
  return (
    <div
      className="note-card"
      style={{ '--note-accent': note.subjectColorHex || 'var(--primary)' }}
      onClick={() => onClick(note)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(note)}
    >
      <div className="note-card__actions" onClick={e => e.stopPropagation()}>
        <button className="note-card__action-btn" onClick={() => onEdit(note)} aria-label="Edit note">
          <MdEdit size={15} />
        </button>
        <button className="note-card__action-btn note-card__action-btn--danger" onClick={() => onDelete(note)} aria-label="Delete note">
          <MdDelete size={15} />
        </button>
      </div>

      <h3 className="note-card__title">{note.title}</h3>

      {note.content && (
        <p className="note-card__content">{truncate(note.content, 120)}</p>
      )}

      <div className="note-card__footer">
        {note.subjectName && (
          <span className="note-card__subject" style={{ color: note.subjectColorHex || 'var(--text-muted)' }}>
            {note.subjectName}
          </span>
        )}
        <span className="note-card__time">{timeAgo(note.updatedAt || note.createdAt)}</span>
      </div>
    </div>
  );
}

export default memo(NoteCard);
