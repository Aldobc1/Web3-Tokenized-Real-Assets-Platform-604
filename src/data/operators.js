import supabase from '../lib/supabase';

// Fetch operators from Supabase
export const fetchOperators = async () => {
  try {
    const { data, error } = await supabase
      .from('operators_mt2024')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching operators:', error);
      throw error;
    }

    return data.map(operator => ({
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
      location: operator.location,
      created_at: operator.created_at,
      updated_at: operator.updated_at
    }));
  } catch (error) {
    console.error('Error in fetchOperators:', error);
    return [];
  }
};

export const getOperators = async () => {
  try {
    return await fetchOperators();
  } catch (error) {
    console.error('Error in getOperators:', error);
    return [];
  }
};

export const getOperatorById = async (id) => {
  try {
    if (!id) return null;
    
    const { data, error } = await supabase
      .from('operators_mt2024')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching operator:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getOperatorById:', error);
    return null;
  }
};

// Add new operator
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
        location: operatorData.location,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding operator:', error);
    throw error;
  }
};

// Update existing operator
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

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating operator:', error);
    throw error;
  }
};

// Delete operator
export const deleteOperator = async (id) => {
  try {
    const { error } = await supabase
      .from('operators_mt2024')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting operator:', error);
    throw error;
  }
};