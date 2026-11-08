import { useTranslation } from "react-i18next";
import { SharedModal } from "./SharedModal";
import { useSettings } from "@/hooks/useSettings";
import { formatTransactionType } from "@/utils/transactionTranslations";

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  transaction: any;
}

export function DetailsModal({ open, onClose, transaction }: DetailsModalProps) {
  const { t } = useTranslation();
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  if (!transaction) return null;
  return (
    <SharedModal open={open} onClose={onClose} title={t("cashBank.transactionDetails")}>
      <div className="space-y-4">
        <div>
          <span className="block text-sm text-gray-500">{t("common.date")}</span>
          <span className="text-gray-900 font-medium">{transaction.date}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-500">{t("cashBank.nameOrDescription")}</span>
          <span className="text-gray-900 font-medium">{transaction.name.replace(' (Payment In)', '').replace(' (Payment Out)', '').replace(' (Received)', '')}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-500">{t("common.type")}</span>
          <span className="text-gray-900 font-medium">{formatTransactionType(transaction.type, t)}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-500">{t("common.amount")}</span>
          <span className="text-gray-900 font-medium">{currencyStr} {Number(transaction.amount).toLocaleString()}</span>
        </div>
      </div>
    </SharedModal>
  );
}

