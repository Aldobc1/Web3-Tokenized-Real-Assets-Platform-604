import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Simple password hashing
const hashPassword = (password) => btoa(password + 'salt123');
const verifyPassword = (password, hash) => btoa(password + 'salt123') === hash;

// Mock database
const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@mundotangible.com',
    password_hash: hashPassword('admin123'),
    role: 'admin'
  }
];

const mockAssets = [
  {
    id: 1,
    name: 'Tractor John Deere 6155M',
    type: 'Equipo',
    image: 'https://images.unsplash.com/photo-1605338497578-8b9440f98470?w=800',
    projectedReturn: 12.5,
    tokenPrice: 100,
    sold: 4500,
    totalSupply: 10000,
    description: 'Tractor de alta eficiencia para operaciones agrícolas de mediana y gran escala.'
  },
  {
    id: 2,
    name: 'Apartamento Airbnb - Zona Colonial',
    type: 'Airbnb',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    projectedReturn: 15.2,
    tokenPrice: 50,
    sold: 7500,
    totalSupply: 20000,
    description: 'Apartamento de lujo en la histórica Zona Colonial de Santo Domingo.'
  },
  {
    id: 3,
    name: 'Cafetería Artesanal - Piantini',
    type: 'Negocio',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    projectedReturn: 18.7,
    tokenPrice: 75,
    sold: 3000,
    totalSupply: 8000,
    description: 'Cafetería boutique en una de las zonas más exclusivas de la ciudad.'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState(mockAssets);
  const [holdings, setHoldings] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    checkTheme();
  }, []);

  const checkAuth = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  };

  const checkTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  };

  const login = async (email, password) => {
    const foundUser = mockUsers.find(u => u.email === email);
    if (!foundUser || !verifyPassword(password, foundUser.password_hash)) {
      throw new Error('Credenciales inválidas');
    }
    
    const { password_hash, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  };

  const register = async (userData) => {
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const newUser = {
      id: mockUsers.length + 1,
      name: userData.name,
      email: userData.email,
      password_hash: hashPassword(userData.password),
      role: 'tokenizer'
    };

    mockUsers.push(newUser);
    const { password_hash, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // For demo purposes, create a user with wallet
        const walletUser = {
          id: Date.now(),
          name: 'Wallet User',
          email: `${address.slice(0, 6)}@wallet.local`,
          role: 'tokenizer',
          wallet: address
        };
        
        setUser(walletUser);
        localStorage.setItem('user', JSON.stringify(walletUser));
        return walletUser;
      } catch (error) {
        throw new Error('Error conectando wallet');
      }
    } else {
      throw new Error('MetaMask no está instalado');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const getAssets = () => assets;
  
  const getAssetById = (id) => assets.find(asset => asset.id === parseInt(id));
  
  const buyTokens = (assetId, quantity) => {
    if (!user) throw new Error('Debes iniciar sesión');
    
    const asset = assets.find(a => a.id === assetId);
    if (!asset) throw new Error('Activo no encontrado');
    
    // Update asset sold tokens
    setAssets(prev => prev.map(a => 
      a.id === assetId ? { ...a, sold: a.sold + quantity } : a
    ));
    
    // Update user holdings
    setHoldings(prev => {
      const existingHolding = prev.find(h => h.assetId === assetId && h.userId === user.id);
      if (existingHolding) {
        return prev.map(h => 
          h.assetId === assetId && h.userId === user.id 
            ? { ...h, tokens: h.tokens + quantity }
            : h
        );
      } else {
        return [...prev, { 
          id: Date.now(), 
          userId: user.id, 
          assetId, 
          tokens: quantity,
          asset 
        }];
      }
    });
  };

  const getUserHoldings = () => {
    return holdings.filter(h => h.userId === user?.id);
  };

  const value = {
    user,
    loading,
    isDarkMode,
    login,
    register,
    connectWallet,
    logout,
    toggleTheme,
    getAssets,
    getAssetById,
    buyTokens,
    getUserHoldings
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};