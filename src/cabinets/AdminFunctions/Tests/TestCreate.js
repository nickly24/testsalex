import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import './CreateTest.css';
import { API_EXAM_URL } from '../../../Config';
export default function TestCreate() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    branch_id: '',
    date: new Date().toISOString().split('T')[0],
    questions: []
  });

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${API_EXAM_URL}/get-all-branchnes`);
        if (response.data.status) {
          setBranches(response.data.data);
        }
      } catch (error) {
        toast.error('Failed to load branches');
      }
    };
    fetchBranches();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: '',
          type: 'one',
          answers: ['', ''],
          correct_answers: []
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const handleAnswerChange = (qIndex, aIndex, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedAnswers = [...updatedQuestions[qIndex].answers];
      updatedAnswers[aIndex] = value;
      updatedQuestions[qIndex].answers = updatedAnswers;
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const addAnswer = (qIndex) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].answers.push('');
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const removeAnswer = (qIndex, aIndex) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedAnswers = [...updatedQuestions[qIndex].answers];
      updatedAnswers.splice(aIndex, 1);
      
      // Also remove from correct_answers if needed
      const correctAnswers = updatedQuestions[qIndex].correct_answers;
      const removedAnswer = updatedQuestions[qIndex].answers[aIndex];
      const updatedCorrect = correctAnswers.filter(ans => ans !== removedAnswer);
      
      updatedQuestions[qIndex].answers = updatedAnswers;
      updatedQuestions[qIndex].correct_answers = updatedCorrect;
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const handleCorrectAnswerChange = (qIndex, answer, isChecked) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      const question = updatedQuestions[qIndex];
      
      if (question.type === 'one') {
        question.correct_answers = isChecked ? [answer] : [];
      } else if (question.type === 'many') {
        if (isChecked) {
          question.correct_answers = [...question.correct_answers, answer];
        } else {
          question.correct_answers = question.correct_answers.filter(a => a !== answer);
        }
      } else if (question.type === 'input') {
        question.correct_answers = [answer];
        question.answers = [answer];
      }
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate form
      if (!formData.name || !formData.branch_id || formData.questions.length === 0) {
        throw new Error('Please fill all required fields');
      }
      
      for (const question of formData.questions) {
        if (!question.question_text || question.answers.length === 0) {
          throw new Error('All questions must have text and at least one answer');
        }
        
        if (question.type !== 'input' && question.correct_answers.length === 0) {
          throw new Error('All questions must have at least one correct answer');
        }
      }
      
      const response = await axios.post('http://192.168.1.43:5001/create-test', formData);
      
      if (response.data.status) {
        toast.success('Test created successfully!', {
          autoClose: 5000,
          closeButton: true
        });
        // Reset form
        setFormData({
          name: '',
          branch_id: '',
          date: new Date().toISOString().split('T')[0],
          questions: []
        });
      } else {
        throw new Error('Failed to create test');
      }
    } catch (error) {
      toast.error(error.message || 'Error creating test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-create-container">
      <ToastContainer position="top-right" />
      <form className="test-form" onSubmit={handleSubmit}>
        <h1>Test Constructor</h1>
        
        <div className="form-group">
          <label className="form-label">Test Name*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Branch*</label>
          <select
            name="branch_id"
            value={formData.branch_id}
            onChange={handleInputChange}
            className="form-select"
            required
          >
            <option value="">Select a branch</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        
        <div className="questions-section">
          <h2>Questions</h2>
          <button type="button" className="add-question-btn" onClick={addQuestion}>
            + Add Question
          </button>
          
          {formData.questions.map((question, qIndex) => (
            <div className="question-card" key={qIndex}>
              <div className="question-header">
                <h3>Question {qIndex + 1}</h3>
                <button type="button" className="remove-btn" onClick={() => removeQuestion(qIndex)}>
                  ×
                </button>
              </div>
              
              <div className="form-group">
                <label className="form-label">Question Text*</label>
                <input
                  type="text"
                  value={question.question_text}
                  onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Question Type*</label>
                <select
                  value={question.type}
                  onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                  className="form-select"
                >
                  <option value="one">Single correct answer</option>
                  <option value="many">Multiple correct answers</option>
                  <option value="input">Text input</option>
                </select>
              </div>
              
              {question.type === 'input' ? (
                <div className="form-group">
                  <label className="form-label">Correct Answer*</label>
                  <input
                    type="text"
                    value={question.answers[0] || ''}
                    onChange={(e) => {
                      handleAnswerChange(qIndex, 0, e.target.value);
                      handleCorrectAnswerChange(qIndex, e.target.value, true);
                    }}
                    className="form-input"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="answers-section">
                    <label className="form-label">Answers*</label>
                    {question.answers.map((answer, aIndex) => (
                      <div className="answer-row" key={aIndex}>
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => handleAnswerChange(qIndex, aIndex, e.target.value)}
                          className="answer-input"
                          required
                        />
                        
                        <input
                          type={question.type === 'one' ? 'radio' : 'checkbox'}
                          className="correct-checkbox"
                          name={`q${qIndex}-correct`}
                          checked={question.correct_answers.includes(answer)}
                          onChange={(e) => handleCorrectAnswerChange(qIndex, answer, e.target.checked)}
                        />
                        
                        {question.answers.length > 2 && (
                          <button
                            type="button"
                            className="remove-answer-btn"
                            onClick={() => removeAnswer(qIndex, aIndex)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    className="add-answer-btn"
                    onClick={() => addAnswer(qIndex)}
                  >
                    + Add Answer
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creating Test...' : 'Create Test'}
        </button>
      </form>
    </div>
  );
}