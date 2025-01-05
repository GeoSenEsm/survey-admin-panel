import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import L, { LatLng } from 'leaflet';
import { Papa } from 'ngx-papaparse';
import { LatLong } from '../../../../../domain/models/lat_long';
import { RESEARCH_AREA_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { ResearchAreaService } from '../../../../../domain/external_services/research_area.service';
import { catchError, of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-research-area',
  templateUrl: './research-area.component.html',
  styleUrl: './research-area.component.scss',
})
export class ResearchAreaComponent implements OnInit, OnDestroy, AfterViewInit {
  private map: L.Map | undefined;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  changesMade: boolean = false;
  private researchAreaPolygon: L.Polygon | undefined;
  private nodes: LatLong[] | undefined;
  errorOnLoadingCurrentResearchArea: boolean = false;
  private rememberedNodes: LatLong[] | undefined;

  constructor(
    private papa: Papa<LatLng>,
    @Inject(RESEARCH_AREA_SERVICE_TOKEN)
    private readonly researchAreaService: ResearchAreaService,
    private readonly translate: TranslateService,
    private readonly snackbar: MatSnackBar
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  ngOnInit(): void {
    this.loadCurrentResearchArea();
  }

  private initMap(): void {
    this.map = L.map('research-area-map', {
      center: [52.2297, 21.0122],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  loadCurrentResearchArea(): void {
    this.nodes = undefined;
    this.rememberedNodes = undefined;
    this.errorOnLoadingCurrentResearchArea = false;

    this.researchAreaService
      .getResearchArea()
      .pipe(
        catchError((error) => {
          if (error.status == 404) {
            return of([]);
          }

          return throwError(() => error);
        })
      )
      .subscribe({
        next: (data) => {
          this.drawPolygon(data);
        },
        error: (error) => {
          this.errorOnLoadingCurrentResearchArea = true;
          console.log(error);
        },
      });
  }

  loadFromFile(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (
            result.data.some(
              (e: any) => e.longitude == undefined || e.latitude == undefined
            )
          ) {
            this.showInvalidFormat();
            return;
          }

          const data: LatLong[] = (result.data as LatLong[]).map((row) => ({
            latitude: this.withPrecision(row.latitude, 6),
            longitude: this.withPrecision(row.longitude, 6),
          }));
          this.drawPolygon(data);
          this.changesMade = true;
        },
        error: (error) => {
          const message = this.translate.instant(
            'configuration.researchArea.somethingWentWrong'
          );
          this.showOkMessage(message);
          console.error('Error parsing CSV file:', error);
        },
      });
    }
  }

  showInvalidFormat(): void {
    const message = this.translate.instant(
      'configuration.researchArea.invalidFormat'
    );
    this.showOkMessage(message);
  }

  withPrecision(value: number | string, precision: number): number {
    if (typeof value === 'string') value = parseFloat(value as string);
    return Number(value.toFixed(precision));
  }

  private drawPolygon(vertices: LatLong[]): void {
    try {
      if (this.nodes && !this.rememberedNodes) {
        this.rememberedNodes = this.nodes;
      }
      this.removePolygon();
      this.nodes = vertices;
      if (vertices.length === 0) {
        return;
      }
      const latLngs = vertices.map(
        (vertex) => new LatLng(vertex.latitude, vertex.longitude)
      );
      this.researchAreaPolygon = L.polygon(latLngs, {
        color: 'darkblue',
        fillColor: 'blue',
        fillOpacity: 0.5,
      });

      this.researchAreaPolygon.addTo(this.map!);
      this.map?.fitBounds(this.researchAreaPolygon.getBounds());
    } finally {
      this.fileInput.nativeElement.value = '';
    }
  }

  private removePolygon(): void {
    if (this.map && this.researchAreaPolygon) {
      this.map.removeLayer(this.researchAreaPolygon);
      this.researchAreaPolygon = undefined;
    }
  }

  resetChanges(): void {
    if (this.rememberedNodes) {
      this.drawPolygon(this.rememberedNodes);
      this.changesMade = false;
    }
  }

  save(): void {
    if (this.nodes) {
      this.errorOnLoadingCurrentResearchArea = false;
      this.researchAreaService.upsert(this.nodes).subscribe({
        next: (_) => {
          this.changesMade = false;
          this.rememberedNodes = this.nodes;
        },
        error: (e) => {
          const message = this.translate.instant(
            'configuration.researchArea.errorOnSavingChanges'
          );
          this.showOkMessage(message);
          console.log(e);
        },
      });
    }
  }

  deleteResearchArea(): void {
    this.errorOnLoadingCurrentResearchArea = false;
    this.researchAreaService.remove().subscribe({
      next: (_) => {
        this.changesMade = false;
        this.rememberedNodes = undefined;
        this.drawPolygon([]);
      },
      error: (error) => {
        const message = this.translate.instant(
          'configuration.researchArea.errorOnDeleting'
        );
        this.showOkMessage(message);
        console.log(error);
      },
    });
  }

  private showOkMessage(message: string) {
    const ok = this.translate.instant('configuration.ok');
    this.snackbar.open(message, ok, { duration: 3000 });
  }

  canDelete(): boolean {
    return (
      this.areaDefined() &&
      (this.rememberedNodes ?? true) &&
      this.rememberedNodes?.length !== 0
    );
  }

  areaDefined(): boolean {
    return (
      this.errorOnLoadingCurrentResearchArea ||
      (this.nodes !== undefined && this.nodes.length !== 0)
    );
  }
}
