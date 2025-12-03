import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage, STORAGE_KEYS } from "../../../utils/storage";
import "./ReviewPopup.css";

const ReviewPopup = () => {
  const navigate = useNavigate();
  const [reviewText, setReviewText] = useState("");
  const [selectedRating, setSelectedRating] = useState("");

  const handleSubmitReview = () => {
    if (!reviewText.trim() && !selectedRating) {
      alert("Please provide either a text review or select a rating");
      return;
    }

    const review = {
      text: reviewText,
      rating: selectedRating,
      timestamp: new Date().toISOString(),
    };

    // Save review
    const existingReviews = storage.getItem(STORAGE_KEYS.REVIEWS) || [];
    storage.setItem(STORAGE_KEYS.REVIEWS, [...existingReviews, review]);

    // Navigate to home
    navigate("/");
  };

  const handleRatingSelect = (rating) => {
    setSelectedRating(rating);
  };

  return (
    <div className="review-popup-container">
      <div className="review-popup">
        <div className="review-header">
          <h1 className="review-title">Share Your Feedback</h1>
          <p className="review-subtitle">
            We'd love to hear about your experience!
          </p>
        </div>

        <div className="review-form">
          <div className="input-group">
            <label htmlFor="review-textarea" className="input-label">
              Your Feedback
            </label>
            <textarea
              id="review-textarea"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us what you think about the game..."
              className="review-textarea"
              rows="5"
              maxLength="500"
            />
          </div>

          <div className="rating-section">
            <h3 className="rating-title">How was your experience?</h3>
            <div className="rating-buttons">
              <button
                className={`rating-btn ${
                  selectedRating === "excellent" ? "selected" : ""
                }`}
                onClick={() => handleRatingSelect("excellent")}
                aria-label="Excellent rating"
              >
                <span className="rating-emoji">🤩</span>
                <span className="rating-text">Excellent</span>
              </button>
              <button
                className={`rating-btn ${
                  selectedRating === "good" ? "selected" : ""
                }`}
                onClick={() => handleRatingSelect("good")}
                aria-label="Good rating"
              >
                <span className="rating-emoji">😊</span>
                <span className="rating-text">Good</span>
              </button>
              <button
                className={`rating-btn ${
                  selectedRating === "bad" ? "selected" : ""
                }`}
                onClick={() => handleRatingSelect("bad")}
                aria-label="Bad rating"
              >
                <span className="rating-emoji">😞</span>
                <span className="rating-text">Bad</span>
              </button>
            </div>
          </div>

          <div className="review-buttons">
            <button
              className="submit-review-btn"
              onClick={handleSubmitReview}
              disabled={!reviewText.trim() && !selectedRating}
            >
              <span className="btn-text">Submit Review</span>
              <span className="btn-icon">✓</span>
            </button>
            <button
              className="skip-review-btn"
              onClick={() => navigate("/")}
              aria-label="Skip review"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPopup;
