import React, { useMemo } from 'react';
import { MdCheckCircle, MdCancel } from 'react-icons/md';
import './QuestionCard.css';

/**
 * Renders a single quiz question based on its type
 * Supports: MCQ, TRUE_FALSE, SHORT_ANSWER
 */
function QuestionCard({
  question,
  answer,
  onAnswerChange,
  readOnly = false,
  showCorrection = false,
}) {
  const questionType = question.type?.toUpperCase();

  const handleOptionChange = (option) => {
    if (!readOnly && onAnswerChange) {
      onAnswerChange(question.id, option);
    }
  };

  const handleTextChange = (e) => {
    if (!readOnly && onAnswerChange) {
      onAnswerChange(question.id, e.target.value);
    }
  };

  const handleTrueFalseChange = (value) => {
    if (!readOnly && onAnswerChange) {
      onAnswerChange(question.id, value);
    }
  };

  const isCorrect = useMemo(() => {
    if (!showCorrection) return null;
    if (questionType === 'SHORT_ANSWER') {
      // Short answer correctness from API grading
      return question.isCorrect;
    }
    // MCQ and True/False: compare with correctAnswer
    return answer === question.correctAnswer;
  }, [answer, question, showCorrection, questionType]);

  return (
    <div className="question-card">
      {/* Question Header */}
      <div className="question-card__header">
        <h3 className="question-card__text">{question.text}</h3>
        {showCorrection && isCorrect !== null && (
          <div className={`question-card__status ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? (
              <>
                <MdCheckCircle size={20} />
                <span>Correct</span>
              </>
            ) : (
              <>
                <MdCancel size={20} />
                <span>Incorrect</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Render based on question type */}
      {questionType === 'MCQ' && (
        <div className="question-card__options">
          {question.options?.map((option, idx) => (
            <label
              key={idx}
              className={`question-card__option ${answer === option ? 'selected' : ''} ${
                showCorrection && option === question.correctAnswer ? 'correct-answer' : ''
              } ${showCorrection && answer === option && !isCorrect ? 'wrong-answer' : ''}`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={answer === option}
                onChange={() => handleOptionChange(option)}
                disabled={readOnly}
                aria-label={option}
              />
              <span className="question-card__option-text">{option}</span>
            </label>
          ))}
        </div>
      )}

      {questionType === 'TRUE_FALSE' && (
        <div className="question-card__true-false">
          {['True', 'False'].map((option) => (
            <button
              key={option}
              className={`question-card__boolean-btn ${answer === option ? 'selected' : ''} ${
                showCorrection && option === question.correctAnswer ? 'correct-answer' : ''
              } ${showCorrection && answer === option && !isCorrect ? 'wrong-answer' : ''}`}
              onClick={() => handleTrueFalseChange(option)}
              disabled={readOnly}
              aria-pressed={answer === option}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {questionType === 'SHORT_ANSWER' && (
        <div className="question-card__short-answer">
          <textarea
            className="question-card__textarea"
            value={answer || ''}
            onChange={handleTextChange}
            disabled={readOnly}
            placeholder="Type your answer here..."
            maxLength={500}
            rows={4}
            aria-label="Short answer input"
          />
          <div className="question-card__char-count">
            {(answer || '').length} / 500
          </div>
        </div>
      )}

      {/* Show explanation in review mode */}
      {showCorrection && question.explanation && (
        <div className="question-card__explanation">
          <strong>Explanation:</strong>
          <p>{question.explanation}</p>
        </div>
      )}

      {/* Show user's answer vs correct answer in review mode */}
      {showCorrection && questionType !== 'SHORT_ANSWER' && (
        <div className="question-card__review">
          {answer !== question.correctAnswer && (
            <>
              <div className="question-card__review-item wrong">
                <strong>Your Answer:</strong>
                <p>{answer || 'Not answered'}</p>
              </div>
              <div className="question-card__review-item correct">
                <strong>Correct Answer:</strong>
                <p>{question.correctAnswer}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestionCard;
