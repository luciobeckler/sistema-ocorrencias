import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideNgxMask } from 'ngx-mask';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { addIcons } from 'ionicons';
import { checkmarkCircle } from 'ionicons/icons';

addIcons({
  checkmarkCircle,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideNgxMask({
      dropSpecialCharacters: true,
      validation: true,
    }),
  ],
});

defineCustomElements(window);
