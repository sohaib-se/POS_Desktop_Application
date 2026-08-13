import { useState } from 'react';
import { ReportsList } from '../components/pagescomponents/reports/ReportsList';
import { reportCategories } from '../components/pagescomponents/reports/constants';

import type { ViewType, SaleInvoiceEditData } from '../types';
import { SaleReport } from '../components/pagescomponents/reports/transactionsreports/SaleReport';
import { PurchaseReport } from '../components/pagescomponents/reports/transactionsreports/PurchaseReport';
import { DaybookReport } from '../components/pagescomponents/reports/transactionsreports/DaybookReport';
import { AllTransactionsReport } from '../components/pagescomponents/reports/transactionsreports/AllTransactionsReport';
import { AllPartiesReport } from '../components/pagescomponents/reports/parties reports/AllPartiesReport';
import { PartyReport } from '../components/pagescomponents/reports/parties reports/PartyReport';
import { PartyWiseProfitLossReport } from '../components/pagescomponents/reports/parties reports/PartyWiseProfitLossReport';
import { PartyReportByItem } from '../components/pagescomponents/reports/parties reports/PartyReportByItem';
import { SalePurchaseByParty } from '../components/pagescomponents/reports/stockreport/SalePurchaseByParty';
import { LowStockDetails } from '../components/pagescomponents/reports/stockreport/LowStockDetails';
import { StockDetails } from '../components/pagescomponents/reports/stockreport/StockDetails';
import { StockInOutDetails } from '../components/pagescomponents/reports/stockreport/StockInOutDetails';
import { ProfitAndLoss } from '../components/pagescomponents/reports/financialreports/ProfitAndLoss';
import { BillWiseProfit } from '../components/pagescomponents/reports/financialreports/BillWiseProfit';
import { CashFlow } from '../components/pagescomponents/reports/financialreports/CashFlow';

interface ReportsProps {
  onViewChange?: (view: ViewType) => void;
  onEditInvoice?: (invoice: SaleInvoiceEditData) => void;
}

export function Reports({ onViewChange, onEditInvoice }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<{ category: string; name: string } | null>(null);

  if (activeReport?.category === 'Transaction report') {
    if (activeReport.name === 'Sale') {
      return (
        <SaleReport 
          onBack={() => setActiveReport(null)} 
          onViewChange={onViewChange!} 
          onEditInvoice={onEditInvoice!} 
        />
      );
    }
    if (activeReport.name === 'Purchase') {
      return <PurchaseReport onBack={() => setActiveReport(null)} />;
    }
    if (activeReport.name === 'Day book') {
      return <DaybookReport onBack={() => setActiveReport(null)} onEditInvoice={onEditInvoice!} />;
    }
    if (activeReport.name === 'All Transactions') {
      return <AllTransactionsReport onBack={() => setActiveReport(null)} onEditInvoice={onEditInvoice!} />;
    }
  }

  if (activeReport?.category === 'Party Reports') {
    if (activeReport.name === 'All parties') {
      return <AllPartiesReport onBack={() => setActiveReport(null)} />;
    }
    if (activeReport.name === 'Party report') {
      return <PartyReport onBack={() => setActiveReport(null)} />;
    }
    if (activeReport.name === 'Party wise Profit & Loss') {
      return <PartyWiseProfitLossReport onBack={() => setActiveReport(null)} />;
    }
    if (activeReport.name === 'Party Report By Item') {
      return <PartyReportByItem onBack={() => setActiveReport(null)} />;
    }
  }

  if (activeReport?.category === 'Financial Reports') {
    if (activeReport.name === 'Profit And Loss') {
      return <ProfitAndLoss onBack={() => setActiveReport(null)} />;
    }
    if (activeReport.name === 'Bill Wise Profit') {
      return <BillWiseProfit onBack={() => setActiveReport(null)} />;
    }
    if (activeReport.name === 'Cash flow') {
      return <CashFlow onBack={() => setActiveReport(null)} />;
    }
  }

  if (activeReport?.category === 'Item/Stock Reports') {
    if (activeReport.name === 'Sale Purchase By Party') {
      return <SalePurchaseByParty onBack={() => setActiveReport(null)} />;
    }
    if (activeReport.name === 'Low stock details') {
      return <LowStockDetails onBack={() => setActiveReport(null)} />;
    }
    if (activeReport.name === 'Stock details') {
      return <StockDetails onBack={() => setActiveReport(null)} />;
    }
    if (activeReport.name === 'Stock In/Stock out Details') {
      return <StockInOutDetails onBack={() => setActiveReport(null)} />;
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <ReportsList 
        categories={reportCategories} 
        onReportClick={(category, name) => setActiveReport({ category, name })}
      />
    </div>
  );
}
