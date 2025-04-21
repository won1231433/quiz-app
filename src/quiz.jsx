import React, { useState } from "react";
import questions from "./questions";

const Quiz = () => {
  const [current, setCurrent] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);

  const handleCheck = () => {
    const correct = questions[current].answer.trim() === userAnswer.trim();
    setIsCorrect(correct);
  };

  const handleNext = () => {
    setIsCorrect(null);
    setUserAnswer("");
    setCurrent((prev) => (prev + 1) % questions.length);
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold">Quiz</h1>
      <p>{questions[current].question}</p>
      <input
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        className="border px-3 py-1 w-full rounded"
      />
      {isCorrect !== null && (
        <p className={isCorrect ? "text-green-500" : "text-red-500"}>
          {isCorrect ? "정답입니다!" : "오답입니다!"}
        </p>
      )}
      <div className="space-x-2">
        <button
          onClick={handleCheck}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          확인
        </button>
        <button
          onClick={handleNext}
          className="bg-gray-500 text-white px-4 py-1 rounded"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default Quiz;
