// console.log(process.env.GOOGLE_CLIENT_ID);
// console.log(process.env.GOOGLE_CLIENT_SECRET);

import { redirect } from "next/navigation";


export default function Home(){
  // return (
  //   <main>
      redirect("/chat");
    //   <Appbar />
    // </main>
  // )
}