import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdChevronLeft, MdChevronRight, MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';
import recommendationService from '../../services/recommendationService';
import './RecommendationsCarousel.css';

/**
 * RecommendationsCarousel
 * Displays 3-5 top recommendations in a swipeable carousel
 *
 * Props:
 *  - subjectId: Optional subject ID filter
 *  - limit: Max recommendations to show (default 5)
 *  - autoRefreshMs: Auto-refresh interval in ms (default 10 mins)
 *  - onDismiss: Callback when recommendation dismissed
 */
export default function RecommendationsCarousel({
  subjectId = null,
  limit = 5,
  autoRefreshMs = 600000,
  onDismiss = null,
}) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissing, setIsDismissing] = useState(null);

  /* Load recommendations */
  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await recommendationService.getRecommendations(
        subjectId,
        'ACTIVE',
        0,
        limit
      );
      setRecommendations(res.data?.data?.content || []);
      setCurrentIndex(0);
    } catch (err) {
      console.warn('Failed to load recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, limit]);

  /* Auto-refresh setup */
  useEffect(() => {
    loadRecommendations();
    const interval = setInterval(loadRecommendations, autoRefreshMs);
    return () => clearInterval(interval);
  }, [loadRecommendations, autoRefreshMs]);

  /* Navigate carousel */
  const go = (direction) => {
    if (recommendations.length === 0) return;
    const next = currentIndex + direction;
    setCurrentIndex(
      (next + recommendations.length) % recommendations.length
    );
  };

  /* Handle dismiss */
  const handleDismiss = async (id, e) => {
    e.stopPropagation();
    setIsDismissing(id);
    try {
      await recommendationService.dismissRecommendation(id);
      setRecommendations(r => r.filter(rec => rec.id !== id));
      setCurrentIndex(0);
      if (onDismiss) onDismiss(id);
      toast.success('Recommendation dismissed');
    } catch (err) {
      toast.error('Failed to dismiss recommendation');
      console.error(err);
    } finally {
      setIsDismissing(null);
    }
  };

  /* Handle act now - navigate to quiz */
  const handleActNow = (recommendation) => {
    if (recommendation.targetType === 'QUIZ' && recommendation.targetId) {
      navigate(`/quiz/attempt/${recommendation.targetId}/new`);
    } else if (recommendation.targetType === 'TOPIC' && recommendation.targetId) {
      navigate(`/subjects?topic=${recommendation.targetId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="rc-carousel">
        <div className="rc-loading">Loading recommendations...</div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="rc-carousel">
        <div className="rc-empty">
          <p>No recommendations at the moment. Keep up the great work!</p>
        </div>
      </div>
    );
  }

  const rec = recommendations[currentIndex];
  const priorityColors = {
    HIGH: '#EF4444',
    MEDIUM: '#F59E0B',
    LOW: '#10B981',
  };

  return (
    <div className="rc-carousel">
      <div className="rc-controls">
        <button
          className="rc-btn rc-btn--nav"
          onClick={() => go(-1)}
          aria-label="Previous"
        >
          <MdChevronLeft size={20} />
        </button>

        <div className="rc-slides">
          {recommendations.map((r, idx) => (
            <div
              key={r.id}
              className={`rc-slide ${idx === currentIndex ? 'rc-slide--active' : ''}`}
            >
              {/* Priority badge */}
              <div className="rc-badge" style={{ backgroundColor: priorityColors[r.priority] }}>
                {r.priority}
              </div>

              {/* Recommendation type icon */}
              <div className="rc-icon">
                {r.recommendationType === 'WEAK_TOPIC' && '📚'}
                {r.recommendationType === 'DIFFICULTY' && '📈'}
                {r.recommendationType === 'SCHEDULE' && '⏱️'}
                {r.recommendationType === 'REVIEW' && '🔍'}
              </div>

              {/* Content */}
              <div className="rc-content">
                <h4 className="rc-title">{r.title || 'Recommendation'}</h4>
                <p className="rc-text">{r.description}</p>

                {r.metadata && (
                  <div className="rc-meta">
                    {r.metadata.topicName && (
                      <span className="rc-meta-item">📌 {r.metadata.topicName}</span>
                    )}
                    {r.metadata.currentScore && (
                      <span className="rc-meta-item">
                        Score: {Math.round(r.metadata.currentScore)}%
                      </span>
                    )}
                    {r.metadata.suggestedStudyTime && (
                      <span className="rc-meta-item">
                        ⏲️ {r.metadata.suggestedStudyTime} mins
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="rc-actions">
                <button
                  className="rc-btn rc-btn--primary"
                  onClick={() => handleActNow(rec)}
                  disabled={isDismissing === r.id}
                >
                  Act Now
                </button>
                <button
                  className="rc-btn rc-btn--dismiss"
                  onClick={(e) => handleDismiss(r.id, e)}
                  disabled={isDismissing === r.id}
                  aria-label="Dismiss"
                >
                  <MdClose size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          className="rc-btn rc-btn--nav"
          onClick={() => go(1)}
          aria-label="Next"
        >
          <MdChevronRight size={20} />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="rc-dots">
        {recommendations.map((_, idx) => (
          <button
            key={idx}
            className={`rc-dot ${idx === currentIndex ? 'rc-dot--active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to recommendation ${idx + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="rc-counter">
        {currentIndex + 1} / {recommendations.length}
      </div>
    </div>
  );
}
