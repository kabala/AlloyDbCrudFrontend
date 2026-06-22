import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/api";
import { useAuth } from "@/app/auth";
import { Field } from "@/components/molecules/field";
import { PageHeader } from "@/components/molecules/page-header";
import { PaginationBar } from "@/components/molecules/pagination-bar";
import { EntityTable } from "@/components/organisms/entity-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format";

const productSchema = z.object({
  productId: z.string().min(1, "Requerido").max(50),
  category: z
    .string()
    .min(1, "Requerido")
    .max(80)
    .refine((value) => value !== "???", "Categoria invalida."),
  color: z.string().min(1, "Requerido").max(50),
  size: z.string().max(20),
  season: z.string().max(40),
  supplierId: z.string().optional(),
  costPrice: z.coerce.number().min(0),
  listPrice: z.coerce.number().min(0),
});

type ProductForm = z.infer<typeof productSchema>;

export function ProductsPage() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [season, setSeason] = useState("");
  const query = useQuery({
    queryKey: ["products", { page, category, season }],
    queryFn: () => api.products.list({ page, pageSize: 25, category, season }),
  });
  const canCreate = auth.hasAnyRole(["Superadmin"]);
  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productId: "",
      category: "",
      color: "",
      size: "",
      season: "",
      supplierId: "",
      costPrice: 0,
      listPrice: 0,
    },
  });
  const create = useMutation({
    mutationFn: (values: ProductForm) =>
      api.products.create({
        ...values,
        supplierId: values.supplierId || null,
      }),
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Catalogo"
        title="Productos"
        description="Consulta productos activos y registra nuevos SKU con reglas de calidad del backend."
      />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto]">
          <Input
            placeholder="Filtrar categoria"
            value={category}
            onChange={(event) => {
              setPage(1);
              setCategory(event.target.value);
            }}
          />
          <Input
            placeholder="Filtrar temporada"
            value={season}
            onChange={(event) => {
              setPage(1);
              setSeason(event.target.value);
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCategory("");
              setSeason("");
              setPage(1);
            }}
          >
            Limpiar
          </Button>
        </CardContent>
      </Card>
      <EntityTable
        columns={[
          "SKU",
          "Categoria",
          "Color",
          "Talla",
          "Temporada",
          "Proveedor",
          "Costo",
          "Precio",
        ]}
        isLoading={query.isLoading}
        empty="No hay productos para los filtros actuales."
      >
        {query.data?.items.map((product) => (
          <tr key={product.productId}>
            <td className="px-4 py-3 font-medium">{product.productId}</td>
            <td className="px-4 py-3">{product.category}</td>
            <td className="px-4 py-3">{product.color}</td>
            <td className="px-4 py-3">{product.size || "-"}</td>
            <td className="px-4 py-3">{product.season || "-"}</td>
            <td className="px-4 py-3">{product.supplierName || product.supplierCode || "-"}</td>
            <td className="px-4 py-3">{formatMoney(product.costPrice)}</td>
            <td className="px-4 py-3 font-medium">{formatMoney(product.listPrice)}</td>
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
            <CardTitle>Nuevo producto</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-4"
              onSubmit={form.handleSubmit((values) => create.mutate(values))}
            >
              <Field label="SKU" error={form.formState.errors.productId?.message}>
                <Input {...form.register("productId")} />
              </Field>
              <Field label="Categoria" error={form.formState.errors.category?.message}>
                <Input {...form.register("category")} />
              </Field>
              <Field label="Color" error={form.formState.errors.color?.message}>
                <Input {...form.register("color")} />
              </Field>
              <Field label="Talla" error={form.formState.errors.size?.message}>
                <Input {...form.register("size")} />
              </Field>
              <Field label="Temporada" error={form.formState.errors.season?.message}>
                <Input {...form.register("season")} />
              </Field>
              <Field label="Proveedor ID" error={form.formState.errors.supplierId?.message}>
                <Input {...form.register("supplierId")} />
              </Field>
              <Field label="Costo" error={form.formState.errors.costPrice?.message}>
                <Input type="number" step="0.01" {...form.register("costPrice")} />
              </Field>
              <Field label="Precio lista" error={form.formState.errors.listPrice?.message}>
                <Input type="number" step="0.01" {...form.register("listPrice")} />
              </Field>
              <div className="md:col-span-4">
                {create.error ? (
                  <p className="mb-3 text-sm text-destructive">{create.error.message}</p>
                ) : null}
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                  Crear producto
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
