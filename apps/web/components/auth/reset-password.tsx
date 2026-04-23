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
import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import LoadingButton from "../utils/loading-button";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordForm() {
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const router = useRouter();
  const token = useSearchParams().get("token");

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      if (!token) {
        toast.error("Error", {
          description: "Invalid token",
        });
        return;
      }
      const { error } = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (error) {
        toast.error("Error", {
          description: error.message || "Failed to reset password",
        });
        return;
      }

      toast.success("Success", {
        description: "Your password has been reset successfully.",
      });
      router.push("/sign-in");
    } catch {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Create a new strong password</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="reset-password-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    className="flex justify-between items-center"
                    htmlFor="reset-password"
                  >
                    New Password
                  </FieldLabel>
                  <InputGroup>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      id="reset-password"
                      placeholder="*******"
                      aria-invalid={fieldState.invalid}
                      autoComplete="new-password"
                    />
                    <InputGroupAddon align="inline-end">
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
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    className="flex justify-between items-center"
                    htmlFor="reset-confirm-password"
                  >
                    Confirm password
                  </FieldLabel>
                  <InputGroup>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      id="reset-confirm-password"
                      placeholder="*******"
                      aria-invalid={fieldState.invalid}
                      autoComplete="new-password"
                    />
                    <InputGroupAddon align="inline-end">
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
      <CardFooter>
        <LoadingButton
          loading={loading}
          form="reset-password-form"
          className="w-full"
        >
          Reset Password
        </LoadingButton>
      </CardFooter>
    </Card>
  );
}
