import React, { type FC, type ReactNode, type MouseEventHandler } from "react";
import { Icon } from "../../ui";
import { Select } from "../forms/Select";
import { useTheme } from "../../../contexts/ThemeContext";

// ── Token map ────────────────────────────────────────────────────────────────
const t = {
  light: {
    shell:         "border-[#F0D9B0] bg-[#FDF6ED]",
    divider:       "divide-[#F0D9B0]",
    thead:         "bg-[#E8640A] border-b-2 border-[#D05500]",
    thText:        "text-white",
    thSortHover:   "hover:bg-[#D05500]",
    thActive:      "text-[#FFE0A0]",
    sortIcon:      "text-white/40",
    sortIconActive:"text-[#FFE0A0]",
    tdText:        "text-slate-800",
    rowHover:      "hover:bg-[#FFF0DC]",
    pagination:    "border-[#F0D9B0] bg-[#FFF8EE]",
    pageMuted:     "text-[#8C5C20]",        // darkened: was #B07030 (too light on beige)
    pageAccent:    "text-[#C85500]",        // darkened: was #E8640A (insufficient on white)
    pageBtn:       "text-[#8C5C20] hover:bg-[#FFE4B8] hover:text-[#C85500]",
    pageBtnActive: "bg-[#E8640A] text-white",
  },
  dark: {
    shell:         "border-[#4A2800] bg-[#1E1008]",
    divider:       "divide-[#3A1E08]",
    thead:         "bg-[#6B3010] border-b-2 border-[#5A2808]",
    thText:        "text-[#FFD09A]",
    thSortHover:   "hover:bg-[#5A2808]",
    thActive:      "!text-[#FFBA50]",
    sortIcon:      "text-[#FFD09A]/30",
    sortIconActive:"text-[#FFBA50]",
    tdText:        "text-[#F5D9B0]",
    rowHover:      "hover:bg-[#2A1408]",
    pagination:    "border-[#4A2800] bg-[#160C04]",
    pageMuted:     "text-[#A07040]",
    pageAccent:    "text-[#F5962A]",
    pageBtn:       "text-[#A07040] hover:bg-[#3A1E08] hover:text-[#F5962A]",
    pageBtnActive: "bg-[#E8640A] text-white",
  },
} as const;

// Badge token sets (export so consumers can use them directly)
export const badgeTokens = {
  light: {
    confirmed: "bg-[#D4EDBA] text-[#2E6010]",
    pending:   "bg-[#FFE4B8] text-[#7A3D00]",
    cancelled: "bg-[#FCCACA] text-[#8B1A1A]",
  },
  dark: {
    confirmed: "bg-[#1A2E10] text-[#7DC45A]",
    pending:   "bg-[#3A1E08] text-[#F5962A]",
    cancelled: "bg-[#2E1010] text-[#F09090]",
  },
} as const;

// Helper — reads isDark from the global ThemeProvider
const useTk = () => {
  const { isDark } = useTheme();
  return isDark ? t.dark : t.light;
};

/* =========================
   TABLE
========================= */
export const Table: FC<{ children: ReactNode }> = ({ children }) => {
  const tk = useTk();
  return (
    <div className={`rounded-2xl border-[1.5px] overflow-hidden ${tk.shell}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          {children}
        </table>
      </div>
    </div>
  );
};

/* =========================
   HEADER
========================= */
export const TableHeader: FC<{ children: ReactNode }> = ({ children }) => {
  const tk = useTk();
  return <thead className={tk.thead}>{children}</thead>;
};

/* =========================
   BODY
========================= */
export const TableBody: FC<{ children: ReactNode }> = ({ children }) => {
  const tk = useTk();
  return <tbody className={`divide-y ${tk.divider}`}>{children}</tbody>;
};

/* =========================
   ROW
========================= */
export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  { children: ReactNode; className?: string; onClick?: MouseEventHandler<HTMLTableRowElement> }
>(({ children, className = "", onClick }, ref) => {
  const tk = useTk();
  return (
    <tr
      ref={ref}
      onClick={onClick}
      className={[
        "transition-colors last:border-b-0",
        onClick ? `cursor-pointer ${tk.rowHover}` : "",
        className,
      ].join(" ")}
    >
      {children}
    </tr>
  );
});
TableRow.displayName = "TableRow";

/* =========================
   CELL (WITH SORTABLE)
========================= */
interface TableCellProps<T = string> {
  children?: ReactNode;
  colSpan?: number;
  rowSpan?: number;
  isHeader?: boolean;
  className?: string;
  align?: "left" | "center" | "right";
  sortKey?: T;
  currentSort?: { key: T; direction: "asc" | "desc" };
  onSort?: (key: T) => void;
}

export const TableCell = <T extends string = string>({
  children,
  colSpan,
  rowSpan,
  isHeader,
  className = "",
  align = "left",
  sortKey,
  currentSort,
  onSort,
}: TableCellProps<T>) => {
  const tk         = useTk();
  const Tag        = isHeader ? "th" : "td";
  const isSortable = isHeader && sortKey && onSort;
  const isActive   = currentSort?.key === sortKey;

  const alignClass =
    align === "center" ? "text-center" :
    align === "right"  ? "text-right"  : "text-left";

  return (
    <Tag
      colSpan={colSpan}
      rowSpan={rowSpan}
      onClick={() => isSortable && onSort!(sortKey!)}
      className={[
        "px-4 py-3 whitespace-nowrap",
        isHeader
          ? `font-['Fredoka',sans-serif] font-medium text-[13px] tracking-wide ${tk.thText}`
          : tk.tdText,
        isActive    ? tk.thActive : "",
        isSortable  ? `cursor-pointer ${tk.thSortHover} transition-colors` : "",
        alignClass,
        rowSpan && rowSpan > 1 ? "align-top" : "",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center gap-1.5",
          align === "center" ? "justify-center" :
          align === "right"  ? "justify-end"    : "",
        ].join(" ")}
      >
        {children}

        {isSortable && (
          <div className="flex flex-col leading-none ml-0.5">
            <Icon
              iconName="FaChevronUp"
              size={9}
              className={
                isActive && currentSort?.direction === "asc"
                  ? tk.sortIconActive
                  : tk.sortIcon
              }
            />
            <Icon
              iconName="FaChevronDown"
              size={9}
              className={
                isActive && currentSort?.direction === "desc"
                  ? tk.sortIconActive
                  : tk.sortIcon
              }
            />
          </div>
        )}
      </div>
    </Tag>
  );
};

/* =========================
   PAGINATION
========================= */
interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  totalResults: number;
  pageSize: number;
}

export const TablePagination: FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onPageSizeChange,
  totalResults,
  pageSize,
}) => {
  const tk    = useTk();
  const start = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end   = Math.min(currentPage * pageSize, totalResults);

  const pageSizeOptions = [
    { value: "10",  label: "10"  },
    { value: "25",  label: "25"  },
    { value: "50",  label: "50"  },
    { value: "100", label: "100" },
  ];

  const getPages = () => {
    if (totalPages <= 3) return [...Array(totalPages)].map((_, i) => i + 1);
    if (currentPage <= 2)              return [1, 2, 3];
    if (currentPage >= totalPages - 1) return [totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  return (
    <div className={`flex flex-col lg:flex-row items-center justify-between gap-3 px-4 py-3 border-[1.5px] rounded-2xl font-['Nunito',sans-serif] ${tk.pagination}`}>

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs ${tk.pageMuted}`}>Show</span>
          <div className="w-20">
            <Select
              value={pageSize.toString()}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              options={pageSizeOptions}
              fullWidth
            />
          </div>
          <span className={`text-xs ${tk.pageMuted}`}>per page</span>
        </div>

        <span className={`text-xs ${tk.pageMuted}`}>
          Showing{" "}
          <span className={`font-bold ${tk.pageAccent}`}>{start}</span>
          {" – "}
          <span className={`font-bold ${tk.pageAccent}`}>{end}</span>
          {" of "}
          <span className={`font-bold ${tk.pageAccent}`}>{totalResults}</span>
        </span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${tk.pageBtn}`}
        >
          <Icon iconName="FaChevronLeft" size={10} />
        </button>

        {getPages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={[
              "w-8 h-8 rounded-lg text-xs font-bold transition-colors",
              currentPage === page ? tk.pageBtnActive : tk.pageBtn,
            ].join(" ")}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${tk.pageBtn}`}
        >
          <Icon iconName="FaChevronRight" size={10} />
        </button>
      </div>
    </div>
  );
};