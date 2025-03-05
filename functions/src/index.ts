/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions/v2/https"; // ✅ Use v2 syntax
import * as admin from "firebase-admin";
import {defineSecret} from "firebase-functions/params"; // ✅ Use v2 secrets
import Stripe from "stripe";
import express, {Request, Response} from "express";
import cors from "cors";
import {log, error} from "firebase-functions/logger";
import rateLimit from "express-rate-limit";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY"); // ✅ Store secret

const app = express();
app.set("trust proxy", 1);
app.use(cors({origin: true}));
app.use(express.json());

// Rate Limiting: Max 5 requests per user per 10 minutes
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {error: "Too many requests, please try again later."},
});
app.use(limiter);

app.post("/create-payment-intent", async (req: Request, res: Response) => {
  try {
    log("🔥 Received payment request:", req.body);
    const authHeader = req.headers.authorization || "";
    const token =
      authHeader.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;

    if (!token) {
      error("❌ No token provided");
      return res.status(401).send({error: "Unauthorized: No token provided"});
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    log("Authenticated User:", decodedToken.uid);

    const stripe =
      new Stripe(STRIPE_SECRET_KEY.value(), {apiVersion: "2025-02-24.acacia"});

    const {amount} = req.body;
    if (!amount || typeof amount !== "number") {
      error("❌ Invalid amount received:", amount);
      return res.status(400).send({error: "Invalid amount provided"});
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
    });
    log("✅ Payment Intent Created:", paymentIntent.id);

    return res.json({clientSecret: paymentIntent.client_secret});
  } catch (err) {
    error("Error creating payment intent:", err);
    return res.
      status(500)
      .send({error: err instanceof Error ?
        err.message : "Unknown error occurred."});
  }
});

export const api = functions.onRequest(
  {secrets: ["STRIPE_SECRET_KEY"], cors: true},
  (req, res) => app(req, res)
);
