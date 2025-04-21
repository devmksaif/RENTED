export function PaymentDetails() {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Payment Details</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Payment Method</span>
          <div className="flex items-center">
            <span className="mr-2">VISA</span>
            <span className="text-gray-500">#3634</span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
              Paid
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Subtotal</span>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">2 items</span>
            <span className="font-medium">$7,508.02</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Shipping Type</span>
          <div className="text-right">
            <p>The customer selected Free shipping</p>
            <p className="text-gray-500">($0.00) at checkout</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Shipping Fee</span>
          <span className="font-medium">$20.00</span>
        </div>
      </div>
    </div>
  )
}
