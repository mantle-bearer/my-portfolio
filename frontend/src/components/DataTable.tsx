import type { ReactNode } from "react";

import { EmptyState } from "@/components/ui";

type DataTableProps<T> = {
  headers: string[];
  rows: T[];
  empty: string;
  renderRow: (row: T) => ReactNode;
  renderMobileRow: (row: T) => ReactNode;
};

export function DataTable<T>({ headers, rows, empty, renderRow, renderMobileRow }: DataTableProps<T>) {
  return (
    <section className="table-shell">
      <table className="desktop-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map(renderRow)
          ) : (
            <tr>
              <td colSpan={headers.length}>
                <EmptyState>{empty}</EmptyState>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="mobile-list">
        {rows.length ? rows.map(renderMobileRow) : <EmptyState>{empty}</EmptyState>}
      </div>
    </section>
  );
}
