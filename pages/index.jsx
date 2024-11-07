"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, ChevronDown, Play, Menu, Loader2 } from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const db = getFirestore();

export default function LandingPage() {
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Banner */}
      <div className="w-full bg-black text-white px-4 py-2 text-sm text-center">
        <span className="inline-flex items-center">
          The Language Treehouse raises funding to help more students learn
          <Link href="#" className="ml-2 text-white hover:text-gray-200">
            Read more →
          </Link>
        </span>
      </div>

      {/* Navigation */}
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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div className="container mx-auto px-4 py-24 relative">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                The most comprehensive
                <br />
                Language Learning Platform
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                {userRole === "Mentor" || (!isSignedIn && isMentor)
                  ? "Empower students by sharing your language skills. Join our platform to make a difference in elementary education."
                  : "Need more than just tutoring? The Language Treehouse is a complete suite of tools, flexible scheduling, and mentor matching to help elementary students succeed."}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                  className="bg-[#7857FF] hover:bg-[#6544FF] text-white px-8 h-12"
                  onClick={handleGetStarted}
                >
                  {userRole === "Mentor" || (!isSignedIn && isMentor)
                    ? "Start mentoring"
                    : "Start learning"}{" "}
                  for free
                </Button>
                <Button variant="ghost" className="h-12">
                  <Play className="h-4 w-4 mr-2" />
                  Watch demo
                  <span className="ml-2 text-gray-500">2 min</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-16">
            <p className="text-sm text-gray-600 text-center mb-8">
              All the Languages we support
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-60">
              {languages.map((language, i) => (
                <div
                  key={i}
                  className="h-10 w-24 text-center flex items-center justify-center bg-gray-200 rounded"
                >
                  <span>{language}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block rounded-full bg-[#7857FF]/10 px-4 py-1.5 text-sm font-medium text-[#7857FF]">
                  Smart Matching
                </div>
                <h2 className="text-4xl font-bold tracking-tight">
                  {userRole === "Mentor" || (!isSignedIn && isMentor)
                    ? "Connect with students"
                    : "Find your perfect mentor"}
                  <br />
                  in minutes
                </h2>
                <p className="text-gray-600">
                  {userRole === "Mentor" || (!isSignedIn && isMentor)
                    ? "Set your language skills, subjects, and availability. Our platform automatically matches you with students who need your expertise."
                    : "Simply add your language preferences and subject needs. Our platform automatically matches you with qualified mentors who speak your language and can help with your subjects."}
                </p>
              </div>
              <div className="bg-gray-100 rounded-xl p-8 aspect-square" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 The Language Treehouse. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                className="text-sm text-gray-600 hover:text-gray-900"
                href="#"
              >
                Privacy
              </Link>
              <Link
                className="text-sm text-gray-600 hover:text-gray-900"
                href="#"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
