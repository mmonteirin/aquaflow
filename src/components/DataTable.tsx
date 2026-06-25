import type { ReactNode } from "react";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  accessorKey?: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

type SortDirection = "asc" | "desc" | null;

interface SortState<T> {
  column: Column<T> | null;
  direction: SortDirection;
}

function usePagination<T>(rows: T[], pageSize: number) {
  const [pageIndex, setPageIndex] = useState(0);

  const pageCount = Math.ceil(rows.length / pageSize);
  const paginatedRows = useMemo(() => {
    const start = pageIndex * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, pageIndex, pageSize]);

  const goToPage = (page: number) => {
    setPageIndex(Math.max(0, Math.min(page, pageCount - 1)));
  };

  const nextPage = () => goToPage(pageIndex + 1);
  const previousPage = () => goToPage(pageIndex - 1);
  const resetPage = () => setPageIndex(0);

  return {
    pageIndex,
    pageSize,
    pageCount,
    paginatedRows,
    totalRows: rows.length,
    goToPage,
    nextPage,
    previousPage,
    resetPage,
    hasNextPage: pageIndex < pageCount - 1,
    hasPreviousPage: pageIndex > 0,
  };
}

function useSorting<T>() {
  const [sortState, setSortState] = useState<SortState<T>>({
    column: null,
    direction: null,
  });

  const toggleSort = (column: Column<T>) => {
    setSortState((prev) => {
      if (prev.column === column) {
        if (prev.direction === "asc") return { column, direction: "desc" };
        if (prev.direction === "desc") return { column, direction: null };
        return { column, direction: "asc" };
      }
      return { column, direction: "asc" };
    });
  };

  const resetSort = () => {
    setSortState({ column: null, direction: null });
  };

  return { sortState, toggleSort, resetSort };
}

function getCellValue<T>(row: T, accessorKey?: string): unknown {
  if (!accessorKey) return null;
  const keys = accessorKey.split(".");
  let value: unknown = row;
  for (const key of keys) {
    if (value == null) return null;
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}

function sortRows<T>(rows: T[], sortState: SortState<T>): T[] {
  if (!sortState.column || !sortState.direction) return rows;

  const { column, direction } = sortState;
  const multiplier = direction === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    const aValue = getCellValue(a, column.accessorKey);
    const bValue = getCellValue(b, column.accessorKey);

    if (aValue == null) return 1;
    if (bValue == null) return -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue as string, "pt-BR") * multiplier;
    }

    if (aValue < bValue) return -1 * multiplier;
    if (aValue > bValue) return 1 * multiplier;
    return 0;
  });
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  pagination,
  enableSorting = true,
  enableSelection = false,
  onSelectionChange,
  emptyMessage = "Nenhum dado encontrado.",
}: {
  columns: Column<T>[];
  rows: T[];
  getRowId?: (row: T, index: number) => string;
  pagination?: PaginationState;
  enableSorting?: boolean;
  enableSelection?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  emptyMessage?: string;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { sortState, toggleSort, resetSort } = useSorting<T>();

  const sortedRows = useMemo(() => {
    return sortRows(rows, sortState);
  }, [rows, sortState]);

  const {
    pageIndex,
    pageSize,
    pageCount,
    paginatedRows,
    totalRows,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
  } = usePagination<T>(sortedRows, pagination?.pageSize ?? sortedRows.length);

  const handleSelectAll = (checked: boolean) => {
    const newSelectedIds = new Set<string>();
    if (checked) {
      paginatedRows.forEach((row, index) => {
        newSelectedIds.add(getRowId?.(row, index) ?? index.toString());
      });
    }
    setSelectedIds(newSelectedIds);
    if (onSelectionChange) {
      onSelectionChange(checked ? paginatedRows : []);
    }
  };

  const handleSelectRow = (row: T, index: number, checked: boolean) => {
    const id = getRowId?.(row, index) ?? index.toString();
    const newSelectedIds = new Set(selectedIds);
    if (checked) {
      newSelectedIds.add(id);
    } else {
      newSelectedIds.delete(id);
    }
    setSelectedIds(newSelectedIds);
    if (onSelectionChange) {
      const selectedRows = paginatedRows.filter((r, i) =>
        newSelectedIds.has(getRowId?.(r, i) ?? i.toString()),
      );
      onSelectionChange(selectedRows);
    }
  };

  const allSelected =
    paginatedRows.length > 0 &&
    paginatedRows.every((row, index) =>
      selectedIds.has(getRowId?.(row, index) ?? index.toString()),
    );

  const someSelected =
    paginatedRows.some((row, index) =>
      selectedIds.has(getRowId?.(row, index) ?? index.toString()),
    ) && !allSelected;

  const getSortIcon = (column: Column<T>) => {
    if (sortState.column !== column) {
      return <ChevronsUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />;
    }
    if (sortState.direction === "asc") {
      return <ChevronUp className="ml-1.5 h-3.5 w-3.5" />;
    }
    if (sortState.direction === "desc") {
      return <ChevronDown className="ml-1.5 h-3.5 w-3.5" />;
    }
    return <ChevronsUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />;
  };

  const renderSortButton = (column: Column<T>) => {
    if (!enableSorting || !column.sortable) {
      return <span className="ml-1.5 h-3.5 w-3.5" />;
    }

    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-1.5 h-auto p-0.5 hover:bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          toggleSort(column);
        }}
      >
        {getSortIcon(column)}
      </Button>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {enableSelection && (
                <TableHead className="w-[40px] px-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecionar todas as linhas"
                    data-state={
                      someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"
                    }
                  />
                </TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    "cursor-pointer select-none",
                    column.headerClassName,
                    column.className,
                  )}
                >
                  <div className="flex items-center">
                    {column.header}
                    {renderSortButton(column)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (enableSelection ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, rowIndex) => {
                const id = getRowId?.(row, rowIndex) ?? rowIndex.toString();
                const isSelected = selectedIds.has(id);

                return (
                  <TableRow
                    key={id}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(isSelected && "bg-muted/50")}
                  >
                    {enableSelection && (
                      <TableCell className="px-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectRow(row, rowIndex, checked as boolean)
                          }
                          aria-label={`Selecionar linha ${rowIndex + 1}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className={column.className}
                        data-accessor={column.accessorKey}
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {pagination && pageCount > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            {totalRows > 0
              ? `Mostrando ${pageIndex * pageSize + 1} a ${Math.min(
                  (pageIndex + 1) * pageSize,
                  totalRows,
                )} de ${totalRows} registros`
              : "Nenhum registro"}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(0)}
              disabled={!hasPreviousPage}
              aria-label="Primeira página"
            >
              ««
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={!hasPreviousPage}
              aria-label="Página anterior"
            >
              «
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {pageIndex + 1} de {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={!hasNextPage}
              aria-label="Próxima página"
            >
              »
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pageCount - 1)}
              disabled={!hasNextPage}
              aria-label="Última página"
            >
              »»
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
