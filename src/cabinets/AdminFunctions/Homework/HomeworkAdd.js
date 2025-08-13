import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../Config';
const HomeworkAdd = ({ onHomeworkAdded }) => {
  const [homeworkName, setHomeworkName] = useState('');
  const [homeworkType, setHomeworkType] = useState('ДЗНВ');
  const [deadline, setDeadline] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const dateInputRef = useRef(null);

  // Закрытие date picker при клике вне его области
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dateInputRef.current && !dateInputRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!homeworkName.trim()) {
      setError('Название задания не может быть пустым');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/create-homework`,
        {
          homeworkName: homeworkName.trim(),
          homeworkType: homeworkType,
          deadline: deadline || null
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        setSuccessMessage(`Задание "${homeworkName}" успешно добавлено!`);
        setHomeworkName('');
        setHomeworkType('ДЗНВ');
        setDeadline('');
        if (onHomeworkAdded) onHomeworkAdded(); 
      } else {
        throw new Error(response.data.message || 'Ошибка при создании задания');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Ошибка сервера');
      console.error('Ошибка:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (e) => {
    setDeadline(e.target.value);
    setShowDatePicker(false);
  };

  return (
    <div className="homework-add-container">
      <h2>Добавить новое задание</h2>
      
      <form onSubmit={handleSubmit} className="homework-form">
        <div className="form-group">
          <label htmlFor="homeworkName">Название задания:</label>
          <input
            type="text"
            id="homeworkName"
            value={homeworkName}
            onChange={(e) => setHomeworkName(e.target.value)}
            placeholder="Введите название задания"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="homeworkType">Тип задания:</label>
          <select
            id="homeworkType"
            value={homeworkType}
            onChange={(e) => setHomeworkType(e.target.value)}
            className="form-select"
            required
          >
            <option value="ДЗНВ">ДЗНВ</option>
            <option value="ОВ">ОВ</option>
          </select>
        </div>

        <div className="form-group" ref={dateInputRef}>
          <label htmlFor="deadline">Дедлайн (необязательно):</label>
          <input
            type="text"
            id="deadline"
            value={deadline}
            onClick={() => setShowDatePicker(true)}
            readOnly
            className="form-input"
            placeholder="Выберите дату"
          />
          {showDatePicker && (
            <div className="date-picker-popup">
              <input
                type="date"
                value={deadline}
                onChange={handleDateChange}
                
                className="date-picker-input"
                autoFocus
              />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Добавление...' : 'Добавить задание'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

export default HomeworkAdd;