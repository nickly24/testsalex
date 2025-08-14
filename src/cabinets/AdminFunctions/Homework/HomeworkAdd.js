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

  const formatDateInput = (value) => {
    // Удаляем все нецифровые символы
    const numbers = value.replace(/\D/g, '');
    
    let formatted = '';
    
    // Форматируем по маске дд.мм.гггг
    for (let i = 0; i < numbers.length; i++) {
      if (i === 2 || i === 4) {
        formatted += '.';
      }
      if (i >= 8) break; // Ограничиваем 8 цифрами (2 д + 2 м + 4 г)
      formatted += numbers[i];
    }
    
    return formatted;
  };

  const handleDateChange = (e) => {
    const input = e.target.value;
    
    // Если пользователь стер символ - оставляем как есть
    if (input.length < deadline.length) {
      setDeadline(input);
      return;
    }
    
    // Форматируем ввод
    setDeadline(formatDateInput(input));
  };

  const validateDate = (date) => {
    if (!date) return true; // Пустая дата - валидна
    
    const parts = date.split('.');
    if (parts.length !== 3 || parts.some(part => !part)) return false;
    
    const [day, month, year] = parts;
    
    // Проверяем числа
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    if (monthNum < 1 || monthNum > 12) return false;
    if (dayNum < 1 || dayNum > 31) return false;
    
    // Простая проверка дней в месяце
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    if (dayNum > daysInMonth) return false;
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!homeworkName.trim()) {
      setError('Название задания не может быть пустым');
      return;
    }

    if (deadline && !validateDate(deadline)) {
      setError('Введите корректную дату в формате дд.мм.гггг');
      return;
    }

    setIsSubmitting(true);

    try {
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
          <label htmlFor="deadline">Дедлайн (необязательно):</label>
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