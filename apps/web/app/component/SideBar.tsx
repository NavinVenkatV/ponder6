import React from 'react'
// import { IoRocketSharp } from "react-icons/io5";
// import { HiPaintBrush } from "react-icons/hi2";
// import { IoIosPeople } from "react-icons/io";
// import { RiShoppingBag3Fill } from "react-icons/ri";
// import { GrResources } from "react-icons/gr";


import Button from './ui/Button';


function SideBar() {
    return (
      <div className="h-screen bg-[#161340] rounded-xl p-5 w-[244px] flex flex-col">
        <img src="logo/ponderLogo.png" alt="" width={100} />
  
        <div className="mt-5 flex-1 flex flex-col justify-between rounded-lg ">
          <div className="space-y-2">
            <Button title="Adventure" icon="rocket" />
            <Button title="Design" icon="paint" />
            <Button title="Discover" icon="people" />
            <Button title="Internship" icon="shopping" />
            <Button title="Resource" icon="resources" />
          </div>
  
          <div>
            <Button title="Settings" icon="settings" />
          </div>
        </div>
      </div>
    );
  }
  

export default SideBar
