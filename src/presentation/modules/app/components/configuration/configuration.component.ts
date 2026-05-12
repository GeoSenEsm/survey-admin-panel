import { Component } from '@angular/core';
import { MAP_PROVIDER_OPTIONS, MapProvider, MapProviderService } from '../../../../../core/services/map-provider.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss'
})
export class ConfigurationComponent {
  readonly mapProviders = MAP_PROVIDER_OPTIONS;

  get selectedMapProvider(): MapProvider {
    return this.mapProviderService.selectedProvider;
  }

  constructor(private readonly mapProviderService: MapProviderService) {}

  changeMapProvider(provider: MapProvider): void {
    this.mapProviderService.setProvider(provider);
  }
}
