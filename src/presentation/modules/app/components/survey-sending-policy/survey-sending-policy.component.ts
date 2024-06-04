import { Component, Inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateSurveySendingPolicyComponent } from '../create-survey-sending-policy/create-survey-sending-policy.component';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarOptions } from '@fullcalendar/core';
import plLocale from '@fullcalendar/core/locales/pl';

@Component({
  selector: 'app-survey-sending-policy',
  templateUrl: './survey-sending-policy.component.html',
  styleUrl: './survey-sending-policy.component.css'
})
export class SurveySendingPolicyComponent{
  @Input() surveyId: string | null = null;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    locale: plLocale
  };

  constructor(@Inject('dialog') private readonly _dialog: MatDialog) {
   }

  addSendingPolicy(): void{
    this._dialog.open(CreateSurveySendingPolicyComponent, {
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        surveyId: this.surveyId
      }
    });
  }
}
