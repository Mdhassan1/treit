import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QUESTIONS, GAME_TYPES } from "../../constants/questions";
import { storage, STORAGE_KEYS } from "../../utils/storage";
import McqGame from "./MCQ/McqGame";
import JumbleGame from "./jumplegames/JumbleGame";
import CrosswordGame from "./crossword/CrosswordGame";
import "./GamePage.css";

const GamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userDetails, gameType } = location.state || {};

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [startTime, setStartTime] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  // Track the last input the user submitted for the current question.
  const [lastUserInput, setLastUserInput] = useState(null);
  const [currentUserAnswer, setCurrentUserAnswer] = useState("");

  // Initialize questions based on game type
  useEffect(() => {
    const allQuestions =
      QUESTIONS[
        gameType === GAME_TYPES.JUMBLE
          ? "jumbleWords"
          : gameType === GAME_TYPES.MCQ
          ? "mcq"
          : "crossword"
      ];

    // Shuffle and select 6 unique questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, 6);
    setQuestions(selectedQuestions);
  }, [gameType]);

  // Countdown before each question
  useEffect(() => {
    let countdownTimer;
    if (showCountdown && countdown > 0) {
      countdownTimer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (showCountdown && countdown === 0) {
      setShowCountdown(false);
      setStartTime(Date.now());
      setAnswerSubmitted(false);
      setShowFeedback(false);
      setLastUserInput(null);
      setCurrentUserAnswer("");
      // Set timer based on game type
      const questionTimer = gameType === GAME_TYPES.CROSSWORD ? 60 : 10;
      setTimer(questionTimer);
    }
    return () => clearTimeout(countdownTimer);
  }, [showCountdown, countdown, gameType]);

  // Main timer for questions
  useEffect(() => {
    let mainTimer;
    if (!showCountdown && timer > 0 && !gameCompleted && !answerSubmitted) {
      mainTimer = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (
      !showCountdown &&
      timer === 0 &&
      !gameCompleted &&
      !answerSubmitted
    ) {
      handleTimeUp();
    }
    return () => clearTimeout(mainTimer);
  }, [timer, showCountdown, gameCompleted, answerSubmitted]);

  const handleTimeUp = () => {
    // For crossword, handle timeout in the CrosswordGame component
    // Just mark as submitted and move on
    if (gameType === GAME_TYPES.CROSSWORD) {
      // The crossword will handle its own timeout submission
      setAnswerSubmitted(true);
    } else {
      // Handle other game types (existing logic)
      const hasAnswer = currentUserAnswer && currentUserAnswer.trim() !== "";
      if (hasAnswer) {
        const currentQ = questions[currentQuestion];
        let isCorrect = false;
        if (gameType === GAME_TYPES.JUMBLE) {
          isCorrect =
            currentUserAnswer.trim().toUpperCase() ===
            currentQ.correct.toUpperCase();
        } else if (gameType === GAME_TYPES.MCQ) {
          isCorrect = currentUserAnswer === currentQ.correct;
        }
        setIsCorrectAnswer(isCorrect);
        setLastUserInput(currentUserAnswer);
        if (isCorrect) {
          const questionScore = calculateScore((Date.now() - startTime) / 1000);
          setScore((prev) => prev + questionScore);
        }
      } else {
        setIsCorrectAnswer(false);
        setLastUserInput(null);
      }
      setAnswerSubmitted(true);
      setShowFeedback(true);
      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    }
  };

  const calculateScore = (answerTime) => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const baseScore = 100;
    const timeBonus = Math.max(0, 10 - timeTaken) * 10;
    return baseScore + timeBonus;
  };

  const handleAnswerSubmit = (userInput) => {
    if (answerSubmitted || gameCompleted) return;

    setLastUserInput(userInput);
    setCurrentUserAnswer(userInput);

    const currentQ = questions[currentQuestion];
    let isCorrect = false;
    let questionScore = 0;

    if (gameType === GAME_TYPES.JUMBLE) {
      const userTrim = (userInput || "").trim();
      if (userTrim.length === 0) {
        isCorrect = false;
      } else {
        isCorrect = userTrim.toUpperCase() === currentQ.correct.toUpperCase();
        if (isCorrect) {
          questionScore = calculateScore((Date.now() - startTime) / 1000);
        }
      }
    } else if (gameType === GAME_TYPES.MCQ) {
      if (userInput === null || userInput === undefined || userInput === "") {
        isCorrect = false;
      } else {
        isCorrect = userInput === currentQ.correct;
        if (isCorrect) {
          questionScore = calculateScore((Date.now() - startTime) / 1000);
        }
      }
    } else if (gameType === GAME_TYPES.CROSSWORD) {
      // For crossword, userInput is an object
      const {
        foundWords = 0,
        totalWords = 0,
        attempts = 0,
        timeTaken = 60,
        isTimeout = false,
      } = userInput || {};

      isCorrect = foundWords > 0;
      const wordsScore = totalWords ? (foundWords / totalWords) * 600 : 0;
      const timeScore = Math.max(0, (60 - timeTaken) / 60) * 300;
      const efficiencyScore =
        Math.max(0, 1 - (attempts - foundWords) / Math.max(attempts, 1)) * 100;

      questionScore = Math.round(wordsScore + timeScore + efficiencyScore);

      // Always add score for crossword
      setScore((prev) => prev + questionScore);

      // Mark as submitted
      setIsCorrectAnswer(isCorrect);
      setAnswerSubmitted(true);
      setShowFeedback(true);

      // For crossword, ALWAYS move to next question after submission
      // Whether it's timeout or all words found
      setTimeout(() => {
        moveToNextQuestion();
      }, 1000); // Shorter delay for crossword

      return; // Exit early since we handled navigation
    }

    setIsCorrectAnswer(isCorrect);
    setAnswerSubmitted(true);
    setShowFeedback(true);

    if (isCorrect) {
      setScore((prev) => prev + questionScore);
    }
  };

  const updateCurrentAnswer = (answer) => {
    setCurrentUserAnswer(answer);
  };

  const moveToNextQuestion = () => {
    // Check if this is the last question (6th question, index 5)
    if (currentQuestion === 5) {
      completeGame();
      return;
    }

    // Only proceed if we have more questions (up to 6 total)
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setShowCountdown(true);
      setCountdown(3);
    } else {
      completeGame();
    }
  };

  const completeGame = () => {
    setGameCompleted(true);

    // Save score
    const gameData = {
      userDetails,
      gameType,
      score,
      timestamp: new Date().toISOString(),
      totalQuestions: questions.length,
    };

    const existingScores = storage.getItem(STORAGE_KEYS.SCORES) || [];
    const existingUserData = storage.getItem(STORAGE_KEYS.USER_DATA) || [];

    storage.setItem(STORAGE_KEYS.SCORES, [...existingScores, gameData]);
    storage.setItem(STORAGE_KEYS.USER_DATA, [...existingUserData, userDetails]);
  };

  const renderGameComponent = () => {
    if (!questions.length || currentQuestion >= questions.length) return null;

    const question = questions[currentQuestion];
    const commonProps = {
      question,
      onAnswerSubmit: handleAnswerSubmit,
      timer,
      answerSubmitted,
      showFeedback,
      isCorrectAnswer,
      onAnswerChange: updateCurrentAnswer,
    };

    switch (gameType) {
      case GAME_TYPES.JUMBLE:
        return <JumbleGame {...commonProps} />;
      case GAME_TYPES.MCQ:
        return <McqGame {...commonProps} />;
      case GAME_TYPES.CROSSWORD:
        return <CrosswordGame {...commonProps} />;
      default:
        return null;
    }
  };

  const renderFeedback = () => {
    if (!showFeedback || gameType === GAME_TYPES.CROSSWORD) return null;

    const currentQ = questions[currentQuestion];

    if (isCorrectAnswer) {
      return <div className={`answer-feedback correct`}>✓ Correct!</div>;
    }

    const noAnswerProvided =
      lastUserInput === null ||
      lastUserInput === undefined ||
      (typeof lastUserInput === "string" && lastUserInput.trim() === "");

    if (noAnswerProvided) {
      return (
        <div className="answer-feedback incorrect">
          Oops! Time's up! The correct answer is:{" "}
          {currentQ.correct || currentQ.answer}
        </div>
      );
    }

    return (
      <div className="answer-feedback incorrect">
        ✗ Incorrect <br />
        The correct answer is: {currentQ.correct || currentQ.answer}
      </div>
    );
  };

  if (showCountdown) {
    return (
      <div className="countdown-container">
        <div className="countdown-display">
          <h1 className="countdown-number">{countdown}</h1>
          <p className="countdown-text">
            {currentQuestion === 0 ? "Game Starts In" : "Next Question"}
          </p>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="game-completed">
        <h1>Game Completed!</h1>
        <p>Your Score: {score.toFixed(2)}</p>
        <button
          onClick={() =>
            navigate("/score-popup", {
              state: { score, userDetails, gameType },
            })
          }
        >
          See Results
        </button>
      </div>
    );
  }

  return (
    <div className="game-page-container">
      {/* Header */}
      <div className="game-header"></div>
      {/* Game Area */}
      <div className={`game-area ${showFeedback ? "with-feedback" : ""}`}>
        <div className="left-header">
          <div className="timer-circle">{timer}s</div>

          <div className="qs-score">
            <span className="qs-text">
              <strong>Question:</strong> {currentQuestion + 1}/
              {questions.length}
            </span>

            <span className="score-text">
              <strong>Score:</strong> {score.toFixed(2)}
            </span>
          </div>
        </div>
        {renderGameComponent()}
        {renderFeedback()}
      </div>
      {/* Next Button (only shown after answer submission) - Hide for crossword */}
      {answerSubmitted && gameType !== GAME_TYPES.CROSSWORD && (
        <div className="next-section">
          <button className="next-question-btn" onClick={moveToNextQuestion}>
            {currentQuestion === questions.length - 1
              ? "Finish Game"
              : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
