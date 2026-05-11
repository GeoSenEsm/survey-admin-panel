import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './presentation/modules/app/app.module';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import localeEs from '@angular/common/locales/es';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localePl, 'pl');
registerLocaleData(localeEn, 'en');
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeEs, 'es');
registerLocaleData(localeDe, 'de');
platformBrowserDynamic().bootstrapModule(AppModule)
