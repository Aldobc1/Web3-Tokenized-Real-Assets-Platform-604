import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

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

  const checkRegistration = (address) => {
    const userData = localStorage.getItem(`user_${address}`);
    if (userData) {
      const profile = JSON.parse(userData);
      setUserProfile(profile);
      setIsRegistered(true);
      determineUserRole(profile.email);
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

  const registerUser = (userData) => {
    const userWithAddress = { ...userData, address: account };
    localStorage.setItem(`user_${account}`, JSON.stringify(userWithAddress));
    setUserProfile(userWithAddress);
    setIsRegistered(true);
    determineUserRole(userData.email);
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setIsConnected(false);
    setIsRegistered(false);
    setUserProfile(null);
    setUserRole('tokenizer');
  };

  const getAllUsers = () => {
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
      getAllUsers
    }}>
      {children}
    </Web3Context.Provider>
  );
};