import SignInForm from "@/components/auth/signin-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (session?.user) redirect("/dashboard") 
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 items-center justify-center">
      <Link href={"/"} className="flex items-center gap-2">
        <Image src={"/logo.png"} alt="logo" height={25} width={25} />
        <p className="text-lg font-medium">Shado/auth</p>
      </Link>
      <SignInForm />
      <p className="text-muted-foreground text-sm">
        Don&apos;t have an account?{" "}
        <Link href={"/sign-up"} className="hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
