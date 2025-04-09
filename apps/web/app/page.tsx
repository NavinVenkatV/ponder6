"use client"
import { useEffect, useState } from "react";
import axios from "axios"
import SideBar from "./component/SideBar";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  console.log(session?.user?.email)
  const [chats, setChat] = useState([{}])
  const [ talk, setTalk ] = useState("")

  useEffect(() => {
    const prevChats = async () => {
      try {
        const prevChat = await axios.get('/prevChat');
        console.log(prevChat.data.chats);
        setChat(prevChat?.data?.chats);
        console.log(chats)
      } catch (e) {
        console.log("Error fetching past chats ", e)
      }
    }
    prevChats();

  }, [])

  const submitHandler = async () => {
    await axios.post('/chat', {
      prompt : talk,
      chatHistory : chats
    })
  }

  return (
    <div className="w-full h-full text-black flex justify-between bg-white relative p-2 overflow-hidden rounded-xl">
      <div>
        <SideBar />
      </div>
      <div>
        <input className="border-1 border-blue-900" type="text" onChange={(e)=> setTalk(e.target.value)}/>
        <button onClick={submitHandler}>Submit</button>
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
