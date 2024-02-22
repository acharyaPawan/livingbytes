"use client";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import React, { useEffect, useRef, useState } from "react";

const dummyPreviousTodos = [
  "washing clothes",
  "assignment completion",
  "loo",
  "homework",
  " wa",
  "www",
  "ww",
  "wwwags",
  "wakhjds",
  "wadjgaujt",
  "wajhsk",
  "jhkhdfshkw",
  "uhjhswashj",
  "pawan",
  'nepal',
];






const TaskMaster = () => {
  const [newTodo, setNewTodo] = React.useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>(dummyPreviousTodos);
  const [isFocused, setIsFocused] = useState(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodo(e.target.value);
    console.log(newTodo);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current !== null) {
      clearTimeout(blurTimeoutRef.current);
    }
    setIsFocused(true);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, 200); // Adjust the delay as needed
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setNewTodo(suggestion);
    setIsFocused(true);
    console.log("suggestion clicked");
    // You can perform additional actions when a suggestion is selected
  };

    const filteredSuggestions = suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(newTodo.toLowerCase()) && suggestion.toLowerCase() !== newTodo.toLowerCase(),
    );

  return (
    <div>
      <h1 className="font-serif text-2xl">TaskMaster</h1>
      <div className="flex gap-4">
        <div className="relative flex w-full items-center">
          <Input
            placeholder="Enter tasks or todos"
            className="text-xl"
            value={newTodo}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleInputChange}
          />
          <SlidersHorizontal className="z-100 absolute right-2 top-2 hover:text-gray-400 dark:hover:text-dimWhite" />
        </div>
        <Button>Add</Button>
      </div>
      <div>
        {filteredSuggestions.length > 0 && newTodo && isFocused && (
          <ul className="absolute z-10 mt-2 h-96 w-full overflow-y-scroll rounded-b border bg-white shadow-md dark:bg-gray-800">
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className="cursor-pointer px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Customization */}
      <div>
                
      </div>
    </div>
  );
};

export default TaskMaster;
