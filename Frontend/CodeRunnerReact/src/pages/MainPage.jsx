// src/pages/MainPage.js
import React, { useState } from 'react';
import QuestionList from '../components/Questions';
import CodeEditor from '../components/Editor';

const MainPage = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  return (
    <div>
      {!selectedQuestion ? (
        <QuestionList onSelectQuestion={setSelectedQuestion} />
      ) : (
        <CodeEditor question={selectedQuestion} />
      )}
    </div>
  );
};

export default MainPage;