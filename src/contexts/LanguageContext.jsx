import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  const t = (key) => {
    const translations = {
      es: {
        // Navigation
        'nav.home': 'Inicio',
        'nav.opportunities': 'Oportunidades',
        'nav.profile': 'Perfil',
        'nav.login': 'Iniciar Sesión',
        'nav.logout': 'Cerrar Sesión',
        'nav.users': 'Usuarios',
        'nav.manageOpportunities': 'Gestionar Oportunidades',
        
        // Home
        'home.hero.title': 'Tokeniza e Invierte en Activos del Mundo Real',
        'home.hero.subtitle': 'Descubre oportunidades de inversión en equipo, propiedades y negocios tokenizados',
        'home.featured.title': 'Oportunidades de Inversión Destacadas',
        'home.viewAll': 'Ver Todas las Oportunidades',
        
        // Asset Types
        'asset.equipment': 'Equipo y Maquinaria',
        'asset.airbnb': 'Airbnb',
        'asset.business': 'Negocios',
        
        // Asset Details
        'asset.projectedReturn': 'Rentabilidad Proyectada',
        'asset.available': 'Disponible',
        'asset.sold': 'Vendido',
        'asset.tokenPrice': 'Precio del Token',
        'asset.operator': 'Operador',
        'asset.buyQuantity': 'Cantidad a Comprar',
        'asset.buy': 'Comprar',
        'asset.myHoldings': 'Mis Holdings',
        'asset.dueDiligence': 'Due Diligence',
        'asset.historicalPerformance': 'Rendimiento Histórico',
        'asset.documents': 'Documentos',
        'asset.operatorData': 'Datos del Socio Operador',
        
        // Auth
        'auth.connectWallet': 'Conectar Wallet',
        'auth.register': 'Registro',
        'auth.name': 'Nombre',
        'auth.email': 'Correo Electrónico',
        'auth.declaration': 'Declaro que no vivo en Estados Unidos',
        'auth.terms': 'Acepto términos y condiciones',
        'auth.complete': 'Completar Registro',
        
        // Profile
        'profile.title': 'Mi Perfil',
        'profile.wallet': 'Wallet',
        'profile.holdings': 'Mis Holdings',
        'profile.totalInvested': 'Total Invertido',
        'profile.role': 'Rol',
        
        // Opportunities
        'opportunities.title': 'Oportunidades de Inversión',
        'opportunities.filter.all': 'Todos',
        'opportunities.filter.equipment': 'Equipo y Maquinaria',
        'opportunities.filter.airbnb': 'Airbnb',
        'opportunities.filter.business': 'Negocios',
        
        // Admin
        'admin.users.title': 'Gestión de Usuarios',
        'admin.users.total': 'Total de Usuarios',
        'admin.users.admins': 'Administradores',
        'admin.users.operators': 'Operadores',
        'admin.users.tokenizers': 'Tokenizadores',
        'admin.opportunities.title': 'Gestionar Oportunidades',
        'admin.opportunities.add': 'Agregar Oportunidad',
        'admin.opportunities.edit': 'Editar',
        'admin.opportunities.delete': 'Eliminar',
        
        // Roles
        'role.admin': 'Administrador',
        'role.operador': 'Operador',
        'role.tokenizer': 'Tokenizador',
        
        // Forms
        'form.name': 'Nombre',
        'form.nameEn': 'Nombre en Inglés',
        'form.description': 'Descripción',
        'form.descriptionEn': 'Descripción en Inglés',
        'form.type': 'Tipo',
        'form.image': 'URL de Imagen',
        'form.projectedReturn': 'Rentabilidad Proyectada (%)',
        'form.tokenPrice': 'Precio del Token',
        'form.operator': 'Operador',
        'form.operatorEn': 'Operador en Inglés',
        'form.save': 'Guardar',
        'form.cancel': 'Cancelar',
      },
      en: {
        // Navigation
        'nav.home': 'Home',
        'nav.opportunities': 'Opportunities',
        'nav.profile': 'Profile',
        'nav.login': 'Login',
        'nav.logout': 'Logout',
        'nav.users': 'Users',
        'nav.manageOpportunities': 'Manage Opportunities',
        
        // Home
        'home.hero.title': 'Tokenize and Invest in Real World Assets',
        'home.hero.subtitle': 'Discover investment opportunities in tokenized equipment, properties, and businesses',
        'home.featured.title': 'Featured Investment Opportunities',
        'home.viewAll': 'View All Opportunities',
        
        // Asset Types
        'asset.equipment': 'Equipment & Machinery',
        'asset.airbnb': 'Airbnb',
        'asset.business': 'Business',
        
        // Asset Details
        'asset.projectedReturn': 'Projected Return',
        'asset.available': 'Available',
        'asset.sold': 'Sold',
        'asset.tokenPrice': 'Token Price',
        'asset.operator': 'Operator',
        'asset.buyQuantity': 'Quantity to Buy',
        'asset.buy': 'Buy',
        'asset.myHoldings': 'My Holdings',
        'asset.dueDiligence': 'Due Diligence',
        'asset.historicalPerformance': 'Historical Performance',
        'asset.documents': 'Documents',
        'asset.operatorData': 'Operator Partner Data',
        
        // Auth
        'auth.connectWallet': 'Connect Wallet',
        'auth.register': 'Register',
        'auth.name': 'Name',
        'auth.email': 'Email',
        'auth.declaration': 'I declare that I do not live in the United States',
        'auth.terms': 'I accept terms and conditions',
        'auth.complete': 'Complete Registration',
        
        // Profile
        'profile.title': 'My Profile',
        'profile.wallet': 'Wallet',
        'profile.holdings': 'My Holdings',
        'profile.totalInvested': 'Total Invested',
        'profile.role': 'Role',
        
        // Opportunities
        'opportunities.title': 'Investment Opportunities',
        'opportunities.filter.all': 'All',
        'opportunities.filter.equipment': 'Equipment & Machinery',
        'opportunities.filter.airbnb': 'Airbnb',
        'opportunities.filter.business': 'Business',
        
        // Admin
        'admin.users.title': 'User Management',
        'admin.users.total': 'Total Users',
        'admin.users.admins': 'Administrators',
        'admin.users.operators': 'Operators',
        'admin.users.tokenizers': 'Tokenizers',
        'admin.opportunities.title': 'Manage Opportunities',
        'admin.opportunities.add': 'Add Opportunity',
        'admin.opportunities.edit': 'Edit',
        'admin.opportunities.delete': 'Delete',
        
        // Roles
        'role.admin': 'Administrator',
        'role.operador': 'Operator',
        'role.tokenizer': 'Tokenizer',
        
        // Forms
        'form.name': 'Name',
        'form.nameEn': 'Name in English',
        'form.description': 'Description',
        'form.descriptionEn': 'Description in English',
        'form.type': 'Type',
        'form.image': 'Image URL',
        'form.projectedReturn': 'Projected Return (%)',
        'form.tokenPrice': 'Token Price',
        'form.operator': 'Operator',
        'form.operatorEn': 'Operator in English',
        'form.save': 'Save',
        'form.cancel': 'Cancel',
      }
    };
    
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};