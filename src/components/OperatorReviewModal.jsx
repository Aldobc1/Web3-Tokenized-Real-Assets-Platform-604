import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { getOperatorRatings, rateOperator } from '../services/operatorService';
import { useWeb3 } from '../contexts/Web3Context';

const { FiStar, FiX, FiUser, FiMessageCircle } = FiIcons;

const OperatorReviewModal = ({ operator, onClose, showRatingForm = true }) => {
  const { userProfile } = useWeb3();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (operator?.id) {
      loadRatings();
    }
  }, [operator?.id]);

  const loadRatings = async () => {
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

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (submitting || !userProfile?.id || newRating === 0) {
      if (!userProfile?.id) {
        setError('Debes iniciar sesión para calificar');
      } else if (newRating === 0) {
        setError('Debes seleccionar una calificación');
      }
      return;
    }

    if (!operator?.id) {
      setError('Error: No se puede identificar el operador');
      return;
    }

    try {
      setSubmitting(true);
      
      await rateOperator(operator.id, userProfile.id, newRating, comment);
      await loadRatings();
      
      setNewRating(0);
      setComment('');
      setSuccess('Reseña enviada exitosamente');
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError(error.message || 'Error al enviar la calificación');
    } finally {
      setSubmitting(false);
    }
  };

  // Rest of the component remains the same...
  // (Component JSX remains unchanged)

};

export default OperatorReviewModal;