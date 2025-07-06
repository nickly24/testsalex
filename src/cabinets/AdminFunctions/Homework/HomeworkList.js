import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HomeworkList = ({ refreshFlag }) => {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHomeworks = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/get-homeworks');
        
        if (response.data?.status && Array.isArray(response.data?.res)) {
          setHomeworks(response.data.res);
        } else {
          throw new Error('Неверный формат данных');
        }
      } catch (err) {
        setError(err.message || 'Ошибка загрузки заданий');
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworks();
  }, [refreshFlag]);

  const handleDelete = async (homeworkId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это задание?')) return;
    
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/api/delete-homework',
        { homeworkId },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        setHomeworks(prev => prev.filter(hw => hw.id !== homeworkId));
      } else {
        throw new Error(response.data.message || 'Ошибка при удалении');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Ошибка сервера');
      console.error('Ошибка:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Нет дедлайна';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  if (loading) return <div className="loading">Загрузка заданий...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="homework-list-container">
      <h2>Список домашних заданий</h2>
      {homeworks.length === 0 ? (
        <p className="no-homeworks">Нет созданных заданий</p>
      ) : (
        <ul className="homework-list">
          {homeworks.map(hw => (
            <li key={hw.id} className="homework-item">
              <div className="homework-info">
                <span className="hw-name">{hw.name}</span>
                <span className="hw-type">{hw.type}</span>
                <span className="hw-deadline">{formatDate(hw.deadline)}</span>
              </div>
              <button 
                onClick={() => handleDelete(hw.id)}
                className="delete-button"
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HomeworkList;