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
  // const [user, setUser] = useState({} as any);
  const router = useRouter();
  useEffect(() => {
    axios
      .get(`${SERVER_URL}/user/get-all-users`, {
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
    // axios.get(`${SERVER_URL}/user/details`, {
    //   headers: {
    //     "x-access-token": localStorage.getItem("token"),
    //   },
    // }).then((res) => {
    //   setUser(res.data.user);
    // }).catch((err) => {
    //   console.log(err);
    // })
  }, []);
  const handleSearch = (e: any) => {
    e.preventDefault();
    axios
      .get(`${SERVER_URL}/user/get-all-users?search=${search}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setUsers(res.data.users);
          setSearch("");
          setTotalPages(res.data.totalPages);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handlePageIncrement = (e: any) => {
    e.preventDefault();
    if (page > totalPages) {
      return;
    }
    setPage(page + 1);
    axios
      .get(`${SERVER_URL}/user/get-all-users?page=${page + 1}`, {
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
  };
  const handlePageDecrement = (e: any) => {
    e.preventDefault();
    if (page <= 1) {
      return;
    }
    setPage(page - 1);
    axios
      .get(`${SERVER_URL}/user/get-all-users?page=${page - 1}`, {
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
  };
  const handleAddFriendRequest = (id: any) => {
    axios
      .post(
        `${SERVER_URL}/user/add-friend-request`,
        {
          receiver_id: id,
        },
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          console.log("Friend request sent");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleSendMessage = (id: any) => {
    localStorage.setItem("selectedUser", id);
    window.location.href = "/home";
  };
  return (
    <>
      <div className="users-container w-full min-h-screen sm:p-10 p-2">
        <FaHome size={26} onClick={() => router.push("/home")} />
        <div>
          <div className="max-w-md mx-auto my-10">
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search users"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableCaption>Add Friend</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>

                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => {
                return (
                  <>
                    <TableRow>
                      <TableCell className="font-medium">
                        {user?.name}
                      </TableCell>

                      <TableCell className="text-right">
                        {user.isFriend ? (
                          <button
                            onClick={() => handleSendMessage(user._id)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                          >
                            Message
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddFriendRequest(user._id)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                          >
                            Add Friend
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  </>
                );
              })}
            </TableBody>
          </Table>

          <nav aria-label="Page navigation example" style={{ margin: "10px" }}>
            <ul className="inline-flex -space-x-px text-sm">
              {page > 1 && (
                <li>
                  <p
                    onClick={handlePageDecrement}
                    className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Previous
                  </p>
                </li>
              )}

              {page > 1 && (
                <li>
                  <p
                    onClick={handlePageDecrement}
                    className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    {page - 1}
                  </p>
                </li>
              )}

              <li>
                <p
                  aral-current="page"
                  className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {page}
                </p>
              </li>
              {page < totalPages && (
                <li>
                  <p
                    onClick={handlePageIncrement}
                    className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    {page + 1}
                  </p>
                </li>
              )}
              {page < totalPages && (
                <li>
                  <p
                    onClick={handlePageIncrement}
                    className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Next
                  </p>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

export default GetUsers;
