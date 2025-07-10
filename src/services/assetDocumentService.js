import supabase from '../lib/supabase';

// Get documents for an asset
export const getAssetDocuments = async (assetId) => {
  try {
    const { data, error } = await supabase
      .from('asset_documents_mt2024')
      .select('*')
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching asset documents:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAssetDocuments:', error);
    throw error;
  }
};

// Add or update a document for an asset
export const saveAssetDocument = async (assetId, documentData) => {
  try {
    const { data, error } = await supabase
      .from('asset_documents_mt2024')
      .upsert([{
        asset_id: assetId,
        document_type: documentData.documentType,
        document_name: documentData.name,
        ipfs_hash: documentData.ipfsHash,
        ipfs_url: documentData.url,
        file_size: documentData.size,
        file_type: documentData.type,
        uploaded_by: documentData.uploadedBy || 'system',
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'asset_id,document_type'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving asset document:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveAssetDocument:', error);
    throw error;
  }
};

// Delete a document
export const deleteAssetDocument = async (assetId, documentType) => {
  try {
    const { error } = await supabase
      .from('asset_documents_mt2024')
      .delete()
      .eq('asset_id', assetId)
      .eq('document_type', documentType);

    if (error) {
      console.error('Error deleting asset document:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAssetDocument:', error);
    throw error;
  }
};

// Get documents by type for an asset
export const getAssetDocumentsByType = async (assetId) => {
  try {
    const documents = await getAssetDocuments(assetId);
    const documentsByType = {};
    
    documents.forEach(doc => {
      documentsByType[doc.document_type] = {
        name: doc.document_name,
        url: doc.ipfs_url,
        ipfsHash: doc.ipfs_hash,
        size: doc.file_size,
        type: doc.file_type,
        uploadedAt: doc.created_at
      };
    });
    
    return documentsByType;
  } catch (error) {
    console.error('Error in getAssetDocumentsByType:', error);
    return {};
  }
};