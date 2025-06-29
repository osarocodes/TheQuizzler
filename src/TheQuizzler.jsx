import React, { useState, useEffect } from 'react';

const categories = [
  { id: 9,  name: "General Knowledge"},
  { id: 10, name: "Entertainment: Books"},
  { id: 11, name: "Entertainment: Film"},
  { id: 12, name: "Entertainment: Music"},
  { id: 13, name: "Entertainment: Musicals & Theatres"},
  { id: 14, name: "Entertainment: Television"},
  { id: 15, name: "Entertainment: Video Games"},
  { id: 16, name: "Entertainment: Board Games"},
  { id: 17, name: "Science & Nature"},
  { id: 18, name: "Science: Computers"},
  { id: 19, name: "Science: Mathematics"},
  { id: 20, name: "Mythology"},
  { id: 21, name: "Sports"},
  { id: 22, name: "Geography"},
  { id: 23, name: "History"},
  { id: 24, name: "Politics"},
  { id: 25, name: "Art"},
  { id: 26, name: "Celebrities"},
  { id: 27, name: "Animals"},
  { id: 28, name: "Vehicles"},
  { id: 29, name: "Entertainment: Comics"},
  { id: 30, name: "Science: Gadgets"},
  { id: 31, name: "Entertainment: Japanese Anime & Manga"},
  { id: 32, name: "Entertainment: Cartoon & Animations"}
];

function TheQuizzler() {

    const [settings, setSettings] = useState({
        amount: 10,
        categoryId: 18,
        difficulty: 'medium'
    });

    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [cards, setCards] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // Using an object to track answers by index
    const [showResults, setShowResults] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);
    const [error, setError] = useState(null);

    const apiUrl = `https://opentdb.com/api.php?amount=${settings.amount}&category=${settings.categoryId}&difficulty=${settings.difficulty}`;

    const startQuiz = () => {
        setLoading(true);
        fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            if (data.response_code === 0) {
                const formatted = data.results.map((item, index) => ({
                id: index,
                question: decodeHTML(item.question),
                answer: decodeHTML(item.correct_answer),
                category: decodeHTML(item.category),
                difficulty: item.difficulty,
                type: item.type,
                all_answers: [decodeHTML(item.correct_answer), 
                    ...item.incorrect_answers.map(ans => decodeHTML(ans))].sort(() => Math.random() - 0.5)
                }));
                setCards(formatted);
                setQuizStarted(true);
            } else {
                setError("Failed to fetch quiz data. Please try a different settings.");
            }
        })
        .catch(err => {
            setError(err.message);
        })
        .finally(() => {
            setLoading(false);
        });
    }

    useEffect(() => {
        console.log("📊 Current state:", { 
            index: currentCardIndex,
            answers: selectedAnswers,
            currentAnswer: selectedAnswers[currentCardIndex] 
        });
    }, [currentCardIndex, selectedAnswers]);

    function decodeHTML(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    const currentCard = cards[currentCardIndex];

    const prevBtn = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prevIndex => prevIndex - 1);
        }
    }

    const nextBtn = () => {
        if (currentCardIndex < cards.length - 1) {
            setCurrentCardIndex(prevIndex => prevIndex + 1);
        }
    }

    const handleAnswerSelection = (answer) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [currentCardIndex]: answer
        }));
    };

    const calculateScore = () => {
        let score = 0;
        cards.forEach((card, index) => {
            if (selectedAnswers[index] === card.answer) {
                score += (100 / cards.length); // Calculate percentage
            }
        });
        return score;
    };

    const handleSubmit = () => {
        const score = calculateScore();
        setFinalScore(score);
        setShowResults(true);
    };

    if (loading) return <p>Loading...</p>;

    if (!quizStarted) {
        return (
        <div className="quiz-settings">
            <h2>Configure Your Quiz</h2>
            
            <div className="setting-group">
                <label>Number of Questions:</label>
                <input 
                    type="number" 
                    min="1" max="50"
                    value={settings.amount}
                    onChange={(e) => setSettings({...settings, amount: Math.min(50, Math.max(1, e.target.value))})}
                />
            </div>

        <div className="setting-group">
          <label>Category:</label>
          <select
            value={settings.categoryId}
            onChange={(e) => setSettings({...settings, categoryId: Number(e.target.value)})}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="setting-group">
          <label>Difficulty:</label>
          <select
            value={settings.difficulty}
            onChange={(e) => setSettings({...settings, difficulty: e.target.value})}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button onClick={startQuiz} disabled={loading}>
          {loading ? 'Loading...' : 'Start Quiz'}
        </button>

        {error && <p className="error">{error}</p>}
      </div>
    );
  }

    if (showResults) {
        return (
            <div className="results">
                <h2 className='quiz_results'>Quiz Results</h2>
                <p className='quiz_results'>Your final score: {finalScore.toFixed(2)}%</p>
                <div className="answer-review">
                    {cards.map((card, index) => (
                        <div key={index} className={`question-result ${selectedAnswers[index] === card.answer ? 'correct' : 'incorrect'}`}>
                            <p>Q{index + 1}: {card.question}</p>
                            <p>Your answer: {selectedAnswers[index] || "Not answered"}</p>
                            <p>Correct answer: {card.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    

    return (
        <div>
            <div className='stats'>
                <div >
                    <p><span className='stats_title_info'>Category:</span> <span className='stats_info'>{currentCard.category}</span></p>
                    <p><span className='stats_title_info'>Difficulty:</span> <span className='stats_info'>{currentCard.difficulty}</span></p>
                </div>
                <div>
                    <p> <span className='stats_title_info'>Question:</span>  <span className='stats_info'>{currentCardIndex + 1}/{cards.length}</span></p>
                </div>
            </div>

            <h5 className='hero_text2'>the quizzler</h5>

            <div className="card-component">
                <p className='card_question'>{currentCard.question}</p>
                <div className="options-grid">
                    {currentCard.all_answers.map((answer, index) => (
                        <div key={index}>
                            <input
                                type="radio"
                                id={`answer-${index}`}
                                name="answers"
                                value={answer}
                                checked={selectedAnswers[currentCardIndex] === answer}
                                onChange={() => handleAnswerSelection(answer)}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor={`answer-${index}`}>
                                {answer}
                            </label>
                        </div>
                    ))}
                </div>
                
                <div className="navigation-buttons">
                    {currentCardIndex > 0 && (
                        <button onClick={prevBtn} id='prevBtn'>Previous</button>
                    )}
                    {currentCardIndex < cards.length - 1 ? (
                        <button onClick={nextBtn}>Next</button>
                    ) : (
                        <button onClick={handleSubmit} className="submit-btn">Submit Quiz</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TheQuizzler;