"use client"
import { useEffect, useState } from "react";
import axios from "axios"
import SideBar from "./component/SideBar";
import { useSession } from "next-auth/react";
import Greeting from "./component/Greeting";
import Tasks from "./component/Tasks";
import { Nunito } from "next/font/google";
import { FaRegUser } from "react-icons/fa";
import { IoMdArrowRoundForward } from "react-icons/io";



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
    <div className={`w-scren h-full text-black overflow-hidden p-2 flex gap-2 bg-white relative  rounded-xl ${nunito.className}`}>
      <div>
        <SideBar />
      </div>

      <div className="">
        <Greeting name={session?.user?.email!} />
        <Tasks />
      </div>
      <div className="h-[680px] flex flex-col justify-between">
        <p className="w-full flex justify-end gap-2 py-3 pr-5"><span className="text-[#3A85E8]">Level 3</span>*Welcome Back <span className="text-[#FC8D0B]">{session?.user?.email}</span></p>
        <div className="text-center text-xl text-[#FC8D0B]">Chat with us!</div>
        <div className="bg-white rounded-xl shadow-2xl shadow-[#0000001F] h-[600px] w-[450px]  relative  p-3 overflow-y-auto">
          {chats.map((chat, index) => (
            <div
              key={index}
              className={`flex ${chat?.role === "user" ? "justify-end" : "justify-start"} w-auto mt-10`}
            >
              <div className="flex ">
                {chat.role != 'user' && (
                  <img src="image.png" alt="" className="w-[40px] h-[40px] shadow-sm shadow-neutral-200 rounded-full  mt-3" />
                )}
                <div
                  className={
                    chat?.role != "user"
                      ? "rounded-xl  p-2 w-auto border border-transparent shadow-sm shadow-neutral-200 text-black"
                      : "bg-[#161340] w-auto shadow-sm  shadow-[#7884FF] p-2 text-white rounded-2xl"
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
          <div className="my-3 w-full text-center mt-2">
            <div className="bg-[#161340] flex items-center justify-between w-[370px] h-[56px] rounded-full mx-auto px-2">
              <input
              onChange={(e)=>setTalk(e.target.value)}
                type="text"
                placeholder="Type something..."
                className="px-5 text-white bg-transparent placeholder-gray-400 rounded-full focus:outline-none w-full"
              />
              <div 
              onClick={submitHandler}
              className="rounded-full p-3 bg-[#FC8D0B] text-white flex justify-center items-center cursor-pointer">
                <IoMdArrowRoundForward size={20}/>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
