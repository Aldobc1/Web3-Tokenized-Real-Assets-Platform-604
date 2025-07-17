import supabase from '../lib/supabase';

export const createListing = async (assetId, sellerWallet, quantity, pricePerToken) => {
  try {
    console.log('Creating listing with:', { assetId, sellerWallet, quantity, pricePerToken });
    
    // Validate inputs
    if (!assetId || !sellerWallet || !quantity || !pricePerToken) {
      throw new Error('Missing required fields for listing creation');
    }

    // Ensure numeric values
    const numericQuantity = Number(quantity);
    const numericPrice = Number(pricePerToken);

    if (isNaN(numericQuantity) || numericQuantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }

    if (isNaN(numericPrice) || numericPrice <= 0) {
      throw new Error('Price must be a positive number');
    }

    // Create listing
    const { data, error } = await supabase
      .from('marketplace_listings_mt2024')
      .insert([{
        asset_id: assetId,
        seller_wallet: sellerWallet,
        quantity: numericQuantity,
        price_per_token: numericPrice,
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
    
    if (!assetId) {
      console.error('Missing asset ID for fetching listings');
      return [];
    }

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
    
    console.log(`Found ${data?.length || 0} active listings for asset ${assetId}`);
    return data || [];
  } catch (error) {
    console.error('Error in getActiveListings:', error);
    return [];
  }
};

export const purchaseListings = async (listingIds, buyerWallet) => {
  try {
    console.log('Purchasing listings:', { listingIds, buyerWallet });
    
    if (!listingIds || listingIds.length === 0 || !buyerWallet) {
      throw new Error('Missing required fields for purchase');
    }

    // Update listings to sold status
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
    
    console.log(`Successfully purchased ${data?.length || 0} listings`);
    return data;
  } catch (error) {
    console.error('Error in purchaseListings:', error);
    throw error;
  }
};

// Get listings by seller
export const getListingsBySeller = async (sellerWallet) => {
  try {
    if (!sellerWallet) {
      return [];
    }

    const { data, error } = await supabase
      .from('marketplace_listings_mt2024')
      .select(`
        *,
        assets_mt2024 (
          id,
          name,
          token_price,
          image
        )
      `)
      .eq('seller_wallet', sellerWallet)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller listings:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getListingsBySeller:', error);
    return [];
  }
};

// Cancel a listing (for the seller to remove their own listing)
export const cancelListing = async (listingId, sellerWallet) => {
  try {
    if (!listingId || !sellerWallet) {
      throw new Error('Missing required fields for cancellation');
    }

    // First verify this is the seller's listing
    const { data: listing, error: fetchError } = await supabase
      .from('marketplace_listings_mt2024')
      .select('seller_wallet')
      .eq('id', listingId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (listing.seller_wallet !== sellerWallet) {
      throw new Error('You can only cancel your own listings');
    }

    // Update the listing status to cancelled
    const { data, error } = await supabase
      .from('marketplace_listings_mt2024')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId)
      .eq('status', 'active')
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in cancelListing:', error);
    throw error;
  }
};