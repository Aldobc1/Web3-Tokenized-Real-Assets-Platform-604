import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import supabase from '../lib/supabase';
import { buyAssetTokens } from '../data/assets';

const Web3Context = createContext();

// Custom hook for using the Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Web3 Provider component
export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState('tokenizer');
  const [userWallets, setUserWallets] = useState([]);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          setProvider(provider);
          setIsConnected(true);
          checkRegistration(accounts[0].address);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setProvider(provider);
        setIsConnected(true);
        checkRegistration(address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('MetaMask is not installed!');
    }
  };

  const checkRegistration = async (address) => {
    try {
      const { data: walletData, error: walletError } = await supabase
        .from('wallets_mt2024')
        .select('*, users_mt2024(*)')
        .eq('wallet_address', address)
        .single();

      if (!walletError && walletData) {
        setUserProfile(walletData.users_mt2024);
        setIsRegistered(true);
        determineUserRole(walletData.users_mt2024.email);
        fetchUserWallets(walletData.users_mt2024.id);
        return;
      }

      const userData = localStorage.getItem(`user_${address}`);
      if (userData) {
        const profile = JSON.parse(userData);
        setUserProfile(profile);
        setIsRegistered(true);
        determineUserRole(profile.email);
      }
    } catch (error) {
      console.error('Error checking registration:', error);
      const userData = localStorage.getItem(`user_${address}`);
      if (userData) {
        const profile = JSON.parse(userData);
        setUserProfile(profile);
        setIsRegistered(true);
        determineUserRole(profile.email);
      }
    }
  };

  const fetchUserWallets = async (userId) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('wallets_mt2024')
        .select('*')
        .eq('user_id', userId);

      if (!error && data) {
        setUserWallets(data);
      }
    } catch (error) {
      console.error('Error fetching user wallets:', error);
    }
  };

  const addWallet = async (walletAddress, signature) => {
    if (!userProfile || !userProfile.id) return false;
    try {
      const { data: existingWallet, error: checkError } = await supabase
        .from('wallets_mt2024')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingWallet) {
        alert('Esta wallet ya está asociada a una cuenta');
        return false;
      }

      const { data, error } = await supabase
        .from('wallets_mt2024')
        .insert([{
          user_id: userProfile.id,
          wallet_address: walletAddress,
          signature: signature,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (!error) {
        fetchUserWallets(userProfile.id);
        return true;
      } else {
        console.error('Error adding wallet:', error);
        return false;
      }
    } catch (error) {
      console.error('Error in addWallet:', error);
      return false;
    }
  };

  const determineUserRole = (email) => {
    if (email === 'barbacastillo@gmail.com') {
      setUserRole('admin');
    } else if (email && email.includes('operador')) {
      setUserRole('operador');
    } else {
      setUserRole('tokenizer');
    }
  };

  const registerUser = async (userData) => {
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('users_mt2024')
        .select('*')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        alert('Este correo electrónico ya está registrado');
        return false;
      }

      const userWithAddress = {
        ...userData,
        address: account,
        wallet_address: account
      };

      const { data: userData2, error: userError } = await supabase
        .from('users_mt2024')
        .insert([{
          name: userData.name,
          email: userData.email,
          declaration: userData.declaration,
          terms: userData.terms,
          role: userData.email === 'barbacastillo@gmail.com' ? 'admin' : 'tokenizer',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (userError) {
        console.error('Error saving user to Supabase:', userError);
        localStorage.setItem(`user_${account}`, JSON.stringify(userWithAddress));
        setUserProfile(userWithAddress);
        setIsRegistered(true);
        determineUserRole(userData.email);
        return true;
      }

      const { data: walletData, error: walletError } = await supabase
        .from('wallets_mt2024')
        .insert([{
          user_id: userData2.id,
          wallet_address: account,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (walletError) {
        console.error('Error saving wallet to Supabase:', walletError);
      }

      setUserProfile(userData2);
      setIsRegistered(true);
      determineUserRole(userData.email);
      fetchUserWallets(userData2.id);
      return true;
    } catch (error) {
      console.error('Error in registerUser:', error);
      const userWithAddress = {
        ...userData,
        address: account,
        wallet_address: account
      };
      localStorage.setItem(`user_${account}`, JSON.stringify(userWithAddress));
      setUserProfile(userWithAddress);
      setIsRegistered(true);
      determineUserRole(userData.email);
      return true;
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setIsConnected(false);
    setIsRegistered(false);
    setUserProfile(null);
    setUserRole('tokenizer');
    setUserWallets([]);
  };

  const getAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users_mt2024')
        .select('*, wallets_mt2024(*)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map(user => ({
          ...user,
          address: user.wallets_mt2024?.[0]?.wallet_address,
          wallets: user.wallets_mt2024 || [],
          role: user.role
        }));
      }

      const users = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_')) {
          const userData = JSON.parse(localStorage.getItem(key));
          const email = userData.email;
          let role = 'tokenizer';
          if (email === 'barbacastillo@gmail.com') {
            role = 'admin';
          } else if (email && email.includes('operador')) {
            role = 'operador';
          }
          users.push({...userData, role});
        }
      }

      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  };

  const saveHolding = async (assetId, tokens) => {
    if (!account) return false;
    try {
      const { data, error } = await supabase
        .from('holdings_mt2024')
        .upsert(
          {
            user_wallet: account,
            asset_id: assetId,
            tokens: tokens,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_wallet,asset_id' }
        );

      if (error) {
        console.error('Error saving holding:', error);
        throw error;
      }

      await buyAssetTokens(assetId, tokens, account);
      return true;
    } catch (error) {
      console.error('Error saving holding:', error);
      throw error;
    }
  };

  const getHolding = async (assetId) => {
    if (!account) return 0;
    try {
      const { data, error } = await supabase
        .from('holdings_mt2024')
        .select('tokens')
        .eq('user_wallet', account)
        .eq('asset_id', assetId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return 0;
        }
        throw error;
      }

      return data?.tokens || 0;
    } catch (error) {
      console.error('Error getting holding:', error);
      return 0;
    }
  };

  const contextValue = {
    account,
    provider,
    isConnected,
    isRegistered,
    userProfile,
    userRole,
    userWallets,
    connectWallet,
    registerUser,
    disconnect,
    getAllUsers,
    saveHolding,
    getHolding,
    addWallet
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

// Export the context for advanced use cases
export { Web3Context };