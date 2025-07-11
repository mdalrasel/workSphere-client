import  { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import Swal from 'sweetalert2';

const CheckoutForm = ({ orderAmount, employeeName, employeeEmail, onPaymentSuccess, onPaymentError }) => { 
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setMessage(null);

        // 1. Call elements.submit() to validate and collect payment data
        const { error: submitError } = await elements.submit();

        if (submitError) {
            console.error("elements.submit() error:", submitError);
            setMessage(submitError.message);
            Swal.fire({
                icon: "error",
                title: "Payment Error!",
                text: submitError.message,
                background: '#fff',
                color: '#1f2937'
            });
            setIsLoading(false);
            return;
        }

        // 2. Confirm the payment with Stripe
        const { error: confirmPaymentError, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard/payroll`,
                
                payment_method_data: {
                    billing_details: {
                        name: employeeName || 'N/A', 
                        email: employeeEmail || 'N/A', 
                        phone: '000-000-0000', 
                        address: { 
                            country: 'US', 
                            postal_code: '12345', 
                            state: 'CA', 
                            city: 'Anytown', 
                            line1: '123 Main St',
                            line2: '', 
                        },
                    },
                },
            },
            redirect: 'if_required'
        });

        if (confirmPaymentError) {
            if (confirmPaymentError.type === "card_error" || confirmPaymentError.type === "validation_error") {
                setMessage(confirmPaymentError.message);
            } else {
                setMessage("An unexpected error occurred.");
            }
            console.error("Stripe confirmPayment error:", confirmPaymentError);
            Swal.fire({
                icon: "error",
                title: "Payment Failed!",
                text: confirmPaymentError.message || "An unexpected error occurred. Please try again.",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
            onPaymentError(confirmPaymentError.message || "Payment failed.");
        } else {
            console.log("Payment Intent confirmed:", paymentIntent);
            setMessage("Payment successful!");
            Swal.fire({
                icon: "success",
                title: "Payment Successful!",
                text: `Transaction ID: ${paymentIntent.id}`,
                showConfirmButton: false,
                timer: 2000,
                background: '#fff',
                color: '#1f2937'
            });
            onPaymentSuccess(paymentIntent.id);
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white max-w-md mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-center">Complete Your Payment</h3>
            
            <PaymentElement 
                id="payment-element" 
                className="mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded-md" 
                options={{
                    fields: {
                        billingDetails: 'never', // Hides billing details like name, email, address, phone
                    },
                    wallets: {
                        link: 'never', // Hides the "Link" payment option
                    },
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    },
                }}
            />

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span id="button-text">
                    {isLoading ? "Processing..." : `Pay $${orderAmount?.toFixed(2) || '0.00'}`}
                </span>
            </button>
            {message && <div id="payment-message" className={`mt-4 text-center ${message.includes("successful") ? "text-green-500" : "text-red-500"}`}>{message}</div>}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                Note: This payment simulation uses Stripe test mode. Use a test card number (e.g., 4242...4242) for testing.
            </p>
        </form>
    );
};

export default CheckoutForm;
