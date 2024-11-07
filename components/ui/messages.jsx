"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const db = getFirestore();

export default function Messages() {
  const { user } = useUser();
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMentors = async () => {
      const mentorsCollection = collection(db, "Users");
      const mentorSnapshot = await getDocs(
        query(mentorsCollection, where("mentor", "==", true))
      );
      const mentorList = mentorSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMentors(mentorList);
    };

    fetchMentors();
  }, []);

  useEffect(() => {
    if (selectedMentor && user) {
      const messagesRef = collection(db, "Messages");
      const q = query(
        messagesRef,
        where("participants", "array-contains", user.id),
        where("participants", "array-contains", selectedMentor.id),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messageList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messageList);
      });

      return () => unsubscribe();
    }
  }, [selectedMentor, user]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedMentor && user) {
      await addDoc(collection(db, "Messages"), {
        text: newMessage,
        sender: user.id,
        receiver: selectedMentor.id,
        participants: [user.id, selectedMentor.id],
        timestamp: new Date(),
      });
      setNewMessage("");
    }
  };

  const filteredMentors = mentors.filter((mentor) =>
    mentor.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r p-4">
        <Input
          type="text"
          placeholder="Search mentors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="h-[calc(100vh-200px)]">
          {filteredMentors.map((mentor) => (
            <Card
              key={mentor.id}
              className={`mb-2 cursor-pointer ${
                selectedMentor?.id === mentor.id ? "bg-secondary" : ""
              }`}
              onClick={() => setSelectedMentor(mentor)}
            >
              <CardHeader className="p-4">
                <div className="flex items-center">
                  <Avatar className="mr-2">
                    <AvatarImage
                      src={mentor.Profilephotourl}
                      alt={mentor.Name}
                    />
                    <AvatarFallback>{mentor.Name[0]}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-sm">{mentor.Name}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          ))}
        </ScrollArea>
      </div>
      <div className="w-2/3 p-4 flex flex-col">
        {selectedMentor ? (
          <>
            <CardTitle className="mb-4">{selectedMentor.Name}</CardTitle>
            <ScrollArea className="flex-grow mb-4">
              {messages.map((message) => (
                <Card
                  key={message.id}
                  className={`mb-2 ${
                    message.sender === user.id ? "ml-auto" : "mr-auto"
                  }`}
                >
                  <CardContent className="p-2">
                    <p>{message.text}</p>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
            <div className="flex">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow mr-2"
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">
            Select a mentor to start chatting
          </p>
        )}
      </div>
    </div>
  );
}
