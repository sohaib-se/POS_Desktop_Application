import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';

export interface SetupPasscodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isChangeMode?: boolean;
  isResetMode?: boolean;
  recoveryEmail?: string;
  recoveryPhone?: string;
  resetMethod?: 'email' | 'phone';
  resetValue?: string;
  onSuccess?: () => void;
}

export function SetupPasscodeModal({
  open,
  onOpenChange,
  isChangeMode = false,
  isResetMode = false,
  recoveryEmail,
  recoveryPhone,
  resetMethod,
  resetValue,
  onSuccess,
}: SetupPasscodeModalProps) {
  const [oldPasscode, setOldPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setOldPasscode('');
      setNewPasscode('');
      setConfirmPasscode('');
      setError('');
    }
  }, [open]);

  const handleSave = async () => {
    setError('');
    if (isChangeMode && oldPasscode.length !== 4) {
      setError('Please enter the complete old passcode.');
      return;
    }
    if (newPasscode.length !== 4) {
      setError('New passcode must be 4 digits.');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setError('New passcodes do not match.');
      return;
    }

    setLoading(true);
    try {
      let endpoint = '/api/passcode/setup';
      let body: any = {
        oldPasscode: isChangeMode && !isResetMode ? oldPasscode : undefined,
        newPasscode,
        email: recoveryEmail,
        phone: recoveryPhone,
      };

      if (isResetMode) {
        endpoint = '/api/passcode/reset';
        body = {
          method: resetMethod,
          value: resetValue,
          newPasscode,
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        onSuccess?.();
        onOpenChange(false);
      } else {
        setError(data.message || 'Failed to setup passcode.');
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
          <DialogTitle>{isResetMode ? 'Reset Passcode' : isChangeMode ? 'Change Passcode' : 'Setup Passcode'}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4 items-center">
          {isChangeMode && !isResetMode && (
            <div className="flex flex-col gap-2 items-center w-full">
              <label className="text-sm font-medium">Old Passcode</label>
              <InputOTP
                maxLength={4}
                value={oldPasscode}
                onChange={setOldPasscode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}

          <div className="flex flex-col gap-2 items-center w-full">
            <label className="text-sm font-medium">New Passcode</label>
            <InputOTP
              maxLength={4}
              value={newPasscode}
              onChange={setNewPasscode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex flex-col gap-2 items-center w-full">
            <label className="text-sm font-medium">Confirm Passcode</label>
            <InputOTP
              maxLength={4}
              value={confirmPasscode}
              onChange={setConfirmPasscode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            SAVE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
