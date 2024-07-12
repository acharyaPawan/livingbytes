"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import useHasMounted from "@/hooks/use-has-mounted";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const hasMounted = useHasMounted()

  return (
    <>
      {hasMounted && theme === "light" ? (
        <div className="grid h-8 w-8 place-content-center text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-neutral-200 max-xs:hidden">
          <Moon className="h-6 w-6" onClick={() => setTheme("dark")} />
        </div>
      ) : (
        <div className="grid h-8 w-8 place-content-center text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-neutral-200 max-xs:hidden">
          <Sun className="h-6 w-6" onClick={() => setTheme("light")} />
        </div>
      )}
    </>
  );
}
