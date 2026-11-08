import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const admins = sqliteTable('admins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name'),
  email: text('email'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  category: text('category'),
  status: text('status', { enum: ['published', 'draft'] }).notNull().default('published'),
  featuredImage: text('featured_image'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const courses = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull().unique(),
  description: text('description'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const certificates = sqliteTable('certificates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uniqueId: text('unique_id').notNull().unique(),
  recipientName: text('recipient_name').notNull(),
  recipientEmail: text('recipient_email').notNull(),
  certificateTitle: text('certificate_title').notNull(),
  courseId: integer('course_id').references(() => courses.id),
  courseName: text('course_name'),
  issueDate: text('issue_date').notNull(),
  expiryDate: text('expiry_date'),
  description: text('description'),
  issuedBy: text('issued_by').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const consultations = sqliteTable('consultations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  isRead: integer('is_read').notNull().default(0),
});

export const contacts = sqliteTable('contacts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  services: text('services'),
  message: text('message').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  isRead: integer('is_read').notNull().default(0),
});

export const newsletterSubscribers = sqliteTable('newsletter_subscribers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const mailSettings = sqliteTable('mail_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  smtpHost: text('smtp_host'),
  smtpPort: integer('smtp_port').default(587),
  smtpUsername: text('smtp_username'),
  smtpPassword: text('smtp_password'),
  smtpEncryption: text('smtp_encryption').default('tls'),
  fromEmail: text('from_email'),
  fromName: text('from_name'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const seoPages = sqliteTable('seo_pages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull().unique(), // e.g. '/', '/about', '/services', '/blog', '/contact', '/v/verify'
  pageName: text('page_name').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  keywords: text('keywords'),
  ogImage: text('og_image'),
  canonicalUrl: text('canonical_url'),
  noIndex: integer('no_index').default(0), // 0 = index, 1 = noindex
  noFollow: integer('no_follow').default(0), // 0 = follow, 1 = nofollow
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const seoGlobal = sqliteTable('seo_global', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  siteName: text('site_name').notNull().default('Laimsoft'),
  titleTemplate: text('title_template').default('%s — Laimsoft'),
  defaultDescription: text('default_description'),
  defaultOgImage: text('default_og_image'),
  googleVerification: text('google_verification'),
  bingVerification: text('bing_verification'),
  gaMeasurementId: text('ga_measurement_id'),
  organizationSchema: text('organization_schema'), // JSON string for Schema.org
  robotsTxtCustom: text('robots_txt_custom'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const posCredentials = sqliteTable('pos_credentials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  clientName: text('client_name'),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const pageContents = sqliteTable('page_contents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull().unique(), // e.g. '/', '/about', '/services', '/contact'
  sections: text('sections').notNull(), // JSON string storing structured page sections
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});



