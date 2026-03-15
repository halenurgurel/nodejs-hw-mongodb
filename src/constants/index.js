import path from 'node:path';

//define what values are allowed
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

//15 minutes
//15 minutes * 60 seconds * 1000 miliseconds
export const FIFTEEN_MINUTES = 15 * 60 * 1000;

//30 days
//30 days * 24 hours * 60 minutes * 60 seconds * 1000 miliseconds
export const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

//templates directory -> current working directoy
export const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');

//5 minutes token
export const FIVE_MINUTES = 5 * 60; //jwt uses seconds not miliseconds
