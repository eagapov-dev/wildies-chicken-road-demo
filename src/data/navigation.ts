export interface NavItem {
  label: string;
  icon: string;
  expandable?: boolean;
}

export const primaryNav: NavItem[] = [
  { label: 'Home', icon: 'nav/home.svg' },
  { label: 'Casino', icon: 'nav/casino.svg', expandable: true },
  { label: 'Sports', icon: 'nav/sports.svg', expandable: true },
  { label: 'Promotions', icon: 'nav/promotions.svg' },
  { label: 'Loyalty', icon: 'nav/loyalty.svg' },
  { label: 'Match X', icon: 'nav/matchx.webp' },
  { label: 'Missions', icon: 'nav/missions.svg' },
  { label: 'Tournaments', icon: 'nav/tournaments.svg' },
];

export const socialLinks = [
  { label: 'X.com', icon: 'social/x.webp' },
  { label: 'Discord', icon: 'social/discord.webp' },
  { label: 'Telegram', icon: 'social/telegram.webp' },
];

export const categoryChips = [
  { label: 'Lobby', icon: 'chips/lobby.svg' },
  { label: 'New Games', icon: 'chips/new.svg' },
  { label: 'Video Slots', icon: 'chips/video-slots.svg' },
  { label: 'Top Games', icon: 'chips/top.svg' },
  { label: 'Jackpots', icon: 'chips/jackpots.svg' },
  { label: 'Buy Bonus', icon: 'chips/buy-bonus.svg' },
  { label: 'Megaways', icon: 'chips/megaways.svg' },
  { label: 'Providers', icon: 'chips/providers.svg' },
];

export const footerColumns = [
  {
    title: 'Wildies',
    links: ['Casino', 'Promotions', 'Sports'],
  },
  {
    title: 'Support',
    links: ['FAQ', 'Contact Us'],
  },
  {
    title: 'About Us',
    links: [
      'Terms and Conditions',
      'Privacy Policy',
      'AML-KYC Policy',
      'Responsible Gambling',
      'Affiliate Program',
    ],
  },
];
