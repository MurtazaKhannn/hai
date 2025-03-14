"use client";

import { Appbar } from "@/components/Appbar";
import { ProgressDemo } from "@/components/Progress";
import React, { useState, useRef, useEffect, useReducer } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { GoFileSubmodule } from "react-icons/go";

const Page = () => {
  // Add a forceUpdate function using reducer
  const [forceUpdateValue, forceUpdate] = useReducer((x) => x + 1, 0);

  // State for chat messages
  const [chat, setChat] = useState<{ type: string; message: string }[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // State for streaming
  const [streamingText, setStreamingText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Ref for scrolling to the bottom of the chat
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Ref for storing streaming text temporarily
  const streamingTextRef = useRef("");

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Handle sending a message
  const getmsg = async (e: React.FormEvent) => {
    e.preventDefault();

    const userMessage = { type: "user", message: input };
    setChat((prevChat) => [...prevChat, userMessage]);
    setInput("");

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
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload and streaming
  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData();
    if (e.target.files && e.target.files[0]) {
      formData.append("file", e.target.files[0]);

      setLoading(true);
      setIsStreaming(true);
      setStreamingText(""); // Clear streaming text before starting
      streamingTextRef.current = ""; // Reset the ref

      try {
        const response = await fetch("/api/uploaddoc", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            console.log("Received chunk:", chunk);

            // Update the ref with the new chunk
            streamingTextRef.current += chunk;

            // Update the state in a controlled manner
            setStreamingText(streamingTextRef.current);

            // Force re-render
            forceUpdate();

            // Allow time for UI to update
            await new Promise((r) => setTimeout(r, 10));
          }
        }

        // When done, add the complete message to chat
        setChat((prev) => [...prev, { type: "bot", message: streamingTextRef.current }]);
        setIsStreaming(false);
        setStreamingText(""); // Reset streaming text after adding to chat
      } catch (error: any) {
        console.error("Error uploading file:", error);
        setChat((prevChat) => [
          ...prevChat,
          { type: "bot", message: "Error uploading file" },
        ]);
        setIsStreaming(false);
        setStreamingText(""); // Reset streaming text on error
      } finally {
        setLoading(false);
      }
    }
  };

  // Scroll to the bottom of the chat when chat or streaming text updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, streamingText, forceUpdateValue]);

  return (
    <div className="w-full h-[100vh] flex flex-col items-center overflow-y-hidden justify-center">
      <div className="absolute top-0 w-full">
        <Appbar />
      </div>
      <div className="w-[90vw] max-h-[75vh] absolute top-20 p-4 rounded-xl overflow-y-auto shadow-lg font-suse text-xl">
        <div className="flex flex-col space-y-4 overflow-y-auto">
          {/* Render normal chat messages */}
          {chat.map((msg, i) => (
            <div
              key={`chat-${i}`}
              className={`flex ${
                msg.type === "user" ? "justify-start" : "justify-end"
              }`}
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

          {/* Render streaming message separately */}
          {isStreaming && (
            <div key="streaming" className="flex justify-end">
              <div className="p-2 rounded-lg bg-opacity-[.80] bg-zinc-300">
                {streamingText || "Loading..."}
              </div>
            </div>
          )}

          {/* Show loading indicator without affecting the message content */}
          {loading && !isStreaming && (
            <div className="flex justify-end">
              <div className="p-2 rounded-lg bg-opacity-[.80] bg-zinc-300">
                <ProgressDemo />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
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
            className="relative bg-zinc-900 rounded-full w-[2.7vw] h-[5.4vh] right-14 top-2 flex items-center justify-center"
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