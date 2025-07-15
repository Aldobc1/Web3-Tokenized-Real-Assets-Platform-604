import supabase from '../lib/supabase';

// Subscribe to token sales changes for a specific asset
export const subscribeToAssetSales = (assetId, onUpdate) => {
  const channel = supabase
    .channel(`asset_${assetId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'assets_mt2024',
        filter: `id=eq.${assetId}`
      },
      (payload) => {
        const { sold, total_supply } = payload.new;
        onUpdate({
          sold,
          totalSupply: total_supply,
          available: Math.max(0, total_supply - sold)
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Update asset sales count
export const updateAssetSales = async (assetId, soldTokens) => {
  try {
    const { data, error } = await supabase
      .from('assets_mt2024')
      .update({ 
        sold: soldTokens,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating asset sales:', error);
    throw error;
  }
};