"use client"

import { useState } from "react";
import menu from "@/assets/menu.svg"
import close from "@/assets/x.svg"
import Image from "next/image";
import { ModeToggle } from "../shared/modeToggle";
import Link from "next/link";

export const navLinks = [
  {
    id: "home",
    title: "Home",
  },
  {
    id: "onboarding",
    title: "OnBoarding",
  },
  {
    id: "faqs",
    title: "FAQs",
  },
  {
    id: "learnmore",
    title: "LearnMore",
  },
];

const Navbar = () => {
  const [active, setActive] = useState("Home");
  const [toggle, setToggle] = useState(false);

  return (
    <nav className="w-full flex py-5 justify-between items-center navbar">
      {/* Logo */}
      <h1 className="text-3xl text-black dark:text-zinc-100">LivingByte</h1>

      {/* Desktop Navigation */}

      <ul className="relative list-none sm:flex hidden justify-end items-center flex-1">
        <div className="mr-8 z-999">
          <ModeToggle />
        </div>
        {navLinks.map((nav, index) => (
          <li
            key={nav.id}
            className={`font-poppins font-normal cursor-pointer text-[16px] text-zinc-700 hover:text-zinc-950 focus-within:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 dark:focus-within:text-zinc-200 ${active === nav.title ? "text-white" : "text-dimWhite"
              } ${index === navLinks.length - 1 ? "mr-0" : "mr-10"}`}
            onClick={() => setActive(nav.title)}
          >
            <Link href={`#${nav.id}`}>{nav.title}</Link>
          </li>
        ))}

      </ul>

      {/* Mobile Navigation */}
      <div className="sm:hidden flex flex-1 justify-end items-center gap-8">
        <div>
          <ModeToggle />
        </div>
        <Image
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain"
          onClick={() => setToggle(!toggle)}
        />

        {/* Sidebar */}
        <div
          className={`${!toggle ? "hidden" : "flex"
            } p-6 bg-black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar bg-neutral-500 opacity-95`}
        >
          <ul className="list-none flex justify-end items-start flex-1 flex-col">
            {navLinks.map((nav, index) => (
              <li
                key={nav.id}
                className={`font-poppins font-medium cursor-pointer text-[16px] ${active === nav.title ? "dark:text-white text-black" : "text-zinc-800 dark:text-zinc-200"
                  } ${index === navLinks.length - 1 ? "mb-0" : "mb-4"}`}
                onClick={() => setActive(nav.title)}
              >
                <Link href={`#${nav.id}`}>{nav.title}</Link>
              </li>
            ))}
          </ul>


        </div>
      </div>
    </nav>
  );
};

export default Navbar;