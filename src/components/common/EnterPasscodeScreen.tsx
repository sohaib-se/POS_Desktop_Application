import React, { useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ForgotPasscodeModal } from './ForgotPasscodeModal';
import { SetupPasscodeModal } from './SetupPasscodeModal';

export interface EnterPasscodeScreenProps {
  onSuccess: () => void;
}

export function EnterPasscodeScreen({ onSuccess }: EnterPasscodeScreenProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMethod, setResetMethod] = useState<'email' | 'phone'>('email');
  const [resetValue, setResetValue] = useState('');

  const handleVerify = async (value: string) => {
    setPasscode(value);
    setError('');

    if (value.length === 4) {
      setLoading(true);
      try {
        const response = await fetch('/api/passcode/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: value }),
        });

        const data = await response.json();
        if (data.success) {
          onSuccess();
        } else {
          setError('Incorrect passcode');
          setPasscode(''); // Reset on error
        }
      } catch (err) {
        setError('An error occurred.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Enter your passcode</CardTitle>
          <CardDescription>Please enter your 4-digit passcode to access the system.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <InputOTP
            maxLength={4}
            value={passcode}
            onChange={handleVerify}
            disabled={loading}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
          
          {error && <p className="text-sm text-destructive">{error}</p>}
          
          
          <Button variant="link" className="text-muted-foreground mt-2" onClick={() => setShowForgotModal(true)}>
            forgot passcode?
          </Button>
        </CardContent>
      </Card>

      <ForgotPasscodeModal
        open={showForgotModal}
        onOpenChange={setShowForgotModal}
        onVerified={(method, value) => {
          setResetMethod(method);
          setResetValue(value);
          setShowResetModal(true);
        }}
      />

      <SetupPasscodeModal
        open={showResetModal}
        onOpenChange={setShowResetModal}
        isResetMode={true}
        resetMethod={resetMethod}
        resetValue={resetValue}
        onSuccess={() => onSuccess()}
      />
    </div>
  );
}
