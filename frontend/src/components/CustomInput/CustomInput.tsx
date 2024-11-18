import React from 'react';
import './CustomInput.css';

interface CustomInputProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; 
}

const CustomInput: React.FC<CustomInputProps> = ({ placeholder, value, onChange, type = 'text', onKeyDown  }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className="custom-input"
    />
  );
};

export default CustomInput;
