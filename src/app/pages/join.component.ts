import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Api, EMAIL_REGEX, RIOT_REGEX, RoomInfo } from '../api';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (done()) {
      <section class="card center">
        <h2>⚔️ ¡Registro completo!</h2>
        <p>Cuando el organizador inicie el sorteo, recibirás en <strong>{{ email }}</strong> a quién le toca regalarte la skin.</p>
        <p class="small">Revisa también la carpeta de spam. No necesitas hacer nada más 🎄</p>
      </section>
    } @else if (info(); as i) {
      <section class="card">
        <h2>🎄 {{ i.name }}</h2>
        <p class="small">Invocadores registrados: {{ i.count }}/{{ i.size }} · Intercambio: {{ i.reveal_date }}</p>
        @if (i.status !== 'registro' || i.count >= i.size) {
          <p class="error">Esta sala ya no admite más registros.</p>
        } @else {
          <label>Nombre o apodo</label>
          <input [(ngModel)]="nick" maxlength="30" />
          <label>Riot ID (nombre#TAG)</label>
          <input [(ngModel)]="riot" placeholder="Faker#KR1" />
          <label>Correo donde recibirás tu misión</label>
          <input type="email" [(ngModel)]="email" placeholder="tucorreo@gmail.com" />
          <button class="btn" (click)="join()" [disabled]="loading()">Unirme a la Grieta</button>
        }
        @if (error()) { <p class="error">{{ error() }}</p> }
      </section>
    } @else if (error()) {
      <section class="card"><p class="error">{{ error() }}</p></section>
    }
  `,
})
export class JoinComponent implements OnInit {
  private api = inject(Api);
  private route = inject(ActivatedRoute);
  id = ''; nick = ''; riot = ''; email = '';
  info = signal<RoomInfo | null>(null);
  done = signal(false); error = signal(''); loading = signal(false);

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    try {
      const i = await this.api.roomInfo(this.id);
      if (!i) this.error.set('Sala no encontrada'); else this.info.set(i);
    } catch (e: any) { this.error.set(e.message); }
  }

  async join() {
    this.error.set('');
    if (this.nick.trim().length < 2) return this.error.set('Escribe tu nombre o apodo');
    if (!RIOT_REGEX.test(this.riot.trim())) return this.error.set('Riot ID inválido. Formato: nombre#TAG');
    if (!EMAIL_REGEX.test(this.email.trim())) return this.error.set('Escribe un correo válido');
    this.loading.set(true);
    try { await this.api.join(this.id, this.nick, this.riot, this.email); this.done.set(true); }
    catch (e: any) { this.error.set(e.message); }
    this.loading.set(false);
  }
}