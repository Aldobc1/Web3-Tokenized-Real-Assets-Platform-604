// En el componente AdminUsers, actualizamos las importaciones y el ícono
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiUsers,     // Para total users
  FiShield,    // Para admins
  FiBriefcase, // Para operators (briefcase icon as requested)
  FiUser,      // Para tokenizers (person icon)
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSave,
  FiX
} = FiIcons;

// El resto del componente AdminUsers se mantiene igual, 
// pero ahora usa FiBriefcase para operadores donde antes usaba otro ícono