"use client";
import SERVER_URL from "@/config/SERVER_URL";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function GetUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [state, setState] = useState(false);
  const router = useRouter();
  useEffect(() => {
    axios
      .get(`${SERVER_URL}/user/get-friend-requests`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setUsers(res.data.users);
          setTotalPages(res.data.totalPages);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [state]);
  const handleAcceptFriendRequest = (id: any) => {
    axios
      .post(
        `${SERVER_URL}/user/accept-friend-request`,
        {
          sender_id: id,
        },
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          setState(!state);
          console.log("Friend request sent");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleRejectFriendRequest = (id: any) => {
    axios
      .post(
        `${SERVER_URL}/user/reject-friend-request`,
        {
          sender_id: id,
        },
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          setState(!state);
          console.log("Friend request rejected");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <div className="users-container w-full min-h-screen sm:p-10 p-2">
        <FaHome size={26} onClick={() => router.push("/home")} />
        <div className="relative overflow-x-auto">
          <Table>
            <TableCaption>Friend Requests</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
           
                <TableHead>Email</TableHead>
                <TableHead>Accept</TableHead>
                <TableHead>Reject</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
             {
                users.map((user:any) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded-md"
                        onClick={() => handleAcceptFriendRequest(user?._id)}
                      >
                        Accept
                      </button>
                
                    </TableCell>
                    <TableCell>
                    <button
                    className="bg-red-500 text-white px-2 py-1 rounded-md"
                        onClick={() => handleRejectFriendRequest(user?._id)}
                      >
                        Reject
                      </button>
                    
                    </TableCell>
                  </TableRow>
                ))
             }
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

export default GetUsers;
