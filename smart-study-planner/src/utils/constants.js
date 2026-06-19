export const PRIORITY = {
  LOW:    'LOW',
  MEDIUM: 'MEDIUM',
  HIGH:   'HIGH',
};

export const TASK_STATUS = {
  PENDING:    'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED:  'COMPLETED',
};

export const GOAL_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED:   'COMPLETED',
  ABANDONED:   'ABANDONED',
};

export const SESSION_TYPE = {
  FOCUS:       'FOCUS',
  SHORT_BREAK: 'SHORT_BREAK',
  LONG_BREAK:  'LONG_BREAK',
};

export const DAYS = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
];

export const ROLE = {
  USER:  'USER',
  ADMIN: 'ADMIN',
};

export const ROUTES = {
  LOGIN:           '/login',
  REGISTER:        '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD:  '/reset-password',
  DASHBOARD:       '/dashboard',
  PROFILE:         '/profile',
  SUBJECTS:        '/subjects',
  TASKS:           '/tasks',
  NOTES:           '/notes',
  GOALS:           '/goals',
  PLANNER:         '/planner',
  TIMETABLE:       '/timetable',
  PROGRESS:        '/progress',
  POMODORO:        '/pomodoro',
  ANALYTICS:       '/analytics',
  AI:              '/ai',
  NOTIFICATIONS:   '/notifications',
  SETTINGS:        '/settings',
  ADMIN:           '/admin/dashboard',
};

export const PRIORITY_COLORS = {
  LOW:    'var(--accent-green)',
  MEDIUM: 'var(--accent-orange)',
  HIGH:   'var(--accent-red)',
};

export const STATUS_COLORS = {
  PENDING:     'var(--accent-orange)',
  IN_PROGRESS: 'var(--accent-blue)',
  COMPLETED:   'var(--accent-green)',
};

export const SUBJECT_COLORS = [
  '#7C6FCD', '#38BDF8', '#4ADE80', '#FB923C',
  '#F472B6', '#FBBF24', '#34D399', '#60A5FA',
  '#F87171', '#A78BFA', '#E879F9', '#2DD4BF',
];
