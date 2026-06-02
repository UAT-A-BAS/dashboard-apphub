import {
  BarChart3,
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  FileText,
  Gauge,
  Home,
  LayoutDashboard,
  LucideIcon,
  Mail,
  NotebookTabs,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Users,
  Wind,
} from 'lucide-react';

export const shortcutIcons = {
  BarChart3,
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Gauge,
  Home,
  LayoutDashboard,
  Mail,
  NotebookTabs,
  Settings,
  Shield,
  Sparkles,
  Users,
} satisfies Record<string, LucideIcon>;

export const weatherIcons = {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Sun,
  Wind,
} satisfies Record<string, LucideIcon>;

export type ShortcutIconName = keyof typeof shortcutIcons;
export type WeatherIconName = keyof typeof weatherIcons;

export const shortcutIconNames = Object.keys(shortcutIcons) as ShortcutIconName[];
