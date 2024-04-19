import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function TopNav() {
  return (
    <>
      <div className="w-full h-20 flex justify-between items-center fixed top-0 left-0 shadow-lg">
        <div className="text-2xl font-bold ml-4">Chat App</div>
        <div className="mr-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </>
  );
}

export default TopNav;
