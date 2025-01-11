import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const [confirmation, setConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (response.ok) {
        // Sign out and redirect to auth page
        await signOut({ callbackUrl: '/auth' });
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete account');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription className="text-red-600">
            Warning: This action cannot be undone. All your data will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            To confirm deletion, please type &quot;DELETE&quot; below:
          </p>
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="DELETE"
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || confirmation !== 'DELETE'}
          >
            {isLoading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
