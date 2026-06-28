import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, genderLabels } from "@/api";
import { MetricCard } from "@/components/atoms/metric-card";
import { PageHeader } from "@/components/molecules/page-header";
import { EntityTable } from "@/components/organisms/entity-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatInteger, formatMoney, formatPercent } from "@/lib/format";
import { BarChart3, DollarSign, RotateCcw, ShoppingBasket } from "lucide-react";

const defaultFromDate = "2020-01-01";
const defaultToDate = "2024-12-31";

export function BiDashboardPage() {
  const [draftFromDate, setDraftFromDate] = useState(defaultFromDate);
  const [draftToDate, setDraftToDate] = useState(defaultToDate);
  const [appliedFromDate, setAppliedFromDate] = useState(defaultFromDate);
  const [appliedToDate, setAppliedToDate] = useState(defaultToDate);

  const query = { fromDate: appliedFromDate, toDate: appliedToDate };
  const dashboard = useQuery({
    queryKey: ["bi", "dashboard", query],
    queryFn: () => api.bi.dashboard(query),
  });
  const abc = useQuery({
    queryKey: ["bi", "abc", query],
    queryFn: () => api.bi.productAbc({ ...query, take: 10 }),
  });
  const rfm = useQuery({
    queryKey: ["bi", "rfm", query],
    queryFn: () => api.bi.customerRfm({ ...query, take: 10 }),
  });

  const summary = dashboard.data?.summary;

  return (
    <>
      <PageHeader
        eyebrow="BI"
        title="Analitica comercial"
        description="Modulo BI embebido sobre la misma base operacional sembrada en Cloud SQL. Resume revenue, margen, devoluciones, descuentos, tiendas, clientes y productos sin mover la logica al frontend."
        actions={
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setAppliedFromDate(draftFromDate);
              setAppliedToDate(draftToDate);
            }}
          >
            <label className="grid gap-1 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Desde</span>
              <Input
                type="date"
                value={draftFromDate}
                onChange={(event) => setDraftFromDate(event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Hasta</span>
              <Input
                type="date"
                value={draftToDate}
                onChange={(event) => setDraftToDate(event.target.value)}
              />
            </label>
            <Button type="submit">Aplicar</Button>
          </form>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={formatMoney(summary?.revenue ?? 0)}
          detail={`Tickets: ${formatInteger(summary?.transactions ?? 0)}`}
          icon={DollarSign}
        />
        <MetricCard
          label="Margen"
          value={formatMoney(summary?.margin ?? 0)}
          detail={`Margen %: ${formatPercent(summary?.marginRate ?? 0)}`}
          icon={BarChart3}
        />
        <MetricCard
          label="Devoluciones"
          value={formatPercent(summary?.returnRate ?? 0)}
          detail={`Descuento prom.: ${formatPercent(summary?.avgDiscount ?? 0)}`}
          icon={RotateCcw}
        />
        <MetricCard
          label="Unidades"
          value={formatInteger(summary?.unitsSold ?? 0)}
          detail={`Ticket prom.: ${formatMoney(summary?.avgTicket ?? 0)}`}
          icon={ShoppingBasket}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Revenue y margen anual" isLoading={dashboard.isLoading}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dashboard.data?.yearly ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatMoney(value)}
                labelFormatter={(label) => `Periodo: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#157f6b"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="margin"
                name="Margen"
                stroke="#22577a"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue mensual" isLoading={dashboard.isLoading}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboard.data?.monthly ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" minTickGap={24} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatMoney(value)}
                labelFormatter={(label) => `Periodo: ${label}`}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#157f6b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Categorias" isLoading={dashboard.isLoading}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={(dashboard.data?.categoryPerformance ?? []).slice(0, 5)}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="label" width={90} />
              <Tooltip formatter={(value: number) => formatMoney(value)} />
              <Bar dataKey="revenue" name="Revenue" fill="#22577a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue por m2" isLoading={dashboard.isLoading}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dashboard.data?.storePerformance ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" minTickGap={18} />
              <YAxis />
              <Tooltip formatter={(value: number) => formatMoney(value)} />
              <Bar dataKey="revenuePerM2" name="Revenue/m2" fill="#c97c2b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Impacto del descuento" isLoading={dashboard.isLoading}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dashboard.data?.discountImpact ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="discount" tickFormatter={(value) => formatPercent(Number(value))} />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === "Margen %" ? formatPercent(value) : formatMoney(value)
                }
              />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#157f6b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="marginRate" name="Margen %" fill="#9a3412" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <ChartCard title="Revenue por ciudad" isLoading={dashboard.isLoading}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dashboard.data?.cityPerformance ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatMoney(value)} />
              <Bar dataKey="revenue" name="Revenue" fill="#6b8e23" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle>Lectura ejecutiva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            {(dashboard.data?.recommendations ?? []).map((item) => (
              <p key={item}>{item}</p>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div>
          <EntityTable
            columns={["Rank", "Producto", "Clase", "Revenue", "Margen %", "Acum. %"]}
            isLoading={abc.isLoading}
            empty="No hay productos ABC para este rango."
          >
            {abc.data?.map((item) => (
              <tr key={item.productId}>
                <td className="px-4 py-3">{item.rank}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{item.productId}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.category} · {item.supplier}
                  </div>
                </td>
                <td className="px-4 py-3">{item.abcClass}</td>
                <td className="px-4 py-3">{formatMoney(item.revenue)}</td>
                <td className="px-4 py-3">{formatPercent(item.marginRate)}</td>
                <td className="px-4 py-3">{formatPercent(item.cumulativeRevenuePercent)}</td>
              </tr>
            ))}
          </EntityTable>
        </div>
        <div>
          <EntityTable
            columns={["Cliente", "Segmento", "RFM", "Monetary", "Recencia", "Perfil"]}
            isLoading={rfm.isLoading}
            empty="No hay clientes RFM para este rango."
          >
            {rfm.data?.map((item) => (
              <tr key={item.customerId}>
                <td className="px-4 py-3 font-medium">{item.customerId}</td>
                <td className="px-4 py-3">{item.segment}</td>
                <td className="px-4 py-3">
                  {item.rScore}/{item.fScore}/{item.mScore}
                </td>
                <td className="px-4 py-3">{formatMoney(item.monetary)}</td>
                <td className="px-4 py-3">{formatInteger(item.recencyDays)} dias</td>
                <td className="px-4 py-3">
                  {item.city} · {genderLabels[item.gender] ?? "N/D"}
                </td>
              </tr>
            ))}
          </EntityTable>
        </div>
      </section>
    </>
  );
}

function ChartCard({
  title,
  isLoading,
  children,
}: {
  title: string;
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">
            Cargando datos BI...
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
