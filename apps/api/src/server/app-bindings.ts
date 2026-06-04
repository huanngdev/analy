import type { AccessTokenPayload } from "@/features/auth/access-token";

export type AppBindings = {
  Variables: {
    auth: AccessTokenPayload;
    requestId: string;
  };
};
