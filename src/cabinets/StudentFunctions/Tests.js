// Tests.jsx
import { useState, useEffect } from 'react';
import './Tests.css';
import TestWindow from './TestWindow';
import { API_BASE_URL } from '../../Config';
import { API_EXAM_URL } from '../../Config';
const Tests = ({ onBack }) => {
    const [branches, setBranches] = useState({});
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const studentId = localStorage.getItem('id');
                if (!studentId) {
                    throw new Error('Student ID not found in localStorage');
                }

                const response = await fetch(`${API_EXAM_URL}/get-student-tests`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ student_id: studentId }),
                });

                const data = await response.json();

                if (!data.status) {
                    throw new Error('Failed to fetch tests');
                }

                setBranches(data.tests_by_branch);
                
                const firstBranch = Object.keys(data.tests_by_branch)[0];
                if (firstBranch) {
                    setSelectedBranch(firstBranch);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    const handleTestClick = (test) => {
        if (test.status === 'не сдан') {
            setSelectedTest(test.test_id);
        }
    };

    const handleCloseTestWindow = () => {
        setSelectedTest(null);
    };

    if (loading) {
        return <div className="content-section">Загрузка...</div>;
    }

    if (error) {
        return <div className="content-section">Ошибка: {error}</div>;
    }

    return (
        <div className="content-section">
            {selectedTest ? (
                <TestWindow testId={selectedTest} onClose={handleCloseTestWindow} />
            ) : (
                <>
                    <h2>Тесты</h2>
                    
                    <div className="tests-container">
                        {Object.keys(branches).length > 0 ? (
                            <>
                                <div className="branch-selector">
                                    {Object.keys(branches).map((branchName) => (
                                        <button
                                            key={branchName}
                                            className={`branch-button ${selectedBranch === branchName ? 'active' : ''}`}
                                            onClick={() => setSelectedBranch(branchName)}
                                        >
                                            {branchName}
                                        </button>
                                    ))}
                                </div>

                                {selectedBranch && (
                                    <div className="test-list">
                                        {branches[selectedBranch].map((test) => (
                                            <div
                                                key={test.test_id}
                                                className={`test-card ${test.status === 'сдан' ? 'completed' : ''}`}
                                                onClick={() => handleTestClick(test)}
                                            >
                                                <div className="test-title">{test.test_name}</div>
                                                <div className="test-status">
                                                    {test.status === 'сдан' ? (
                                                        <span>Результат: <span className="test-score">{test.score}%</span></span>
                                                    ) : (
                                                        <span>Тест не сдан</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>Нет доступных тестов</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Tests;