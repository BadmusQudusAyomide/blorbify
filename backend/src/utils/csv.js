// Minimal RFC 4180 CSV serializer — the ledger export format is simple enough
// that a small dependency-free helper beats pulling in a CSV package.
function escapeCsvValue(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(rows, columns) {
  const header = columns.map((column) => escapeCsvValue(column.header)).join(',');
  const lines = rows.map((row) =>
    columns.map((column) => escapeCsvValue(row[column.key])).join(',')
  );
  return [header, ...lines].join('\r\n');
}
