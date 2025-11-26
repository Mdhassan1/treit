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
  // Use null to indicate "no submission".
  const [lastUserInput, setLastUserInput] = useState(null);

  // Track user's current answer input (for auto-validation when time's up)
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
      setLastUserInput(null); // reset last input on new question
      setCurrentUserAnswer(""); // reset current answer
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
    // For crossword, handle timeout differently
    if (gameType === GAME_TYPES.CROSSWORD) {
      const scoreData = {
        foundWords: 0, // User didn't complete in time
        totalWords: 10, // Assuming 10 words total
        attempts: 0,
        timeTaken: 60,
      };
      handleAnswerSubmit(scoreData);
    } else {
      // Check if user has entered an answer but didn't submit
      const hasAnswer = currentUserAnswer && currentUserAnswer.trim() !== "";

      if (hasAnswer) {
        // Auto-validate the answer
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
          // Calculate score for auto-submitted correct answer
          const questionScore = calculateScore((Date.now() - startTime) / 1000);
          setScore((prev) => prev + questionScore);
        }
      } else {
        // No answer provided
        setIsCorrectAnswer(false);
        setLastUserInput(null);
      }

      setAnswerSubmitted(true);
      setShowFeedback(true);

      // Auto move to next question after 2 seconds
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

    // Save last user input (could be empty string)
    setLastUserInput(userInput);
    setCurrentUserAnswer(userInput); // Also update current answer

    const currentQ = questions[currentQuestion];
    let isCorrect = false;
    let questionScore = 0;

    if (gameType === GAME_TYPES.JUMBLE) {
      const userTrim = (userInput || "").trim();
      if (userTrim.length === 0) {
        // user submitted empty — treat as "no answer"
        isCorrect = false;
      } else {
        isCorrect = userTrim.toUpperCase() === currentQ.correct.toUpperCase();
        if (isCorrect) {
          questionScore = calculateScore((Date.now() - startTime) / 1000);
        }
      }
    } else if (gameType === GAME_TYPES.MCQ) {
      // For MCQ, we'll consider null/undefined/"" as no answer
      if (userInput === null || userInput === undefined || userInput === "") {
        isCorrect = false;
      } else {
        isCorrect = userInput === currentQ.correct;
        if (isCorrect) {
          questionScore = calculateScore((Date.now() - startTime) / 1000);
        }
      }
    } else if (gameType === GAME_TYPES.CROSSWORD) {
      // For crossword, userInput is an object returned from CrosswordGame
      // expected: { foundWords, totalWords, attempts, timeTaken }
      const {
        foundWords = 0,
        totalWords = 0,
        attempts = 0,
        timeTaken = 60,
      } = userInput || {};
      isCorrect = foundWords > 0;
      const wordsScore = totalWords ? (foundWords / totalWords) * 600 : 0;
      const timeScore = Math.max(0, (60 - timeTaken) / 60) * 300;
      const efficiencyScore =
        Math.max(0, 1 - (attempts - foundWords) / Math.max(attempts, 1)) * 100;

      questionScore = Math.round(wordsScore + timeScore + efficiencyScore);

      // For crossword, if all words are found, go directly to completed page
      if (foundWords === totalWords && totalWords > 0) {
        setScore((prev) => prev + questionScore);
        completeGame();
        return; // Don't show feedback or set answerSubmitted
      }
    }

    setIsCorrectAnswer(isCorrect);
    setAnswerSubmitted(true);
    setShowFeedback(true);

    if (isCorrect) {
      setScore((prev) => prev + questionScore);
    }
  };

  // Update current user answer when user types (for Jumble and MCQ games)
  const updateCurrentAnswer = (answer) => {
    setCurrentUserAnswer(answer);
  };

  const moveToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);

      // Only show countdown for questions 1-5 (not for the last question)
      if (currentQuestion < questions.length - 2) {
        setShowCountdown(true);
        setCountdown(3);
      } else {
        // For the last question (6th), go directly to the question without countdown
        setStartTime(Date.now());
        setAnswerSubmitted(false);
        setShowFeedback(false);
        setLastUserInput(null);
        setCurrentUserAnswer("");
        const questionTimer = gameType === GAME_TYPES.CROSSWORD ? 60 : 10;
        setTimer(questionTimer);
      }
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
      onAnswerChange: updateCurrentAnswer, // Pass callback to update current answer
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
    if (!showFeedback) return null;

    const currentQ = questions[currentQuestion];

    // Case 1 & 3: User answered correctly (submitted or auto-submitted)
    if (isCorrectAnswer) {
      return <div className={`answer-feedback correct`}>✓ Correct!</div>;
    }

    const noAnswerProvided =
      lastUserInput === null ||
      lastUserInput === undefined ||
      (typeof lastUserInput === "string" && lastUserInput.trim() === "");

    // Case 5: User didn't answer at all (empty input)
    if (noAnswerProvided) {
      return (
        <div className="answer-feedback incorrect">
          Oops! Time's up! The correct answer is:{" "}
          {currentQ.correct || currentQ.answer}
        </div>
      );
    }

    // Cases 2 & 4: User answered wrong (submitted or auto-submitted)
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
      {/* Next Button (only shown after answer submission) - Hide for crossword when all words found */}
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
