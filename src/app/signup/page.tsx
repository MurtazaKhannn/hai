"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

const page = () => {

    const route = useRouter();

    const [input , setInput] = useState({
        username: '',
        email: '',
        password: '',
        confirmpassword:''
      })
    
      const handleChange = (e : any) => {
        const { name, value } = e.target
        setInput({...input, [name]: value })
      }
    
      const handleSubmit = async (e : any) => {
        e.preventDefault()
        console.log(input);
        const res = await fetch(`/api/signup` , {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(input)
        })
    
        if(!res.ok){
          throw new Error("SignUp Failed");
        }
    
        const data = await res.json()
        console.log(data);
        alert("SignUp Successful");
        route.push("/");
        setInput({email: '', password: '' ,username: '', confirmpassword: ''})
      }


  return (
    <div className="flex flex-col w-full h-[100vh] items-center justify-center gap-10">
      <h1 className="text-4xl font-vina ">SignUp</h1>
      <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center gap-6">
        <input
        onChange={handleChange}
        name="username"
        value={input.username}
          className="p-2 rounded-md bg-zinc-800 outline-none font-bold"
          type="text"
          placeholder="Username"
        />
        <input
        onChange={handleChange}
        name="email"
        value={input.email}
          className="outline-none p-2 rounded-md bg-zinc-800 font-bold"
          type="email"
          placeholder="Email"
        />
        <div className="flex gap-6 ">
          <input
          onChange={handleChange}
          name="password"
          value={input.password}
            className="p-2 rounded-md bg-zinc-800 outline-none font-bold"
            type="password"
            placeholder="Password"
          />
          <input
          onChange={handleChange}
          name="confirmpassword"
          value={input.confirmpassword}
            className="p-2 rounded-md bg-zinc-800 outline-none font-bold"
            type="password"
            placeholder="Confirm Password"
          />
        </div>

        <div className="flex gap-2">Already have an account ? <p className="cursor-pointer font-vina" onClick={() => {route.push("/login")}}>Login</p> </div>

        <button
          className="font-vina bg-zinc-900 rounded-md w-[6vw] py-2 "
          type="submit"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default page;
