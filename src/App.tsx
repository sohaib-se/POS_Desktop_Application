import { useState, useEffect } from "react";
import "./App.css";
import { Sidebar } from "@/components/common/Sidebar";
import { Header } from "@/components/common/Header";
import { EnterPasscodeScreen } from "@/components/common/EnterPasscodeScreen";
import { Dashboard } from "@/pages/Dashboard";
import { Parties } from "@/pages/Parties";
import { Items } from "@/pages/Items";
import { GridItems } from "@/pages/GridItems";
import { AddSale } from "@/pages/AddSale";
import { AddPurchase } from "@/pages/AddPurchase";
import { AddExpense } from "@/pages/AddExpense";
import { SaleInvoices } from "@/pages/SaleInvoices";
import { Estimates } from "@/pages/Estimates";
import { PaymentIn } from "@/pages/PaymentIn";
import { PaymentOut } from "@/pages/PaymentOut";
import { PurchaseBills } from "@/pages/PurchaseBills";
import { Expenses } from "@/pages/Expenses";
import { CashBank } from "@/pages/CashBank";
import { BankAccounts } from "@/pages/BankAccounts";
import { Reports } from "@/pages/Reports";
import { SettingsPage } from "@/pages/Settings";
import { ImportItems } from "@/pages/importitems";
import { BarcodeGenerator } from "@/pages/barcodegenerator";
import { UpdateItemsInBulk } from "@/pages/updateitemsinbulk";
import { ImportParties } from "@/pages/importparties";
import { ExportItems } from "@/pages/exportitems";
import { RecycleBin } from "@/pages/recyclebin";

import { EditProfile } from "@/pages/EditProfile";
import { AutoBackup } from "@/pages/autobackup";
import { BackupToComputer } from "@/pages/backuptocomputer";
import { BackupToDrive } from "@/pages/backuptodrive";
import { RestoreBackup } from "@/pages/restorebackup";
import { LaimsoftPos } from "@/pages/LaimsoftPos";
import type { SaleInvoiceEditData, ViewType } from "@/types";

function App() {
  const [isAppLocked, setIsAppLocked] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;
    const checkLockStatus = async () => {
      try {
        const res = await fetch('/api/passcode/status');
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setIsAppLocked(data.isSet);
            setIsInitializing(false);
          }
        } else {
          if (mounted) {
            setIsAppLocked(false);
            setIsInitializing(false);
          }
        }
      } catch (e) {
        if (mounted) {
          setIsAppLocked(false);
          setIsInitializing(false);
        }
      }
    };
    checkLockStatus();
    return () => { mounted = false; };
  }, []);

  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [lastStandardView, setLastStandardView] = useState<ViewType>("home");
  const [editingSaleInvoice, setEditingSaleInvoice] =
    useState<SaleInvoiceEditData | null>(null);
  const [isConvertingEstimate, setIsConvertingEstimate] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<string>("general");

  const isOverlayView = (view: ViewType) =>
    view === "add-sale" ||
    view === "add-purchase" ||
    view === "add-expense" ||
    view === "settings" ||
    view === "pos";

  const handleViewChange = (view: ViewType) => {
    if (!isOverlayView(view)) {
      setLastStandardView(view);
    }

    if (view === "add-sale") {
      setEditingSaleInvoice(null);
    }

    if (view === "settings") {
      setSettingsInitialTab("general");
    }

    setCurrentView(view);
  };

  const handleEditSaleInvoice = (invoice: SaleInvoiceEditData) => {
    setEditingSaleInvoice(invoice);
    setIsConvertingEstimate(false);
    setCurrentView("add-sale");
  };

  const handleConvertEstimateToSale = (invoiceData: SaleInvoiceEditData) => {
    setEditingSaleInvoice(invoiceData);
    setIsConvertingEstimate(true);
    setCurrentView("add-sale");
  };

  const handleCloseAddSale = () => {
    setEditingSaleInvoice(null);
    setIsConvertingEstimate(false);
    setCurrentView(lastStandardView);
  };

  const handleCloseAddPurchase = () => {
    setCurrentView(lastStandardView);
  };

  const handleCloseAddExpense = () => {
    setCurrentView(lastStandardView);
  };

  const handleCloseSettings = () => {
    setCurrentView(lastStandardView);
  };

  const handleOpenSettings = (tab = "general") => {
    setSettingsInitialTab(tab);
    setCurrentView("settings");
  };

  const handleClosePos = () => {
    setCurrentView(lastStandardView);
  };

  const activeBaseView = isOverlayView(currentView)
    ? lastStandardView
    : currentView;

  const renderContent = (view: ViewType) => {
    switch (view) {
      case "home":
        return <Dashboard />;
      case "parties":
        return <Parties onOpenSettings={handleOpenSettings} />;
      case "items":
        return <Items onViewChange={handleViewChange} />;
      case "griditems":
        return <GridItems onViewChange={handleViewChange} />;
      case "sale-invoices":
        return (
          <SaleInvoices
            onViewChange={handleViewChange}
            onEditInvoice={handleEditSaleInvoice}
          />
        );
      case "estimates":
        return <Estimates onConvertEstimateToSale={handleConvertEstimateToSale} />;
      case "payment-in":
        return <PaymentIn />;
      case "purchase-bills":
        return <PurchaseBills />;
      case "payment-out":
        return <PaymentOut />;
      case "expenses":
        return (
          <Expenses onAddExpense={() => handleViewChange("add-expense")} />
        );

      case "bank-accounts":
        return <BankAccounts />;
      case "cash-in-hand":
        return <CashBank subView={currentView} />;
      case "reports":
        return <Reports onViewChange={handleViewChange} onEditInvoice={handleEditSaleInvoice} />;
      case "sync-auto-backup":
        return <AutoBackup />;
      case "sync-backup-computer":
        return <BackupToComputer />;
      case "sync-backup-drive":
        return <BackupToDrive />;
      case "sync-restore-backup":
        return <RestoreBackup />;
      case "settings":
        return <SettingsPage initialTab={settingsInitialTab} />;
      case "utilities":
        return <ImportItems onViewChange={handleViewChange} />;
      case "utilities-import-items":
        return <ImportItems onViewChange={handleViewChange} />;
      case "utilities-barcode":
        return <BarcodeGenerator />;
      case "utilities-bulk-update":
        return <UpdateItemsInBulk />;
      case "utilities-import-parties":
        return <ImportParties />;
      case "utilities-export-items":
        return <ExportItems />;
      case "utilities-recycle-bin":
        return <RecycleBin />;
      case "edit-profile":
        return <EditProfile onBack={() => handleViewChange("home")} />;
      default:
        return <Dashboard />;
    }
  };

  if (isInitializing) {
    return null;
  }

  return (
    <>
      {isAppLocked && <EnterPasscodeScreen onSuccess={() => setIsAppLocked(false)} />}
      <div className="h-screen flex bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentView={activeBaseView} onViewChange={handleViewChange} />

        {/* Right Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header onViewChange={handleViewChange} />

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {renderContent(activeBaseView)}
          </div>
        </div>
      </div>

      {currentView === "add-sale" && (
        <div className="fixed inset-0 z-[100]">
          <AddSale
            onClose={handleCloseAddSale}
            initialInvoice={editingSaleInvoice}
            isConversion={isConvertingEstimate}
          />
        </div>
      )}

      {currentView === "add-purchase" && (
        <div className="fixed inset-0 z-[100]">
          <AddPurchase onClose={handleCloseAddPurchase} />
        </div>
      )}

      {currentView === "add-expense" && (
        <div className="fixed inset-0 z-[100]">
          <AddExpense onClose={handleCloseAddExpense} />
        </div>
      )}

      {currentView === "settings" && (
        <div className="fixed inset-0 z-[110]">
          <SettingsPage onClose={handleCloseSettings} initialTab={settingsInitialTab} />
        </div>
      )}

      {currentView === "pos" && (
        <div className="fixed inset-0 z-[120]">
          <LaimsoftPos onClose={handleClosePos} />
        </div>
      )}
    </>
  );
}

export default App;
