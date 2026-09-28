import React, { useState, useEffect } from 'react';
import { MdTimer } from 'react-icons/md';
import './TimerWidget.css';

/**
 * Countdown timer widget for quizzes
 * Changes color (green → yellow → red) as time runs out
 * Auto-submits when time expires
 */
function TimerWidget({ timeoutSeconds, onTimeExpire, paused = false }) {
  const [timeLeft, setTimeLeft] = useState(timeoutSeconds);
  const [hasWarned, setHasWarned] = useState(false);

  useEffect(() => {
    if (!timeoutSeconds || paused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeoutSeconds, onTimeExpire, paused]);

  /* Warn when 5 minutes remaining */
  useEffect(() => {
    if (!hasWarned && timeLeft <= 300 && timeLeft > 0) {
      setHasWarned(true);
    }
  }, [timeLeft, hasWarned]);

  if (!timeoutSeconds) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / timeoutSeconds) * 100;

  let statusClass = 'timer--green';
  if (percentage <= 25) statusClass = 'timer--red';
  else if (percentage <= 50) statusClass = 'timer--yellow';

  const isWarning = timeLeft <= 300 && timeLeft > 0;

  return (
    <div className={`timer-widget ${statusClass} ${isWarning ? 'timer--warning' : ''}`}>
      <div className="timer-widget__icon">
        <MdTimer size={24} />
      </div>
      <div className="timer-widget__content">
        <div className="timer-widget__time">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="timer-widget__progress-bar">
          <div
            className="timer-widget__progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {isWarning && timeLeft <= 300 && timeLeft > 0 && (
          <div className="timer-widget__warning">Time running out!</div>
        )}
      </div>
    </div>
  );
}

export default TimerWidget;
