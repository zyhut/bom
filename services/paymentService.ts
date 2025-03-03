import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { STRIPE_PUBLIC_KEY, STRIPE_BACKEND_URL } from '../services/constants';

export const processPayment = async (amount: number): Promise<boolean> => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  try {
    // Call backend to create a payment intent
    const response = await fetch(STRIPE_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    const { paymentIntent, ephemeralKey, customer } = await response.json();

    // Initialize Stripe Payment Sheet
    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: paymentIntent,
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      merchantDisplayName: 'BetOnMyself',
    });

    if (initError) throw new Error(initError.message);

    // Show Stripe Payment Sheet
    const { error: paymentError } = await presentPaymentSheet();

    if (paymentError) throw new Error(paymentError.message);

    return true; // Payment successful!
  } catch (err) {
    console.error('Stripe Payment Error:', err);
    return false;
  }
};
