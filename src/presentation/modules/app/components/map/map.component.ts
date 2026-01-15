import {
  AfterViewInit,
  Component,
  ComponentRef,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import L from 'leaflet';
import { LocationFilters } from '../../../../../domain/models/location-filters';
import { LOCATION_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { LocationService } from '../../../../../domain/external_services/location.service';
import { LocationData } from '../../../../../domain/models/location_data';
import { MapPinTooltipComponent } from '../map-pin-tooltip/map-pin-tooltip.component';
import { SurveyService } from '../../../../../domain/external_services/survey.service';
import { RespondentDataService } from '../../../../../domain/external_services/respondent-data.servce';
import { catchError, finalize, throwError } from 'rxjs';
import { RespondentData } from '../../../../../domain/models/respondent-data';
import { SurveySummaryShortDto } from '../../../../../domain/models/survey.summary.short.dto';
import { CsvExportService } from '../../../../../core/services/csv-export.service';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  private map: L.Map | undefined;
  locationData: LocationData[] = [];
  markers: L.CircleMarker[] = [];
  private tooltipRef: ComponentRef<MapPinTooltipComponent> | null = null;
  respondents: RespondentData[] = [];
  surveys: SurveySummaryShortDto[] = [];
  isBusy: boolean = false;
  downloadedBytes: number = 0;

  constructor(
    @Inject(LOCATION_SERVICE_TOKEN)
    private readonly locationService: LocationService,
    private viewContainerRef: ViewContainerRef,
    private injector: Injector,
    @Inject('surveyService') private readonly surveyService: SurveyService,
    @Inject('respondentDataService')
    private readonly respondentsService: RespondentDataService,
    private readonly exportService: CsvExportService,
    private readonly translate: TranslateService,
    private readonly snackbar: MatSnackBar
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map){
      this.map.remove();
    }
  }

  ngOnInit(): void {
    this.loadSurveys();
    this.loadRespondents();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [52.2297, 21.0122],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  loadData(filters: LocationFilters): void {
    if (this.isBusy) {
      return;
    }

    this.isBusy = true;
    this.downloadedBytes = 0;

    // Clear previous data immediately
    this.locationData = [];
    this.refreshPins();

    this.locationService
      .getLocationDataWithProgress(filters)
      .pipe(
        finalize(() => {
          this.isBusy = false;
          this.downloadedBytes = 0;
        }),
        catchError((error) => {
          this.snackbar.open(
            this.translate.instant('map.somethingWentWrong'),
            this.translate.instant('map.ok'),
            {
              duration: 3000,
            }
          );
          return throwError(() => error);
        })
      )
      .subscribe((event) => {
        if (event.type === HttpEventType.DownloadProgress) {
          // Update downloaded bytes
          this.downloadedBytes = event.loaded;
        } else if (event.type === HttpEventType.Response) {
          // Data fully loaded
          const data = event.body;
          if (data && Array.isArray(data)) {
            if (data.length === 0) {
              this.snackbar.open(
                this.translate.instant('map.noData'),
                this.translate.instant('map.ok'),
                {
                  duration: 3000,
                }
              );
            }
            this.locationData = data;
            this.refreshPins();
          }
        }
      });
  }

  refreshPins(): void {
    if (!this.map) {
      return;
    }

    this.markers.forEach((marker) => this.map?.removeLayer(marker));
    this.markers.length = 0;

    const bounds = L.latLngBounds([]);
    let any = false;
    this.locationData.forEach((location) => {
      const marker = L.circleMarker([location.latitude, location.longitude], {
        radius: 5,
        color: location.outsideResearchArea ? 'red' : 'blue',
        fillOpacity: 1,
      }).addTo(this.map!);

      marker.on('mouseover', (e) => this.showCustomTooltip(e, location));
      marker.on('mouseout', () => this.hideCustomTooltip());
      bounds.extend([location.latitude, location.longitude]);
      any = true;
      this.markers.push(marker);
    });

    if (any) {
      this.map.fitBounds(bounds);
    }
  }

  showCustomTooltip(event: L.LeafletMouseEvent, location: LocationData) {
    this.tooltipRef = this.viewContainerRef.createComponent(
      MapPinTooltipComponent,
      {
        injector: this.injector,
      }
    );

    this.tooltipRef.instance.location = location;
    this.tooltipRef.instance.respondents = this.respondents;
    this.tooltipRef.instance.surveys = this.surveys;

    const tooltipElement = this.tooltipRef.location
      .nativeElement as HTMLElement;
    tooltipElement.style.position = 'absolute';
    tooltipElement.style.left = `${event.originalEvent.pageX - 200}px`;
    tooltipElement.style.top = `${event.originalEvent.pageY - 50}px`;
    tooltipElement.style.zIndex = '1000';
  }

  hideCustomTooltip() {
    if (this.tooltipRef) {
      this.tooltipRef.destroy();
      this.tooltipRef = null;
    }
  }

  loadSurveys(): void {
    this.surveyService
      .getAllSummaryShort()
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error));
        })
      )
      .subscribe({
        next: (res) => {
          this.surveys = res;
        },
      });
  }

  loadRespondents(): void {
    this.respondentsService
      .getRespondents(undefined)
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error));
        })
      )
      .subscribe({
        next: (res) => {
          this.respondents = res;
        },
      });
  }

  exportData(): void {
    this.exportService.exportTableToCSV(
      this.locationData,
      [
        'latitude',
        'longitude',
        'respondentId',
        'dateTime',
        'surveyId',
        'outsideResearchArea',
      ],
      this.translate.instant('map.csvExportFilename')
    );
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
