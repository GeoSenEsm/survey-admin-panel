import { Component, Inject, OnInit } from '@angular/core';
import L from 'leaflet';
import { LocationFilters } from '../../../../../domain/models/location-filters';
import { LOCATION_SERVICE_TOKEN } from '../../../../../core/services/injection-tokens';
import { LocationService } from '../../../../../domain/external_services/location.service';
import { LocationData } from '../../../../../domain/models/location_data';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit {
  private map : L.Map | undefined;
  private locationData: LocationData[] = [];
  markers: L.CircleMarker[] = [];

  constructor(@Inject(LOCATION_SERVICE_TOKEN) private readonly locationService: LocationService){}

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [52.2297, 21.0122],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }


  loadData(filters: LocationFilters): void{
    this.locationService
    .getLocationData(filters)
    .subscribe(data => {
      this.locationData = data;
      this.refreshPins();
    });
  }

  refreshPins(): void {
    if (!this.map){
      return;
    }

    this.markers.forEach(marker => this.map?.removeLayer(marker));
    this.markers.length = 0;

    this.locationData.forEach(location => {
      const marker = L.circleMarker([location.latitude, location.longitude], {
        radius: 3,       
        color: 'blue',    
        fillOpacity: 1    
      }).addTo(this.map!);
      this.markers.push(marker);
    });
  }
}
