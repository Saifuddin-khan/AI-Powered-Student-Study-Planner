import React, { memo, useState } from 'react';
import { MdEdit, MdDelete, MdFlag, MdCalendarToday } from 'react-icons/md';
import Badge from '../../components/ui/Badge/Badge';

const RADIUS = 36;
const CIRC   = 2 * Math.PI * RADIUS;

const STATUS_VARIANT = { IN_PROGRESS: 'info', COMPLETED: 'success', ABANDONED: 'muted' };
const STATUS_LABEL   = { IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', ABANDONED: 'Abandoned' };

function ringColor(pct) {
  if (pct >= 80) return 'var(--accent-green)';
  if (pct >= 40) return 'var(--primary)';
  return 'var(--accent-orange)';
}

function daysLeft(targetDate) {
  if (!targetDate) return null;
  const diff = Math.ceil((new Date(targetDate) - new Date()) / 86400000);
  if (diff < 0) return { text: 'Overdue', overdue: true };
  if (diff === 0) return { text: 'Due today', overdue: false };
  return { text: `${diff} days left`, overdue: false };
}

function GoalCard({ goal, onEdit, onDelete, onUpdateProgress }) {
  const [showProgress, setShowProgress] = useState(false);
  const [slider,       setSlider]       = useState(goal.progressPercent ?? 0);

  const pct    = goal.progressPercent ?? 0;
  const offset = CIRC * (1 - pct / 100);
  const dl     = daysLeft(goal.targetDate);
  const color  = ringColor(pct);

  function handleProgressSave() {
    onUpdateProgress(goal.id, slider);
    setShowProgress(false);
  }

  return (
    <div className="goal-card">
      {/* Header row */}
      <div className="goal-card__header">
        <Badge variant={STATUS_VARIANT[goal.status] || 'primary'}>
          {STATUS_LABEL[goal.status] || goal.status}
        </Badge>
        <div className="goal-card__actions">
          <button className="goal-card__action-btn" onClick={() => onEdit(goal)} aria-label="Edit"><MdEdit size={15} /></button>
          <button className="goal-card__action-btn goal-card__action-btn--danger" onClick={() => onDelete(goal)} aria-label="Delete"><MdDelete size={15} /></button>
        </div>
      </div>

      {/* Ring + info */}
      <div className="goal-card__body">
        <div className="goal-card__ring-wrap">
          <svg viewBox="0 0 88 88" className="goal-card__ring">
            <circle cx="44" cy="44" r={RADIUS} className="goal-card__ring-track" />
            <circle
              cx="44" cy="44" r={RADIUS}
              className="goal-card__ring-fill"
              style={{
                stroke:           color,
                strokeDasharray:  CIRC,
                strokeDashoffset: offset,
              }}
            />
          </svg>
          <span className="goal-card__ring-pct" style={{ color }}>{pct}%</span>
        </div>

        <div className="goal-card__info">
          <h3 className="goal-card__title">{goal.title}</h3>
          {goal.description && <p className="goal-card__desc">{goal.description}</p>}

          {dl && (
            <div className={`goal-card__date${dl.overdue ? ' goal-card__date--overdue' : ''}`}>
              <MdCalendarToday size={12} />
              {dl.text}
            </div>
          )}

          {goal.status === 'IN_PROGRESS' && (
            <button className="goal-card__progress-btn" onClick={() => { setSlider(pct); setShowProgress(s => !s); }}>
              <MdFlag size={13} /> Update Progress
            </button>
          )}
        </div>
      </div>

      {/* Inline progress slider */}
      {showProgress && (
        <div className="goal-card__slider-wrap">
          <div className="goal-card__slider-header">
            <span>Progress</span>
            <span className="goal-card__slider-val">{slider}%</span>
          </div>
          <input type="range" min={0} max={100} step={5}
            value={slider} onChange={e => setSlider(Number(e.target.value))}
            className="goal-card__slider" />
          <div className="goal-card__slider-actions">
            <button className="goal-card__slider-cancel" onClick={() => setShowProgress(false)}>Cancel</button>
            <button className="goal-card__slider-save"   onClick={handleProgressSave}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(GoalCard);
