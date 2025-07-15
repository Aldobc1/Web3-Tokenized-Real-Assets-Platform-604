import supabase from '../lib/supabase';

// Rate an operator
export const rateOperator = async (operatorId, userId, rating, comment = '') => {
  try {
    // Validate required fields
    if (!operatorId || !userId) {
      throw new Error('Se requiere ID del operador y usuario');
    }

    // Ensure numeric values
    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new Error('La calificación debe ser un número entre 1 y 5');
    }

    // Create rating object
    const ratingData = {
      operator_id: operatorId,
      user_id: userId,
      rating: numericRating,
      comment: comment || '',
      updated_at: new Date().toISOString()
    };

    // Check if rating exists
    const { data: existingRating, error: checkError } = await supabase
      .from('operator_ratings_mt2024')
      .select('id')
      .eq('operator_id', operatorId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let result;
    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('operator_ratings_mt2024')
        .update(ratingData)
        .eq('id', existingRating.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Insert new rating
      const { data, error } = await supabase
        .from('operator_ratings_mt2024')
        .insert([{
          ...ratingData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    return result;
  } catch (error) {
    console.error('Error in rateOperator:', error);
    throw new Error(error.message || 'Error al guardar la calificación. Por favor intenta de nuevo.');
  }
};

// Get operator's average rating
export const getOperatorAverageRating = async (operatorId) => {
  try {
    const { data, error } = await supabase
      .from('operator_ratings_mt2024')
      .select('rating')
      .eq('operator_id', operatorId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) return 0;
    
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return parseFloat((sum / data.length).toFixed(1));
  } catch (error) {
    console.error('Error getting average rating:', error);
    return 0;
  }
};

// Get all ratings for an operator
export const getOperatorRatings = async (operatorId) => {
  try {
    const { data, error } = await supabase
      .from('operator_ratings_mt2024')
      .select(`
        *,
        users_mt2024 (
          id,
          name,
          email
        )
      `)
      .eq('operator_id', operatorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting operator ratings:', error);
    return [];
  }
};

// Get a specific rating
export const getOperatorRating = async (operatorId, userId) => {
  try {
    const { data, error } = await supabase
      .from('operator_ratings_mt2024')
      .select('*')
      .eq('operator_id', operatorId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting operator rating:', error);
    return null;
  }
};