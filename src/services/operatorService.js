import supabase from '../lib/supabase';

// Rate an operator
export const rateOperator = async (operatorId, userId, rating, comment = '') => {
  try {
    const { data, error } = await supabase
      .from('operator_ratings_mt2024')
      .upsert(
        {
          operator_id: operatorId,
          user_id: userId,
          rating: rating,
          comment: comment,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'operator_id,user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error rating operator:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in rateOperator:', error);
    throw error;
  }
};

// Get a user's rating for an operator
export const getOperatorRating = async (operatorId, userId) => {
  try {
    const { data, error } = await supabase
      .from('operator_ratings_mt2024')
      .select('*')
      .eq('operator_id', operatorId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rating found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getOperatorRating:', error);
    return null;
  }
};

// Get average rating for an operator
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
    console.error('Error in getOperatorAverageRating:', error);
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
        users_mt2024 (id, name)
      `)
      .eq('operator_id', operatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getOperatorRatings:', error);
    return [];
  }
};

// Add a rating (alias for rateOperator for consistency)
export const addOperatorRating = async (operatorId, rating, comment, userId) => {
  return await rateOperator(operatorId, userId, rating, comment);
};