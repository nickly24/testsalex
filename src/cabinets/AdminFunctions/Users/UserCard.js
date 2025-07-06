import { useState } from 'react';

const UserCard = ({ user, role, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(user.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="user-card">
      <h4>{user.full_name}</h4>
   
      
      <button 
        onClick={handleDelete} 
        disabled={isDeleting}
        className="delete-button"
      >
        {isDeleting ? 'Удаление...' : 'Удалить'}
      </button>
      
      <style jsx>{`
        .user-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
          background-color: #f9f9f9;
          position: relative;
        }
        h4 {
          margin-top: 0;
          color: #333;
        }
        .delete-button {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 5px 10px;
          background-color: #ff4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .delete-button:hover {
          background-color: #cc0000;
        }
        .delete-button:disabled {
          background-color: #ff9999;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default UserCard;