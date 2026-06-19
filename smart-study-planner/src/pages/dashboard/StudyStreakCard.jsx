import React from 'react';
import { MdLocalFireDepartment, MdEmojiEvents } from 'react-icons/md';

function StudyStreakCard({ currentStreak = 0, longestStreak = 0 }) {
  return (
    <div className="streak-card">
      <div className="streak-card__flame-wrap">
        <MdLocalFireDepartment className="streak-card__flame-icon" />
      </div>
      <div className="streak-card__body">
        <div className="streak-card__count">
          {currentStreak}
          <span className="streak-card__unit">days</span>
        </div>
        <div className="streak-card__label">Current Streak</div>
        <div className="streak-card__best">
          <MdEmojiEvents size={13} />
          Best: {longestStreak} days
        </div>
      </div>
    </div>
  );
}

export default StudyStreakCard;
