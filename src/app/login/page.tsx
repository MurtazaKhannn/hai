"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { signIn, signOut } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

const Page = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [input, setInput] = useState({
    email: '',
    password: ''
  });
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(input);

    try {
      const res = await fetch(`/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
        
      });

      if (!res.ok) {
        throw new Error("Login Failed");
      }

      const data = await res.json();
      console.log(data);
      
      alert("Login Successful");
      router.push("/");
      setInput({ email: '', password: '' });
    } catch (error) {
      console.error(error);
      alert("Login failed. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google'); // Let signIn handle the redirect
    } catch (error) {
      console.error(error);
      alert("Google Sign-In failed. Please try again.");
    }
  };

  useEffect(() => {
    // If the session is authenticated, redirect to the homepage
    if (status === 'authenticated') {
      router.push("/chat");
    }
  }, [status, router]);

  return (
    <div className='flex flex-col items-center justify-center w-full h-[100vh] gap-20'>
      <h1 className='text-4xl font-vina'>Login</h1>
      <form onSubmit={handleSubmit} className='flex flex-col items-center justify-center gap-6'>
        <input
          onChange={handleChange}
          name='email'
          className='p-2 rounded-md bg-zinc-900 outline-none w-[15vw]'
          type='text'
          placeholder='Email'
          value={input.email}
        />
        <input
          onChange={handleChange}
          name='password'
          className='p-2 rounded-md bg-zinc-900 outline-none w-[15vw]'
          type='password'
          placeholder='Password'
          value={input.password}
        />
        <div className='flex gap-2'>
          New User? 
          <p onClick={() => router.push('/signup')} className='cursor-pointer font-vina'>
            SignUp
          </p>
        </div>
        <div>
            <div
              onClick={handleGoogleSignIn}
              className=" px-6 py-2 rounded-md text-white bg-white text-black w-[2vw] flex flex-col items-center justify-center cursor-pointer"
            >
              <FcGoogle/>
            </div>
        </div>
        <button className='bg-zinc-800 rounded-md w-[4vw] p-1 font-vina' type='submit'>
          Login
        </button>
      </form>
    </div>
  );
}

export default Page;
