import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MdPlayArrow, MdPause, MdReplay, MdTimer, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';
import { toast } from 'react-toastify';

import pomodoroService from '../../services/pomodoroService';
import subjectService  from '../../services/subjectService';
import PageHeader       from '../../components/common/PageHeader';
import Badge            from '../../components/ui/Badge/Badge';
import './Pomodoro.css';

/* ── Config ──────────────────────────────────────────────── */
const MODES = {
  FOCUS:       { label: 'Focus',       minutes: 25, color: '#7C6FCD', sessionType: 'FOCUS'       },
  SHORT_BREAK: { label: 'Short Break', minutes:  5, color: '#4ADE80', sessionType: 'SHORT_BREAK' },
  LONG_BREAK:  { label: 'Long Break',  minutes: 15, color: '#60A5FA', sessionType: 'LONG_BREAK'  },
};

const RADIUS      = 100;
const CX          = 120;
const CY          = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 628.318

function fmtTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function fmtTimeStamp(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function sessionBadgeVariant(t) {
  if (t === 'FOCUS')       return 'primary';
  if (t === 'SHORT_BREAK') return 'success';
  return 'info';
}
function sessionLabel(t) {
  if (t === 'FOCUS')       return 'Focus';
  if (t === 'SHORT_BREAK') return 'Short Break';
  return 'Long Break';
}

/* ── Component ──────────────────────────────────────────── */
export default function Pomodoro() {
  const [mode,          setMode]         = useState('FOCUS');
  const [timeLeft,      setTimeLeft]     = useState(MODES.FOCUS.minutes * 60);
  const [running,       setRunning]      = useState(false);
  const [sessionId,     setSessionId]    = useState(null);
  const [sessionCount,  setSessionCount] = useState(0);
  const [subjectId,     setSubjectId]    = useState('');
  const [subjects,      setSubjects]     = useState([]);
  const [history,       setHistory]      = useState([]);
  const [loadingStart,  setLoadingStart] = useState(false);

  /* Refs to avoid stale closure issues inside setInterval */
  const timerRef      = useRef(null);
  const sessionIdRef  = useRef(null);
  const modeRef       = useRef('FOCUS');
  const countRef      = useRef(0);
  const completeRef   = useRef(null);

  /* Keep refs in sync */
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { modeRef.current = mode; },          [mode]);
  useEffect(() => { countRef.current = sessionCount; }, [sessionCount]);

  /* Load subjects + history on mount */
  const loadHistory = useCallback(async () => {
    try {
      const res = await pomodoroService.getHistory({});
      setHistory(res.data?.data ?? []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    subjectService.getAll().then(r => setSubjects(r.data?.data ?? [])).catch(() => {});
    loadHistory();
  }, [loadHistory]);

  /* ── Timer complete handler (always up-to-date via ref) ── */
  async function onTimerComplete() {
    clearInterval(timerRef.current);
    setRunning(false);

    const sid = sessionIdRef.current;
    if (sid) {
      try { await pomodoroService.completeSession(sid); }
      catch { toast.error('Could not save completed session'); }
      setSessionId(null);
      sessionIdRef.current = null;
    }

    const currentMode = modeRef.current;
    const count       = countRef.current;

    if (currentMode === 'FOCUS') {
      const newCount = count + 1;
      setSessionCount(newCount);
      countRef.current = newCount;
      if (newCount % 4 === 0) {
        switchMode('LONG_BREAK');
        toast.success('Great work! Time for a long break 🎉');
      } else {
        switchMode('SHORT_BREAK');
        toast.success('Focus session done! Take a short break ☕');
      }
    } else {
      switchMode('FOCUS');
      toast.info("Break's over. Let's focus! 💪");
    }

    loadHistory();
  }

  /* Keep onTimerComplete ref always current */
  useEffect(() => { completeRef.current = onTimerComplete; });

  /* ── Interval ────────────────────────────────────────── */
  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          completeRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  /* ── Switch mode ─────────────────────────────────────── */
  function switchMode(newMode) {
    clearInterval(timerRef.current);
    setMode(newMode);
    modeRef.current = newMode;
    setTimeLeft(MODES[newMode].minutes * 60);
    setRunning(false);
  }

  function handleModeTab(newMode) {
    if (newMode === mode) return;
    switchMode(newMode);
    setSessionId(null);
    sessionIdRef.current = null;
  }

  /* ── Start / Pause ───────────────────────────────────── */
  async function handleStartPause() {
    if (running) {
      clearInterval(timerRef.current);
      setRunning(false);
      return;
    }
    /* Resume — session already created */
    if (sessionId) {
      setRunning(true);
      return;
    }
    /* First start — create session in backend */
    setLoadingStart(true);
    try {
      const payload = {
        sessionType:     MODES[mode].sessionType,
        durationMinutes: MODES[mode].minutes,
      };
      if (subjectId) payload.subjectId = Number(subjectId);
      const res = await pomodoroService.startSession(payload);
      const id  = res.data?.data?.id;
      setSessionId(id);
      sessionIdRef.current = id;
      setRunning(true);
    } catch {
      toast.error('Failed to start session');
    } finally {
      setLoadingStart(false);
    }
  }

  /* ── Reset ───────────────────────────────────────────── */
  function handleReset() {
    clearInterval(timerRef.current);
    setRunning(false);
    setTimeLeft(MODES[mode].minutes * 60);
    setSessionId(null);
    sessionIdRef.current = null;
  }

  /* ── Derived ring values ─────────────────────────────── */
  const totalSecs  = MODES[mode].minutes * 60;
  const pct        = timeLeft / totalSecs;
  const dashOffset = CIRCUMFERENCE * (1 - pct);
  const modeColor  = MODES[mode].color;

  return (
    <div className="page-enter pom-page">
      <PageHeader
        title="Pomodoro Timer"
        subtitle="Focus in timed intervals to boost productivity"
        accentColor="#7C6FCD"
      />

      <div className="pom-center">
        {/* ── Mode tabs ── */}
        <div className="pom-tabs">
          {Object.entries(MODES).map(([key, cfg]) => (
            <button
              key={key}
              className={`pom-tab${mode === key ? ' pom-tab--active' : ''}`}
              style={mode === key ? { '--tab-color': cfg.color } : {}}
              onClick={() => handleModeTab(key)}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {/* ── Subject selector ── */}
        <div className="pom-subject">
          <select
            className="pom-subject__select"
            value={subjectId}
            onChange={e => setSubjectId(e.target.value)}
            disabled={running}
          >
            <option value="">No subject selected</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* ── Timer ring ── */}
        <div className="pom-ring" style={{ '--pom-color': modeColor }}>
          <svg
            viewBox="0 0 240 240"
            className={`pom-ring__svg${running ? ' pom-ring__svg--running' : ''}`}
            style={{ '--pom-color': modeColor }}
          >
            {/* Background track */}
            <circle
              cx={CX} cy={CY} r={RADIUS}
              fill="none"
              stroke="var(--bg-elevated)"
              strokeWidth={14}
            />
            {/* Progress arc */}
            <circle
              cx={CX} cy={CY} r={RADIUS}
              fill="none"
              stroke={modeColor}
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${CX} ${CY})`}
              style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>

          {/* Center content */}
          <div className="pom-ring__center">
            <span className="pom-ring__time" style={{ color: modeColor }}>
              {fmtTime(timeLeft)}
            </span>
            <span className="pom-ring__mode">{MODES[mode].label}</span>
            <div className="pom-ring__dots">
              {Array.from({ length: 4 }, (_, i) => {
                const filled = mode === 'FOCUS'
                  ? i < (sessionCount % 4 === 0 && sessionCount > 0 ? 4 : sessionCount % 4)
                  : i < sessionCount % 4;
                return filled
                  ? <MdCheckCircle key={i} size={14} style={{ color: modeColor }} />
                  : <MdRadioButtonUnchecked key={i} size={14} style={{ color: 'var(--text-muted)' }} />;
              })}
            </div>
            <span className="pom-ring__count">
              Session {sessionCount + (mode === 'FOCUS' ? 1 : 0)}
            </span>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="pom-controls">
          <button
            className="pom-ctrl pom-ctrl--reset"
            onClick={handleReset}
            title="Reset timer"
            disabled={loadingStart}
          >
            <MdReplay size={20} />
          </button>

          <button
            className={`pom-ctrl pom-ctrl--main${running ? ' pom-ctrl--pause' : ''}`}
            style={{ '--pom-color': modeColor }}
            onClick={handleStartPause}
            disabled={loadingStart}
          >
            {loadingStart
              ? <span className="pom-ctrl__spinner" />
              : running
                ? <MdPause size={28} />
                : <MdPlayArrow size={28} />
            }
          </button>
        </div>

        {/* ── Tip ── */}
        {!running && timeLeft === MODES[mode].minutes * 60 && (
          <p className="pom-tip">
            {mode === 'FOCUS'
              ? 'Select a subject and press play to start focusing'
              : 'Take a breather — press play when ready'}
          </p>
        )}
        {running && (
          <p className="pom-tip pom-tip--active" style={{ color: modeColor }}>
            Stay focused — you can do it!
          </p>
        )}
      </div>

      {/* ── Session History ── */}
      <div className="pom-history">
        <div className="pom-history__header">
          <MdTimer size={18} />
          <h3 className="pom-history__title">Recent Sessions</h3>
          <span className="pom-history__count">{history.length} total</span>
        </div>

        {history.length === 0 ? (
          <p className="pom-history__empty">No sessions recorded yet. Start your first Pomodoro!</p>
        ) : (
          <div className="pom-history__list">
            {history.slice(0, 15).map(s => (
              <div key={s.id} className="pom-hist-item">
                <div className={`pom-hist-item__dot pom-hist-item__dot--${s.completed || s.isCompleted ? 'done' : 'partial'}`} />
                <div className="pom-hist-item__info">
                  <span className="pom-hist-item__time">{fmtTimeStamp(s.startedAt)}</span>
                  {s.subjectName && (
                    <span className="pom-hist-item__subject">{s.subjectName}</span>
                  )}
                </div>
                <Badge variant={sessionBadgeVariant(s.sessionType)} size="sm">
                  {sessionLabel(s.sessionType)}
                </Badge>
                <span className="pom-hist-item__dur">{s.durationMinutes} min</span>
                <span className={`pom-hist-item__status${s.completed || s.isCompleted ? ' pom-hist-item__status--done' : ''}`}>
                  {s.completed || s.isCompleted ? '✓' : '⏸'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
