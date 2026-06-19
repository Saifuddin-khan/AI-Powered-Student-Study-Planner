import React from 'react';
import { MdCheckCircle } from 'react-icons/md';
import Card from '../ui/Card/Card';
import './WeeklyBreakdown.css';

export default function WeeklyBreakdown({ weeks = [] }) {
  if (!weeks || weeks.length === 0) {
    return (
      <div className="weekly-breakdown">
        <p className="empty-state">No weeks in plan</p>
      </div>
    );
  }

  return (
    <div className="weekly-breakdown">
      <div className="weeks-grid">
        {weeks.map((week, idx) => (
          <Card key={idx} className="week-card" hoverable>
            <div className="week-card__header">
              <h3 className="week-card__title">Week {week.weekNumber || idx + 1}</h3>
              <span className="week-card__focus">{week.focusArea || 'General Review'}</span>
            </div>

            <div className="week-card__topics">
              <h4 className="week-card__subtitle">Topics to Cover</h4>
              {week.topics && week.topics.length > 0 ? (
                <ul className="topics-list">
                  {week.topics.map((topic, i) => (
                    <li key={i} className="topic-item">
                      <MdCheckCircle size={14} className="topic-icon" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-topics">No specific topics defined</p>
              )}
            </div>

            {week.studyHours && (
              <div className="week-card__meta">
                <span className="meta-label">Recommended Hours</span>
                <span className="meta-value">{week.studyHours}h</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
