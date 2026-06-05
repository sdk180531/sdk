import Svg, { Path } from 'react-native-svg';

export function KakaoIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#3C1E1E"
        d="M12 3C6.477 3 2 6.71 2 11.26c0 2.9 1.9 5.45 4.77 6.9l-1.22 4.47 5.2-3.43c.4.05.82.08 1.25.08 5.523 0 10-3.71 10-8.26C22 6.71 17.523 3 12 3z"
      />
      <Path
        fill="#FEE500"
        d="M7.5 13.1l1.06-2.78 1.07 2.78H7.5zm2.84.9l.45 1.17h1.28l-2.28-5.74h-1.3L6.2 15.17h1.27l.44-1.17h2.43zm3.16-4.57h-1.2v5.74h1.2V9.43zm2.36 0h-1.2v5.74h3.5v-1.1h-2.3V9.43z"
      />
    </Svg>
  );
}
