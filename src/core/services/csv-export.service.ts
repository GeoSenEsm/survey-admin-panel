import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class CsvExportService{
    exportTableToCSV(data: any, columns: string[], filename = 'export.csv') {
        const csvData = this.convertToCSV(data, columns);
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      convertToCSV(data: any[], columns: string[]): string {
        const header = columns.join(',');
        const rows = data.map(row => columns.map(col => {
            if (Array.isArray(row[col])) {
              return `"[${row[col].join('$')}]"`;
            }

            return row[col];
        }).join(','));
        return [header, ...rows].join('\r\n');
      }
}
