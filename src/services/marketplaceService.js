import supabase from '../lib/supabase';

export const createListing = async (assetId, sellerWallet, quantity, pricePerToken) => {
  try {
    console.log('Creating listing with:', { assetId, sellerWallet, quantity, pricePerToken });
    
    const { data, error } = await supabase
      .from('marketplace_listings_mt2024')
      .insert([{
        asset_id: assetId,
        seller_wallet: sellerWallet,
        quantity: quantity,
        price_per_token: pricePerToken,
        status: 'active',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
    
    console.log('Listing created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createListing:', error);
    throw error;
  }
};

export const getActiveListings = async (assetId) => {
  try {
    console.log('Fetching listings for asset:', assetId);
    
    const { data, error } = await supabase
      .from('marketplace_listings_mt2024')
      .select(`
        *,
        assets_mt2024 (
          name,
          token_price
        )
      `)
      .eq('asset_id', assetId)
      .eq('status', 'active')
      .order('price_per_token', { ascending: true });

    if (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
    
    console.log('Listings fetched:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getActiveListings:', error);
    throw error;
  }
};

export const purchaseListings = async (listingIds, buyerWallet) => {
  try {
    console.log('Purchasing listings:', { listingIds, buyerWallet });
    
    const { data, error } = await supabase
      .from('marketplace_listings_mt2024')
      .update({
        status: 'sold',
        buyer_wallet: buyerWallet,
        sold_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('id', listingIds)
      .eq('status', 'active')
      .select();

    if (error) {
      console.error('Error purchasing listings:', error);
      throw error;
    }
    
    console.log('Listings purchased successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in purchaseListings:', error);
    throw error;
  }
};