import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import supabase from '../lib/supabase';
import { registerUser, loginUser } from '../services/authService';

// Create context
const Web3Context = createContext(null);

// Export useWeb3 hook
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
  const [userRole, setUserRole] = useState(null);
  const [userWallets, setUserWallets] = useState([]);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const savedAccount = localStorage.getItem('mundotangible_account');
      const savedUser = localStorage.getItem('mundotangible_user');
      
      if (savedAccount && savedUser) {
        const user = JSON.parse(savedUser);
        setAccount(savedAccount);
        setUserProfile(user);
        setUserRole(user.role);
        setIsConnected(true);
        setIsRegistered(true);
        
        // Load user wallets
        await fetchUserWallets(user.id);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      // Clear invalid session data
      localStorage.removeItem('mundotangible_account');
      localStorage.removeItem('mundotangible_user');
    } finally {
      setSessionLoaded(true);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask no está instalado');
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      
      if (accounts.length === 0) {
        throw new Error('No se pudo conectar a MetaMask');
      }

      const walletAddress = accounts[0];
      setProvider(web3Provider);
      setAccount(walletAddress);
      setIsConnected(true);

      // Save to localStorage
      localStorage.setItem('mundotangible_account', walletAddress);

      return walletAddress;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const registerWithEmail = async (userData) => {
    try {
      const user = await registerUser(userData);
      setUserProfile(user);
      setUserRole(user.role);
      setIsRegistered(true);
      setIsConnected(true);
      setAccount(user.wallet_address || 'email_user');

      // Save to localStorage
      localStorage.setItem('mundotangible_user', JSON.stringify(user));
      localStorage.setItem('mundotangible_account', user.wallet_address || 'email_user');

      return user;
    } catch (error) {
      console.error('Error in registerWithEmail:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const user = await loginUser(email, password);
      setUserProfile(user);
      setUserRole(user.role);
      setIsRegistered(true);
      setIsConnected(true);
      setAccount(user.wallet_address || 'email_user');

      // Save to localStorage
      localStorage.setItem('mundotangible_user', JSON.stringify(user));
      localStorage.setItem('mundotangible_account', user.wallet_address || 'email_user');

      // Load user wallets
      await fetchUserWallets(user.id);

      return user;
    } catch (error) {
      console.error('Error in loginWithEmail:', error);
      throw error;
    }
  };

  const fetchUserWallets = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('wallets_mt2024')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserWallets(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching wallets:', error);
      setUserWallets([]);
      return [];
    }
  };

  const addWallet = async (walletAddress) => {
    // This would be implemented to add a wallet to the user's account
    console.log('Adding wallet:', walletAddress);
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setIsConnected(false);
    setIsRegistered(false);
    setUserProfile(null);
    setUserRole(null);
    setUserWallets([]);
    
    // Clear localStorage
    localStorage.removeItem('mundotangible_account');
    localStorage.removeItem('mundotangible_user');
  };

  return (
    <Web3Context.Provider value={{
      account,
      provider,
      isConnected,
      isRegistered,
      userProfile,
      userRole,
      userWallets,
      sessionLoaded,
      connectWallet,
      disconnect,
      fetchUserWallets,
      addWallet,
      loginWithEmail,
      registerWithEmail
    }}>
      {children}
    </Web3Context.Provider>
  );
};