import { Card } from "@/components/ui/card";

type EntityTableProps = {
  columns: string[];
  children: React.ReactNode;
  empty?: string;
  isLoading?: boolean;
};

export function EntityTable({ columns, children, empty, isLoading }: EntityTableProps) {
  const hasRows = Boolean(children);
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-muted/70 text-left text-xs uppercase text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th className="px-4 py-3 font-semibold" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">{children}</tbody>
        </table>
      </div>
      {isLoading ? (
        <div className="grid min-h-28 place-items-center text-sm text-muted-foreground">
          Cargando datos...
        </div>
      ) : !hasRows && empty ? (
        <div className="grid min-h-28 place-items-center text-sm text-muted-foreground">
          {empty}
        </div>
      ) : null}
    </Card>
  );
}
