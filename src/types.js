/**
 * Application Constants and Type Definitions (JSDoc)
 */

export const ROLES = {
  ADMIN: 'admin',
  DESIGNER: 'designer',
  BRAND_REP: 'brand_representative',
  PRODUCTION: 'production',
};

export const STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const FAIRS_DB = [
  { id: 1, name: 'CES 2024', location: 'Las Vegas', date: 'Jan 9-12', color: 'bg-blue-500' },
  { id: 2, name: 'MWC Barcelona', location: 'Barcelona', date: 'Feb 26-29', color: 'bg-purple-500' },
  { id: 3, name: 'Hannover Messe', location: 'Hannover', date: 'Apr 22-26', color: 'bg-orange-500' },
  { id: 4, name: 'IFA Berlin', location: 'Berlin', date: 'Sep 6-10', color: 'bg-red-500' },
  { id: 5, name: 'Gitex Global', location: 'Dubai', date: 'Oct 14-18', color: 'bg-emerald-500' }
];

/**
 * @typedef {Object} UserProfile
 * @property {string} uid
 * @property {string} email
 * @property {string} displayName
 * @property {string} role
 * @property {string} status
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} client
 * @property {string} status
 * @property {string} deadline
 * @property {string} type
 * @property {string} priority
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string|number} id
 * @property {string} text
 * @property {string} sender - 'user' | 'ai' | 'other'
 * @property {string} timestamp
 */