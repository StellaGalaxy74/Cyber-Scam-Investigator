import { relations } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  countryCode: text('country_code').default('+91').notNull(),
  preferredRegion: text('preferred_region').default('India').notNull(),
  saveHistory: boolean('save_history').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const investigations = pgTable('investigations', {
  id: serial('id').primaryKey(),
  investigationCode: text('investigation_code').notNull().unique(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type').notNull(), // 'message' | 'url' | 'email_phone' | 'screenshot'
  submittedContent: text('submitted_content').notNull(),
  threatCategory: text('threat_category').notNull(),
  riskScore: integer('risk_score').notNull(),
  threatClassification: text('threat_classification').notNull(), // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  scamProbability: integer('scam_probability').notNull(),
  confidenceLevel: text('confidence_level').notNull(), // 'LOW' | 'MEDIUM' | 'HIGH'
  intelligenceStatus: text('intelligence_status').notNull(),
  reportJson: jsonb('report_json').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  investigations: many(investigations),
  chatMessages: many(chatMessages),
}));

export const investigationsRelations = relations(investigations, ({ one }) => ({
  user: one(users, {
    fields: [investigations.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));
