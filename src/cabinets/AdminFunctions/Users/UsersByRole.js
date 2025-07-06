import React, { useState, useEffect } from "react";
import axios from "axios";
import UserCard from "./UserCard";
import { API_BASE_URL } from "../../../Config";
const roles = [
  { value: "student", label: "Студенты" },
  { value: "proctor", label: "Прокторы" },
  { value: "examinator", label: "Экзаменаторы" },
  { value: "supervisor", label: "Супервизоры" },
];

export default function UsersByRole() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  const fetchUsers = async (role) => {
    setSelectedRole(role);
    setUsers([]);
    setLoading(true);
    setCurrentPage(1); // Сбрасываем пагинацию при смене роли
    try {
      const response = await axios.post(`${API_BASE_URL}/api/get-users-by-role`, { role });
      setUsers(response.data.res || []);
    } catch (error) {
      console.error("Ошибка при загрузке пользователей:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/delete-user`, {
        role: selectedRole,
        userId
      });
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Ошибка при удалении пользователя:", error);
    }
  };

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Пагинация
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container">
      <h2>Пользователи</h2>
      
      

      {/* Кнопки выбора роли */}
      <div className="button-group">
        {roles.map((r) => (
          <button
            key={r.value}
            onClick={() => fetchUsers(r.value)}
            className={`role-button ${selectedRole === r.value ? 'active' : ''}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Поиск по имени */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Поиск по имени..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Сбрасываем пагинацию при поиске
          }}
          className="search-input"
        />
      </div>
      {loading && <p>Загрузка...</p>}

      {!loading && selectedRole && (
        <div className="user-list">
          <h3>{roles.find(r => r.value === selectedRole).label}:</h3>
          
          {currentUsers.length > 0 ? (
            <>
              <div className="user-cards-container">
                {currentUsers.map(user => (
                  <UserCard
                    key={user.id} 
                    user={user} 
                    role={selectedRole}
                    onDelete={handleDeleteUser}
                  />
                ))}
              </div>

              {/* Пагинация */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Назад
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={currentPage === number ? 'active' : ''}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Вперед
                  </button>
                </div>
              )}
            </>
          ) : (
            <p>Нет данных для отображения</p>
          )}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 30px auto;
          text-align: center;
          font-family: Arial, sans-serif;
        }
        
        .search-container {
          margin-bottom: 20px;
        }
        
        .search-input {
          padding: 10px;
          width: 100%;
          max-width: 400px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }
        
        .button-group {
          margin-bottom: 20px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }
        
        .role-button {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          background-color: #e0e0e0;
          color: #333;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s;
        }
        
        .role-button:hover {
          background-color: #d0d0d0;
        }
        
        .role-button.active {
          background-color: #007bff;
          color: white;
        }
        
        .user-list {
          margin-top: 20px;
          text-align: left;
        }
        
        .user-cards-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          gap: 5px;
          margin-top: 20px;
        }
        
        .pagination button {
          padding: 5px 10px;
          border: 1px solid #ddd;
          border-radius: 3px;
          background-color: white;
          cursor: pointer;
        }
        
        .pagination button:hover:not(:disabled) {
          background-color: #f0f0f0;
        }
        
        .pagination button.active {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }
        
        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}