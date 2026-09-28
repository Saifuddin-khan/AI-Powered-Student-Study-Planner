import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal/Modal';
import Button from '../ui/Button/Button';
import Spinner from '../ui/Spinner/Spinner';
import subjectService from '../../services/subjectService';
import quizService from '../../services/quizService';
import './QuizGeneratorModal.css';

/**
 * Modal form for generating new quizzes
 * Allows selection of topic, question count, and difficulty
 */
function QuizGeneratorModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTopicId = null,
}) {
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    topicId: defaultTopicId || '',
    questionCount: 10,
    difficulty: 'MEDIUM',
  });

  /* Load subjects with topics on mount */
  useEffect(() => {
    if (!isOpen) return;

    setLoadingSubjects(true);
    subjectService
      .getAll()
      .then((res) => {
        setSubjects(res.data?.data || []);
        if (defaultTopicId && res.data?.data) {
          // Verify default topic exists
          const found = res.data.data.some(
            (s) => s.topics?.some((t) => t.id === defaultTopicId)
          );
          if (!found && res.data.data[0]?.topics?.[0]) {
            setFormData((prev) => ({
              ...prev,
              topicId: res.data.data[0].topics[0].id,
            }));
          }
        } else if (res.data?.data?.[0]?.topics?.[0]) {
          setFormData((prev) => ({
            ...prev,
            topicId: res.data.data[0].topics[0].id,
          }));
        }
      })
      .catch((err) => {
        const message = err.response?.data?.message || 'Failed to load subjects';
        toast.error(message);
      })
      .finally(() => setLoadingSubjects(false));
  }, [isOpen, defaultTopicId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'questionCount' ? parseInt(value) : value,
    }));
  };

  const handleDifficultyChange = (difficulty) => {
    setFormData((prev) => ({ ...prev, difficulty }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.topicId) {
      toast.error('Please select a topic');
      return;
    }

    if (formData.questionCount < 5 || formData.questionCount > 50) {
      toast.error('Question count must be between 5 and 50');
      return;
    }

    setLoading(true);
    try {
      const response = await quizService.generateQuiz(
        formData.topicId,
        formData.questionCount,
        formData.difficulty
      );

      const quiz = response.data?.data;
      if (quiz) {
        toast.success(`Quiz "${quiz.title}" generated successfully!`);
        onSuccess?.(quiz);
        onClose();
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to generate quiz';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getTopics = () => {
    return subjects.flatMap((subject) =>
      (subject.topics || []).map((topic) => ({
        ...topic,
        subjectName: subject.name,
      }))
    );
  };

  const topics = getTopics();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate New Quiz"
      size="md"
      footer={
        <div className="quiz-generator-modal__footer">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={loadingSubjects || !formData.topicId}
          >
            Generate Quiz
          </Button>
        </div>
      }
    >
      <form className="quiz-generator-modal__form" onSubmit={handleSubmit}>
        {loadingSubjects ? (
          <div className="quiz-generator-modal__loading">
            <Spinner />
            <p>Loading subjects...</p>
          </div>
        ) : (
          <>
            {/* Topic Selection */}
            <div className="quiz-generator-modal__field">
              <label htmlFor="topicId" className="quiz-generator-modal__label">
                Topic <span className="required">*</span>
              </label>
              <select
                id="topicId"
                name="topicId"
                value={formData.topicId}
                onChange={handleChange}
                className="quiz-generator-modal__select"
                disabled={loading || topics.length === 0}
                required
              >
                <option value="">Select a topic...</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.subjectName} — {topic.name}
                  </option>
                ))}
              </select>
              {topics.length === 0 && (
                <p className="quiz-generator-modal__hint error">
                  No topics available. Please create a subject with topics first.
                </p>
              )}
            </div>

            {/* Question Count Slider */}
            <div className="quiz-generator-modal__field">
              <label htmlFor="questionCount" className="quiz-generator-modal__label">
                Number of Questions <span className="required">*</span>
              </label>
              <div className="quiz-generator-modal__slider-container">
                <input
                  id="questionCount"
                  type="range"
                  name="questionCount"
                  min="5"
                  max="50"
                  step="1"
                  value={formData.questionCount}
                  onChange={handleChange}
                  className="quiz-generator-modal__slider"
                  disabled={loading}
                />
                <span className="quiz-generator-modal__slider-value">
                  {formData.questionCount}
                </span>
              </div>
              <div className="quiz-generator-modal__slider-marks">
                <span>5</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="quiz-generator-modal__field">
              <label className="quiz-generator-modal__label">
                Difficulty <span className="required">*</span>
              </label>
              <div className="quiz-generator-modal__difficulty-options">
                {['EASY', 'MEDIUM', 'HARD'].map((difficulty) => (
                  <label
                    key={difficulty}
                    className={`quiz-generator-modal__difficulty-option ${
                      formData.difficulty === difficulty ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={difficulty}
                      checked={formData.difficulty === difficulty}
                      onChange={() => handleDifficultyChange(difficulty)}
                      disabled={loading}
                    />
                    <span className="quiz-generator-modal__difficulty-label">
                      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Info Text */}
            <div className="quiz-generator-modal__info">
              <p>
                A {formData.questionCount}-question quiz at {formData.difficulty} difficulty will be
                generated for {topics.find((t) => t.id === formData.topicId)?.name || 'selected topic'}.
              </p>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}

export default QuizGeneratorModal;
