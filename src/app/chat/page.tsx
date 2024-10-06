"use client";

import { Appbar } from "@/components/Appbar";
import { ProgressDemo } from "@/components/Progress"; // Ensure you have this component implemented correctly
import React, { useState, useRef, useEffect } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { GoFileSubmodule } from "react-icons/go";

const Page = () => {
  const [chat, setChat] = useState<{ type: string; message: string }[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Boolean for loading state

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const getmsg = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = 8;

    // Add user message to chat
    const userMessage = { type: "user", message: input };
    setChat((prevChat) => [...prevChat, userMessage]);
    setInput("");

    // Start loading state for bot message
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          history: chat,
          userId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { type: "bot", message: data.message };

      // Add bot message to chat
      setChat((prevChat) => [...prevChat, botMessage]);
    } catch (error) {
      console.error("Error fetching message:", error);
      setChat((prevChat) => [
        ...prevChat,
        { type: "bot", message: "Error fetching message" },
      ]);
    } finally {
      // Stop loading state after receiving the bot response
      setLoading(false);
    }
  };

  const uploadFile = async (e: any) => {
    const formData = new FormData();
    if (e.target.files && e.target.files[0]) {
      formData.append("file", e.target.files[0]);

      // Start loading state during file upload
      setLoading(true);

      try {
        const response = await fetch("/api/uploaddoc", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const text =
          data?.result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No text available";

        // Add bot message to chat
        setChat((prevChat) => [...prevChat, { type: "bot", message: text }]);
      } catch (error: any) {
        console.error("Error uploading file:", error);
        setChat((prevChat) => [
          ...prevChat,
          { type: "bot", message: "Error uploading file" },
        ]);
      } finally {
        // Stop loading state after receiving the bot response
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Scroll to bottom when chat updates
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <div className="w-full h-[100vh] flex flex-col items-center overflow-y-hidden justify-center">
      <div className="absolute top-0 w-full">
        <Appbar />
        {/* <div className="w-full h-[70vh] text-8xl font-protest flex items-center justify-center">
          HENT AI
        </div> */}
      </div>
      <div className="w-[90vw] max-h-[75vh] absolute top-20 p-4 rounded-xl overflow-y-auto shadow-lg font-suse text-xl">
        <div className="flex flex-col space-y-4 overflow-y-auto">
          {chat.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.type === "user" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`p-2 rounded-lg bg-opacity-[.80] ${
                  msg.type === "user" ? "bg-zinc-100" : "bg-zinc-300"
                }`}
              >
                {/* If it's the last bot message and loading is true, show progress bar */}
                {msg.type === "bot" && i === chat.length - 1 && loading ? (
                  <ProgressDemo />
                ) : (
                  msg.message // Only show message if it's not loading
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} /> {/* This is the element we scroll to */}
        </div>
      </div>
      <div className="w-full absolute bottom-6 flex justify-center">
        <form className="w-[90vw] relative flex" onSubmit={getmsg}>
          <input
            className="p-4 rounded-full w-full bg-zinc-800 pl-12 outline-none font-suse text-white"
            type="text"
            name="msg"
            placeholder="Type your message here..."
            value={input}
            onChange={handleChange}
          />

          <div className="absolute top-4 left-4">
            <label htmlFor="fileInput" className="cursor-pointer">
              <GoFileSubmodule size={22} />
            </label>
            <input
              id="fileInput"
              type="file"
              className="hidden"
              onChange={uploadFile}
            />
          </div>
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
