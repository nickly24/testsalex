import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../Config';
const Groups = ({ refreshFlag, onUpdate }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingProctors, setProcessingProctors] = useState({});
  const [processingStudents, setProcessingStudents] = useState({});

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/get-groups-students`);
        if (Array.isArray(response.data)) {
          setGroups(response.data);
        } else {
          throw new Error('Неверный формат данных');
        }
      } catch (err) {
        setError(err.message || 'Ошибка загрузки данных о группах');
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [refreshFlag]);

  const handleRemoveProctor = async (groupId, proctorId, proctorData) => {
    try {
      setProcessingProctors(prev => ({ ...prev, [proctorId]: true }));
      
      const response = await axios.post(
        `${API_BASE_URL}/api/remove-groupd-id-proctor`,
        { proctorId },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status) {
        setGroups(prev => prev.map(group => 
          group.item.group_id === groupId
            ? { ...group, proctor: { status: false, res: null } }
            : group
        ));
        onUpdate();
      }
    } catch (err) {
      setError(err.message || 'Ошибка сервера');
      console.error('Ошибка:', err);
    } finally {
      setProcessingProctors(prev => ({ ...prev, [proctorId]: false }));
    }
  };

  const handleRemoveStudent = async (groupId, studentId, studentData) => {
    try {
      setProcessingStudents(prev => ({ ...prev, [studentId]: true }));
      
      const response = await axios.post(
        `${API_BASE_URL}/api/remove-groupd-id-student`,
        { studentId },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status) {
        setGroups(prev => prev.map(group => 
          group.item.group_id === groupId
            ? { 
                ...group, 
                students: group.students.filter(s => s.id !== studentId) 
              }
            : group
        ));
        onUpdate();
      }
    } catch (err) {
      setError(err.message || 'Ошибка сервера');
      console.error('Ошибка:', err);
    } finally {
      setProcessingStudents(prev => ({ ...prev, [studentId]: false }));
    }
  };

  if (loading) return <div className="loading">Загрузка данных о группах...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="groups-container">
      <h2>Управление группами</h2>
      
      {groups.length === 0 ? (
        <p className="no-groups">Нет доступных групп</p>
      ) : (
        <div className="groups-list">
          {groups.map(group => (
            <div key={group.item.group_id} className="group-card">
              <div className="group-header">
                <h3>{group.item.group_name}</h3>
                <span className="group-id">ID: {group.item.group_id}</span>
              </div>
              
              <div className="group-content">
                <div className="proctor-section">
                  <h4>Проктор:</h4>
                  {group.proctor.status && group.proctor.res ? (
                    <div className="proctor-info">
                      <span>{group.proctor.res.full_name}</span>
                      <span className="proctor-id">ID: {group.proctor.res.proctor_id}</span>
                      <button 
                        onClick={() => handleRemoveProctor(
                          group.item.group_id, 
                          group.proctor.res.proctor_id,
                          group.proctor.res
                        )}
                        className="remove-button"
                        disabled={processingProctors[group.proctor.res.proctor_id]}
                      >
                        {processingProctors[group.proctor.res.proctor_id] ? (
                          <span className="spinner"></span>
                        ) : (
                          'Убрать'
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="no-proctor">Проктор не назначен</p>
                  )}
                </div>
                
                <div className="students-section">
                  <h4>Студенты ({group.students.length}):</h4>
                  {group.students.length > 0 ? (
                    <ul className="students-list">
                      {group.students.map(student => (
                        <li key={student.id} className="student-item">
                          <span>{student.full_name}</span>
                          <span className="student-id">ID: {student.id}</span>
                          <button
                            onClick={() => handleRemoveStudent(
                              group.item.group_id, 
                              student.id,
                              student
                            )}
                            className="remove-button small"
                            disabled={processingStudents[student.id]}
                          >
                            {processingStudents[student.id] ? (
                              <span className="spinner small"></span>
                            ) : (
                              'Убрать'
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-students">В группе нет студентов</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(Groups);