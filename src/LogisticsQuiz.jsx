import React, { useEffect, useState } from 'react';

function LogisticsQuiz() {
  const [quizType, setQuizType] = useState(null);
  const [problems, setProblems] = useState({});
  const [answers, setAnswers] = useState({});
  const [quizPool, setQuizPool] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState([]);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wrongNotes, setWrongNotes] = useState([]);
  const [mode, setMode] = useState('selectType');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch('/problems.json')
      .then(res => res.json())
      .then(data => setProblems(data));
    fetch('/answers.json')
      .then(res => res.json())
      .then(data => setAnswers(data));
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black';
  }, [darkMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (mode === 'quiz') {
          if (result === null) {
            checkAnswer();
          } else {
            nextQuestion();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, result, quizPool, currentIndex, userInputs]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const shuffle = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const startQuiz = (count) => {
    const keys = Object.keys(problems);
    const totalCount = count > keys.length ? keys.length : count;
    const selected = shuffle(keys).slice(0, totalCount);
    setQuizPool(selected);
    setCurrentIndex(0);
    setScore(0);
    setUserInputs([]);
    setResult(null);
    setShowResult(false);
    setWrongNotes([]);
    setMode('quiz');
  };

  const startWrongQuiz = () => {
    // 오답노트에서 문제 번호만 추출하고 중복 제거
    const uniqueWrongIds = Array.from(new Set(wrongNotes.map(w => w.num)));
    const wrongIds = shuffle(uniqueWrongIds);
  
    // 오답노트 초기화 (가장 중요)
    setWrongNotes([]);
  
    // 퀴즈 상태 초기화
    setQuizPool(wrongIds);
    setCurrentIndex(0);
    setScore(0);
    setUserInputs([]);
    setResult(null);
    setShowResult(false);
  
    setMode('quiz');
  };

  const currentQNum = quizPool[currentIndex];
  const currentQuestion = problems[currentQNum];
  const currentAnswer = answers[currentQNum];
  const blankCount = currentAnswer?.length || 0;

  const handleInput = (value, idx) => {
    const newInputs = [...userInputs];
    newInputs[idx] = value;
    setUserInputs(newInputs);
  };

  const normalize = (str) => str.replace(/\s/g, '');

  const checkAnswer = () => {
    const userNormalized = userInputs.map(x => normalize(x || ''));
    const answerNormalized = currentAnswer.map(x => normalize(x));
    const correct = JSON.stringify(userNormalized) === JSON.stringify(answerNormalized);

    if (correct) {
      setScore(score + 1);
    } else {
      setWrongNotes([...wrongNotes, {
        num: currentQNum,
        question: currentQuestion,
        correct: currentAnswer,
        input: userInputs
      }]);
    }
    setResult(correct);
  };

  const nextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < quizPool.length) {
      setCurrentIndex(nextIndex);
      setUserInputs([]);
      setResult(null);
    } else {
      setShowResult(true);
      setMode('end');
    }
  };

  const renderTypeSelect = () => (
    <div className="space-y-4 text-center mt-10">
      <h2 className="text-2xl font-bold">🧭 퀴즈 종목을 선택하세요</h2>
      <div className="space-x-4">
        <button
          onClick={() => {
            setQuizType('물류자동화');
            setMode('start');
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
        >
          🚚 물류자동화
        </button>

        <button
          onClick={() => {
            setQuizType('지게차');
            setMode('start');
          }}
          className="bg-green-600 text-white px-6 py-3 rounded text-lg"
        >
          🚜 지게차
        </button>
      </div>
    </div>
  );

  const renderStart = () => {
    const problemKeys = Object.keys(problems);
    if (problemKeys.length === 0) {
      return (
        <div className="text-center mt-10 text-gray-500">
          ⏳ 문제를 불러오는 중입니다...
        </div>
      );
    }

    return (
      <div className="space-y-4 text-center mt-10">
        <h2 className="text-2xl font-bold">📝 몇 문제를 풀까요?</h2>
        <div className="space-x-4">
          <button onClick={() => startQuiz(30)} className="btn">📘 30문제</button>
          <button onClick={() => startQuiz(60)} className="btn">📘 60문제</button>
          <button onClick={() => startQuiz(problemKeys.length)} className="btn">📘 전체 문제</button>
        </div>
      </div>
    );
  };

  const renderQuiz = () => (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded space-y-4">
      <h3 className="text-xl font-bold">{currentIndex + 1}. {currentQuestion}</h3>
      {Array.from({ length: blankCount }).map((_, i) => (
        <input
          key={i}
          value={userInputs[i] || ''}
          onChange={(e) => handleInput(e.target.value, i)}
          placeholder={`빈칸 ${i + 1}`}
          className="border p-2 w-full rounded mb-2 bg-white text-black dark:bg-gray-800 dark:text-white"
        />
      ))}
      {result !== null && (
        <div className={result ? 'text-green-500' : 'text-red-500'}>
          {result
            ? `✅ 정답입니다! (원문제 번호: ${currentQNum}번)`
            : `❌ 오답입니다. 정답: ${currentAnswer.join(', ')} (원문제 번호: ${currentQNum}번)`}
        </div>
      )}
      <div className="space-x-2">
        <button onClick={checkAnswer} className="bg-blue-500 text-white px-4 py-2 rounded">정답 확인</button>
        <button onClick={nextQuestion} className="bg-gray-500 text-white px-4 py-2 rounded">다음 문제</button>
      </div>
    </div>
  );

  const renderEnd = () => (
    <div className="max-w-2xl mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-bold">🎉 퀴즈 완료!</h2>
      <p>점수: {score} / {quizPool.length} (정답률: {(score / quizPool.length * 100).toFixed(1)}%)</p>
      {wrongNotes.length > 0 ? (
        <div>
          <h3 className="font-semibold">📘 오답노트</h3>
          <ul className="list-disc pl-5">
            {wrongNotes.map((w, i) => (
              <li key={i} className="mb-2">
                <strong>[{w.num}]</strong> {w.question}<br />
                정답: {w.correct.join(', ')} / 내 답: {w.input.join(', ')}
              </li>
            ))}
          </ul>
          <button onClick={startWrongQuiz} className="bg-red-500 text-white px-4 py-2 rounded mt-4">🔁 오답만 다시 풀기 (랜덤)</button>
        </div>
      ) : <p>👏 오답 없이 전부 정답!</p>}
      <button onClick={() => setMode('start')} className="bg-yellow-500 text-white px-4 py-2 rounded">🔄 다시 시작</button>
    </div>
  );

  return (
    <div className="p-4 relative">
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 px-4 py-2 bg-gray-700 text-white rounded"
      >
        {darkMode ? '☀️ 라이트모드' : '🌙 다크모드'}
      </button>

      {mode === 'selectType' && renderTypeSelect()}
      {mode === 'start' && renderStart()}
      {mode === 'quiz' && renderQuiz()}
      {mode === 'end' && renderEnd()}
    </div>
  );
}

export default LogisticsQuiz;
