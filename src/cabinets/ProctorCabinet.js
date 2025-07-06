import React from 'react';
import StudentList from './ProctorsFunctions/StudentList';
import HomeworkList from './ProctorsFunctions/HomeworkList';

const ProctorCabinet = () => {
  const fullName = localStorage.getItem('full_name') || 'Проктор';
  const groupId = localStorage.getItem('group_id');
  const handleLogout = () => {
    // Очищаем localStorage
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    localStorage.removeItem('full_name');
    localStorage.removeItem('group_id');
    
    // Перезагружаем страницу для возврата на страницу входа
    window.location.reload();
  };

  return (
    <div className="cabinet">
      <header className="cabinet-header">
        <h1>Личный кабинет проктора</h1>
        <div className="user-info">
          <span>Добро пожаловать, {fullName}!</span>
          <button onClick={handleLogout} className="logout-button">
            Выйти
          </button>
        </div>
      </header>
      
      <main className="cabinet-content">
        {/* Здесь будет основное содержимое кабинета */}
         <StudentList groupId={groupId} />
         <HomeworkList/>
      </main>
    </div>
  );
};

export default ProctorCabinet;