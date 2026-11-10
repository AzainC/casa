import React from 'react';
import type { ChainConfig } from '../types';
import { Building2, Fuel, ShoppingCart, Store, Tag } from 'lucide-react';

export interface ChainColorOption {
  id: string;
  name: string;
  previewBg: string;      // Color dot/swatch
  pillClass: string;      // Soft badge/pill class
  solidClass: string;     // Solid button/icon background
  lightClass: string;     // Light rounded icon box
  textClass: string;      // Foreground accent text
  borderClass: string;    // Border accent
}

export const AVAILABLE_CHAIN_COLORS: ChainColorOption[] = [
  {
    id: 'emerald',
    name: 'Emerald Green',
    previewBg: 'bg-emerald-600',
    pillClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
    solidClass: 'bg-emerald-800 text-white',
    lightClass: 'bg-emerald-100 text-emerald-800',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-500',
  },
  {
    id: 'green',
    name: 'Classic Green',
    previewBg: 'bg-green-600',
    pillClass: 'bg-green-50 text-green-800 border-green-200/60',
    solidClass: 'bg-green-700 text-white',
    lightClass: 'bg-green-100 text-green-800',
    textClass: 'text-green-700',
    borderClass: 'border-green-500',
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    previewBg: 'bg-amber-600',
    pillClass: 'bg-amber-50 text-amber-800 border-amber-200/60',
    solidClass: 'bg-amber-700 text-white',
    lightClass: 'bg-amber-100 text-amber-800',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-500',
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    previewBg: 'bg-purple-600',
    pillClass: 'bg-purple-50 text-purple-800 border-purple-200/60',
    solidClass: 'bg-purple-700 text-white',
    lightClass: 'bg-purple-100 text-purple-800',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-500',
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    previewBg: 'bg-blue-600',
    pillClass: 'bg-blue-50 text-blue-800 border-blue-200/60',
    solidClass: 'bg-blue-700 text-white',
    lightClass: 'bg-blue-100 text-blue-800',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-500',
  },
  {
    id: 'rose',
    name: 'Rose Pink',
    previewBg: 'bg-rose-600',
    pillClass: 'bg-rose-50 text-rose-800 border-rose-200/60',
    solidClass: 'bg-rose-700 text-white',
    lightClass: 'bg-rose-100 text-rose-800',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-500',
  },
  {
    id: 'orange',
    name: 'Vibrant Orange',
    previewBg: 'bg-orange-600',
    pillClass: 'bg-orange-50 text-orange-800 border-orange-200/60',
    solidClass: 'bg-orange-600 text-white',
    lightClass: 'bg-orange-100 text-orange-800',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-500',
  },
  {
    id: 'teal',
    name: 'Deep Teal',
    previewBg: 'bg-teal-600',
    pillClass: 'bg-teal-50 text-teal-800 border-teal-200/60',
    solidClass: 'bg-teal-700 text-white',
    lightClass: 'bg-teal-100 text-teal-800',
    textClass: 'text-teal-700',
    borderClass: 'border-teal-500',
  },
  {
    id: 'indigo',
    name: 'Indigo',
    previewBg: 'bg-indigo-600',
    pillClass: 'bg-indigo-50 text-indigo-800 border-indigo-200/60',
    solidClass: 'bg-indigo-700 text-white',
    lightClass: 'bg-indigo-100 text-indigo-800',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-500',
  },
  {
    id: 'cyan',
    name: 'Bright Cyan',
    previewBg: 'bg-cyan-600',
    pillClass: 'bg-cyan-50 text-cyan-800 border-cyan-200/60',
    solidClass: 'bg-cyan-700 text-white',
    lightClass: 'bg-cyan-100 text-cyan-800',
    textClass: 'text-cyan-700',
    borderClass: 'border-cyan-500',
  },
  {
    id: 'red',
    name: 'Crimson Red',
    previewBg: 'bg-red-600',
    pillClass: 'bg-red-50 text-red-800 border-red-200/60',
    solidClass: 'bg-red-700 text-white',
    lightClass: 'bg-red-100 text-red-800',
    textClass: 'text-red-700',
    borderClass: 'border-red-500',
  },
  {
    id: 'stone',
    name: 'Neutral Slate',
    previewBg: 'bg-stone-600',
    pillClass: 'bg-stone-100 text-stone-800 border-stone-200/70',
    solidClass: 'bg-stone-800 text-white',
    lightClass: 'bg-stone-100 text-stone-700',
    textClass: 'text-stone-700',
    borderClass: 'border-stone-400',
  },
];

export const DEFAULT_CHAINS: ChainConfig[] = [
  {
    id: 'choithrams',
    name: 'Choithrams',
    color: 'emerald',
    icon: 'building',
  },
  {
    id: 'emarat',
    name: 'Emarat',
    color: 'green',
    icon: 'fuel',
  },
  {
    id: 'grandiose',
    name: 'Grandiose',
    color: 'purple',
    icon: 'cart',
  },
];

const COLOR_MAP: Record<string, ChainColorOption> = AVAILABLE_CHAIN_COLORS.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {} as Record<string, ChainColorOption>);

// Fallback color hashing for unknown chains
const PALETTE_KEYS = ['purple', 'blue', 'orange', 'rose', 'teal', 'indigo', 'cyan', 'amber', 'emerald'];

function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % PALETTE_KEYS.length;
  return PALETTE_KEYS[idx];
}

export interface ResolvedChainStyle {
  name: string;
  color: string;
  avatarText: string;
  iconType: 'building' | 'fuel' | 'cart' | 'store' | 'tag';
  pillClass: string;
  solidClass: string;
  lightClass: string;
  textClass: string;
  borderClass: string;
  previewBg: string;
}

export function getChainStyle(chainName: string, customChains?: ChainConfig[]): ResolvedChainStyle {
  const normalized = (chainName || 'Store').trim();
  const lower = normalized.toLowerCase();

  // Search in custom chains first, then defaults
  const allChains = [...(customChains || []), ...DEFAULT_CHAINS];
  const found = allChains.find(
    (c) => c.name.toLowerCase() === lower || c.id.toLowerCase() === lower
  );

  let colorKey = found?.color;
  if (!colorKey || !COLOR_MAP[colorKey]) {
    // Specific well-known brand fallbacks
    if (lower.includes('choithram')) colorKey = 'emerald';
    else if (lower.includes('emarat')) colorKey = 'green';
    else if (lower.includes('grandiose')) colorKey = 'purple';
    else if (lower.includes('lulu')) colorKey = 'red';
    else if (lower.includes('carrefour')) colorKey = 'blue';
    else if (lower.includes('spinneys')) colorKey = 'orange';
    else colorKey = hashStringToColor(normalized);
  }

  const colorOpt = COLOR_MAP[colorKey] || COLOR_MAP.stone;

  // Icon deduction
  let iconType: 'building' | 'fuel' | 'cart' | 'store' | 'tag' = (found?.icon as any) || 'store';
  if (!found?.icon) {
    if (lower.includes('emarat') || lower.includes('petrol') || lower.includes('station') || lower.includes('fuel')) {
      iconType = 'fuel';
    } else if (lower.includes('supermarket') || lower.includes('choithram')) {
      iconType = 'building';
    } else if (lower.includes('mart') || lower.includes('hyper') || lower.includes('lulu') || lower.includes('grandiose')) {
      iconType = 'cart';
    }
  }

  // 2-Letter avatar abbreviation
  const parts = normalized.split(/\s+/).filter(Boolean);
  let avatarText = '';
  if (parts.length >= 2) {
    avatarText = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (normalized.length >= 2) {
    avatarText = normalized.substring(0, 2).toUpperCase();
  } else {
    avatarText = (normalized[0] || 'ST').toUpperCase();
  }

  return {
    name: found?.name || normalized,
    color: colorKey,
    avatarText,
    iconType,
    pillClass: colorOpt.pillClass,
    solidClass: colorOpt.solidClass,
    lightClass: colorOpt.lightClass,
    textClass: colorOpt.textClass,
    borderClass: colorOpt.borderClass,
    previewBg: colorOpt.previewBg,
  };
}

export function renderChainIcon(iconType: string, className = 'w-4 h-4'): React.ReactElement {
  switch (iconType) {
    case 'fuel':
      return <Fuel className={className} />;
    case 'building':
      return <Building2 className={className} />;
    case 'cart':
      return <ShoppingCart className={className} />;
    case 'tag':
      return <Tag className={className} />;
    case 'store':
    default:
      return <Store className={className} />;
  }
}
