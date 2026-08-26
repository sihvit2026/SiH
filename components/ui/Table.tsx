import React from 'react';

export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children, className = '', ...props
}) => (
  <div className={`w-full overflow-x-auto border border-slate-200 rounded bg-white ${className}`} {...props}>
    {children}
  </div>
);

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children, className = '', ...props
}) => (
  <table className={`w-full text-left text-sm text-slate-700 ${className}`} {...props}>
    {children}
  </table>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children, className = '', ...props
}) => (
  <thead className={`bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children, className = '', ...props
}) => (
  <tbody className={`divide-y divide-slate-100 ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children, className = '', ...props
}) => (
  <tr className={`hover:bg-slate-50 transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children, className = '', ...props
}) => (
  <th className={`px-4 py-3 font-semibold text-slate-600 ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children, className = '', ...props
}) => (
  <td className={`px-4 py-3 ${className}`} {...props}>
    {children}
  </td>
);
