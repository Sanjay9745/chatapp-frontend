"use client";
import SideBar from "@/components/SideBar";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import SERVER_URL from "@/config/SERVER_URL";
import SOCKET_URL from "@/config/SOCKET_URL";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaAlignJustify } from "react-icons/fa";
import { MdDelete, MdDeleteSweep } from "react-icons/md";
import DropdownMenu from "@/components/DropdownMenu";

interface User {
  _id: string;
  name: string;
  email: string;
  is_online: string;
  is_typing: boolean;
  // add other properties as needed
}
interface Messages {
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  updated_at: string;
  // add other properties as needed
}
let token;
let userId: string | null = null;
let userOnSelect: string | null = null;
if (typeof window !== "undefined") {
  token = localStorage.getItem("token");
  userId = localStorage.getItem("userId");
  userOnSelect = localStorage.getItem("selectedUser");
}

const socket = io(`${SOCKET_URL}/chat`, {
  autoConnect: false,
  auth: {
    token: token,
  },
});

function Home() {
  const router = useRouter();
  const [messages, setMessages] = useState<Messages[]>([]);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>(userOnSelect || "");
  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    const checkToken = async () => {
      try {
        if (localStorage.getItem("token")) {
          const res = await axios.get(`${SERVER_URL}/user/protected`, {
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          });
          if (res.status === 200) {
            socket.connect();
            socket.emit("join", { userId: localStorage.getItem("userId") });
            axios
              .post(
                `${SERVER_URL}/user/update`,
                {
                  is_online: "1",
                },
                {
                  headers: {
                    "x-access-token": localStorage.getItem("token"),
                  },
                }
              )
              .then((res) => {
                axios
                  .get(`${SERVER_URL}/user/get-friends`, {
                    headers: {
                      "x-access-token": localStorage.getItem("token"),
                    },
                  })
                  .then((res) => {
                    setUsers(res.data.users);
                    setSelectedUser(selectedUser || res.data.users[0]._id);
                    localStorage.setItem(
                      "selectedUser",
                      selectedUser || res.data.users[0]._id
                    );
                    axios
                      .get(
                        `${SERVER_URL}/user/get-chat/${
                          selectedUser || res.data.users[0]._id
                        }`,
                        {
                          headers: {
                            "x-access-token": localStorage.getItem("token"),
                          },
                        }
                      )
                      .then((response) => {
                        setMessages(response.data.chat);
                      });
                  });
              });
          } else {
            router.replace("/login");
            localStorage.removeItem("token");
          }
        } else {
          router.replace("/login");
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error:", error);
        router.replace("/login");
        localStorage.removeItem("token");
      }
    };

    checkToken();
    // Add event listener for window beforeunload event
    window.addEventListener("beforeunload", () => {
      socket.emit("leave", { userId: localStorage.getItem("userId") });
      socket.disconnect();
    });

    // Add event listener for window offline event
    window.addEventListener("offline", () => {
      if (!navigator.onLine) {
        socket.emit("leave", { userId: localStorage.getItem("userId") });
        socket.disconnect();
      }
    });

    return () => {
      // Remove event listeners when component unmounts
      window.removeEventListener("beforeunload", () => {
        socket.emit("leave", { userId: localStorage.getItem("userId") });
        socket.disconnect();
      });
      window.removeEventListener("offline", () => {
        socket.emit("leave", { userId: localStorage.getItem("userId") });
        socket.disconnect();
      });
    };
  }, []);

  useEffect(() => {
    const handleSetUserOnline = (data: any) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user._id === data) {
            return { ...user, is_online: "1" };
          }
          return user;
        })
      );
    };
    const handleSetUserOffline = (data: any) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user._id === data) {
            return { ...user, is_online: "0" };
          }
          return user;
        })
      );
    };
    const handleMessage = (data: any) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    };
    const handleDeleteSingleChat = (data: any) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg: any) => msg._id !== data._id)
      );
    };

    socket.on("setUserOnline", handleSetUserOnline);
    socket.on("setUserOffline", handleSetUserOffline);
    socket.on("message", handleMessage);
    socket.on("deleteChat", handleDeleteSingleChat);
    socket.on("deleteAllChat", () => {
      setMessages([]);
    });
    socket.on("typing", (data: any) => {
      console.log("Typing", data);
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user._id === data.userId) {
            return { ...user, is_typing: data.is_typing };
          }
          return user;
        })
      );
    });
    return () => {
      socket.off("setUserOnline", handleSetUserOnline);
      socket.off("message", handleMessage);
      socket.off("setUserOffline", handleSetUserOffline);
      socket.off("deleteChat", handleDeleteSingleChat);
      socket.off("deleteAllChat");
      socket.off("typing");
    };
  }, []); // Empty array means this effect runs once on mount and clean up on unmount

  useEffect(() => {
    const chatContainer = document.getElementById("chatContainer");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const handleMessageChange = (event: any) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${SERVER_URL}/user/add-chat`,
        {
          message,
          receiver_id: selectedUser,
        },
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      );

      console.log(res);
      setMessages((prevMessages) => [...prevMessages, res.data.chat]);
      socket.emit("message", res.data.chat);
      setMessage("");
    } catch (error) {
      console.error(error);
    }
  };
  const handleUserChange = (id: string) => {
    setSelectedUser(id);
    setShowMenu(true);
    localStorage.setItem("selectedUser", id);
    axios
      .get(`${SERVER_URL}/user/get-chat/${id}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((response) => {
        setMessages(response.data.chat);
      });
  };
  const handleDeleteChat = async (id: string) => {
    try {
      const res = await axios.delete(
        `${SERVER_URL}/user/delete-single-chat/${id}`,
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      );
      setMessages((prevMessages) =>
        prevMessages.filter((msg: any) => msg._id !== id)
      );
      socket.emit("deleteChat", res.data.chat);
    } catch (error) {
      console.error(error);
    }
  };
  const handleClearChat = async () => {
    try {
      const res = await axios.post(
        `${SERVER_URL}/user/delete-all-chat`,
        { receiver_id: selectedUser },
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      );
      setMessages([]);
      socket.emit("deleteAllChat", selectedUser);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        userId: localStorage.getItem("userId"),
        is_typing: true,
      }); // Emit typing event to the server
    }
  };

  const handleTypingStop = () => {
    if (isTyping) {
      setIsTyping(false);
      socket.emit("typing", {
        userId: localStorage.getItem("userId"),
        is_typing: false,
      }); // Emit typing event to the server
    }
  };
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div
          className={`w-3/4 sm:w-1/4 bg-white border-r border-gray-300 ${
            showMenu
              ? "sm:relative absolute transform translate-x-[-100%] sm:translate-x-[0%] transition ease-in-out delay-300"
              : ""
          }`}
        >
          {/* Sidebar Header */}
          <header
            className="p-4 border-b border-gray-300 flex justify-between items-center bg-indigo-600 text-white"
            onClick={() => setShowMenu(true)}
          >
            <h1 className="text-2xl font-semibold">Chat Web</h1>
            <div className="relative">
              <button id="menuButton" className="focus:outline-none sm:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-100"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path d="M2 10a2 2 0 012-2h12a2 2 0 012 2 2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                </svg>
              </button>
              {/* Menu Dropdown */}
           <DropdownMenu  />
            </div>
          </header>
          {/* Contact List */}
          <div className="overflow-y-auto h-screen p-3 mb-9 pb-20">
            {users.map((user: any) => (
              <div
                className={`flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md ${
                  selectedUser === user._id ? "bg-gray-100" : ""
                }`}
                onClick={() => handleUserChange(user._id)}
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                  <img
                    src="https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato"
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{user.name}</h2>
                  <p className="text-gray-600 text-xs">{user.email}</p>
                  {user?.is_typing ? (
                    <p className="text-sm text-gray-500">Typing...</p>
                  ) : null}
                  <p
                    className={`${
                      user?.is_online === "1"
                        ? "text-green-500"
                        : user?.is_online === "0"
                        ? "text-red-500"
                        : null
                    }`}
                  >
                    {user?.is_online === "1"
                      ? "Online"
                      : user?.is_online === "0"
                      ? "Offline"
                      : null}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Main Chat Area */}
        <div className="flex-1">
          {/* Chat Header */}

          <header className="bg-white p-4 text-gray-700 flex justify-start items-center gap-4">
            <FaAlignJustify
              onClick={() => setShowMenu(!showMenu)}
              className="sm:hidden"
            />
            <div className="flex flex-col justify-start items-start">
              <h1 className="text-2xl font-semibold">
                {users.find((user: any) => user._id === selectedUser)?.name}
              </h1>
              <p className="text-sm font-medium">
                {users.find((user: any) => user._id === selectedUser)?.email}
              </p>

              {users.find((user: any) => user._id === selectedUser)?.is_typing? (
                <p className="text-sm text-gray-500">Typing...</p>
              ) : null}
              <p
                className={`${
                  users.find((user: any) => user._id === selectedUser)
                    ?.is_online === "1"
                    ? "text-green-500"
                    : users.find((user: any) => user._id === selectedUser)
                        ?.is_online === "0"
                    ? "text-red-500"
                    : null
                }`}
              >
                {users.find((user: any) => user._id === selectedUser)
                  ?.is_online === "1"
                  ? "Online"
                  : users.find((user: any) => user._id === selectedUser)
                      ?.is_online === "0"
                  ? "Offline"
                  : null}
              </p>
            </div>
            <MdDeleteSweep onClick={handleClearChat} size={26} />
          </header>
          {/* Chat Messages */}
          <div
            className="h-screen overflow-y-auto p-4 pb-36"
            id="chatContainer"
            onClick={() => setShowMenu(true)}
          >
            {/* Incoming Message */}
            {messages.map((msg: any, index) => {
              if (msg.sender_id === userId) {
                return (
                  <div
                    className="flex justify-end mb-4 cursor-pointer items-center"
                    style={
                      index === messages.length - 1
                        ? { marginBottom: "50px" }
                        : {}
                    }
                  >
                    <MdDelete
                      className="text-red-500"
                      onClick={() => handleDeleteChat(msg._id)}
                    />
                    <div className="flex max-w-96 bg-indigo-500 text-white rounded-lg p-3 gap-3">
                      <p>{msg.message}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center ml-2">
                      <img
                        src="https://placehold.co/200x/b7a8ff/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato"
                        alt="My Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    className="flex mb-4 cursor-pointer items-center"
                    style={
                      index === messages.length - 1
                        ? { marginBottom: "50px" }
                        : {}
                    }
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center mr-2">
                      <img
                        src="https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato"
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                    <div className="flex  max-w-96  bg-pink-600 text-white rounded-lg p-3 gap-3">
                      <p className="text-white">{msg.message}</p>
                    </div>
                    <MdDelete
                      className="text-red-500"
                      onClick={() => handleDeleteChat(msg._id)}
                    />
                  </div>
                );
              }
            })}
          </div>
          {/* Chat Input */}
          <footer className="bg-white border-t w-[100%] border-gray-300 p-4 absolute bottom-0 sm:w-3/4 w-100">
            <form className="flex items-center" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500"
                value={message}
                onChange={handleMessageChange}
                onFocus={handleTypingStart}
                onBlur={handleTypingStop}
              />
              <button className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2">
                Send
              </button>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}

export default Home;
