import { prefersReducedMotion } from '../util/dom';

interface Car {
  lane: number;
  y: number;
  speed: number;
  dir: 1 | -1;
  length: number;
  hue: string;
  accent: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: 'coin' | 'feather' | 'spark';
}

interface Hop {
  from: number;
  to: number;
  t: number;
  duration: number;
}

const CAR_COLORS: Array<[string, string]> = [
  ['#e2574c', '#f4857c'],
  ['#3f8ce0', '#79b4f0'],
  ['#f0b429', '#ffd166'],
  ['#5ec27e', '#8fe0a8'],
  ['#9b6ff0', '#c3a6ff'],
  ['#dfe3ea', '#ffffff'],
  ['#2f3540', '#59616f'],
];

const KERB_W = 118;
const HOP_DURATION = 0.42;

/**
 * Canvas renderer for the Chicken Road 2 demo.
 *
 * The scene is purely presentational: it never decides an outcome. Traffic is
 * actively steered *away* from the chicken so the simulation can only ever show
 * a successful crossing, which is what the assessment brief asks for.
 */
export class RoadScene {
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private lastTime = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;

  private multipliers: number[] = [];
  private cars: Car[] = [];
  private spawnTimers: number[] = [];
  private particles: Particle[] = [];

  private lane = 0;
  private displayLane = 0;
  private hop: Hop | null = null;
  private camX = 0;
  private bob = 0;
  private time = 0;
  private laneWidth = 120;
  private trafficDensity = 1;
  private finished = false;
  private celebration = 0;
  private hopGuard = 0;

  onHopEnd: (() => void) | null = null;

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    this.ctx = ctx;
    this.resize();
  }

  // ---------------------------------------------------------------- lifecycle

  start(): void {
    if (this.raf) return;
    this.lastTime = performance.now();
    const loop = (now: number): void => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.update(dt);
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  destroy(): void {
    this.stop();
    window.clearTimeout(this.hopGuard);
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(rect.width * this.dpr);
    this.canvas.height = Math.round(rect.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.laneWidth = clamp(this.width / 3.6, 92, 168);
  }

  // ------------------------------------------------------------------ control

  setTrack(multipliers: number[], traffic: number): void {
    this.multipliers = multipliers;
    this.trafficDensity = traffic;
    this.spawnTimers = multipliers.map(() => Math.random() * 0.8);
    this.cars = [];
    this.reset();
  }

  reset(): void {
    window.clearTimeout(this.hopGuard);
    this.lane = 0;
    this.displayLane = 0;
    this.hop = null;
    this.finished = false;
    this.celebration = 0;
    this.particles = [];
  }

  /** Move the chicken to `lane`, animating the hop. */
  goToLane(lane: number): void {
    const from = this.displayLane;
    this.lane = lane;
    this.hop = { from, to: lane, t: 0, duration: prefersReducedMotion() ? 0.01 : HOP_DURATION };
    this.spawnBurst(this.laneCenterX(lane), this.chickenY(), 'spark', 8);

    // requestAnimationFrame is suspended in background tabs, so guarantee the
    // hop resolves even if the visitor switches away mid-step.
    window.clearTimeout(this.hopGuard);
    this.hopGuard = window.setTimeout(() => this.finishHop(), this.hop.duration * 1000 + 500);
  }

  /** Snap the chicken to the end of the current hop and notify listeners. */
  finishHop(): void {
    window.clearTimeout(this.hopGuard);
    if (!this.hop) return;
    this.displayLane = this.hop.to;
    this.hop = null;
    this.onHopEnd?.();
  }

  celebrate(reachedEnd: boolean): void {
    this.finished = true;
    this.celebration = 1;
    const x = this.laneCenterX(this.displayLane);
    this.spawnBurst(x, this.chickenY() - 14, 'coin', reachedEnd ? 34 : 22);
    this.spawnBurst(x, this.chickenY() - 6, 'feather', 10);
  }

  // ------------------------------------------------------------------ geometry

  private get worldWidth(): number {
    return KERB_W * 2 + this.multipliers.length * this.laneWidth;
  }

  /** World-space x of the centre of lane `n` (0 = start kerb, lanes+1 = finish). */
  private laneCenterX(n: number): number {
    if (n <= 0) return KERB_W * 0.52;
    if (n > this.multipliers.length) return KERB_W + this.multipliers.length * this.laneWidth + KERB_W * 0.48;
    return KERB_W + (n - 0.5) * this.laneWidth;
  }

  private chickenY(): number {
    return this.height * 0.64;
  }

  private get roadTop(): number {
    return this.height * 0.3;
  }

  private get roadBottom(): number {
    return this.height;
  }

  /** Pavement strip between the multiplier signs and the asphalt. */
  private get vergeTop(): number {
    return this.height * 0.23;
  }

  // -------------------------------------------------------------------- update

  private update(dt: number): void {
    this.time += dt;
    this.bob += dt * 7;

    if (this.hop) {
      this.hop.t += dt / this.hop.duration;
      if (this.hop.t >= 1) {
        this.finishHop();
      } else {
        this.displayLane = this.hop.from + (this.hop.to - this.hop.from) * easeInOut(this.hop.t);
      }
    }

    // Camera follows the chicken, clamped to the track.
    const target = clamp(
      this.laneCenterX(this.displayLane) - this.width * 0.34,
      0,
      Math.max(0, this.worldWidth - this.width),
    );
    this.camX += (target - this.camX) * Math.min(1, dt * 6);

    this.updateTraffic(dt);
    this.updateParticles(dt);

    if (this.celebration > 0) this.celebration = Math.max(0, this.celebration - dt * 0.5);
  }

  /**
   * Traffic is cosmetic. The lane the chicken currently occupies - and the one
   * it is hopping into - are kept clear, so a collision can never be rendered.
   */
  private updateTraffic(dt: number): void {
    const activeFrom = Math.floor(this.displayLane);
    const activeTo = Math.ceil(this.displayLane);
    const entering = this.hop ? this.hop.to : this.lane;
    const blocked = new Set([activeFrom, activeTo, entering]);

    for (let i = 0; i < this.multipliers.length; i += 1) {
      const laneNumber = i + 1;
      this.spawnTimers[i] -= dt;
      const carsHere = this.cars.filter((c) => c.lane === laneNumber).length;
      const cap = this.trafficDensity + 2;

      if (this.spawnTimers[i] <= 0) {
        this.spawnTimers[i] = 0.7 + Math.random() * (1.9 / this.trafficDensity);
        if (!blocked.has(laneNumber) && carsHere < cap) {
          const dir: 1 | -1 = laneNumber % 2 === 0 ? -1 : 1;
          const [hue, accent] = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
          this.cars.push({
            lane: laneNumber,
            dir,
            y: dir === 1 ? this.roadTop - 80 : this.roadBottom + 80,
            speed: 170 + Math.random() * 180,
            length: 74 + Math.random() * 26,
            hue,
            accent,
          });
        }
      }
    }

    const dangerTop = this.chickenY() - 70;
    const dangerBottom = this.chickenY() + 70;

    this.cars = this.cars.filter((car) => {
      // Cars in a blocked lane hurry out of the way - reads as a near miss.
      const rushing = blocked.has(car.lane);
      const inDanger = car.y > dangerTop - car.length && car.y < dangerBottom + car.length;
      const speed = rushing && inDanger ? car.speed * 3.1 : car.speed;
      car.y += speed * car.dir * dt;

      return car.dir === 1
        ? car.y < this.roadBottom + 140
        : car.y > this.roadTop - 140;
    });
  }

  private updateParticles(dt: number): void {
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 520 * dt;
      p.vx *= 1 - dt * 0.8;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private spawnBurst(x: number, y: number, kind: Particle['kind'], count: number): void {
    if (prefersReducedMotion()) return;
    for (let i = 0; i < count; i += 1) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.1;
      const speed = 90 + Math.random() * 230;
      const life = 0.6 + Math.random() * 0.7;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: kind === 'coin' ? 6 + Math.random() * 5 : 3 + Math.random() * 3,
        color: kind === 'coin' ? '#ffc247' : kind === 'feather' ? '#ffffff' : '#8d7cff',
        kind,
      });
    }
  }

  // ---------------------------------------------------------------------- draw

  private draw(): void {
    const { ctx, width, height } = this;
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    this.drawBackdrop();

    ctx.save();
    ctx.translate(-Math.round(this.camX), 0);
    this.drawRoad();
    this.drawPlates();
    this.drawCars();
    this.drawChicken();
    this.drawParticles();
    ctx.restore();

    this.drawVignette();
    ctx.restore();
  }

  private drawBackdrop(): void {
    const { ctx, width, height } = this;
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#1b2030');
    sky.addColorStop(0.6, '#141824');
    sky.addColorStop(1, '#10131c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Parallax skyline above the road.
    const parallax = -this.camX * 0.25;
    ctx.save();
    ctx.translate(parallax % 320, 0);
    ctx.fillStyle = 'rgba(160,180,255,0.05)';
    for (let x = -320; x < width + 640; x += 64) {
      const seed = Math.abs(Math.sin(x * 0.07));
      const h = 26 + seed * 74;
      ctx.fillRect(x, this.vergeTop - h, 48, h);
      ctx.save();
      ctx.fillStyle = 'rgba(255,214,140,0.1)';
      for (let wy = this.vergeTop - h + 10; wy < this.vergeTop - 8; wy += 16) {
        ctx.fillRect(x + 8, wy, 8, 6);
        ctx.fillRect(x + 28, wy, 8, 6);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  private drawRoad(): void {
    const { ctx } = this;
    const top = this.roadTop;
    const bottom = this.roadBottom;
    const h = bottom - top;
    const lanes = this.multipliers.length;
    const roadStart = KERB_W;
    const roadEnd = KERB_W + lanes * this.laneWidth;
    const span = roadEnd - roadStart;

    // Pavement verge behind the top of the road - cars emerge from under it.
    ctx.fillStyle = '#2b2f3a';
    ctx.fillRect(-2000, this.vergeTop, 6000, top - this.vergeTop);
    ctx.fillStyle = 'rgba(255,255,255,0.09)';
    ctx.fillRect(-2000, top - 5, 6000, 5);

    // Asphalt
    const asphalt = ctx.createLinearGradient(0, top, 0, bottom);
    asphalt.addColorStop(0, '#3a3f4b');
    asphalt.addColorStop(0.35, '#2f3440');
    asphalt.addColorStop(1, '#262a34');
    ctx.fillStyle = asphalt;
    ctx.fillRect(roadStart, top, span, h);

    // Crossed lanes get a green wash so progress is readable at a glance.
    const crossed = Math.floor(this.displayLane);
    if (crossed > 0) {
      ctx.fillStyle = 'rgba(23,178,106,0.14)';
      ctx.fillRect(roadStart, top, Math.min(crossed, lanes) * this.laneWidth, h);
    }

    // The line the chicken walks along.
    const walk = this.chickenY();
    const band = ctx.createLinearGradient(0, walk - 46, 0, walk + 46);
    band.addColorStop(0, 'rgba(255,255,255,0)');
    band.addColorStop(0.5, 'rgba(255,255,255,0.06)');
    band.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = band;
    ctx.fillRect(roadStart, walk - 46, span, 92);

    // Lane separators
    ctx.strokeStyle = 'rgba(255,255,255,0.42)';
    ctx.lineWidth = 4;
    ctx.setLineDash([18, 20]);
    for (let i = 1; i < lanes; i += 1) {
      const x = roadStart + i * this.laneWidth;
      ctx.beginPath();
      ctx.moveTo(x, top + 4);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    this.drawKerb(0, KERB_W, top, bottom, false);
    this.drawKerb(roadEnd, KERB_W, top, bottom, true);
  }

  private drawKerb(x: number, w: number, top: number, bottom: number, isFinish: boolean): void {
    const { ctx } = this;
    const grad = ctx.createLinearGradient(0, top, 0, bottom);
    grad.addColorStop(0, isFinish ? '#574b2c' : '#4a4f5c');
    grad.addColorStop(1, isFinish ? '#403720' : '#3a3e49');
    ctx.fillStyle = grad;
    ctx.fillRect(x, top, w, bottom - top);

    // Kerb edge facing the road
    ctx.fillStyle = isFinish ? 'rgba(255,194,71,0.8)' : 'rgba(255,255,255,0.38)';
    ctx.fillRect(isFinish ? x : x + w - 7, top, 7, bottom - top);

    // Paving texture
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    for (let y = top + 26; y < bottom; y += 26) {
      ctx.beginPath();
      ctx.moveTo(x + 4, y);
      ctx.lineTo(x + w - 10, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x + w / 2, top + (bottom - top) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '800 15px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isFinish ? 'rgba(255,205,105,0.9)' : 'rgba(255,255,255,0.4)';
    ctx.letterSpacing = '5px';
    ctx.fillText(isFinish ? 'FINISH' : 'START', 0, 0);
    ctx.letterSpacing = '0px';
    ctx.restore();
  }

  private drawPlates(): void {
    const { ctx } = this;
    const y = this.height * 0.13;
    const reached = Math.floor(this.displayLane + 0.001);

    for (let i = 0; i < this.multipliers.length; i += 1) {
      const laneNumber = i + 1;
      const x = this.laneCenterX(laneNumber);
      const isDone = laneNumber <= reached;
      const isNext = laneNumber === reached + 1 && !this.finished;

      const w = Math.min(this.laneWidth - 18, 96);
      const h = 34;
      const pulse = isNext ? 1 + Math.sin(this.time * 4) * 0.045 : 1;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(pulse, pulse);

      if (isNext) {
        ctx.shadowColor = 'rgba(255,194,71,0.65)';
        ctx.shadowBlur = 22;
      }

      roundRect(ctx, -w / 2, -h / 2, w, h, 10);
      ctx.fillStyle = isDone
        ? 'rgba(23,178,106,0.22)'
        : isNext
          ? 'rgba(255,194,71,0.18)'
          : 'rgba(255,255,255,0.055)';
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = isDone
        ? 'rgba(74,222,154,0.75)'
        : isNext
          ? 'rgba(255,194,71,0.9)'
          : 'rgba(255,255,255,0.12)';
      ctx.stroke();

      ctx.font = '800 15px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isDone ? '#7ff0b6' : isNext ? '#ffd071' : 'rgba(255,255,255,0.4)';
      ctx.fillText(`${this.multipliers[i].toFixed(2)}x`, 0, 1);
      ctx.restore();

      // Sign post
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + 17);
      ctx.lineTo(x, this.roadTop);
      ctx.stroke();
    }
  }

  private drawCars(): void {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    ctx.rect(KERB_W, this.roadTop, this.multipliers.length * this.laneWidth, this.roadBottom - this.roadTop);
    ctx.clip();

    for (const car of this.cars) {
      const x = this.laneCenterX(car.lane);
      const w = Math.min(this.laneWidth * 0.52, 62);
      const l = car.length;
      const top = car.y - l / 2;

      ctx.save();
      ctx.translate(x, car.y);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      roundRect(ctx, -w / 2 + 4, -l / 2 + 7, w, l, 12);
      ctx.fill();

      // Body
      const body = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
      body.addColorStop(0, car.hue);
      body.addColorStop(0.5, car.accent);
      body.addColorStop(1, car.hue);
      ctx.fillStyle = body;
      roundRect(ctx, -w / 2, -l / 2, w, l, 12);
      ctx.fill();

      // Cabin
      ctx.fillStyle = 'rgba(16,20,28,0.78)';
      roundRect(ctx, -w / 2 + 6, -l * 0.2, w - 12, l * 0.38, 7);
      ctx.fill();

      // Roof stripe
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      roundRect(ctx, -w * 0.1, -l / 2 + 8, w * 0.2, l - 16, 4);
      ctx.fill();

      // Lights
      const lightY = car.dir === 1 ? l / 2 - 7 : -l / 2 + 7;
      ctx.fillStyle = car.dir === 1 ? 'rgba(255,240,190,0.95)' : 'rgba(255,90,80,0.9)';
      ctx.beginPath();
      ctx.arc(-w / 4, lightY, 3.6, 0, Math.PI * 2);
      ctx.arc(w / 4, lightY, 3.6, 0, Math.PI * 2);
      ctx.fill();

      // Headlight cone
      if (car.dir === 1) {
        const cone = ctx.createLinearGradient(0, lightY, 0, lightY + 70);
        cone.addColorStop(0, 'rgba(255,240,190,0.16)');
        cone.addColorStop(1, 'rgba(255,240,190,0)');
        ctx.fillStyle = cone;
        ctx.beginPath();
        ctx.moveTo(-w / 3, lightY);
        ctx.lineTo(w / 3, lightY);
        ctx.lineTo(w * 0.78, lightY + 74);
        ctx.lineTo(-w * 0.78, lightY + 74);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
      void top;
    }

    ctx.restore();
  }

  private drawChicken(): void {
    const { ctx } = this;
    const x = this.laneCenterX(this.displayLane);
    const baseY = this.chickenY();

    const hopT = this.hop ? this.hop.t : 0;
    const lift = this.hop ? Math.sin(Math.PI * hopT) * 34 : 0;
    const idleBob = this.hop ? 0 : Math.sin(this.bob) * 2.2;
    const y = baseY - lift - idleBob;
    const tilt = this.hop ? Math.sin(Math.PI * hopT) * 0.22 : 0;
    const scale = clamp(this.laneWidth / 130, 0.78, 1.22);

    // Ground shadow
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${0.36 - lift / 160})`;
    ctx.beginPath();
    ctx.ellipse(x, baseY + 18, 20 * scale - lift / 8, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(scale, scale);

    const legSwing = this.hop ? Math.sin(hopT * Math.PI * 2) * 5 : Math.sin(this.bob) * 2;

    // Legs
    ctx.strokeStyle = '#f08a1e';
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 5, 12);
      ctx.lineTo(side * 5 + legSwing * side * 0.6, 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(side * 5 + legSwing * side * 0.6 - 4, 20);
      ctx.lineTo(side * 5 + legSwing * side * 0.6 + 4, 20);
      ctx.stroke();
    }

    // Tail
    ctx.fillStyle = '#e9ecf2';
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.quadraticCurveTo(-24, -10, -20, 2);
    ctx.quadraticCurveTo(-18, 6, -11, 6);
    ctx.closePath();
    ctx.fill();

    // Body
    const body = ctx.createLinearGradient(0, -16, 0, 16);
    body.addColorStop(0, '#ffffff');
    body.addColorStop(1, '#dfe4ec');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 2, 15, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = '#eef1f7';
    ctx.beginPath();
    ctx.ellipse(2, 3, 8, 7, this.hop ? -0.5 : 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Head
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(9, -11, 9, 0, Math.PI * 2);
    ctx.fill();

    // Comb
    ctx.fillStyle = '#e2574c';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(5 + i * 4, -19 - (i === 1 ? 2 : 0), 3.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wattle
    ctx.beginPath();
    ctx.ellipse(13, -5, 2.6, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#f5a623';
    ctx.beginPath();
    ctx.moveTo(17, -12);
    ctx.lineTo(25, -9.5);
    ctx.lineTo(17, -7);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#1b1d22';
    ctx.beginPath();
    ctx.arc(13, -13, 1.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(13.6, -13.7, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawParticles(): void {
    const { ctx } = this;
    for (const p of this.particles) {
      const alpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);

      if (p.kind === 'coin') {
        ctx.rotate(p.x * 0.05 + this.time * 6);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * Math.abs(Math.cos(this.time * 7 + p.x)), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(160,110,10,0.65)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawVignette(): void {
    const { ctx, width, height } = this;
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.3,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.78,
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}

// ------------------------------------------------------------------- helpers

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
