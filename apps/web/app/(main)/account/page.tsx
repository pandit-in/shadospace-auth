"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/account/profile-settings";
import { SecuritySettings } from "@/components/account/security-settings";
import { AppearanceSettings } from "@/components/account/appearance-settings";
import { PaletteIcon, ShieldCheckIcon, UserIcon } from "@phosphor-icons/react";

export default function AccountPage() {
  return (
    <div className="container mt-20 mx-auto">
      <div className="space-y-0.5 mb-8 text-center md:text-left">
        <h2 className="text-2xl font-semibold tracking-tight font-heading">
          Account Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:w-fit md:flex gap-2 bg-transparent h-auto p-0">
          <TabsTrigger
            value="profile"
            className=" py-2 px-4 flex items-center gap-2 border border-transparent"
          >
            <UserIcon size={18} />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className=" py-2 px-4 flex items-center gap-2 border border-transparent"
          >
            <ShieldCheckIcon size={18} />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className=" py-2 px-4 flex items-center gap-2 border border-transparent"
          >
            <PaletteIcon size={18} />
            <span>Appearance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 outline-none">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="security" className="space-y-4 outline-none">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="appearance" className="space-y-4 outline-none">
          <AppearanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
