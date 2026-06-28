import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useState } from "react";
import { saleStatusLabels, api } from "@/api";
import { useAuth } from "@/app/auth";
import { SaleStatusBadge } from "@/components/atoms/status-badge";
import { PageHeader } from "@/components/molecules/page-header";
import { PaginationBar } from "@/components/molecules/pagination-bar";
import { EntityTable } from "@/components/organisms/entity-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatMoney } from "@/lib/format";

export function SalesPage() {
  const auth = useAuth();
  const [page, setPage] = useState(1);
  const [storeId, setStoreId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const stores = useQuery({ queryKey: ["stores"], queryFn: api.stores.list });
  const sales = useQuery({
    queryKey: ["sales", { page, storeId, customerId, status, fromDate, toDate }],
    queryFn: () =>
      api.sales.list({
        page,
        pageSize: 25,
        storeId,
        customerId,
        fromDate,
        toDate,
        status: status ? Number(status) : undefined,
      }),
  });

  return (
    <>
      <PageHeader
        eyebrow="POS"
        title="Ventas"
        description="Listado operacional de transacciones registradas en el backend."
        actions={
          auth.hasAnyRole(["Superadmin", "Vendedor"]) ? (
            <Button asChild>
              <Link to="/pos">Nueva venta</Link>
            </Button>
          ) : undefined
        }
      />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[220px_1fr_160px_160px_180px_auto]">
          <Select
            value={storeId}
            onChange={(event) => {
              setPage(1);
              setStoreId(event.target.value);
            }}
          >
            <option value="">Todas las tiendas</option>
            {stores.data?.map((store) => (
              <option key={store.storeId} value={store.storeId}>
                {store.storeName}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Cliente ID"
            value={customerId}
            onChange={(event) => {
              setPage(1);
              setCustomerId(event.target.value);
            }}
          />
          <Input
            type="date"
            value={fromDate}
            onChange={(event) => {
              setPage(1);
              setFromDate(event.target.value);
            }}
          />
          <Input
            type="date"
            value={toDate}
            onChange={(event) => {
              setPage(1);
              setToDate(event.target.value);
            }}
          />
          <Select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            <option value="">Todos</option>
            {Object.entries(saleStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStoreId("");
              setCustomerId("");
              setStatus("");
              setFromDate("");
              setToDate("");
              setPage(1);
            }}
          >
            Limpiar
          </Button>
        </CardContent>
      </Card>
      <EntityTable
        columns={["Venta", "Fecha", "Tienda", "Cliente", "Estado", "Cantidad", "Total", ""]}
        isLoading={sales.isLoading}
        empty="No hay ventas."
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
            <td className="px-4 py-3">{sale.totalQuantity}</td>
            <td className="px-4 py-3 font-semibold">{formatMoney(sale.totalRevenue)}</td>
            <td className="px-4 py-3 text-right">
              <Button asChild variant="outline" size="sm">
                <Link to="/sales/$transactionId" params={{ transactionId: sale.transactionId }}>
                  <Eye />
                  Ver
                </Link>
              </Button>
            </td>
          </tr>
        ))}
      </EntityTable>
      {sales.data ? (
        <PaginationBar
          page={page}
          pageSize={sales.data.pageSize}
          total={sales.data.total}
          onPageChange={setPage}
        />
      ) : null}
    </>
  );
}
