import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/app/auth";
import { Field } from "@/components/molecules/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo valido."),
  password: z.string().min(6, "La contrasena es requerida."),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "vendedor@retail.local",
      password: "Vendedor#2026",
    },
  });

  async function onSubmit(values: LoginForm) {
    setError(null);
    try {
      await auth.login(values.email, values.password);
      await navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesion.");
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-2 grid size-10 place-items-center rounded-md bg-accent text-accent-foreground">
          <LockKeyhole className="size-5" />
        </div>
        <CardTitle>Ingresar al CRM/POS</CardTitle>
        <CardDescription>Usa una cuenta demo del backend local o desplegado.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Field label="Correo" error={form.formState.errors.email?.message}>
            <Input autoComplete="email" {...form.register("email")} />
          </Field>
          <Field label="Contrasena" error={form.formState.errors.password?.message}>
            <Input type="password" autoComplete="current-password" {...form.register("password")} />
          </Field>
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
            Entrar
          </Button>
        </form>
        <div className="mt-5 rounded-md bg-muted p-3 text-xs leading-5 text-muted-foreground">
          <p>Superadmin: superadmin@retail.local / Superadmin#2026</p>
          <p>Vendedor: vendedor@retail.local / Vendedor#2026</p>
          <p>Visualizador: viewer@retail.local / Viewer#2026</p>
        </div>
      </CardContent>
    </Card>
  );
}
