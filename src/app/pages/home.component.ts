import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="grid">
      <section class="card">
        <h2>🏆 Crear sala</h2>
        <label>Nombre del grupo</label>
        <input [(ngModel)]="name" maxlength="60" />
        <label>Cantidad de participantes (3 a 12, contándote a ti)</label>
        <input type="number" min="3" max="12" [(ngModel)]="size" />
        <label>Fecha del intercambio</label>
        <input type="date" [(ngModel)]="date" />
        <button class="btn" (click)="create()" [disabled]="loading()">Crear sala</button>
        @if (error()) { <p class="error">{{ error() }}</p> }
      </section>
      <section class="card">
        <h2>🤫 ¿Cómo funciona?</h2>
        <ol class="small" style="padding-left:1.1rem;line-height:1.7">
          <li>Creas la sala y compartes el enlace de invitación.</li>
          <li>Cada persona se registra con su Riot ID y su correo (tú también).</li>
          <li>Cuando el grupo esté completo, inicias el sorteo.</li>
          <li>Cada quien recibe en su correo a quién le toca regalar. El emparejamiento no se guarda en ningún lado: ni el organizador lo ve.</li>
        </ol>
      </section>
    </div>
  `,
})
export class HomeComponent {
  private api = inject(Api);
  private router = inject(Router);
  name = 'Amigos de la Grieta';
  size = 5;
  date = '2026-12-25';
  loading = signal(false);
  error = signal('');

  async create() {
    this.error.set('');
    const n = Number(this.size);
    if (!Number.isInteger(n) || n < 3 || n > 12) return this.error.set('El grupo debe tener entre 3 y 12 personas');
    this.loading.set(true);
    try {
      const r = await this.api.createRoom(this.name, this.date, n);
      this.router.navigate(['/admin', r.room_id, r.admin_token]);
    } catch (e: any) { this.error.set(e.message); }
    this.loading.set(false);
  }
}