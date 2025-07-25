import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../Config';
const HomeworkStudents = ({ homeworkId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [datePass, setDatePass] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const proctorId = localStorage.getItem('id');

  useEffect(() => {
    if (!homeworkId || !proctorId) return;

    const fetchSessions = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/get-homework-sessions`,
          {
            proctorId: proctorId,
            homeworkId: homeworkId
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data?.status && Array.isArray(response.data?.res)) {
          setSessions(response.data.res);
        } else {
          throw new Error('Неверный формат данных');
        }
      } catch (err) {
        setError(err.message || 'Ошибка загрузки данных');
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [homeworkId, proctorId, success]);

  const handlePassHomework = async () => {
    if (!datePass || !editingSession) return;
    
    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/pass_homework`,
        {
          sessionId: editingSession.id,
          datePass: datePass
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccess(`ДЗ для ${editingSession.student_full_name} успешно занесено!`);
      setEditingSession(null);
      setDatePass('');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при отправке данных');
      console.error('Ошибка:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-students">Загрузка студентов...</div>;
  if (error) return <div className="error-students">{error}</div>;

  return (
    <div className="students-sessions-list">
      {success && <div className="success-message">{success}</div>}
      
      {sessions.map(session => (
        <div 
          key={session.id} 
          className={`session-card ${session.status === 0 ? 'not-submitted' : 'submitted'}`}
        >
          <div className="student-info">
            <span className="student-name">{session.student_full_name}</span>
            <span className="student-id">ID: {session.student_id}</span>
          </div>
          
          {session.status === 1 ? (
            <div className="result">Баллы: {session.result}</div>
          ) : (
            <div className="not-submitted-actions">
              <div className="status">Не сдал</div>
              
              {editingSession?.id === session.id ? (
                <div className="pass-form">
                  <input
                    type="date"
                    value={datePass}
                    onChange={(e) => setDatePass(e.target.value)}
                    className="date-input"
                    min="2000-01-01"
                    max="2100-12-31"
                  />
                  <button 
                    onClick={handlePassHomework}
                    disabled={submitting || !datePass}
                    className="submit-btn"
                  >
                    {submitting ? 'Отправка...' : 'Отправить'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setEditingSession(session)}
                  className="submit-btn"
                >
                  Занести ДЗ
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HomeworkStudents;