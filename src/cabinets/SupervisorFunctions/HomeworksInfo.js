import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HomeworksInfo.css';

export default function HomeworksInfo({ studentId, onBack }) {
    const [homeworks, setHomeworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHomeworks = async () => {
            try {
                const response = await axios.post(
                    'http://127.0.0.1:5000/api/get-homeworks-student',
                    { studentId: studentId }
                );
                setHomeworks(response.data.res);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка при загрузке домашних заданий:', err);
                setError('Не удалось загрузить данные');
                setLoading(false);
            }
        };

        fetchHomeworks();
    }, [studentId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) return <div className="loading-spinner"></div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="homeworks-modal">
            <div className="homeworks-content">
                <button className="back-button" onClick={onBack}>
                    ← Назад к информации о студенте
                </button>
                
                <h2>Домашние задания</h2>
                
                <div className="homeworks-list">
                    {homeworks.length > 0 ? (
                        homeworks.map(hw => (
                            <div key={hw.homework_id} className="homework-card">
                                <div className="homework-header">
                                    <h3>{hw.homework_name}</h3>
                                    <span className={`status-badge ${hw.status.includes('не') ? 'status-not-done' : 'status-done'}`}>
                                        {hw.status}
                                    </span>
                                </div>
                                
                                <div className="homework-details">
                                    <p><strong>Тип:</strong> {hw.homework_type}</p>
                                    <p><strong>Срок сдачи:</strong> {formatDate(hw.deadline)}</p>
                                    <p><strong>Результат:</strong> {hw.result || 'Нет данных'}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-homeworks">Нет данных о домашних заданиях</div>
                    )}
                </div>
            </div>
        </div>
    );
}