import supabase from '../lib/supabase';

// Local fallback data
const localAssets = [
  {
    id: 1,
    name: 'Retroexcavadora CAT 320',
    nameEn: 'CAT 320 Excavator',
    type: 'equipment',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop',
    projectedReturn: 12.5,
    available: 65,
    sold: 35,
    tokenPrice: 100,
    operatorId: 1,
    operator: 'Heavy Equipment Solutions',
    operatorEn: 'Heavy Equipment Solutions',
    description: 'Retroexcavadora CAT 320 en excelente estado, utilizada para proyectos de construcción en Miami. Genera ingresos constantes a través de contratos de alquiler.',
    descriptionEn: 'CAT 320 excavator in excellent condition, used for construction projects in Miami. Generates consistent income through rental contracts.',
    documents: [
      { name: 'Título de Propiedad', nameEn: 'Property Title', url: '#' },
      { name: 'Certificado de Mantenimiento', nameEn: 'Maintenance Certificate', url: '#' },
      { name: 'Contrato de Alquiler', nameEn: 'Rental Contract', url: '#' }
    ],
    operatorData: {
      name: 'Heavy Equipment Solutions',
      experience: '15 años',
      experienceEn: '15 years',
      projects: '200+ proyectos',
      projectsEn: '200+ projects'
    }
  },
  {
    id: 2,
    name: 'Edificio Miami Beach',
    nameEn: 'Miami Beach Building',
    type: 'airbnb',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
    projectedReturn: 8.2,
    available: 45,
    sold: 55,
    tokenPrice: 500,
    operatorId: 2,
    operator: 'Miami Properties LLC',
    operatorEn: 'Miami Properties LLC',
    description: 'Edificio de apartamentos en Miami Beach con alta demanda turística. Propiedad completamente amoblada y equipada para Airbnb.',
    descriptionEn: 'Apartment building in Miami Beach with high tourist demand. Fully furnished and equipped property for Airbnb.',
    documents: [
      { name: 'Escritura', nameEn: 'Deed', url: '#' },
      { name: 'Licencia Turística', nameEn: 'Tourist License', url: '#' },
      { name: 'Estados Financieros', nameEn: 'Financial Statements', url: '#' }
    ],
    operatorData: {
      name: 'Miami Properties LLC',
      experience: '10 años',
      experienceEn: '10 years',
      properties: '50+ propiedades',
      propertiesEn: '50+ properties'
    }
  },
  {
    id: 3,
    name: 'Heladería Artesanal',
    nameEn: 'Artisan Ice Cream Shop',
    type: 'business',
    image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=800&h=600&fit=crop',
    projectedReturn: 15.8,
    available: 30,
    sold: 70,
    tokenPrice: 250,
    operatorId: 3,
    operator: 'Sweet Dreams Corp',
    operatorEn: 'Sweet Dreams Corp',
    description: 'Heladería artesanal establecida con clientela fiel y ubicación privilegiada en el centro de la ciudad.',
    descriptionEn: 'Established artisan ice cream shop with loyal clientele and prime downtown location.',
    documents: [
      { name: 'Licencia Comercial', nameEn: 'Business License', url: '#' },
      { name: 'Estados Financieros', nameEn: 'Financial Statements', url: '#' },
      { name: 'Contrato de Arrendamiento', nameEn: 'Lease Agreement', url: '#' }
    ],
    operatorData: {
      name: 'Sweet Dreams Corp',
      experience: '8 años',
      experienceEn: '8 years',
      locations: '3 sucursales',
      locationsEn: '3 locations'
    }
  }
];

let assetsCache = null;

// Fetch assets from Supabase
export const fetchAssets = async () => {
  try {
    const { data, error } = await supabase
      .from('assets_mt2024')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assets:', error);
      return localAssets;
    }

    // Transform Supabase data to match our format
    const transformedAssets = data.map(asset => ({
      id: asset.id,
      name: asset.name,
      nameEn: asset.name_en,
      type: asset.type,
      image: asset.image,
      projectedReturn: parseFloat(asset.projected_return),
      available: asset.available,
      sold: asset.sold,
      tokenPrice: asset.token_price,
      operatorId: asset.operator_id,
      operator: asset.operator,
      operatorEn: asset.operator_en,
      description: asset.description,
      descriptionEn: asset.description_en,
      documents: [
        { name: 'Documentos', nameEn: 'Documents', url: '#' }
      ],
      operatorData: {
        name: asset.operator,
        experience: '10+ años',
        experienceEn: '10+ years'
      }
    }));

    assetsCache = transformedAssets;
    return transformedAssets;
  } catch (error) {
    console.error('Error in fetchAssets:', error);
    return localAssets;
  }
};

export const getAssets = async () => {
  if (assetsCache) return assetsCache;
  return await fetchAssets();
};

export const getAssetById = async (id) => {
  const assets = await getAssets();
  return assets.find(asset => asset.id === parseInt(id));
};

export const getAssetsByType = async (type) => {
  const assets = await getAssets();
  if (type === 'all') return assets;
  return assets.filter(asset => asset.type === type);
};

export const getFeaturedAssets = async () => {
  const assets = await getAssets();
  return assets.slice(0, 3);
};

export const addAsset = async (assetData) => {
  try {
    const { data, error } = await supabase
      .from('assets_mt2024')
      .insert([{
        name: assetData.name,
        name_en: assetData.nameEn,
        type: assetData.type,
        image: assetData.image,
        projected_return: assetData.projectedReturn,
        available: assetData.available,
        sold: assetData.sold,
        token_price: assetData.tokenPrice,
        operator_id: assetData.operatorId,
        operator: assetData.operator,
        operator_en: assetData.operatorEn,
        description: assetData.description,
        description_en: assetData.descriptionEn
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding asset:', error);
      return null;
    }

    // Clear cache to force refresh
    assetsCache = null;
    return data;
  } catch (error) {
    console.error('Error in addAsset:', error);
    return null;
  }
};

export const updateAsset = async (id, assetData) => {
  try {
    const { data, error } = await supabase
      .from('assets_mt2024')
      .update({
        name: assetData.name,
        name_en: assetData.nameEn,
        type: assetData.type,
        image: assetData.image,
        projected_return: assetData.projectedReturn,
        available: assetData.available,
        sold: assetData.sold,
        token_price: assetData.tokenPrice,
        operator_id: assetData.operatorId,
        operator: assetData.operator,
        operator_en: assetData.operatorEn,
        description: assetData.description,
        description_en: assetData.descriptionEn,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating asset:', error);
      return null;
    }

    // Clear cache to force refresh
    assetsCache = null;
    return data;
  } catch (error) {
    console.error('Error in updateAsset:', error);
    return null;
  }
};

export const deleteAsset = async (id) => {
  try {
    const { error } = await supabase
      .from('assets_mt2024')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting asset:', error);
      return false;
    }

    // Clear cache to force refresh
    assetsCache = null;
    return true;
  } catch (error) {
    console.error('Error in deleteAsset:', error);
    return false;
  }
};