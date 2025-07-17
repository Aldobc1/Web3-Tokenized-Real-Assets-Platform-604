import { ethers } from "ethers";

// ABI mínima para contratos ERC-20
const erc20ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

/**
 * Obtiene el balance de un token ERC-20 para una dirección específica
 * @param {string} contractAddress - Dirección del contrato ERC-20
 * @param {string} holderAddress - Dirección del holder
 * @param {string} network - Red a consultar (default: 'polygon')
 * @returns {Promise<{balance: number, symbol: string, name: string, decimals: number, formattedBalance: string}>}
 */
export const getERC20Balance = async (contractAddress, holderAddress, network = 'polygon') => {
  try {
    // Seleccionar el RPC según la red
    const rpcUrl = getRpcUrl(network);
    
    // Crear proveedor y contrato
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, erc20ABI, provider);
    
    // Hacer llamadas en paralelo para mejorar rendimiento
    const [balanceRaw, decimals, symbol, name] = await Promise.all([
      contract.balanceOf(holderAddress),
      contract.decimals().catch(() => 18), // Default a 18 decimales si falla
      contract.symbol().catch(() => 'TOKEN'), // Default a TOKEN si falla
      contract.name().catch(() => 'Unknown Token') // Default a Unknown Token si falla
    ]);
    
    // Formatear el balance según los decimales
    const formattedBalance = ethers.formatUnits(balanceRaw, decimals);
    const balance = parseFloat(formattedBalance);
    
    console.log(`💰 ${holderAddress} tiene ${formattedBalance} ${symbol} (${name})`);
    
    return {
      balance,
      symbol,
      name,
      decimals,
      formattedBalance,
      contractAddress,
      holderAddress,
      rawBalance: balanceRaw.toString()
    };
  } catch (error) {
    console.error('Error al consultar el balance ERC-20:', error);
    throw new Error(`Error al consultar el balance: ${error.message}`);
  }
};

/**
 * Obtiene el RPC URL para la red especificada
 * @param {string} network - Red a consultar 
 * @returns {string} URL del RPC
 */
function getRpcUrl(network) {
  const rpcUrls = {
    'ethereum': 'https://eth-mainnet.g.alchemy.com/v2/demo',
    'polygon': 'https://polygon-rpc.com',
    'binance': 'https://bsc-dataseed.binance.org',
    'arbitrum': 'https://arb1.arbitrum.io/rpc',
    'optimism': 'https://mainnet.optimism.io',
    'sepolia': 'https://rpc.sepolia.org'
  };
  
  return rpcUrls[network.toLowerCase()] || rpcUrls.polygon;
}

/**
 * Obtiene balances de múltiples tokens ERC-20 para una dirección
 * @param {Array<string>} contractAddresses - Lista de direcciones de contratos ERC-20
 * @param {string} holderAddress - Dirección del holder
 * @param {string} network - Red a consultar (default: 'polygon')
 * @returns {Promise<Array>} - Lista de balances
 */
export const getMultipleERC20Balances = async (contractAddresses, holderAddress, network = 'polygon') => {
  try {
    const balances = await Promise.all(
      contractAddresses.map(address => getERC20Balance(address, holderAddress, network))
    );
    
    // Filtrar solo tokens con balance > 0
    return balances.filter(token => token.balance > 0);
  } catch (error) {
    console.error('Error al consultar múltiples balances ERC-20:', error);
    throw error;
  }
};