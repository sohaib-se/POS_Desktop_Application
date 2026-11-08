import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { countries } from 'country-data-list';

export interface RecoverySetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext: (email: string, phone: string) => Promise<string | void> | void;
}

export function RecoverySetupModal({
  open,
  onOpenChange,
  onNext,
}: RecoverySetupModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail('');
      setPhone('');
      setError('');
      setLoading(false);
    }
  }, [open]);

  // Extract unique dial codes with flags
  const dialCodes = useMemo(() => {
    const codes = new Map();
    countries.all.forEach((c: any) => {
      if (c.countryCallingCodes && c.countryCallingCodes.length > 0 && c.emoji) {
        c.countryCallingCodes.forEach((code: string) => {
          if (!codes.has(code)) {
            codes.set(code, c.emoji);
          }
        });
      }
    });
    return Array.from(codes.entries())
      .map(([code, flag]) => ({ code, flag }))
      .sort((a, b) => parseInt(a.code.replace('+', '')) - parseInt(b.code.replace('+', '')));
  }, []);

  const handleSave = async () => {
    setError('');
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail && !trimmedPhone) {
      setError(t('passcode.provideAtLeastOneMethod', 'Please provide at least one recovery method (Email or Phone).'));
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(t('passcode.enterValidEmail', 'Please enter a valid email address.'));
      return;
    }

    const fullPhone = trimmedPhone ? `${countryCode}${trimmedPhone}` : '';
    setLoading(true);
    try {
      const err = await onNext(trimmedEmail, fullPhone);
      if (err) {
        setError(err);
      }
    } catch (e) {
      setError(t('passcode.errorOccurred', 'An error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!loading) {
        onOpenChange(val);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('passcode.recoveryTitle', 'Passcode Recovery')}</DialogTitle>
          <DialogDescription>
            {t('passcode.recoveryDesc', 'Set up an email or phone number (or both) to recover your passcode if you forget it.')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t('passcode.recoveryEmail', 'Recovery Email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('passcode.emailPlaceholder', 'e.g. yourname@example.com')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">{t('passcode.recoveryPhone', 'Recovery Phone')}</Label>
            <div className="flex gap-2">
              <select
                className="w-24 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                disabled={loading}
              >
                {dialCodes.map(({ code, flag }) => (
                  <option key={code} value={code}>
                    {flag} {code}
                  </option>
                ))}
              </select>
              <Input
                id="phone"
                type="tel"
                placeholder={t('profile.phoneNumber', 'Phone number')}
                className="flex-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? t('common.saving', 'Saving...') : t('common.save', 'SAVE')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
