import React from 'react';
import Link from 'next/link';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  baseUrl: string;
  tab?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalCount, pageSize, baseUrl, tab }) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (tab) params.set('tab', tab);
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 sm:px-6 mt-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <Link href={buildUrl(currentPage - 1)} className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}>
          <Button variant="outline" size="sm" disabled={currentPage <= 1}>Previous</Button>
        </Link>
        <Link href={buildUrl(currentPage + 1)} className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages}>Next</Button>
        </Link>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-700">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <Link
              href={buildUrl(currentPage - 1)}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </Link>
            
            <Link
              href={buildUrl(currentPage + 1)}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};
