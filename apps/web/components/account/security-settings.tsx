"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
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
import { Button } from "@/components/ui/button";
import {
  EyeClosedIcon,
  EyeIcon,
  SignOutIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import LoadingButton from "../utils/loading-button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignOut, Trash } from "@phosphor-icons/react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function SecuritySettings() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<z.infer<typeof securitySchema>>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof securitySchema>) {
    try {
      setLoading(true);
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error("Error", {
          description: error.message || "Failed to change password",
        });
        return;
      }

      toast.success("Password changed", {
        description: "Your password has been updated successfully.",
      });
      form.reset();
    } catch {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/sign-in");
            toast.success("Logged out successfully");
          },
        },
      });
    } catch {
      toast.error("Error", {
        description: "Failed to logout",
      });
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleDeleteAccount() {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const { error } = await authClient.deleteUser();
      if (error) {
        toast.error("Error", {
          description: error.message || "Failed to delete account",
        });
        return;
      }
      toast.success("Account deleted", {
        description: "Your account has been permanently removed.",
      });
      router.push("/sign-up");
    } catch {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Change your password and secure your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="security-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="currentPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      className="flex justify-between"
                      htmlFor="current-password"
                    >
                      Current Password
                      <Link
                        href={"/forgot-password"}
                        className="hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="*******"
                        aria-invalid={fieldState.invalid}
                        autoComplete="current-password"
                      />
                      <InputGroupAddon align="inline-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeIcon size={16} />
                          ) : (
                            <EyeClosedIcon size={16} />
                          )}
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
                name="newPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="*******"
                        aria-invalid={fieldState.invalid}
                        autoComplete="new-password"
                        className="pr-10"
                      />
                      <InputGroupAddon className="absolute right-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeIcon size={16} />
                          ) : (
                            <EyeClosedIcon size={16} />
                          )}
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
                    <FieldLabel htmlFor="confirm-password">
                      Confirm New Password
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="*******"
                        aria-invalid={fieldState.invalid}
                        autoComplete="new-password"
                        className="pr-10"
                      />
                      <InputGroupAddon className="absolute right-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeIcon size={16} />
                          ) : (
                            <EyeClosedIcon size={16} />
                          )}
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
        <CardFooter className="mt-6">
          <LoadingButton
            loading={loading}
            form="security-form"
            className="w-fit ml-auto"
          >
            Update Password
          </LoadingButton>
        </CardFooter>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader className="border-b">
          <CardTitle>Session</CardTitle>
          <CardDescription>Manage your current active session.</CardDescription>
        </CardHeader>
        <CardContent className="grow">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Logout from this device</p>
              <p className="text-xs text-muted-foreground">
                Ends your current session and takes you to sign in.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                "Logging out..."
              ) : (
                <>
                  <SignOutIcon className="mr-2 h-4 w-4" />
                  Logout
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? (
                "Deleting..."
              ) : (
                <>
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete your account
                </>
              )}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
