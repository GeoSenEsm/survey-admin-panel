import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './presentation/modules/app/app.module';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import localeEn from '@angular/common/locales/en';

registerLocaleData(localePl, 'pl');
registerLocaleData(localeEn, 'en');
platformBrowserDynamic().bootstrapModule(AppModule)