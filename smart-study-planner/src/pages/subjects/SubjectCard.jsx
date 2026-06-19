import React, { memo } from 'react';
import { MdEdit, MdDelete, MdMenuBook } from 'react-icons/md';

function SubjectCard({ subject, onEdit, onDelete }) {
  return (
    <div className="subject-card" style={{ '--subj-color': subject.colorHex }}>
      <div className="subject-card__top">
        <div className="subject-card__icon-wrap">
          <MdMenuBook size={22} />
        </div>
        <div className="subject-card__actions">
          <button className="subject-card__action-btn" onClick={() => onEdit(subject)} aria-label="Edit">
            <MdEdit size={16} />
          </button>
          <button className="subject-card__action-btn subject-card__action-btn--danger" onClick={() => onDelete(subject)} aria-label="Delete">
            <MdDelete size={16} />
          </button>
        </div>
      </div>

      <div className="subject-card__body">
        <h3 className="subject-card__name">{subject.name}</h3>
        {subject.description && (
          <p className="subject-card__desc">{subject.description}</p>
        )}
      </div>

      <div className="subject-card__footer">
        <span className="subject-card__date">
          Added {new Date(subject.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

export default memo(SubjectCard);
