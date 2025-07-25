import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ThemeDetail.css';

import { API_BASE_URL } from '../../Config';

export default function ThemeDetail({ theme, studentId, onBack, onStartFlashcards }) {
  const [cards, setCards] = useState([]);
  const [learnedCards, setLearnedCards] = useState([]);
  const [unlearnedCards, setUnlearnedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [expandingCardId, setExpandingCardId] = useState(null);
  const [collapsingCardId, setCollapsingCardId] = useState(null);

  const updateSeparatedCards = (allCards) => {
    const learned = allCards.filter(card => card.is_learned);
    const unlearned = allCards.filter(card => !card.is_learned);
    setLearnedCards(learned);
    setUnlearnedCards(unlearned);
  };

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/all-cards-by-theme/${studentId}/${theme.id}`
        );
        const allCards = response.data.cards;
        setCards(allCards);
        updateSeparatedCards(allCards);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cards:', error);
        setLoading(false);
      }
    };

    fetchCards();
  }, [theme.id, studentId]);

  const handleToggleLearned = async (cardId, isCurrentlyLearned) => {
    try {
      if (isCurrentlyLearned) {
        await axios.delete(
          `${API_BASE_URL}/remove-learned-question/${studentId}/${cardId}`
        );
      } else {
        await axios.post(`${API_BASE_URL}/add-learned-question`, {
          student_id: studentId,
          question_id: cardId
        });
      }
      
      setCards(prevCards => {
        const updatedCards = prevCards.map(card => 
          card.id === cardId 
            ? { ...card, is_learned: !isCurrentlyLearned } 
            : card
        );
        updateSeparatedCards(updatedCards);
        return updatedCards;
      });
    } catch (error) {
      console.error('Error toggling learned status:', error);
    }
  };

  const toggleCardExpand = (cardId) => {
    if (expandedCardId === cardId) {
      setCollapsingCardId(cardId);
      setTimeout(() => {
        setExpandedCardId(null);
        setCollapsingCardId(null);
      }, 300);
    } else {
      setExpandedCardId(cardId);
      setExpandingCardId(cardId);
      setTimeout(() => setExpandingCardId(null), 300);
    }
  };

  if (loading) return <div className="loading">Loading cards...</div>;

  return (
    <div className="theme-detail">
      <button className="back-button" onClick={onBack}>
        &larr; Назад
      </button>
      
      <h2>{theme.name}</h2>
      
      <div className="progress-summary">
        Выучено: {learnedCards.length} из {cards.length} карточек
      </div>
      
      <div className="cards-section">
        <h3>Невыученные</h3>
        {unlearnedCards.map(card => (
          <div key={card.id} className="card-item">
            <div 
              className="card-question" 
              onClick={() => toggleCardExpand(card.id)}
            >
              {card.question}
              <div 
                className={`card-answer ${
                  expandedCardId === card.id ? 'expanded' : ''
                } ${
                  expandingCardId === card.id ? 'expanding' : ''
                } ${
                  collapsingCardId === card.id ? 'collapsing' : ''
                }`}
              >
                <strong>Ответ:</strong> {card.answer}
              </div>
            </div>
            <button 
              className="learn-button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleLearned(card.id, false);
              }}
            >
              Пометить как выученное
            </button>
          </div>
        ))}
      </div>
      
      <div className="cards-section">
        <h3>Выученные</h3>
        {learnedCards.map(card => (
          <div key={card.id} className="card-item">
            <div 
              className="card-question" 
              onClick={() => toggleCardExpand(card.id)}
            >
              {card.question}
              <div 
                className={`card-answer ${
                  expandedCardId === card.id ? 'expanded' : ''
                } ${
                  expandingCardId === card.id ? 'expanding' : ''
                } ${
                  collapsingCardId === card.id ? 'collapsing' : ''
                }`}
              >
                <strong>Ответ:</strong> {card.answer}
              </div>
            </div>
            <button 
              className="unlearn-button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleLearned(card.id, true);
              }}
            >
              Пометить как невыученное
            </button>
          </div>
        ))}
      </div>
      
      <button 
        className="flashcards-button"
        onClick={onStartFlashcards}
        disabled={unlearnedCards.length === 0}
      >
        Карточки
      </button>
    </div>
  );
}