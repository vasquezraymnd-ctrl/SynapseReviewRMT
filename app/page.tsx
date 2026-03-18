"use client";

import { useState } from "react";
import { PieChart, BookOpen, Clock, Target, CheckCircle, Lock } from "lucide-react";

export default function Page() {
  const [view, setView] = useState("dashboard");
  const [quizStarted, setQuizStarted] = useState(false);

  const renderDashboard = () => (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-navy-blue-800 text-white p-4 flex justify-between items-center" style={{backgroundColor: '#000080'}}>
        <h1 className="text-xl font-bold">Hello, Future RMT!</h1>
        <div className="bg-white text-navy-blue-800 rounded-full w-10 h-10 flex items-center justify-center font-bold" style={{color: '#000080'}}>
          R
        </div>
      </header>

      <main className="p-6">
        <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Overall Progress</h2>
              <p className="text-5xl font-extrabold">72%</p>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4a90e2"
                  strokeWidth="4"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4"
                  strokeDasharray="72, 100"
                  strokeDashoffset="25"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="font-bold text-lg">78.5%</p>
              <p className="text-sm">Avg. Score</p>
            </div>
            <div>
              <p className="font-bold text-lg">42</p>
              <p className="text-sm">Days Left</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderSubjectCard("Hematology", 85, "Strong", "bg-green-100 text-green-800")}
          {renderSubjectCard("Clinical Chemistry", 72, "Review", "bg-yellow-100 text-yellow-800", () => setView("clinicalChemistry"))}
          {renderSubjectCard("Micro-Para", 68, "Review", "bg-yellow-100 text-yellow-800")}
          {renderSubjectCard("ISBB", 92, "Strong", "bg-green-100 text-green-800")}
        </div>
      </main>
    </div>
  );

  const renderSubjectCard = (subject: string, score: number, status: string, statusColor: string, onClick?: () => void) => (
    <div className={`bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{subject}</h3>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">{score}%</p>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColor}`}>
          {status}
        </span>
      </div>
    </div>
  );

  const renderClinicalChemistry = () => (
    <div className="bg-gray-50 min-h-screen p-6">
      <button onClick={() => setView("dashboard")} className="text-blue-500 font-bold mb-6">
        &larr; Back to Dashboard
      </button>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Clinical Chemistry Review Modules</h2>
      <div className="space-y-4">
        {renderModule("Module 1: Carbohydrates", true)}
        {renderModule("Module 2: Lipids", true)}
        {renderModule("Module 3: Proteins", false)}
        {renderModule("Module 4: Enzymes", false)}
        {renderModule("Module 5: Electrolytes", false)}
      </div>
    </div>
  );

  const renderModule = (title: string, unlocked: boolean) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
      <div className="flex items-center">
        {unlocked ? <CheckCircle className="text-green-500 mr-3" /> : <Lock className="text-gray-400 mr-3" />}
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      </div>
      <button
        onClick={() => unlocked && setView("quiz")}
        className={`px-4 py-2 rounded-lg font-semibold text-white ${unlocked ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
        disabled={!unlocked}
      >
        Take Quiz
      </button>
    </div>
  );

  const renderQuiz = () => (
    <div className="bg-gray-50 min-h-screen p-6 flex flex-col">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '10%'}}></div>
        </div>
        <p className="text-center text-gray-600 mb-6">Question 5 of 50</p>

        <div className="bg-white p-8 rounded-xl shadow-md flex-grow">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Question Title</h3>
            <p className="text-gray-600 mb-6">This is the question text. It can be a multiple choice question. Please select the correct answer below.</p>
            <div className="space-y-4">
                <div className="flex items-center">
                    <input type="radio" name="quiz-option" id="option1" className="form-radio h-5 w-5 text-blue-600"/>
                    <label htmlFor="option1" className="ml-3 text-gray-700">Option 1</label>
                </div>
                <div className="flex items-center">
                    <input type="radio" name="quiz-option" id="option2" className="form-radio h-5 w-5 text-blue-600"/>
                    <label htmlFor="option2" className="ml-3 text-gray-700">Option 2</label>
                </div>
                <div className="flex items-center">
                    <input type="radio" name="quiz-option" id="option3" className="form-radio h-5 w-5 text-blue-600"/>
                    <label htmlFor="option3" className="ml-3 text-gray-700">Option 3</label>
                </div>
            </div>
        </div>
        <button
            onClick={() => setView("results")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg mt-6 shadow-lg"
        >
            Submit
        </button>
    </div>
  );
  
  const renderResults = () => (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center text-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Quiz Complete!</h2>
        <p className="text-gray-600 text-lg mb-2">You scored:</p>
        <p className="text-6xl font-bold text-blue-500 mb-6">82%</p>
        <button
          onClick={() => setView("dashboard")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );


  switch (view) {
    case "clinicalChemistry":
      return renderClinicalChemistry();
    case "quiz":
      return renderQuiz();
    case "results":
        return renderResults();
    default:
      return renderDashboard();
  }
}