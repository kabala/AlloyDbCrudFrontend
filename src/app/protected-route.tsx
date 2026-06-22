import { Navigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { RoleName } from "@/api";
import { useAuth } from "@/app/auth";
import { Button } from "@/components/ui/button";

type ProtectedRouteProps = {
  roles?: RoleName[];
  children: React.ReactNode;
};

export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const auth = useAuth();

  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;

  if (!auth.hasAnyRole(roles)) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6">
        <section className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <ShieldAlert className="mb-4 size-9 text-destructive" />
          <h1 className="text-xl font-semibold">Acceso restringido</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Tu rol actual no tiene permiso para abrir este modulo.
          </p>
          <Button className="mt-5" type="button" onClick={auth.logout}>
            Cerrar sesion
          </Button>
        </section>
      </main>
    );
  }

  return children;
}
