import { useState, useEffect } from 'react';
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

export interface ForgotPasscodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: (method: 'email' | 'phone', value: string) => void;
}

export function ForgotPasscodeModal({
  open,
  onOpenChange,
  onVerified,
}: ForgotPasscodeModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'select' | 'verify'>('select');
  const [hasEmail, setHasEmail] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStep('select');
      setValue('');
      setError('');
      fetch('/api/passcode/status')
        .then(res => res.json())
        .then(data => {
          setHasEmail(data.hasEmail);
          setHasPhone(data.hasPhone);
          if (data.hasEmail && !data.hasPhone) setMethod('email');
          if (!data.hasEmail && data.hasPhone) setMethod('phone');
          // If both, default to email (initial state) or if only one, we jump straight to verify?
          if (data.hasEmail || data.hasPhone) {
            // Keep step 'select' unless we want to auto-skip
            if ((data.hasEmail && !data.hasPhone) || (!data.hasEmail && data.hasPhone)) {
              setStep('verify');
            }
          } else {
            setError(t('passcode.noRecoveryConfigured', 'No recovery methods configured.'));
          }
        })
        .catch(() => setError(t('passcode.errorOccurred', 'An error occurred.')));
    }
  }, [open, t]);

  const handleVerify = async () => {
    setError('');
    if (!value.trim()) {
      setError(
        t('passcode.enterRecoveryMethod', 'Please enter your {{method}}.', {
          method: method === 'email' ? t('common.email', 'Email') : t('common.phone', 'Phone'),
        })
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/passcode/recovery/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, value: value.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        onVerified(method, value.trim());
        onOpenChange(false);
      } else {
        setError(t('passcode.incorrectRecoveryDetails', 'Incorrect recovery details.'));
      }
    } catch (err) {
      setError(t('passcode.errorOccurred', 'An error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('passcode.forgotTitle', 'Forgot Passcode')}</DialogTitle>
          <DialogDescription>
            {step === 'select' 
              ? t('passcode.forgotSelectDesc', 'Select how you would like to recover your passcode.')
              : t('passcode.forgotVerifyDesc', 'Enter your recovery {{method}} to verify your identity.', {
                  method: method === 'email' ? t('common.email', 'Email') : t('common.phone', 'Phone'),
                })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          {step === 'select' && !error && (
            <div className="flex flex-col gap-3">
              {hasEmail && (
                <Button 
                  variant={method === 'email' ? 'default' : 'outline'}
                  onClick={() => setMethod('email')}
                >
                  {t('passcode.recoverViaEmail', 'Recover via Email')}
                </Button>
              )}
              {hasPhone && (
                <Button 
                  variant={method === 'phone' ? 'default' : 'outline'}
                  onClick={() => setMethod('phone')}
                >
                  {t('passcode.recoverViaPhone', 'Recover via Phone Number')}
                </Button>
              )}
            </div>
          )}

          {step === 'verify' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="recovery-value">
                {method === 'email'
                  ? t('parties.email', 'Email Address')
                  : t('passcode.phoneWithCountryCode', 'Phone Number (with country code)')}
              </Label>
              <Input
                id="recovery-value"
                type={method === 'email' ? 'email' : 'tel'}
                placeholder={method === 'email' ? 'yourname@example.com' : '+923001234567'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {step === 'verify' && hasEmail && hasPhone && (
            <Button variant="outline" onClick={() => setStep('select')}>
              {t('common.back', 'Back')}
            </Button>
          )}
          {step === 'select' ? (
            <Button onClick={() => setStep('verify')} disabled={!hasEmail && !hasPhone}>
              {t('common.continue', 'Continue')}
            </Button>
          ) : (
            <Button onClick={handleVerify} disabled={loading || (!hasEmail && !hasPhone)}>
              {t('passcode.verify', 'Verify')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
