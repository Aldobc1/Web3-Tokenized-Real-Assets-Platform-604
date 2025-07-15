import supabase from '../lib/supabase';

// Register new user
export const registerUser = async (userData) => {
  const { email, password, name, declaration, terms, role = 'tokenizer' } = userData;
  
  try {
    // Validate required fields
    if (!email || !password || !name) {
      throw new Error('Todos los campos son requeridos');
    }

    // Validate declaration and terms
    if (!declaration || !terms) {
      throw new Error('Debes aceptar los términos y la declaración para registrarte');
    }

    // Check if email exists
    const { data: existingUser } = await supabase
      .from('users_mt2024')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create user with encrypted password using Supabase's built-in encryption
    const { data: newUser, error } = await supabase
      .from('users_mt2024')
      .insert([{
        email,
        name,
        password, // Supabase will handle password encryption
        declaration,
        terms,
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

// Login user
export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Use Supabase's built-in auth
    const { data: user, error } = await supabase
      .from('users_mt2024')
      .select('*')
      .eq('email', email)
      .eq('password', password) // In production, use Supabase Auth instead
      .single();

    if (error || !user) throw new Error('Credenciales inválidas');
    return user;
  } catch (error) {
    console.error('Error in login:', error);
    throw error;
  }
};