import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Injectable()
export class GeoSenEsmMatPaginatorIntl extends MatPaginatorIntl {
  override changes = new Subject<void>();

  constructor(private readonly translate: TranslateService) {
    super();
    this.initTranslations();
  }

  private initTranslations(): void {
    this.translate.onLangChange.subscribe(() => {
      this.updateLabels();
    });

    this.updateLabels();
  }

  private updateLabels(): void {
    this.itemsPerPageLabel = this.translate.instant(
      'matPaginator.itemsPerPageLabel'
    );
    this.firstPageLabel = this.translate.instant('matPaginator.firstPageLabel');
    this.lastPageLabel = this.translate.instant('matPaginator.lastPageLabel');
    this.previousPageLabel = this.translate.instant(
      'matPaginator.previousPageLabel'
    );
    this.nextPageLabel = this.translate.instant('matPaginator.nextPageLabel');

    this.getRangeLabel = (
      page: number,
      pageSize: number,
      length: number
    ): string => {
      if (length === 0 || pageSize === 0) {
        return `0 ${this.translate.instant('matPaginator.of')} ${length}`;
      }
      const startIndex = page * pageSize;
      const endIndex = Math.min(startIndex + pageSize, length);
      return `${startIndex + 1} - ${endIndex} ${this.translate.instant(
        'matPaginator.of'
      )} ${length}`;
    };

    this.changes.next();
  }
}
