import React from 'react';
import './CustomInput.css';

interface CustomInputProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({ placeholder, value, onChange, type = 'text' }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="custom-input"
    />
  );
};

export default CustomInput;
