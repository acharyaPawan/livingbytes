"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReactNode, useState, useTransition } from "react";

const useControlledInput = () => {
  const [value, setValue] = useState("");
};

export function InputWithButton({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState("");
  const handleSubmit = async () => {
    startTransition(async () => {
      console.log("Button CLicked,");
      console.log("input is : ", input);
      setInput("");
    });
  };

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <div className="flex gap-2">
        <span className="self-center">{children}</span>
        <Input
          type="text"
          placeholder="Title"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      <Button variant={"secondary"} type="submit" onClick={handleSubmit} disabled={isPending} size={"sm"} className="">
        Update Title
      </Button>
    </div>
  );
}

export default InputWithButton;
