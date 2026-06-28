import { useQuery } from "@tanstack/react-query";
import { Boxes, Package, Receipt, Store, Users } from "lucide-react";
import { api } from "@/api";
import { useAuth } from "@/app/auth";
import { MetricCard } from "@/components/atoms/metric-card";
import { SaleStatusBadge } from "@/components/atoms/status-badge";
import { PageHeader } from "@/components/molecules/page-header";
import { EntityTable } from "@/components/organisms/entity-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInteger, formatMoney } from "@/lib/format";

export function DashboardPage() {
  const auth = useAuth();
  const canSeeInventory = auth.hasAnyRole(["Superadmin", "Vendedor"]);
  const products = useQuery({
    queryKey: ["products", "dashboard"],
    queryFn: () => api.products.list({ pageSize: 1 }),
  });
  const customers = useQuery({
    queryKey: ["customers", "dashboard"],
    queryFn: () => api.customers.list({ pageSize: 1 }),
  });
  const sales = useQuery({
    queryKey: ["sales", "dashboard"],
    queryFn: () => api.sales.list({ pageSize: 8 }),
  });
  const stores = useQuery({ queryKey: ["stores"], queryFn: api.stores.list });
  const inventory = useQuery({
    queryKey: ["inventory", "dashboard"],
    queryFn: () => api.inventory.list({ pageSize: 1 }),
    enabled: canSeeInventory,
  });

  const revenue = sales.data?.items.reduce((sum, sale) => sum + sale.totalRevenue, 0) ?? 0;
  const margin = sales.data?.items.reduce((sum, sale) => sum + sale.totalMargin, 0) ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Operacion"
        title="Panel operativo"
        description="Resumen rapido de catalogo, clientes, ventas recientes e inventario conectado a la API."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Productos"
          value={formatInteger(products.data?.total ?? 0)}
          detail="Catalogo activo"
          icon={Package}
        />
        <MetricCard
          label="Clientes"
          value={formatInteger(customers.data?.total ?? 0)}
          detail="Perfiles CRM"
          icon={Users}
        />
        <MetricCard
          label="Ventas"
          value={formatInteger(sales.data?.total ?? 0)}
          detail={`Vista: ${formatMoney(revenue)}`}
          icon={Receipt}
        />
        <MetricCard
          label={canSeeInventory ? "Inventario" : "Tiendas"}
          value={formatInteger(
            canSeeInventory ? (inventory.data?.total ?? 0) : (stores.data?.length ?? 0),
          )}
          detail={canSeeInventory ? "Registros de stock" : "Puntos de venta"}
          icon={canSeeInventory ? Boxes : Store}
        />
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <EntityTable
            columns={["Venta", "Fecha", "Tienda", "Cliente", "Estado", "Total"]}
            isLoading={sales.isLoading}
            empty="No hay ventas registradas."
          >
            {sales.data?.items.map((sale) => (
              <tr key={sale.transactionId}>
                <td className="px-4 py-3 font-medium">{sale.transactionId}</td>
                <td className="px-4 py-3">{sale.date}</td>
                <td className="px-4 py-3">{sale.storeName || sale.storeId}</td>
                <td className="px-4 py-3">{sale.customerId}</td>
                <td className="px-4 py-3">
                  <SaleStatusBadge status={sale.status} />
                </td>
                <td className="px-4 py-3 font-medium">{formatMoney(sale.totalRevenue)}</td>
              </tr>
            ))}
          </EntityTable>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Margen de la vista</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatMoney(margin)}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Calculado solo sobre las ventas visibles en esta pagina. Los KPIs historicos de BI se
              generan fuera de esta aplicacion.
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
