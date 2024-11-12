// src/components/StorePage.tsx
import { useStore } from '../hooks/useStore';

export function StorePage({ storeId }: { storeId: string }) {
  const { products, loading, error, createTransaction } = useStore(storeId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleSale = async (items: any[]) => {
    try {
      await createTransaction({
        totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        items
      });
    } catch (err) {
      console.error('Sale failed:', err);
    }
  };

  return (
    <div>
      <h1>Store Products</h1>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            <p>In Stock: {product.currentQuantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}