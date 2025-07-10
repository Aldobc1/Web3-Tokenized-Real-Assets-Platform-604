import supabase from '../lib/supabase';

// Get all smart contracts
export const getSmartContracts = async () => {
  try {
    const { data, error } = await supabase
      .from('smart_contracts_mt2024')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getSmartContracts:', error);
    throw error;
  }
};

// Get a specific smart contract by address
export const getSmartContractByAddress = async (contractAddress) => {
  try {
    const { data, error } = await supabase
      .from('smart_contracts_mt2024')
      .select('*')
      .eq('contract_address', contractAddress)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in getSmartContractByAddress:', error);
    throw error;
  }
};

// Get available contracts for dropdown
export const getAvailableContractsForDropdown = async () => {
  try {
    const { data, error } = await supabase
      .from('smart_contracts_mt2024')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(contract => ({
      value: contract.contract_address,
      label: `${contract.name} (${contract.symbol}) - ${contract.contract_address.slice(0, 6)}...${contract.contract_address.slice(-4)}`,
      symbol: contract.symbol,
      supply: contract.supply
    }));
  } catch (error) {
    console.error('Error in getAvailableContractsForDropdown:', error);
    return [];
  }
};

// Add a new smart contract
export const addSmartContract = async (contractData) => {
  try {
    const { data, error } = await supabase
      .from('smart_contracts_mt2024')
      .insert([{
        name: contractData.name,
        symbol: contractData.symbol,
        supply: contractData.supply,
        blockchain: contractData.blockchain,
        owner: contractData.owner,
        contract_address: contractData.contract_address,
        token_type: contractData.token_type,
        documents: contractData.documents || {},
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in addSmartContract:', error);
    throw error;
  }
};

// Update a smart contract
export const updateSmartContract = async (contractAddress, updateData) => {
  try {
    const { data, error } = await supabase
      .from('smart_contracts_mt2024')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('contract_address', contractAddress)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in updateSmartContract:', error);
    throw error;
  }
};

// Delete a smart contract
export const deleteSmartContract = async (contractAddress) => {
  try {
    const { error } = await supabase
      .from('smart_contracts_mt2024')
      .delete()
      .eq('contract_address', contractAddress);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error in deleteSmartContract:', error);
    throw error;
  }
};

// Get contract holdings by wallet
export const getContractHoldings = async (contractAddress, walletAddress) => {
  try {
    const { data, error } = await supabase
      .from('holdings_mt2024')
      .select('*')
      .eq('contract_address', contractAddress)
      .eq('user_wallet', walletAddress);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getContractHoldings:', error);
    return [];
  }
};

// Update contract holdings
export const updateContractHoldings = async (contractAddress, holderAddress, assetId, newTokens) => {
  try {
    // Get current contract data
    const contract = await getSmartContractByAddress(contractAddress);
    if (!contract) throw new Error('Smart contract not found');

    // Get current holdings for this specific contract
    const { data: currentHolding, error: holdingError } = await supabase
      .from('holdings_mt2024')
      .select('tokens')
      .eq('contract_address', contractAddress)
      .eq('user_wallet', holderAddress)
      .eq('asset_id', assetId)
      .single();

    if (holdingError && holdingError.code !== 'PGRST116') {
      throw holdingError;
    }

    const currentTokens = currentHolding?.tokens || 0;
    const totalTokens = newTokens; // Usar directamente los nuevos tokens en lugar de sumar

    // Update holdings
    const { data, error } = await supabase
      .from('holdings_mt2024')
      .upsert({
        contract_address: contractAddress,
        user_wallet: holderAddress,
        asset_id: assetId,
        tokens: totalTokens,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update contract tokens sold
    const tokenDifference = totalTokens - currentTokens;
    await supabase
      .from('smart_contracts_mt2024')
      .update({
        tokens_sold: (contract.tokens_sold || 0) + tokenDifference,
        available_tokens: contract.supply - ((contract.tokens_sold || 0) + tokenDifference),
        updated_at: new Date().toISOString()
      })
      .eq('contract_address', contractAddress);

    return data;
  } catch (error) {
    console.error('Error in updateContractHoldings:', error);
    throw error;
  }
};

// Get holdings by wallet address
export const getHoldingsByWallet = async (walletAddress) => {
  try {
    const { data, error } = await supabase
      .from('holdings_mt2024')
      .select(`
        *,
        smart_contracts_mt2024 (
          name,
          symbol,
          supply,
          blockchain
        )
      `)
      .eq('user_wallet', walletAddress);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getHoldingsByWallet:', error);
    return [];
  }
};

// Get holding by contract
export const getHoldingByContract = async (walletAddress, contractAddress, assetId) => {
  try {
    const { data, error } = await supabase
      .from('holdings_mt2024')
      .select('*')
      .eq('user_wallet', walletAddress)
      .eq('contract_address', contractAddress)
      .eq('asset_id', assetId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { tokens: 0 };
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getHoldingByContract:', error);
    return { tokens: 0 };
  }
};