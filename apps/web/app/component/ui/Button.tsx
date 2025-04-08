import React from 'react'
import { IoRocketSharp } from 'react-icons/io5'
import { HiPaintBrush } from "react-icons/hi2";
import { IoIosPeople } from "react-icons/io";
import { RiShoppingBag3Fill } from "react-icons/ri";
import { GrResources } from "react-icons/gr";
import { IoSettingsOutline } from "react-icons/io5";

// Map of icon names to components
const iconMap: Record<string, React.ComponentType> = {
  'rocket': IoRocketSharp,
  'paint': HiPaintBrush,
  'people': IoIosPeople,
  'shopping': RiShoppingBag3Fill,
  'resources': GrResources,
  'settings': IoSettingsOutline
};

function Button({ title, icon = 'rocket' }: {
    title: string,
    icon?: string
}) {
    // Get the icon component from the map, default to rocket if not found
    const IconComponent = iconMap[icon] || IoRocketSharp;
    
    return (
        <button className='flex gap-2 cursor-pointer text-white hover:bg-white focus:text-black focus:bg-white hover:text-black p-3 rounded-2xl
        transition-all duration-300 ease-in-out w-[202px] h-[48px]'>
            <span className='flex flex-col justify-center'>
                <IconComponent />
            </span>
            {title}
        </button>
    )
}

export default Button
