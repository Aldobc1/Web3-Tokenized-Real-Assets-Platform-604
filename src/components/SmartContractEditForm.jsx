import React, { useState } from 'react';
import { updateSmartContract } from '../services/smartContractService';
import DocumentUploader from './DocumentUploader';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSave, FiX, FiFileText } = FiIcons;

const SmartContractEditForm = ({ contract, onSave = () => {}, onCancel = () => {} }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState({
    invoice: contract.documents?.invoice || null,
    dueDiligence: contract.documents?.dueDiligence || null,
    tokenization: contract.documents?.tokenization || null,
    economicRights: contract.documents?.economicRights || null,
    investmentContract: contract.documents?.investmentContract || null
  });

  const documentTypes = [
    { key: 'invoice', label: 'Factura o Escritura' },
    { key: 'dueDiligence', label: 'Due Diligence' },
    { key: 'tokenization', label: 'Documento de Tokenización' },
    { key: 'economicRights', label: 'Contrato de Sesión de Derechos Económicos' },
    { key: 'investmentContract', label: 'Contrato Marco de Inversión' }
  ];

  const handleDocumentUpload = (documentType, fileInfo) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: fileInfo
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updatedContract = await updateSmartContract(contract.contract_address, {
        documents: documents
      });
      
      alert('Smart Contract actualizado exitosamente');
      onSave(updatedContract);
    } catch (error) {
      console.error('Error updating smart contract:', error);
      alert('Error al actualizar el smart contract: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Editar Smart Contract
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {contract.contract_address}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <SafeIcon icon={FiX} className="w-6 h-6" />
        </button>
      </div>

      {/* Contract Info (Read-only) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Nombre</span>
          <p className="font-medium text-gray-900 dark:text-white">{contract.name}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Símbolo</span>
          <p className="font-medium text-gray-900 dark:text-white">{contract.symbol}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Supply</span>
          <p className="font-medium text-gray-900 dark:text-white">
            {contract.supply.toLocaleString()}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center mb-4">
            <SafeIcon icon={FiFileText} className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Documentos del Smart Contract
            </h4>
          </div>
          <div className="space-y-6">
            {documentTypes.map((docType) => (
              <motion.div
                key={docType.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DocumentUploader
                  label={docType.label}
                  value={documents[docType.key]}
                  onUpload={(fileInfo) => handleDocumentUpload(docType.key, fileInfo)}
                  disabled={isSubmitting}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
          <p>
            Los documentos se almacenan en IPFS de forma descentralizada y segura. 
            Una vez subidos, estarán disponibles para los inversionistas del smart contract.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>Guardar Documentos</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SmartContractEditForm;