import Image from "next/image"

export function ProductList() {
  const products = [
    {
      id: 1,
      name: "Macbook Pro 14 Inch 512GB M1 Pro",
      sku: "Mac-1000",
      color: "Grey",
      quantity: 1,
      price: 1659.25,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      name: 'APPLE 32" R6KD Pro Display XDR MWPF2ID/A',
      sku: "Mac-5006",
      color: "Silver",
      quantity: 1,
      price: 5848.77,
      image: "/placeholder.svg?height=80&width=80",
    },
  ]

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Products</h2>
        <div className="flex items-center text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1.5"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          Unfulfilled
        </div>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="ml-4 flex-1">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <span>{product.color}</span>
                <span className="mx-2">•</span>
                <span>Quantity {product.quantity}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-semibold">
                ${product.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-right">
        <button className="text-gray-700 font-medium text-sm">Reserved Item</button>
      </div>
    </div>
  )
}
