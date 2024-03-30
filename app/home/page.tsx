"use client";
import SideBar from "@/components/SideBar";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import SERVER_URL from "@/config/SERVER_URL";
import SOCKET_URL from "@/config/SOCKET_URL";
import axios from "axios";
import { useRouter } from "next/navigation";
interface User {
  _id: string;
  name: string;
  email: string;
  is_online: string;
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
  const [selectedUser, setSelectedUser] = useState<string>(userOnSelect || "");
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
                  .get(`${SERVER_URL}/user/get-all-users`, {
                    headers: {
                      "x-access-token": localStorage.getItem("token"),
                    },
                  })
                  .then((res) => {
                    setUsers(res.data.users);
                    setSelectedUser(selectedUser||res.data.users[0]._id);
                    localStorage.setItem("selectedUser", selectedUser||res.data.users[0]._id);
                    axios.get(
                      `${SERVER_URL}/user/get-chat/${selectedUser||res.data.users[0]._id}`,
                      {
                        headers: {
                          "x-access-token": localStorage.getItem("token"),
                        },
                      }
                    ).then((response) => {
                      setMessages(response.data.chat);
                    })
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
  }
    const handleMessage = (data: any) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    };
  
    socket.on("setUserOnline", handleSetUserOnline);
    socket.on("setUserOffline", handleSetUserOffline)
    socket.on("message", handleMessage);
  
    return () => {
      socket.off("setUserOnline", handleSetUserOnline);
      socket.off("message", handleMessage);
      socket.off("setUserOffline", handleSetUserOffline);
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

  const handleSendMessage = async () => {
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
    localStorage.setItem("selectedUser", id);
    axios.get(`${SERVER_URL}/user/get-chat/${id}`, {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    }).then((response) => {
      setMessages(response.data.chat);
    });
  }
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/4 bg-white border-r border-gray-300">
          {/* Sidebar Header */}
          <header className="p-4 border-b border-gray-300 flex justify-between items-center bg-indigo-600 text-white">
            <h1 className="text-2xl font-semibold">Chat Web</h1>
            <div className="relative">
              <button id="menuButton" className="focus:outline-none">
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
              <div
                id="menuDropdown"
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg hidden"
              >
                <ul className="py-2 px-3">
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 text-gray-800 hover:text-gray-400"
                    >
                      Option 1
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 text-gray-800 hover:text-gray-400"
                    >
                      Option 2
                    </a>
                  </li>
                  {/* Add more menu options here */}
                </ul>
              </div>
            </div>
          </header>
          {/* Contact List */}
          <div className="overflow-y-auto h-screen p-3 mb-9 pb-20">
            {users.map((user: any) => (
              <div className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md" onClick={()=>handleUserChange(user._id)}>
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                  <img
                    src="https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato"
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  <p>{user?.is_online==="1"?"Online":user?.is_online==="0"?"Offline":null}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Main Chat Area */}
        <div className="flex-1">
          {/* Chat Header */}
          <header className="bg-white p-4 text-gray-700">
            <h1 className="text-2xl font-semibold">{
              users.find((user: any) => user._id === selectedUser)?.name
            
            }</h1>
          </header>
          {/* Chat Messages */}
          <div className="h-screen overflow-y-auto p-4 pb-36" id="chatContainer">
            {/* Incoming Message */}
            {
              messages.map((msg: any) => {
                if (msg.sender_id === userId) {
                  return (
                    <div className="flex justify-end mb-4 cursor-pointer">
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
                    <div className="flex mb-4 cursor-pointer">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center mr-2">
                        <img
                          src="https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato"
                          alt="User Avatar"
                          className="w-8 h-8 rounded-full"
                        />
                      </div>
                      <div className="flex max-w-96 bg-white rounded-lg p-3 gap-3">
                        <p className="text-gray-700">{msg.message}</p>
                      </div>
                    </div>
                  );
                }
              })
            }

          </div>
          {/* Chat Input */}
          <footer className="bg-white border-t border-gray-300 p-4 absolute bottom-0 w-3/4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500"
                value={message}
                onChange={handleMessageChange}

              />
              <button className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

export default Home;
