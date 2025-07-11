import supabase from '../lib/supabase';

// Simplified password handling without bcrypt
const hashPassword = async (password) => {
  // Simple hash for frontend (NOT FOR PRODUCTION)
  return btoa(password + 'salt123');
};

const verifyPassword = async (password, hashedPassword) => {
  // Simple verification (NOT FOR PRODUCTION)
  return btoa(password + 'salt123') === hashedPassword;
};

export const registerUser = async (userData) => {
  const { email, password, name, role = 'tokenizer' } = userData;
  try {
    // Check if email exists
    const { data: existingUser } = await supabase
      .from('users_mt2024')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create user with basic hashed password
    const password_hash = await hashPassword(password);

    const { data: newUser, error } = await supabase
      .from('users_mt2024')
      .insert([{
        email,
        name,
        password_hash,
        role,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return newUser;
  } catch (error) {
    console.error('Error in registration:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const { data: user, error } = await supabase
      .from('users_mt2024')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) throw new Error('Invalid credentials');

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) throw new Error('Invalid credentials');

    return user;
  } catch (error) {
    console.error('Error in login:', error);
    throw error;
  }
};

export const updateUserPassword = async (userId, newPassword) => {
  try {
    const password_hash = await hashPassword(newPassword);
    const { data, error } = await supabase
      .from('users_mt2024')
      .update({
        password_hash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};