import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCheck, FiX, FiArrowRight } = FiIcons;

const OnboardingQuiz = ({ onComplete }) => {
  const { t } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      question: t('onboarding.quiz.question1'),
      options: [
        'Activos físicos convertidos en tokens digitales',
        'Criptomonedas tradicionales',
        'Acciones de empresas',
        'Bonos gubernamentales'
      ],
      correct: 0
    },
    {
      question: t('onboarding.quiz.question2'),
      options: [
        'Mayor volatilidad',
        'Acceso fraccionado a activos costosos',
        'Menor seguridad',
        'Comisiones más altas'
      ],
      correct: 1
    },
    {
      question: t('onboarding.quiz.question3'),
      options: [
        'Solo dinero en efectivo',
        'Una cuenta bancaria',
        'Una wallet de criptomonedas',
        'Documentos físicos'
      ],
      correct: 2
    }
  ];

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === questions[index].correct ? 1 : 0);
    }, 0);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
  };

  if (showResult) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md mx-auto"
      >
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            percentage >= 70 ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'
          }`}>
            <SafeIcon 
              icon={percentage >= 70 ? FiCheck : FiX} 
              className={`w-8 h-8 ${
                percentage >= 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
              }`} 
            />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {percentage >= 70 ? '¡Excelente!' : '¡Buen intento!'}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Obtuviste {score} de {questions.length} respuestas correctas ({percentage.toFixed(0)}%)
          </p>

          <div className="space-y-3">
            {percentage >= 70 ? (
              <button
                onClick={onComplete}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Continuar al Dashboard
              </button>
            ) : (
              <button
                onClick={resetQuiz}
                className="w-full bg-yellow-500 text-black py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                Intentar de nuevo
              </button>
            )}
            
            <button
              onClick={onComplete}
              className="w-full text-gray-500 dark:text-gray-400 py-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Saltar por ahora
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md mx-auto"
    >
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('onboarding.quiz.title')}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            {questions[currentQuestion].question}
          </h4>
          
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-white">{option}</span>
                  <SafeIcon icon={FiArrowRight} className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default OnboardingQuiz;