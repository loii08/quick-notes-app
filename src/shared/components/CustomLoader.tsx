import React from 'react';

interface CustomLoaderProps {
  color?: string;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ color = 'black' }) => {
  return (
    <div className="custom-loader">
      <div className="dot" style={{ backgroundColor: color, animationDelay: '0s' }}></div>
      <div className="dot" style={{ backgroundColor: color, animationDelay: '0.2s' }}></div>
      <div className="dot" style={{ backgroundColor: color, animationDelay: '0.4s' }}></div>
    </div>
  );
};

export default CustomLoader;
