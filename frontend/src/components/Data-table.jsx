import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function DataTable({ data, columns, searchKey, loading = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const { roleTheme } = useTheme();

  const filteredData = data.filter((item) => {
    if (!searchTerm || !searchKey) return true;
    return String(item[searchKey] || "").toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = String(a[sortColumn] || "");
    const bVal = String(b[sortColumn] || "");
    return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const handleSort = (column) => {
    if (sortColumn === column)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortColumn(column); setSortDirection("asc"); }
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <div className="h-10 animate-pulse rounded-lg" style={{ backgroundColor: roleTheme?.primaryMid || "#e5e7eb" }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-slate-50 dark:bg-slate-800/30 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex items-center gap-3 p-4 pb-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" style={{ color: roleTheme?.primary }} />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 rounded-lg"
            style={{ borderColor: roleTheme?.primaryBorder }}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-4 bg-white dark:bg-slate-800/40 dark:text-slate-300 rounded-lg"
          style={{ borderColor: roleTheme?.primaryBorder, color: roleTheme?.primaryText }}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow
              className="border-b dark:border-slate-600/30 dark:bg-slate-800/40"
              style={{ backgroundColor: roleTheme?.primaryLight, borderColor: roleTheme?.primaryBorder }}
            >
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`font-semibold py-3 px-4 text-sm ${column.sortable ? "cursor-pointer select-none" : ""}`}
                  style={{ color: roleTheme?.primaryText }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-xs font-bold" style={{ color: roleTheme?.primary }}>
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No results found</p>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow
                  key={item._id}
                  className="border-b dark:border-slate-700/30 transition-colors duration-200 hover:bg-opacity-50"
                  style={{ borderColor: roleTheme?.primaryBorder + "40" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = roleTheme?.primaryLight}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className="py-3 px-4 text-slate-700 dark:text-slate-200">
                      {column.render ? column.render(item) : String(item[column.key] || "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 text-sm text-slate-500 dark:text-slate-400">
        Showing{" "}
        <span className="font-semibold" style={{ color: roleTheme?.primary }}>{sortedData.length}</span>
        {" "}of{" "}
        <span className="font-semibold" style={{ color: roleTheme?.primary }}>{data.length}</span>
        {" "}records
        {searchTerm && (
          <span> for "<span className="font-medium" style={{ color: roleTheme?.primaryText }}>{searchTerm}</span>"</span>
        )}
      </div>
    </div>
  );
}
