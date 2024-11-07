"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowUpLeftSquare } from "lucide-react";
import Link from "next/link";

const db = getFirestore();

const ProfilePage = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isSignedIn && user) {
        try {
          const userDocRef = doc(db, "Users", user.id);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isLoaded) {
      fetchUserData();
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link href={"/dashboard"}>
            <ArrowLeft></ArrowLeft>
          </Link>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profileImageUrl} alt={user.fullName} />
              <AvatarFallback>
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user.fullName}</h2>
              <p className="text-sm text-gray-500">
                {user.primaryEmailAddress.emailAddress}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Role:</span>
              <Badge
                variant={userData?.mentor ? "default" : "secondary"}
                className="ml-2"
              >
                {userData?.mentor ? "Mentor" : "Student"}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Member since:
              </span>
              <span className="ml-2">{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
