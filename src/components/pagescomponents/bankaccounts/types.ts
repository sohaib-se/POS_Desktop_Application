export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  accountNumber?: string;
  bankName?: string;
  swift_code?: string;
  iban?: string;
  account_holder_name?: string;
  print_details?: boolean | number;
  transactions: any[];
}

export interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  onSuccess?: () => void;
  initialData?: any;
}
