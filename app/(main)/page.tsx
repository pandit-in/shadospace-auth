"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import {FaGithub} from "react-icons/fa"

export default function Home() {
  const {data: session} = authClient.useSession()
  return (
    <div className="h-[calc(100vh-2rem)] flex items-center justify-center">
      <div className="container">
        <h1 className="text-5xl text-center font-semibold">
          Next.js Authentication, <br />
          <span>Done Right.</span>
        </h1>
        <p className="text-center mt-6 text-muted-foreground">
          A production-ready authentication starter using Better Auth, Drizzle,
          Shadcn
        </p>
        <div className="flex justify-center items-center mt-6 gap-4">
          <Button size={"lg"}>
            {session?.user ? (
              <Link href={"/dashboard"}>Dashboard</Link>
            ) : (
              <Link href={"/sign-in"}>Get Started</Link>
            )}
          </Button>
          <Button
            className="flex items-center gap-2"
            size={"lg"}
            variant={"outline"}
          >
            <Link
              target="_blank"
              href={"https://github.com/pandit-in/shado-auth"}
            >
              <FaGithub className="size-4" />
            </Link>
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
