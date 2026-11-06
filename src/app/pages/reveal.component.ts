import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { decodeGift, GiftData } from '../api';

@Component({
  selector: 'app-reveal',
  standalone: true,
  template: `
    @if (gift(); as g) {
      <section class="card center">
        <h3>Hola, {{ g.g }}</h3>
        <div class="gift" [class.open]="opened()" (click)="open()">
          <div class="lid"></div><div class="box"></div>
          @if (opened()) {
            @for (s of sparks; track $index) {
              <span class="spark" [style.--dx.px]="s.dx" [style.--dy.px]="s.dy">{{ s.e }}</span>
            }
          }
        </div>
        @if (!opened()) {
          <p>Toca el regalo para abrirlo 🎁</p>
        } @else {
          <div class="msg">
            <h2>¡Tu misión navideña ha comenzado, invocador!</h2>
            <p>Tu objetivo es regalarle una skin a…</p>
            <div class="target">
              <strong>{{ g.t }}</strong>
              <span class="tag">{{ g.r }}</span>
            </div>
            <p class="small">Guarda el secreto 🤫 · Intercambio: {{ g.d }}</p>
          </div>
        }
      </section>
    } @else {
      <section class="card center"><p class="error">Enlace inválido. Usa el botón de tu correo.</p></section>
    }
  `,
  styles: [`
    .gift { position: relative; width: 170px; height: 160px; margin: 2rem auto 1rem; cursor: pointer; animation: bob 2s ease-in-out infinite; }
    .gift.open { animation: none; cursor: default; }
    @keyframes bob { 50% { transform: translateY(-10px) rotate(-2deg); } }
    .box { position: absolute; bottom: 0; width: 100%; height: 105px; border-radius: 6px;
      background: linear-gradient(#c8102e, #7a0a1c); box-shadow: 0 0 30px rgba(200,16,46,.5); }
    .box::before, .lid::before { content: ''; position: absolute; left: 50%; top: 0; width: 26px; height: 100%;
      transform: translateX(-50%); background: linear-gradient(90deg, #a98a4a, #f0e6d2, #a98a4a); }
    .lid { position: absolute; top: 12px; left: -6%; width: 112%; height: 46px; z-index: 2; border-radius: 6px;
      background: linear-gradient(#e0173f, #b00e2c); transition: transform .9s cubic-bezier(.2,1.4,.4,1), opacity .9s; }
    .gift.open .lid { transform: translateY(-130px) rotate(-22deg); opacity: 0; }
    .spark { position: absolute; left: 50%; top: 40%; opacity: 0; animation: burst 1.4s ease-out forwards; }
    @keyframes burst { 0% { opacity: 1; transform: translate(0,0) scale(.5); }
      100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1.4); } }
    .msg { animation: in .9s .5s ease both; }
    .target { margin: 1rem auto; padding: 1rem; max-width: 380px; border: 2px solid var(--gold); border-radius: 12px;
      background: rgba(10,200,185,.08); box-shadow: 0 0 28px rgba(200,170,110,.35); }
    .target strong { display: block; font-family: Cinzel, serif; font-size: 1.8rem; color: var(--gold); }
  `],
})
export class RevealComponent {
  private route = inject(ActivatedRoute);
  gift = signal<GiftData | null>(decodeGift(this.route.snapshot.paramMap.get('data') ?? ''));
  opened = signal(false);
  sparks = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2, r = 90 + Math.random() * 110;
    return { dx: Math.cos(a) * r, dy: Math.sin(a) * r - 40, e: ['❄️', '✨', '⭐', '🎁'][i % 4] };
  });
  open() { this.opened.set(true); }
}