import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../Config';

const HomeworkAdd = ({ onHomeworkAdded }) => {
  const [homeworkName, setHomeworkName] = useState('');
  const [homeworkType, setHomeworkType] = useState('ДЗНВ');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleDateChange = (e) => {
    let value = e.target.value;
    
    // Добавляем точки автоматически
    if (value.length === 2 || value.length === 5) {
      value += '.';
    }
    
    // Ограничиваем длину и разрешаем только цифры и точки
    if (value.length <= 10 && /^[\d.]*$/.test(value)) {
      setDeadline(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!homeworkName.trim()) {
      setError('Название задания не может быть пустым');
      return;
    }

    // Проверка формата даты, если она указана
    if (deadline && !/^\d{2}\.\d{2}\.\d{4}$/.test(deadline)) {
      setError('Введите дату в формате дд.мм.гггг');
      return;
    }

    setIsSubmitting(true);

    try {
      // Конвертируем дату в формат YYYY-MM-DD для сервера
      const formattedDeadline = deadline 
        ? deadline.split('.').reverse().join('-')
        : null;

      const response = await axios.post(
        `${API_BASE_URL}/api/create-homework`,
        {
          homeworkName: homeworkName.trim(),
          homeworkType: homeworkType,
          deadline: formattedDeadline
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

        <div className="form-group">
          <label htmlFor="deadline">Дедлайн (необязательно, формат дд.мм.гггг):</label>
          <input
            type="text"
            id="deadline"
            value={deadline}
            onChange={handleDateChange}
            placeholder="дд.мм.гггг"
            className="form-input"
            maxLength={10}
          />
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