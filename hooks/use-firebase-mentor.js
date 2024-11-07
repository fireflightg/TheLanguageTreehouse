import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { config } from "../config/firebase.jsx";

// Initialize Firebase (you should replace this with your actual Firebase config)

const app = initializeApp(config);
const db = getFirestore(app);

export function useFirebaseMentor() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveMentor = async (userId, mentorData) => {
    setIsLoading(true);
    setError(null);
    try {
      await setDoc(doc(db, "mentors", userId), mentorData);
    } catch (e) {
      setError("Failed to save mentor data");
      console.error("Error saving mentor data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return { saveMentor, isLoading, error };
}
