import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MdCheckCircle, MdRadioButtonUnchecked, MdArrowForward } from 'react-icons/md';
import { toast } from 'react-toastify';
import taskService from '../../services/taskService';
import Badge from '../../components/ui/Badge/Badge';
import EmptyState from '../../components/ui/EmptyState/EmptyState';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import { ROUTES } from '../../utils/constants';

const PRIORITY_VARIANT = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'success' };

function TodayTasks({ tasks, loading, onTaskToggled }) {
  const handleToggle = useCallback(async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await taskService.updateStatus(task.id, newStatus);
      onTaskToggled(task.id, newStatus);
    } catch {
      toast.error('Failed to update task status');
    }
  }, [onTaskToggled]);

  return (
    <div className="dashboard-widget">
      <div className="dashboard-widget__header">
        <h3 className="dashboard-widget__title">Today's Tasks</h3>
        <Link to={ROUTES.TASKS} className="dashboard-widget__link">
          View all <MdArrowForward size={15} />
        </Link>
      </div>

      {loading && (
        <div className="dashboard-widget__list">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} variant="card" height={52} style={{ marginBottom: 8 }} />
          ))}
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <EmptyState
          icon="✅"
          title="All clear!"
          message="No tasks due today. Great job!"
        />
      )}

      {!loading && tasks.length > 0 && (
        <ul className="today-tasks__list">
          {tasks.slice(0, 6).map(task => (
            <li
              key={task.id}
              className={`today-task${task.status === 'COMPLETED' ? ' today-task--done' : ''}`}
            >
              <button
                className="today-task__check"
                onClick={() => handleToggle(task)}
                aria-label={task.status === 'COMPLETED' ? 'Mark pending' : 'Mark completed'}
              >
                {task.status === 'COMPLETED'
                  ? <MdCheckCircle size={20} color="var(--accent-green)" />
                  : <MdRadioButtonUnchecked size={20} />
                }
              </button>

              <div className="today-task__info">
                <span className="today-task__title">{task.title}</span>
                {task.subjectName && (
                  <span
                    className="today-task__subject"
                    style={{ color: task.subjectColorHex || 'var(--text-muted)' }}
                  >
                    {task.subjectName}
                  </span>
                )}
              </div>

              <Badge variant={PRIORITY_VARIANT[task.priority] || 'primary'}>
                {task.priority}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      {!loading && tasks.length > 6 && (
        <p className="dashboard-widget__more">
          +{tasks.length - 6} more tasks
        </p>
      )}
    </div>
  );
}

export default TodayTasks;
