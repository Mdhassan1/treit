import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { storage, STORAGE_KEYS } from "../../utils/storage";
import "./ScorePopup.css";

const ScorePopup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { score, userDetails } = location.state || {};
  const [showCelebration, setShowCelebration] = useState(false);
  const [highScore, setHighScore] = useState(false);

  useEffect(() => {
    // Check if this is a high score
    const existingScores = storage.getItem(STORAGE_KEYS.SCORES) || [];
    const userHighScore = Math.max(
      ...existingScores
        .filter((s) => s.userDetails.name === userDetails?.name)
        .map((s) => s.score),
      0
    );

    if (score > userHighScore) {
      setHighScore(true);
      setShowCelebration(true);
    }

    // Save high score
    const highScores = storage.getItem(STORAGE_KEYS.HIGH_SCORES) || [];
    const newHighScores = [
      ...highScores,
      {
        userDetails,
        score,
        timestamp: new Date().toISOString(),
      },
    ]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Keep top 10

    storage.setItem(STORAGE_KEYS.HIGH_SCORES, newHighScores);
  }, [score, userDetails]);

  const handleScoreboard = () => {
    navigate("/scoreboard");
  };

  const handleReview = () => {
    navigate("/review");
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div className="score-popup-container">
      {showCelebration && highScore && (
        <div className="celebration">
          <div className="confetti"></div>
          <div className="confetti"></div>
          <div className="confetti"></div>
          <div className="confetti"></div>
          <div className="confetti"></div>
        </div>
      )}

      <div className="score-popup">
        <h1 className="score-title">Game Completed!</h1>

        <div className="score-display">
          <div className="score-circle">
            <span className="score-number"> {score.toFixed(2)}</span>
            <span className="score-label">Points</span>
          </div>
        </div>

        {highScore && (
          <div className="high-score-badge">🎉 New High Score! 🎉</div>
        )}

        <div className="user-info">
          <p>
            <strong>Player:</strong> {userDetails?.name}
          </p>
          <p>
            <strong>School:</strong> {userDetails?.school}
          </p>
        </div>

        <div className="popup-buttons">
          <button
            className="popup-btn scoreboard-btn"
            onClick={handleScoreboard}
          >
            View Scoreboard
          </button>
          <button className="popup-btn review-btn" onClick={handleReview}>
            Leave Review
          </button>
          <button className="popup-btn home-btn" onClick={handleHome}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScorePopup;
