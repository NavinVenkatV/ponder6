"use client"
import { useEffect, useState } from "react";
import axios from "axios"
import SideBar from "./component/SideBar";
import { useSession } from "next-auth/react";
import Greeting from "./component/Greeting";
import Tasks from "./component/Tasks";

export default function Home() {
  const { data: session } = useSession();
  console.log(session?.user?.email)
  const [chats, setChat] = useState([{}]) //For showcasing previous projects
  const [talk, setTalk] = useState("") //=> Sending Input
  // const [tasks, setTask] = useState([{}]) ??//For showcasing tasks

    useEffect(() => {
      const prevChats = async () => {
        try {
          const prevChat = await axios.get('/prevChat');
          setChat(prevChat?.data?.chats);
          console.log("THE PREVIOUS CHATS XXX  ", prevChat.data.chats)
        } catch (e) {
          console.log("Error fetching past chats ", e)
        }
      }
      prevChats();

    },[])

  const submitHandler = async () => {
    await axios.post('/chat', {
      prompt: talk,
      chatHistory: chats
    })
    try {
      const prevChat = await axios.get('/prevChat');
      setChat(prevChat.data.chats)
      setTalk("")
      console.log("THE Submit PREVIOUS CHATS XXX  ", prevChat.data.chats)
    } catch (e) {
      console.log("Error fetching past chats ", e)
    }
  }

  return (
    <div className="w-full h-full text-black flex gap-2 bg-white relative p-2 overflow-hidden rounded-xl">
      <div>
        <SideBar />
      </div>

      <div>
        <Greeting name={session?.user?.email!} />
        <Tasks/>
        <div className="mt-10">
          <input className="border-1 border-blue-900" type="text" onChange={(e) => setTalk(e.target.value)} />
          <button onClick={submitHandler}>Submit</button>
        </div>
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
