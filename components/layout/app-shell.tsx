import { PropsWithChildren } from "react";
import { TopHeader } from "./top-header";
import { BottomNav } from "./bottom-nav";

interface AppShellProps extends PropsWithChildren {
  location?: string;
}

export function AppShell({ children, location = "Sao Paulo, SP" }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <TopHeader location={location} />
      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">{children}</main>
      <BottomNav />
    </div>
  );
}
