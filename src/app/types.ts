// ─────────────────────────────────────────────
// Core data types
// ─────────────────────────────────────────────

export interface Transaction {
  id: number;
  type: 'earned' | 'redeemed';
  title: string;
  points: number;
  date: string;
}

export interface PickupRecord {
  id: string;
  wasteType: string;
  timeSlot: string;
  address: string;
  lat?: number;
  lng?: number;
  status: 'pending' | 'assigned' | 'on_the_way' | 'completed';
  date: string;
  points: number;
  driverAssigned?: string;
  driverName?: string;
}

export interface DumpsiteReport {
  id: string;
  location: string;
  description: string;
  severity: string;
  status: 'pending' | 'verified' | 'cleaned';
  date: string;
  lat?: number;
  lng?: number;
}

export type UserTier = 'Bronze' | 'Silver' | 'Gold';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  points: number;
  wasteRecycled: number;
  tier: UserTier;
  memberSince: string;
  transactions: Transaction[];
  pickupHistory: PickupRecord[];
  dumpsiteReports: DumpsiteReport[];
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  vehicle: string;
  licenseNo: string;
  area: string;
  isOnline: boolean;
  trips: number;
  rating: number;
  totalEarnings: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'pickup' | 'report' | 'reward' | 'system';
  read: boolean;
  timestamp: number;
  pickupId?: string;
}

// ─────────────────────────────────────────────
// Tier helpers
// ─────────────────────────────────────────────

export function computeTier(points: number): UserTier {
  if (points >= 3000) return 'Gold';
  if (points >= 1000) return 'Silver';
  return 'Bronze';
}

export function pointsToNextTier(points: number): { next: UserTier | null; needed: number } {
  if (points < 1000) return { next: 'Silver', needed: 1000 - points };
  if (points < 3000) return { next: 'Gold', needed: 3000 - points };
  return { next: null, needed: 0 };
}

// ─────────────────────────────────────────────
// Storage keys
// ─────────────────────────────────────────────

const STORAGE_USERS_KEY = 'cleanloop_users';
const STORAGE_SESSION_KEY = 'cleanloop_session';
const STORAGE_DRIVERS_KEY = 'cleanloop_drivers';
const STORAGE_DRIVER_SESSION_KEY = 'cleanloop_driver_session';
const STORAGE_ADMIN_SESSION_KEY = 'cleanloop_admin_session';
const STORAGE_NOTIFICATIONS_KEY = 'cleanloop_notifications';

// ─────────────────────────────────────────────
// User CRUD
// ─────────────────────────────────────────────

export function getStoredUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveUser(user: User): void {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx !== -1) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

export function getSession(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(user: User): void {
  localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_SESSION_KEY);
}

export function loginUser(email: string, password: string): User | null {
  const users = getStoredUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
}

export function registerUser(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}): { user: User | null; error: string | null } {
  const users = getStoredUsers();
  if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { user: null, error: 'An account with this email already exists.' };
  }

  const now = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const newUser: User = {
    id: `user_${Date.now()}`,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    password: data.password,
    address: '',
    points: 0,
    wasteRecycled: 0,
    tier: 'Bronze',
    memberSince: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
    transactions: [],
    pickupHistory: [],
    dumpsiteReports: [],
  };

  saveUser(newUser);
  return { user: newUser, error: null };
}

// ─────────────────────────────────────────────
// Driver auth
// ─────────────────────────────────────────────

export function getStoredDrivers(): Driver[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_DRIVERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveDriver(driver: Driver): void {
  const drivers = getStoredDrivers();
  const idx = drivers.findIndex((d) => d.id === driver.id);
  if (idx !== -1) {
    drivers[idx] = driver;
  } else {
    drivers.push(driver);
  }
  localStorage.setItem(STORAGE_DRIVERS_KEY, JSON.stringify(drivers));
}

export function loginDriver(email: string, password: string): Driver | null {
  const drivers = getStoredDrivers();
  return drivers.find(
    (d) => d.email.toLowerCase() === email.toLowerCase() && d.password === password
  ) || null;
}

export function getDriverSession(): Driver | null {
  try {
    const raw = localStorage.getItem(STORAGE_DRIVER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setDriverSession(driver: Driver): void {
  localStorage.setItem(STORAGE_DRIVER_SESSION_KEY, JSON.stringify(driver));
}

export function clearDriverSession(): void {
  localStorage.removeItem(STORAGE_DRIVER_SESSION_KEY);
}

// ─────────────────────────────────────────────
// Admin auth (hardcoded credentials)
// ─────────────────────────────────────────────

const ADMIN_CREDENTIALS = { email: 'admin@cleanloop.ng', password: 'Admin@123' };

export function loginAdmin(email: string, password: string): boolean {
  return (
    email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() &&
    password === ADMIN_CREDENTIALS.password
  );
}

export function getAdminSession(): boolean {
  return localStorage.getItem(STORAGE_ADMIN_SESSION_KEY) === 'true';
}

export function setAdminSession(): void {
  localStorage.setItem(STORAGE_ADMIN_SESSION_KEY, 'true');
}

export function clearAdminSession(): void {
  localStorage.removeItem(STORAGE_ADMIN_SESSION_KEY);
}

// ─────────────────────────────────────────────
// Admin / Driver helpers: cross-user pickup access
// ─────────────────────────────────────────────

export interface GlobalPickup extends PickupRecord {
  userId: string;
  userName: string;
  userPhone: string;
  userAddress: string;
}

export function getAllPickups(): GlobalPickup[] {
  const users = getStoredUsers();
  const result: GlobalPickup[] = [];
  for (const user of users) {
    for (const pickup of user.pickupHistory) {
      result.push({
        ...pickup,
        userId: user.id,
        userName: user.fullName,
        userPhone: user.phone,
        userAddress: user.address,
      });
    }
  }
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllDumpsiteReports(): Array<DumpsiteReport & { userId: string; userName: string }> {
  const users = getStoredUsers();
  const result: Array<DumpsiteReport & { userId: string; userName: string }> = [];
  for (const user of users) {
    for (const report of user.dumpsiteReports) {
      result.push({ ...report, userId: user.id, userName: user.fullName });
    }
  }
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function updatePickupStatus(
  userId: string,
  pickupId: string,
  status: PickupRecord['status'],
  driverAssigned?: string,
  driverName?: string
): void {
  const users = getStoredUsers();
  const userIdx = users.findIndex((u) => u.id === userId);
  if (userIdx === -1) return;
  const pickupIdx = users[userIdx].pickupHistory.findIndex((p) => p.id === pickupId);
  if (pickupIdx === -1) return;

  users[userIdx].pickupHistory[pickupIdx] = {
    ...users[userIdx].pickupHistory[pickupIdx],
    status,
    ...(driverAssigned ? { driverAssigned } : {}),
    ...(driverName ? { driverName } : {}),
  };

  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

  // If this is the current user session, sync the session too
  const session = getSession();
  if (session && session.id === userId) {
    const updatedSession = {
      ...session,
      pickupHistory: users[userIdx].pickupHistory,
    };
    setSession(updatedSession);
  }
}

export function updateDumpsiteStatus(
  userId: string,
  reportId: string,
  status: DumpsiteReport['status']
): void {
  const users = getStoredUsers();
  const userIdx = users.findIndex((u) => u.id === userId);
  if (userIdx === -1) return;
  const reportIdx = users[userIdx].dumpsiteReports.findIndex((r) => r.id === reportId);
  if (reportIdx === -1) return;
  users[userIdx].dumpsiteReports[reportIdx].status = status;
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

export function getNotifications(userId: string): AppNotification[] {
  try {
    const all: AppNotification[] = JSON.parse(
      localStorage.getItem(STORAGE_NOTIFICATIONS_KEY) || '[]'
    );
    return all.filter((n) => n.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export function addNotification(notif: Omit<AppNotification, 'id' | 'read' | 'timestamp'>): AppNotification {
  const all: AppNotification[] = JSON.parse(
    localStorage.getItem(STORAGE_NOTIFICATIONS_KEY) || '[]'
  );
  const newNotif: AppNotification = {
    ...notif,
    id: `notif_${Date.now()}`,
    read: false,
    timestamp: Date.now(),
  };
  all.unshift(newNotif);
  // Keep max 50 notifications per user
  const trimmed = all.slice(0, 50);
  localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(trimmed));
  return newNotif;
}

export function markAllNotificationsRead(userId: string): void {
  const all: AppNotification[] = JSON.parse(
    localStorage.getItem(STORAGE_NOTIFICATIONS_KEY) || '[]'
  );
  const updated = all.map((n) => (n.userId === userId ? { ...n, read: true } : n));
  localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(updated));
}

export function requestBrowserNotificationPermission(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function sendBrowserNotification(title: string, body: string, icon?: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
    });
  }
}

// ─────────────────────────────────────────────
// Demo user & seed data
// ─────────────────────────────────────────────

const DEMO_USER_ID = 'demo_user_cleanloop_001';
const DEMO_DRIVERS_SEEDED_KEY = 'cleanloop_drivers_seeded';

export function getDemoUser(): User {
  return {
    id: DEMO_USER_ID,
    fullName: 'Adaeze Okonkwo',
    email: 'demo@cleanloop.ng',
    phone: '+234 803 456 7890',
    password: 'demo123',
    address: '45 Adetokunbo Ademola Street, Victoria Island, Lagos',
    points: 850,
    wasteRecycled: 21.5,
    tier: 'Bronze',
    memberSince: 'January 2025',
    transactions: [
      { id: 1, type: 'earned', title: 'Recyclables Pickup', points: 150, date: 'Apr 28, 2025' },
      { id: 2, type: 'earned', title: 'General Waste Pickup', points: 100, date: 'Apr 22, 2025' },
      { id: 3, type: 'earned', title: 'Recyclables Pickup', points: 150, date: 'Apr 15, 2025' },
      { id: 4, type: 'earned', title: 'Dumpsite Report (Pending Verification)', points: 50, date: 'Apr 10, 2025' },
      { id: 5, type: 'earned', title: 'Organic Waste Pickup', points: 100, date: 'Apr 5, 2025' },
      { id: 6, type: 'earned', title: 'General Waste Pickup', points: 100, date: 'Mar 28, 2025' },
      { id: 7, type: 'redeemed', title: 'Redeemed: ₦500 Mobile Airtime', points: -1000, date: 'Mar 15, 2025' },
      { id: 8, type: 'earned', title: 'Recyclables Pickup', points: 150, date: 'Mar 10, 2025' },
      { id: 9, type: 'earned', title: 'General Waste Pickup', points: 100, date: 'Mar 5, 2025' },
    ],
    pickupHistory: [
      {
        id: 'PK-DEMO-001',
        wasteType: 'Recyclables',
        timeSlot: '08:00 AM – 10:00 AM',
        address: '45 Adetokunbo Ademola Street, Victoria Island',
        lat: 6.4281,
        lng: 3.4219,
        status: 'on_the_way',
        date: 'May 7, 2025',
        points: 150,
        driverAssigned: 'drv_001',
        driverName: 'Adebayo Olaniyi',
      },
      {
        id: 'PK-DEMO-002',
        wasteType: 'General Waste',
        timeSlot: '10:00 AM – 12:00 PM',
        address: '45 Adetokunbo Ademola Street, Victoria Island',
        status: 'completed',
        date: 'Apr 22, 2025',
        points: 100,
      },
      {
        id: 'PK-DEMO-003',
        wasteType: 'Recyclables',
        timeSlot: '06:00 AM – 08:00 AM',
        address: '45 Adetokunbo Ademola Street, Victoria Island',
        status: 'completed',
        date: 'Apr 15, 2025',
        points: 150,
      },
      {
        id: 'PK-DEMO-004',
        wasteType: 'Organic',
        timeSlot: '12:00 PM – 02:00 PM',
        address: '45 Adetokunbo Ademola Street, Victoria Island',
        status: 'completed',
        date: 'Apr 5, 2025',
        points: 100,
      },
      {
        id: 'PK-DEMO-005',
        wasteType: 'General Waste',
        timeSlot: '08:00 AM – 10:00 AM',
        address: '45 Adetokunbo Ademola Street, Victoria Island',
        status: 'completed',
        date: 'Mar 28, 2025',
        points: 100,
      },
    ],
    dumpsiteReports: [
      {
        id: 'RPT-DEMO-001',
        location: 'Under Carter Bridge, Lagos Island',
        description:
          'Large pile of mixed household waste blocking drainage channel near the bridge approach. Bags of garbage and broken electronics.',
        severity: 'High',
        status: 'verified',
        date: 'Apr 10, 2025',
        lat: 6.4573,
        lng: 3.3945,
      },
    ],
  };
}

export function loadDemoMode(onSuccess: (user: User) => void): void {
  const demoUser = getDemoUser();
  saveUser(demoUser);
  setSession(demoUser);
  onSuccess(demoUser);
}

const DEMO_DRIVERS: Driver[] = [
  {
    id: 'drv_001',
    name: 'Adebayo Olaniyi',
    email: 'driver1@cleanloop.ng',
    password: 'driver123',
    phone: '+234 812 345 6789',
    vehicle: 'Toyota Hilux – LAG 456 XY',
    licenseNo: 'LSD-2021-4567',
    area: 'Victoria Island / Lekki',
    isOnline: true,
    trips: 127,
    rating: 4.8,
    totalEarnings: 185000,
  },
  {
    id: 'drv_002',
    name: 'Emeka Osei',
    email: 'driver2@cleanloop.ng',
    password: 'driver123',
    phone: '+234 803 234 5678',
    vehicle: 'Isuzu D-Max – LAG 789 AB',
    licenseNo: 'LSD-2020-7891',
    area: 'Ikeja / Surulere',
    isOnline: true,
    trips: 89,
    rating: 4.6,
    totalEarnings: 124000,
  },
  {
    id: 'drv_003',
    name: 'Fatima Aliyu',
    email: 'driver3@cleanloop.ng',
    password: 'driver123',
    phone: '+234 706 567 8901',
    vehicle: 'Mitsubishi L200 – LAG 321 GH',
    licenseNo: 'LSD-2022-1234',
    area: 'Lekki / Ajah',
    isOnline: false,
    trips: 63,
    rating: 4.9,
    totalEarnings: 96500,
  },
];

export function seedInitialData(): void {
  // Seed drivers once
  if (!localStorage.getItem(DEMO_DRIVERS_SEEDED_KEY)) {
    DEMO_DRIVERS.forEach((d) => saveDriver(d));
    localStorage.setItem(DEMO_DRIVERS_SEEDED_KEY, 'true');
  }
}

export function getAdminCredentialHint(): { email: string; password: string } {
  return { email: ADMIN_CREDENTIALS.email, password: ADMIN_CREDENTIALS.password };
}
