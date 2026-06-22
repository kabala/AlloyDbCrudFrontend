import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ReturnReason, api, returnReasonLabels } from "@/api";
import { ReturnStatusBadge } from "@/components/atoms/status-badge";
import { Field } from "@/components/molecules/field";
import { PageHeader } from "@/components/molecules/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { todayDateOnly } from "@/api";

const returnSchema = z.object({
  transactionId: z.string().min(1, "Requerido").max(50),
  date: z.string().min(1, "Requerido"),
  reason: z.coerce.number(),
  notes: z.string().max(1000).optional(),
});

type ReturnForm = z.infer<typeof returnSchema>;

export function ReturnsPage() {
  const queryClient = useQueryClient();
  const form = useForm<ReturnForm>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      transactionId: "",
      date: todayDateOnly(),
      reason: ReturnReason.CustomerChange,
      notes: "",
    },
  });
  const create = useMutation({
    mutationFn: (values: ReturnForm) =>
      api.returns.create({ ...values, notes: values.notes || null }),
    onSuccess: async () => {
      form.reset({
        transactionId: "",
        date: todayDateOnly(),
        reason: ReturnReason.CustomerChange,
        notes: "",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sales"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
      ]);
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Postventa"
        title="Registrar devolucion"
        description="Marca una venta como devuelta y restaura inventario segun las reglas del backend."
      />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Datos de devolucion</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit((values) => create.mutate(values))}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Transaccion" error={form.formState.errors.transactionId?.message}>
                <Input {...form.register("transactionId")} />
              </Field>
              <Field label="Fecha" error={form.formState.errors.date?.message}>
                <Input type="date" {...form.register("date")} />
              </Field>
              <Field label="Motivo" error={form.formState.errors.reason?.message}>
                <Select {...form.register("reason")}>
                  {Object.entries(returnReasonLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Notas" error={form.formState.errors.notes?.message}>
              <Textarea {...form.register("notes")} />
            </Field>
            {create.error ? (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {create.error.message}
              </p>
            ) : null}
            {create.data ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                Devolucion {create.data.id} registrada.{" "}
                <ReturnStatusBadge status={create.data.status} />
              </div>
            ) : null}
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
              Registrar devolucion
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
