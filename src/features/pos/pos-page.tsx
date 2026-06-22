import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Product, api, todayDateOnly } from "@/api";
import { Field } from "@/components/molecules/field";
import { PageHeader } from "@/components/molecules/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatMoney } from "@/lib/format";

type CartLine = {
  product: Product;
  quantity: number;
  discountPercent: number;
};

const saleSchema = z.object({
  transactionId: z.string().min(1, "Requerido").max(50),
  date: z.string().min(1, "Requerido"),
  storeId: z.string().min(1, "Selecciona una tienda."),
  customerId: z.string().min(1, "Selecciona un cliente."),
});

type SaleForm = z.infer<typeof saleSchema>;

export function PosPage() {
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [cart, setCart] = useState<CartLine[]>([]);
  const stores = useQuery({ queryKey: ["stores"], queryFn: api.stores.list });
  const customers = useQuery({
    queryKey: ["customers", "pos"],
    queryFn: () => api.customers.list({ pageSize: 100 }),
  });
  const products = useQuery({
    queryKey: ["products", "pos"],
    queryFn: () => api.products.list({ pageSize: 100 }),
  });
  const form = useForm<SaleForm>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      transactionId: `WEB-${Date.now()}`,
      date: todayDateOnly(),
      storeId: "",
      customerId: "",
    },
  });
  const totals = useMemo(() => {
    return cart.reduce(
      (acc, line) => {
        const discount = line.discountPercent / 100;
        const revenue = line.quantity * line.product.listPrice * (1 - discount);
        const margin =
          line.quantity * (line.product.listPrice * (1 - discount) - line.product.costPrice);
        return {
          quantity: acc.quantity + line.quantity,
          revenue: acc.revenue + revenue,
          margin: acc.margin + margin,
        };
      },
      { quantity: 0, revenue: 0, margin: 0 },
    );
  }, [cart]);
  const create = useMutation({
    mutationFn: (values: SaleForm) =>
      api.sales.create({
        ...values,
        items: cart.map((line) => ({
          productId: line.product.productId,
          quantity: line.quantity,
          discount: line.discountPercent / 100,
        })),
      }),
    onSuccess: async () => {
      setCart([]);
      form.reset({
        transactionId: `WEB-${Date.now()}`,
        date: todayDateOnly(),
        storeId: form.getValues("storeId"),
        customerId: "",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sales"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
      ]);
    },
  });

  function addProduct() {
    const product = products.data?.items.find((item) => item.productId === selectedProductId);
    if (!product || quantity < 1) return;
    setCart((current) => {
      const existing = current.find((line) => line.product.productId === product.productId);
      if (existing) {
        return current.map((line) =>
          line.product.productId === product.productId
            ? { ...line, quantity: line.quantity + quantity, discountPercent }
            : line,
        );
      }
      return [...current, { product, quantity, discountPercent }];
    });
    setSelectedProductId("");
    setQuantity(1);
    setDiscountPercent(0);
  }

  return (
    <>
      <PageHeader
        eyebrow="Punto de venta"
        title="Registrar venta"
        description="Crea transacciones con cliente, tienda, productos, cantidades y descuentos validados por el backend."
      />
      <form
        className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"
        onSubmit={form.handleSubmit((values) => create.mutate(values))}
      >
        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Datos de venta</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <Field label="Transaccion" error={form.formState.errors.transactionId?.message}>
                <Input {...form.register("transactionId")} />
              </Field>
              <Field label="Fecha" error={form.formState.errors.date?.message}>
                <Input type="date" {...form.register("date")} />
              </Field>
              <Field label="Tienda" error={form.formState.errors.storeId?.message}>
                <Select {...form.register("storeId")}>
                  <option value="">Seleccionar</option>
                  {stores.data?.map((store) => (
                    <option key={store.storeId} value={store.storeId}>
                      {store.storeName}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Cliente" error={form.formState.errors.customerId?.message}>
                <Select {...form.register("customerId")}>
                  <option value="">Seleccionar</option>
                  {customers.data?.items.map((customer) => (
                    <option key={customer.customerId} value={customer.customerId}>
                      {customer.customerId} · {customer.email}
                    </option>
                  ))}
                </Select>
              </Field>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Agregar productos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-[minmax(0,1fr)_110px_130px_auto]">
              <Select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
              >
                <option value="">Producto</option>
                {products.data?.items.map((product) => (
                  <option key={product.productId} value={product.productId}>
                    {product.productId} · {product.category} · {formatMoney(product.listPrice)}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={discountPercent}
                onChange={(event) => setDiscountPercent(Number(event.target.value))}
              />
              <Button type="button" onClick={addProduct}>
                <Plus />
                Agregar
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lineas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground">Agrega al menos un producto.</p>
              ) : null}
              {cart.map((line) => {
                const revenue =
                  line.quantity * line.product.listPrice * (1 - line.discountPercent / 100);
                return (
                  <div
                    className="grid gap-3 rounded-md border p-3 md:grid-cols-[minmax(0,1fr)_80px_90px_120px_auto]"
                    key={line.product.productId}
                  >
                    <div>
                      <p className="font-medium">{line.product.productId}</p>
                      <p className="text-sm text-muted-foreground">
                        {line.product.category} · {line.product.color}
                      </p>
                    </div>
                    <p>{line.quantity} und.</p>
                    <p>{line.discountPercent}% desc.</p>
                    <p className="font-semibold">{formatMoney(revenue)}</p>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() =>
                        setCart((current) =>
                          current.filter(
                            (item) => item.product.productId !== line.product.productId,
                          ),
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex justify-between text-sm">
              <span>Cantidad</span>
              <strong>{totals.quantity}</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span>Ingreso</span>
              <strong>{formatMoney(totals.revenue)}</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span>Margen estimado</span>
              <strong>{formatMoney(totals.margin)}</strong>
            </div>
            {create.error ? (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {create.error.message}
              </p>
            ) : null}
            {create.data ? (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                Venta {create.data.transactionId} creada.
              </p>
            ) : null}
            <Button type="submit" disabled={cart.length === 0 || create.isPending}>
              {create.isPending ? <Loader2 className="animate-spin" /> : null}
              Confirmar venta
            </Button>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
