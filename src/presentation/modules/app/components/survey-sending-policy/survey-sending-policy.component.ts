import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateSurveySendingPolicyComponent } from '../create-survey-sending-policy/create-survey-sending-policy.component';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarOptions, EventInput} from '@fullcalendar/core';
import plLocale from '@fullcalendar/core/locales/pl';
import { SurveySendingPolicyDto } from '../../../../../domain/models/survey.sending.policy.dto';
import { SurveySendingPolicyService } from '../../../../../domain/external_services/survey.sending.policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { FullCalendarComponent } from '@fullcalendar/angular';

@Component({
  selector: 'app-survey-sending-policy',
  templateUrl: './survey-sending-policy.component.html',
  styleUrl: './survey-sending-policy.component.css'
})
export class SurveySendingPolicyComponent implements OnInit{
  @ViewChild('fullcalendar') calendar!: FullCalendarComponent;
  @Input() surveyId: string | null = null;
  readonly calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    locale: plLocale
  };
  calendarEvents: EventInput[] = [];

  constructor(@Inject('dialog') private readonly _dialog: MatDialog,
   @Inject('surveySendingPolicyService') private readonly service: SurveySendingPolicyService,
   private readonly snackbar: MatSnackBar) {  
   }
  
   ngOnInit(): void {
    this.loadExistingSendingPolicies();
  }
  private loadExistingSendingPolicies(): void {
    this.calendarEvents.length = 0;
    this.service.getAll(this.surveyId!)
    .pipe(
      catchError((error) => {
        this.snackbar.open('Nie udało się załadować polityki wysyłania ankiety', 'OK', { duration: 3000 });
        //TO DO: change to custom error
        return throwError(() => new Error('Error'));
      })
    )
    .subscribe({
      next: policies => {
        this.addPoliciesToEvents(policies);
      },
      error: err => {
        console.error('Error:', err);
      }
    });
  }
  
  private addPoliciesToEvents(policies: SurveySendingPolicyDto[]): void {
    policies.forEach(policy => {
      const events = this.calendarEventsFromPolicy(policy);
      events.forEach(e => this.calendarEvents.push(e));
    });

    this.refreshEvents();
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
      this.refreshEvents();
    });
  }

  refreshEvents(): void{
    this.calendarOptions.events = [...this.calendarEvents];
  }
  
  private calendarEventsFromPolicy(policy: SurveySendingPolicyDto): EventInput[] {
    const output: EventInput[] = [];

    policy.timeSlots.forEach(slot => {
      output.push({
        title: 'Wypełnianie ankiety',
        start: new Date(slot.start),
        end: new Date(slot.finish)
      });
    });

    return output;
  }
}