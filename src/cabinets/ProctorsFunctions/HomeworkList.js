import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HomeworkStudents from './HomeworkStudents';
import { API_BASE_URL } from '../../Config';
import './HomeworkList.css';

const HomeworkList = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [homeworksPerPage] = useState(6);

  const toggleHomework = (id) => {
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

  // Получаем текущие задания
  const indexOfLastHomework = currentPage * homeworksPerPage;
  const indexOfFirstHomework = indexOfLastHomework - homeworksPerPage;
  const currentHomeworks = homeworks.slice(indexOfFirstHomework, indexOfLastHomework);

  // Меняем страницу
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="loading">Загрузка заданий...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
    <div className="homework-list">
      
        {currentHomeworks.map(hw => (
          <div 
            key={hw.id} 
            className={`homework-card ${expandedId === hw.id ? 'expanded' : ''}`}
            onClick={() => toggleHomework(hw.id)}
          >
            {/* Остальное содержимое карточки без изменений */}
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
    {/* Пагинация */}
      <div className="pagination">
        {Array.from({ length: Math.ceil(homeworks.length / homeworksPerPage) }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </>
  );
};

export default HomeworkList;