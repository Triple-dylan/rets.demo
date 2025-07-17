import { NextRequest, NextResponse } from 'next/server';

// Mock property data matching the screenshots
const MOCK_PROPERTIES = [
  {
    id: 1,
    image: "/api/placeholder/300/200",
    price: "$6,950,000",
    address: "1052 E Thomas St",
    location: "Seattle, WA 98102",
    details: "29-unit apartment • 5.07% cap rate",
    capRate: "5.07%"
  },
  {
    id: 2,
    image: "/api/placeholder/300/200",
    price: "$7,200,000",
    address: "603 Pontius Ave N",
    location: "Seattle, WA 98109",
    details: "30-unit apartment • 5.00% cap rate",
    capRate: "5.00%"
  },
  {
    id: 3,
    image: "/api/placeholder/300/200",
    price: "$6,950,000",
    address: "7060 Lincoln Park Way SW",
    location: "Seattle, WA 98136",
    details: "23-unit apartment • 4.53% cap rate",
    capRate: "4.53%"
  },
  {
    id: 4,
    image: "/api/placeholder/300/200",
    price: "$4,750,000",
    address: "4270 NE 50th St",
    location: "Seattle, WA 98105",
    details: "8-unit apartment • 3.77% cap rate",
    capRate: "3.77%"
  },
  {
    id: 5,
    image: "/api/placeholder/300/200",
    price: "$5,200,000",
    address: "213 1st Ave S",
    location: "Seattle, WA 98104",
    details: "13-unit apartment • 5.49% cap rate",
    capRate: "5.49%"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters for filtering
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const bedrooms = searchParams.get('bedrooms');
    const propertyType = searchParams.get('property_type');
    
    let properties = [...MOCK_PROPERTIES];
    
    // Apply filters (simplified for demo)
    if (minPrice) {
      const min = parseInt(minPrice);
      properties = properties.filter(p => {
        const price = parseInt(p.price.replace(/[$,]/g, ''));
        return price >= min;
      });
    }
    
    if (maxPrice) {
      const max = parseInt(maxPrice);
      properties = properties.filter(p => {
        const price = parseInt(p.price.replace(/[$,]/g, ''));
        return price <= max;
      });
    }
    
    return NextResponse.json(properties);
    
  } catch (error) {
    console.error('Properties API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}