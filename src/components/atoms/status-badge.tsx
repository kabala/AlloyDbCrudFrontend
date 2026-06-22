import { SaleStatus, ReturnStatus, returnStatusLabels, saleStatusLabels } from "@/api";
import { Badge } from "@/components/ui/badge";

export function SaleStatusBadge({ status }: { status: number }) {
  const variant =
    status === SaleStatus.Completed
      ? "success"
      : status === SaleStatus.Returned
        ? "warning"
        : "outline";
  return <Badge variant={variant}>{saleStatusLabels[status] ?? "Desconocido"}</Badge>;
}

export function ReturnStatusBadge({ status }: { status: number }) {
  const variant =
    status === ReturnStatus.Approved
      ? "success"
      : status === ReturnStatus.Rejected
        ? "danger"
        : "warning";
  return <Badge variant={variant}>{returnStatusLabels[status] ?? "Desconocido"}</Badge>;
}
