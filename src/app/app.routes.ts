import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { JoinComponent } from './pages/join.component';
import { AdminComponent } from './pages/admin.component';
import { RevealComponent } from './pages/reveal.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'unirse/:id', component: JoinComponent },
  { path: 'admin/:id/:token', component: AdminComponent },
  { path: 'regalo/:data', component: RevealComponent },
  { path: '**', redirectTo: '' },
];