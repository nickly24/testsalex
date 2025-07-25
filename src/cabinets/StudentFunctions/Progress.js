import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Progress.css'; // Создадим отдельный файл для стилей
import { API_EXAM_URL } from '../../Config';
const Progress = ({ onBack }) => {
  const studentName = localStorage.getItem('full_name');
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const studentId = localStorage.getItem('id'); // Предполагаем, что ID хранится в localStorage
        const response = await axios.post(`${API_EXAM_URL}/student-rating`, {
          student_id: studentId
        });
        
        if (response.data.status && response.data.data.length > 0) {
          setRatings(response.data.data[0]);
        } else {
          setError('Данные об успеваемости не найдены');
        }
      } catch (err) {
        setError('Ошибка при загрузке данных');
        console.error('Error fetching ratings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  // Функция для отрисовки столбцов диаграммы
  const renderBar = (value, max = 100, label) => {
    const percentage = Math.min(value, max);
    return (
      <div className="bar-container">
        <div className="bar-label">{label}</div>
        <div className="bar">
          <div 
            className="bar-fill" 
            style={{ width: `${percentage}%` }}
          ></div>
          <span className="bar-value">{value}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="content-section">
      <div className="welcome-section">
        <h2>Добро пожаловать, {studentName}! 👋</h2>
        <p>Здесь вы можете посмотреть свою успеваемость</p>
      </div>
      
      <div className="ratings-container">
        <h3>Ваша успеваемость</h3>
        
        {loading && <p>Загрузка данных...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {ratings && (
          <div className="ratings-grid">
            <div className="rating-card">
              <h4>Общий рейтинг</h4>
              <div className="big-rate">{ratings.rate}</div>
              {renderBar(ratings.rate, 100, 'Общий рейтинг')}
            </div>
            
            <div className="rating-card">
              <h4>Домашние задания</h4>
              <div className="rate-value">{ratings.homework_rate}</div>
              {renderBar(ratings.homework_rate, 100, 'Выполнение ДЗ')}
            </div>
            
            <div className="rating-card">
              <h4>Тесты</h4>
              <div className="rate-value">{ratings.test_rate}</div>
              {renderBar(ratings.test_rate, 100, 'Результаты тестов')}
            </div>
            
            <div className="rating-card">
              <h4>Экзамены</h4>
              <div className="rate-value">{ratings.exam_rate}</div>
              {renderBar(ratings.exam_rate, 100, 'Экзаменационные оценки')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;