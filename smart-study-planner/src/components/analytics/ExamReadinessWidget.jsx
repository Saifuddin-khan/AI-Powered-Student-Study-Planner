import React from 'react';
import { MdTrendingUp, MdWarning, MdCheckCircle } from 'react-icons/md';
import './ExamReadinessWidget.css';

/**
 * ExamReadinessWidget
 * Reusable component displaying exam readiness with circular progress and metadata
 *
 * Props:
 *  - readinessScore (0-100): Current readiness percentage
 *  - masteredTopics (number): Topics marked as mastered
 *  - totalTopics (number): Total topics for this subject
 *  - studyTimeRemaining (number): Hours of study time remaining
 *  - confidenceLevel ('LOW' | 'MEDIUM' | 'HIGH'): Confidence indicator
 *  - isLoading (bool): Show spinner while loading
 *  - onClick (func): Optional callback when clicked
 *  - compact (bool): Show compact version (for dashboard)
 */
export default function ExamReadinessWidget({
  readinessScore = 0,
  masteredTopics = 0,
  totalTopics = 0,
  studyTimeRemaining = 0,
  confidenceLevel = 'LOW',
  isLoading = false,
  onClick = null,
  compact = false,
}) {
  /* Determine color based on readiness score */
  const getColor = (score) => {
    if (score < 30) return '#EF4444'; // red
    if (score < 70) return '#F59E0B'; // amber
    return '#10B981'; // green
  };

  const color = getColor(readinessScore);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - readinessScore / 100);

  /* Confidence level icon */
  const confidenceIcons = {
    LOW: <MdWarning size={16} />,
    MEDIUM: <MdTrendingUp size={16} />,
    HIGH: <MdCheckCircle size={16} />,
  };

  const confidenceColors = {
    LOW: '#EF4444',
    MEDIUM: '#F59E0B',
    HIGH: '#10B981',
  };

  if (isLoading) {
    return (
      <div className={`erw ${compact ? 'erw--compact' : ''}`}>
        <div className="erw__spinner">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`erw ${compact ? 'erw--compact' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Circular progress indicator */}
      <div className="erw__progress">
        <svg viewBox="0 0 100 100" className="erw__svg">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease',
            }}
          />
        </svg>
        <div className="erw__score">{readinessScore}%</div>
      </div>

      {/* Metadata */}
      {!compact && (
        <div className="erw__info">
          <div className="erw__metric">
            <span className="erw__metric-label">Mastered</span>
            <span className="erw__metric-value">
              {masteredTopics}/{totalTopics} topics
            </span>
          </div>

          <div className="erw__metric">
            <span className="erw__metric-label">Study Time Left</span>
            <span className="erw__metric-value">
              {studyTimeRemaining}h
            </span>
          </div>

          <div className="erw__confidence">
            <div className="erw__confidence-icon" style={{ color: confidenceColors[confidenceLevel] }}>
              {confidenceIcons[confidenceLevel]}
            </div>
            <div className="erw__confidence-text">
              <span className="erw__confidence-label">Confidence</span>
              <span className="erw__confidence-level">{confidenceLevel}</span>
            </div>
          </div>
        </div>
      )}

      {/* Compact version: show score inside circle only */}
      {compact && (
        <div className="erw__subtitle">
          {masteredTopics}/{totalTopics} mastered
        </div>
      )}
    </div>
  );
}
