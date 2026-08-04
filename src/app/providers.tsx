"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { surveyResultQueryKey } from "@/queries/useSurveyResultQuery";
import { useAuthStore } from "@/stores/useAuthStore";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    return useAuthStore.subscribe((state, previousState) => {
      if (state.accessToken !== previousState.accessToken) {
        queryClient.removeQueries({ exact: true, queryKey: surveyResultQueryKey });
      }
    });
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
