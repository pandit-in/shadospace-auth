"use client";

import { Button } from "@/components/ui/button";
import { GithubLogoIcon } from "@phosphor-icons/react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-[calc(100vh-2rem)] flex items-center justify-center">
      <div className="container">
        <h1 className="text-5xl text-center font-semibold">
          Next.js Authentication, <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/50">
            Done Right.
          </span>
        </h1>
        <p className="text-center mt-6 text-muted-foreground">
          A production-ready authentication starter using Better Auth, Drizzle,
          Shadcn
        </p>
        <div className="flex justify-center items-center mt-6 gap-2">
          <Button asChild>
            <Link href={"/sign-in"}>Get Started</Link>
          </Button>
          <Button variant={"outline"} asChild>
            <Link target="_blank" href={"https://github.com/pandit-in/shado-auth"}>
              <GithubLogoIcon className="size-4" /> Star on GitHub
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
