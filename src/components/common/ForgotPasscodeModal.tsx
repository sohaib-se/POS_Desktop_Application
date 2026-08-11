import React, { useState, useEffect } from 'react';
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
            setError('No recovery methods configured.');
          }
        })
        .catch(() => setError('Failed to load status'));
    }
  }, [open]);

  const handleVerify = async () => {
    setError('');
    if (!value.trim()) {
      setError(`Please enter your ${method}.`);
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
        setError('Incorrect recovery details.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forgot Passcode</DialogTitle>
          <DialogDescription>
            {step === 'select' 
              ? 'Select how you would like to recover your passcode.'
              : `Enter your recovery ${method} to verify your identity.`}
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
                  Recover via Email
                </Button>
              )}
              {hasPhone && (
                <Button 
                  variant={method === 'phone' ? 'default' : 'outline'}
                  onClick={() => setMethod('phone')}
                >
                  Recover via Phone Number
                </Button>
              )}
            </div>
          )}

          {step === 'verify' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="recovery-value">
                {method === 'email' ? 'Email Address' : 'Phone Number (with country code)'}
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
              Back
            </Button>
          )}
          {step === 'select' ? (
            <Button onClick={() => setStep('verify')} disabled={!hasEmail && !hasPhone}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleVerify} disabled={loading || (!hasEmail && !hasPhone)}>
              Verify
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
