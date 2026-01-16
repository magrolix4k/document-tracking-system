// Week date range utilities
export interface WeekDateRange {
  monday: string; // YYYY-MM-DD format
  sunday: string; // YYYY-MM-DD format
  weekLabel: string; // e.g., "13 - 19 Jan 2025"
}

export function getWeekDateRange(date: Date = new Date()): WeekDateRange {
  // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = date.getDay();
  
  // Calculate Monday (if today is Sunday, Monday is tomorrow)
  const mondayDate = new Date(date);
  const daysFromMonday = dayOfWeek === 0 ? 1 : dayOfWeek - 1; // If Sunday, add 1 day; otherwise subtract (day - 1)
  mondayDate.setDate(date.getDate() - daysFromMonday);
  
  // Calculate Sunday
  const sundayDate = new Date(mondayDate);
  sundayDate.setDate(mondayDate.getDate() + 6);
  
  // Format as YYYY-MM-DD
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const monday = formatDate(mondayDate);
  const sunday = formatDate(sundayDate);
  
  // Create readable label (e.g., "13 - 19 Jan 2025")
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[mondayDate.getMonth()];
  const year = mondayDate.getFullYear();
  const weekLabel = `${mondayDate.getDate()} - ${sundayDate.getDate()} ${month} ${year}`;
  
  return {
    monday,
    sunday,
    weekLabel,
  };
}

export function getCurrentWeekLabel(): string {
  return getWeekDateRange().weekLabel;
}

export function formatDateThai(dateString: string): string {
  const date = new Date(dateString);
  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear() + 543; // Thai Buddhist calendar
  const dayOfWeek = dayNames[date.getDay()];
  
  return `${dayOfWeek} ${day} ${month} ${year}`;
}
