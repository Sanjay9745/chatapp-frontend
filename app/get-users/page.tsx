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
 if(page>totalPages){
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
  }
  const handlePageDecrement = (e: any) => {
    e.preventDefault();
    if(page<=1){
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
  const handleAddFriendRequest = (id:any) => {
   
    axios
      .post(
        `${SERVER_URL}/user/add-friend-request`,
        {
            receiver_id:id
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
  return (
    <>
      <div className="users-container w-full min-h-screen sm:p-10 p-2">
      <FaHome size={26} onClick={()=>router.push('/home')} />
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
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-900 uppercase dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                    
                  Add Friend
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
                      {user.name}
                    </th>
                    <td className="px-6 py-4">
                        {
                            user.accepted ? <span className="text-green-500">Friend</span> : <button
                            id={user._id}
                            onClick={()=>handleAddFriendRequest(user._id)}
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                            Add Friend
                            </button>
                        }
                     
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <nav aria-label="Page navigation example" style={{ margin: "10px" }}>
            <ul className="inline-flex -space-x-px text-sm">
                {
                    page>1&&<li>
                    <p
                        onClick={handlePageDecrement}
                    className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                    Previous
                    </p>
                </li>
                }
   
             
              {page>1&&<li>
                <p
                    onClick={handlePageDecrement}
                  className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {page - 1}
                </p>
              </li>

              }
              
              <li>
                <p
                    aral-current="page"
                  className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {page}
                </p>
              </li>
              {
                    page<totalPages&&<li>
                    <p
                        onClick={handlePageIncrement}
    
                    className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                    {page + 1}
                    </p>
                </li>
              }
           {
                    page<totalPages&&   <li>
                    <p
                        onClick={handlePageIncrement}
                      className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      Next
                    </p>
                  </li>
           }
           
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

export default GetUsers;
