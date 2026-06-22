import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { api } from "@/api";
import { salesDetailRoute } from "@/app/router";
import { SaleStatusBadge } from "@/components/atoms/status-badge";
import { PageHeader } from "@/components/molecules/page-header";
import { EntityTable } from "@/components/organisms/entity-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

export function SalesDetailPage() {
  const { transactionId } = salesDetailRoute.useParams();
  const sale = useQuery({
    queryKey: ["sales", transactionId],
    queryFn: () => api.sales.get(transactionId),
  });

  return (
    <>
      <PageHeader
        eyebrow="Detalle"
        title={`Venta ${transactionId}`}
        description="Comprobante operacional con lineas, descuentos, ingresos y margen."
        actions={
          <Button asChild variant="outline">
            <Link to="/sales">
              <ArrowLeft />
              Volver
            </Link>
          </Button>
        }
      />
      {sale.data ? (
        <>
          <Card>
            <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="font-medium">{sale.data.date}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tienda</p>
                <p className="font-medium">{sale.data.storeName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="font-medium">{sale.data.customerId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <SaleStatusBadge status={sale.data.status} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-semibold">{formatMoney(sale.data.totalRevenue)}</p>
              </div>
            </CardContent>
          </Card>
          <EntityTable
            columns={["Producto", "Cantidad", "Descuento", "Precio", "Costo", "Ingreso", "Margen"]}
          >
            {sale.data.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">{item.productId}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{Math.round(item.discount * 100)}%</td>
                <td className="px-4 py-3">{formatMoney(item.unitListPrice)}</td>
                <td className="px-4 py-3">{formatMoney(item.unitCostPrice)}</td>
                <td className="px-4 py-3 font-medium">{formatMoney(item.revenue)}</td>
                <td className="px-4 py-3">{formatMoney(item.margin)}</td>
              </tr>
            ))}
          </EntityTable>
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            {sale.isLoading ? "Cargando venta..." : "Venta no encontrada."}
          </CardContent>
        </Card>
      )}
    </>
  );
}
