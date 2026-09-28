import React from 'react';
import './QuizProgressBar.css';

/**
 * Visual progress indicator for quiz attempts
 * Shows current question position and optionally marks answered/unanswered status
 */
function QuizProgressBar({
  current = 1,
  total = 10,
  answeredCount = 0,
  markedForReview = [],
}) {
  const percentage = (current / total) * 100;

  return (
    <div className="quiz-progress-bar">
      <div className="quiz-progress-bar__info">
        <div className="quiz-progress-bar__counter">
          Question <strong>{current}</strong> of <strong>{total}</strong>
        </div>
        <div className="quiz-progress-bar__stats">
          {answeredCount > 0 && (
            <span className="quiz-progress-bar__stat answered">
              ✓ {answeredCount} Answered
            </span>
          )}
          {markedForReview.length > 0 && (
            <span className="quiz-progress-bar__stat marked">
              ⚡ {markedForReview.length} Marked
            </span>
          )}
        </div>
      </div>

      <div className="quiz-progress-bar__container">
        <div
          className="quiz-progress-bar__fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin="1"
          aria-valuemax={total}
        />
      </div>

      <div className="quiz-progress-bar__percentage">{Math.round(percentage)}%</div>
    </div>
  );
}

export default QuizProgressBar;
