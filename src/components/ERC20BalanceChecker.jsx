import React, { useState } from 'react';
import { getERC20Balance } from '../services/erc20BalanceService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSearch, FiCopy, FiExternalLink, FiCheckCircle, FiAlertTriangle, FiInfo } = FiIcons;

const ERC20BalanceChecker = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [holderAddress, setHolderAddress] = useState('');
  const [network, setNetwork] = useState('polygon');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    
    if (!contractAddress || !holderAddress) {
      setError('Por favor ingresa ambas direcciones');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setResult(null);
      
      const balanceData = await getERC20Balance(contractAddress, holderAddress, network);
      setResult(balanceData);
    } catch (err) {
      console.error('Error checking balance:', err);
      setError(err.message || 'Error al consultar el balance');
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getExplorerUrl = () => {
    const explorers = {
      'ethereum': 'https://etherscan.io',
      'polygon': 'https://polygonscan.com',
      'binance': 'https://bscscan.com',
      'arbitrum': 'https://arbiscan.io',
      'optimism': 'https://optimistic.etherscan.io',
      'sepolia': 'https://sepolia.etherscan.io'
    };
    
    const baseUrl = explorers[network] || explorers.polygon;
    return `${baseUrl}/token/${contractAddress}?a=${holderAddress}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <SafeIcon icon={FiSearch} className="w-5 h-5 text-yellow-500 mr-2" />
        Consultar Balance de Token ERC-20
      </h2>
      
      <form onSubmit={handleCheck} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dirección del Contrato ERC-20
          </label>
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white font-mono"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Ejemplo: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F (USDT en Polygon)
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dirección del Holder
          </label>
          <input
            type="text"
            value={holderAddress}
            onChange={(e) => setHolderAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white font-mono"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Red Blockchain
          </label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="polygon">Polygon</option>
            <option value="ethereum">Ethereum</option>
            <option value="binance">Binance Smart Chain</option>
            <option value="arbitrum">Arbitrum</option>
            <option value="optimism">Optimism</option>
            <option value="sepolia">Sepolia (Testnet)</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-3 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
              Consultando...
            </>
          ) : (
            <>
              <SafeIcon icon={FiSearch} className="w-5 h-5 mr-2" />
              Consultar Balance
            </>
          )}
        </button>
      </form>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-400 mb-4 flex items-start">
          <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {result && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-5 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Resultado
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Copiar resultado"
              >
                <SafeIcon icon={copied ? FiCheckCircle : FiCopy} className={`w-5 h-5 ${copied ? 'text-green-500' : ''}`} />
              </button>
              <a
                href={getExplorerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Ver en explorer"
              >
                <SafeIcon icon={FiExternalLink} className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Token:</span>
              <span className="font-medium text-gray-900 dark:text-white">{result.name} ({result.symbol})</span>
            </div>
            
            <div className="flex justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Balance:</span>
              <span className="font-medium text-gray-900 dark:text-white">{result.formattedBalance} {result.symbol}</span>
            </div>
            
            <div className="flex justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Decimales:</span>
              <span className="font-medium text-gray-900 dark:text-white">{result.decimals}</span>
            </div>
            
            <div className="flex justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Raw Balance:</span>
              <span className="font-mono text-xs text-gray-900 dark:text-white truncate max-w-[250px]">
                {result.rawBalance}
              </span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start">
            <SafeIcon icon={FiInfo} className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Este balance se consulta directamente desde la blockchain y representa el valor actual en tiempo real.
            </p>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>Nota: Este componente consulta el balance directamente en la blockchain utilizando un proveedor RPC público.</p>
      </div>
    </div>
  );
};

export default ERC20BalanceChecker;