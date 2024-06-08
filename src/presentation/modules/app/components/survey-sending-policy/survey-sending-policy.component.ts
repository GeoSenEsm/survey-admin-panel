import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateSurveySendingPolicyComponent } from '../create-survey-sending-policy/create-survey-sending-policy.component';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarOptions, EventInput} from '@fullcalendar/core';
import plLocale from '@fullcalendar/core/locales/pl';
import { SurveySendingPolicyDto } from '../../../../../domain/models/survey.sending.policy.dto';

@Component({
  selector: 'app-survey-sending-policy',
  templateUrl: './survey-sending-policy.component.html',
  styleUrl: './survey-sending-policy.component.css'
})
export class SurveySendingPolicyComponent implements OnInit{
  @Input() surveyId: string | null = null;
  readonly calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    locale: plLocale
  };
  calendarEvents: EventInput[] = [];

  constructor(@Inject('dialog') private readonly _dialog: MatDialog) {
   }
  ngOnInit(): void {
    this.loadExistingSendingPolicies();
  }
  private loadExistingSendingPolicies(): void {
    this.calendarEvents.push(
      {
        title: 'Event 1',
        start: new Date(2024, 5, 8, 10, 0, 0),
        end: new Date(2024, 5, 8, 12, 0, 0)
      },
      {
        title: 'Event 2',
        start: new Date(2024, 5, 9, 14, 0, 0),
        end: new Date(2024, 5, 9, 16, 0, 0)
      }
    );
  }

  addSendingPolicy(): void{
    const dialogRef = this._dialog.open(CreateSurveySendingPolicyComponent, {
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        surveyId: this.surveyId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      const policy = result as SurveySendingPolicyDto;
      if (policy === undefined){
        return;
      }

      const events = this.calendarEventsFromPolicy(policy);
      events.forEach(e => this.calendarEvents.push(e));
    });
  }
  
  private calendarEventsFromPolicy(policy: SurveySendingPolicyDto): EventInput[] {
    const output: EventInput[] = [];

    policy.timeSlots.forEach(slot => {
      output.push({
        title: 'Dzień wysłania ankiety',
        start: new Date(slot.start),
        end: new Date(slot.finish)
      });
    });

    return output;
  }
}
