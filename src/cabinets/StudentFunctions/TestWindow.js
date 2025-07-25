import React, { useState, useEffect } from 'react';
import './Tests.css';
import { API_EXAM_URL } from '../../Config';

const TestWindow = ({ testId, onClose, isRetake }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testCompleted, setTestCompleted] = useState(false);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [inputAnswers, setInputAnswers] = useState({});

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(`${API_EXAM_URL}/get-ques-with-answers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ test_id: testId }),
                });
                const data = await response.json();
                
                if (data.status) {
                    setQuestions(data.questions);
                    const initialSelected = {};
                    const initialInput = {};
                    
                    data.questions.forEach(question => {
                        if (question.type === 'one') {
                            initialSelected[question.question_id] = null;
                        } else if (question.type === 'many') {
                            initialSelected[question.question_id] = [];
                        } else if (question.type === 'input') {
                            initialInput[question.question_id] = '';
                        }
                    });
                    
                    setSelectedAnswers(initialSelected);
                    setInputAnswers(initialInput);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [testId]);

    const handleSingleSelect = (questionId, answerId) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
    };

    const handleMultiSelect = (questionId, answerId) => {
        setSelectedAnswers(prev => {
            const current = prev[questionId] || [];
            return {
                ...prev,
                [questionId]: current.includes(answerId) 
                    ? current.filter(id => id !== answerId) 
                    : [...current, answerId]
            };
        });
    };

    const handleInputChange = (questionId, value) => {
        setInputAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const calculateResult = () => {
        let score = 0;
        questions.forEach(question => {
            if (question.type === 'one') {
                const selected = selectedAnswers[question.question_id];
                const correct = question.answers.find(a => a.status === 1)?.answer_id;
                if (selected === correct) score++;
            } else if (question.type === 'many') {
                const selected = selectedAnswers[question.question_id] || [];
                const correct = question.answers.filter(a => a.status === 1).map(a => a.answer_id);
                if (selected.length === correct.length && correct.every(id => selected.includes(id))) {
                    score++;
                }
            } else if (question.type === 'input') {
                const answer = (inputAnswers[question.question_id] || '').trim().toLowerCase();
                const correct = question.answers[0]?.answer.trim().toLowerCase();
                if (answer === correct) score++;
            }
        });
        return Math.round((score / questions.length) * 100);
    };

    const handleSubmitTest = async () => {
        const resultPercentage = calculateResult();
        setResult(resultPercentage);
        setTestCompleted(true);

        if (!isRetake) {
            try {
                setSubmitting(true);
                const studentId = localStorage.getItem('id');
                const response = await fetch(`${API_EXAM_URL}/create-test-session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        test_id: testId,
                        student_id: studentId,
                        result: resultPercentage
                    }),
                });
                const data = await response.json();
                setSubmissionStatus(data.status ? 'success' : 'error');
            } catch (error) {
                setSubmissionStatus('error');
            } finally {
                setSubmitting(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="test-window-container">
                <div className="test-window-content">
                    <h3>Тест #{testId}</h3>
                    <p>Загрузка вопросов...</p>
                </div>
            </div>
        );
    }

    if (testCompleted) {
        return (
            <div className="test-window-container">
                <div className="test-window-content">
                    <h3>{isRetake ? 'Результат пересдачи' : 'Результаты теста'}</h3>
                    {!isRetake && submitting && <p>Отправка результатов...</p>}
                    {!isRetake && submissionStatus === 'success' && (
                        <p className="success-message">Результаты сохранены!</p>
                    )}
                    {!isRetake && submissionStatus === 'error' && (
                        <p className="error-message">Ошибка сохранения</p>
                    )}
                    <p>Ваш результат: <strong>{result}%</strong></p>
                    <button onClick={onClose} className="close-test-button">
                        Назад к тестам
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="test-window-container">
            <div className="test-window-content">
                <h3>Тест #{testId} {isRetake && '(пересдача)'}</h3>
                
                {questions.map((question, index) => (
                    <div key={question.question_id} className="question-container">
                        <h4>{index + 1}. {question.question}</h4>
                        
                        {question.type === 'one' && (
                            <div className="answers-container">
                                {question.answers.map(answer => (
                                    <div key={answer.answer_id} className="answer-option">
                                        <input
                                            type="radio"
                                            name={`question_${question.question_id}`}
                                            checked={selectedAnswers[question.question_id] === answer.answer_id}
                                            onChange={() => handleSingleSelect(question.question_id, answer.answer_id)}
                                        />
                                        <label>{answer.answer}</label>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {question.type === 'many' && (
                            <div className="answers-container">
                                {question.answers.map(answer => (
                                    <div key={answer.answer_id} className="answer-option">
                                        <input
                                            type="checkbox"
                                            checked={(selectedAnswers[question.question_id] || []).includes(answer.answer_id)}
                                            onChange={() => handleMultiSelect(question.question_id, answer.answer_id)}
                                        />
                                        <label>{answer.answer}</label>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {question.type === 'input' && (
                            <div className="answer-input-container">
                                <input
                                    type="text"
                                    value={inputAnswers[question.question_id] || ''}
                                    onChange={(e) => handleInputChange(question.question_id, e.target.value)}
                                    placeholder="Введите ответ..."
                                />
                            </div>
                        )}
                    </div>
                ))}
                
                <button 
                    onClick={handleSubmitTest} 
                    className="submit-test-button"
                    disabled={submitting}
                >
                    {isRetake ? 'Завершить пересдачу' : 'Отправить тест'}
                </button>
            </div>
        </div>
    );
};

export default TestWindow;