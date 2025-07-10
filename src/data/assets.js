import supabase from '../lib/supabase';

// Local fallback data for assets
const localAssets = [
  {
    id: 1,
    name: 'Tractor John Deere 6155M',
    nameEn: 'John Deere 6155M Tractor',
    type: 'equipment',
    image: 'https://images.unsplash.com/photo-1605338497578-8b9440f98470?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dHJhY3RvcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    projectedReturn: 12.5,
    tokenPrice: 100,
    sold: 4500,
    totalSupply: 10000,
    available: 55,
    operatorId: 1,
    operator: 'Heavy Equipment Solutions',
    operatorEn: 'Heavy Equipment Solutions',
    description: 'Tractor de alta eficiencia para operaciones agrícolas de mediana y gran escala. Rentabilidad probada en operaciones de cultivo intensivo.',
    descriptionEn: 'High-efficiency tractor for medium to large-scale agricultural operations. Proven profitability in intensive cultivation operations.',
  },
  {
    id: 2,
    name: 'Apartamento Airbnb - Zona Colonial',
    nameEn: 'Airbnb Apartment - Colonial Zone',
    type: 'airbnb',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    projectedReturn: 15.2,
    tokenPrice: 50,
    sold: 7500,
    totalSupply: 20000,
    available: 62.5,
    operatorId: 2,
    operator: 'Colonial Properties',
    operatorEn: 'Colonial Properties',
    description: 'Apartamento de lujo en la histórica Zona Colonial de Santo Domingo. Alta demanda turística y excelente ubicación.',
    descriptionEn: 'Luxury apartment in the historic Colonial Zone of Santo Domingo. High tourist demand and excellent location.',
  },
  {
    id: 3,
    name: 'Cafetería Artesanal - Piantini',
    nameEn: 'Artisanal Coffee Shop - Piantini',
    type: 'business',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Y2FmZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    projectedReturn: 18.7,
    tokenPrice: 75,
    sold: 3000,
    totalSupply: 8000,
    available: 62.5,
    operatorId: 3,
    operator: 'Urban Ventures',
    operatorEn: 'Urban Ventures',
    description: 'Cafetería boutique en una de las zonas más exclusivas de la ciudad. Flujo constante de clientes y marca reconocida.',
    descriptionEn: 'Boutique coffee shop in one of the most exclusive areas of the city. Steady customer flow and recognized brand.',
  }
];

// Cache for assets data
let assetsCache = null;

// Calculate available tokens based on total supply and sold tokens
const calculateAvailableTokens = (totalSupply, sold) => {
  return Math.max(0, totalSupply - sold);
};

// Fetch assets from Supabase
export const fetchAssets = async () => {
  try {
    const { data, error } = await supabase
      .from('assets_mt2024')
      .select(`
        *,
        operators_mt2024(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assets:', error);
      return localAssets;
    }

    // Transform Supabase data to match our format
    const transformedAssets = data.map(asset => ({
      id: asset.id,
      name: asset.name,
      nameEn: asset.name_en,
      type: asset.type,
      image: asset.image,
      projectedReturn: asset.projected_return,
      tokenPrice: asset.token_price,
      sold: asset.sold || 0,
      totalSupply: asset.total_supply || 1000000,
      available: calculateAvailableTokens(asset.total_supply || 1000000, asset.sold || 0),
      operatorId: asset.operator_id,
      operator: asset.operators_mt2024?.name,
      operatorEn: asset.operators_mt2024?.name_en,
      description: asset.description,
      descriptionEn: asset.description_en,
      contractAddress: asset.contract_address,
      tokenSymbol: asset.token_symbol
    }));

    assetsCache = transformedAssets;
    return transformedAssets;
  } catch (error) {
    console.error('Error in fetchAssets:', error);
    return localAssets;
  }
};

// Get all assets
export const getAssets = async () => {
  // Always fetch fresh data from Supabase
  return await fetchAssets();
};

// Get assets by type
export const getAssetsByType = async (type) => {
  const assets = await getAssets();
  if (type === 'all') return assets;
  return assets.filter(asset => asset.type === type);
};

// Get asset by id
export const getAssetById = async (id) => {
  const assets = await getAssets();
  return assets.find(asset => asset.id === parseInt(id));
};

// Get featured assets (for home page)
export const getFeaturedAssets = async () => {
  const assets = await getAssets();
  return assets.slice(0, 3); // Return first 3 assets as featured
};

// Add new asset
export const addAsset = async (assetData) => {
  try {
    const { data, error } = await supabase
      .from('assets_mt2024')
      .insert([
        {
          name: assetData.name,
          name_en: assetData.nameEn,
          type: assetData.type,
          image: assetData.image,
          projected_return: assetData.projectedReturn,
          token_price: assetData.tokenPrice,
          sold: assetData.sold || 0,
          operator_id: assetData.operatorId,
          description: assetData.description,
          description_en: assetData.descriptionEn,
          contract_address: assetData.contractAddress,
          total_supply: assetData.totalSupply,
          token_symbol: assetData.tokenSymbol
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding asset:', error);
      throw error;
    }

    // Clear cache to force refresh
    assetsCache = null;
    return data;
  } catch (error) {
    console.error('Error in addAsset:', error);
    throw error;
  }
};

// Update an existing asset
export const updateAsset = async (id, assetData) => {
  try {
    const updatePayload = {
      name: assetData.name,
      name_en: assetData.nameEn,
      type: assetData.type,
      image: assetData.image,
      projected_return: assetData.projectedReturn,
      token_price: assetData.tokenPrice,
      operator_id: assetData.operatorId,
      description: assetData.description,
      description_en: assetData.descriptionEn,
      updated_at: new Date().toISOString()
    };

    // Only update contract-related fields if they are provided
    if (assetData.contractAddress) {
      updatePayload.contract_address = assetData.contractAddress;
    }
    
    if (assetData.tokenSymbol) {
      updatePayload.token_symbol = assetData.tokenSymbol;
    }
    
    if (assetData.totalSupply) {
      updatePayload.total_supply = assetData.totalSupply;
    }

    // Only update sold if explicitly included (not undefined)
    if (assetData.sold !== undefined) {
      updatePayload.sold = assetData.sold;
    }

    const { data, error } = await supabase
      .from('assets_mt2024')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating asset:', error);
      throw error;
    }

    // Clear cache to force refresh
    assetsCache = null;
    return data;
  } catch (error) {
    console.error('Error in updateAsset:', error);
    throw error;
  }
};

// Delete an asset
export const deleteAsset = async (id) => {
  try {
    const { error } = await supabase
      .from('assets_mt2024')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }

    // Clear cache to force refresh
    assetsCache = null;
    return true;
  } catch (error) {
    console.error('Error in deleteAsset:', error);
    throw error;
  }
};

// Buy asset tokens
export const buyAssetTokens = async (assetId, newTokensAmount, buyerWallet) => {
  try {
    // Get current asset data
    const asset = await getAssetById(assetId);
    if (!asset) throw new Error('Asset not found');

    // Get current sold from the database to ensure we have the most up-to-date value
    const { data: currentAssetData, error: fetchError } = await supabase
      .from('assets_mt2024')
      .select('sold, total_supply, contract_address')
      .eq('id', assetId)
      .single();

    if (fetchError) {
      console.error('Error fetching current asset data:', fetchError);
      throw fetchError;
    }

    // Get current holdings for this user/asset
    const { data: currentHolding, error: holdingError } = await supabase
      .from('holdings_mt2024')
      .select('tokens')
      .eq('user_wallet', buyerWallet)
      .eq('asset_id', assetId)
      .single();

    // Calculate the difference between new tokens amount and previous holdings
    const previousTokens = (currentHolding && !holdingError) ? currentHolding.tokens : 0;
    const tokenDifference = newTokensAmount - previousTokens;

    // Update the total tokens sold
    const currentSold = currentAssetData.sold || 0;
    const newSold = currentSold + tokenDifference;

    // Calculate new available tokens
    const totalSupply = currentAssetData.total_supply || asset.totalSupply;
    const availableTokens = calculateAvailableTokens(totalSupply, newSold);

    // Validate that there are enough tokens available
    if (tokenDifference > 0 && availableTokens < 0) {
      throw new Error('No hay suficientes tokens disponibles para esta compra');
    }

    // Update the asset with new values
    const { error: updateError } = await supabase
      .from('assets_mt2024')
      .update({
        sold: newSold,
        available: availableTokens,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId);

    if (updateError) {
      console.error('Error updating asset tokens sold:', updateError);
      throw updateError;
    }

    // Update or create the holdings record
    const { error: holdingsUpdateError } = await supabase
      .from('holdings_mt2024')
      .upsert(
        {
          user_wallet: buyerWallet,
          asset_id: assetId,
          tokens: newTokensAmount,
          contract_address: currentAssetData.contract_address,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_wallet,asset_id' }
      );

    if (holdingsUpdateError) {
      console.error('Error updating holdings:', holdingsUpdateError);
      throw holdingsUpdateError;
    }

    console.log(`${buyerWallet} now has ${newTokensAmount} tokens of asset ${assetId}`);
    console.log(`Asset ${assetId} now has ${newSold} tokens sold (Available: ${availableTokens} tokens)`);

    // Clear cache to force refresh
    assetsCache = null;
    return true;
  } catch (error) {
    console.error('Error in buyAssetTokens:', error);
    throw error;
  }
};