import supabase from '../lib/supabase';

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
      return [];
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

    return transformedAssets;
  } catch (error) {
    console.error('Error in fetchAssets:', error);
    return [];
  }
};

// Get all assets
export const getAssets = async () => {
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
  try {
    const { data, error } = await supabase
      .from('assets_mt2024')
      .select(`
        *,
        operators_mt2024(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching asset:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      nameEn: data.name_en,
      type: data.type,
      image: data.image,
      projectedReturn: data.projected_return,
      tokenPrice: data.token_price,
      sold: data.sold || 0,
      totalSupply: data.total_supply || 1000000,
      available: calculateAvailableTokens(data.total_supply || 1000000, data.sold || 0),
      operatorId: data.operator_id,
      operator: data.operators_mt2024?.name,
      operatorEn: data.operators_mt2024?.name_en,
      description: data.description,
      descriptionEn: data.description_en,
      contractAddress: data.contract_address,
      tokenSymbol: data.token_symbol
    };
  } catch (error) {
    console.error('Error in getAssetById:', error);
    return null;
  }
};

// Get featured assets (for home page)
export const getFeaturedAssets = async () => {
  try {
    const { data, error } = await supabase
      .from('assets_mt2024')
      .select(`
        *,
        operators_mt2024(*)
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching featured assets:', error);
      return [];
    }

    return data.map(asset => ({
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
  } catch (error) {
    console.error('Error in getFeaturedAssets:', error);
    return [];
  }
};

// Add new asset
export const addAsset = async (assetData) => {
  try {
    const { data, error } = await supabase
      .from('assets_mt2024')
      .insert([{
        name: assetData.name,
        name_en: assetData.nameEn,
        type: assetData.type,
        image: assetData.image,
        projected_return: assetData.projectedReturn,
        token_price: assetData.tokenPrice,
        sold: assetData.sold || 0,
        total_supply: assetData.totalSupply || 1000000,
        operator_id: assetData.operatorId,
        description: assetData.description,
        description_en: assetData.descriptionEn,
        contract_address: assetData.contractAddress,
        token_symbol: assetData.tokenSymbol,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding asset:', error);
    throw error;
  }
};

// Update existing asset
export const updateAsset = async (id, assetData) => {
  try {
    const updateObj = {};
    
    // Only include fields that are present in assetData
    if (assetData.name !== undefined) updateObj.name = assetData.name;
    if (assetData.nameEn !== undefined) updateObj.name_en = assetData.nameEn;
    if (assetData.type !== undefined) updateObj.type = assetData.type;
    if (assetData.image !== undefined) updateObj.image = assetData.image;
    if (assetData.projectedReturn !== undefined) updateObj.projected_return = assetData.projectedReturn;
    if (assetData.tokenPrice !== undefined) updateObj.token_price = assetData.tokenPrice;
    if (assetData.sold !== undefined) updateObj.sold = assetData.sold;
    if (assetData.totalSupply !== undefined) updateObj.total_supply = assetData.totalSupply;
    if (assetData.operatorId !== undefined) updateObj.operator_id = assetData.operatorId;
    if (assetData.description !== undefined) updateObj.description = assetData.description;
    if (assetData.descriptionEn !== undefined) updateObj.description_en = assetData.descriptionEn;
    if (assetData.contractAddress !== undefined) updateObj.contract_address = assetData.contractAddress;
    if (assetData.tokenSymbol !== undefined) updateObj.token_symbol = assetData.tokenSymbol;
    
    // Always update the updated_at timestamp
    updateObj.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('assets_mt2024')
      .update(updateObj)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating asset:', error);
    throw error;
  }
};

// Delete asset
export const deleteAsset = async (id) => {
  try {
    const { error } = await supabase
      .from('assets_mt2024')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
};