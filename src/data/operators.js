export const operators = [
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

export const getOperatorById = (id) => {
  return operators.find(operator => operator.id === parseInt(id));
};

export const getAllOperators = () => {
  return operators;
};

export const addOperator = (operatorData) => {
  const newOperator = {
    ...operatorData,
    id: Math.max(...operators.map(op => op.id)) + 1
  };
  operators.push(newOperator);
  return newOperator;
};

export const updateOperator = (id, operatorData) => {
  const index = operators.findIndex(op => op.id === parseInt(id));
  if (index !== -1) {
    operators[index] = { ...operators[index], ...operatorData };
    return operators[index];
  }
  return null;
};

export const deleteOperator = (id) => {
  const index = operators.findIndex(op => op.id === parseInt(id));
  if (index !== -1) {
    operators.splice(index, 1);
    return true;
  }
  return false;
};