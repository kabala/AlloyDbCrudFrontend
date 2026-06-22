import { AppSidebar } from "@/components/organisms/app-sidebar";
import { AppTopbar } from "@/components/organisms/app-topbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <AppTopbar />
        <main className="mx-auto grid w-full max-w-7xl gap-6 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
