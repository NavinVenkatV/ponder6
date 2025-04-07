"use client"
import { useState } from "react";
import axios from "axios"

export default function Home() {
  const [ prompts, setPrompt ] = useState("")
  const [ ans, setAns ] = useState("empty")
  const submitHandler = async ()=>{
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
    const response = await axios.post('/gemini', {
      prompt : prompts
    })
    console.log(response)
    setAns(response.data.msg)
  }
  return (
    <div className="w-full h-screen flex flex-col justify-center bg-black text-white ">
      <h1>Enter the prompts</h1>
      <input
      className="bg-blue-950 focus:outline-none"
      onChange={e => setPrompt(e.target.value)}
       type="text" />
      <button
      onClick={submitHandler}
      className="cursor-pointer bg-red-950"
      >Submit</button>
      <div>{ans}</div>
    </div>
  );
}
