import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import supabase from '../lib/supabase';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState('tokenizer'); // Default role

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
      // Check Supabase first
      const { data, error } = await supabase
        .from('users_mt2024')
        .select('*')
        .eq('wallet_address', address)
        .single();

      if (!error && data) {
        setUserProfile(data);
        setIsRegistered(true);
        determineUserRole(data.email);
        return;
      }

      // Fallback to localStorage
      const userData = localStorage.getItem(`user_${address}`);
      if (userData) {
        const profile = JSON.parse(userData);
        setUserProfile(profile);
        setIsRegistered(true);
        determineUserRole(profile.email);
      }
    } catch (error) {
      console.error('Error checking registration:', error);
      
      // Fallback to localStorage
      const userData = localStorage.getItem(`user_${address}`);
      if (userData) {
        const profile = JSON.parse(userData);
        setUserProfile(profile);
        setIsRegistered(true);
        determineUserRole(profile.email);
      }
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
    const userWithAddress = {
      ...userData,
      address: account,
      wallet_address: account
    };

    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from('users_mt2024')
        .insert([{
          wallet_address: account,
          name: userData.name,
          email: userData.email,
          declaration: userData.declaration,
          terms: userData.terms,
          role: userData.email === 'barbacastillo@gmail.com' ? 'admin' : 'tokenizer'
        }])
        .select()
        .single();

      if (!error) {
        setUserProfile(data);
        setIsRegistered(true);
        determineUserRole(userData.email);
      } else {
        console.error('Error saving to Supabase:', error);
        // Fallback to localStorage
        localStorage.setItem(`user_${account}`, JSON.stringify(userWithAddress));
        setUserProfile(userWithAddress);
        setIsRegistered(true);
        determineUserRole(userData.email);
      }
    } catch (error) {
      console.error('Error in registerUser:', error);
      // Fallback to localStorage
      localStorage.setItem(`user_${account}`, JSON.stringify(userWithAddress));
      setUserProfile(userWithAddress);
      setIsRegistered(true);
      determineUserRole(userData.email);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setIsConnected(false);
    setIsRegistered(false);
    setUserProfile(null);
    setUserRole('tokenizer');
  };

  const getAllUsers = async () => {
    try {
      // Try to get from Supabase first
      const { data, error } = await supabase
        .from('users_mt2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map(user => ({
          ...user,
          address: user.wallet_address,
          role: user.role
        }));
      }

      // Fallback to localStorage
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
          
          users.push({ ...userData, role });
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
      // Save to Supabase
      const { data, error } = await supabase
        .from('holdings_mt2024')
        .upsert({
          user_wallet: account,
          asset_id: assetId,
          tokens: tokens
        }, {
          onConflict: 'user_wallet,asset_id'
        })
        .select()
        .single();

      if (!error) {
        return true;
      }

      // Fallback to localStorage
      localStorage.setItem(`holdings_${account}_${assetId}`, tokens.toString());
      return true;
    } catch (error) {
      console.error('Error saving holding:', error);
      // Fallback to localStorage
      localStorage.setItem(`holdings_${account}_${assetId}`, tokens.toString());
      return true;
    }
  };

  const getHolding = async (assetId) => {
    if (!account) return 0;

    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('holdings_mt2024')
        .select('tokens')
        .eq('user_wallet', account)
        .eq('asset_id', assetId)
        .single();

      if (!error && data) {
        return data.tokens;
      }

      // Fallback to localStorage
      const holdings = localStorage.getItem(`holdings_${account}_${assetId}`);
      return holdings ? parseInt(holdings) : 0;
    } catch (error) {
      console.error('Error getting holding:', error);
      
      // Fallback to localStorage
      const holdings = localStorage.getItem(`holdings_${account}_${assetId}`);
      return holdings ? parseInt(holdings) : 0;
    }
  };

  return (
    <Web3Context.Provider value={{
      account,
      provider,
      isConnected,
      isRegistered,
      userProfile,
      userRole,
      connectWallet,
      registerUser,
      disconnect,
      getAllUsers,
      saveHolding,
      getHolding
    }}>
      {children}
    </Web3Context.Provider>
  );
};