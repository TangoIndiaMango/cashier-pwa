// src/components/ProductSearch.tsx
import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { LocalProduct } from '../lib/db/schema';
import { Search } from 'lucide-react';

interface ProductSearchProps {
  onProductSelect: (product: LocalProduct) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({ onProductSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<LocalProduct[]>([]);
  const { products, loading } = useStore('cm3a1f1r70000hhftj988qyww');

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchTerm))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  return (
    <div className="w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
        <input
          type="text"
          className="w-full py-2 pl-10 pr-4 border rounded-lg"
          placeholder="Search by name, SKU, or barcode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div className="mt-4 text-center">Loading products...</div>
      ) : (
        <div className="mt-2">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="p-4 border-b cursor-pointer hover:bg-gray-50"
              onClick={() => onProductSelect(product)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${product.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                    Stock: {product.currentQuantity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};