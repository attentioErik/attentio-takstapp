import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const reportTypeEnum = pgEnum('report_type', ['tilstandsrapport', 'verditakst', 'forhandstakst']);
export const reportStatusEnum = pgEnum('report_status', ['draft', 'in_progress', 'completed', 'archived']);
export const conditionGradeEnum = pgEnum('condition_grade', ['TG0', 'TG1', 'TG2', 'TG3', 'TGIU']);
export const propertyTypeEnum = pgEnum('property_type', ['enebolig', 'rekkehus', 'leilighet', 'fritidsbolig', 'tomannsbolig']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  company: text('company'),
  phone: text('phone'),
  certifications: text('certifications'),
  signatureUrl: text('signature_url'),
  avatarUrl: text('avatar_url'),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  reportNumber: text('report_number').notNull(),
  type: reportTypeEnum('type').notNull(),
  status: reportStatusEnum('status').default('draft'),
  propertyAddress: text('property_address').notNull(),
  postalCode: text('postal_code'),
  city: text('city'),
  municipality: text('municipality'),
  gnr: text('gnr'),
  bnr: text('bnr'),
  snr: text('snr'),
  fnr: text('fnr'),
  propertyType: propertyTypeEnum('property_type'),
  constructionYear: integer('construction_year'),
  bra: integer('bra'),
  prom: integer('prom'),
  numberOfFloors: integer('number_of_floors'),
  client: text('client'),
  clientEmail: text('client_email'),
  clientPhone: text('client_phone'),
  inspectionDate: timestamp('inspection_date'),
  reportDate: timestamp('report_date'),
  marketValue: integer('market_value'),
  loanValue: integer('loan_value'),
  technicalValue: integer('technical_value'),
  plotValue: integer('plot_value'),
  rawNotes: text('raw_notes'),
  aiProcessedAt: timestamp('ai_processed_at'),
  summary: text('summary'),
  totalRepairCost: integer('total_repair_cost'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const buildingSections = pgTable('building_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id).notNull(),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  name: text('name').notNull(),
  conditionGrade: conditionGradeEnum('condition_grade'),
  description: text('description'),
  observations: text('observations'),
  cause: text('cause'),
  consequence: text('consequence'),
  repairCost: integer('repair_cost'),
  repairCostMin: integer('repair_cost_min'),
  repairCostMax: integer('repair_cost_max'),
  moistureMeasurements: jsonb('moisture_measurements'),
  images: jsonb('images'),
  sortOrder: integer('sort_order').default(0),
  isRequired: boolean('is_required').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  buildingSectionId: uuid('building_section_id').references(() => buildingSections.id),
  reportId: uuid('report_id').references(() => reports.id),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  caption: text('caption'),
  takenAt: timestamp('taken_at'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id).notNull(),
  type: text('type'),
  name: text('name').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sectionTemplates = pgTable('section_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: text('category').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  requiredForTypes: text('required_for_types').array(),
  sortOrder: integer('sort_order').default(0),
  checklistItems: jsonb('checklist_items'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type BuildingSection = typeof buildingSections.$inferSelect;
export type NewBuildingSection = typeof buildingSections.$inferInsert;
export type Image = typeof images.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type SectionTemplate = typeof sectionTemplates.$inferSelect;
