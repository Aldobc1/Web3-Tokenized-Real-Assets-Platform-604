import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import supabase from '../lib/supabase';
import { buyAssetTokens } from '../data/assets';
import { loginUser, registerUser as authRegisterUser } from '../services/authService';

const Web3Context = createContext();

// Custom hook for using the Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Simple hash function for passwords (frontend only)
const hashPassword = async (password) => {
  // Simple hash for frontend (NOT FOR PRODUCTION)
  return btoa(password + 'salt123');
};

const verifyPassword = async (password, hashedPassword) => {
  // Simple verification (NOT FOR PRODUCTION)
  return btoa(password + 'salt123') === hashedPassword;
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
  const [connecting, setConnecting] = useState(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    // Check if there's a session in localStorage
    const session = localStorage.getItem('userSession');
    if (session) {
      try {
        const userData = JSON.parse(session);
        setUserProfile(userData);
        setIsConnected(true);
        setIsRegistered(true);
        determineUserRole(userData.email);

        // Load user wallets if user has an ID
        if (userData.id) {
          await fetchUserWallets(userData.id);
        }
        return;
      } catch (e) {
        console.error('Error parsing session data:', e);
      }
    }

    // Otherwise check if wallet is connected
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
    if (connecting) return;

    if (typeof window.ethereum !== 'undefined') {
      try {
        setConnecting(true);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setAccount(address);
        setProvider(provider);
        setIsConnected(true);
        
        // Check if wallet is registered
        const isRegistered = await checkRegistration(address);
        
        // If wallet is connected but user not registered, we need profile completion
        if (!isRegistered) {
          setNeedsProfileCompletion(true);
        }
        
        return address;
      } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
      } finally {
        setConnecting(false);
      }
    } else {
      throw new Error('MetaMask is not installed! Por favor instala MetaMask para continuar.');
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      // Get user data first to check if we need to use password_hash or legacy password
      const { data: user, error } = await supabase
        .from('users_mt2024')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        throw new Error('Credenciales inválidas');
      }

      let isValid = false;

      // Check if user has hashed password
      if (user.password_hash) {
        // Verify against hashed password
        isValid = await verifyPassword(password, user.password_hash);
      } else if (user.password) {
        // Legacy support: check plain text password
        isValid = user.password === password;

        // If valid, migrate to hashed password
        if (isValid) {
          const password_hash = await hashPassword(password);
          await supabase
            .from('users_mt2024')
            .update({ password_hash, password: null }) // Remove plain text password
            .eq('id', user.id);
        }
      }

      if (!isValid) {
        throw new Error('Credenciales inválidas');
      }

      setUserProfile(user);
      setIsConnected(true);
      setIsRegistered(true);
      determineUserRole(user.email);

      // Get user wallets
      await fetchUserWallets(user.id);

      // Save session to localStorage
      localStorage.setItem('userSession', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Error logging in with email:', error);
      throw error;
    }
  };

  const registerWithEmail = async (userData) => {
    try {
      // Hash password before registering
      const hashedPassword = await hashPassword(userData.password);

      const newUser = await authRegisterUser({ ...userData, password: hashedPassword });

      setUserProfile(newUser);
      setIsConnected(true);
      setIsRegistered(true);
      setUserRole(newUser.role || 'tokenizer');

      // Save session to localStorage
      localStorage.setItem('userSession', JSON.stringify(newUser));

      return newUser;
    } catch (error) {
      console.error('Error registering with email:', error);
      throw error;
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
        setNeedsProfileCompletion(false);
        determineUserRole(walletData.users_mt2024.email);
        fetchUserWallets(walletData.users_mt2024.id);

        // Save session to localStorage
        localStorage.setItem('userSession', JSON.stringify(walletData.users_mt2024));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking registration:', error);
      return false;
    }
  };

  const fetchUserWallets = async (userId) => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('wallets_mt2024')
        .select('*')
        .eq('user_id', userId);

      if (!error && data) {
        setUserWallets(data);

        // Set the first wallet as active account if no account is set
        if (!account && data.length > 0) {
          setAccount(data[0].wallet_address);
        }

        return data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user wallets:', error);
      return [];
    }
  };

  const addWallet = async (walletAddress, signature = null) => {
    if (!userProfile || !userProfile.id) {
      throw new Error('Usuario no identificado. Por favor inicia sesión nuevamente.');
    }

    try {
      // Check if wallet is already registered
      const { data: existingWallet, error: checkError } = await supabase
        .from('wallets_mt2024')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingWallet) {
        throw new Error('Esta wallet ya está asociada a una cuenta');
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

      if (error) throw error;

      // Refresh wallets list
      const wallets = await fetchUserWallets(userProfile.id);

      // Set as active account if it's the first wallet
      if (!account || wallets.length === 1) {
        setAccount(walletAddress);
      }

      return data;
    } catch (error) {
      console.error('Error in addWallet:', error);
      throw error;
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
        throw new Error('Este correo electrónico ya está registrado');
      }

      // Hash password
      const password_hash = await hashPassword(userData.password);

      const { data: userData2, error: userError } = await supabase
        .from('users_mt2024')
        .insert([{
          name: userData.name,
          email: userData.email,
          password_hash,
          declaration: userData.declaration,
          terms: userData.terms,
          role: userData.email === 'barbacastillo@gmail.com' ? 'admin' : 'tokenizer',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (userError) {
        console.error('Error saving user to Supabase:', userError);
        throw userError;
      }

      if (account) {
        try {
          await addWallet(account);
        } catch (walletError) {
          console.error('Error saving wallet to Supabase:', walletError);
          // Continue even if wallet association fails
        }
      }

      setUserProfile(userData2);
      setIsRegistered(true);
      setNeedsProfileCompletion(false);
      determineUserRole(userData.email);
      await fetchUserWallets(userData2.id);

      // Save session to localStorage
      localStorage.setItem('userSession', JSON.stringify(userData2));

      return userData2;
    } catch (error) {
      console.error('Error in registerUser:', error);
      throw error;
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
    setNeedsProfileCompletion(false);
    localStorage.removeItem('userSession');
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
          role: user.role,
          roles: user.roles || [user.role].filter(Boolean)
        }));
      }
      return [];
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
    needsProfileCompletion,
    connectWallet,
    registerUser,
    disconnect,
    getAllUsers,
    saveHolding,
    getHolding,
    addWallet,
    loginWithEmail,
    registerWithEmail,
    fetchUserWallets,
    connecting
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

// Export the context for advanced use cases
export { Web3Context };