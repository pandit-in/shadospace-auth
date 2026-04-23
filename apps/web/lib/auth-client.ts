import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient, lastLoginMethodClient, usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    organizationClient(),
    lastLoginMethodClient(),
    usernameClient(),
  ],
});
