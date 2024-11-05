import {
  Component,
  ComponentRef,
  Inject,
  Injector,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import L from 'leaflet';
import { LocationFilters } from '../../../../../domain/models/location-filters';
import { LOCATION_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { LocationService } from '../../../../../domain/external_services/location.service';
import { LocationData } from '../../../../../domain/models/location_data';
import { MapPinTooltipComponent } from '../map-pin-tooltip/map-pin-tooltip.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;
  private locationData: LocationData[] = [];
  markers: L.CircleMarker[] = [];
  private tooltipRef: ComponentRef<MapPinTooltipComponent> | null = null;

  constructor(
    @Inject(LOCATION_SERVICE_TOKEN)
    private readonly locationService: LocationService,
    private viewContainerRef: ViewContainerRef,
    private injector: Injector
  ) {}

  ngOnInit(): void {
    this.initMap();
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
    this.locationService.getLocationData(filters).subscribe((data) => {
      this.locationData = data;
      this.refreshPins();
    });
  }

  refreshPins(): void {
    if (!this.map) {
      return;
    }

    this.markers.forEach((marker) => this.map?.removeLayer(marker));
    this.markers.length = 0;

    this.locationData.forEach((location) => {
      const marker = L.circleMarker([location.latitude, location.longitude], {
        radius: 5,
        color: location.outsideResearchArea ? 'red' : 'blue',
        fillOpacity: 1,
      }).addTo(this.map!);

      marker.on('mouseover', (e) => this.showCustomTooltip(e, location));
      marker.on('mouseout', () => this.hideCustomTooltip());

      this.markers.push(marker);
    });
  }

  showCustomTooltip(event: L.LeafletMouseEvent, location: LocationData) {
    this.tooltipRef = this.viewContainerRef.createComponent(
      MapPinTooltipComponent,
      {
        injector: this.injector,
      }
    );

    this.tooltipRef.instance.location = location;

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
}
