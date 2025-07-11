import { useWeb3 } from '../contexts/Web3Context';

export const useRoleCheck = () => {
  const { userRole } = useWeb3();

  const isAdmin = () => userRole === 'admin';
  const isOperator = () => userRole === 'operador';
  const isTokenizer = () => userRole === 'tokenizer';
  
  const hasPermission = (requiredRole) => {
    if (requiredRole === 'admin') return isAdmin();
    if (requiredRole === 'operador') return isAdmin() || isOperator();
    if (requiredRole === 'tokenizer') return isAdmin() || isOperator() || isTokenizer();
    return false;
  };

  return {
    isAdmin,
    isOperator,
    isTokenizer,
    hasPermission
  };
};