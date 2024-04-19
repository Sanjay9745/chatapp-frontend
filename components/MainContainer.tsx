import React from "react";
import TopNav from "./TopNav";
import "./styles/MainConatiner.css";
import SideBar2 from "./SideBar2";
function MainContainer({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="w-full min-h-screen relative">
        <TopNav />

        <div className="main-container" >{children}</div>
      </div>
    </>
  );
}

export default MainContainer;
