"use client";

import { Appbar } from "@/components/Appbar";
import { ProgressDemo } from "@/components/Progress";
import React, { useState, useRef, useEffect } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { GoFileSubmodule } from "react-icons/go";

const Page = () => {
  const [chat, setChat] = useState<{ type: string; message: string }[]>([]);
  const [input, setInput] = useState<string>("");
  const [image, setImage] = useState(null);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const uploadimage = (e: any) => {
    setImage(e.target.files[0]);
  };

  console.log(image);

  const getmsg = async (e: React.FormEvent) => {
    e.preventDefault();

    const userMessage = { type: "user", message: input };
    setChat((prevChat) => [...prevChat, userMessage]);
    setInput("");
    console.log(chat);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          history: chat,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { type: "bot", message: data.message };
      setChat((prevChat) => [...prevChat, botMessage]);
    } catch (error) {
      console.error("Error fetching message:", error);
      setChat((prevChat) => [
        ...prevChat,
        { type: "bot", message: "Error fetching message" },
      ]);
    }
  };

  const uploadFile = async (e: any) => {
    const formData = new FormData();
    console.log(e.target.files[0]);
  
    if (e.target.files && e.target.files[0]) {
      formData.append("file", e.target.files[0]);
      console.log(formData);
  
      try {
        const response = await fetch("/api/uploaddoc", {
          method: "POST",
          body: formData,
        });
  
        console.log(response);
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        // Assuming the response is text, we should parse it as JSON
        const data = await response.json();  // Use .json() for JSON responses
  
        // Check the structure of the received data
        console.log(data);
  
        // Safely access nested properties
        const text = data?.result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No text available";
  
        console.log(text);
        setChat((prevChat) => [
          ...prevChat,
          { type: "bot", message: text },
        ]);
      } catch (error: any) {
        console.error("Error uploading file:", error);
        setChat((prevChat) => [
          ...prevChat,
          { type: "bot", message: "Error uploading file" },
        ]);
      }
    } else {
      console.log("No file selected");
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
        <div className="w-full h-[70vh] text-8xl font-protest flex items-center justify-center">
          HENT AI
        </div>
      </div>
      <div className="w-[90vw] max-h-[75vh] absolute top-20 p-4 rounded-xl overflow-y-auto shadow-lg font-suse text-xl ">
        
        <div className="flex flex-col space-y-4 overflow-y-auto">
            {chat.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`p-2 rounded-lg bg-opacity-[.80] ${
                    msg.type === "user" ? "bg-zinc-100" : "bg-zinc-300"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          
          <div ref={chatEndRef} /> {/* This is the element we scroll to */}</div>
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
