# C'Meet It (CMIT) 🎯

Welcome to **C'Meet It** — an app that helps you stay committed to your goals with a unique commitment-based system!

---

## 🛠️ Tech Stack

- **React Native** (via Expo)
- **Firebase** (Auth, Firestore, Functions)
- **Stripe** (Goal commitment payments)
- **Zustand** (Global state management)
- **react-native-paper** (Theming & UI components)
- **Lottie** (Celebration animations)
- **date-fns** (Date utilities)

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/zyhut/bom.git
cd bom/bom-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the app

```bash
npx expo start
```

You’ll be able to open the app in:

- 📱 Expo Go
- 📱 iOS Simulator
- 📱 Android Emulator
- 🧪 Development Build

---

## 🧠 Project Structure

- `/app` – all your screens, components, and routes
- `/components` – shared UI components
- `/utils` – utility functions (e.g., date formatting, validation)
- `/constants` – theming and color tokens
- `/firebase` – Firebase-related setup
- `/functions` – backend cloud functions

---

## ✅ Features

- Goal creation with flexible options (standard or commitment-based)
- Check-in system to track daily goal progress
- Celebration for completed goals 🎉
- Penalty handling and payment processing for failed goals
- Responsive, mobile-friendly UI with custom theming
- Animations for key user moments

---

## 💡 Dev Tips

- Use the `GoalActionUtils.ts` for goal check-in logic
- Shared UI lives in `/components/themed`
- Environment variables are managed via `.env` (not committed)

---

## 🔐 Environment Setup

Make sure to create a `.env` file with your Firebase and Stripe keys:

```
STRIPE_PUBLISHABLE_KEY=your_key
FIREBASE_API_KEY=your_key
...
```

---

## 👥 Community & Support

- [Expo Discord](https://chat.expo.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Stripe Docs](https://stripe.com/docs)

---

## 📜 License

MIT