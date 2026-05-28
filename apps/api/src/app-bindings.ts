import type { AccessTokenPayload } from "@/auth/access-token";

export type AppBindings = {
  Variables: {
    auth: AccessTokenPayload;
    requestId: string;
  };
};
