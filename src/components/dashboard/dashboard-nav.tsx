"use client"

import React, { useState } from 'react';
import { Menu, Moon, Sun, X, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { ModeToggle } from '../shared/modeToggle';
import { usePathname } from 'next/navigation';

export const menuLinks = [
  {
    id: "overview",
    title: "Overview",
  },
  {
    id: "journals",
    title: "Journals",
  },
  {
    id: "reading",
    title: "Reading",
  },
  {
    id: "writing",
    title: "Writing",
  },
  {
    id: "public",
    title: "Public",
  }
];

export const rightMenuLinks = [
  {
    id: "profile",
    title: "Profile",
  },
  {
    id: "history",
    title: "History",
  },
  {
    id: "collection",
    title: "Collection",
  },
  {
    id: "archive",
    title: "Archive",
  },
  {
    id: "logout",
    title: "Logout",
  }
];

const DashboardNav = () => {
  const [active, setActive] = useState("Home");
  const [toggle, setToggle] = useState(false);
  const [rightToggle, setRightToggle] = useState(false);

  const { theme, setTheme } = useTheme();

  const pathname = usePathname()
  const link = pathname.split('/').pop();

  return (
    <header className='w-full py-4'>
      <div className='flex justify-between items-center h-8 gap-[0.75rem] w-full'>
        <div className='flex items-center gap-[1rem]'>
          <div className='border rounded-[0.375rem] border-neutral-600 hover:border-dimWhite grid place-content-center h-8 w-8'>
            {/* Sidebar Toggle */}
            <button onClick={() => setToggle((prevToggle) => !prevToggle)}>
              <Menu className='fill-dimWhite h-8 w-8 p-2' />
            </button>

            {/* Sidebar */}
            <div className={`flex flex-col ${toggle ? "items-start fixed top-0 right-0 bottom-0 left-0" : "hidden"} h-[100vh] border-white rounded-r-[0.75rem] max-h-[unset] bg-neutral-50 dark:bg-[#161b22]  w-sidebarWidth shadow-sidebarShadow z-[999] min-w-[192px]`}>
              <div className='header flex flex-row justify-start gap-2 p-[0.5rem_0.5rem_0rem_0.5rem] break-words w-full'>
                <div className='titleWrapper p-[0.5rem_0_0.375rem_0.5rem] w-full overflow-x-hidden'>
                  LivingByte
                </div>
                <div className='actionWrapper flex flex-row p-2'>
                  <button className='cursor-pointer h-8 w-8 grid place-content-center relative border rounded-[0.375rem] border-transparent bg-neutral-800 text-white self-start' onClick={() => setToggle((prevToggle) => !prevToggle)}>
                    <X height={8} width={8} />
                  </button>
                </div>
              </div>
              <div className='overlayBody p-[0rem_0.5rem_1rem_0.5rem] w-full'>
                <ul className='p-2 flex flex-col gap-4'>
                  {menuLinks.map((nav, index) => (
                    <li
                      key={nav.id}
                      className={`font-poppins font-normal cursor-pointer outline-1 text-[16px] text-zinc-700 hover:bg-neutral-200 dark:hover:bg-[#292f36] hover:text-zinc-950 focus-within:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 dark:focus-within:text-zinc-200 ${active === nav.title ? "text-white" : "text-dimWhite"
                        } px-2 py-[0.375rem] rounded-[0.375rem]`}
                      onClick={() => setActive(nav.title)}
                    >
                      <Link href={`#${nav.id}`}>{nav.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Additional content */}
            </div>
          </div>
          <div className='flex justify-center align-center border-x-[0.5px] w-8 h-8 border-white'>
            <span className='m-auto h-8'>LB</span>
          </div>
          <span className='font-bold h-8'>{link}</span>
        </div>
        <div className='flex gap-3'>
          <ModeToggle />
          <button className='bg-black rounded-full h-8 w-8' onClick={() => setRightToggle((prevToggle) => !prevToggle)}>
          </button>
        </div>
        {/* Right Sidebar */}
        <div className={`${!rightToggle ? "hidden" : "flex"} p-6 bg-neutral-400 dark:bg-neutral-600 absolute top-0 right-10 mx-4 my-2 min-w-[140px] rounded-xl sidebar opacity-95 z-999`}>
          <XCircle className='absolute h-8 w-8 top-2 right-2 text-neutral-400 hover:text-neutral-300 cursor-pointer' onClick={() => setRightToggle((prevToggle) => !prevToggle)} />
          <ul className="list-none flex justify-end items-start flex-1 flex-col">
            {rightMenuLinks.map((nav, index) => (
              <li
                key={nav.id}
                className={`font-poppins font-medium cursor-pointer text-[16px] ${active === nav.title ? "dark:text-white text-black" : "text-zinc-800 dark:text-zinc-200"
                  } ${index === rightMenuLinks.length - 1 ? "mb-0" : "mb-4"}`}
                onClick={() => setActive(nav.title)}
              >
                <Link href={`#${nav.id}`}>{nav.title}</Link>
              </li>
            ))}
          </ul>
          <div className='flex justify-end items-start flex-1 flex-col'>
            {theme === 'light' ? (
              <div className='xs:hidden grid place-content-center h-8 w-8 dark:text-neutral-300 text-neutral-700 dark:hover:text-neutral-200 hover:text-black'>
                <Moon className='h-6 w-6' onClick={() => setTheme('dark')} />
              </div>
            ) : (
              <div className='xs:hidden grid place-content-center h-8 w-8 dark:text-neutral-300 text-neutral-700 dark:hover:text-neutral-200 hover:text-black'>
                <Sun className='h-6 w-6' onClick={() => setTheme('light')} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardNav;
