"use client";

import React, { useState } from "react";
import { Menu, X, XCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ModeToggle } from "../shared/modeToggle";

export const menuLinks = [
  {
    id: "overview",
    title: "Overview",
    href: "/home",
  },
  {
    id: "journals",
    title: "Journals",
    href: "/journals",
  },
  {
    id: "tasks",
    title: "Tasks",
    href: "/tasks",
  },
  {
    id: "trackers",
    title: "Trackers",
    href: "/trackers",
  },
  {
    id: "events",
    title: "Events",
    href: "/events",
  },
  {
    id: "readings",
    title: "Readings",
    href: "/readings",
    comingSoon: true,
  },
  {
    id: "writings",
    title: "Writings",
    href: "/writings",
    comingSoon: true,
  },
  {
    id: "public",
    title: "Public",
    href: "/public",
    comingSoon: true,
  },
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
  },
];

const DashboardNav = () => {
  const [toggle, setToggle] = useState(false);
  const [rightToggle, setRightToggle] = useState(false);
  const [activeRight, setActiveRight] = useState<string | null>(null);

  const pathname = usePathname();
  const activePath = pathname || "/home";
  const activeLabel =
    menuLinks.find((item) => activePath.startsWith(item.href))?.title ??
    "Workspace";

  return (
    <header className="w-full py-4">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/40 bg-white/80 px-3 py-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/40 bg-white/60 p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
            <button
              onClick={() => setToggle((prevToggle) => !prevToggle)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div
              className={`flex flex-col ${
                toggle ? "items-start fixed top-0 right-0 bottom-0 left-0" : "hidden"
              } h-[100vh] rounded-r-[1.25rem] bg-white/95 shadow-2xl backdrop-blur dark:bg-[#0b0f14]/95  w-sidebarWidth z-[999] min-w-[220px] border-r border-white/40 dark:border-white/10`}
            >
              <div className="flex w-full items-center justify-between gap-2 px-4 pb-3 pt-4">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">LivingByte</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Workspace
                  </span>
                </div>
                <button
                  className="grid h-8 w-8 place-content-center rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                  onClick={() => setToggle((prevToggle) => !prevToggle)}
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-6">
                <ul className="flex flex-col gap-1">
                  {menuLinks.map((nav) => {
                    const isActive = activePath.startsWith(nav.href);
                    return (
                      <li key={nav.id}>
                        <Link
                          href={nav.href}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                            isActive
                              ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-950"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                          }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <span>{nav.title}</span>
                          {nav.comingSoon && (
                            <span className="ml-auto rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                              Soon
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            {toggle && (
              <div
                className="fixed inset-0 z-[998]"
                onClick={() => setToggle(false)}
                aria-label="Sidebar overlay"
                tabIndex={-1}
              />
            )}
          </div>
          <div className="hidden h-10 items-center gap-3 rounded-xl border border-white/30 bg-white/60 px-3 text-sm font-semibold text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white sm:flex">
            <span className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
              LB
            </span>
            <span className="text-sm font-semibold">{activeLabel}</span>
          </div>
        </div>

        {rightToggle && (
          <div
            className="fixed inset-0 z-[998]"
            onClick={() => setRightToggle(false)}
            aria-label="Right sidebar overlay"
            tabIndex={-1}
          />
        )}
        <div className="flex items-center gap-3">
          <ModeToggle />
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-gradient-to-br from-slate-900 to-slate-700 text-xs font-semibold text-white shadow-sm dark:border-white/10"
            onClick={() => setRightToggle((prevToggle) => !prevToggle)}
            aria-label="Open quick menu"
          >
            ME
          </button>
        </div>
        <div
          className={`${
            !rightToggle ? "hidden" : "flex"
          } absolute top-14 right-4 z-[999] min-w-[180px] flex-col gap-2 rounded-2xl border border-white/40 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#0b0f14]/95`}
        >
          <button
            className="absolute right-3 top-3 rounded-full border border-transparent p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white"
            onClick={() => setRightToggle((prevToggle) => !prevToggle)}
            aria-label="Close quick menu"
          >
            <XCircle className="h-5 w-5" />
          </button>
          <ul className="mt-4 flex flex-col gap-2">
            {rightMenuLinks.map((nav) => (
              <li key={nav.id}>
                <button
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    activeRight === nav.title
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                  onClick={() => setActiveRight(nav.title)}
                >
                  {nav.title}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
            <span>Theme</span>
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNav;
