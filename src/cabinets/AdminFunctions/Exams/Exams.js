import React, { useState } from 'react';
import './Exams.css';
import ExamsList from './ExamsList';
export default function Exams() {
    const [examData, setExamData] = useState({
        name: '',
        date: '',
        questions: [{ question_text: '', correct_answer: '' }]
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExamData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuestionChange = (index, e) => {
        const { name, value } = e.target;
        const updatedQuestions = [...examData.questions];
        updatedQuestions[index][name] = value;
        setExamData(prev => ({
            ...prev,
            questions: updatedQuestions
        }));
    };

    const addQuestion = () => {
        setExamData(prev => ({
            ...prev,
            questions: [...prev.questions, { question_text: '', correct_answer: '' }]
        }));
    };

    const removeQuestion = (index) => {
        if (examData.questions.length > 1) {
            const updatedQuestions = examData.questions.filter((_, i) => i !== index);
            setExamData(prev => ({
                ...prev,
                questions: updatedQuestions
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://127.0.0.1:81/create-exam', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: examData.name,
                    date: examData.date,
                    questions: examData.questions.map(q => ({
                        question_text: q.question_text,
                        correct_answer: q.correct_answer
                    }))
                })
            });

            const result = await response.json();
            if (result.status) {
                alert('Экзамен успешно создан!');
                // Сброс формы
                setExamData({
                    name: '',
                    date: '',
                    questions: [{ question_text: '', correct_answer: '' }]
                });
            } else {
                alert('Ошибка при создании экзамена');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при отправке данных');
        }
    };

    return (
        <div className="exam-form-container">
            <h2>Создание нового экзамена</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>
                        Название экзамена:
                        <input
                            type="text"
                            name="name"
                            value={examData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                </div>
                
                <div className="form-group">
                    <label>
                        Дата проведения:
                        <input
                            type="date"
                            name="date"
                            value={examData.date}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                </div>
                
                <h3>Вопросы:</h3>
                {examData.questions.map((question, index) => (
                    <div key={index} className="question-group">
                        <div className="form-group">
                            <label>
                                Вопрос:
                                <input
                                    type="text"
                                    name="question_text"
                                    value={question.question_text}
                                    onChange={(e) => handleQuestionChange(index, e)}
                                    required
                                />
                            </label>
                        </div>
                        
                        <div className="form-group">
                            <label>
                                Правильный ответ:
                                <input
                                    type="text"
                                    name="correct_answer"
                                    value={question.correct_answer}
                                    onChange={(e) => handleQuestionChange(index, e)}
                                    required
                                />
                            </label>
                        </div>
                        
                        {examData.questions.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeQuestion(index)}
                                className="remove-btn"
                            >
                                
                            </button>
                        )}
                    </div>
                ))}
                
                <button
                    type="button"
                    onClick={addQuestion}
                    className="add-btn"
                >
                    Добавить вопрос
                </button>
                
                <button type="submit" className="submit-btn">
                    Создать экзамен
                </button>
            </form>
            <ExamsList/>
        </div>
    );
}