import { Search } from 'lucide-react';
import { Button } from './Button';

function normalizeRows(rows) {
  if (Array.isArray(rows)) return rows;
  if (rows && Array.isArray(rows.data)) return rows.data;
  if (rows && Array.isArray(rows.items)) return rows.items;
  return [];
}

export function DataTable({ columns, rows = [], loading, empty, search, onSearch, page, totalPages, onPage }) {
  const normalizedRows = normalizeRows(rows);

  return (
    <div className="rounded-md border border-line bg-white shadow-soft">
      {onSearch && (
        <div className="flex items-center gap-2 border-b border-line p-3">
          <Search className="h-4 w-4 text-steel" />
          <input
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search"
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wide text-steel">
            <tr>
              {columns.map((column) => <th key={column.key} className="px-4 py-3 font-semibold">{column.header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <tr><td className="px-4 py-8 text-center text-steel" colSpan={columns.length}>Loading data...</td></tr>}
            {!loading && normalizedRows.length === 0 && <tr><td className="px-4 py-8 text-center text-steel" colSpan={columns.length}>{empty || 'No records found.'}</td></tr>}
            {!loading && normalizedRows.map((row) => (
              <tr key={row.id || JSON.stringify(row)} className="hover:bg-surface/70">
                {columns.map((column) => (
                  <td key={column.key} className="whitespace-nowrap px-4 py-3 align-top text-ink">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-steel">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
            <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
