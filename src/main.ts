import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { RootComponent } from './app/root.component';
import { routes } from './app/app.routes';

bootstrapApplication(RootComponent, {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
  ],
}).catch((err) => console.error(err));