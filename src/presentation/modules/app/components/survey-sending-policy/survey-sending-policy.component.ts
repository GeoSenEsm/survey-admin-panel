import {
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateSurveySendingPolicyComponent } from '../create-survey-sending-policy/create-survey-sending-policy.component';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import plLocale from '@fullcalendar/core/locales/pl';
import enLocale from '@fullcalendar/core/locales/en-gb';
import { SurveySendingPolicyDto } from '../../../../../domain/models/survey.sending.policy.dto';
import { SurveySendingPolicyService } from '../../../../../domain/external_services/survey-sending-policy-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, Subscription, throwError } from 'rxjs';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { CalendarEventCheckboxComponent } from '../calendar-event-checkbox/calendar-event-checkbox.component';
import { TypeToConfirmDialogComponent } from '../type-to-confirm-dialog/type-to-confirm-dialog.component';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import {
  DEFAULT_SURVEY_NOTIFICATIONS,
  NotificationRelativeTo,
  SurveyNotificationDto,
} from '../../../../../domain/models/survey-notification.dto';

interface Selectable {
  selected: boolean;
}

interface EditableNotification {
  relativeTo: NotificationRelativeTo;
  minutesBefore: number;
}

@Component({
  selector: 'app-survey-sending-policy',
  templateUrl: './survey-sending-policy.component.html',
  styleUrl: './survey-sending-policy.component.css',
})
export class SurveySendingPolicyComponent implements OnInit, OnDestroy {
  @ViewChild('fullcalendar') calendar!: FullCalendarComponent;
  @Input() surveyId: string | null = null;
  readonly calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    locale: plLocale,
    timeZone: 'UTC',
    eventContent: this.renderEventContent.bind(this),
  };
  calendarEvents: (EventInput & Selectable)[] = [];
  private readonly langChangeSubscription: Subscription;
  policies: SurveySendingPolicyDto[] = [];
  notifications: EditableNotification[] = [];
  notificationsLoading = false;
  notificationsSaving = false;
  readonly maxNotifications = 10;
  readonly relativeToOptions: NotificationRelativeTo[] = ['beginning', 'end'];

  _deleteMode = false;

  get deleteMode(): boolean {
    return this._deleteMode;
  }
  set deleteMode(value: boolean) {
    this._deleteMode = value;
    if (!value) {
      this.calendarEvents.forEach((event) => (event.selected = false));
    }
    this.refreshEvents();
  }

  constructor(
    @Inject('dialog') private readonly _dialog: MatDialog,
    @Inject('surveySendingPolicyService')
    private readonly service: SurveySendingPolicyService,
    @Inject('surveyService')
    private readonly surveyService: SurveyService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService,
    private readonly datePipe: DatePipe,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly dialog: MatDialog
  ) {
    this.langChangeSubscription = translate.onLangChange.subscribe((event) => {
      const lang = event.lang;
      this.calendarOptions.locale = lang === 'pl' ? plLocale : enLocale;
    });
  }
  ngOnDestroy(): void {
    this.langChangeSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.calendarOptions.locale =
      this.translate.currentLang === 'pl' ? plLocale : enLocale;
    this.loadExistingSendingPolicies();
    this.loadNotifications();
  }

  private loadExistingSendingPolicies(): void {
    this.calendarEvents.length = 0;
    this.service
      .getAll(this.surveyId!)
      .pipe(
        catchError((e) => {
          this.snackbar.open(
            this.translate.instant(
              'surveyDetails.surveySendingPolicy.couldNotLoadSendingPolicies'
            ),
            this.translate.instant('surveyDetails.surveySendingPolicy.ok'),
            { duration: 3000 }
          );
          return throwError(() => e);
        })
      )
      .subscribe({
        next: (policies) => {
          this.policies = policies;
          this.addPoliciesToEvents(policies);
        },
        error: (err) => {
          console.error('Error:', err);
        },
      });
  }

  private loadNotifications(): void {
    this.notificationsLoading = true;
    this.surveyService.getNotifications(this.surveyId!).subscribe({
      next: (notifications) => {
        this.notifications = notifications.map((n) => ({
          relativeTo: n.relativeTo,
          minutesBefore: n.minutesBefore,
        }));
        this.notificationsLoading = false;
      },
      error: () => {
        this.notifications = DEFAULT_SURVEY_NOTIFICATIONS.map((n) => ({
          relativeTo: n.relativeTo,
          minutesBefore: n.minutesBefore,
        }));
        this.notificationsLoading = false;
        this.snackbar.open(
          this.translate.instant(
            'surveyDetails.surveySendingPolicy.couldNotLoadNotifications'
          ),
          this.translate.instant('surveyDetails.surveySendingPolicy.ok'),
          { duration: 3000 }
        );
      },
    });
  }

  addNotification(): void {
    if (this.notifications.length >= this.maxNotifications) {
      return;
    }
    this.notifications.push({ relativeTo: 'beginning', minutesBefore: 0 });
  }

  removeNotification(index: number): void {
    this.notifications.splice(index, 1);
  }

  saveNotifications(): void {
    if (!this.areNotificationsValid()) {
      this.snackbar.open(
        this.translate.instant(
          'surveyDetails.surveySendingPolicy.notificationsInvalid'
        ),
        this.translate.instant('surveyDetails.surveySendingPolicy.ok'),
        { duration: 3000 }
      );
      return;
    }

    const payload: SurveyNotificationDto[] = this.notifications.map(
      (notification, index) => ({
        order: index,
        relativeTo: notification.relativeTo,
        minutesBefore: Number(notification.minutesBefore),
      })
    );

    this.notificationsSaving = true;
    this.surveyService.replaceNotifications(this.surveyId!, payload).subscribe({
      next: (saved) => {
        this.notifications = saved.map((n) => ({
          relativeTo: n.relativeTo,
          minutesBefore: n.minutesBefore,
        }));
        this.notificationsSaving = false;
        this.snackbar.open(
          this.translate.instant(
            'surveyDetails.surveySendingPolicy.notificationsSaved'
          ),
          this.translate.instant('surveyDetails.surveySendingPolicy.ok'),
          { duration: 3000 }
        );
      },
      error: () => {
        this.notificationsSaving = false;
        this.snackbar.open(
          this.translate.instant(
            'surveyDetails.surveySendingPolicy.couldNotSaveNotifications'
          ),
          this.translate.instant('surveyDetails.surveySendingPolicy.ok'),
          { duration: 3000 }
        );
      },
    });
  }

  areNotificationsValid(): boolean {
    return this.notifications.every(
      (n) =>
        (n.relativeTo === 'beginning' || n.relativeTo === 'end') &&
        Number.isFinite(Number(n.minutesBefore)) &&
        Number(n.minutesBefore) >= 0
    );
  }

  private addPoliciesToEvents(policies: SurveySendingPolicyDto[]): void {
    policies.forEach((policy) => {
      const events = this.calendarEventsFromPolicy(policy);
      events.forEach((e) => this.calendarEvents.push(e));
    });

    this.refreshEvents();
  }

  addSendingPolicy(): void {
    const dialogRef = this._dialog.open(CreateSurveySendingPolicyComponent, {
      hasBackdrop: true,
      closeOnNavigation: false,
      data: {
        surveyId: this.surveyId,
        existingPolicies: this.policies,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      const policy = result as SurveySendingPolicyDto;
      if (policy === undefined) {
        return;
      }

      this.policies.push(policy);
      const events = this.calendarEventsFromPolicy(policy);
      events.forEach((e) => this.calendarEvents.push(e));
      this.refreshEvents();
    });
  }

  refreshEvents(): void {
    this.calendarOptions.events = [...this.calendarEvents];
  }

  private calendarEventsFromPolicy(
    policy: SurveySendingPolicyDto
  ): (EventInput & Selectable)[] {
    const output: (EventInput & Selectable)[] = [];

    policy.timeSlots
      .filter((e) => !e.deleted)
      .forEach((slot) => {
        const from = new Date(slot.start);
        const to = new Date(slot.finish);
        output.push({
          id: slot.id,
          title: this.translate.instant(
            'surveyDetails.surveySendingPolicy.completingSurvey',
            {
              from: this.datePipe.transform(from, 'shortTime'),
              to: this.getToCalendarDisplay(from, to),
            }
          ),
          start: from,
          end: to,
          selected: false,
        });
      });

    return output;
  }

  private getToCalendarDisplay(from: Date, to: Date): string | null {
    if (
      from.getFullYear() == to.getFullYear() &&
      from.getMonth() == to.getMonth() &&
      from.getDate() == to.getDate()
    ) {
      return this.datePipe.transform(to, 'shortTime');
    }

    return this.datePipe.transform(to, 'short');
  }

  deleteSelected(): void {
    this.dialog
      .open(TypeToConfirmDialogComponent, {
        hasBackdrop: true,
        closeOnNavigation: true,
        data: {
          informationText: this.translate.instant(
            'surveyDetails.surveySendingPolicy.deletingConfirmationText'
          ),
          textToType: this.translate.instant(
            'surveyDetails.surveySendingPolicy.deletingConfirmationInput'
          ),
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === true) {
          this.deleteSelectedCore();
        }
      });
  }

  private deleteSelectedCore(): void {
    const toDelete = this.calendarEvents
      .filter((e) => e.selected)
      .map((e) => e.id!);
    this.service.deleteAll(toDelete).subscribe({
      next: () => {
        this.loadExistingSendingPolicies();
      },
      error: (err) => {
        console.log(err);
        this.snackbar.open(
          this.translate.instant(
            'surveyDetails.surveySendingPolicy.couldNotDeleteSendingPolicies'
          ),
          this.translate.instant('surveyDetails.surveySendingPolicy.ok'),
          { duration: 3000 }
        );
      },
    });
  }

  private renderEventContent(arg: any) {
    const contentNodes = [];

    if (this.deleteMode) {
      const checkboxContainer = document.createElement('div');

      const componentRef = this.viewContainerRef.createComponent(
        CalendarEventCheckboxComponent
      );
      componentRef.instance.selected = arg.event.extendedProps.selected;

      componentRef.instance.selectionChange.subscribe((isSelected: boolean) => {
        this.toggleEventSelection(arg.event.id, isSelected);
      });

      checkboxContainer.appendChild(componentRef.location.nativeElement);
      contentNodes.push(checkboxContainer);
    }

    const title = document.createElement('span');
    title.innerText = ` ${arg.event.title}`;
    contentNodes.push(title);

    return { domNodes: contentNodes };
  }

  private toggleEventSelection(eventId: string, isSelected: boolean): void {
    const event = this.calendarEvents.find((e) => e.id === eventId);
    if (event) {
      event.selected = isSelected;
    }
  }

  deletingEnabled(): boolean {
    return this.deleteMode && this.calendarEvents.some((e) => e.selected);
  }

  toggleDeleteMode(): void {
    this.deleteMode = !this.deleteMode;
  }
}
