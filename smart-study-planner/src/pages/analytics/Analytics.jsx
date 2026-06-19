import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiAward, FiTarget, FiTrendingUp, FiActivity } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import './analytics.css';

export default function Analytics() {
  useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data);
    } catch (err) {
      toast.error('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProductivityScore = () => {
    if (!stats) return 0;
    const taskCompletion = stats.tasksToday > 0 ? (1 / Math.max(1, stats.overdueCount + 1)) * 100 : 50;
    const hoursStudied = Math.min(stats.studyHoursWeek * 10, 100);
    const goalProgress = stats.activeGoals > 0 ? (stats.completedThisMonth / Math.max(1, stats.activeGoals)) * 100 : 50;
    return Math.round((taskCompletion + hoursStudied + goalProgress) / 3);
  };

  const calculateCompletionPercentage = () => {
    if (!stats || stats.tasksToday === 0) return 0;
    return Math.round(((stats.tasksToday - stats.overdueCount) / stats.tasksToday) * 100);
  };

  if (loading) return <div className="analytics-loading">Loading analytics...</div>;

  const productivityScore = calculateProductivityScore();
  const completionPercentage = calculateCompletionPercentage();

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p className="subtitle">Track your learning progress and productivity</p>
        </div>
      </div>

      {/* Performance Summary */}
      <section className="analytics-section">
        <h2 className="section-title">📊 Performance Summary</h2>
        <div className="performance-grid">
          <div className="performance-card primary">
            <div className="performance-icon"><FiAward size={32} /></div>
            <div className="performance-content">
              <p className="performance-label">Productivity Score</p>
              <p className="performance-value">{productivityScore}%</p>
              <p className="performance-subtext">Based on tasks, study hours & goals</p>
            </div>
          </div>

          <div className="performance-card accent">
            <div className="performance-icon"><FiTarget size={32} /></div>
            <div className="performance-content">
              <p className="performance-label">Completion Rate</p>
              <p className="performance-value">{completionPercentage}%</p>
              <p className="performance-subtext">Tasks completed</p>
            </div>
          </div>

          <div className="performance-card success">
            <div className="performance-icon"><FiTrendingUp size={32} /></div>
            <div className="performance-content">
              <p className="performance-label">Current Streak</p>
              <p className="performance-value">{stats.currentStreak}</p>
              <p className="performance-subtext">Consecutive days</p>
            </div>
          </div>

          <div className="performance-card info">
            <div className="performance-icon"><FiActivity size={32} /></div>
            <div className="performance-content">
              <p className="performance-label">Study Hours</p>
              <p className="performance-value">{stats.studyHoursWeek}h</p>
              <p className="performance-subtext">This week</p>
            </div>
          </div>
        </div>
      </section>

      {/* Study Overview */}
      {stats && (
        <section className="analytics-section">
          <h2 className="section-title">📈 Study Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Tasks Due Today</div>
              <div className="stat-value">{stats.tasksToday}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Overdue Tasks</div>
              <div className="stat-value" style={{ color: stats.overdueCount > 0 ? '#ef4444' : '#10b981' }}>{stats.overdueCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Study Hours This Week</div>
              <div className="stat-value">{stats.studyHoursWeek}h</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Goals</div>
              <div className="stat-value">{stats.activeGoals}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completed This Month</div>
              <div className="stat-value">{stats.completedThisMonth}</div>
            </div>
          </div>
        </section>
      )}

      {/* Total Learning Activity */}
      <section className="analytics-section">
        <h2 className="section-title">📚 Total Learning Activity Summary</h2>
        <div className="activity-summary">
          <div className="activity-row">
            <span className="activity-label">Weekly Study Hours</span>
            <div className="activity-bar">
              <div className="activity-fill" style={{ width: `${Math.min((stats.studyHoursWeek / 20) * 100, 100)}%` }}></div>
            </div>
            <span className="activity-value">{stats.studyHoursWeek} / 20h</span>
          </div>

          <div className="activity-row">
            <span className="activity-label">Task Completion</span>
            <div className="activity-bar">
              <div className="activity-fill" style={{ width: `${completionPercentage}%` }}></div>
            </div>
            <span className="activity-value">{completionPercentage}%</span>
          </div>

          <div className="activity-row">
            <span className="activity-label">Goal Progress</span>
            <div className="activity-bar">
              <div className="activity-fill" style={{ width: `${stats.activeGoals > 0 ? (stats.completedThisMonth / stats.activeGoals) * 100 : 0}%` }}></div>
            </div>
            <span className="activity-value">{stats.completedThisMonth} / {stats.activeGoals}</span>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="analytics-section recommendations">
        <h2 className="section-title">💡 Insights</h2>
        <div className="recommendation-list">
          {productivityScore >= 80 && <div className="recommendation success">✓ Excellent productivity! Keep it up.</div>}
          {productivityScore < 80 && productivityScore >= 50 && <div className="recommendation warning">→ Increase your study hours to boost productivity.</div>}
          {productivityScore < 50 && <div className="recommendation alert">⚠ Time to kickstart your learning! Set goals and complete tasks regularly.</div>}
          {stats.overdueCount > 0 && <div className="recommendation alert">⚠ {stats.overdueCount} overdue task{stats.overdueCount > 1 ? 's' : ''} — catch up when you can!</div>}
        </div>
      </section>
    </div>
  );
}
