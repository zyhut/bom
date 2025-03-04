/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions/v2/https"; // ✅ Use v2 syntax
import {defineSecret} from "firebase-functions/params"; // ✅ Use v2 secrets
import Stripe from "stripe";
import express, {Request, Response} from "express";
import cors from "cors";

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY"); // ✅ Store secret

const app = express();
app.use(cors({origin: true}));
app.use(express.json());

app.post("/create-payment-intent", async (req: Request, res: Response) => {
  try {
    const stripe =
      new Stripe(STRIPE_SECRET_KEY.value(), {apiVersion: "2025-02-24.acacia"});

    const {amount} = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
    });

    res.json({clientSecret: paymentIntent.client_secret});
  } catch (error) {
    res
      .status(500)
      .send({
        error: error instanceof Error ?
          error.message : "Unknown error occurred."});
  }
});

export const api = functions.onRequest({secrets: ["STRIPE_SECRET_KEY"]}, app);
