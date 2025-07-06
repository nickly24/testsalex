import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './StudentsPanel.css';
import StudentInfo from './StudentInfo';

const LoadingSpinner = () => (
  <div className="spinner-container">
    <div className="loading-spinner"></div>
    <p>Загрузка данных...</p>
  </div>
);

export default function StudentsPanel() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const studentsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const studentsResponse = await axios.get('http://127.0.0.1:5000/api/get-students');
                const studentsData = studentsResponse.data.res;
                
                const studentsWithPerformance = await Promise.all(
                    studentsData.map(async (student) => {
                        try {
                            const performanceResponse = await axios.post(
                                'http://127.0.0.1:5001/perfomance-by-student',
                                { student_id: student.student_id }
                            );
                            return {
                                ...student,
                                performance: performanceResponse.data.data
                            };
                        } catch (error) {
                            console.error(`Ошибка при получении данных для студента ${student.student_id}:`, error);
                            return {
                                ...student,
                                performance: null
                            };
                        }
                    })
                );
                
                setStudents(studentsWithPerformance);
                setLoading(false);
            } catch (error) {
                console.error("Ошибка при получении данных:", error);
                setError("Не удалось загрузить данные");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredStudents = useMemo(() => {
        return students.filter(student => 
            student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);

    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
    };

    const handleBack = () => {
        setSelectedStudent(null);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="error">{error}</div>;

    if (selectedStudent) {
        return (
            <StudentInfo studentId={selectedStudent.student_id} onBack={handleBack} />
        );
    }

    return (
        <div className="students-panel">
            <h2>Список студентов</h2>
            
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Поиск по имени..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="search-input"
                />
            </div>
            
            <div className="table-container">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>ФИО</th>
                            <th>Класс</th>
                            <th>Посещаемость</th>
                            <th>Домашние задания</th>
                            <th>Контрольные работы</th>
                            <th>Тесты</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentStudents.length > 0 ? (
                            currentStudents.map(student => (
                                <tr 
                                    key={student.student_id}
                                    onClick={() => handleStudentClick(student)}
                                    className="clickable-row"
                                >
                                    <td>{student.full_name}</td>
                                    <td>{student.class}</td>
                                    <td>
                                        {student.performance ? 
                                            `${student.performance.attendance}%` : 
                                            'Нет данных'}
                                    </td>
                                    <td>
                                        {student.performance ? 
                                            `${student.performance.homework.completed}/${student.performance.homework.total}` : 
                                            'Нет данных'}
                                    </td>
                                    <td>
                                        {student.performance ? (
                                            <>
                                                <div>Выполнено: {student.performance.control_works.completed}/{student.performance.control_works.total}</div>
                                                <div>Средний балл: {student.performance.control_works.average_score}</div>
                                            </>
                                        ) : 'Нет данных'}
                                    </td>
                                    <td>
                                        {student.performance ? (
                                            <>
                                                <div>Выполнено: {student.performance.tests.completed}/{student.performance.tests.total}</div>
                                                <div>Средний балл: {student.performance.tests.average_score}</div>
                                            </>
                                        ) : 'Нет данных'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-results">Студенты не найдены</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {filteredStudents.length > studentsPerPage && (
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
            
            <div className="students-count">
                Показано {currentStudents.length} из {filteredStudents.length} студентов
            </div>
        </div>
    );
}