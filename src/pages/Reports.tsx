import { useState, useEffect } from 'react';
import { ReportsList } from '../components/pagescomponents/reports/ReportsList';
import { reportCategories } from '../components/pagescomponents/reports/constants';

import type { ViewType, SaleInvoiceEditData } from '../types';
import { SaleReport } from '../components/pagescomponents/reports/transactionsreports/SaleReport';
import { PurchaseReport } from '../components/pagescomponents/reports/transactionsreports/PurchaseReport';
import { DaybookReport } from '../components/pagescomponents/reports/transactionsreports/DaybookReport';
import { AllTransactionsReport } from '../components/pagescomponents/reports/transactionsreports/AllTransactionsReport';
import { AllPartiesReport } from '../components/pagescomponents/reports/parties reports/AllPartiesReport';
import { PartyReport } from '../components/pagescomponents/reports/parties reports/PartyReport';
import { SalePurchaseByParty } from '../components/pagescomponents/reports/stockreport/SalePurchaseByParty';
import { LowStockDetails } from '../components/pagescomponents/reports/stockreport/LowStockDetails';
import { StockDetails } from '../components/pagescomponents/reports/stockreport/StockDetails';
import { ProfitAndLoss } from '../components/pagescomponents/reports/financialreports/ProfitAndLoss';
import { BillWiseProfit } from '../components/pagescomponents/reports/financialreports/BillWiseProfit';

interface ReportsProps {
  onViewChange?: (view: ViewType) => void;
  onEditInvoice?: (invoice: SaleInvoiceEditData) => void;
  initialReport?: { category: string; name: string } | null;
}

export function Reports({ onViewChange, onEditInvoice, initialReport }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<{ category: string; name: string } | null>(() => {
    if (initialReport) return initialReport;
    try {
      const saved = sessionStorage.getItem("pos_active_report");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handleSetActiveReport = (report: { category: string; name: string } | null) => {
    setActiveReport(report);
    try {
      if (report) {
        sessionStorage.setItem("pos_active_report", JSON.stringify(report));
      } else {
        sessionStorage.removeItem("pos_active_report");
      }
    } catch {}
  };

  useEffect(() => {
    if (initialReport) {
      handleSetActiveReport(initialReport);
    }
  }, [initialReport]);

  if (activeReport?.category === 'Transaction report') {
    if (activeReport.name === 'Sale') {
      return (
        <SaleReport 
          onBack={() => handleSetActiveReport(null)} 
          onViewChange={onViewChange!} 
          onEditInvoice={onEditInvoice!} 
        />
      );
    }
    if (activeReport.name === 'Purchase') {
      return <PurchaseReport onBack={() => handleSetActiveReport(null)} />;
    }
    if (activeReport.name === 'Day book') {
      return <DaybookReport onBack={() => handleSetActiveReport(null)} onEditInvoice={onEditInvoice!} />;
    }
    if (activeReport.name === 'All Transactions') {
      return <AllTransactionsReport onBack={() => handleSetActiveReport(null)} onEditInvoice={onEditInvoice!} />;
    }
  }

  if (activeReport?.category === 'Party Reports') {
    if (activeReport.name === 'All parties') {
      return <AllPartiesReport onBack={() => handleSetActiveReport(null)} />;
    }
    if (activeReport.name === 'Party report') {
      return <PartyReport onBack={() => handleSetActiveReport(null)} />;
    }
  }

  if (activeReport?.category === 'Financial Reports') {
    if (activeReport.name === 'Profit And Loss') {
      return <ProfitAndLoss onBack={() => handleSetActiveReport(null)} />;
    }
    if (activeReport.name === 'Bill Wise Profit') {
      return <BillWiseProfit onBack={() => handleSetActiveReport(null)} onEditInvoice={onEditInvoice} />;
    }
  }

  if (activeReport?.category === 'Item/Stock Reports') {
    if (activeReport.name === 'Sale Purchase By Party') {
      return <SalePurchaseByParty onBack={() => handleSetActiveReport(null)} />;
    }
    if (activeReport.name === 'Low stock details') {
      return <LowStockDetails onBack={() => handleSetActiveReport(null)} />;
    }
    if (activeReport.name === 'Stock details') {
      return <StockDetails onBack={() => handleSetActiveReport(null)} />;
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <ReportsList 
        categories={reportCategories} 
        onReportClick={(category, name) => handleSetActiveReport({ category, name })}
      />
    </div>
  );
}
