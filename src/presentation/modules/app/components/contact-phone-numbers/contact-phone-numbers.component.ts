import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateNewContactPhoneNumberComponent } from '../create-new-contact-phone-number/create-new-contact-phone-number.component';
import { MatTableDataSource } from '@angular/material/table';
import { ConfigService } from '../../../../../core/services/config.service';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { EditContactComponent } from '../edit-contact/edit-contact.component';

export interface PhoneNumberDto {
  id: number;
  name: string;
  number: string;
}

@Component({
  selector: 'app-contact-phone-numbers',
  templateUrl: './contact-phone-numbers.component.html',
  styleUrl: './contact-phone-numbers.component.scss',
})
export class ContactPhoneNumbersComponent implements OnInit {
  readonly dataSource = new MatTableDataSource<PhoneNumberDto>([]);
  readonly headers = ['name', 'number', 'id'];
  isBusy = false;

  constructor(
    private readonly matDialog: MatDialog,
    private readonly configService: ConfigService,
    private readonly httpClient: HttpClient,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService,
    private readonly dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.loadData();
  }

  createNew(): void {
    this.matDialog.open(CreateNewContactPhoneNumberComponent, {
      data: {
        names: this.dataSource.data.map((item) => item.name),
        numbers: this.dataSource.data.map((item) => item.number),
        createdCallback: () => this.loadData()
      },
    });
  }

  loadData(): void {
    if (this.isBusy) {
      return;
    }

    this.dataSource.data = [];
    this.isBusy = true;
    this.httpClient
      .get(this.configService.apiUrl + '/api/phonenumber')
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: (response) => {
          this.dataSource.data = response as PhoneNumberDto[];
        },
        error: (error) => {
          console.log(error);
          const message = this.translate.instant(
            'contactPhoneNumbers.loadingFailed'
          );
          this.snackbar.open(
            message,
            this.translate.instant('contactPhoneNumbers.ok')
          );
        },
      });
  }

  delete(number: PhoneNumberDto): void {
    const result = confirm(
      this.translate.instant('contactPhoneNumbers.doYouWantToDelete')
    );

    if (!result) {
      return;
    }

    this.isBusy = true;
    this.httpClient
      .delete(this.configService.apiUrl + '/api/phonenumber/' + number.id)
      .pipe(finalize(() => (this.isBusy = false)))
      .subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(
            (item) => item.id !== number.id
          );
        },
        error: (error) => {
          console.log(error);
          const message = this.translate.instant(
            'contactPhoneNumbers.deletingFailed'
          );
          this.snackbar.open(
            message,
            this.translate.instant('contactPhoneNumbers.ok')
          );
        },
      });
  }

  edit(number: PhoneNumberDto): void {
    this.dialog.open(EditContactComponent, {
      data: {
        existingContacts: this.dataSource.data.filter(x => x.id != number.id),
        editedContact: number,
      },
    });
  }
}
