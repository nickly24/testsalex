import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StudentInfo.css';
import HomeworksInfo from './HomeworksInfo';

export default function StudentInfo({ studentId, onBack }) {
    const [student, setStudent] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showHomeworks, setShowHomeworks] = useState(false);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setLoading(true);
                const studentResponse = await axios.get('http://127.0.0.1:5000/api/get-students');
                const foundStudent = studentResponse.data.res.find(s => s.student_id === studentId);
                
                if (!foundStudent) throw new Error('Студент не найден');
                
                setStudent(foundStudent);
                const performanceResponse = await axios.post(
                    'http://127.0.0.1:5001/perfomance-by-student',
                    { student_id: studentId }
                );
                setPerformance(performanceResponse.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка при загрузке данных студента:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [studentId]);

    if (loading) return <div className="loading">Загрузка данных...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!student) return <div className="error">Данные о студенте не найдены</div>;

    if (showHomeworks) {
        return <HomeworksInfo studentId={studentId} onBack={() => setShowHomeworks(false)} />;
    }

    return (
        <div className="student-info-modal">
            <div className="student-info-content">
                <button className="back-button" onClick={onBack}>
                    ← Назад к списку
                </button>
                
                <h2>{student.full_name}</h2>
                <div className="info-grid">
                    <div className="info-section">
                        <h3>Основная информация</h3>
                        <p><strong>Класс:</strong> {student.class}</p>
                        <p><strong>ID группы:</strong> {student.group_id}</p>
                        <p><strong>ID студента:</strong> {student.student_id}</p>
                    </div>
                    
                    <div className="info-section">
                        <h3>Посещаемость</h3>
                        <p><strong>Общая посещаемость:</strong> {performance?.attendance ?? 'Нет данных'}%</p>
                    </div>
                    
                    <div className="info-section clickable" onClick={() => setShowHomeworks(true)}>
                        <h3>Домашние задания</h3>
                        <p><strong>Выполнено:</strong> {performance?.homework?.completed ?? 0}/{performance?.homework?.total ?? 0}</p>
                        <p><strong>Процент выполнения:</strong> {performance?.homework ? 
                            Math.round((performance.homework.completed / performance.homework.total) * 100) : 0}%</p>
                        <div className="view-more">Просмотреть все задания →</div>
                    </div>
                    
                    <div className="info-section">
                        <h3>Экзамены</h3>
                        <p><strong>Выполнено:</strong> {performance?.control_works?.completed ?? 0}/{performance?.control_works?.total ?? 0}</p>
                        <p><strong>Средний балл:</strong> {performance?.control_works?.average_score ?? 'Нет данных'}</p>
                    </div>
                    
                    <div className="info-section">
                        <h3>Тесты</h3>
                        <p><strong>Выполнено:</strong> {performance?.tests?.completed ?? 0}/{performance?.tests?.total ?? 0}</p>
                        <p><strong>Средний балл:</strong> {performance?.tests?.average_score ?? 'Нет данных'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}