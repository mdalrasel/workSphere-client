import CheckoutForm from '../../components/CheckoutForm';
import useAuth from '../../hooks/useAuth'; 

const PaymentPage = () => {
    const { user } = useAuth();

    const amountToPay = 50.00; 
    const currentOrderId = "ORDER_XYZ_123"; 

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">Make Payment</h2>
            <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-8">
                You are about to pay for Order ID: <strong>{currentOrderId}</strong>. Amount: <strong>${amountToPay.toFixed(2)}</strong>.
            </p>
            
            <CheckoutForm 
                orderAmount={amountToPay} 
                orderId={currentOrderId} 
                userId={user?.uid} 
            />
        </div>
    );
};

export default PaymentPage;