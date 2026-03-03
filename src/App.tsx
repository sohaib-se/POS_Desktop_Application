import { useState } from "react";
import "./App.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/pages/Dashboard";
import { Parties } from "@/components/pages/Parties";
import { Items } from "@/components/pages/Items";
import { SaleInvoices } from "@/components/pages/SaleInvoices";
import { Estimates } from "@/components/pages/Estimates";
import { PaymentIn } from "@/components/pages/PaymentIn";
import { PaymentOut } from "@/components/pages/PaymentOut";
import { PurchaseBills } from "@/components/pages/PurchaseBills";
import { Expenses } from "@/components/pages/Expenses";
import { CashBank } from "@/components/pages/CashBank";
import { BankAccounts } from "@/components/pages/BankAccounts";
import { Cheques } from "@/components/pages/Cheques";
import { LoanAccounts } from "@/components/pages/LoanAccounts";
import { Reports } from "@/components/pages/Reports";
import { SettingsPage } from "@/components/pages/Settings";
import { Utilities } from "@/components/pages/Utilities";
import { SyncShare } from "@/components/pages/SyncShare";
import { EditProfile } from "@/components/pages/EditProfile";
import type { ViewType } from "@/types";

function App() {
  const [currentView, setCurrentView] = useState<ViewType>("home");

  const renderContent = () => {
    switch (currentView) {
      case "home":
        return <Dashboard />;
      case "parties":
        return <Parties />;
      case "items":
        return <Items />;
      case "sale-invoices":
        return <SaleInvoices />;
      case "estimates":
        return <Estimates />;
      case "payment-in":
        return <PaymentIn />;
      case "sale-return":
        return (
          <div className="p-6 text-gray-500">
            Sale Return / Credit Note - Coming Soon
          </div>
        );
      case "pos":
        return (
          <div className="p-6 text-gray-500">Vyapar POS - Coming Soon</div>
        );
      case "purchase-bills":
        return <PurchaseBills />;
      case "payment-out":
        return <PaymentOut />;
      case "expenses":
        return <Expenses />;
      case "purchase-return":
        return (
          <div className="p-6 text-gray-500">
            Purchase Return / Dr. Note - Coming Soon
          </div>
        );
      case "bank-accounts":
        return <BankAccounts />;
      case "cash-in-hand":
        return <CashBank subView={currentView} />;
      case "cheques":
        return <Cheques />;
      case "loan-accounts":
        return <LoanAccounts />;
      case "reports":
        return <Reports />;
      case "sync-share":
        return <SyncShare initialTab="sync-share" />;
      case "sync-auto-backup":
        return <SyncShare initialTab="auto-backup" />;
      case "sync-backup-computer":
        return <SyncShare initialTab="backup-computer" />;
      case "sync-backup-drive":
        return <SyncShare initialTab="backup-drive" />;
      case "sync-restore-backup":
        return <SyncShare initialTab="restore-backup" />;
      case "settings":
        return <SettingsPage />;
      case "utilities":
        return <Utilities />;
      case "utilities-import-items":
        return <Utilities initialTab="import-items" />;
      case "utilities-barcode":
        return <Utilities initialTab="barcode" />;
      case "utilities-bulk-update":
        return <Utilities initialTab="bulk-update" />;
      case "utilities-import-parties":
        return <Utilities initialTab="import-parties" />;
      case "utilities-export-tally":
        return <Utilities initialTab="export-tally" />;
      case "utilities-export-items":
        return <Utilities initialTab="export-items" />;
      case "utilities-verify-data":
        return <Utilities initialTab="verify-data" />;
      case "utilities-recycle-bin":
        return <Utilities initialTab="recycle-bin" />;
      case "edit-profile":
        return <EditProfile onBack={() => setCurrentView("home")} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Right Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onViewChange={setCurrentView} />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
      </div>
    </div>
  );
}

export default App;
