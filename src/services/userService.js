import supabase from '../lib/supabase';

export const createUser = async (userData) => {
  try {
    const { name, email, password, role = 'tokenizer' } = userData;

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users_mt2024')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Create new user with password directly (Supabase will handle security)
    const { data, error } = await supabase
      .from('users_mt2024')
      .insert([{
        name,
        email,
        password, // Store password directly in this demo
        role,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const updateData = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      updated_at: new Date().toISOString()
    };

    // Only update password if provided
    if (userData.password) {
      updateData.password = userData.password;
    }

    const { data, error } = await supabase
      .from('users_mt2024')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from('users_mt2024')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users_mt2024')
      .select('*,wallets_mt2024(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};