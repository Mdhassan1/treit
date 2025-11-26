import { QUESTIONS } from "../constants/questions";

// Track used questions for each user session
let usedQuestions = {
  mcq: new Set(),
  jumbleWords: new Set(),
  crossword: new Set(),
};

export const getRandomQuestions = (gameType, count = 6) => {
  const questionPool =
    QUESTIONS[gameType === "jumble" ? "jumbleWords" : gameType];
  const availableQuestions = questionPool.filter(
    (q) =>
      !usedQuestions[gameType === "jumble" ? "jumbleWords" : gameType].has(q.id)
  );

  // If we don't have enough unique questions, reset and use all
  if (availableQuestions.length < count) {
    usedQuestions[gameType === "jumble" ? "jumbleWords" : gameType].clear();
    return questionPool.sort(() => Math.random() - 0.5).slice(0, count);
  }

  const selected = availableQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  // Mark these questions as used
  selected.forEach((q) => {
    usedQuestions[gameType === "jumble" ? "jumbleWords" : gameType].add(q.id);
  });

  return selected;
};

export const resetUsedQuestions = () => {
  usedQuestions = {
    mcq: new Set(),
    jumbleWords: new Set(),
    crossword: new Set(),
  };
};
