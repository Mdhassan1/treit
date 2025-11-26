import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  const handleGameSelect = (gameType) => {
    navigate("/user-details", { state: { gameType } });
  };

  const handleReview = () => {
    navigate("/review");
  };

  const handleScoreboard = () => {
    navigate("/scoreboard");
  };

  return (
    <div className="homepage-container">
      {/* Top Left Corner Button */}
      <div className="top-left-corner">
        <button
          className="corner-btn scoreboard-btn"
          onClick={handleScoreboard}
        >
          Scoreboard
        </button>
      </div>

      {/* Game Title */}
      <div className="game-title-section">
        <h1 className="game-title">Quiz Master</h1>
        <p className="game-subtitle">Test Your Knowledge!</p>
      </div>

      {/* Game Type Buttons - Center */}
      <div className="game-type-section">
        <button
          className="game-type-btn jumble-btn"
          onClick={() => handleGameSelect("jumble")}
        >
          Jumble Words
        </button>
        <button
          className="game-type-btn crossword-btn"
          onClick={() => handleGameSelect("crossword")}
        >
          Crossword
        </button>
        <button
          className="game-type-btn mcq-btn"
          onClick={() => handleGameSelect("mcq")}
        >
          MCQ Quiz
        </button>
      </div>

      {/* Floating Review Button - Bottom Right Corner */}
      <div className="floating-review-btn">
        <button className="review-btn" onClick={handleReview}>
          Write Review
        </button>
      </div>
    </div>
  );
};

export default HomePage;
