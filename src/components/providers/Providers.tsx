"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import ApolloWrapper from "./ApolloWrapper";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider 
      // Force session to refresh every 5 minutes to catch changes
      refetchInterval={5 * 60}
      // Also refetch when window becomes focused
      refetchOnWindowFocus={true}
    >
      <ApolloWrapper>{children}</ApolloWrapper>
    </SessionProvider>
  );
}