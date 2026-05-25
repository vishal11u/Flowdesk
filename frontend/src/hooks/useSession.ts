import { useEffect, useMemo, useState } from "react";
import { apiDefault } from "../lib/constants";
import {
  readApiUrl,
  readSession,
  writeApiUrl,
  writeSession,
} from "../lib/storage";
import type { ApiConfig, AuthSession } from "../lib/types";

export function useSession() {
  const [apiUrl, setApiUrl] = useState(() => readApiUrl(apiDefault));
  const [session, setSession] = useState<AuthSession | null>(() =>
    readSession(),
  );

  useEffect(() => {
    writeApiUrl(apiUrl);
  }, [apiUrl]);

  useEffect(() => {
    writeSession(session);
  }, [session]);

  const apiConfig = useMemo<ApiConfig>(
    () => ({
      apiUrl,
      accessToken: session?.access_token,
    }),
    [apiUrl, session?.access_token],
  );

  return {
    apiConfig,
    apiUrl,
    session,
    setApiUrl,
    setSession,
  };
}
