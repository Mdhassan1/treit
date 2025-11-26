import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage, STORAGE_KEYS } from "../../../utils/storage";
import "./ScoreboardPage.css";

const ScoreboardPage = () => {
  const navigate = useNavigate();
  const [highScores, setHighScores] = useState(
    storage.getItem(STORAGE_KEYS.HIGH_SCORES) || []
  );
  const [reviews, setReviews] = useState(
    storage.getItem(STORAGE_KEYS.REVIEWS) || []
  );

  const handleBackToHome = () => {
    navigate("/");
  };

  const deleteScore = (index) => {
    if (window.confirm("Are you sure you want to delete this score?")) {
      const updatedScores = highScores.filter((_, i) => i !== index);
      setHighScores(updatedScores);
      storage.setItem(STORAGE_KEYS.HIGH_SCORES, updatedScores);
    }
  };

  const deleteReview = (index) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      const updatedReviews = reviews.filter((_, i) => i !== index);
      setReviews(updatedReviews);
      storage.setItem(STORAGE_KEYS.REVIEWS, updatedReviews);
    }
  };

  const clearAllScores = () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL scores? This cannot be undone!"
      )
    ) {
      setHighScores([]);
      storage.setItem(STORAGE_KEYS.HIGH_SCORES, []);
    }
  };

  const clearAllReviews = () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL reviews? This cannot be undone!"
      )
    ) {
      setReviews([]);
      storage.setItem(STORAGE_KEYS.REVIEWS, []);
    }
  };

  return (
    <div className="scoreboard-container">
      <div className="scoreboard-header">
        <h1>Scoreboard & Reviews</h1>
        <button className="back-btn" onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>

      <div className="scoreboard-content">
        {/* High Scores Section */}
        <div className="scores-section">
          <div className="section-header">
            <h2>🏆 Top Scores</h2>
            {/*{highScores.length > 0 && (
              <button className="clear-all-btn" onClick={clearAllScores}>
                Clear All
              </button>
            )}*/}
          </div>
          {highScores.length > 0 ? (
            <div className="scores-list">
              {highScores.map((score, index) => (
                <div key={index} className="score-item">
                  <div className="rank">#{index + 1}</div>
                  <div className="player-info">
                    <div className="player-name">
                      {score.userDetails?.name || "Unknown Player"}
                    </div>
                    <div className="player-school">
                      {score.userDetails?.school || "Unknown School"}
                    </div>
                  </div>
                  <div className="score-value">{score.score} pts</div>
                  {/*<button
                    className="delete-btn"
                    onClick={() => deleteScore(index)}
                    title="Delete this score"
                  >
                    🗑️
                  </button>*/}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No scores yet. Be the first to play!</p>
          )}
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="section-header">
            <h2>💬 User Reviews</h2>
            {/*{reviews.length > 0 && (
              <button className="clear-all-btn" onClick={clearAllReviews}>
                Clear All
              </button>
            )}*/}
          </div>
          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-content">
                    {/* Rating and Text Column */}
                    <div className="review-main">
                      {review.rating && (
                        <span className="review-rating">
                          {review.rating === "good" && "😊 Good"}
                          {review.rating === "bad" && "😞 Bad"}
                          {review.rating === "excellent" && "🤩 Excellent"}
                        </span>
                      )}
                      {review.text && (
                        <p className="review-text">{review.text}</p>
                      )}
                    </div>

                    {/* Date - positioned to align with the center of the review-main column */}
                    <div className="review-date-container">
                      <span className="review-date">
                        {new Date(review.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">
              No reviews yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreboardPage;
