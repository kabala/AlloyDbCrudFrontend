import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/api";
import { PageHeader } from "@/components/molecules/page-header";
import { PaginationBar } from "@/components/molecules/pagination-bar";
import { EntityTable } from "@/components/organisms/entity-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDateTime, formatInteger } from "@/lib/format";

export function InventoryPage() {
  const [page, setPage] = useState(1);
  const [storeId, setStoreId] = useState("");
  const [productId, setProductId] = useState("");
  const stores = useQuery({ queryKey: ["stores"], queryFn: api.stores.list });
  const inventory = useQuery({
    queryKey: ["inventory", { page, storeId, productId }],
    queryFn: () => api.inventory.list({ page, pageSize: 25, storeId, productId }),
  });

  return (
    <>
      <PageHeader
        eyebrow="Stock"
        title="Inventario"
        description="Consulta disponibilidad por tienda y producto. Las actualizaciones ocurren desde ventas y devoluciones."
      />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[240px_1fr_auto]">
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
            placeholder="Producto ID"
            value={productId}
            onChange={(event) => {
              setPage(1);
              setProductId(event.target.value);
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStoreId("");
              setProductId("");
              setPage(1);
            }}
          >
            Limpiar
          </Button>
        </CardContent>
      </Card>
      <EntityTable
        columns={["Producto", "Tienda", "Disponible", "Fisico", "Reservado", "Actualizado"]}
        isLoading={inventory.isLoading}
        empty="No hay inventario."
      >
        {inventory.data?.items.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3 font-medium">{item.productId}</td>
            <td className="px-4 py-3">{item.storeId}</td>
            <td className="px-4 py-3 font-semibold">{formatInteger(item.availableStock)}</td>
            <td className="px-4 py-3">{formatInteger(item.stockOnHand)}</td>
            <td className="px-4 py-3">{formatInteger(item.reservedStock)}</td>
            <td className="px-4 py-3">{formatDateTime(item.updatedAt)}</td>
          </tr>
        ))}
      </EntityTable>
      {inventory.data ? (
        <PaginationBar
          page={page}
          pageSize={inventory.data.pageSize}
          total={inventory.data.total}
          onPageChange={setPage}
        />
      ) : null}
    </>
  );
}
