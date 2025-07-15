import supabase from '../lib/supabase';

export const getClaimsHistory = async (assetId, userWallet) => {
  try {
    const { data, error } = await supabase
      .from('claims_history_mt2024')
      .select('*')
      .eq('asset_id', assetId)
      .eq('user_wallet', userWallet)
      .order('claim_date', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching claims history:', error);
    throw error;
  }
};

export const addClaim = async (assetId, userWallet, amount, tokensHeld, txHash) => {
  try {
    const { data, error } = await supabase
      .from('claims_history_mt2024')
      .insert([{
        asset_id: assetId,
        user_wallet: userWallet,
        amount,
        tokens_held: tokensHeld,
        transaction_hash: txHash,
        status: 'completed'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding claim:', error);
    throw error;
  }
};