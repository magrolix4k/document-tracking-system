// Shared Utility Functions

export function generateDocumentId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `DOC-${year}${month}${day}-${random}`;
}

export function generateTimestamp(): string {
  return new Date().toISOString();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return (end - start) / (1000 * 60 * 60); // Hours
}

export function getPriorityBadge(priority: string): { label: string; color: string } {
  const badges: Record<string, { label: string; color: string }> = {
    normal: {
      label: 'ปกติ',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    urgent: {
      label: 'ด่วน',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    },
    'very-urgent': {
      label: 'ด่วนมาก',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
  };
  return badges[priority] || badges.normal;
}
