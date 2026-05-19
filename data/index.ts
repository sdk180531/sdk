export type ProductStatus = 'sale' | 'reserved' | 'sold' | 'free';

export interface Product {
  id: string;
  emoji: string;
  bg: string;
  titleKo: string;
  titleEn: string;
  price: number;
  location: string;
  locationEn: string;
  minutesAgo: number;
  hearts: number;
  chats: number;
  views: number;
  status: ProductStatus;
  seller: string;
  sellerEn: string;
  sellerEmoji: string;
  mannerTemp: number;
  descKo: string;
  descEn: string;
  imageUrl?: string;
  category?: number;
}

export interface Post {
  id: string;
  emoji: string;
  bg: string;
  author: string;
  authorEn: string;
  cat: string;
  catEn: string;
  titleKo: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  minutesAgo: number;
  comments: number;
  likes: number;
}

export interface Town {
  id: string;
  nameKo: string;
  nameEn: string;
  selected: boolean;
  distance: number;
}

export const PRODUCTS: Product[] = [
  { id: 'p1', emoji: '🪑', bg: '#FFD8C8', titleKo: '북유럽 원목 의자', titleEn: 'Nordic wood chair', price: 45000, location: '망원동', locationEn: 'Mangwon', minutesAgo: 12, hearts: 8, chats: 3, views: 124, status: 'sale', seller: '동네친구', sellerEn: 'NeighborFriend', sellerEmoji: '🦊', mannerTemp: 39.2, descKo: '이사가서 정리하는 의자입니다.', descEn: 'Selling this chair as I move.' },
  { id: 'p2', emoji: '👟', bg: '#C8E6C9', titleKo: '나이키 운동화 270mm', titleEn: 'Nike sneakers 270mm', price: 35000, location: '연남동', locationEn: 'Yeonnam', minutesAgo: 38, hearts: 14, chats: 5, views: 287, status: 'sale', seller: '런닝맨', sellerEn: 'RunnerMan', sellerEmoji: '🐯', mannerTemp: 41.5, descKo: '두 번 신고 판매해요.', descEn: 'Worn twice.' },
];

export const POSTS: Post[] = [
  { id: 'po1', emoji: '🐶', bg: '#FFD8C8', author: '망원댕댕이', authorEn: 'MangwonPup', cat: '동네질문', catEn: 'Question', titleKo: '망원시장 근처 24시간 동물병원 아시는 분?', titleEn: 'Any 24h vet near Mangwon market?', body: '강아지가 자꾸 기침을 해서요. 추천해주세요 🥺', bodyEn: 'My pup keeps coughing. Recs please 🥺', minutesAgo: 8, comments: 23, likes: 14 },
  { id: 'po2', emoji: '🥖', bg: '#FFE0B2', author: '빵순이', authorEn: 'BreadLover', cat: '동네소식', catEn: 'News', titleKo: '망원역 1번 출구 새 빵집 오픈했어요!', titleEn: 'New bakery opened at Mangwon stn exit 1!', body: '소금빵이 진짜 맛있어요. 오픈 기념 1+1 한대요.', bodyEn: '1+1 deal for opening. Salt bread is amazing.', minutesAgo: 35, comments: 47, likes: 89 },
  { id: 'po3', emoji: '🎾', bg: '#DCEDC8', author: '주말테니스', authorEn: 'WeekendTennis', cat: '같이해요', catEn: 'Together', titleKo: '주말 아침 테니스 같이 치실 분 구해요', titleEn: 'Looking for weekend morning tennis buddies', body: '토요일 7-9시 망원한강공원에서 함께해요. 초보 환영!', bodyEn: 'Sat 7-9am at Mangwon park. Beginners welcome!', minutesAgo: 180, comments: 12, likes: 28 },
  { id: 'po4', emoji: '🔑', bg: '#B3E5FC', author: '잃어버린열쇠', authorEn: 'LostKeys', cat: '동네분실센터', catEn: 'Lost & Found', titleKo: '망원초 근처에서 빨간 키링 보신 분?', titleEn: 'Anyone seen a red keychain near Mangwon-cho?', body: '오늘 오후에 잃어버렸어요. 보시면 연락 부탁드려요.', bodyEn: 'Lost it this afternoon. Please contact if you see it.', minutesAgo: 240, comments: 5, likes: 3 },
  { id: 'po5', emoji: '🧹', bg: '#E1BEE7', author: '깔끔이', authorEn: 'CleanFreak', cat: '해주세요', catEn: 'Help', titleKo: '이사 청소 도와주실 분 구해요 (5만원)', titleEn: 'Need help with move-in cleaning (₩50k)', body: '이번 주말 토요일 오전 2-3시간이면 됩니다.', bodyEn: 'Sat morning, 2-3 hours should do it.', minutesAgo: 480, comments: 8, likes: 4 },
  { id: 'po6', emoji: '🌸', bg: '#F8BBD0', author: '봄꽃놀이', authorEn: 'SpringFlower', cat: '동네소식', catEn: 'News', titleKo: '망원유수지에 벚꽃 만개했어요!', titleEn: 'Cherry blossoms in full bloom at Mangwon park!', body: '오늘 산책 다녀왔는데 정말 예뻐요. 사진 첨부합니다 🌸', bodyEn: 'Walked there today, gorgeous. Photo attached 🌸', minutesAgo: 720, comments: 34, likes: 156 },
];

export const TOWNS: Town[] = [
  { id: 't1', nameKo: '망원동', nameEn: 'Mangwon', selected: true, distance: 0 },
  { id: 't2', nameKo: '연남동', nameEn: 'Yeonnam', selected: false, distance: 1.2 },
  { id: 't3', nameKo: '합정동', nameEn: 'Hapjeong', selected: false, distance: 1.5 },
  { id: 't4', nameKo: '서교동', nameEn: 'Seogyo', selected: false, distance: 2.0 },
  { id: 't5', nameKo: '상수동', nameEn: 'Sangsu', selected: false, distance: 2.4 },
  { id: 't6', nameKo: '성산동', nameEn: 'Seongsan', selected: false, distance: 2.8 },
  { id: 't7', nameKo: '연희동', nameEn: 'Yeonhui', selected: false, distance: 3.1 },
  { id: 't8', nameKo: '홍대입구', nameEn: 'Hongdae', selected: false, distance: 3.4 },
];
