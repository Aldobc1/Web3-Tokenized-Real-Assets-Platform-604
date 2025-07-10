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
    profile_image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8YnVzaW5lc3MlMjBwZXJzb258ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
    location: 'Miami, FL'
  }
];

// Cache for operators data
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
      descriptionEn: operator.description_en,
      profile_image: operator.profile_image,
      location: operator.location
    }));

    operatorsCache = transformedOperators;
    return transformedOperators;
  } catch (error) {
    console.error('Error in fetchOperators:', error);
    return localOperators;
  }
};

export const getOperators = async () => {
  // Always fetch fresh data from Supabase
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
        description_en: operatorData.descriptionEn,
        profile_image: operatorData.profile_image,
        location: operatorData.location
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding operator:', error);
      throw error;
    }

    // Clear cache to force refresh
    operatorsCache = null;
    return data;
  } catch (error) {
    console.error('Error in addOperator:', error);
    throw error;
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
        profile_image: operatorData.profile_image,
        location: operatorData.location,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating operator:', error);
      throw error;
    }

    // Clear cache to force refresh
    operatorsCache = null;
    return data;
  } catch (error) {
    console.error('Error in updateOperator:', error);
    throw error;
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
      throw error;
    }

    // Clear cache to force refresh
    operatorsCache = null;
    return true;
  } catch (error) {
    console.error('Error in deleteOperator:', error);
    throw error;
  }
};

// Get average rating for an operator
export const getOperatorAverageRating = async (operatorId) => {
  try {
    const { data, error } = await supabase
      .from('operator_ratings_mt2024')
      .select('rating')
      .eq('operator_id', operatorId);

    if (error) {
      console.error('Error fetching operator ratings:', error);
      return 0;
    }

    if (!data || data.length === 0) return 0;

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return parseFloat((sum / data.length).toFixed(1));
  } catch (error) {
    console.error('Error in getOperatorAverageRating:', error);
    return 0;
  }
};