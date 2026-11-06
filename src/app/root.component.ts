import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="lights">@for (l of lights; track $index) { <span></span> }</div>
    <div class="snow">
      @for (f of flakes; track $index) {
        <i class="flake" [style.left.%]="f.x" [style.animationDuration.s]="f.d"
           [style.animationDelay.s]="f.l" [style.fontSize.px]="f.s">❄</i>
      }
    </div>
    <header class="hero">
      <div class="poro">🐻‍❄️</div>
      <a routerLink="/"><h1>LoL Secret Santa <span>2026</span></h1></a>
      <p>Invoca a tus aliados. Entrega una skin. 🎁</p>
    </header>
    <main class="wrap"><router-outlet /></main>
    <footer>Proyecto de fans · No afiliado a Riot Games</footer>
  `,
  styles: [`
    .snow { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 5; }
    .flake { position: absolute; top: -5%; color: #fff; opacity: .8; animation: fall linear infinite; }
    @keyframes fall { to { transform: translateY(108vh) translateX(40px) rotate(360deg); } }
    .lights { display: flex; justify-content: space-between; padding: 0 .5rem; position: sticky; top: 0; z-index: 6; }
    .lights span { width: 10px; height: 14px; border-radius: 50%; animation: blink 1.6s infinite; }
    .lights span:nth-child(4n+1) { background: #ff4d6d; box-shadow: 0 4px 12px #ff4d6d; }
    .lights span:nth-child(4n+2) { background: var(--gold); box-shadow: 0 4px 12px var(--gold); animation-delay: .4s; }
    .lights span:nth-child(4n+3) { background: var(--blue); box-shadow: 0 4px 12px var(--blue); animation-delay: .8s; }
    .lights span:nth-child(4n) { background: #7cff9b; box-shadow: 0 4px 12px #7cff9b; animation-delay: 1.2s; }
    @keyframes blink { 50% { opacity: .35; } }
    .hero { text-align: center; padding: 1.5rem 1rem .5rem; position: relative; z-index: 2; }
    .hero a { text-decoration: none; }
    .hero h1 { font-size: clamp(1.8rem, 7vw, 3.2rem); text-shadow: 0 0 20px rgba(200,170,110,.5); margin: 0; }
    .hero h1 span { color: var(--blue); }
    .poro { font-size: 3rem; animation: bob 2.4s ease-in-out infinite; }
    @keyframes bob { 50% { transform: translateY(-8px); } }
    main { position: relative; z-index: 2; }
    footer { text-align: center; opacity: .5; font-size: .75rem; padding: 2rem 1rem; position: relative; z-index: 2; }
  `],
})
export class RootComponent {
  lights = Array(24);
  flakes = Array.from({ length: 50 }, () => ({
    x: Math.random() * 100, d: 6 + Math.random() * 8, l: -Math.random() * 10, s: 10 + Math.random() * 16,
  }));
}