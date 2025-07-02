import React, { useState, useMemo } from "react";

// Generic AdminTable component
export interface ColumnConfig<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
  filterable?: boolean;
  filterFn?: (row: T, filter: string) => boolean;
}

export interface AdminTableProps<T> {
  columns: ColumnConfig<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  pageSize?: number;
  filterText?: string;
  onFilterTextChange?: (text: string) => void;
}

export function AdminTable<T>({
  columns,
  data,
  rowKey,
  pageSize = 20,
  filterText = "",
  onFilterTextChange,
}: AdminTableProps<T>) {
  // Sorting state
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  // Pagination state
  const [page, setPage] = useState(0);

  // Filtering
  const filteredData = useMemo(() => {
    if (!filterText) return data;
    return data.filter((row) =>
      columns.some((col) => {
        if (col.filterable && col.filterFn) {
          return col.filterFn(row, filterText);
        }
        const value =
          typeof col.accessor === "function"
            ? col.accessor(row)
            : row[col.accessor as keyof T];
        return (
          value &&
          value.toString().toLowerCase().includes(filterText.toLowerCase())
        );
      })
    );
  }, [data, columns, filterText]);

  // Sorting
  const sortedData = useMemo(() => {
    if (sortCol === null) return filteredData;
    const col = columns[sortCol];
    return [...filteredData].sort((a, b) => {
      let aValue =
        typeof col.accessor === "function"
          ? col.accessor(a)
          : a[col.accessor as keyof T];
      let bValue =
        typeof col.accessor === "function"
          ? col.accessor(b)
          : b[col.accessor as keyof T];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDir === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDir === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [filteredData, columns, sortCol, sortDir]);

  // Pagination
  const pageCount = Math.ceil(sortedData.length / pageSize);
  const pagedData = useMemo(
    () => sortedData.slice(page * pageSize, (page + 1) * pageSize),
    [sortedData, page, pageSize]
  );

  // Handlers
  const handleSort = (idx: number) => {
    if (sortCol === idx) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(idx);
      setSortDir("asc");
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterTextChange?.(e.target.value);
    setPage(0);
  };

  return (
    <div>
      {onFilterTextChange && (
        <div className="mb-2">
          <input
            type="text"
            value={filterText}
            onChange={handleFilterChange}
            placeholder="Filter..."
            className="px-3 py-2 rounded border border-slate-600 bg-slate-900 text-slate-200"
          />
        </div>
      )}
      <table className="w-full">
        <thead className="bg-slate-700/50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={
                  col.className ||
                  "px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer select-none"
                }
                onClick={col.sortable ? () => handleSort(idx) : undefined}
              >
                {col.header}
                {col.sortable && sortCol === idx && (
                  <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {pagedData.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-slate-700/30">
              {columns.map((col, idx) => (
                <td
                  key={idx}
                  className="px-6 py-4 whitespace-nowrap text-sm text-slate-300"
                >
                  {typeof col.accessor === "function"
                    ? col.accessor(row)
                    : (row[col.accessor as keyof T] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
      {pageCount > 1 && (
        <div className="flex justify-end items-center mt-2 space-x-2">
          <button
            className="px-2 py-1 rounded bg-slate-700 text-slate-200 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Prev
          </button>
          <span className="text-slate-400 text-xs">
            Page {page + 1} of {pageCount}
          </span>
          <button
            className="px-2 py-1 rounded bg-slate-700 text-slate-200 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
