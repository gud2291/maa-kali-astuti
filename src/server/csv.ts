import "server-only";

export type CsvColumn<T> = {
  header: string;
  value: (r: T) => string | number | null | undefined;
};

/**
 * Escape a CSV cell value according to RFC-4180 with spreadsheet formula-injection guard.
 */
export function escapeCsvCell(val: string | number | null | undefined): string {
  if (val == null) return '""';
  let str = String(val);
  // Formula injection defense: cells starting with = + - @ are prefixed with '
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  // RFC-4180 quoting: wrap in double quotes and escape internal quotes
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Format rows as RFC-4180 CSV string with UTF-8 BOM for proper Unicode rendering in Excel.
 */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const BOM = "\uFEFF";
  const headerLine = columns.map((col) => escapeCsvCell(col.header)).join(",");
  const dataLines = rows.map((row) =>
    columns.map((col) => escapeCsvCell(col.value(row))).join(","),
  );

  return BOM + [headerLine, ...dataLines].join("\r\n");
}
