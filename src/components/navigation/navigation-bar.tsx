"use client";

import { useState } from "react";
import menu from "@/assets/menu.svg";
import close from "@/assets/x.svg";
import Image from "next/image";
import Link from "next/link";

import { ModeToggle } from "../shared/modeToggle";

export const navLinks = [
  {
    id: "home",
    title: "Home",
  },
  {
    id: "onboarding",
    title: "How It Works",
  },
  {
    id: "learnmore",
    title: "Modules",
  },
  {
    id: "faqs",
    title: "FAQs",
  },
];

const Navbar = () => {
  const [active, setActive] = useState("Home");
  const [toggle, setToggle] = useState(false);

  return (
    <nav className="w-full">
      <div className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <Link href="#home" className="text-2xl font-semibold text-slate-900 dark:text-white">
          LivingByte
        </Link>

        <ul className="relative hidden flex-1 items-center justify-end gap-6 sm:flex">
          {navLinks.map((nav) => (
            <li key={nav.id}>
              <Link
                href={`#${nav.id}`}
                className={`text-sm font-medium transition ${
                  active === nav.title
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
                onClick={() => setActive(nav.title)}
              >
                {nav.title}
              </Link>
            </li>
          ))}
          <ModeToggle />
        </ul>

        <div className="flex flex-1 items-center justify-end gap-4 sm:hidden">
          <ModeToggle />
          <button
            type="button"
            className="rounded-full border border-white/30 bg-white/80 p-2 shadow-sm dark:border-white/10 dark:bg-white/5"
            onClick={() => setToggle(!toggle)}
            aria-label="Toggle navigation"
          >
            <Image
              src={toggle ? close : menu}
              alt="menu"
              className="h-5 w-5 object-contain"
            />
          </button>
        </div>
      </div>

      <div
        className={`${
          toggle ? "flex" : "hidden"
        } fixed inset-0 z-[999] flex flex-col bg-slate-950/80 p-6 backdrop-blur sm:hidden`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-white">Menu</span>
          <button
            type="button"
            className="rounded-full border border-white/20 p-2 text-white"
            onClick={() => setToggle(false)}
            aria-label="Close navigation"
          >
            <Image src={close} alt="close" className="h-5 w-5 object-contain" />
          </button>
        </div>
        <ul className="mt-6 flex flex-col gap-4">
          {navLinks.map((nav) => (
            <li key={nav.id}>
              <Link
                href={`#${nav.id}`}
                className="text-base font-medium text-white"
                onClick={() => {
                  setActive(nav.title);
                  setToggle(false);
                }}
              >
                {nav.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
