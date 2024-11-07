import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import L, { LatLng } from 'leaflet';
import { Papa } from 'ngx-papaparse';
import { LocationAreaNode } from '../../../../../domain/models/location_area_node';

@Component({
  selector: 'app-research-area',
  templateUrl: './research-area.component.html',
  styleUrl: './research-area.component.scss'
})
export class ResearchAreaComponent implements OnInit {
  private map: L.Map | undefined;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  changesMade: boolean = false;

  constructor(private papa: Papa) {} 

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
          const data: LocationAreaNode[] = result.data as LocationAreaNode[];
          this.drawPolygon(data);
          this.changesMade = true;
        },
        error: (error) => {
          console.error('Error parsing CSV file:', error);
        }
      });
    }
  }

  private drawPolygon(vertices: LocationAreaNode[]): void {
    const latLngs = vertices.map(vertex => new LatLng(vertex.latitude, vertex.longitude));
    const polygon = L.polygon(latLngs, {
      color: 'darkblue',
      fillColor: 'blue',
      fillOpacity: 0.5
    });

    polygon.addTo(this.map!);
    this.map?.fitBounds(polygon.getBounds());
  }

}
