import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  color: string;
  isActive: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, color, isActive }) => {
  const [isVisible, setIsVisible] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true); 
    } else {
      setTimeout(() => setIsVisible(false), 200); 
    }
  }, [isActive]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        color,
        position: 'fixed',
        top: '20px',  
        right: '20px',
        padding: '10px',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 9999,
        opacity: isActive ? 1 : 0, 
        transition: 'opacity 0.3s ease-in-out', 
        fontSize: '2.5vh'
      }}
    >
      {message}
    </div>
  );
};

export default Toast;
