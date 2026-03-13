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
import { Input } from "@/components/ui/input";
import LoadingButton from "../utils/loading-button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  image: z.url("Invalid image URL").optional().or(z.literal("")),
});

export function ProfileSettings() {
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = React.useState(false);
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      name: session?.user?.name || "",
      image: session?.user?.image || "",
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      setLoading(true);
      const { error } = await authClient.updateUser({
        name: values.name,
        image: values.image || undefined,
      });

      if (error) {
        toast.error("Error", {
          description: error.message || "Failed to update profile",
        });
        return;
      }

      toast.success("Profile updated");
    } catch {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  }

  if (isPending) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your personal information and how others see you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="profile-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={form.watch("image") || session?.user?.image || ""}
              />
              <AvatarFallback className="text-xl">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium">Profile Picture</p>
              <p className="text-xs text-muted-foreground leading-normal">
                Format: URL. We currently support image URLs.
              </p>
            </div>
          </div>

          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-name">Display Name</FieldLabel>
                  <Input
                    {...field}
                    id="profile-name"
                    placeholder="John Doe"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="image"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-image">Avatar URL</FieldLabel>
                  <Input
                    {...field}
                    id="profile-image"
                    placeholder="https://example.com/avatar.jpg"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                value={session?.user?.email}
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed currently.
              </p>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="border-t pt-6 bg-muted/5">
        <LoadingButton
          loading={loading}
          form="profile-form"
          className="w-fit ml-auto"
        >
          Save Changes
        </LoadingButton>
      </CardFooter>
    </Card>
  );
}
