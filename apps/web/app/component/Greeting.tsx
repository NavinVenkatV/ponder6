import React from 'react'
import { Nunito } from "next/font/google";

const nunito = Nunito({
    subsets: ['latin'],
    display: 'swap',
    weight: '400'
})

function Greeting({ name }: {
    name: string
}) {
    return (
        <div className={`w-[700px] flex flex-col justify-center  rounded-xl h-[120px] font-nunito bg-[#161340] p-3 ${nunito.className}`}>
            <div>
                <p className='text-white text-[26px] font-bold'>Welcome back, <span className='text-[#FC8D0B]'>{name ? name + "!" : ""}</span></p>
                <p className='text-[#7884FF] mt-3 text-[16px] font-bold'>Built an AI-Calendar from scratch using Ponder</p>
            </div>
        </div>
    )
}
export default Greeting
