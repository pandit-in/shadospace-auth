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
import LoadingButton from "../utils/loading-button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Spinner } from "../ui/spinner";
import { upload } from "@vercel/blob/client";
import { CameraIcon, TrashIcon } from "@phosphor-icons/react";

const formSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters."),
    image: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      image: "",
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
        clientPayload: "signup",
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
    toast.success("Image removed");
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        image: values.image || undefined,
      });

      if (error) {
        toast.error("Failed to create user", {
          description: error.message,
        });
        return;
      }

      toast.success("User created successfully", {
        description: "Verify your email to access your account",
      });
      router.push("/account");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to create user", {
        description: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="signup-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-18 w-18 rounded-none shrink-0">
              <AvatarImage
                className="object-cover"
                src={form.watch("image") || ""}
              />
              <AvatarFallback className="text-lg">
                <CameraIcon size={24} />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
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
                  {uploading ? "Uploading..." : "Add Avatar"}
                </Button>
                {form.watch("image") && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8"
                    onClick={handleRemoveImage}
                  >
                    <TrashIcon size={16} />
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Optional: Square PNG or JPG. Max 5MB.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <FieldGroup className="gap-2">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signup-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="signup-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="signup-email"
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
                    htmlFor="signup-password"
                  >
                    Password
                  </FieldLabel>
                  <InputGroup>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      id="signup-password"
                      placeholder="*******"
                      aria-invalid={fieldState.invalid}
                      autoComplete="new-password"
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
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    className="flex justify-between items-center"
                    htmlFor="signup-confirm-password"
                  >
                    Confirm password
                  </FieldLabel>
                  <InputGroup>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      id="signup-confirm-password"
                      placeholder="*******"
                      aria-invalid={fieldState.invalid}
                      autoComplete="new-password"
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
      <CardFooter>
        <LoadingButton loading={loading} form="signup-form" className="w-full cursor-pointer">
          Create Account
        </LoadingButton>
      </CardFooter>
    </Card>
  );
}
