import React from "react";

// Generic AdminTable component
export interface ColumnConfig<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

export interface AdminTableProps<T> {
  columns: ColumnConfig<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
}

export function AdminTable<T>({ columns, data, rowKey }: AdminTableProps<T>) {
  return (
    <table className="w-full">
      <thead className="bg-slate-700/50">
        <tr>
          {columns.map((col, idx) => (
            <th
              key={idx}
              className={
                col.className ||
                "px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
              }
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-700">
        {data.map((row) => (
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
  );
}

// Specific table components
import { Player, WeeklyStat, Projection, TradeValue } from "@/lib/database";

export const PlayersTable: React.FC<{ data: Player[] }> = React.memo(
  ({ data }) => {
    const columns: ColumnConfig<Player>[] = [
      { header: "Name", accessor: "name" },
      { header: "Position", accessor: "position" },
      { header: "Team", accessor: "team" },
      { header: "Bye Week", accessor: "bye_week" },
      {
        header: "Status",
        accessor: (row) => (row.active ? "Active" : "Inactive"),
      },
    ];
    return (
      <AdminTable columns={columns} data={data} rowKey={(row) => row.id} />
    );
  }
);

export const StatsTable: React.FC<{
  data: WeeklyStat[];
  getPlayerName: (playerId: string | null) => string;
}> = React.memo(({ data, getPlayerName }) => {
  const columns: ColumnConfig<WeeklyStat>[] = [
    { header: "Player", accessor: (row) => getPlayerName(row.player_id) },
    { header: "Week", accessor: "week" },
    { header: "Fantasy Points", accessor: "fantasy_points" },
    { header: "Passing", accessor: "passing_yards" },
    { header: "Rushing", accessor: "rushing_yards" },
    { header: "Receiving", accessor: "receptions" },
  ];
  return <AdminTable columns={columns} data={data} rowKey={(row) => row.id} />;
});

export const ProjectionsTable: React.FC<{
  data: Projection[];
  getPlayerName: (playerId: string | null) => string;
}> = React.memo(({ data, getPlayerName }) => {
  const columns: ColumnConfig<Projection>[] = [
    { header: "Player", accessor: (row) => getPlayerName(row.player_id) },
    { header: "Week", accessor: "week" },
    { header: "Projected Points", accessor: "projected_points" },
    { header: "Type", accessor: "projection_type" },
    { header: "Confidence", accessor: "confidence_score" },
  ];
  return <AdminTable columns={columns} data={data} rowKey={(row) => row.id} />;
});

export const TradeValuesTable: React.FC<{
  data: TradeValue[];
  getPlayerName: (playerId: string | null) => string;
}> = React.memo(({ data, getPlayerName }) => {
  const columns: ColumnConfig<TradeValue>[] = [
    { header: "Player", accessor: (row) => getPlayerName(row.player_id) },
    { header: "Week", accessor: "week" },
    { header: "Trade Value", accessor: "trade_value" },
    { header: "Tier", accessor: "tier" },
  ];
  return <AdminTable columns={columns} data={data} rowKey={(row) => row.id} />;
});
