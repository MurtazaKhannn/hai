"use client";

import { Appbar } from "@/components/Appbar";
import React, { useState } from "react";
import { AiOutlineSend } from "react-icons/ai";

const Page = () => {
  const [chat, setChat] = useState<{ type: string; message: string }[]>([]);
  const [input, setInput] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const getmsg = async (e: React.FormEvent) => {
    e.preventDefault();

    const userMessage = { type: "user", message: input };
    setChat((prevChat) => [...prevChat, userMessage]);
    setInput("");


    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });
    const data = await response.json();

    const botMessage = { type: "bot", message: data.message };
    setChat((prevChat) => [...prevChat, botMessage]);

  };

  return (
    <div className="w-full h-[100vh] flex flex-col items-center overflow-y-hidden justify-center">
      <div className="absolute top-0 w-full"><Appbar/></div>
      <div className="text-white font-vina text-5xl">hent AI</div>
      <div className="w-[90vw] max-h-[75vh] absolute top-20 p-4 rounded-xl overflow-y-auto shadow-lg font-protest">
        <div className="flex flex-col space-y-4 overflow-y-auto">
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"}`}>
              <div className={`p-2 rounded-lg bg-opacity-[.80] ${msg.type === "user" ? "bg-zinc-700" : "bg-zinc-900"}`}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full absolute bottom-6 flex justify-center">
        <form className="w-[90vw] relative flex" onSubmit={getmsg}>
          <input
            className="p-4 rounded-full w-full bg-zinc-800 outline-none font-vina text-white"
            type="text"
            name="msg"
            placeholder="Type your message here..."
            value={input}
            onChange={handleChange}
          />
          <button
            className="relative bg-zinc-900 rounded-full w-[2.7vw] h-[5.4vh] absolute right-14 top-2 flex items-center justify-center"
            type="submit"
          >
            <AiOutlineSend size={20} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
