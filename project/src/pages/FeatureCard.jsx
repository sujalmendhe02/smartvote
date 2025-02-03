import React from 'react';

const FeatureCard = ({ icon, title, description, className }) => (
  <div className="relative">
    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-white p-2 font-bold">
      {icon}
    </div>
    <p className={`ml-16 text-lg leading-6 font-medium ${className}`}>{title}</p>
    <p className={`mt-2 ml-16 text-base ${className} text-gray-400`}>
      {description}
    </p>
  </div>
);

export default FeatureCard;
