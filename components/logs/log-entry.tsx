'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { updateLogAction, deleteLogAction } from '@/app/actions/logs';
import { formatDistanceToNow } from 'date-fns';

export interface LogEntryProps {
  log: any;
  onDelete: () => void;
}

export function LogEntry({ log, onDelete }: LogEntryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [entry, setEntry] = useState(log.entry);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateLogAction(log.id, entry);
      if (result.success) {
        toast.success('Log entry updated');
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to update log');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this log entry?')) return;

    setIsLoading(true);
    try {
      const result = await deleteLogAction(log.id);
      if (result.success) {
        toast.success('Log entry deleted');
        onDelete();
      } else {
        toast.error(result.error || 'Failed to delete log');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const logDate = new Date(log.date);
  const formattedDate = logDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeAgo = formatDistanceToNow(logDate, { addSuffix: true });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{formattedDate}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{timeAgo}</p>
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              disabled={isLoading}
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
              >
                <Check className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEntry(log.entry);
                }}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm">{entry}</p>
        )}
      </CardContent>
    </Card>
  );
}
