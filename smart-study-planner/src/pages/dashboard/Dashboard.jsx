import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import {
  FiCalendar, FiClock, FiCheckSquare, FiTrendingUp, FiTarget,
  FiZap, FiPlus, FiCheckCircle, FiArrowRight,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import './Dashboard.css';

/* ── Study tips — one picked randomly on every mount ─────────── */
const STUDY_TIPS = [
  '💡 Study in 25-min Pomodoro sessions — your focus will skyrocket',
  '💡 Review your notes within 24 hours to boost retention by 60%',
  '💡 Teach what you learn — if you can explain it, you truly know it',
  '💡 Break big topics into small chunks to avoid feeling overwhelmed',
  '💡 Drink water regularly — hydration directly improves concentration',
  '💡 Plan tomorrow\'s study tasks tonight for a stronger head start',
  '💡 Single-focus beats multitasking by up to 40% in productivity',
  '💡 Use spaced repetition to lock concepts into long-term memory',
  '💡 Sleep 7–8 hours — your brain consolidates learning during sleep',
  '💡 Start with the hardest subject when your energy is at its peak',
  '💡 Take a 5-min walk between sessions — movement refreshes the mind',
  '💡 Set a specific goal for each session, not just "study more"',
  '💡 Testing yourself is more effective than re-reading notes',
  '💡 Silence notifications for 25 minutes — deep work compounds fast',
  '💡 Celebrate small wins — consistency beats intensity every time',
];

/* ── Helpers ──────────────────────────────────────────────────── */

function formatFullDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function fmtMins(mins) {
  if (!mins) return '0h';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}.${Math.round(m / 6)}h` : `${h}h`;
}

function getHeatLevel(minutes) {
  if (minutes === 0) return 0;
  if (minutes <= 30) return 1;
  if (minutes <= 60) return 2;
  if (minutes <= 120) return 3;
  return 4;
}

function buildHeatmap(heatmapData) {
  const map = {};
  (heatmapData || []).forEach(d => { map[d.date] = d.minutes; });
  const days = [];
  for (let i = 90; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    days.push({
      date: iso, minutes: map[iso] || 0,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      monthName: d.toLocaleString('en-US', { month: 'short' }),
    });
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

function buildMonthLabels(weeks) {
  const labels = [];
  let lastMonth = null;
  weeks.forEach((week, wi) => {
    if (!week[0]) return;
    const m = week[0].monthName;
    if (m !== lastMonth) { labels.push({ wi, label: m }); lastMonth = m; }
  });
  return labels;
}

function buildWeeklyChart(progressLogs) {
  const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const map = {};
  (progressLogs || []).forEach(d => {
    const day = names[new Date(d.sessionDate).getDay()];
    map[day] = Math.round(((map[day] || 0) + d.durationMinutes / 60) * 10) / 10;
  });
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const day = names[d.getDay()];
    result.push({ day, hours: map[day] || 0 });
  }
  return result;
}

/* ── Skeleton ─────────────────────────────────────────────────── */
function Sk({ h = 16, w = '100%', r = 6, style = {} }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: r, ...style }} />;
}

/* ── Recharts tooltips ────────────────────────────────────────── */
function AreaTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <span>{label}</span> · <strong>{payload[0].value}h</strong>
    </div>
  );
}
function PieTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="custom-tooltip">
      <span>{d.name}</span> · <strong>{Math.round(d.value / 60 * 10) / 10}h</strong>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [data, setData] = useState({
    stats: null, heatmap: [], tasksToday: [], schedule: [],
    weeklyHours: [], subjectDistribution: [],
  });
  const [loading,    setLoading]    = useState(true);
  const [quickTask,  setQuickTask]  = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [heatTip,    setHeatTip]   = useState(null);
  const [tip]                       = useState(
    () => STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)]
  );

  const displayName = user?.name || user?.fullName || user?.username || 'Student';

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const today     = new Date().toISOString().split('T')[0];
      const weekStart = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];
      const dayOfWeek = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][new Date().getDay()];
      const r = await Promise.allSettled([
        api.get('/dashboard/stats'),
        api.get('/dashboard/heatmap?weeks=13'),
        api.get(`/tasks?dueDate=${today}&status=PENDING,IN_PROGRESS`),
        api.get(`/timetable/day/${dayOfWeek}`),
        api.get(`/progress?from=${weekStart}&to=${today}`),
        api.get('/progress/summary'),
      ]);
      const g   = (i) => r[i].status === 'fulfilled' ? r[i].value?.data?.data : null;
      const arr = (i, key) => { const v = g(i); return (key ? v?.[key] : v) || []; };
      setData({
        stats:               g(0),
        heatmap:             arr(1),
        tasksToday:          arr(2, 'content'),
        schedule:            arr(3),
        weeklyHours:         arr(4),
        subjectDistribution: arr(5),
      });
    } catch { toast.error('Failed to load dashboard'); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleQuickAdd = async () => {
    if (!quickTask.trim()) return;
    setAddingTask(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post('/tasks', { title: quickTask, priority: 'MEDIUM', dueDate: today, status: 'PENDING' });
      setQuickTask('');
      toast.success('Task added! ✅');
      const res   = await api.get(`/tasks?dueDate=${today}&status=PENDING,IN_PROGRESS`);
      const tasks = res.data?.data?.content || res.data?.data || [];
      setData(p => ({ ...p, tasksToday: tasks }));
    } catch { toast.error('Failed to add task'); }
    finally   { setAddingTask(false); }
  };

  const handleTaskToggle = async (id, status) => {
    const next = status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.patch(`/tasks/${id}/status`, { status: next });
      setData(p => ({ ...p, tasksToday: p.tasksToday.map(t => t.id === id ? { ...t, status: next } : t) }));
      if (next === 'COMPLETED') toast.success('Task completed! 🎉');
    } catch { toast.error('Failed to update task'); }
  };

  /* ── Derived ──────────────────────────────────────────────────── */
  const heatmapWeeks   = buildHeatmap(data.heatmap);
  const monthLabels    = buildMonthLabels(heatmapWeeks);
  const weeklyChart    = buildWeeklyChart(data.weeklyHours);
  const totalWeekHours = weeklyChart.reduce((s, d) => s + d.hours, 0);
  const dailyAvg       = Math.round(totalWeekHours / 7 * 10) / 10;
  const studyHrsWeek   = data.stats?.studyHoursWeek || 0;
  const weeklyGoal     = data.stats?.weeklyGoalHours || 20;
  const weeklyPct      = Math.min(100, Math.round((studyHrsWeek / weeklyGoal) * 100));
  const pieData        = (data.subjectDistribution || []).map(s => ({
    name: s.subjectName, value: s.totalMinutes, color: s.subjectColorHex || '#7C6FCD',
  }));
  const totalPieMins   = pieData.reduce((s, d) => s + d.value, 0);
  const todayName      = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const nowMins        = new Date().getHours() * 60 + new Date().getMinutes();
  const currentMonth   = new Date().getMonth();
  const monthMins      = data.heatmap
    .filter(d => new Date(d.date).getMonth() === currentMonth)
    .reduce((s, d) => s + (d.minutes || 0), 0);

  /* ── Loading skeleton ─────────────────────────────────────────── */
  if (loading) return (
    <div className="dashboard-page">
      <div className="dash-card welcome-banner"><Sk h={36} w="45%" /><Sk h={14} w="30%" style={{ marginTop: 10 }} /></div>
      <div className="stats-row">
        {[1,2,3,4].map(i => (
          <div key={i} className="dash-card stat-card">
            <Sk h={46} w={46} r={10} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}><Sk h={28} w="55%" /><Sk h={12} w="75%" style={{ marginTop: 8 }} /></div>
          </div>
        ))}
      </div>
      <div className="middle-grid">
        <div className="dash-card"><Sk h={220} /></div>
        <div className="dash-card"><Sk h={220} /></div>
      </div>
      <div className="dash-card"><Sk h={160} /></div>
      <div className="charts-grid">
        <div className="dash-card"><Sk h={240} /></div>
        <div className="dash-card"><Sk h={240} /></div>
      </div>
    </div>
  );

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="page-enter dashboard-page">

      {/* ═══ 1. WELCOME BANNER ════════════════════════════════════ */}
      <div className="dash-card welcome-banner">
        <div className="welcome-left">
          <h1 className="welcome-greeting">Welcome Back, {displayName} 👋</h1>
          <p className="welcome-date">{formatFullDate()}</p>
          <div className="welcome-tip">{tip}</div>
        </div>
        <div className="welcome-actions">
          <button className="wb-btn-ghost" onClick={() => navigate('/planner')}>
            <FiCalendar size={14} /> Open Planner
          </button>
          <button className="wb-btn-primary" onClick={() => navigate('/pomodoro')}>
            <FiClock size={14} /> Start Focus
          </button>
        </div>
      </div>

      {/* ═══ 2. STATS ROW ═════════════════════════════════════════ */}
      <div className="stats-row">

        <div className="dash-card stat-card">
          <div className="stat-icon-box">
            <FiCheckSquare size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{data.stats?.tasksToday ?? 0}</div>
            <div className="stat-label">Tasks Due Today</div>
            <div className="stat-trend">
              {(data.stats?.overdueCount ?? 0) > 0
                ? <span className="trend-down">↓ {data.stats.overdueCount} overdue</span>
                : <span className="trend-up">✓ All on track</span>}
            </div>
          </div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-icon-box">
            <FiTrendingUp size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{fmtMins(studyHrsWeek * 60)}</div>
            <div className="stat-label">Study Hours This Week</div>
            <div className="stat-mini-bar">
              <div className="stat-mini-fill" style={{ width: `${weeklyPct}%` }} />
            </div>
            <div className="stat-mini-text">{studyHrsWeek} / {weeklyGoal}h weekly goal</div>
          </div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-icon-box">
            <FiTarget size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{data.stats?.activeGoals ?? 0}</div>
            <div className="stat-label">Active Goals</div>
            <div className="stat-trend">
              <span className="trend-up">✓ {data.stats?.completedThisMonth ?? 0} done this month</span>
            </div>
          </div>
        </div>

        <div className="dash-card stat-card">
          <div className="stat-icon-box">
            <FiZap size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {data.stats?.currentStreak ?? 0}
              <span className="stat-days-sup">DAYS</span>
            </div>
            <div className="stat-label">Current Streak</div>
            <div className="stat-trend">
              🏆 Best: {data.stats?.longestStreak ?? 0} days
            </div>
          </div>
        </div>

      </div>

      {/* ═══ 3. MIDDLE GRID (Tasks + Schedule) ═══════════════════ */}
      <div className="middle-grid">

        {/* Today's Tasks */}
        <div className="dash-card" style={{ borderLeft: '4px solid #FB923C' }}>
          <div className="dash-card-header">
            <span className="dash-card-title">Today's Tasks</span>
            <Link to="/tasks" className="dash-card-link">View all <FiArrowRight size={12} /></Link>
          </div>
          <div className="quick-add-row">
            <input
              className="quick-add-input"
              placeholder="Quick add a task..."
              value={quickTask}
              onChange={e => setQuickTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
            />
            <button className="quick-add-btn" onClick={handleQuickAdd} disabled={addingTask}>
              <FiPlus size={16} />
            </button>
          </div>
          {data.tasksToday.length === 0 ? (
            <div className="empty-state">
              <FiCheckCircle size={36} color="#4ADE80" />
              <div className="empty-title" style={{ color: '#4ADE80' }}>All clear!</div>
              <div className="empty-sub">No tasks due today.</div>
            </div>
          ) : (
            data.tasksToday.slice(0, 6).map(task => (
              <div key={task.id} className={`task-row${task.status === 'COMPLETED' ? ' task-done' : ''}`}>
                <div
                  className={`task-checkbox${task.status === 'COMPLETED' ? ' checked' : ''}`}
                  onClick={() => handleTaskToggle(task.id, task.status)}
                >
                  {task.status === 'COMPLETED' && '✓'}
                </div>
                <span className={`task-title${task.status === 'COMPLETED' ? ' done' : ''}`}>
                  {task.title}
                </span>
                {task.subject && (
                  <span className="subj-pill" style={{
                    background: `${task.subject.colorHex || '#7C6FCD'}1A`,
                    border: `1px solid ${task.subject.colorHex || '#7C6FCD'}50`,
                    color: task.subject.colorHex || '#7C6FCD',
                  }}>{task.subject.name}</span>
                )}
                <span className={`priority-badge p-${(task.priority || 'MEDIUM').toLowerCase()}`}>
                  {(task.priority || 'MED').substring(0, 3)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Today's Schedule */}
        <div className="dash-card" style={{ borderLeft: '4px solid #34D399' }}>
          <div className="dash-card-header">
            <span className="dash-card-title">Today's Schedule</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="day-pill">{todayName}</span>
              <Link to="/timetable" className="dash-card-link"><FiArrowRight size={12} /></Link>
            </div>
          </div>
          {data.schedule.length === 0 ? (
            <div className="empty-state">
              <FiCalendar size={34} color="#94A3B8" />
              <div className="empty-sub">No classes scheduled today</div>
              <Link to="/timetable" className="dash-card-link" style={{ marginTop: 8 }}>Set up timetable →</Link>
            </div>
          ) : (
            data.schedule.map((slot, i) => {
              const [sh, sm] = (slot.startTime || '00:00').split(':').map(Number);
              const [eh, em] = (slot.endTime   || '00:00').split(':').map(Number);
              const isNow    = nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
              const durH     = Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 10) / 10;
              const startFmt = `${String(sh).padStart(2,'0')}:${String(sm).padStart(2,'0')}`;
              const endFmt   = `${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}`;
              return (
                <div key={i} className={`schedule-slot${isNow ? ' slot-now' : ''}`}>
                  <div className="slot-accent" style={{ background: slot.colorHex || '#7C6FCD' }} />
                  <div className="slot-body">
                    <span className="slot-name">{slot.subjectName || slot.label || 'Class'}</span>
                    <div className="slot-meta">
                      <span>{startFmt} – {endFmt}</span>
                      <span className="slot-sep">·</span>
                      <span>{durH}h</span>
                    </div>
                  </div>
                  {isNow && <span className="slot-now-badge">Now</span>}
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ═══ 4. ACTIVITY HEATMAP (full width) ════════════════════ */}
      <div className="dash-card heatmap-card">
        <div className="dash-card-header">
          <span className="dash-card-title">Study Activity</span>
          <span className="dash-card-meta">Last 13 weeks</span>
        </div>

        {/* Month labels */}
        <div className="heatmap-months">
          {monthLabels.map((m, i) => (
            <span key={i} style={{ left: m.wi * 14 + 'px' }}>{m.label}</span>
          ))}
        </div>

        {/* Day labels + grid */}
        <div className="heatmap-layout">
          <div className="heatmap-day-labels">
            {['M','T','W','T','F','S','S'].map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="heatmap-grid-wrap">
            <div className="heatmap-grid">
              {heatmapWeeks.map((week, wi) => (
                <div key={wi} className="heatmap-week">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className="heatmap-day"
                      data-level={getHeatLevel(day.minutes)}
                      onMouseEnter={e => setHeatTip({ text: `${day.label} · ${day.minutes}m studied`, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHeatTip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend + summary in one row */}
        <div className="heatmap-footer">
          <div className="heatmap-legend">
            <span>Less</span>
            {[0,1,2,3,4].map(l => (
              <div key={l} className="heatmap-day" data-level={l} style={{ pointerEvents: 'none' }} />
            ))}
            <span>More</span>
          </div>
          <div className="heatmap-summary">
            <div className="hm-stat">
              <div className="hm-stat-val">{fmtMins(monthMins)}</div>
              <div className="hm-stat-lbl">This Month</div>
            </div>
            <div className="hm-stat-div" />
            <div className="hm-stat">
              <div className="hm-stat-val">{data.stats?.currentStreak ?? 0} 🔥</div>
              <div className="hm-stat-lbl">Day Streak</div>
            </div>
            <div className="hm-stat-div" />
            <div className="hm-stat">
              <div className="hm-stat-val">{data.stats?.longestStreak ?? 0}</div>
              <div className="hm-stat-lbl">Best Streak</div>
            </div>
          </div>
        </div>

        {data.heatmap.length === 0 && (
          <p className="heatmap-empty">Start studying to build your streak! 🔥</p>
        )}
      </div>

      {/* ═══ 5. CHARTS GRID ═══════════════════════════════════════ */}
      <div className="charts-grid">

        {/* Weekly Area Chart */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Study Hours</span>
            <span className="dash-card-meta">This week</span>
          </div>
          {weeklyChart.every(d => d.hours === 0) ? (
            <div className="empty-state" style={{ height: 200 }}>
              <FiTrendingUp size={30} color="#94A3B8" />
              <div className="empty-sub">No study data yet. Start a session!</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyChart} margin={{ top: 5, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7C6FCD" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#7C6FCD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E8ECF4" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <ReTooltip content={<AreaTip />} />
                <Area type="monotone" dataKey="hours" stroke="#7C6FCD" strokeWidth={2}
                  fill="url(#dashAreaGrad)"
                  dot={{ fill: '#7C6FCD', r: 4 }}
                  activeDot={{ r: 6, fill: '#7C6FCD', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <div className="chart-footer">
            <span>This week: <strong>{Math.round(totalWeekHours * 10) / 10}h</strong></span>
            <span>Daily avg: <strong>{dailyAvg}h</strong></span>
          </div>
        </div>

        {/* Subject Donut */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Study by Subject</span>
          </div>
          {pieData.length === 0 ? (
            <div className="empty-state" style={{ height: 200 }}>
              <div className="empty-sub">Add subjects to see distribution</div>
            </div>
          ) : (
            <>
              <div style={{ position: 'relative' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <ReTooltip content={<PieTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center">
                  <div className="donut-total">{Math.round(totalPieMins / 60 * 10) / 10}h</div>
                  <div className="donut-lbl">Total</div>
                </div>
              </div>
              <div className="pie-legend">
                {pieData.slice(0, 5).map((d, i) => (
                  <div key={i} className="pie-legend-item">
                    <span className="pie-dot" style={{ background: d.color }} />
                    <span className="pie-name">{d.name}</span>
                    <span className="pie-pct">
                      {totalPieMins ? Math.round(d.value / totalPieMins * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>


      {/* Heatmap hover tooltip */}
      {heatTip && (
        <div className="heatmap-tooltip" style={{ left: heatTip.x, top: heatTip.y - 8 }}>
          {heatTip.text}
        </div>
      )}

    </div>
  );
}
