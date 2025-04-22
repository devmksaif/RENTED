import ProductCard from "./ProductCard"
import "../styles/ProductList.css"

function ProductList({ products, onAddToCart }) {
  return (
    <div className="product-list">
      {products.length > 0 ? (
        products.map((product) => <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} />)
      ) : (
        <div className="no-products">
          <div className="no-products-icon">
            <i className="fas fa-search"></i>
          </div>
          <div className="no-products-text">No products found matching your criteria</div>
          <div className="no-products-subtext">Try adjusting your filters or search for something else</div>
        </div>
      )}
    </div>
  )
}

export default ProductList
