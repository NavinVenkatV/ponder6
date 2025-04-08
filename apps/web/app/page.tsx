"use client"
import { useEffect, useState } from "react";
import axios from "axios"
import SideBar from "./component/SideBar";
export default function Home() {
  const [chats, setChat] = useState([{}])

  useEffect(() => {
    const prevChat = async () => {
      try {
        const prevChat = await axios.get('/prevChat');
        console.log(prevChat.data.chats);
        setChat(prevChat?.data?.chats);
      } catch (e) {
        console.log("Error fetching past chats ", e)
      }
    }
    prevChat();
  }, [])

  return (
    <div className="w-full h-full flex justify-between bg-white text-white relative p-2 overflow-hidden rounded-xl">
      <div>
        <SideBar />
      </div>
      <div className="bg-lime-950 w-[500px] h-screen rounded-xl p-3 overflow-y-auto">
        {chats.map((chat, index) => (
          <div key={index} className={chat?.role === "user" ? "text-white" : "text-red-500"}>
            {chat?.message}
          </div>
        ))}
      </div>


    </div>
  );
}
