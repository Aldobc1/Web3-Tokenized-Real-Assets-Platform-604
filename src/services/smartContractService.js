import supabase from '../lib/supabase';

// Get holdings for a specific contract and wallet
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
      if (error.code === 'PGRST116') { // No data found
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

// Update holdings for a specific contract
export const updateContractHoldings = async (contractAddress, walletAddress, assetId, tokens) => {
  try {
    const { data, error } = await supabase
      .from('holdings_mt2024')
      .upsert({
        contract_address: contractAddress,
        user_wallet: walletAddress,
        asset_id: assetId,
        tokens: tokens,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'contract_address,user_wallet,asset_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in updateContractHoldings:', error);
    throw error;
  }
};

// Get holdings for all wallets of a user
export const getHoldingsByAllWallets = async (walletAddresses) => {
  try {
    if (!walletAddresses || walletAddresses.length === 0) return [];

    const { data: holdings, error } = await supabase
      .from('holdings_mt2024')
      .select(`
        *,
        smart_contracts_mt2024 (
          name,
          symbol,
          supply,
          blockchain,
          contract_address
        ),
        assets_mt2024 (
          id,
          name,
          type,
          token_price,
          image
        )
      `)
      .in('user_wallet', walletAddresses);

    if (error) throw error;
    return holdings || [];
  } catch (error) {
    console.error('Error in getHoldingsByAllWallets:', error);
    throw error;
  }
};

// Get smart contracts list
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

// Get available contracts for dropdown
export const getAvailableContractsForDropdown = async () => {
  try {
    const contracts = await getSmartContracts();
    return contracts.map(contract => ({
      value: contract.contract_address,
      label: `${contract.name} (${contract.symbol})`,
      symbol: contract.symbol,
      supply: contract.supply
    }));
  } catch (error) {
    console.error('Error in getAvailableContractsForDropdown:', error);
    return [];
  }
};

// Get smart contract by address
export const getSmartContractByAddress = async (contractAddress) => {
  try {
    const { data, error } = await supabase
      .from('smart_contracts_mt2024')
      .select('*')
      .eq('contract_address', contractAddress)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in getSmartContractByAddress:', error);
    return null;
  }
};

// Delete smart contract
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

// Add smart contract
export const addSmartContract = async (contractData) => {
  try {
    const { data, error } = await supabase
      .from('smart_contracts_mt2024')
      .insert([{
        ...contractData,
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

// Update smart contract
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