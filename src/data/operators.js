import supabase from '../lib/supabase';

// Local fallback data
const localOperators = [
  {
    id: 1,
    name: 'Heavy Equipment Solutions',
    nameEn: 'Heavy Equipment Solutions',
    email: 'contact@heavyequipment.com',
    phone: '+1 (555) 123-4567',
    company: 'Heavy Equipment Solutions LLC',
    experience: '15 años',
    experienceEn: '15 years',
    specialization: 'Maquinaria Industrial',
    specializationEn: 'Industrial Machinery',
    description: 'Especialistas en equipos pesados con más de 15 años de experiencia en el mercado.',
    descriptionEn: 'Heavy equipment specialists with over 15 years of market experience.',
    projects: '200+ proyectos',
    projectsEn: '200+ projects'
  },
  {
    id: 2,
    name: 'Miami Properties LLC',
    nameEn: 'Miami Properties LLC',
    email: 'info@miamiproperties.com',
    phone: '+1 (555) 987-6543',
    company: 'Miami Properties LLC',
    experience: '10 años',
    experienceEn: '10 years',
    specialization: 'Propiedades Vacacionales',
    specializationEn: 'Vacation Properties',
    description: 'Gestión profesional de propiedades vacacionales en Miami Beach.',
    descriptionEn: 'Professional vacation property management in Miami Beach.',
    properties: '50+ propiedades',
    propertiesEn: '50+ properties'
  },
  {
    id: 3,
    name: 'Sweet Dreams Corp',
    nameEn: 'Sweet Dreams Corp',
    email: 'hello@sweetdreams.com',
    phone: '+1 (555) 456-7890',
    company: 'Sweet Dreams Corporation',
    experience: '8 años',
    experienceEn: '8 years',
    specialization: 'Negocios Gastronómicos',
    specializationEn: 'Food & Beverage Business',
    description: 'Operadores especializados en negocios gastronómicos y heladerías.',
    descriptionEn: 'Operators specialized in food & beverage businesses and ice cream shops.',
    locations: '3 sucursales',
    locationsEn: '3 locations'
  }
];

let operatorsCache = null;

// Fetch operators from Supabase
export const fetchOperators = async () => {
  try {
    const { data, error } = await supabase
      .from('operators_mt2024')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching operators:', error);
      return localOperators;
    }

    // Transform Supabase data to match our format
    const transformedOperators = data.map(operator => ({
      id: operator.id,
      name: operator.name,
      nameEn: operator.name_en,
      email: operator.email,
      phone: operator.phone,
      company: operator.company,
      experience: operator.experience,
      experienceEn: operator.experience_en,
      specialization: operator.specialization,
      specializationEn: operator.specialization_en,
      description: operator.description,
      descriptionEn: operator.description_en
    }));

    operatorsCache = transformedOperators;
    return transformedOperators;
  } catch (error) {
    console.error('Error in fetchOperators:', error);
    return localOperators;
  }
};

export const getOperators = async () => {
  if (operatorsCache) return operatorsCache;
  return await fetchOperators();
};

export const getOperatorById = async (id) => {
  const operators = await getOperators();
  return operators.find(operator => operator.id === parseInt(id));
};

export const getAllOperators = () => {
  return getOperators();
};

export const addOperator = async (operatorData) => {
  try {
    const { data, error } = await supabase
      .from('operators_mt2024')
      .insert([{
        name: operatorData.name,
        name_en: operatorData.nameEn,
        email: operatorData.email,
        phone: operatorData.phone,
        company: operatorData.company,
        experience: operatorData.experience,
        experience_en: operatorData.experienceEn,
        specialization: operatorData.specialization,
        specialization_en: operatorData.specializationEn,
        description: operatorData.description,
        description_en: operatorData.descriptionEn
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding operator:', error);
      return null;
    }

    // Clear cache to force refresh
    operatorsCache = null;
    return data;
  } catch (error) {
    console.error('Error in addOperator:', error);
    return null;
  }
};

export const updateOperator = async (id, operatorData) => {
  try {
    const { data, error } = await supabase
      .from('operators_mt2024')
      .update({
        name: operatorData.name,
        name_en: operatorData.nameEn,
        email: operatorData.email,
        phone: operatorData.phone,
        company: operatorData.company,
        experience: operatorData.experience,
        experience_en: operatorData.experienceEn,
        specialization: operatorData.specialization,
        specialization_en: operatorData.specializationEn,
        description: operatorData.description,
        description_en: operatorData.descriptionEn,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating operator:', error);
      return null;
    }

    // Clear cache to force refresh
    operatorsCache = null;
    return data;
  } catch (error) {
    console.error('Error in updateOperator:', error);
    return null;
  }
};

export const deleteOperator = async (id) => {
  try {
    const { error } = await supabase
      .from('operators_mt2024')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting operator:', error);
      return false;
    }

    // Clear cache to force refresh
    operatorsCache = null;
    return true;
  } catch (error) {
    console.error('Error in deleteOperator:', error);
    return false;
  }
};