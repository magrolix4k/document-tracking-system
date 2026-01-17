import React from 'react';

export default function Spinner() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-blue-500 dark:border-blue-400"></div>
    </div>
  );
}
