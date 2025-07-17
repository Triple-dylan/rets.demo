'use client';

import React from 'react';

interface UnderwritingData {
  propertyId: string;
  address: string;
  price: number;
  capRate: number;
  cash_flow: number;
  roi: number;
  [key: string]: any;
}

interface UnderwritingChartProps {
  data: UnderwritingData;
  onDownload?: () => void;
}

export default function UnderwritingChart({ data, onDownload }: UnderwritingChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Underwriting Analysis
        </h3>
        <p className="text-sm text-gray-600">{data.address}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Purchase Price</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(data.price)}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Cap Rate</div>
          <div className="text-lg font-semibold text-green-600">
            {formatPercentage(data.capRate)}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Cash Flow</div>
          <div className="text-lg font-semibold text-blue-600">
            {formatCurrency(data.cash_flow || 0)}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">ROI</div>
          <div className="text-lg font-semibold text-purple-600">
            {formatPercentage(data.roi || 0)}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Key Metrics</h4>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Gross Rental Income</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(data.gross_rental_income || 0)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Operating Expenses</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(data.operating_expenses || 0)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Net Operating Income</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(data.noi || 0)}
            </span>
          </div>
        </div>
      </div>

      {onDownload && (
        <div className="flex justify-end">
          <button
            onClick={onDownload}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Download Report
          </button>
        </div>
      )}
    </div>
  );
}