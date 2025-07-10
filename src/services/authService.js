import supabase from '../lib/supabase';
import { createHash } from 'crypto';

const hashPassword = (password) => {
  return createHash('sha256').update(password).digest('hex');
};

export const registerUser = async (userData) => {
  const { email, password, name, wallet = null } = userData;
  
  try {
    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from('users_mt2024')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Crear el usuario
    const { data: newUser, error } = await supabase
      .from('users_mt2024')
      .insert([
        {
          email,
          name,
          password_hash: hashPassword(password),
          roles: ['user'],
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Si se proporcionó una wallet, asociarla
    if (wallet) {
      await supabase
        .from('wallets_mt2024')
        .insert([
          {
            user_id: newUser.id,
            wallet_address: wallet,
            created_at: new Date().toISOString()
          }
        ]);
    }

    return newUser;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const { data: user, error } = await supabase
      .from('users_mt2024')
      .select('*')
      .eq('email', email)
      .eq('password_hash', hashPassword(password))
      .single();

    if (error) throw new Error('Credenciales inválidas');
    return user;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};