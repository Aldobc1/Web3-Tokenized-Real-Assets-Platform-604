import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { useWeb3 } from './Web3Context';

const TokenSalesContext = createContext();

export const useTokenSales = () => {
  const context = useContext(TokenSalesContext);
  if (!context) {
    throw new Error('useTokenSales must be used within a TokenSalesProvider');
  }
  return context;
};

export const TokenSalesProvider = ({ children }) => {
  const { isConnected } = useWeb3();
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Load initial sales data
  useEffect(() => {
    if (isConnected) {
      fetchAllAssetsSalesData();
      
      // Set up real-time subscription for sales updates
      const subscription = setupRealtimeSubscription();
      
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [isConnected]);

  // Fetch sales data for all assets
  const fetchAllAssetsSalesData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assets_mt2024')
        .select('id, total_supply, sold, token_price, contract_address');
      
      if (error) throw error;
      
      // Transform data into a more usable format
      const salesObj = {};
      data.forEach(asset => {
        salesObj[asset.id] = {
          totalSupply: asset.total_supply || 1000000,
          sold: asset.sold || 0,
          available: (asset.total_supply || 1000000) - (asset.sold || 0),
          tokenPrice: asset.token_price,
          contractAddress: asset.contract_address
        };
      });
      
      setSalesData(salesObj);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sales data for a specific asset
  const fetchAssetSalesData = async (assetId) => {
    try {
      if (!assetId) return null;
      
      const { data, error } = await supabase
        .from('assets_mt2024')
        .select('id, total_supply, sold, token_price, contract_address')
        .eq('id', assetId)
        .single();
      
      if (error) throw error;
      
      const assetSalesData = {
        totalSupply: data.total_supply || 1000000,
        sold: data.sold || 0,
        available: (data.total_supply || 1000000) - (data.sold || 0),
        tokenPrice: data.token_price,
        contractAddress: data.contract_address
      };
      
      // Update the context state with new data
      setSalesData(prev => ({
        ...prev,
        [assetId]: assetSalesData
      }));
      
      return assetSalesData;
    } catch (error) {
      console.error(`Error fetching sales data for asset ${assetId}:`, error);
      return null;
    }
  };

  // Update token sales for an asset
  const updateTokenSales = async (assetId, quantitySold) => {
    try {
      // Get current asset data
      const currentAssetData = salesData[assetId] || await fetchAssetSalesData(assetId);
      
      if (!currentAssetData) {
        throw new Error(`Asset with ID ${assetId} not found`);
      }
      
      const newSoldAmount = currentAssetData.sold + quantitySold;
      
      // Update in Supabase
      const { data, error } = await supabase
        .from('assets_mt2024')
        .update({ 
          sold: newSoldAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', assetId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      const updatedAssetData = {
        totalSupply: data.total_supply || 1000000,
        sold: data.sold || 0,
        available: (data.total_supply || 1000000) - (data.sold || 0),
        tokenPrice: data.token_price,
        contractAddress: data.contract_address
      };
      
      setSalesData(prev => ({
        ...prev,
        [assetId]: updatedAssetData
      }));
      
      setLastUpdate(new Date());
      
      return updatedAssetData;
    } catch (error) {
      console.error(`Error updating token sales for asset ${assetId}:`, error);
      throw error;
    }
  };

  // Set up realtime subscription to sales updates
  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('assets_sales_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'assets_mt2024',
          columns: ['sold', 'total_supply'] 
        }, 
        (payload) => {
          // Update the local state when we get a real-time update
          const updatedAsset = payload.new;
          
          if (updatedAsset && updatedAsset.id) {
            setSalesData(prev => ({
              ...prev,
              [updatedAsset.id]: {
                totalSupply: updatedAsset.total_supply || 1000000,
                sold: updatedAsset.sold || 0,
                available: (updatedAsset.total_supply || 1000000) - (updatedAsset.sold || 0),
                tokenPrice: updatedAsset.token_price,
                contractAddress: updatedAsset.contract_address
              }
            }));
            
            setLastUpdate(new Date());
          }
        }
      )
      .subscribe();
    
    return subscription;
  };

  // Calculate percentages for displaying progress
  const calculatePercentages = (assetId) => {
    const asset = salesData[assetId];
    
    if (!asset) return { soldPercentage: 0, availablePercentage: 100 };
    
    const totalSupply = asset.totalSupply || 1000000;
    const sold = asset.sold || 0;
    
    const soldPercentage = Math.min(100, Math.round((sold / totalSupply) * 100));
    const availablePercentage = 100 - soldPercentage;
    
    return { soldPercentage, availablePercentage };
  };

  // Get formatted sales data for an asset
  const getAssetSalesData = (assetId) => {
    const asset = salesData[assetId];
    
    if (!asset) {
      // If we don't have data for this asset yet, trigger a fetch
      fetchAssetSalesData(assetId);
      return {
        totalSupply: 1000000,
        sold: 0,
        available: 1000000,
        soldPercentage: 0,
        availablePercentage: 100,
        loading: true
      };
    }
    
    const { soldPercentage, availablePercentage } = calculatePercentages(assetId);
    
    return {
      ...asset,
      soldPercentage,
      availablePercentage,
      loading: false
    };
  };

  return (
    <TokenSalesContext.Provider value={{
      salesData,
      loading,
      lastUpdate,
      fetchAssetSalesData,
      updateTokenSales,
      getAssetSalesData
    }}>
      {children}
    </TokenSalesContext.Provider>
  );
};