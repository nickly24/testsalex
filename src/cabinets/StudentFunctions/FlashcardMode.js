import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { API_BASE_URL } from '../../Config';

export default function FlashcardMode({ theme, studentId, onBack }) {
  const [cards, setCards] = useState([]);
  const [learnedCardsCount, setLearnedCardsCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [animationState, setAnimationState] = useState('idle'); // 'idle' | 'flipping' | 'swiping-left' | 'swiping-right'
  const [swipeOffset, setSwipeOffset] = useState(0);
  
  const touchStartX = useRef(0);
  const cardRef = useRef(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const [unlearnedResponse, learnedResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/cadrs-by-theme/${studentId}/${theme.id}`),
          axios.get(`${API_BASE_URL}/learned-questions/${studentId}/${theme.id}`)
        ]);
        
        const shuffled = [...unlearnedResponse.data.cards_to_learn].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setLearnedCardsCount(learnedResponse.data.count || 0);
      } catch (error) {
        console.error('Error fetching cards:', error);
      }
    };

    fetchCards();
  }, [theme.id, studentId]);

  const handleFlip = () => {
    if (animationState !== 'idle') return;
    setAnimationState('flipping');
    setIsFlipped(!isFlipped);
    setTimeout(() => setAnimationState('idle'), 300);
  };

  const animateCardTransition = (direction) => {
    return new Promise(resolve => {
      setAnimationState(`swiping-${direction}`);
      setTimeout(() => {
        setAnimationState('idle');
        resolve();
      }, 300);
    });
  };

  const handleNext = async () => {
    if (animationState !== 'idle') return;
    
    await animateCardTransition('left');
    setCurrentIndex(prev => (prev + 1) % cards.length);
    setIsFlipped(false);
  };

  const handleRemember = async () => {
    if (animationState !== 'idle') return;
    
    try {
      await animateCardTransition('right');
      
      await axios.post(`${API_BASE_URL}/add-learned-question`, {
        student_id: studentId,
        question_id: cards[currentIndex].id
      });
      
      setLearnedCardsCount(prev => prev + 1);
      setCards(prev => prev.filter((_, i) => i !== currentIndex));
      
      if (cards.length === 1) {
        onBack();
      } else {
        setCurrentIndex(prev => prev >= cards.length - 1 ? 0 : prev);
        setIsFlipped(false);
      }
    } catch (error) {
      console.error('Error marking as learned:', error);
    }
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipeOffset(0);
  };

  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    setSwipeOffset(deltaX);
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 100) {
      handleRemember();
    } else if (swipeOffset < -100) {
      handleNext();
    }
    setSwipeOffset(0);
  };

  if (cards.length === 0) {
    return (
      <div className="flashcard-container">
        <div className="flashcard-complete">
          <h3>Все карточки изучены!</h3>
          <button className="back-button" onClick={onBack}>
            Вернуться к теме
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const nextCard = cards[(currentIndex + 1) % cards.length];

  return (
    <div className="flashcard-container">
      <div className="progress-header">
        Прогресс: {learnedCardsCount} / {cards.length + learnedCardsCount}
      </div>
      
      <div className="cards-wrapper">
        {/* Next card (peeking from behind) */}
        {animationState === 'idle' && (
          <div className="flashcard next-card">
            <div className="flashcard-inner">
              <div className="flashcard-front">
                {nextCard.question}
              </div>
            </div>
          </div>
        )}
        
        {/* Current card */}
        <div 
          ref={cardRef}
          className={`flashcard current-card 
            ${isFlipped ? 'flipped' : ''} 
            ${animationState === 'swiping-left' ? 'swipe-left' : ''}
            ${animationState === 'swiping-right' ? 'swipe-right' : ''}`}
          style={{ transform: swipeOffset ? `translateX(${swipeOffset}px)` : '' }}
          onClick={handleFlip}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flashcard-inner">
            <div className="flashcard-front">
              {currentCard.question}
            </div>
            <div className="flashcard-back">
              {currentCard.answer}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flashcard-controls">
        <button 
          className="control-button remember-button"
          onClick={handleRemember}
          disabled={animationState !== 'idle'}
        >
          Запомнил
        </button>
        <button 
          className="control-button next-button"
          onClick={handleNext}
          disabled={animationState !== 'idle'}
        >
          Дальше
        </button>
      </div>
      
      <button className="back-button" onClick={onBack}>
        &larr; Назад
      </button>
    </div>
  );
}