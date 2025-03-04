import { useStripe } from '@stripe/stripe-react-native';
import { STRIPE_BACKEND_URL } from './keys';

export const getClientSecret = async (amount: number): Promise<string | null> => {
  try {
    const response = await fetch(`${STRIPE_BACKEND_URL}/api/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.statusText}`);
    }

    const { clientSecret } = await response.json();
    return clientSecret;
  } catch (err) {
    console.error('Error fetching client secret:', err);
    return null;
  }
};

export const processPayment = async (clientSecret: string): Promise<boolean> => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  try {
    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'BetOnMyself',
    });

    if (initError) {
      console.error('Stripe Init Error:', initError);
      throw new Error(initError.message);
    }

    const { error: paymentError } = await presentPaymentSheet();

    if (paymentError) {
      console.error('Payment Sheet Error:', paymentError);
      throw new Error(paymentError.message);
    }

    return true;
  } catch (err) {
    console.error('Stripe Payment Error:', err);
    return false;
  }
};
