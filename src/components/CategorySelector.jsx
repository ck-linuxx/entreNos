import React from 'react';
import {
  FiShoppingCart,
  FiTruck,
  FiHome,
  FiHeart,
  FiActivity,
  FiMoreHorizontal,
  FiDollarSign,
  FiBook
} from 'react-icons/fi';

const CategorySelector = ({ value, onChange, name = 'category', className = '' }) => {
  const categories = [
    { value: 'Alimentação', label: 'Alimentação', icon: FiShoppingCart, color: 'bg-green-100 text-green-700 border-green-300', selectedColor: 'bg-green-500 text-white border-green-600' },
    { value: 'Transporte', label: 'Transporte', icon: FiTruck, color: 'bg-blue-100 text-blue-700 border-blue-300', selectedColor: 'bg-blue-500 text-white border-blue-600' },
    { value: 'Moradia', label: 'Moradia', icon: FiHome, color: 'bg-yellow-100 text-yellow-700 border-yellow-300', selectedColor: 'bg-yellow-500 text-white border-yellow-600' },
    { value: 'Lazer', label: 'Lazer', icon: FiHeart, color: 'bg-purple-100 text-purple-700 border-purple-300', selectedColor: 'bg-purple-500 text-white border-purple-600' },
    { value: 'Saúde', label: 'Saúde', icon: FiActivity, color: 'bg-red-100 text-red-700 border-red-300', selectedColor: 'bg-red-500 text-white border-red-600' },
    { value: 'Educação', label: 'Educação', icon: FiBook, color: 'bg-indigo-100 text-indigo-700 border-indigo-300', selectedColor: 'bg-indigo-500 text-white border-indigo-600' },
    { value: 'Investimentos', label: 'Investimentos', icon: FiDollarSign, color: 'bg-emerald-100 text-emerald-700 border-emerald-300', selectedColor: 'bg-emerald-500 text-white border-emerald-600' },
    { value: 'Outros', label: 'Outros', icon: FiMoreHorizontal, color: 'bg-gray-100 text-gray-700 border-gray-300', selectedColor: 'bg-gray-500 text-white border-gray-600' }
  ];

  const handleCategoryClick = (categoryValue) => {
    // Simular um evento de mudança para manter compatibilidade com o handleInputChange
    const syntheticEvent = {
      target: {
        name: name,
        value: categoryValue
      }
    };
    onChange(syntheticEvent);
  };

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-4 gap-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = value === category.value;

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => handleCategoryClick(category.value)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full h-18 min-h-[72px]
                ${isSelected ? category.selectedColor + ' shadow-lg' : category.color + ' hover:shadow-sm'}
              `}
            >
              <IconComponent size={20} className="mb-1" />
              <span className="text-[9px] font-semibold text-center leading-tight">
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;