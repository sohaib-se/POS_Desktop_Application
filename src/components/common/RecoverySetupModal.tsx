import { useState, useMemo } from 'react';
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
  onNext: (email: string, phone: string) => void;
}

export function RecoverySetupModal({
  open,
  onOpenChange,
  onNext,
}: RecoverySetupModalProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [error, setError] = useState('');

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

  const handleNext = () => {
    setError('');
    if (!email.trim() && !phone.trim()) {
      setError('Please provide at least one recovery method (Email or Phone).');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const fullPhone = phone.trim() ? `${countryCode}${phone.trim()}` : '';
    onNext(email.trim(), fullPhone);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Passcode Recovery</DialogTitle>
          <DialogDescription>
            Set up an email or phone number (or both) to recover your passcode if you forget it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Recovery Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Recovery Phone (Optional)</Label>
            <div className="flex gap-2">
              <select
                className="w-24 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
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
                placeholder="Phone number"
                className="flex-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleNext}>Next</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
