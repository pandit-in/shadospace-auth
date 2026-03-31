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
import { useRouter } from "next/navigation";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { upload } from "@vercel/blob/client";
import { CameraIcon, TrashIcon } from "@phosphor-icons/react";

const profileSchema = z.object({
  name: z.string().min(1, "Name must be at least 2 characters."),
  username: z.string().min(1, "Name must be at least 2 characters."),
  image: z.url("Invalid image URL").optional().or(z.literal("")),
});

export function ProfileSettings() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      name: session?.user?.name || "",
      username: session?.user?.username || session?.user?.name || "",
      image: session?.user?.image || "",
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please upload an image file.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Image must be less than 5MB.",
      });
      return;
    }

    try {
      setUploading(true);
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/avatar/upload",
      });

      form.setValue("image", blob.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", {
        description: "There was an error uploading your image.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    form.setValue("image", "");
    toast.success("Image removed", {
      description: "Don't forget to save your changes.",
    });
  };

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      setLoading(true);
      const { error } = await authClient.updateUser({
        name: values.name,
        username: values.username,
        image: values.image || undefined,
      });

      if (error) {
        toast.error("Error", {
          description: error.message || "Failed to update profile",
        });
        return;
      }
      toast.success("Profile updated");
      router.refresh();
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
    <Card className="w-full max-w-md">
      <CardHeader className="border-b">
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your personal information and how others see you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="profile-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2"
        >
          <div className="flex items-center gap-6 mb-4">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage
                className="rounded-full"
                src={form.watch("image") || session?.user?.image || ""}
              />
              <AvatarFallback className="text-xl">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Profile Picture</p>
                <p className="text-xs text-muted-foreground leading-normal">
                  Max size: 5MB. Format: PNG, JPG, GIF.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Spinner className="mr-2 h-3 w-3" />
                  ) : (
                    <CameraIcon size={16} className="mr-2" />
                  )}
                  {uploading ? "Uploading..." : "Change Image"}
                </Button>
                {form.watch("image") && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8"
                    onClick={handleRemoveImage}
                  >
                    <TrashIcon size={16} className="mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
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
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-name">Username</FieldLabel>
                  <Input
                    {...field}
                    id="profile-username"
                    placeholder="@johndoe"
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
                value={session?.user?.email ?? ""}
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
      <CardFooter className="">
        <LoadingButton
          loading={loading}
          form="profile-form"
          className="w-fit cursor-pointer ml-auto"
        >
          Save Changes
        </LoadingButton>
      </CardFooter>
    </Card>
  );
}
