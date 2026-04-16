'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { LogForm } from '@/components/logs/log-form';
import { LogEntry } from '@/components/logs/log-entry';
import { getLogsAction } from '@/app/actions/logs';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const result = await getLogsAction();
      if (result.success) {
        setLogs(result.data || []);
      } else {
        toast.error(result.error || 'Failed to fetch logs');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Logs</h1>
          <p className="mt-2 text-muted-foreground">
            Journal your daily progress and reflections
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          New Log
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <LogForm
            onSuccess={() => {
              setShowForm(false);
              fetchLogs();
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No logs yet. Start journaling!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log: any) => (
            <LogEntry
              key={log.id}
              log={log}
              onDelete={() => fetchLogs()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
