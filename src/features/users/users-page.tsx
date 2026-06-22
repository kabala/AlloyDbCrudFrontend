import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Roles, api, roleLabels } from "@/api";
import { Field } from "@/components/molecules/field";
import { PageHeader } from "@/components/molecules/page-header";
import { PaginationBar } from "@/components/molecules/pagination-bar";
import { EntityTable } from "@/components/organisms/entity-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";

const userSchema = z.object({
  fullName: z.string().min(1, "Requerido").max(200),
  email: z.string().email("Correo invalido").max(256),
  password: z.string().min(8, "Minimo 8 caracteres").max(128),
  role: z.coerce.number(),
});

type UserForm = z.infer<typeof userSchema>;

export function UsersPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const users = useQuery({
    queryKey: ["users", { page }],
    queryFn: () => api.users.list({ page, pageSize: 25 }),
  });
  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: Roles.Vendedor,
    },
  });
  const create = useMutation({
    mutationFn: (values: UserForm) => api.users.create(values),
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Seguridad"
        title="Usuarios"
        description="Administracion de cuentas y roles operativos del CRM/POS."
      />
      <EntityTable
        columns={["Nombre", "Correo", "Rol", "Estado", "Creado"]}
        isLoading={users.isLoading}
        empty="No hay usuarios."
      >
        {users.data?.items.map((user) => (
          <tr key={user.id}>
            <td className="px-4 py-3 font-medium">{user.fullName}</td>
            <td className="px-4 py-3">{user.email}</td>
            <td className="px-4 py-3">{roleLabels[user.role]}</td>
            <td className="px-4 py-3">{user.isActive ? "Activo" : "Inactivo"}</td>
            <td className="px-4 py-3">{formatDateTime(user.createdAt)}</td>
          </tr>
        ))}
      </EntityTable>
      {users.data ? (
        <PaginationBar
          page={page}
          pageSize={users.data.pageSize}
          total={users.data.total}
          onPageChange={setPage}
        />
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Nuevo usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-4"
            onSubmit={form.handleSubmit((values) => create.mutate(values))}
          >
            <Field label="Nombre" error={form.formState.errors.fullName?.message}>
              <Input {...form.register("fullName")} />
            </Field>
            <Field label="Correo" error={form.formState.errors.email?.message}>
              <Input {...form.register("email")} />
            </Field>
            <Field label="Contrasena" error={form.formState.errors.password?.message}>
              <Input type="password" {...form.register("password")} />
            </Field>
            <Field label="Rol" error={form.formState.errors.role?.message}>
              <Select {...form.register("role")}>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="md:col-span-4">
              {create.error ? (
                <p className="mb-3 text-sm text-destructive">{create.error.message}</p>
              ) : null}
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                Crear usuario
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
