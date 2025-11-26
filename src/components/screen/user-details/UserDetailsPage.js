import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./UserDetailsPage.css";

const UserDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userDetails, setUserDetails] = useState({
    name: "",
    school: "",
  });
  const [selectedGame, setSelectedGame] = useState("mcq");

  useEffect(() => {
    if (location.state?.gameType) {
      setSelectedGame(location.state.gameType);
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userDetails.name.trim() && userDetails.school.trim()) {
      // Navigate directly to game page without countdown
      navigate("/game", {
        state: {
          userDetails,
          gameType: selectedGame,
        },
      });
    } else {
      alert("Please enter both name and school name");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="user-details-container">
      {/* Back to Home Button */}
      <button className="back-to-home-btn" onClick={handleBackToHome}>
        Back to Home
      </button>

      <div className="user-details-form">
        <h1 className="form-title">Enter Your Details</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={userDetails.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="school">School Name</label>
            <input
              type="text"
              id="school"
              name="school"
              value={userDetails.school}
              onChange={handleInputChange}
              placeholder="Enter your school name"
              required
            />
          </div>

          <div className="input-group">
            <label>Select Game Type</label>
            <div className="game-selection">
              <button
                type="button"
                className={`game-option ${
                  selectedGame === "mcq" ? "selected" : ""
                }`}
                onClick={() => setSelectedGame("mcq")}
              >
                MCQ Quiz
              </button>
              <button
                type="button"
                className={`game-option ${
                  selectedGame === "jumble" ? "selected" : ""
                }`}
                onClick={() => setSelectedGame("jumble")}
              >
                Jumble Words
              </button>
              <button
                type="button"
                className={`game-option ${
                  selectedGame === "crossword" ? "selected" : ""
                }`}
                onClick={() => setSelectedGame("crossword")}
              >
                Crossword
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserDetailsPage;
