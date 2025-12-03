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
  const timeoutProcessedRef = useRef(false);

  // Touch specific refs
  const touchStartRef = useRef(null);
  const touchCurrentRef = useRef(null);
  const lastTouchTimeRef = useRef(0);

  // Prevent double-processing of the same selection
  const processingRef = useRef(false);

  // Safe access to question properties
  const grid = question?.grid || [];
  const words = question?.words || { across: [], down: [] };
  const clue = question?.clue || "Solve the crossword puzzle";

  // Build ALL valid words list
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

    return allWordsArray;
  }, [words]);

  // Reset state when question changes
  useEffect(() => {
    if (!answerSubmitted) {
      setSelectedCells([]);
      setCorrectCells([]);
      setWrongCells([]);
      setTimeoutCells([]);
      setFoundWords([]);
      setAttempts(0);
      timeoutProcessedRef.current = false;
    }
  }, [question, answerSubmitted]);

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

  // Handle timeout
  useEffect(() => {
    if (timer === 0 && !answerSubmitted && !timeoutProcessedRef.current) {
      console.log("⏰ Timeout triggered in CrosswordGame");
      timeoutProcessedRef.current = true;

      const allCells = [];
      grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell && cell !== " ") {
            allCells.push(`${rowIndex}-${colIndex}`);
          }
        });
      });
      setTimeoutCells(allCells);

      // Submit immediately with timeout results
      const scoreData = {
        foundWords: foundWords.length,
        totalWords: allValidWords.length,
        attempts: attempts,
        timeTaken: 60,
        isTimeout: true,
      };

      console.log("Crossword timeout score data:", scoreData);
      onAnswerSubmit(scoreData);
    }
  }, [
    timer,
    answerSubmitted,
    grid,
    foundWords,
    attempts,
    allValidWords,
    onAnswerSubmit,
  ]);

  // Check if all words are found
  useEffect(() => {
    if (
      foundWords.length === allValidWords.length &&
      allValidWords.length > 0 &&
      !answerSubmitted &&
      !timeoutProcessedRef.current
    ) {
      console.log("🎉 All words found!");
      const scoreData = {
        foundWords: foundWords.length,
        totalWords: allValidWords.length,
        attempts: attempts,
        timeTaken: 60 - timer,
        isTimeout: false,
      };

      console.log("Crossword completion score data:", scoreData);
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

  // Handle touch start
  const handleTouchStart = (row, col, e) => {
    if (answerSubmitted || !grid[row]?.[col] || grid[row][col] === " ") return;

    e.preventDefault();
    const now = Date.now();

    // Prevent double taps
    if (now - lastTouchTimeRef.current < 300) return;
    lastTouchTimeRef.current = now;

    touchStartRef.current = { row, col };
    setIsSelecting(true);
    setSelectedCells([`${row}-${col}`]);
    setSelectionDirection(null);
  };

  // Handle touch move
  const handleTouchMove = (row, col, e) => {
    if (!isSelecting || !grid[row]?.[col] || grid[row][col] === " ") return;

    e.preventDefault();
    touchCurrentRef.current = { row, col };

    // Process cell selection
    processSelection(row, col);
  };

  // Handle touch end
  const handleTouchEnd = (e) => {
    if (!isSelecting) return;

    e.preventDefault();
    setIsSelecting(false);

    // Process the final selection
    if (touchCurrentRef.current) {
      processSelectionComplete();
    } else if (touchStartRef.current) {
      // Single tap - clear selection
      setSelectedCells([]);
    }

    // Reset touch refs
    touchStartRef.current = null;
    touchCurrentRef.current = null;
  };

  // Mouse event handlers (for desktop)
  const handleCellMouseDown = (row, col) => {
    if (answerSubmitted || !grid[row]?.[col] || grid[row][col] === " ") return;

    setIsSelecting(true);
    setSelectedCells([`${row}-${col}`]);
    setSelectionDirection(null);
  };

  const handleCellMouseEnter = (row, col) => {
    if (!isSelecting || !grid[row]?.[col] || grid[row][col] === " ") return;
    processSelection(row, col);
  };

  const handleCellMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
    processSelectionComplete();
  };

  // Common selection processing
  const processSelection = (row, col) => {
    const currentCell = `${row}-${col}`;

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

    if (selectionDirection) {
      const newSelectedCells = getCellsInLine(selectedCells[0], currentCell);
      if (newSelectedCells.length > 0) {
        setSelectedCells(newSelectedCells);
      }
    } else if (selectedCells.length === 1) {
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

  // Process completed selection
  const processSelectionComplete = () => {
    if (processingRef.current) {
      setSelectedCells([]);
      return;
    }
    processingRef.current = true;

    setTimeout(() => {
      processingRef.current = false;
    }, 60);

    if (selectedCells.length > 1) {
      const selectedWord = getWordFromSelection(selectedCells);
      setAttempts((prev) => prev + 1);

      const selectedWordUpper = selectedWord.toUpperCase();
      const isWordValid = allValidWords.includes(selectedWordUpper);
      const isWordNew = !foundWords.includes(selectedWordUpper);

      if (isWordValid && isWordNew) {
        setCorrectCells((prev) => {
          const combined = [...prev, ...selectedCells];
          return Array.from(new Set(combined));
        });

        setFoundWords((prev) => {
          if (prev.includes(selectedWordUpper)) return prev;
          return [...prev, selectedWordUpper];
        });

        setSelectedCells([]);
      } else {
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

    if (startRow === endRow) {
      const minCol = Math.min(startCol, endCol);
      const maxCol = Math.max(startCol, endCol);
      for (let col = minCol; col <= maxCol; col++) {
        if (grid[startRow]?.[col] && grid[startRow][col] !== " ") {
          cells.push(`${startRow}-${col}`);
        } else {
          break;
        }
      }
    } else if (startCol === endCol) {
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

      <div className="crossword-grid-container">
        <div
          className="crossword-grid"
          ref={gridRef}
          onMouseLeave={() => {
            setIsSelecting(false);
            if (selectedCells.length > 0) {
              processSelectionComplete();
            }
          }}
          onTouchEnd={handleTouchEnd}
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
                  onTouchStart={(e) => handleTouchStart(rowIndex, cellIndex, e)}
                  onTouchMove={(e) => handleTouchMove(rowIndex, cellIndex, e)}
                  onTouchEnd={handleTouchEnd}
                  onMouseUp={handleCellMouseUp}
                >
                  {cell && cell !== " " ? cell : ""}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Show timeout message */}
      {timeoutCells.length > 0 && (
        <div className="crossword-timeout-message">
          ⏰ Time's up! Moving to next question...
        </div>
      )}
    </div>
  );
};

export default CrosswordGame;
