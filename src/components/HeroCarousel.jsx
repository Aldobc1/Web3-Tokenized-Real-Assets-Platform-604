import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getFeaturedAssets } from '../data/assets';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiChevronLeft, FiChevronRight } = FiIcons;

const HeroCarousel = () => {
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const assets = getFeaturedAssets();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % assets.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [assets.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % assets.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + assets.length) % assets.length);
  };

  const getAssetName = (asset) => {
    return language === 'es' ? asset.name : asset.nameEn;
  };

  const getAssetDescription = (asset) => {
    return language === 'es' ? asset.description : asset.descriptionEn;
  };

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={assets[currentSlide].image}
            alt={getAssetName(assets[currentSlide])}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {getAssetName(assets[currentSlide])}
              </h2>
              <p className="text-lg mb-6 opacity-90">
                {getAssetDescription(assets[currentSlide])}
              </p>
              <div className="flex items-center gap-6 mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">
                    {t('asset.projectedReturn')}: {assets[currentSlide].projectedReturn}%
                  </span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">
                    {t('asset.available')}: {assets[currentSlide].available}%
                  </span>
                </div>
              </div>
              <Link
                to={`/asset/${assets[currentSlide].id}`}
                className="inline-flex items-center bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                Ver Detalles
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
      >
        <SafeIcon icon={FiChevronLeft} className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
      >
        <SafeIcon icon={FiChevronRight} className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {assets.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;