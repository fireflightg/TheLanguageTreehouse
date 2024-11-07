"use client";

import * as React from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/pages/_app"; // Adjust path as necessary
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const db = getFirestore();

const subjects = [
  "Math",
  "Science",
  "History",
  "English",
  "Art",
  "Music",
  "Physical Education",
];
const languages = [
  "English",
  "Spanish",
  "Somali",
  "Nepali",
  "Arabic",
  "Chinese",
  "French",
];

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [step, setStep] = React.useState(1);
  const [verifying, setVerifying] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [role, setRole] = React.useState("student");
  const [error, setError] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    name: "",
    availability: {
      days: [],
      startTime: "",
      endTime: "",
    },
    languages: [],
    subjects: [],
    bio: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleAvailabilityChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: { ...prev.availability, [field]: value },
    }));
  };

  const handleDaySelect = (selectedDays) => {
    if (selectedDays) {
      setFormData((prev) => ({
        ...prev,
        availability: { ...prev.availability, days: selectedDays },
      }));
    }
  };

  const handleNext = () => setStep((prev) => prev + 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    if (!isLoaded) return;

    try {
      // Clerk sign-up
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        fullname: formData.name,
      });

      // Firebase Authentication sign-up
      const firebaseUserCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Send verification email through Clerk
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError("An error occurred during sign-up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });

        // Use Clerk userId as Firestore document ID
        await setDoc(doc(db, "Users", signUpAttempt.createdUserId), {
          Name: formData.name,
          Email: formData.email,
          Profilephotourl: "",
          Availability: formData.availability,
          Langs: formData.languages,
          Subjects: formData.subjects,
          backgroundcheck: false,
          requestinghelpfrom: [],
          classroomcode: null,
          mentor: role === "mentor" ? true : false,
          bio: formData.bio,
        });

        router.push("/");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
        setError("Verification failed. Please try again.");
      }
    } catch (err) {
      console.error("Error:", JSON.stringify(err, null, 2));
      setError("An error occurred during verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Verify your email
            </CardTitle>
            <CardDescription className="text-center">
              We've sent a verification code to your email. Please enter it
              below.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleVerify}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  value={code}
                  id="code"
                  name="code"
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter your 6-digit code"
                  required
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify and Complete Sign Up"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {step === 1 ? "Sign up" : `Step ${step} of 5`}
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <RadioGroup
                defaultValue="student"
                onValueChange={(value) => setRole(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mentor" id="mentor" />
                  <Label htmlFor="mentor">Mentor</Label>
                </div>
              </RadioGroup>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
            </>
          )}

          {step === 2 && (
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
          )}

          {step === 3 && role === "mentor" && (
            <>
              <Label>Days Available</Label>
              <Calendar
                mode="multiple"
                selected={formData.availability.days}
                onSelect={handleDaySelect}
                className="rounded-md border"
              />
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.availability.startTime}
                onChange={(e) =>
                  handleAvailabilityChange("startTime", e.target.value)
                }
                required
              />
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.availability.endTime}
                onChange={(e) =>
                  handleAvailabilityChange("endTime", e.target.value)
                }
                required
              />
            </>
          )}

          {step === 4 && (
            <>
              <Label>Languages</Label>
              {languages.map((language) => (
                <div
                  key={language}
                  className="flex items-center space-x-2 mt-2"
                >
                  <Checkbox
                    id={language}
                    checked={formData.languages.includes(language)}
                    onCheckedChange={() =>
                      handleCheckboxChange("languages", language)
                    }
                  />
                  <Label htmlFor={language}>{language}</Label>
                </div>
              ))}
              {role === "mentor" && (
                <>
                  <Label>Subject Matter Expertise</Label>
                  {subjects.map((subject) => (
                    <div
                      key={subject}
                      className="flex items-center space-x-2 mt-2"
                    >
                      <Checkbox
                        id={subject}
                        checked={formData.subjects.includes(subject)}
                        onCheckedChange={() =>
                          handleCheckboxChange("subjects", subject)
                        }
                      />
                      <Label htmlFor={subject}>{subject}</Label>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {step === 5 && (
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                placeholder={
                  role === "mentor"
                    ? "Tell us about yourself and your teaching experience..."
                    : "Tell us about yourself and what you're looking to learn..."
                }
                required
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between">
            {step > 1 && (
              <Button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                variant="outline"
              >
                Back
              </Button>
            )}
            {step < 5 ? (
              <Button type="button" onClick={handleNext} className="ml-auto">
                Next
              </Button>
            ) : (
              <Button type="submit" className="ml-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
