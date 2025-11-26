// CrosswordGame.jsx
import React, { useState, useEffect, useRef } from "react";
import "./CrosswordGame.css";

const CrosswordGame = ({
  question,
  onAnswerSubmit,
  timer,
  answerSubmitted,
  showFeedback,
  isCorrectAnswer,
}) => {
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionDirection, setSelectionDirection] = useState(null);
  const [correctCells, setCorrectCells] = useState([]);
  const [wrongCells, setWrongCells] = useState([]);
  const [timeoutCells, setTimeoutCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const gridRef = useRef(null);

  // Prevent double-processing of the same selection (e.g. duplicate onMouseUp)
  const processingRef = useRef(false);

  // Safe access to question properties
  const grid = question?.grid || [];
  const words = question?.words || { across: [], down: [] };
  const clue = question?.clue || "Solve the crossword puzzle";

  // Build ALL valid words list (including duplicates) so totalWords = across.length + down.length
  // But we will still keep foundWords unique (no duplicate display)
  const allValidWords = React.useMemo(() => {
    const acrossWords = Array.isArray(words.across) ? words.across : [];
    const downWords = Array.isArray(words.down) ? words.down : [];

    const allWordsArray = [
      ...acrossWords.map((w) =>
        (typeof w === "string" ? w : w?.word || "").toUpperCase()
      ),
      ...downWords.map((w) =>
        (typeof w === "string" ? w : w?.word || "").toUpperCase()
      ),
    ].filter((word) => word.length > 0);

    console.log("All valid words (with duplicates for total):", allWordsArray);
    return allWordsArray;
  }, [words]);

  useEffect(() => {
    if (!answerSubmitted) {
      setSelectedCells([]);
      setCorrectCells([]);
      setWrongCells([]);
      setTimeoutCells([]);
      setFoundWords([]);
      setAttempts(0);
    }
  }, [question, answerSubmitted]);

  // Handle timeout
  useEffect(() => {
    if (timer === 0 && !answerSubmitted) {
      const allCells = [];
      grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell && cell !== " ") {
            allCells.push(`${rowIndex}-${colIndex}`);
          }
        });
      });
      setTimeoutCells(allCells);

      setTimeout(() => {
        const scoreData = {
          foundWords: foundWords.length,
          totalWords: allValidWords.length,
          attempts: attempts,
          timeTaken: 60,
        };
        onAnswerSubmit(scoreData);
      }, 1000);
    }
  }, [
    timer,
    answerSubmitted,
    grid,
    foundWords,
    attempts,
    onAnswerSubmit,
    allValidWords,
  ]);

  // Clear wrong cells after 1 second
  useEffect(() => {
    if (wrongCells.length > 0) {
      const t = setTimeout(() => {
        setWrongCells([]);
        setSelectedCells([]);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [wrongCells]);

  // Check if all words are found (using total words including duplicates)
  useEffect(() => {
    if (
      foundWords.length === allValidWords.length &&
      allValidWords.length > 0 &&
      !answerSubmitted
    ) {
      console.log("🎉 All words found! Going to score popup...");
      const scoreData = {
        foundWords: foundWords.length,
        totalWords: allValidWords.length,
        attempts: attempts,
        timeTaken: 60 - timer,
      };
      // Immediately submit and go to score popup without showing "Correct" feedback
      onAnswerSubmit(scoreData);
    }
  }, [
    foundWords,
    allValidWords,
    answerSubmitted,
    attempts,
    timer,
    onAnswerSubmit,
  ]);

  const getCellClass = (row, col) => {
    const cellId = `${row}-${col}`;
    let className = "crossword-cell";

    if (!grid[row] || !grid[row][col] || grid[row][col] === " ") {
      return `${className} empty`;
    }

    if (correctCells.includes(cellId)) {
      className += " correct";
    } else if (wrongCells.includes(cellId)) {
      className += " wrong";
    } else if (timeoutCells.includes(cellId)) {
      className += " timeout";
    } else if (selectedCells.includes(cellId)) {
      className += " selecting";
    }

    return className;
  };

  const getWordFromSelection = (cells) => {
    if (cells.length === 0) return "";

    const sortedCells = [...cells].sort((a, b) => {
      const [rowA, colA] = a.split("-").map(Number);
      const [rowB, colB] = b.split("-").map(Number);

      if (selectionDirection === "across") {
        return colA - colB;
      } else {
        return rowA - rowB;
      }
    });

    return sortedCells
      .map((cell) => {
        const [row, col] = cell.split("-").map(Number);
        return grid[row]?.[col] || "";
      })
      .join("");
  };

  const handleCellMouseDown = (row, col) => {
    // safety: don't start on empty cell or after submission
    if (answerSubmitted || !grid[row]?.[col] || grid[row][col] === " ") return;

    setIsSelecting(true);
    setSelectedCells([`${row}-${col}`]);
    setSelectionDirection(null);
  };

  const handleCellMouseEnter = (row, col) => {
    if (!isSelecting || !grid[row]?.[col] || grid[row][col] === " ") return;

    const currentCell = `${row}-${col}`;

    // If we have only one cell selected, determine direction
    if (selectedCells.length === 1) {
      const [firstRow, firstCol] = selectedCells[0].split("-").map(Number);

      if (row === firstRow && col !== firstCol) {
        setSelectionDirection("across");
      } else if (col === firstCol && row !== firstRow) {
        setSelectionDirection("down");
      } else {
        return;
      }
    }

    // If we have a direction, get all cells in that line
    if (selectionDirection) {
      const newSelectedCells = getCellsInLine(selectedCells[0], currentCell);
      if (newSelectedCells.length > 0) {
        setSelectedCells(newSelectedCells);
      }
    }
    // If no direction yet but we're on the same row or column, try to set direction
    else if (selectedCells.length === 1) {
      const [firstRow, firstCol] = selectedCells[0].split("-").map(Number);

      if (row === firstRow && Math.abs(col - firstCol) > 0) {
        setSelectionDirection("across");
        const newSelectedCells = getCellsInLine(selectedCells[0], currentCell);
        setSelectedCells(newSelectedCells);
      } else if (col === firstCol && Math.abs(row - firstRow) > 0) {
        setSelectionDirection("down");
        const newSelectedCells = getCellsInLine(selectedCells[0], currentCell);
        setSelectedCells(newSelectedCells);
      }
    }
  };

  const handleCellMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    // Guard: prevent double-processing
    if (processingRef.current) {
      setSelectedCells([]);
      return;
    }
    processingRef.current = true;

    // Ensure processingRef is freed after a short delay
    setTimeout(() => {
      processingRef.current = false;
    }, 60);

    if (selectedCells.length > 1) {
      const selectedWord = getWordFromSelection(selectedCells);
      // increment attempts only once per processing
      setAttempts((prev) => prev + 1);

      const selectedWordUpper = selectedWord.toUpperCase();

      console.log("Selected word:", selectedWordUpper);
      console.log("All valid words:", allValidWords);
      console.log("Already found words:", foundWords);

      // Check if this is a valid word (we allow allValidWords which may contain duplicates)
      const isWordValid = allValidWords.includes(selectedWordUpper);

      // Check if the word was not already recorded in FOUND list (prevent duplicates)
      const isWordNew = !foundWords.includes(selectedWordUpper);

      console.log("Is word valid?", isWordValid);
      console.log("Is word new?", isWordNew);

      if (isWordValid && isWordNew) {
        // Mark cells as correct (idempotent)
        setCorrectCells((prev) => {
          const combined = [...prev, ...selectedCells];
          // dedupe cell ids
          return Array.from(new Set(combined));
        });

        // Add found word if not already present (functional and idempotent)
        setFoundWords((prev) => {
          if (prev.includes(selectedWordUpper)) return prev;
          const newFound = [...prev, selectedWordUpper];
          console.log("New found words:", newFound);
          return newFound;
        });

        // clear selection visually
        setSelectedCells([]);
      } else {
        // Mark as wrong temporarily
        setWrongCells([...selectedCells]);
      }
    } else {
      setSelectedCells([]);
    }
  };

  const getCellsInLine = (startCell, endCell) => {
    const [startRow, startCol] = startCell.split("-").map(Number);
    const [endRow, endCol] = endCell.split("-").map(Number);
    const cells = [];

    // If same row (across selection)
    if (startRow === endRow) {
      const minCol = Math.min(startCol, endCol);
      const maxCol = Math.max(startCol, endCol);
      for (let col = minCol; col <= maxCol; col++) {
        if (grid[startRow]?.[col] && grid[startRow][col] !== " ") {
          cells.push(`${startRow}-${col}`);
        } else {
          // stop if empty encountered
          break;
        }
      }
    }
    // If same column (down selection)
    else if (startCol === endCol) {
      const minRow = Math.min(startRow, endRow);
      const maxRow = Math.max(startRow, endRow);
      for (let row = minRow; row <= maxRow; row++) {
        if (grid[row]?.[startCol] && grid[row][startCol] !== " ") {
          cells.push(`${row}-${startCol}`);
        } else {
          break;
        }
      }
    }

    return cells;
  };

  if (!grid || grid.length === 0) {
    return (
      <div className="crossword-question">
        <h2>Crossword Puzzle</h2>
        <p>No crossword data available.</p>
      </div>
    );
  }

  return (
    <div className="crossword-question">
      <h2>Crossword Puzzle</h2>
      <p className="crossword-clue">{clue}</p>

      {/* Show progress */}
      <div className="crossword-progress">
        Words Found: {foundWords.length} / {allValidWords.length}
      </div>

      <div
        className="crossword-grid"
        ref={gridRef}
        onMouseLeave={() => {
          setIsSelecting(false);
          if (selectedCells.length > 0) {
            handleCellMouseUp();
          }
        }}
        onMouseUp={handleCellMouseUp}
      >
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="crossword-row">
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={getCellClass(rowIndex, cellIndex)}
                onMouseDown={() => handleCellMouseDown(rowIndex, cellIndex)}
                onMouseEnter={() => handleCellMouseEnter(rowIndex, cellIndex)}
                // keep onMouseUp on grid to avoid some double triggers, but handler is guarded
                onMouseUp={handleCellMouseUp}
              >
                {cell && cell !== " " ? cell : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrosswordGame;
