import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MdAdd, MdDelete, MdBarChart, MdAccessTime, MdCalendarToday } from 'react-icons/md';
import { toast } from 'react-toastify';

import progressService from '../../services/progressService';
import subjectService  from '../../services/subjectService';
import PageHeader       from '../../components/common/PageHeader';
import EmptyState       from '../../components/ui/EmptyState/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton/Skeleton';
import ConfirmDialog    from '../../components/ui/ConfirmDialog/ConfirmDialog';
import ProgressForm     from './ProgressForm';
import './Progress.css';

const RANGES = [
  { label: 'This Week',  value: 'week'  },
  { label: 'This Month', value: 'month' },
  { label: 'All Time',   value: 'all'   },
];

function getRangeDates(range) {
  const now = new Date();
  const to  = now.toISOString().split('T')[0];
  if (range === 'week') {
    const d = new Date(now); d.setDate(d.getDate() - 6);
    return { from: d.toISOString().split('T')[0], to };
  }
  if (range === 'month') {
    const d = new Date(now); d.setDate(1);
    return { from: d.toISOString().split('T')[0], to };
  }
  return {};
}

function fmtDuration(mins) {
  if (!mins) return '0 min';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Progress() {
  const [logs,          setLogs]         = useState([]);
  const [summary,       setSummary]      = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [formOpen,      setFormOpen]     = useState(false);
  const [deleteTarget,  setDeleteTarget] = useState(null);
  const [deleting,      setDeleting]     = useState(false);
  const [range,         setRange]        = useState('week');
  const [subjectFilter, setSubjectFilter]= useState('');
  const [subjects,      setSubjects]     = useState([]);
  const [search,        setSearch]       = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = getRangeDates(range);
      if (subjectFilter) params.subjectId = subjectFilter;
      const [logsRes, sumRes] = await Promise.allSettled([
        progressService.getLogs(params),
        progressService.getSummary(),
      ]);
      setLogs(logsRes.status === 'fulfilled' ? (logsRes.value.data?.data ?? []) : []);
      setSummary(sumRes.status === 'fulfilled' ? (sumRes.value.data?.data ?? []) : []);
    } catch { toast.error('Failed to load progress'); }
    finally  { setLoading(false); }
  }, [range, subjectFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    subjectService.getAll().then(r => setSubjects(r.data?.data ?? [])).catch(() => {});
  }, []);

  const handleSave = useCallback(async (data) => {
    await progressService.logSession(data);
    toast.success('Session logged!');
    await load();
  }, [load]);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      await progressService.delete(deleteTarget.id);
      toast.success('Log deleted');
      setLogs(prev => prev.filter(l => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch { toast.error('Failed to delete log'); }
    finally  { setDeleting(false); }
  }, [deleteTarget]);

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(l =>
      (l.notes && l.notes.toLowerCase().includes(q)) ||
      (l.subjectName && l.subjectName.toLowerCase().includes(q))
    );
  }, [logs, search]);

  const totalMins = filteredLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
  const maxSummaryMins = summary.length ? Math.max(...summary.map(s => s.totalMinutes)) : 1;

  return (
    <div className="page-enter progress-page">
      <PageHeader
        title="Study Progress"
        subtitle="Track and review your study sessions"
        accentColor="#F59E0B"
        action={{ label: 'Log Session', onClick: () => setFormOpen(true), icon: <MdAdd size={18} /> }}
      />

      {/* Filters */}
      <div className="prog-filters">
        <div className="prog-filters__pills">
          {RANGES.map(r => (
            <button key={r.value}
              className={`prog-filter-btn${range === r.value ? ' prog-filter-btn--active' : ''}`}
              onClick={() => setRange(r.value)}>
              {r.label}
            </button>
          ))}
        </div>
        <div className="prog-filters__right">
          <select className="prog-select" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="prog-search">
            <input
              className="prog-search__input"
              placeholder="Search notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && <SkeletonList count={4} />}

      {!loading && (
        <div className="prog-layout">
          {/* Left: log list */}
          <div className="prog-logs">
            <div className="prog-logs__header">
              <h3 className="prog-logs__title">
                <MdCalendarToday size={16} /> Sessions
              </h3>
              <span className="prog-logs__meta">
                {filteredLogs.length} session{filteredLogs.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
                <MdAccessTime size={12} style={{ verticalAlign: 'middle' }} /> {fmtDuration(totalMins)}
              </span>
            </div>

            {filteredLogs.length === 0 ? (
              <EmptyState
                icon={<MdBarChart size={36} />}
                title="No sessions yet"
                message="Start logging your study sessions to track progress."
                action={<button className="empty-state-action-btn" onClick={() => setFormOpen(true)}>+ Log Session</button>}
              />
            ) : (
              <div className="prog-log-list">
                {filteredLogs.map(log => (
                  <div key={log.id} className="prog-log-item"
                    style={{ '--log-color': log.subjectColorHex || '#F59E0B' }}>
                    <div className="prog-log-item__date">
                      <span className="prog-log-item__day">
                        {new Date((log.sessionDate || '') + 'T00:00:00')
                          .toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="prog-log-item__full">{fmtDate(log.sessionDate)}</span>
                    </div>
                    <div className="prog-log-item__info">
                      {log.subjectName && (
                        <span className="prog-log-item__subject"
                          style={{ color: log.subjectColorHex || 'var(--text-muted)' }}>
                          {log.subjectName}
                        </span>
                      )}
                      {log.notes && <p className="prog-log-item__notes">{log.notes}</p>}
                    </div>
                    <div className="prog-log-item__dur">
                      <span className="prog-log-item__dur-val">{fmtDuration(log.durationMinutes)}</span>
                    </div>
                    <button className="prog-log-item__del" onClick={() => setDeleteTarget(log)}>
                      <MdDelete size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: subject breakdown */}
          <div className="prog-breakdown">
            <div className="prog-breakdown__header">
              <h3 className="prog-breakdown__title">
                <MdBarChart size={16} /> By Subject
              </h3>
              <span className="prog-breakdown__sub">All time</span>
            </div>

            {summary.length === 0 ? (
              <p className="prog-breakdown__empty">No subject data yet</p>
            ) : (
              <div className="prog-breakdown__list">
                {summary.map(s => {
                  const pct = Math.round((s.totalMinutes / maxSummaryMins) * 100);
                  return (
                    <div key={s.subjectId} className="prog-bar-item">
                      <div className="prog-bar-item__header">
                        <span className="prog-bar-item__dot"
                          style={{ background: s.subjectColorHex || '#F59E0B' }} />
                        <span className="prog-bar-item__name">{s.subjectName}</span>
                        <span className="prog-bar-item__dur">{fmtDuration(s.totalMinutes)}</span>
                      </div>
                      <div className="prog-bar-item__track">
                        <div
                          className="prog-bar-item__fill"
                          style={{ width: `${pct}%`, background: s.subjectColorHex || '#F59E0B' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <ProgressForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSaved={handleSave} />
      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm} loading={deleting}
        title="Delete Log?" message="This study session log will be permanently deleted."
      />
    </div>
  );
}
