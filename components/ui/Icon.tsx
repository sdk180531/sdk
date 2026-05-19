import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
}

export function Icon({ name, size = 22, color = 'currentColor', stroke = 1.8 }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return <Svg {...props}><Path d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-8.5z" /></Svg>;
    case 'community':
      return <Svg {...props}><Circle cx="9" cy="10" r="3" /><Circle cx="17" cy="8" r="2.5" /><Path d="M3 19c0-3 2.5-5 6-5s6 2 6 5" /><Path d="M14.5 19c0-2.2 1.7-4 3.5-4s3 1.3 3 3" /></Svg>;
    case 'chat':
      return <Svg {...props}><Path d="M4 5h16v11H8l-4 4V5z" /></Svg>;
    case 'me':
      return <Svg {...props}><Circle cx="12" cy="8" r="4" /><Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></Svg>;
    case 'search':
      return <Svg {...props}><Circle cx="11" cy="11" r="7" /><Path d="M21 21l-4.5-4.5" /></Svg>;
    case 'bell':
      return <Svg {...props}><Path d="M6 16V11a6 6 0 1112 0v5l1.5 2.5h-15L6 16z" /><Path d="M10 21h4" /></Svg>;
    case 'menu':
      return <Svg {...props}><Path d="M3 6h18M3 12h18M3 18h18" /></Svg>;
    case 'plus':
      return <Svg {...props} strokeWidth={2}><Path d="M12 5v14M5 12h14" /></Svg>;
    case 'back':
      return <Svg {...props}><Path d="M15 18l-6-6 6-6" /></Svg>;
    case 'heart':
      return <Svg {...props}><Path d="M12 20s-7-4.5-7-10a4 4 0 017-2.7A4 4 0 0119 10c0 5.5-7 10-7 10z" /></Svg>;
    case 'heartFill':
      return <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}><Path d="M12 20s-7-4.5-7-10a4 4 0 017-2.7A4 4 0 0119 10c0 5.5-7 10-7 10z" /></Svg>;
    case 'share':
      return <Svg {...props}><Circle cx="6" cy="12" r="2" /><Circle cx="18" cy="6" r="2" /><Circle cx="18" cy="18" r="2" /><Path d="M8 11l8-4M8 13l8 4" /></Svg>;
    case 'down':
      return <Svg {...props}><Path d="M6 9l6 6 6-6" /></Svg>;
    case 'up':
      return <Svg {...props}><Path d="M6 15l6-6 6 6" /></Svg>;
    case 'right':
      return <Svg {...props}><Path d="M9 6l6 6-6 6" /></Svg>;
    case 'check':
      return <Svg {...props}><Path d="M5 12l5 5L20 7" /></Svg>;
    case 'pin':
      return <Svg {...props}><Path d="M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z" /><Circle cx="12" cy="9" r="2.5" /></Svg>;
    case 'eye':
      return <Svg {...props}><Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><Circle cx="12" cy="12" r="3" /></Svg>;
    case 'send':
      return <Svg {...props}><Path d="M3 11l18-7-7 18-2-7-9-4z" /></Svg>;
    case 'image':
      return <Svg {...props}><Rect x="3" y="4" width="18" height="16" rx="2" /><Circle cx="9" cy="10" r="1.6" /><Path d="M21 16l-5-5-9 9" /></Svg>;
    case 'sliders':
      return <Svg {...props}><Path d="M4 6h12M20 6h0M4 12h2M10 12h10M4 18h10M18 18h2" /><Circle cx="18" cy="6" r="2" /><Circle cx="8" cy="12" r="2" /><Circle cx="16" cy="18" r="2" /></Svg>;
    case 'comment':
      return <Svg {...props}><Path d="M4 5h16v11H8l-4 4V5z" /></Svg>;
    case 'flame':
      return <Svg {...props}><Path d="M12 3s2 3 2 6-2 4-2 4 4 .5 4 5a4 4 0 11-8 0c0-2 .5-3 1.5-4-1-1.5-1.5-3-1.5-5 0-3 4-6 4-6z" /></Svg>;
    case 'trash':
      return <Svg {...props}><Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /><Path d="M10 11v6M14 11v6" /></Svg>;
    default:
      return null;
  }
}
