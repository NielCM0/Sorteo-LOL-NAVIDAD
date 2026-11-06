import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminData, Api, daysLeft } from '../api';

@Component({
  selector: 'app-admin',
  standalone: true,
  template: `
    @if (data(); as d) {
      <section class="card">
        <h2>🛡️ Panel: {{ d.name }}</h2>
        <p class="small">Intercambio: {{ d.reveal_date }} · Faltan {{ days(d.reveal_date) }} días</p>

        <h3>1. Invita a tus amigos (y regístrate tú también)</h3>
        <div class="linkbox">{{ invite }}</div>
        <button class="btn" (click)="copy(invite)">Copiar enlace de invitación</button>

        <h3>2. Participantes ({{ d.participants.length }}/{{ d.size }})</h3>
        <ul class="list">
          @for (p of d.participants; track p.riot_id) {
            <li>
              <span>{{ p.nickname }} <span class="tag">{{ p.riot_id }}</span></span>
              <span class="small">{{ p.email }} {{ d.status === 'sorteado' ? '📬' : '🕒' }}</span>
            </li>
          }
        </ul>

        <h3>3. Sorteo</h3>
        @if (d.status === 'registro') {
          <button class="btn" (click)="draw()" [disabled]="d.participants.length !== d.size || loading()">
            {{ loading() ? 'Sorteando y enviando correos…' : '🎲 Iniciar sorteo' }}
          </button>
          <p class="small">Es definitivo y secreto: se envía un correo a cada participante y el emparejamiento no se guarda. Ni tú podrás verlo.</p>
        } @else if (d.status === 'sorteando') {
          <p>⏳ Sorteo en curso…</p>
        } @else {
          <p>🔒 Sorteo realizado. Se enviaron los correos a los {{ d.size }} participantes. Nadie sabe quién regala a quién.</p>
        }
        @if (error()) { <p class="error">{{ error() }}</p> }
      </section>

      <section class="card" style="margin-top:1rem">
        <h3>🔖 Enlace del organizador</h3>
        <p class="small">Guárdalo en favoritos: es la única forma de volver a este panel.</p>
        <div class="linkbox">{{ adminLink }}</div>
      </section>
    } @else if (error()) {
      <section class="card"><p class="error">{{ error() }}</p></section>
    }
  `,
})
export class AdminComponent implements OnInit, OnDestroy {
  private api = inject(Api);
  private route = inject(ActivatedRoute);
  private timer: any;
  id = ''; token = ''; invite = ''; adminLink = '';
  data = signal<AdminData | null>(null);
  error = signal(''); loading = signal(false);
  days = daysLeft;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.token = this.route.snapshot.paramMap.get('token')!;
    const base = location.origin + location.pathname;
    this.invite = `${base}#/unirse/${this.id}`;
    this.adminLink = `${base}#/admin/${this.id}/${this.token}`;
    this.load();
    this.timer = setInterval(() => this.load(), 8000);
  }
  ngOnDestroy() { clearInterval(this.timer); }

  async load() {
    try { this.data.set(await this.api.adminPanel(this.id, this.token)); }
    catch (e: any) { this.error.set(e.message); }
  }

  async draw() {
    if (!confirm('¿Iniciar el sorteo y enviar los correos? No se puede deshacer.')) return;
    this.loading.set(true); this.error.set('');
    try { await this.api.runDraw(this.id, this.token); }
    catch (e: any) { this.error.set(e.message); }
    await this.load();
    this.loading.set(false);
  }

  copy(t: string) { navigator.clipboard.writeText(t); }
}