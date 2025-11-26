import React, { useState, useEffect } from "react";
import "./JumbleGame.css";

const JumbleGame = ({
  question,
  onAnswerSubmit,
  timer,
  answerSubmitted,
  showFeedback,
  isCorrectAnswer,
  onAnswerChange, // Fixed: using the correct prop name
}) => {
  const [userAnswer, setUserAnswer] = useState("");

  useEffect(() => {
    if (!answerSubmitted) {
      setUserAnswer("");
    }
  }, [question, answerSubmitted]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserAnswer(value);

    // Call the parent callback to update current answer
    if (onAnswerChange) {
      onAnswerChange(value);
    }
  };

  return (
    <div className="jumble-question">
      <h2>Unscramble the Word</h2>
      <div className="jumbled-word">{question.jumbled}</div>
      <input
        type="text"
        value={userAnswer}
        onChange={handleInputChange}
        placeholder="Enter the correct word"
        className="answer-input"
        disabled={answerSubmitted}
      />

      {!answerSubmitted && (
        <button
          className="submit-btn"
          onClick={() => onAnswerSubmit(userAnswer)}
          disabled={!userAnswer.trim()}
        >
          Submit Answer
        </button>
      )}
    </div>
  );
};

export default JumbleGame;
