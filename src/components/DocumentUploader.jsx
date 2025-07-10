import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUpload, FiFile, FiCheck, FiTrash2 } = FiIcons;

const DocumentUploader = ({ 
  label, 
  onUpload, 
  value = null, 
  disabled = false,
  documentType = 'general'
}) => {
  const [file, setFile] = useState(value);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Simulate IPFS upload
      // In a real implementation, this would upload to IPFS
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a fake IPFS hash
      const fakeIpfsHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const fileInfo = {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        ipfsHash: fakeIpfsHash,
        url: `https://ipfs.io/ipfs/${fakeIpfsHash}`,
        documentType: documentType
      };

      setFile(fileInfo);
      if (onUpload) onUpload(fileInfo);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo. Por favor intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    if (onUpload) onUpload(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      
      {!file ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div className="flex flex-col items-center justify-center py-4">
            <SafeIcon icon={FiUpload} className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
              {uploading ? 'Subiendo documento...' : 'Arrastra un archivo o haz clic para seleccionar'}
            </p>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled || uploading}
              id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label
              htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              className={`px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors text-sm cursor-pointer flex items-center gap-1 ${
                (disabled || uploading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiUpload} className="w-4 h-4" />
                  <span>Seleccionar Archivo</span>
                </>
              )}
            </label>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-3">
                <SafeIcon icon={FiFile} className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {file.name || 'Documento subido'}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {file.size ? formatFileSize(file.size) : 'Archivo subido a IPFS'}
                  </span>
                  <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <SafeIcon icon={FiCheck} className="w-3 h-3 mr-1" />
                    <span className="text-xs">Subido a IPFS</span>
                  </div>
                </div>
              </div>
            </div>
            {!disabled && (
              <button
                onClick={handleRemove}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;