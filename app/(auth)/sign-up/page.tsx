import SignUpForm from "@/components/auth/signup-form";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 items-center justify-center">
      <Link href={"/"} className="flex items-center gap-2">
        <Image src={"/logo.png"} alt="logo" height={25} width={25} />
        <p className="text-lg font-medium">Shado/auth</p>
      </Link>
      <SignUpForm />
      <p className="text-muted-foreground text-sm">
        Already have an account?{" "}
        <Link href={"/sign-in"} className="hover:underline text-primary">
          Sign In
        </Link>
      </p>
    </div>
  );
}
