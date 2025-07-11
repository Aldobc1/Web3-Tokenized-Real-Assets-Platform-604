import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { getOperatorRatings, addOperatorRating } from '../services/operatorService';
import { useWeb3 } from '../contexts/Web3Context';

const { FiStar, FiX } = FiIcons;

const OperatorReviewModal = ({ operator, onClose, showRatingForm = true }) => {
  const { userProfile } = useWeb3();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRatings();
  }, [operator.id]);

  const loadRatings = async () => {
    try {
      const ratingsData = await getOperatorRatings(operator.id);
      setRatings(ratingsData);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (submitting || !userProfile?.id) return;

    try {
      setSubmitting(true);
      await addOperatorRating(operator.id, newRating, comment, userProfile.id);
      await loadRatings();
      setNewRating(0);
      setComment('');
      alert('Reseña enviada exitosamente');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error al enviar la calificación');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-lg w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Reseñas de {operator.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        {showRatingForm && userProfile && (
          <form onSubmit={handleSubmitRating} className="mb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tu calificación
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setNewRating(star)}
                    className="focus:outline-none"
                  >
                    <SafeIcon
                      icon={FiStar}
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || newRating)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tu comentario
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                rows="3"
                required
                placeholder="Comparte tu experiencia con este operador..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting || newRating === 0}
              className="w-full bg-yellow-500 text-black py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Todas las reseñas ({ratings.length})
          </h4>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
            </div>
          ) : ratings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay reseñas todavía
            </p>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <motion.div
                  key={rating.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 dark:text-white mr-2">
                        {rating.users_mt2024?.name || 'Usuario'}
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <SafeIcon
                            key={i}
                            icon={FiStar}
                            className={`w-4 h-4 ${
                              i < rating.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{rating.comment}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperatorReviewModal;