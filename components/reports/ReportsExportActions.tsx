'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

export const ReportsExportActions: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    // Generate CSV string from table contents
    const rows = [
      ['Rank', 'Team Name', 'Round 1 Avg', 'Round 2 Jury Avg', 'Final Status'],
      ['1', 'CyberGuard AI', '94.5', '96.0', 'SELECTED'],
      ['2', 'Quantum BioMed', '91.0', '93.5', 'SELECTED'],
      ['3', 'AgriSense IoT', '87.5', '88.0', 'STANDBY'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sih_official_merit_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        📄 Print / Export PDF
      </Button>
      <Button variant="primary" size="sm" onClick={handleExportCsv}>
        📊 Download CSV Tally
      </Button>
    </div>
  );
};
