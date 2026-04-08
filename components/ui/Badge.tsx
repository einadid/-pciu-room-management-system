import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'free' | 'occupied' | 'lab' | 'classroom' | 'special' | 'default';
  className?: string;
}

export default function Badge({ 
  children, 
  variant = 'default', 
  className = '' 
}: BadgeProps) {
  const variants = {
    free: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    lab: 'bg-purple-100 text-purple-800',
    classroom: 'bg-blue-100 text-blue-800',
    special: 'bg-yellow-100 text-yellow-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}