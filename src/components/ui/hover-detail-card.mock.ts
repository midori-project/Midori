import type { HoverDetailCardData } from './hover-detail-card';

// A small set of realistic mock items you can replace with DB data later
export const hoverDetailCardMocks: HoverDetailCardData[] = [
  {
    title: 'Studio shots',
    subtitle: '52 likes',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=900&fit=crop'
    ],
    pills: {
      left: { text: '1×1', color: 'bg-blue-100', textColor: 'text-blue-800' },
      sparkle: { show: true, color: 'bg-purple-100 text-purple-800' },
      right: { text: 'Published', color: 'bg-green-100', textColor: 'text-green-800' }
    }
  },
  {
    title: 'Portraits',
    subtitle: '18 likes',
    images: [
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1200&h=900&fit=crop'
    ],
    pills: {
      left: { text: '4×3', color: 'bg-indigo-100', textColor: 'text-indigo-800' },
      sparkle: { show: false },
      right: { text: 'Draft', color: 'bg-yellow-100', textColor: 'text-yellow-800' }
    }
  },
  {
    title: 'Landscape Pack',
    subtitle: '120 likes',
    images: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=900&fit=crop'
    ],
    pills: {
      left: { text: '16×9', color: 'bg-emerald-100', textColor: 'text-emerald-800' },
      sparkle: { show: true, color: 'bg-emerald-100 text-emerald-800' },
      right: { text: 'Published', color: 'bg-green-100', textColor: 'text-green-800' }
    }
  },
  {
    title: 'Product Shots',
    subtitle: '34 likes',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&h=600&fit=crop'
    ],
    pills: {
      left: { text: '1×1', color: 'bg-slate-100', textColor: 'text-slate-800' },
      sparkle: { show: false },
      right: { text: 'Published', color: 'bg-green-100', textColor: 'text-green-800' }
    }
  },
  {
    title: 'Architecture',
    subtitle: '76 likes',
    images: [
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&h=900&fit=crop'
    ],
    pills: {
      left: { text: '3×2', color: 'bg-rose-100', textColor: 'text-rose-800' },
      sparkle: { show: true, color: 'bg-yellow-100 text-yellow-800' },
      right: { text: 'Archived', color: 'bg-gray-100', textColor: 'text-gray-800' }
    }
  },
  {
    title: 'Food & Beverage',
    subtitle: '42 likes',
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=900&fit=crop'
    ],
    pills: {
      left: { text: 'Square', color: 'bg-amber-100', textColor: 'text-amber-800' },
      sparkle: { show: false },
      right: { text: 'Draft', color: 'bg-yellow-100', textColor: 'text-yellow-800' }
    }
  }
];
