import React, { useState, useEffect } from 'react';
import './Tests.css';
import { API_EXAM_URL } from '../../Config';
const TestWindow = ({ testId, onClose }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testCompleted, setTestCompleted] = useState(false);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null);

    // Состояния для ответов
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [inputAnswers, setInputAnswers] = useState({});

    useEffect(() => {
        fetchQuestions();
    }, [testId]);

    const fetchQuestions = async () => {
        try {
            const response = await fetch(`${API_EXAM_URL}/get-ques-with-answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ test_id: testId }),
            });
            const data = await response.json();
            if (data.status) {
                setQuestions(data.questions);
                
                // Инициализация состояний для ответов
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
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSingleSelect = (questionId, answerId) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));
    };

    const handleMultiSelect = (questionId, answerId) => {
        setSelectedAnswers(prev => {
            const currentSelections = prev[questionId] || [];
            if (currentSelections.includes(answerId)) {
                return {
                    ...prev,
                    [questionId]: currentSelections.filter(id => id !== answerId)
                };
            } else {
                return {
                    ...prev,
                    [questionId]: [...currentSelections, answerId]
                };
            }
        });
    };

    const handleInputChange = (questionId, value) => {
        setInputAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const calculateResult = () => {
        let totalScore = 0;
        let maxScore = questions.length; // Базовый максимум - по 1 баллу за вопрос
        
        questions.forEach(question => {
            if (question.type === 'one') {
                const selectedAnswerId = selectedAnswers[question.question_id];
                const correctAnswer = question.answers.find(a => a.status === 1);
                if (selectedAnswerId === correctAnswer?.answer_id) {
                    totalScore += 1;
                }
            } else if (question.type === 'many') {
                const selectedIds = selectedAnswers[question.question_id] || [];
                const correctIds = question.answers.filter(a => a.status === 1).map(a => a.answer_id);
                
                // Проверяем, что выбраны все правильные и нет лишних
                if (selectedIds.length === correctIds.length && 
                    selectedIds.every(id => correctIds.includes(id))) {
                    totalScore += 1;
                } else if (selectedIds.length > 0 && correctIds.length > 0) {
                    // Частичный балл за частично правильный ответ
                    const correctSelected = selectedIds.filter(id => correctIds.includes(id)).length;
                    const incorrectSelected = selectedIds.length - correctSelected;
                    const missedCorrect = correctIds.length - correctSelected;
                    
                    // Формула для частичного балла (можно настроить)
                    const partialScore = (correctSelected / (correctSelected + incorrectSelected + missedCorrect));
                    totalScore += partialScore;
                }
            } else if (question.type === 'input') {
                const userAnswer = (inputAnswers[question.question_id] || '').trim().toLowerCase();
                const correctAnswer = question.answers[0].answer.trim().toLowerCase();
                if (userAnswer === correctAnswer) {
                    totalScore += 1;
                }
            }
        });
        
        const percentage = Math.round((totalScore / maxScore) * 100);
        return percentage;
    };

    const handleSubmitTest = async () => {
        const resultPercentage = calculateResult();
        setResult(resultPercentage);
        setTestCompleted(true);
        
        try {
            setSubmitting(true);
            const studentId = localStorage.getItem('id');
            const response = await fetch(`${API_EXAM_URL}/create-test-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    test_id: testId,
                    student_id: studentId,
                    result: resultPercentage
                }),
            });
            const data = await response.json();
            setSubmissionStatus(data.status ? 'success' : 'error');
        } catch (error) {
            console.error('Error submitting test:', error);
            setSubmissionStatus('error');
        } finally {
            setSubmitting(false);
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
                    <h3>Результаты теста #{testId}</h3>
                    
                    {submitting ? (
                        <p>Отправка результатов...</p>
                    ) : submissionStatus === 'success' ? (
                        <p className="success-message">Результаты успешно сохранены!</p>
                    ) : submissionStatus === 'error' ? (
                        <p className="error-message">Ошибка при сохранении результатов</p>
                    ) : null}
                    
                    <p>Ваш результат: {result}%</p>
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
                <h3>Тест #{testId}</h3>
                
                {questions.map((question, index) => (
                    <div key={question.question_id} className="question-container">
                        <h4>{index + 1}. {question.question}</h4>
                        
                        {question.type === 'one' && (
                            <div className="answers-container">
                                {question.answers.map(answer => (
                                    <div key={answer.answer_id} className="answer-option">
                                        <input
                                            type="radio"
                                            id={`q${question.question_id}_a${answer.answer_id}`}
                                            name={`question_${question.question_id}`}
                                            checked={selectedAnswers[question.question_id] === answer.answer_id}
                                            onChange={() => handleSingleSelect(question.question_id, answer.answer_id)}
                                        />
                                        <label htmlFor={`q${question.question_id}_a${answer.answer_id}`}>
                                            {answer.answer}
                                        </label>
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
                                            id={`q${question.question_id}_a${answer.answer_id}`}
                                            checked={(selectedAnswers[question.question_id] || []).includes(answer.answer_id)}
                                            onChange={() => handleMultiSelect(question.question_id, answer.answer_id)}
                                        />
                                        <label htmlFor={`q${question.question_id}_a${answer.answer_id}`}>
                                            {answer.answer}
                                        </label>
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
                                    placeholder="Введите ваш ответ..."
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
                    Завершить тест
                </button>
            </div>
        </div>
    );
};

export default TestWindow;