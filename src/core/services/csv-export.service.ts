import { Injectable } from '@angular/core';
import {
  DEFAULT_SURVEY_SETTINGS,
  SurveySettings,
} from '../../domain/models/survey-settings';
import { SurveySettingsServiceImpl } from './survey-settings.service.impl';

@Injectable({
  providedIn: 'root',
})
export class CsvExportService {
  constructor(
    private readonly surveySettingsService: SurveySettingsServiceImpl
  ) {}

  exportTableToCSV(
    data: any[],
    columns: string[],
    filename = 'export.csv'
  ): void {
    this.surveySettingsService.getSettings().subscribe({
      next: (settings) => this.writeCsv(data, columns, filename, settings),
      error: () =>
        this.writeCsv(data, columns, filename, DEFAULT_SURVEY_SETTINGS),
    });
  }

  convertToCSV(
    data: any[],
    columns: string[],
    settings: SurveySettings = this.surveySettingsService.cachedSettings
  ): string {
    const columnSep = settings.csvColumnSeparator;
    const decimalSep = settings.csvDecimalSeparator;
    const header = columns
      .map((col) => this.escapeCell(col, columnSep))
      .join(columnSep);
    const rows = data.map((row) =>
      columns
        .map((col) => this.formatCell(row[col], columnSep, decimalSep))
        .join(columnSep)
    );
    return [header, ...rows].join('\r\n');
  }

  private writeCsv(
    data: any[],
    columns: string[],
    filename: string,
    settings: SurveySettings
  ): void {
    const csvData = this.convertToCSV(data, columns, settings);
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

  private formatCell(
    value: unknown,
    columnSep: string,
    decimalSep: string
  ): string {
    if (value == null) {
      return '';
    }
    if (Array.isArray(value)) {
      return this.escapeCell(`[${value.join(':')}]`, columnSep);
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return this.escapeCell(this.formatNumber(value, decimalSep), columnSep);
    }
    return this.escapeCell(String(value), columnSep);
  }

  private formatNumber(value: number, decimalSep: string): string {
    const asDot = String(value);
    if (decimalSep === '.') {
      return asDot;
    }
    return asDot.replace('.', decimalSep);
  }

  private escapeCell(value: string, columnSep: string): string {
    const needsQuotes =
      value.includes(columnSep) ||
      value.includes('"') ||
      value.includes('\r') ||
      value.includes('\n');
    if (!needsQuotes) {
      return value;
    }
    return `"${value.replace(/"/g, '""')}"`;
  }
}
