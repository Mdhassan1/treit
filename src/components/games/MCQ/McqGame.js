import React, { useState, useEffect } from "react";
import "./McqGame.css";

const McqGame = ({
  question,
  onAnswerSubmit,
  timer,
  answerSubmitted,
  showFeedback,
  isCorrectAnswer,
  onAnswerChange,
}) => {
  const [selectedOption, setSelectedOption] = useState("");

  useEffect(() => {
    if (!answerSubmitted) {
      setSelectedOption("");
    }
  }, [question, answerSubmitted]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);

    // Call the parent callback to update current answer
    if (onAnswerChange) {
      onAnswerChange(option);
    }
  };

  const getOptionClass = (option) => {
    if (!answerSubmitted) {
      return selectedOption === option ? "selected" : "";
    }

    // After answer submission
    if (option === question.correct) {
      return "correct-answer"; // Green for correct answer
    } else if (option === selectedOption && !isCorrectAnswer) {
      return "wrong-answer"; // Red for wrong user selection
    }
    return "";
  };

  return (
    <div className="mcq-question">
      <h2>Multiple Choice Question</h2>
      <div className="question-text">{question.question}</div>
      <div className="options-container">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`option-btn ${getOptionClass(option)}`}
            onClick={() => handleOptionSelect(option)}
            disabled={answerSubmitted}
          >
            {option}
          </button>
        ))}
      </div>

      {!answerSubmitted && (
        <button
          className="submit-btn"
          onClick={() => onAnswerSubmit(selectedOption)}
          disabled={!selectedOption}
        >
          Submit Answer
        </button>
      )}
    </div>
  );
};

export default McqGame;
