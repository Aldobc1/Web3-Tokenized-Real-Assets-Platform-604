import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import PerformanceChart from './PerformanceChart';

const { FiFileText, FiDownload } = FiIcons;

const DueDiligenceSection = ({ asset, documents }) => {
  const documentTypes = [
    { key: 'invoice', label: 'Factura o Escritura' },
    { key: 'dueDiligence', label: 'Due Diligence' },
    { key: 'tokenization', label: 'Documento de Tokenización' },
    { key: 'economicRights', label: 'Contrato de Sesión de Derechos Económicos' },
    { key: 'investmentContract', label: 'Contrato Marco de Inversión' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <SafeIcon icon={FiFileText} className="w-5 h-5 text-yellow-500" />
          Due Diligence
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {documentTypes.map((docType) => {
            const doc = documents?.[docType.key];
            return (
              <div
                key={docType.key}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <SafeIcon
                    icon={FiFileText}
                    className="w-5 h-5 text-gray-400 dark:text-gray-500"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {docType.label}
                    </h3>
                    {doc && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {doc.name}
                      </p>
                    )}
                  </div>
                </div>
                {doc ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-1 text-sm"
                  >
                    <SafeIcon icon={FiDownload} className="w-4 h-4" />
                    Ver
                  </a>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    No disponible
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Rendimiento Histórico
        </h2>
        <PerformanceChart assetId={asset.id} />
      </div>
    </div>
  );
};

export default DueDiligenceSection;