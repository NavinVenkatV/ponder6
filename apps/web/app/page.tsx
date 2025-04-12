"use client"
import { useEffect, useState } from "react";
import axios from "axios"
import SideBar from "./component/SideBar";
import { useSession } from "next-auth/react";
import Greeting from "./component/Greeting";
import Tasks from "./component/Tasks";
import { Nunito } from "next/font/google";
import { FaRegUser } from "react-icons/fa";


const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  weight: '400'
})

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

  }, [])

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
    <div className={`w-scren h-full text-black flex gap-2 bg-white relative p-2 overflow-hidden rounded-xl ${nunito.className}`}>
      <div>
        <SideBar />
      </div>

      <div>
        <Greeting name={session?.user?.email!} />
        <Tasks />
        {/* <div className="mt-10">
          <input className="border-1 border-blue-900" type="text" onChange={(e) => setTalk(e.target.value)} />
          <button onClick={submitHandler}>Submit</button>
        </div> */}
      </div>

      <div className="bg-white w-auto h-screen relative rounded-xl p-3 overflow-y-auto">
        <div className="flex w-full justify-end ">
          <p className="w-full bg-white py-3">Welcome Back <span className="text-[#FC8D0B]">{session?.user?.email}</span></p>
        </div>
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`flex ${chat?.role === "user" ? "justify-end" : "justify-start"} w-auto mt-10`}
          >
            <div className="flex gap-2">
              {chat.role != 'user' && (
                <img src="image.png" alt="" className="w-[40px] h-[40px] shadow-sm shadow-neutral-200 rounded-full  mt-3" />
              )}
              <div
                className={
                  chat?.role != "user"
                    ? "rounded-xl mt-2 p-2 w-auto border border-transparent shadow-sm shadow-neutral-200 text-black"
                    : "bg-[#161340] w-auto shadow-sm  shadow-[#7884FF] p-2 text-white rounded-2xl mt-2"
                }
              >
                {chat?.message}
              </div>
              {chat.role == 'user' && (
                // <img src="image.png" alt="" className="w-[40px] h-[40px] shadow-sm shadow-neutral-200 rounded-full bg-red-600 mt-3"/>
                <div className="w-[40px] h-[40px] text-center flex justify-center shadow-sm shadow-neutral-200 rounded-full mt-3">
                  <div className="flex flex-col justify-center items-center">
                    <FaRegUser />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
