import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/screen/home/HomePage";
import UserDetailsPage from "./components/screen/user-details/UserDetailsPage";
import GamePage from "./components/games/GamePage";
import ScorePopup from "./components/pop-ups/ScorePopup";
import ReviewPopup from "./components/screen/Review/ReviewPopup";
import ScoreboardPage from "./components/screen/scoreboard/ScoreboardPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/user-details" element={<UserDetailsPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/score-popup" element={<ScorePopup />} />
          <Route path="/review" element={<ReviewPopup />} />
          <Route path="/scoreboard" element={<ScoreboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
