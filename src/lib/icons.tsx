import { ComponentType, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

function makeIcon(paths: string[], viewBox = '0 0 24 24') {
  return function Icon({ size = 24, strokeWidth = 2, ...props }: IconProps) {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        viewBox={viewBox}
        width={size}
        {...props}
      >
        {paths.map((path, index) => (
          <path d={path} key={index} />
        ))}
      </svg>
    );
  };
}

export const ArrowDown = makeIcon(['M12 5v14', 'm19 12-7 7-7-7']);
export const ArrowUp = makeIcon(['M12 19V5', 'm5 12 7-7 7 7']);
export const ArrowUpRight = makeIcon(['M7 17 17 7', 'M9 7h8v8']);
export const BarChart3 = makeIcon(['M4 19V9', 'M12 19V5', 'M20 19v-7']);
export const BookOpenText = makeIcon(['M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z', 'M8 7h8', 'M8 11h7']);
export const BriefcaseBusiness = makeIcon(['M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1', 'M4 7h16v12H4z', 'M9 12h6']);
export const CalendarDays = makeIcon(['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 5h14a2 2 0 0 1 2 2v12H3V7a2 2 0 0 1 2-2z']);
export const Cloud = makeIcon(['M17.5 18H8a4 4 0 1 1 .8-7.9A6 6 0 0 1 20 12.5 3.5 3.5 0 0 1 17.5 18z']);
export const CloudDrizzle = makeIcon(['M17.5 15.5H8a4 4 0 1 1 .8-7.9A6 6 0 0 1 20 10a3.5 3.5 0 0 1-2.5 5.5z', 'M8 19v1', 'M12 18v1', 'M16 19v1']);
export const CloudFog = makeIcon(['M17.5 14.5H8a4 4 0 1 1 .8-7.9A6 6 0 0 1 20 9a3.5 3.5 0 0 1-2.5 5.5z', 'M5 18h14', 'M7 21h10']);
export const CloudLightning = makeIcon(['M17.5 15.5H8a4 4 0 1 1 .8-7.9A6 6 0 0 1 20 10a3.5 3.5 0 0 1-2.5 5.5z', 'm13 17-2 4h3l-2 3']);
export const CloudRain = makeIcon(['M17.5 15.5H8a4 4 0 1 1 .8-7.9A6 6 0 0 1 20 10a3.5 3.5 0 0 1-2.5 5.5z', 'M8 19l-1 2', 'M12 19l-1 2', 'M16 19l-1 2']);
export const CloudSun = makeIcon(['M12 4V2', 'm5.7 3.3 1.4-1.4', 'M20 10h2', 'M15.5 7.5A4.5 4.5 0 0 0 8 10.8', 'M17.5 18H8a4 4 0 1 1 .8-7.9A6 6 0 0 1 20 12.5 3.5 3.5 0 0 1 17.5 18z']);
export const Download = makeIcon(['M12 3v12', 'm7 10 5 5 5-5', 'M5 21h14']);
export const Droplets = makeIcon(['M7 14a3 3 0 1 0 6 0c0-2-3-5-3-5s-3 3-3 5z', 'M14 8a2.5 2.5 0 1 0 5 0c0-1.7-2.5-4.2-2.5-4.2S14 6.3 14 8z']);
export const FileText = makeIcon(['M6 3h8l4 4v14H6z', 'M14 3v5h5', 'M9 13h6', 'M9 17h6']);
export const Gauge = makeIcon(['M4 14a8 8 0 1 1 16 0', 'M12 14l4-4', 'M8 18h8']);
export const Home = makeIcon(['M3 11 12 3l9 8', 'M5 10v10h14V10', 'M9 20v-6h6v6']);
export const LayoutDashboard = makeIcon(['M4 4h7v7H4z', 'M13 4h7v4h-7z', 'M13 10h7v10h-7z', 'M4 13h7v7H4z']);
export const LogOut = makeIcon(['M10 17l5-5-5-5', 'M15 12H3', 'M21 3v18h-7']);
export const Mail = makeIcon(['M4 6h16v12H4z', 'm4 9 4-3 4 3', 'm4 3 8 6 8-6']);
export const MapPin = makeIcon(['M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z', 'M12 10.5h.01']);
export const NotebookTabs = makeIcon(['M6 4h12v16H6z', 'M3 8h3', 'M3 12h3', 'M3 16h3', 'M9 8h6']);
export const Plus = makeIcon(['M12 5v14', 'M5 12h14']);
export const RefreshCcw = makeIcon(['M21 12a9 9 0 0 1-15 6.7', 'M3 12a9 9 0 0 1 15-6.7', 'M18 3v4h-4', 'M6 21v-4h4']);
export const Save = makeIcon(['M5 3h12l2 2v16H5z', 'M8 3v6h8V3', 'M8 21v-7h8v7']);
export const Search = makeIcon(['M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z', 'm21 21-4.3-4.3']);
export const Settings = makeIcon(['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M12 2v3', 'M12 19v3', 'M4.9 4.9 7 7', 'M17.1 17.1l2 2', 'M2 12h3', 'M19 12h3']);
export const Shield = makeIcon(['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z']);
export const ShieldCheck = makeIcon(['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'm9 12 2 2 4-5']);
export const Sparkles = makeIcon(['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', 'M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z']);
export const Sun = makeIcon(['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M12 2v2', 'M12 20v2', 'M4.9 4.9l1.4 1.4', 'M17.7 17.7l1.4 1.4', 'M2 12h2', 'M20 12h2', 'M4.9 19.1l1.4-1.4', 'M17.7 6.3l1.4-1.4']);
export const ThermometerSun = makeIcon(['M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z', 'M18 4v2', 'M21 7h-2', 'm19.5 3.5-1.2 1.2']);
export const Trash = makeIcon(['M3 6h18', 'M8 6V4h8v2', 'M6 6l1 15h10l1-15', 'M10 11v6', 'M14 11v6']);
export const Upload = makeIcon(['M12 21V9', 'm7 14 5-5 5 5', 'M5 3h14']);
export const Users = makeIcon(['M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2', 'M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M22 21v-2a4 4 0 0 0-3-3.8', 'M16 3.2a4 4 0 0 1 0 7.6']);
export const Wind = makeIcon(['M3 8h11a3 3 0 1 0-3-3', 'M3 12h16', 'M3 16h10a3 3 0 1 1-3 3']);

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
} satisfies Record<string, ComponentType<IconProps>>;

export const weatherIcons = {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Sun,
  Wind,
} satisfies Record<string, ComponentType<IconProps>>;

export type ShortcutIconName = keyof typeof shortcutIcons;
export type WeatherIconName = keyof typeof weatherIcons;

export const shortcutIconNames = Object.keys(shortcutIcons) as ShortcutIconName[];
