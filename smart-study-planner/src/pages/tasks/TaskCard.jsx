import React, { memo } from 'react';
import { MdCheckCircle, MdRadioButtonUnchecked, MdEdit, MdDelete, MdCalendarToday } from 'react-icons/md';
import Badge from '../../components/ui/Badge/Badge';
import { PRIORITY_COLORS } from '../../utils/constants';

const PRIORITY_VARIANT = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'success' };
const STATUS_VARIANT   = { PENDING: 'warning', IN_PROGRESS: 'info', COMPLETED: 'success' };
const STATUS_LABEL     = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Done' };

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'COMPLETED') return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(task.dueDate, task.status);
  const done    = task.status === 'COMPLETED';

  return (
    <div className={`task-card${done ? ' task-card--done' : ''}${overdue ? ' task-card--overdue' : ''}`}
         style={{ '--task-priority': PRIORITY_COLORS[task.priority] }}>

      <button className="task-card__check" onClick={() => onToggle(task)} aria-label="Toggle status">
        {done
          ? <MdCheckCircle size={22} color="var(--accent-green)" />
          : <MdRadioButtonUnchecked size={22} />}
      </button>

      <div className="task-card__content">
        <div className="task-card__header">
          <h4 className="task-card__title">{task.title}</h4>
          <div className="task-card__badges">
            <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
            <Badge variant={STATUS_VARIANT[task.status]}>{STATUS_LABEL[task.status]}</Badge>
          </div>
        </div>

        {task.description && (
          <p className="task-card__desc">{task.description}</p>
        )}

        <div className="task-card__meta">
          {task.subjectName && (
            <span className="task-card__subject" style={{ color: task.subjectColorHex || 'var(--text-muted)' }}>
              ● {task.subjectName}
            </span>
          )}
          {task.dueDate && (
            <span className={`task-card__due${overdue ? ' task-card__due--overdue' : ''}`}>
              <MdCalendarToday size={12} />
              {overdue ? 'Overdue · ' : ''}{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      <div className="task-card__actions">
        <button className="task-card__action-btn" onClick={() => onEdit(task)} aria-label="Edit task">
          <MdEdit size={16} />
        </button>
        <button className="task-card__action-btn task-card__action-btn--danger" onClick={() => onDelete(task)} aria-label="Delete task">
          <MdDelete size={16} />
        </button>
      </div>
    </div>
  );
}

export default memo(TaskCard);
