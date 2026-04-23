"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import {FcGoogle} from "react-icons/fc"
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import LoadingButton from "../utils/loading-button";
import { redirect, useRouter } from "next/navigation";
import { EyeClosedIcon, EyeIcon } from "lucide-react";

const formSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export default function SignInForm() {
  const { data: session } = authClient.useSession();

  if (session) {
    redirect("/account");
  }

  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/account",
      });

      if (error) {
        toast.error("Sign in failed", {
          description: error.message,
        });
        return;
      }

      toast.success("Signed in successfully");
      router.push("/account");
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="signin-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signin-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="signin-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="john@example.com"
                    autoComplete="email"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    className="flex justify-between items-center"
                    htmlFor="signin-password"
                  >
                    <p>Password</p>
                    <Link href={"/forgot-password"} className="hover:underline">
                      <p className="text-xs">Forgot password?</p>
                    </Link>
                  </FieldLabel>

                  <InputGroup>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      id="signin-password"
                      placeholder="*******"
                      aria-invalid={fieldState.invalid}
                      autoComplete="current-password"
                      className="relative"
                    />
                    <InputGroupAddon className="absolute right-0">
                      <Button
                        type="button"
                        variant={"ghost"}
                        size={"icon"}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeIcon /> : <EyeClosedIcon />}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <LoadingButton loading={loading} form="signin-form" className="w-full cursor-pointer">
          Sign In
        </LoadingButton>
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button
        disabled={loading}
          onClick={() =>
            authClient.signIn.social({
              provider: "google",
              callbackURL: "/account",
            })
          }
          variant={"outline"}
          className="w-full cursor-pointer"
        >
          <FcGoogle className="size-4" /> Continue with google
        </Button>
      </CardFooter>
    </Card>
  );
}
