/* Minimal stroke icon set — matches landing's Icons.tsx vocabulary (lucide-style) */
const Icon = ({ d, size = 16, sw = 1.8, fill = "none", stroke = "currentColor", style, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} {...rest}>
    {d}
  </svg>
);

const I = {
  // Nav
  Home:        (p) => <Icon {...p} d={<><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></>}/>,
  Calendar:    (p) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>}/>,
  Grid:        (p) => <Icon {...p} d={<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>}/>,
  Clock:       (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>}/>,
  Code:        (p) => <Icon {...p} d={<><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></>}/>,
  Globe:       (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>}/>,
  Settings:    (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>}/>,

  // UI
  Search:      (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>}/>,
  Bell:        (p) => <Icon {...p} d={<><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></>}/>,
  Plus:        (p) => <Icon {...p} d={<><path d="M12 5v14M5 12h14"/></>}/>,
  Minus:       (p) => <Icon {...p} d={<path d="M5 12h14"/>}/>,
  X:           (p) => <Icon {...p} d={<path d="M18 6L6 18M6 6l12 12"/>}/>,
  Check:       (p) => <Icon {...p} d={<path d="M20 6L9 17l-5-5"/>}/>,
  ArrowRight:  (p) => <Icon {...p} d={<><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></>}/>,
  ArrowLeft:   (p) => <Icon {...p} d={<><path d="M19 12H5"/><path d="M11 5l-7 7 7 7"/></>}/>,
  ChevronDown: (p) => <Icon {...p} d={<path d="M6 9l6 6 6-6"/>}/>,
  ChevronRight:(p) => <Icon {...p} d={<path d="M9 6l6 6-6 6"/>}/>,
  ChevronLeft: (p) => <Icon {...p} d={<path d="M15 6l-6 6 6 6"/>}/>,
  Filter:      (p) => <Icon {...p} d={<path d="M3 4h18l-7 9v6l-4 2v-8z"/>}/>,
  More:        (p) => <Icon {...p} d={<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>}/>,
  Logout:      (p) => <Icon {...p} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></>}/>,
  Menu:        (p) => <Icon {...p} d={<><path d="M3 6h18M3 12h18M3 18h18"/></>}/>,

  // Domain
  Users:       (p) => <Icon {...p} d={<><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}/>,
  User:        (p) => <Icon {...p} d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}/>,
  Phone:       (p) => <Icon {...p} d={<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>}/>,
  Mail:        (p) => <Icon {...p} d={<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></>}/>,
  MapPin:      (p) => <Icon {...p} d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>}/>,
  Sparkles:    (p) => <Icon {...p} d={<><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 15l.6 1.8 1.8.6-1.8.6L19 19.8l-.6-1.8-1.8-.6 1.8-.6z"/><path d="M5 5l.4 1.2 1.2.4-1.2.4L5 8.2l-.4-1.2L3.4 6.6l1.2-.4z"/></>}/>,
  Copy:        (p) => <Icon {...p} d={<><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>}/>,
  Open:        (p) => <Icon {...p} d={<><path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>}/>,
  Eye:         (p) => <Icon {...p} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></>}/>,
  Pencil:      (p) => <Icon {...p} d={<><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></>}/>,
  Trash:       (p) => <Icon {...p} d={<><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></>}/>,
  Save:        (p) => <Icon {...p} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></>}/>,
  Zoom:        (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6M11 8v6"/></>}/>,
  ZoomOut:     (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6"/></>}/>,
  Maximize:    (p) => <Icon {...p} d={<><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></>}/>,
  Star:        (p) => <Icon {...p} d={<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>}/>,
  Bolt:        (p) => <Icon {...p} d={<path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>}/>,
  Info:        (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></>}/>,
  Lock:        (p) => <Icon {...p} d={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}/>,
  Bookmark:    (p) => <Icon {...p} d={<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>}/>,
  TrendUp:     (p) => <Icon {...p} d={<><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></>}/>,
  Coffee:      (p) => <Icon {...p} d={<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"/><path d="M6 1v3M10 1v3M14 1v3"/></>}/>,
  Drag:        (p) => <Icon {...p} d={<><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></>}/>,
  Command:     (p) => <Icon {...p} d={<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>}/>,
  Send:        (p) => <Icon {...p} d={<><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></>}/>,
  AlertCircle: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></>}/>,
  Repeat:      (p) => <Icon {...p} d={<><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></>}/>,
};

window.I = I;
