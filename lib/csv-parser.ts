import Papa from 'papaparse';

export interface PlanCSVRow {
  day_number: number;
  title: string;
  description?: string;
  estimated_minutes?: number;
}

export async function parseCSVFile(file: File): Promise<PlanCSVRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as any[];
          const parsed: PlanCSVRow[] = rows
            .filter(row => row.day_number || row.title)
            .map((row, index) => {
              const dayNumber = parseInt(row.day_number || row['Day'] || row['day'] || (index + 1).toString());

              if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 30) {
                throw new Error(`Row ${index + 2}: Invalid day number. Must be between 1 and 30.`);
              }

              const title = (row.title || row['Title'] || row['Task'] || '').toString().trim();
              if (!title) {
                throw new Error(`Row ${index + 2}: Title is required.`);
              }

              return {
                day_number: dayNumber,
                title,
                description: (row.description || row['Description'] || row['Details'] || '').toString().trim() || undefined,
                estimated_minutes: row.estimated_minutes || row['Estimated Minutes'] || row['Minutes']
                  ? parseInt(row.estimated_minutes || row['Estimated Minutes'] || row['Minutes'])
                  : undefined,
              };
            });

          // Check for duplicate days
          const days = new Set<number>();
          for (const row of parsed) {
            if (days.has(row.day_number)) {
              throw new Error(`Duplicate day number: ${row.day_number}`);
            }
            days.add(row.day_number);
          }

          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}
