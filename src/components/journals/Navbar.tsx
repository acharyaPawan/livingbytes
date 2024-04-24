"use client"

interface NavbarProps {
  isCollapsed:boolean
  onResetWidth:() => void
}

export function Navbar ({isCollapsed,onResetWidth}:NavbarProps) {
  return (
    <>
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full
      flex gap-x-4 items-center">

      </nav>
    </>
)
}