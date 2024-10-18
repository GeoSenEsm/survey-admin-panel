import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmationData{
  informationText: string,
  textToType: string
}

@Component({
  selector: 'app-type-to-confirm-dialog',
  templateUrl: './type-to-confirm-dialog.component.html',
  styleUrl: './type-to-confirm-dialog.component.scss'
})
export class TypeToConfirmDialogComponent {
  input: string = '';
  confirmationData: ConfirmationData;

  get canConfirm(): boolean{
    return this.confirmationData.textToType === this.input;
  }

  constructor(@Inject(MAT_DIALOG_DATA) data: ConfirmationData,
          private dialogRef: MatDialogRef<TypeToConfirmDialogComponent>){
    this.confirmationData = data;
  }

  onConfirm(): void{
    this.dialogRef.close(true);
  }

  onCancel(): void{
    this.dialogRef.close(false);
  }

  onInputKeydown(event: KeyboardEvent): void{
    if (event.key === 'Enter' && this.canConfirm){
      this.onConfirm();
    }
  }
}
