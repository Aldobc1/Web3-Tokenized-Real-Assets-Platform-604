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
        'nav.manageOperators': 'Gestionar Operadores',
        
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
        'admin.operators.title': 'Gestionar Operadores',
        'admin.operators.add': 'Agregar Operador',
        'admin.operators.edit': 'Editar',
        'admin.operators.delete': 'Eliminar',
        
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
        'form.email': 'Correo Electrónico',
        'form.phone': 'Teléfono',
        'form.company': 'Empresa',
        'form.experience': 'Experiencia',
        'form.specialization': 'Especialización',
        'form.save': 'Guardar',
        'form.cancel': 'Cancelar',
        
        // Onboarding
        'onboarding.welcome': 'Bienvenido a Mundo Tangible',
        'onboarding.step1': 'Conecta tu Wallet',
        'onboarding.step2': 'Completa tu Perfil',
        'onboarding.step3': 'Explora Oportunidades',
        'onboarding.step4': 'Realiza tu Primera Inversión',
        'onboarding.quiz.title': 'Quiz de Conocimiento',
        'onboarding.quiz.question1': '¿Qué son los activos tokenizados?',
        'onboarding.quiz.question2': '¿Cuál es el beneficio principal de la tokenización?',
        'onboarding.quiz.question3': '¿Qué necesitas para invertir?',
        
        // Referral
        'referral.title': 'Programa de Referidos',
        'referral.subtitle': 'Invita amigos y gana recompensas',
        'referral.code': 'Tu Código de Referido',
        'referral.share': 'Compartir',
        'referral.rewards': 'Recompensas Ganadas',
        'referral.referrals': 'Referidos Totales',
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
        'nav.manageOperators': 'Manage Operators',
        
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
        'admin.operators.title': 'Manage Operators',
        'admin.operators.add': 'Add Operator',
        'admin.operators.edit': 'Edit',
        'admin.operators.delete': 'Delete',
        
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
        'form.email': 'Email',
        'form.phone': 'Phone',
        'form.company': 'Company',
        'form.experience': 'Experience',
        'form.specialization': 'Specialization',
        'form.save': 'Save',
        'form.cancel': 'Cancel',
        
        // Onboarding
        'onboarding.welcome': 'Welcome to Mundo Tangible',
        'onboarding.step1': 'Connect your Wallet',
        'onboarding.step2': 'Complete your Profile',
        'onboarding.step3': 'Explore Opportunities',
        'onboarding.step4': 'Make your First Investment',
        'onboarding.quiz.title': 'Knowledge Quiz',
        'onboarding.quiz.question1': 'What are tokenized assets?',
        'onboarding.quiz.question2': 'What is the main benefit of tokenization?',
        'onboarding.quiz.question3': 'What do you need to invest?',
        
        // Referral
        'referral.title': 'Referral Program',
        'referral.subtitle': 'Invite friends and earn rewards',
        'referral.code': 'Your Referral Code',
        'referral.share': 'Share',
        'referral.rewards': 'Earned Rewards',
        'referral.referrals': 'Total Referrals',
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