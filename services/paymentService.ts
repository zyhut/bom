import { useStripe } from '@stripe/stripe-react-native';
import { auth } from "../services/firebaseConfig";
import { STRIPE_BACKEND_URL } from './keys';

export const getClientSecret = async (amount: number): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    const token = user ? await user.getIdToken() : null;
    const response = await fetch(`${STRIPE_BACKEND_URL}/api/create-payment-intent`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.statusText}`);
    }

    const { clientSecret } = await response.json();
    console.log("✅ Received Client Secret:", clientSecret);
    return clientSecret;
  } catch (err) {
    console.error("❌ Error fetching client secret:", err);
    return null;
  }
};

export const processPayment = async (
    clientSecret: string,
    initPaymentSheet: (params: any) => Promise<any>,
    presentPaymentSheet: () => Promise<any>
  ): Promise<boolean> => {
  
  try {
    console.log("⚡ Calling initPaymentSheet...");

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'BetOnMyself',
      googlePay: true,
      applePay: true,
      allowsDelayedPaymentMethods: true,
      testEnv: true,
    });

    if (initError) {
      console.error("❌ Stripe Init Error:", initError);
      throw new Error(initError.message);
    }

    const { error: paymentError } = await presentPaymentSheet();

    if (paymentError) {
      console.error("❌ Payment Sheet Error:", paymentError);
      throw new Error(paymentError.message);
    }

    console.log("✅ Payment Successful!");
    return true;
  } catch (err) {
    console.error("🔥 Stripe Payment Error:", err);
    return false;
  }
};