"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Check,
  ChevronDown,
  GraduationCap,
  Heart,
  Loader2,
  Menu,
} from "lucide-react";
import Link from "next/link";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useUser, useAuth } from "@clerk/clerk-react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const db = getFirestore();

const PricingPage = () => {
  const [isMentor, setIsMentor] = useState(false);
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const languages = [
    "Spanish",
    "French",
    "Somali",
    "Arabic",
    "Nepali",
    "Russian",
    "Viet",
  ];

  useEffect(() => {
    const fetchUserRole = async () => {
      if (isSignedIn && user) {
        setIsLoading(true);
        try {
          console.log("Clerk user info:", user);

          const usersCollection = collection(db, "Users");
          const q = query(usersCollection, where("userId", "==", user.id));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            console.log("Firebase user info:", userData);
            setUserRole(userData.mentor ? "Mentor" : "Student");

            // Redirect to dashboard if user is already signed in
            router.push("/dashboard");
          } else {
            console.warn("User document not found in Firebase");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    if (isLoaded) {
      fetchUserRole();
    }
  }, [isSignedIn, user, isLoaded, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      router.push("/sign-up");
    }
  };

  const [isYearly, setIsYearly] = useState(false);

  const tiers = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "For all teachers, students, and parents",
      features: [
        "Access to all learning materials",
        "Unlimited mentor matching",
        "Community forum access",
        "All languages supported",
        "Basic progress tracking",
      ],
      cta: "Get Started",
      mostPopular: true,
    },
    {
      name: "Supporter",
      price: { monthly: 9.99, yearly: 99.99 },
      description: "For those who can contribute to our mission",
      features: [
        "All Free features",
        "Free perk from sponsors",
        "Early access to new features",
        "Supporter badge on profile",
        "Quarterly impact reports",
      ],
      cta: "Become a Supporter",
      mostPopular: false,
    },
    {
      name: "Enterprise",
      price: { monthly: "Custom", yearly: "Custom" },
      description: "For organizations looking to make a bigger impact",
      features: [
        "All Supporter features",
        "Custom integrations",
        "Dedicated account manager",
        "Bulk user management",
        "Advanced analytics and reporting",
        "Co-branded learning materials",
        "Direct support for underserved communities",
      ],
      cta: "Contact Us",
      mostPopular: false,
    },
  ];

  return (
    <>
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link className="flex items-center justify-center" href="/">
                <GraduationCap className="h-6 w-6 mr-2" />
                <span className="font-bold text-xl">
                  The Language Treehouse
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <Link className="text-sm font-medium" href="#">
                    About Us
                  </Link>
                  <ChevronDown className="h-4 w-4" />
                </div>
                <Link className="text-sm font-medium" href="#">
                  Docs
                </Link>
                <Link className="text-sm font-medium" href="/pricing">
                  Pricing
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isSignedIn ? (
                <>
                  <span className="text-sm font-medium">{userRole}</span>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-red-500"
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <div className="hidden sm:flex items-center space-x-2">
                    <div
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7857FF] focus:ring-offset-2 cursor-pointer"
                      onClick={() => setIsMentor(!isMentor)}
                      role="switch"
                      aria-checked={isMentor}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                          isMentor ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {isMentor ? "Mentor" : "Student"}
                    </span>
                  </div>
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm">
                      Sign in
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="bg-[#7857FF] hover:bg-[#6544FF] text-white"
                    onClick={handleGetStarted}
                  >
                    Get started →
                  </Button>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              Pricing
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Support our mission of accessible education
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
            LanguageTreehouse is committed to providing free, high-quality
            language education. Your support helps us reach more learners and
            improve our platform.
          </p>
          <div className="mt-16 flex justify-center">
            <div className="flex items-center gap-x-3">
              <span
                className={`text-sm ${
                  isYearly ? "text-gray-500" : "font-semibold text-gray-900"
                }`}
              >
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="bg-indigo-600"
              />
              <span
                className={`text-sm ${
                  isYearly ? "font-semibold text-gray-900" : "text-gray-500"
                }`}
              >
                Yearly (Save 17%)
              </span>
            </div>
          </div>
          <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-3xl p-8 ring-1 ring-gray-200 ${
                  tier.mostPopular
                    ? "bg-indigo-600 ring-indigo-600"
                    : "bg-white"
                }`}
              >
                <h3
                  className={`text-2xl font-bold tracking-tight ${
                    tier.mostPopular ? "text-white" : "text-gray-900"
                  }`}
                >
                  {tier.name}
                </h3>
                {tier.mostPopular && (
                  <p className="mt-4 text-sm font-semibold text-white">
                    Empowering learners worldwide
                  </p>
                )}
                <p
                  className={`mt-6 flex items-baseline gap-x-1 ${
                    tier.mostPopular ? "text-white" : "text-gray-900"
                  }`}
                >
                  <span className="text-4xl font-bold tracking-tight">
                    {typeof tier.price[isYearly ? "yearly" : "monthly"] ===
                    "number"
                      ? `$${tier.price[isYearly ? "yearly" : "monthly"]}`
                      : tier.price[isYearly ? "yearly" : "monthly"]}
                  </span>
                  {typeof tier.price[isYearly ? "yearly" : "monthly"] ===
                    "number" && (
                    <span className="text-sm font-semibold leading-6">
                      {isYearly ? "/year" : "/month"}
                    </span>
                  )}
                </p>
                <p
                  className={`mt-4 text-sm leading-6 ${
                    tier.mostPopular ? "text-indigo-100" : "text-gray-600"
                  }`}
                >
                  {tier.description}
                </p>
                <ul
                  className={`mt-8 space-y-3 text-sm leading-6 ${
                    tier.mostPopular ? "text-indigo-100" : "text-gray-600"
                  }`}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check
                        className={`h-6 w-5 flex-none ${
                          tier.mostPopular ? "text-white" : "text-indigo-600"
                        }`}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-8 block w-full ${
                    tier.mostPopular
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  }`}
                >
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-16 flex justify-center items-center text-gray-600">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            <p className="text-sm">
              100% of Enterprise and Supporter contributions go towards
              providing free education to underserved communities.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingPage;
