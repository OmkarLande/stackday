'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createLogAction } from '@/app/actions/logs';

export interface LogFormProps {
  onSuccess: () => void;
}

export function LogForm({ onSuccess }: LogFormProps) {
  const [entry, setEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!entry.trim()) {
      toast.error('Please write something');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createLogAction(new Date(), entry);
      if (result.success) {
        toast.success('Log entry created');
        setEntry('');
        onSuccess();
      } else {
        toast.error(result.error || 'Failed to create log');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Log Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="entry" className="block text-sm font-medium">
              Today&apos;s Reflection
            </label>
            <Textarea
              id="entry"
              placeholder="How did today go? What did you learn? Any challenges or victories?"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              disabled={isLoading}
              rows={5}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : 'Save Log Entry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
