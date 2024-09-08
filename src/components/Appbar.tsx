"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Appbar() {
  const { data: session, status } = useSession();
  console.log("Session Data:", session);
  console.log("Session Status:", status);
  const router = useRouter();

  const handleSignOut = async () => {
    if(confirm("Are you sure you want to sign out")){
      await signOut({ redirect: false }); // Prevents default redirection
      router.push("/login"); // Redirects to the login page
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center px-10 py-4  text-white">
        <div className="text-xl font-vina text-4xl text-black">Disclaimer : Easy there, let's chat—without getting as wild as the app name!</div>
        {status === "authenticated" && (
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-zinc-900 font-protest rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
