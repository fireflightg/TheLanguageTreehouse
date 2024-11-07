import "@/styles/globals.css";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { config } from "../config/firebase.jsx";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const app = initializeApp(config);
export const auth = getAuth(app);

const clerkFrontendApi = process.env.NEXT_PLUBLIC_API_URL;
const clerkSigninUrl = "/sign-in";

console.log("Redirecting to sign in: " + clerkSigninUrl);
const publicPages = [
  "/",
  "/landing",
  "/about",
  "/forgot-password",
  "/reset-password",
  "/sign-up",
  "/sign-in",
  "/sign-in/[[...index]]",
  "/sign-up/[[...index]]",
  "/terms-of-service",
  "/privacy-policy",
];

// Uses use effect to move the user to the us
function RedirectToSignIn() {
  useEffect(() => {
    window.location = clerkSigninUrl;
  });
  return null;
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      frontendApi={clerkFrontendApi}
      naviate={(to) => router.push(to)}
    >
      {publicPages.includes(router.pathname) ? (
        <Component {...pageProps} />
      ) : (
        <>
          <SignedIn>
            <Component {...pageProps} />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      )}
    </ClerkProvider>
  );
}
