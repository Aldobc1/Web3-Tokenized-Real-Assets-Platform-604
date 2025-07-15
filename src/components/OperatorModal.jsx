import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { rateOperator, getOperatorRating, getOperatorRatings } from '../services/operatorService';

const { FiStar, FiX, FiMapPin, FiMessageCircle } = FiIcons;

const OperatorModal = ({ operator, onClose, userId }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (operator?.id) {
      loadOperatorRating();
      loadReviews();
    }
  }, [operator?.id, userId]);

  const loadOperatorRating = async () => {
    if (!userId || !operator?.id) return;
    try {
      const userRating = await getOperatorRating(operator.id, userId);
      if (userRating) {
        setCurrentRating(userRating);
        setRating(userRating.rating || 0);
        setComment(userRating.comment || '');
      }
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const loadReviews = async () => {
    if (!operator?.id) return;
    try {
      setLoading(true);
      const ratingsData = await getOperatorRatings(operator.id);
      setReviews(ratingsData || []);
      if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc, curr) => acc + curr.rating, 0);
        setAvgRating(parseFloat((sum / ratingsData.length).toFixed(1)));
      } else {
        setAvgRating(0);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
      setAvgRating(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (value) => {
    try {
      setError('');
      setSuccess('');
      setSubmitting(true);
      
      if (!userId) {
        setError('Debes iniciar sesión para calificar');
        return;
      }
      
      await rateOperator(operator.id, userId, value, comment);
      
      // Recargar datos
      await loadOperatorRating();
      await loadReviews();
      
      setSuccess('Calificación enviada correctamente');
    } catch (error) {
      console.error('Error rating operator:', error);
      setError(error.message || 'Error al enviar la calificación');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReviews = () => {
    setShowReviews(!showReviews);
  };

  if (!operator) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Información del Operador
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Operator Info */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="flex-shrink-0">
              {operator.profile_image ? (
                <img
                  src={operator.profile_image}
                  alt={operator.name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI2U1ZTdlYiIvPjxwYXRoIGQ9Ik0yMCAzNkMyMCAzMC40NzcgMjQuNDc3IDI2IDMwIDI2QzM1LjUyMyAyNiA0MCAzMC40NzcgNDAgMzZWMzhINDZWMzZDNDYgMjcuMTYzIDQyLjMyNiAxOS4yOCAzOS41NjggMTUuMjRDMzYuMjQzIDEyLjc2NCAzMi4xNzggMTEuMTQzIDI4IDExLjE0M0MyMy44MjIgMTEuMTQzIDE5Ljc1NyAxMi43NjQgMTYuNDMyIDE1LjI0QzExLjY3NCAxOS4yOCA4IDI3LjE2MyA4IDM2VjM4SDE0VjM2SDIwWiIgZmlsbD0iIzk0YTNiOCIvPjwvc3ZnPg==';
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiMessageCircle} className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {operator.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {operator.company}
              </p>
              {operator.location && (
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                  <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-1" />
                  <span className="text-sm">{operator.location}</span>
                </div>
              )}
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <SafeIcon
                      key={star}
                      icon={FiStar}
                      className={`w-4 h-4 ${
                        star <= avgRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  {avgRating > 0 ? `${avgRating} (${reviews.length} reseñas)` : 'Sin reseñas'}
                </span>
              </div>
            </div>
          </div>

          {/* Rating Form */}
          {userId && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {currentRating ? 'Actualizar mi calificación' : 'Calificar operador'}
              </h4>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                  {success}
                </div>
              )}
              
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Tu calificación:
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                      type="button"
                    >
                      <SafeIcon
                        icon={FiStar}
                        className={`w-6 h-6 ${
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe tu comentario (opcional)..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white mb-4"
                rows={3}
              />
              
              <button
                onClick={() => handleRating(rating)}
                disabled={rating === 0 || submitting}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {submitting ? 'Enviando...' : (currentRating ? 'Actualizar' : 'Enviar') + ' Calificación'}
              </button>
            </div>
          )}

          {/* Reviews Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={toggleReviews}
              className="flex items-center justify-between w-full text-lg font-medium text-gray-900 dark:text-white mb-4"
              type="button"
            >
              <span>Reseñas ({reviews.length})</span>
              <SafeIcon
                icon={FiMessageCircle}
                className={`w-5 h-5 transform transition-transform ${
                  showReviews ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {showReviews && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {review.users_mt2024?.name || 'Usuario anónimo'}
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <SafeIcon
                              key={star}
                              icon={FiStar}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No hay reseñas todavía
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OperatorModal;