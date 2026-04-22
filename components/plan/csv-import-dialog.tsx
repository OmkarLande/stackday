'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { importPlansFromCSVAction, validateCSVAction } from '@/app/actions/import';

export interface CSVImportDialogProps {
  goalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CSVImportDialog({ goalId, open, onOpenChange, onSuccess }: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);

    try {
      setIsLoading(true);
      const buffer = await selectedFile.arrayBuffer();
      const result = await validateCSVAction(Buffer.from(buffer));

      if (result.success) {
        setPreview(result.data?.rows || []);
        setStep('preview');
      } else {
        toast.error(result.error || 'Failed to validate CSV');
        setFile(null);
      }
    } catch (error) {
      toast.error('Error reading file');
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setIsLoading(true);
      setStep('importing');

      const buffer = await file.arrayBuffer();
      const result = await importPlansFromCSVAction(goalId, Buffer.from(buffer));

      if (result.success) {
        toast.success(`Imported ${result.data?.imported} plans successfully`);
        setFile(null);
        setPreview([]);
        setStep('upload');
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error || 'Failed to import plans');
        setStep('preview');
      }
    } catch (error) {
      toast.error('Error importing plans');
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setStep('upload');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Plans from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your 30-day plan. Required: day_number, title. Optional: description, estimated_minutes, is_optional (true/false).
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Click to upload CSV</p>
                    <p className="text-xs text-muted-foreground">or drag and drop</p>
                  </div>
                </div>
              </label>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-semibold mb-2">CSV Format Example:</p>
              <pre className="text-xs overflow-x-auto">
{`day_number,title,description,estimated_minutes,is_optional
1,Lesson 1,Learn basics,30,false
2,Lesson 2,Practice exercises,45,false
3,Quiz 1,Review and test,60,true`}
              </pre>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Day</th>
                    <th className="text-left py-2 px-2">Title</th>
                    <th className="text-left py-2 px-2">Minutes</th>
                    <th className="text-left py-2 px-2">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-2">{row.day_number}</td>
                      <td className="py-2 px-2">{row.title}</td>
                      <td className="py-2 px-2">{row.estimated_minutes || '-'}</td>
                      <td className="py-2 px-2">
                        {row.is_optional ? 'Bonus' : 'Main'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">
              Ready to import {preview.length} plans to this goal.
            </p>
          </div>
        )}

        {step === 'importing' && (
          <div className="space-y-4 text-center py-8">
            <p className="text-muted-foreground">Importing plans...</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          {step === 'preview' && (
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading ? 'Importing...' : 'Import Plans'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
