import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Gender, api, genderLabels } from "@/api";
import { useAuth } from "@/app/auth";
import { Field } from "@/components/molecules/field";
import { PageHeader } from "@/components/molecules/page-header";
import { PaginationBar } from "@/components/molecules/pagination-bar";
import { EntityTable } from "@/components/organisms/entity-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const customerSchema = z.object({
  customerId: z.string().min(1, "Requerido").max(50),
  age: z.coerce.number().min(0).max(130),
  gender: z.coerce.number(),
  city: z.string().min(1, "Requerido").max(120),
  email: z.string().email("Correo invalido").or(z.literal("")),
});

type CustomerForm = z.infer<typeof customerSchema>;

export function CustomersPage() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const query = useQuery({
    queryKey: ["customers", { page, city, gender }],
    queryFn: () =>
      api.customers.list({ page, pageSize: 25, city, gender: gender ? Number(gender) : undefined }),
  });
  const canCreate = auth.hasAnyRole(["Superadmin", "Vendedor"]);
  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerId: "",
      age: 18,
      gender: Gender.Unspecified,
      city: "",
      email: "",
    },
  });
  const create = useMutation({
    mutationFn: (values: CustomerForm) => api.customers.create(values),
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="CRM"
        title="Clientes"
        description="Gestiona perfiles de clientes usados en ventas POS y trazabilidad comercial."
      />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_220px_auto]">
          <Input
            placeholder="Filtrar ciudad"
            value={city}
            onChange={(event) => {
              setPage(1);
              setCity(event.target.value);
            }}
          />
          <Select
            value={gender}
            onChange={(event) => {
              setPage(1);
              setGender(event.target.value);
            }}
          >
            <option value="">Todos los generos</option>
            {Object.entries(genderLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCity("");
              setGender("");
              setPage(1);
            }}
          >
            Limpiar
          </Button>
        </CardContent>
      </Card>
      <EntityTable
        columns={["ID", "Correo", "Ciudad", "Edad", "Genero", "Estado"]}
        isLoading={query.isLoading}
        empty="No hay clientes."
      >
        {query.data?.items.map((customer) => (
          <tr key={customer.customerId}>
            <td className="px-4 py-3 font-medium">{customer.customerId}</td>
            <td className="px-4 py-3">{customer.email}</td>
            <td className="px-4 py-3">{customer.city}</td>
            <td className="px-4 py-3">{customer.age}</td>
            <td className="px-4 py-3">{genderLabels[customer.gender]}</td>
            <td className="px-4 py-3">{customer.isActive ? "Activo" : "Inactivo"}</td>
          </tr>
        ))}
      </EntityTable>
      {query.data ? (
        <PaginationBar
          page={page}
          pageSize={query.data.pageSize}
          total={query.data.total}
          onPageChange={setPage}
        />
      ) : null}
      {canCreate ? (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-5"
              onSubmit={form.handleSubmit((values) => create.mutate(values))}
            >
              <Field label="ID" error={form.formState.errors.customerId?.message}>
                <Input {...form.register("customerId")} />
              </Field>
              <Field label="Edad" error={form.formState.errors.age?.message}>
                <Input type="number" {...form.register("age")} />
              </Field>
              <Field label="Genero" error={form.formState.errors.gender?.message}>
                <Select {...form.register("gender")}>
                  {Object.entries(genderLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Ciudad" error={form.formState.errors.city?.message}>
                <Input {...form.register("city")} />
              </Field>
              <Field label="Correo" error={form.formState.errors.email?.message}>
                <Input {...form.register("email")} />
              </Field>
              <div className="md:col-span-5">
                {create.error ? (
                  <p className="mb-3 text-sm text-destructive">{create.error.message}</p>
                ) : null}
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                  Crear cliente
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
