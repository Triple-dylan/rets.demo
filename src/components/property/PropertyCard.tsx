'use client';

import React from 'react';
import { Property } from '@/types/property';
import Image from 'next/image';

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
}

export default function PropertyCard({ property, onSelect }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatCapRate = (capRate: number) => {
    return `${capRate.toFixed(2)}% cap rate`;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => onSelect?.(property)}
    >
      {/* Property Image */}
      <div className="relative h-48 bg-gray-200">
        <Image
          src={property.imageUrl}
          alt={property.address}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/api/placeholder/300/200';
          }}
        />
      </div>

      {/* Property Details */}
      <div className="p-4">
        {/* Price */}
        <div className="text-xl font-semibold text-gray-900 mb-2">
          {formatPrice(property.price)}
        </div>

        {/* Address */}
        <div className="text-gray-700 font-medium mb-1">
          {property.address}
        </div>
        <div className="text-gray-500 text-sm mb-3">
          {property.city}, {property.state} {property.zipCode}
        </div>

        {/* Property Info */}
        <div className="text-sm text-gray-600 mb-3">
          {property.units}-unit {property.propertyType} • {formatCapRate(property.capRate)}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 px-3 border border-blue-200 rounded hover:bg-blue-50 transition-colors duration-200">
            View Model
          </button>
          <button className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 px-3 border border-blue-200 rounded hover:bg-blue-50 transition-colors duration-200">
            Abstract OM
          </button>
        </div>
      </div>
    </div>
  );
}