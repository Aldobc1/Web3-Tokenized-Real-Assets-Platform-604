import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { rateOperator, getOperatorRating } from '../services/operatorService';

const { FiStar, FiX, FiMapPin } = FiIcons;

const OperatorModal = ({ operator, onClose, userId }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(null);

  useEffect(() => {
    loadOperatorRating();
  }, [operator.id, userId]);

  const loadOperatorRating = async () => {
    if (userId) {
      const userRating = await getOperatorRating(operator.id, userId);
      setCurrentRating(userRating);
      setRating(userRating?.rating || 0);
    }
  };

  const handleRating = async (value) => {
    try {
      await rateOperator(operator.id, userId, value);
      setRating(value);
      loadOperatorRating();
    } catch (error) {
      console.error('Error rating operator:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full m-4"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <img
              src={operator.profile_image || 'default-profile.jpg'}
              alt={operator.name}
              className="w-16 h-16 rounded-full object-cover mr-4"
            />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {operator.name}
              </h3>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-1" />
                <span>{operator.location || 'Ubicación no especificada'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Información del Operador
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {operator.description}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Experiencia
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {operator.experience}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Calificación
            </h4>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => handleRating(star)}
                  className="focus:outline-none"
                >
                  <SafeIcon
                    icon={FiStar}
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OperatorModal;