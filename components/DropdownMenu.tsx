import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { FaCheckDouble, FaUserFriends } from "react-icons/fa";

const DropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleMenu}
        className="inline-flex justify-center items-center px-4 py-2 text-gray-800 hover:text-gray-400"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 12a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M10 20a10 10 0 100-20 10 10 0 000 20z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 12a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M10 20a10 10 0 100-20 10 10 0 000 20z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          id="menuDropdown"
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg"
        >
          <ul className="py-2 px-3">
            <li>
              <p className=" px-4 py-2 text-gray-800 hover:text-gray-400 flex items-center gap-4" onClick={()=>router.push("/get-users")}>
                <FaUserFriends />
                <span>Add Friend</span>
              </p>
            </li>
            <li>
              <p className=" px-4 py-2 text-gray-800 hover:text-gray-400 flex items-center gap-4" onClick={()=>router.push("/accept-friend")}>
                <FaCheckDouble />
                <span>Friend Requests</span>
              </p>
            </li>
            {/* Add more menu options here */}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
