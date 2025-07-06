import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HomeworkStudents from './HomeworkStudents';
import { API_BASE_URL } from '../../Config';
const HomeworkList = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const toggleHomework = (id) => {
    // Разворачиваем только если карточка свернута
    if (expandedId !== id) {
      setExpandedId(id);
    }
  };

  useEffect(() => {
    const fetchHomeworks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/get-homeworks`);
        
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
  }, []);

  if (loading) return <div className="loading">Загрузка заданий...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="homework-list">
      <div className="homework-grid">
        {homeworks.map(hw => (
          <div 
            key={hw.id} 
            className={`homework-card ${expandedId === hw.id ? 'expanded' : ''}`}
            onClick={() => toggleHomework(hw.id)}
          >
            <div className="hw-main-content">
              <div className="hw-header">
                <span className="hw-type">{hw.type}</span>
                <h3 className="hw-title">{hw.name}</h3>
              </div>
              <div className={`expand-icon ${expandedId === hw.id ? 'expanded' : ''}`}>
                {expandedId === hw.id ? '▲' : '▼'}
              </div>
              
              {expandedId === hw.id && (
                <button 
                  className="close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(null);
                  }}
                >
                  Закрыть окно
                </button>
              )}
            </div>
            
            {expandedId === hw.id && (
              <div className="hw-details">
                <HomeworkStudents homeworkId={hw.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeworkList;