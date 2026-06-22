import { Link } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { RoleName, roleLabels } from "@/api";
import { useAuth } from "@/app/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mobileLinks: Array<{ label: string; to: string; roles?: RoleName[] }> = [
  { label: "Panel", to: "/" },
  { label: "POS", to: "/pos", roles: ["Superadmin", "Vendedor"] },
  { label: "Clientes", to: "/customers" },
  { label: "Productos", to: "/products" },
  { label: "Ventas", to: "/sales" },
];

export function AppTopbar() {
  const auth = useAuth();
  const roleName = auth.user?.roles[0] ?? "Visualizador";
  const roleIndex = Object.entries(roleLabels).find(([, label]) => label === roleName)?.[0];
  const visibleLinks = mobileLinks.filter((link) => auth.hasAnyRole(link.roles));

  return (
    <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Menu className="size-5 text-muted-foreground lg:hidden" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{auth.user?.name ?? "Usuario"}</p>
          <p className="truncate text-xs text-muted-foreground">{auth.user?.email}</p>
        </div>
        {roleIndex ? <Badge variant="secondary">{roleLabels[Number(roleIndex)]}</Badge> : null}
      </div>
      <div className="hidden gap-1 md:flex lg:hidden">
        {visibleLinks.map((link) => (
          <Button asChild key={link.to} variant="ghost" size="sm">
            <Link to={link.to}>{link.label}</Link>
          </Button>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={auth.logout}>
        <LogOut />
        Salir
      </Button>
    </header>
  );
}
