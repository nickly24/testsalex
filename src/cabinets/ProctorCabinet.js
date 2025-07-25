import React, { useState } from 'react';
import StudentList from './ProctorsFunctions/StudentList';
import HomeworkList from './ProctorsFunctions/HomeworkList';
import './ProctorCabinet.css';
import { ReactComponent as Logo } from './logo.svg';

const ProctorCabinet = () => {
  const fullName = localStorage.getItem('full_name') || 'Проктор';
  const groupId = localStorage.getItem('group_id');
  const [showStudents, setShowStudents] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    localStorage.removeItem('full_name');
    localStorage.removeItem('group_id');
    window.location.reload();
  };

  const toggleStudents = () => {
    setShowStudents(!showStudents);
  };

  return (
    <div className="cabinet">
      <header className="cabinet-header">
        <div><Logo/><h3>Личный кабинет проктора</h3></div>
        <div className="user-inf">
          <div><span>Добро пожаловать, {fullName}!</span></div>
          <button onClick={handleLogout} className="logout-button">
            Выйти
          </button>
        </div>
      </header>
      
      <main className="cabinet-content">
        <div className="students-section">
          <button 
            onClick={toggleStudents}
            className="toggle-students-btn"
          >
            {showStudents ? 'Скрыть список студентов' : 'Показать список студентов'}
            <span className={`toggle-icon ${showStudents ? 'open' : ''}`}>▼</span>
          </button>
          
          <div className={`students-container ${showStudents ? 'visible' : ''}`}>
            <StudentList groupId={groupId} />
          </div>
        </div>
        
        <HomeworkList />
      </main>
    </div>
  );
};

export default ProctorCabinet;