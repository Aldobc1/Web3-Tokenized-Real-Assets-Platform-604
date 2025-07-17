import { ethers } from 'ethers';

// ABI mínima para contratos ERC-20
const erc20ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
  'function totalSupply() external view returns (uint256)'
];

// ABI mínima para contratos ERC-1155
const erc1155ABI = [
  'function balanceOf(address account, uint256 id) external view returns (uint256)',
  'function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory)',
  'function uri(uint256 id) external view returns (string memory)'
];

// Mapa de redes soportadas
const NETWORK_PROVIDERS = {
  'ethereum': 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Infura public endpoint
  'polygon': 'https://polygon-rpc.com',
  'binance': 'https://bsc-dataseed.binance.org',
  'sepolia': 'https://rpc.sepolia.org'
};

// Función para obtener un proveedor basado en la red
export const getProvider = (network = 'polygon') => {
  const providerUrl = NETWORK_PROVIDERS[network.toLowerCase()] || NETWORK_PROVIDERS.polygon;
  return new ethers.JsonRpcProvider(providerUrl);
};

// Obtener el balance de un token ERC-20
export const getERC20Balance = async (contractAddress, walletAddress, network = 'polygon') => {
  try {
    const provider = getProvider(network);
    const contract = new ethers.Contract(contractAddress, erc20ABI, provider);
    
    // Obtenemos balance, decimales y símbolo en paralelo
    const [rawBalance, decimals, symbol, name] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals().catch(() => 18), // Default a 18 si falla
      contract.symbol().catch(() => ''), // Default a string vacío si falla
      contract.name().catch(() => '') // Default a string vacío si falla
    ]);
    
    // Formatear el balance según los decimales
    const formattedBalance = ethers.formatUnits(rawBalance, decimals);
    
    return {
      balance: parseFloat(formattedBalance),
      rawBalance: rawBalance.toString(),
      decimals,
      symbol,
      name,
      contractAddress,
      walletAddress
    };
  } catch (error) {
    console.error('Error fetching ERC-20 balance:', error);
    throw error;
  }
};

// Obtener los balances de múltiples tokens ERC-1155 para un holder
export const getERC1155Balances = async (contractAddress, walletAddress, tokenIds = [], network = 'polygon') => {
  try {
    const provider = getProvider(network);
    const contract = new ethers.Contract(contractAddress, erc1155ABI, provider);
    
    // Si no se proporcionan IDs, no podemos continuar
    if (!tokenIds.length) {
      return [];
    }
    
    // Preparamos los arrays para la consulta por lotes
    const accounts = Array(tokenIds.length).fill(walletAddress);
    
    // Obtenemos los balances en una sola llamada
    const balances = await contract.balanceOfBatch(accounts, tokenIds);
    
    // Formateamos los resultados
    return tokenIds.map((id, index) => ({
      tokenId: id,
      balance: balances[index].toString(),
      contractAddress,
      walletAddress
    })).filter(item => parseInt(item.balance) > 0); // Filtramos solo los que tienen balance
  } catch (error) {
    console.error('Error fetching ERC-1155 balances:', error);
    throw error;
  }
};

// Detectar la red de un contrato (implementación básica)
export const detectContractNetwork = async (contractAddress) => {
  // En una implementación real, intentaríamos consultar el contrato en diferentes redes
  // Por ahora, asumimos Polygon para simplificar
  return 'polygon';
};