// Progress.jsx
const Progress = ({ onBack }) => {
  return (
    <div className="content-section">
      <button onClick={onBack} className="back-button">← Назад</button>
      <h2>Успеваемость</h2>
      {/* Контент успеваемости */}
    </div>
  );
};

export default Progress;