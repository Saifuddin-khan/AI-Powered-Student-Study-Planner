import React from 'react';
import { Link } from 'react-router-dom';
import { MdArrowForward, MdFlag } from 'react-icons/md';
import ProgressBar from '../../components/ui/ProgressBar/ProgressBar';
import EmptyState from '../../components/ui/EmptyState/EmptyState';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import { ROUTES } from '../../utils/constants';

function daysLeft(targetDate) {
  if (!targetDate) return null;
  const diff = Math.ceil(
    (new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Due today';
  return `${diff}d left`;
}

function goalProgressColor(pct) {
  if (pct >= 80) return 'var(--accent-green)';
  if (pct >= 40) return 'var(--primary)';
  return 'var(--accent-orange)';
}

function UpcomingGoals({ goals, loading }) {
  return (
    <div className="dashboard-widget">
      <div className="dashboard-widget__header">
        <h3 className="dashboard-widget__title">Active Goals</h3>
        <Link to={ROUTES.GOALS} className="dashboard-widget__link">
          View all <MdArrowForward size={15} />
        </Link>
      </div>

      {loading && (
        <div className="dashboard-widget__list">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} variant="card" height={64} style={{ marginBottom: 10 }} />
          ))}
        </div>
      )}

      {!loading && goals.length === 0 && (
        <EmptyState
          icon={<MdFlag size={32} />}
          title="No active goals"
          message="Set a goal to track your progress."
        />
      )}

      {!loading && goals.length > 0 && (
        <ul className="upcoming-goals__list">
          {goals.slice(0, 5).map(goal => (
            <li key={goal.id} className="upcoming-goal">
              <div className="upcoming-goal__header">
                <span className="upcoming-goal__title">{goal.title}</span>
                <span
                  className={`upcoming-goal__days${
                    daysLeft(goal.targetDate) === 'Overdue' ? ' upcoming-goal__days--overdue' : ''
                  }`}
                >
                  {daysLeft(goal.targetDate)}
                </span>
              </div>
              <ProgressBar
                value={goal.progressPercent ?? 0}
                max={100}
                color={goalProgressColor(goal.progressPercent ?? 0)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UpcomingGoals;
