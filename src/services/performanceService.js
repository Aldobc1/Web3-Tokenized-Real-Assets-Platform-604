import supabase from '../lib/supabase';

export const getPerformanceHistory = async (assetId) => {
  try {
    const { data, error } = await supabase
      .from('performance_history_mt2024')
      .select('*')
      .eq('asset_id', assetId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching performance history:', error);
    throw error;
  }
};