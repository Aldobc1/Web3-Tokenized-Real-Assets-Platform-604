import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AssetCard from '../components/AssetCard';
import { motion } from 'framer-motion';

const Home = () => {
  const { getAssets } = useAuth();
  const featuredAssets = getAssets().slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Tokeniza e Invierte en Activos del Mundo Real
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-8"
            >
              Descubre oportunidades de inversión en equipo, propiedades y negocios tokenizados
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link 
                to="/opportunities" 
                className="bg-white text-yellow-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors text-lg inline-block"
              >
                Ver Oportunidades
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Assets */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Oportunidades Destacadas
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Descubre las mejores oportunidades de inversión en activos tokenizados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <AssetCard asset={asset} />
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link 
              to="/opportunities" 
              className="inline-flex items-center bg-yellow-500 text-black px-8 py-4 rounded-lg font-medium hover:bg-yellow-600 transition-colors text-lg"
            >
              Ver Todas las Oportunidades
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏗️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Equipo y Maquinaria</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Invierte en maquinaria y equipo industrial con retornos estables
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Propiedades Airbnb</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Propiedades vacacionales con alta demanda turística
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏪</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Negocios</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Negocios establecidos con flujo de efectivo comprobado
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;