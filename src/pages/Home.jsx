import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import HeroCarousel from '../components/HeroCarousel';
import AssetCard from '../components/AssetCard';
import { getFeaturedAssets } from '../data/assets';
import { motion } from 'framer-motion';

const Home = () => {
  const { t } = useLanguage();
  const featuredAssets = getFeaturedAssets();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section 
        className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751590699962-Este%20amarillo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-yellow-500/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-6 text-black"
            >
              {t('home.hero.title')}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto text-black"
            >
              {t('home.hero.subtitle')}
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <HeroCarousel />
          </motion.div>
        </div>
      </section>

      {/* Featured Assets Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.featured.title')}
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
              {t('home.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏗️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{t('asset.equipment')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Invierte en maquinaria y equipo industrial con retornos estables
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{t('asset.airbnb')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Propiedades vacacionales con alta demanda turística
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏪</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{t('asset.business')}</h3>
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