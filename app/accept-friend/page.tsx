"use client";
import SERVER_URL from "@/config/SERVER_URL";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";

function GetUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
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
  }, []);
  const handleAcceptFriendRequest = (id:any) => {
   
    axios
      .post(
        `${SERVER_URL}/user/accept-friend-request`,
        {
            sender_id:id
        },
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
            console.log("Friend request sent")
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
  const handleRejectFriendRequest = (id:any) => {
    axios
      .post(
        `${SERVER_URL}/user/reject-friend-request`,
        {
            sender_id:id
        },
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
            console.log("Friend request rejected")
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
  return (
    <>
      <div className="users-container w-full min-h-screen sm:p-10 p-2">
      <FaHome size={26}  onClick={()=>router.push('/home')} />
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-900 uppercase dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                    
                  Add Friend
                </th>
                <th scope="col" className="px-6 py-3">
                    
           Reject Friend
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user: any) => {
                return (
                  <tr className="bg-white dark:bg-gray-800 rounded-xl">
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {user?.name}
                    </th>
                    <td className="px-6 py-4">
                        <button
                            onClick={() => handleAcceptFriendRequest(user._id)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Accept
                        </button>
                     
                    </td>
                    <td className="px-6 py-4">
                        <button
                            onClick={() => handleRejectFriendRequest(user._id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Reject
                        </button>
                        </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
         
        </div>
      </div>
    </>
  );
}

export default GetUsers;
