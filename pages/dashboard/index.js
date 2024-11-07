"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  Settings,
  Home,
  MessageSquare,
  Calendar as CalendarIcon,
  ChevronsUpDown,
  ChevronRight,
  Clock,
  BookOpen,
  Video,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Messages from "@/components/ui/messages";
import { ScrollArea } from "@radix-ui/react-scroll-area";

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

// Mock video data (replace with actual data from your database)
const videoLibrary = [
  {
    id: 1,
    title: "Introduction to Algebra",
    subject: "Math",
    language: "English",
    url: "https://example.com/video1",
  },
  {
    id: 2,
    title: "Basic Spanish Phrases",
    subject: "Language",
    language: "Spanish",
    url: "https://example.com/video2",
  },
  {
    id: 3,
    title: "World War II Overview",
    subject: "History",
    language: "English",
    url: "/ww2.mp4",
  },
  {
    id: 4,
    title: "Photosynthesis Explained",
    subject: "Science",
    language: "English",
    url: "https://example.com/video4",
  },
  {
    id: 5,
    title: "Intermediate French Grammar",
    subject: "Language",
    language: "French",
    url: "https://example.com/video5",
  },
];

export default function UniversalDashboard() {
  const router = useRouter();
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [searchDate, setSearchDate] = useState(new Date());
  const [searchTime, setSearchTime] = useState("");
  const [searchSubjects, setSearchSubjects] = useState([]);
  const [searchLanguages, setSearchLanguages] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [sessionDate, setSessionDate] = useState(new Date());
  const [sessionTime, setSessionTime] = useState("");
  const [isMentor, setIsMentor] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState([]);
  const [filterMentors, setFilteredMentors] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [availability, setAvailability] = useState({
    days: [],
    startTime: "",
    endTime: "",
  });
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] =
    useState(false);
  const [teachingSchedule, setTeachingSchedule] = useState([]);
  const [videoSearch, setVideoSearch] = useState("");
  const [filteredVideos, setFilteredVideos] = useState(videoLibrary);

  const { user, isLoaded } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.primaryEmailAddress) {
        console.log("User:", user);
        console.log("User ID:", user.id);
        const usersCollection = collection(db, "Users");
        const userQuery = query(
          usersCollection,
          where("Email", "==", user.primaryEmailAddress.emailAddress)
        );

        try {
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            console.log("User Data:", userData);
            setIsMentor(userData.mentor || false);
            if (userData.mentor) {
              setAvailability(
                userData.Availability || {
                  days: [],
                  startTime: "",
                  endTime: "",
                }
              );
              fetchTeachingSchedule(userSnapshot.docs[0].id);
            }
          } else {
            console.log("No user document found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

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
      setFilteredMentors(mentorList);
    };

    const fetchUpcomingSessions = async () => {
      if (user) {
        const sessionsCollection = collection(db, "Sessions");
        const sessionSnapshot = await getDocs(
          query(sessionsCollection, where("studentId", "==", user.id))
        );
        const sessionList = sessionSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUpcomingSessions(sessionList);
      }
    };

    if (isLoaded) {
      fetchUserData();
      fetchMentors();
      fetchUpcomingSessions();
    }
  }, [user, isLoaded]);
  useEffect(() => {
    // Filter mentors based on searchTerm
    const filtered = mentors.filter((mentor) =>
      mentor.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMentors(filtered);
  }, [searchTerm, mentors]);

  const fetchTeachingSchedule = async (mentorId) => {
    const sessionsCollection = collection(db, "Sessions");
    const sessionSnapshot = await getDocs(
      query(sessionsCollection, where("mentorId", "==", mentorId))
    );
    const sessionList = sessionSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTeachingSchedule(sessionList);
  };

  const handleMentorClick = (mentor) => {
    setSelectedMentor(mentor);
  };

  const handleScheduleSession = async () => {
    if (selectedMentor && user) {
      const sessionData = {
        mentorId: selectedMentor.id,
        studentId: user.id,
        mentorName: selectedMentor.Name,
        studentName: `${user.firstName} ${user.lastName}`,
        date: Timestamp.fromDate(sessionDate),
        time: sessionTime,
        completed: false,
      };

      console.log("Session data to be added:", sessionData);

      try {
        const docRef = await addDoc(collection(db, "Sessions"), sessionData);
        console.log("Document written with ID: ", docRef.id);
        setUpcomingSessions([
          ...upcomingSessions,
          { id: docRef.id, ...sessionData },
        ]);
        setSelectedMentor(null);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    } else {
      console.error("Selected mentor or user is not defined");
    }
  };

  const handleCompleteSession = async (sessionId) => {
    const sessionRef = doc(db, "Sessions", sessionId);
    await updateDoc(sessionRef, { completed: true });

    console.log(`Sending feedback email for session ${sessionId}`);

    setUpcomingSessions(
      upcomingSessions.map((session) =>
        session.id === sessionId ? { ...session, completed: true } : session
      )
    );
  };

  const handleUpdateAvailability = async () => {
    if (user && isMentor) {
      const userRef = doc(db, "Users", user.id);
      await updateDoc(userRef, { Availability: availability });
      setIsAvailabilityDialogOpen(false);
    }
  };

  const formatDate = (date) => {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    } else if (date instanceof Date) {
      return date.toLocaleDateString();
    } else if (typeof date === "string") {
      return new Date(date).toLocaleDateString();
    }
    return "Invalid Date";
  };

  const filteredMentors = mentors.filter((mentor) => {
    const dateMatch = mentor.Availability.days.some(
      (day) =>
        new Date(day.seconds * 1000).toDateString() ===
        searchDate.toDateString()
    );
    const timeMatch =
      !searchTime ||
      (mentor.Availability.startTime <= searchTime &&
        mentor.Availability.endTime >= searchTime);
    const subjectMatch =
      searchSubjects.length === 0 ||
      searchSubjects.some((subject) => mentor.Subjects.includes(subject));
    const languageMatch =
      searchLanguages.length === 0 ||
      searchLanguages.some((language) => mentor.Langs.includes(language));

    return dateMatch && timeMatch && subjectMatch && languageMatch;
  });

  const handleVideoSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setVideoSearch(searchTerm);
    const filtered = videoLibrary.filter(
      (video) =>
        video.title.toLowerCase().includes(searchTerm) ||
        video.subject.toLowerCase().includes(searchTerm) ||
        video.language.toLowerCase().includes(searchTerm)
    );
    setFilteredVideos(filtered);
  };
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

  //   useEffect(() => {
  //     if (selectedMentor && user) {
  //       const messagesRef = collection(db, "Messages");
  //       const q = query(
  //         messagesRef,
  //         where("participants", "array-contains", user.id),
  //         where("participants", "array-contains", selectedMentor.id),
  //         orderBy("timestamp", "asc")
  //       );

  //       const unsubscribe = onSnapshot(q, (snapshot) => {
  //         const messageList = snapshot.docs.map((doc) => ({
  //           id: doc.id,
  //           ...doc.data(),
  //         }));
  //         setMessages(messageList);
  //       });

  //       return () => unsubscribe();
  //     }
  //   }, [selectedMentor, user]);

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

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar>
          <SidebarHeader className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <Link
                  href={"/"}
                  className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                >
                  <GraduationCap className="size-4" />
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveTab("home")}>
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveTab("upcoming")}>
                      <Clock className="mr-2 h-4 w-4" />
                      Upcoming
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {isMentor && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setActiveTab("schedule")}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Teaching Schedule
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveTab("video-library")}
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Video Library
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveTab("messages")}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsSettingsOpen(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => router.push("/profile")}>
                  <Avatar className="mr-2 h-6 w-6">
                    <AvatarImage
                      src={user?.imageUrl}
                      alt={`${user?.firstName} ${user?.lastName}`}
                    />
                    <AvatarFallback>{user?.fullName}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className=" inline-flex overflow-y-auto p-8">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold">Dashboard</h1>
              <SidebarTrigger />
            </div>

            {isMentor && (
              <div className="mb-8">
                <Button onClick={() => setIsAvailabilityDialogOpen(true)}>
                  Update Availability
                </Button>
              </div>
            )}

            {activeTab === "messages" && (
              <div className=" bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Messages</h2>
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
                      {filterMentors.map((mentor) => (
                        <Card
                          key={mentor.id}
                          className={`mb-2 cursor-pointer ${
                            selectedMentor?.id === mentor.id
                              ? "bg-secondary"
                              : ""
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
                                <AvatarFallback>
                                  {mentor.Name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <CardTitle className="text-sm">
                                {mentor.Name}
                              </CardTitle>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </ScrollArea>
                  </div>
                  <div className="w-2/3 p-4 flex flex-col">
                    {selectedMentor ? (
                      <>
                        <CardTitle className="mb-4">
                          {selectedMentor.Name}
                        </CardTitle>
                        <ScrollArea className="flex-grow mb-4">
                          {messages.map((message) => (
                            <Card
                              key={message.id}
                              className={`mb-2 ${
                                message.sender === user.id
                                  ? "ml-auto"
                                  : "mr-auto"
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
              </div>
            )}

            {activeTab === "home" && (
              <>
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    Search Mentors
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label className="mb-2 block">Date</Label>
                      <Calendar
                        mode="single"
                        selected={searchDate}
                        onSelect={(date) => setSearchDate(date)}
                        className="rounded-md border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="searchTime" className="mb-2 block">
                        Time
                      </Label>
                      <Input
                        id="searchTime"
                        type="time"
                        value={searchTime}
                        onChange={(e) => setSearchTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Subjects</Label>
                      <Select
                        value={searchSubjects.join(",")}
                        onValueChange={(value) =>
                          setSearchSubjects(value ? value.split(",") : [])
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select subjects" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-2  block">Languages</Label>
                      <Select
                        value={searchLanguages.join(",")}
                        onValueChange={(value) =>
                          setSearchLanguages(value ? value.split(",") : [])
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select languages" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((language) => (
                            <SelectItem key={language} value={language}>
                              {language}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Languages</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Availability</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMentors.map((mentor) => (
                        <TableRow
                          key={mentor.id}
                          onClick={() => handleMentorClick(mentor)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            {mentor.Name}
                          </TableCell>
                          <TableCell>{mentor.Langs.join(", ")}</TableCell>
                          <TableCell>{mentor.Subjects.join(", ")}</TableCell>
                          <TableCell>
                            {mentor.Availability.days.length > 0
                              ? `${mentor.Availability.days.length} days, ${mentor.Availability.startTime} - ${mentor.Availability.endTime}`
                              : "Not set"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            {activeTab === "upcoming" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Upcoming Sessions
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mentor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.mentorName}</TableCell>
                        <TableCell>{formatDate(session.date)}</TableCell>
                        <TableCell>{session.time}</TableCell>
                        <TableCell>
                          {session.completed ? "Completed" : "Upcoming"}
                        </TableCell>
                        <TableCell>
                          {!session.completed && (
                            <Button
                              onClick={() => handleCompleteSession(session.id)}
                            >
                              Mark as Complete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeTab === "schedule" && isMentor && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Teaching Schedule
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachingSchedule.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.studentName}</TableCell>
                        <TableCell>{formatDate(session.date)}</TableCell>
                        <TableCell>{session.time}</TableCell>
                        <TableCell>
                          {session.completed ? "Completed" : "Upcoming"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeTab === "video-library" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Video Library</h2>
                <div className="mb-4">
                  <Label htmlFor="videoSearch" className="mb-2 block">
                    Search Videos
                  </Label>
                  <div className="relative">
                    <Input
                      id="videoSearch"
                      type="text"
                      placeholder="Search by title, subject, or language"
                      value={videoSearch}
                      onChange={handleVideoSearch}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVideos.map((video) => (
                    <Card key={video.id}>
                      <CardHeader>
                        <CardTitle>{video.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>
                          <strong>Subject:</strong> {video.subject}
                        </p>
                        <p>
                          <strong>Language:</strong> {video.language}
                        </p>
                        <Button
                          className="mt-2"
                          onClick={() => window.open(video.url, "_blank")}
                        >
                          Watch Video
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedMentor && (
              <Dialog
                open={!!selectedMentor}
                onOpenChange={() => setSelectedMentor(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{selectedMentor.Name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={selectedMentor.Profilephotourl}
                          alt={selectedMentor.Name}
                        />
                        <AvatarFallback>
                          {selectedMentor.Name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedMentor.Name}</p>
                        <p className="text-sm text-gray-500">
                          {selectedMentor.Email}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">Languages</h3>
                      <p>{selectedMentor.Langs.join(", ")}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Subjects</h3>
                      <p>{selectedMentor.Subjects.join(", ")}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Availability</h3>
                      <p>
                        {selectedMentor.Availability.days.length > 0
                          ? `${selectedMentor.Availability.days.length} days, ${selectedMentor.Availability.startTime} - ${selectedMentor.Availability.endTime}`
                          : "Not set"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Schedule Session</h3>
                      <div className="space-y-2">
                        <Label htmlFor="sessionDate">Date</Label>
                        <Calendar
                          mode="single"
                          selected={sessionDate}
                          onSelect={(date) => setSessionDate(date)}
                          className="rounded-md border"
                        />
                        <Label htmlFor="sessionTime">Time</Label>
                        <Input
                          id="sessionTime"
                          type="time"
                          value={sessionTime}
                          onChange={(e) => setSessionTime(e.target.value)}
                        />
                        <Button onClick={handleScheduleSession}>
                          Schedule Session
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.primaryEmailAddress?.emailAddress || ""}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={user?.firstName || ""}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={user?.lastName || ""}
                      readOnly
                    />
                  </div>
                  <Button onClick={() => setIsSettingsOpen(false)}>
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isAvailabilityDialogOpen}
              onOpenChange={setIsAvailabilityDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Availability</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="availabilityDays">Available Days</Label>
                    <Select
                      value={availability.days.join(",")}
                      onValueChange={(value) =>
                        setAvailability({
                          ...availability,
                          days: value ? value.split(",") : [],
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select days" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={availability.startTime}
                      onChange={(e) =>
                        setAvailability({
                          ...availability,
                          startTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={availability.endTime}
                      onChange={(e) =>
                        setAvailability({
                          ...availability,
                          endTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button onClick={handleUpdateAvailability}>
                    Update Availability
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
