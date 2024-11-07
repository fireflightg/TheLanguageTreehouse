"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, Loader2 } from "lucide-react";

export default function SignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/"); // Redirect to the landing page after successful sign-in
      } else {
        console.error("Sign-in failed", result);
        setError(
          "Sign-in failed. Please check your credentials and try again."
        );
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.errors?.[0]?.message || "An error occurred during sign-in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
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
            <Link className="flex items-center justify-center" href="/">
              <GraduationCap className="h-6 w-6 mr-2" />
              <span className="font-bold text-xl">The Language Treehouse</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
              <div className="text-sm text-center">
                Don't have an account?{" "}
                <Link
                  href="/sign-up"
                  className="text-[#7857FF] hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
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
