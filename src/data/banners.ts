export interface HeroSlide {
  image: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  cta: string;
  /** Wide slides take two columns in the desktop carousel, like the reference. */
  wide?: boolean;
}

export const heroSlides: HeroSlide[] = [
  {
    image: 'banners/slider-1.webp',
    kicker: 'There are no limits',
    title: 'With Nolimit City',
    cta: 'Try Now',
  },
  {
    image: 'banners/slider-2.webp',
    kicker: 'Turbo Games',
    title: 'Hop in Action',
    cta: 'Try Now',
  },
  {
    image: 'banners/slider-3.webp',
    kicker: "Onlyplay's Flame & Fortune",
    title: 'The Ultimate',
    subtitle: 'Autumn Tournament',
    cta: 'Play Now',
  },
  {
    image: 'banners/slider-4.webp',
    kicker: 'Welcome Offer',
    title: '150% Bonus',
    subtitle: '100 Free Spins',
    cta: 'Play Now',
    wide: true,
  },
  {
    image: 'banners/slider-5.webp',
    kicker: 'Monday Cashback',
    title: 'Weekly Casino',
    subtitle: 'Cashback',
    cta: 'Play Now',
  },
];

export interface PromoStrip {
  image: string;
  title: string;
  lines: string[];
  cta: string;
}

export const cashbackStrip: PromoStrip = {
  image: 'banners/cashback.webp',
  title: 'Weekly Monday Cashback!',
  lines: ['Enjoy your favourite slot games that are', 'covered weekly by cashback!'],
  cta: 'Play Now!',
};

export const missionsStrip: PromoStrip = {
  image: 'banners/gamification.webp',
  title: 'Go Wild!',
  lines: ['Finish your missions, grab your points,', 'and claim your exclusive rewards!'],
  cta: "Let's GO!",
};
