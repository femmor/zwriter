"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import ApolloWrapper from "./ApolloWrapper";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ApolloWrapper>{children}</ApolloWrapper>
    </SessionProvider>
  );
}