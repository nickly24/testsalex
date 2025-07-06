import React, { useState } from 'react';
import Homework from './AdminFunctions/Homework/Homework';
import GroupsFunc from './AdminFunctions/Groups/GroupsFunc';
import Attendance from './AdminFunctions/Attendance/Attendance';
import UsersByRole from './AdminFunctions/Users/UsersByRole';
import TestCreate from './AdminFunctions/Tests/TestCreate';

const AdminCabinet = () => {
  const [currentView, setCurrentView] = useState('main');
  const adminName = localStorage.getItem('full_name') || 'Администратор';
  const adminId = localStorage.getItem('id');
  
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const renderView = () => {
    switch(currentView) {
      case 'users':
        return (
          <div className="admin-panel">
            <h2>Управление пользователями</h2>
            <p>Здесь будет таблица пользователей</p>
            <UsersByRole/>
          </div>
        );
      case 'groups':
        return (
          <div className="admin-panel">
            <GroupsFunc/>
          </div>
        );
      case 'assignments':
        return (
          <div className="admin-panel">
            <h2>Управление Домашними заданиями</h2>
            <p>Здесь будут учебные материалы и задания</p>
            <Homework/>
          </div>
        );
      case 'attendance':
        return (
          <div className="admin-panel">
            <h2>Управление посещаемостью</h2>
            <p>Здесь будет управление посещаемостью студентов</p>
            <Attendance/>
          </div>
        );
      case 'tests':
        return (
          <div className="admin-panel">
            <h2>Управление Тестами</h2>
            <TestCreate/>
          </div>
        );
      default:
        return (
          <div className="admin-features">
            <div 
              className="feature-card" 
              onClick={() => setCurrentView('users')}
            >
              <h3>Пользователи</h3>
              <p>Управление всеми пользователями системы</p>
            </div>
            
            <div 
              className="feature-card" 
              onClick={() => setCurrentView('groups')}
            >
              <h3>Группы</h3>
              <p>Создание и редактирование учебных групп</p>
            </div>
            
            <div 
              className="feature-card" 
              onClick={() => setCurrentView('assignments')}
            >
              <h3>Домашние задания</h3>
              <p>Управление учебными материалами</p>
            </div>

            <div 
              className="feature-card" 
              onClick={() => setCurrentView('attendance')}
            >
              <h3>Посещаемость</h3>
              <p>Управление посещаемостью студентов</p>
            </div>
            <div 
              className="feature-card" 
              onClick={() => setCurrentView('tests')}
            >
              <h3>Тесты</h3>
              <p>Управление тестами студентов</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-cabinet">
      <header className="cabinet-header">
        <h1>Панель администратора</h1>
        <div className="user-info">
          <span>{adminName} | ID: {adminId}</span>
          <button onClick={handleLogout} className="logout-button">
            Выйти
          </button>
        </div>
      </header>

      <main className="cabinet-content">
        {currentView !== 'main' && (
          <button 
            onClick={() => setCurrentView('main')} 
            className="back-button"
          >
            ← Назад к меню
          </button>
        )}
        
        <div className="admin-welcome">
          {currentView === 'main' ? (
            <>
              <h2>Добро пожаловать в панель управления</h2>
              <p>Выберите раздел для работы</p>
            </>
          ) : null}
          
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default AdminCabinet;