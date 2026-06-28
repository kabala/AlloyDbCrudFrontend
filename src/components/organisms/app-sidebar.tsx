import { Link } from "@tanstack/react-router";
import {
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  Home,
  Package,
  Receipt,
  RefreshCcw,
  ShoppingCart,
  Users,
} from "lucide-react";
import { RoleName } from "@/api";
import { useAuth } from "@/app/auth";
import { cn } from "@/lib/utils";

const navItems: Array<{
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: RoleName[];
}> = [
  { label: "Panel", to: "/", icon: Home },
  { label: "BI", to: "/bi", icon: ChartNoAxesCombined },
  { label: "POS", to: "/pos", icon: ShoppingCart, roles: ["Superadmin", "Vendedor"] },
  { label: "Clientes", to: "/customers", icon: Users },
  { label: "Productos", to: "/products", icon: Package },
  { label: "Inventario", to: "/inventory", icon: Boxes, roles: ["Superadmin", "Vendedor"] },
  { label: "Ventas", to: "/sales", icon: Receipt },
  { label: "Devoluciones", to: "/returns", icon: RefreshCcw, roles: ["Superadmin", "Vendedor"] },
  { label: "Usuarios", to: "/users", icon: ClipboardList, roles: ["Superadmin"] },
];

export function AppSidebar() {
  const auth = useAuth();
  const visibleItems = navItems.filter((item) => auth.hasAnyRole(item.roles));

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
      <div className="flex h-16 items-center border-b px-5">
        <div>
          <p className="text-sm font-semibold">Retail CRM/POS</p>
          <p className="text-xs text-muted-foreground">Operacion comercial</p>
        </div>
      </div>
      <nav className="grid gap-1 p-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              activeProps={{
                className: cn("bg-accent text-accent-foreground"),
              }}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
