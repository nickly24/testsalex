import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../Config';
const UnsignedUsers = ({ refreshFlag, onUpdate }) => {
  const [unassignedData, setUnassignedData] = useState({
    proctors: [],
    students: []
  });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState({});
  const [processingAssign, setProcessingAssign] = useState({
    proctors: {},
    students: {}
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, groupsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/get-unsigned-proctors-students`),
          axios.get(`${API_BASE_URL}/api/get-groups`)
        ]);

        if (usersResponse.data?.status) {
          setUnassignedData({
            proctors: usersResponse.data.unassigned_proctors || [],
            students: usersResponse.data.unassigned_students || []
          });
        }

        if (groupsResponse.data?.status) {
          setGroups(groupsResponse.data.res || []);
        }
      } catch (err) {
        setError(err.message || 'Ошибка загрузки данных');
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshFlag]);

  const handleGroupChange = (userId, type, value) => {
    setSelectedGroups(prev => ({
      ...prev,
      [`${type}_${userId}`]: value
    }));
  };

  const handleAssignProctor = async (proctorId) => {
    const groupId = selectedGroups[`proctor_${proctorId}`];
    if (!groupId) return setError('Выберите группу');

    try {
      setProcessingAssign(prev => ({
        ...prev,
        proctors: { ...prev.proctors, [proctorId]: true }
      }));
      
      await axios.post(
        `${API_BASE_URL}/api/change-group-proctor`,
        { proctorId, groupId },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setUnassignedData(prev => ({
        ...prev,
        proctors: prev.proctors.filter(p => p.proctor_id !== proctorId)
      }));
      onUpdate();
    } catch (err) {
      setError(err.message || 'Ошибка сервера');
      console.error('Ошибка:', err);
    } finally {
      setProcessingAssign(prev => ({
        ...prev,
        proctors: { ...prev.proctors, [proctorId]: false }
      }));
    }
  };

  const handleAssignStudent = async (studentId) => {
    const groupId = selectedGroups[`student_${studentId}`];
    if (!groupId) return setError('Выберите группу');

    try {
      setProcessingAssign(prev => ({
        ...prev,
        students: { ...prev.students, [studentId]: true }
      }));
      
      await axios.post(
        `${API_BASE_URL}/api/change-group-student`,
        { studentId, groupId },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setUnassignedData(prev => ({
        ...prev,
        students: prev.students.filter(s => s.student_id !== studentId)
      }));
      onUpdate();
    } catch (err) {
      setError(err.message || 'Ошибка сервера');
      console.error('Ошибка:', err);
    } finally {
      setProcessingAssign(prev => ({
        ...prev,
        students: { ...prev.students, [studentId]: false }
      }));
    }
  };

  if (loading) return <div className="loading">Загрузка данных...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="unsigned-users-container">
      <h2>Непривязанные пользователи</h2>
      
      <div className="users-cards">
        <div className="user-card proctors-card">
          <h3>Прокторы без группы</h3>
          {unassignedData.proctors.length > 0 ? (
            <ul className="users-list">
              {unassignedData.proctors.map(proctor => (
                <li key={proctor.proctor_id} className="user-item">
                  <div className="user-info">
                    <span className="user-name">{proctor.full_name}</span>
                    <span className="user-id">ID: {proctor.proctor_id}</span>
                  </div>
                  <div className="assign-controls">
                    <select
                      className="group-select"
                      value={selectedGroups[`proctor_${proctor.proctor_id}`] || ''}
                      onChange={(e) => handleGroupChange(proctor.proctor_id, 'proctor', e.target.value)}
                    >
                      <option value="" disabled>Выберите группу</option>
                      {groups.map(group => (
                        <option key={group.group_id} value={group.group_id}>
                          {group.group_name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignProctor(proctor.proctor_id)}
                      className="assign-button"
                      disabled={processingAssign.proctors[proctor.proctor_id]}
                    >
                      {processingAssign.proctors[proctor.proctor_id] ? (
                        <span className="spinner"></span>
                      ) : (
                        'Назначить'
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-users">Все прокторы привязаны к группам</p>
          )}
        </div>

        <div className="user-card students-card">
          <h3>Студенты без группы</h3>
          {unassignedData.students.length > 0 ? (
            <ul className="users-list">
              {unassignedData.students.map(student => (
                <li key={student.student_id} className="user-item">
                  <div className="user-info">
                    <span className="user-name">{student.full_name}</span>
                    <span className="user-id">ID: {student.student_id}</span>
                  </div>
                  <div className="assign-controls">
                    <select
                      className="group-select"
                      value={selectedGroups[`student_${student.student_id}`] || ''}
                      onChange={(e) => handleGroupChange(student.student_id, 'student', e.target.value)}
                    >
                      <option value="" disabled>Выберите группу</option>
                      {groups.map(group => (
                        <option key={group.group_id} value={group.group_id}>
                          {group.group_name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignStudent(student.student_id)}
                      className="assign-button"
                      disabled={processingAssign.students[student.student_id]}
                    >
                      {processingAssign.students[student.student_id] ? (
                        <span className="spinner"></span>
                      ) : (
                        'Назначить'
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-users">Все студенты привязаны к группам</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(UnsignedUsers);