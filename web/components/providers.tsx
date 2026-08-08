"use client";

import "@/config/amplify";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
