import { and, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { chatMessages, investigations } from './schema.ts';

export interface NewInvestigationRecord {
  investigationCode: string;
  userId: number;
  type: string;
  submittedContent: string;
  threatCategory: string;
  riskScore: number;
  threatClassification: string;
  scamProbability: number;
  confidenceLevel: string;
  intelligenceStatus: string;
  reportJson: Record<string, unknown>;
}

export async function createInvestigation(record: NewInvestigationRecord) {
  try {
    const result = await db.insert(investigations).values(record).returning();
    return result[0];
  } catch (error) {
    console.error('Database error in createInvestigation:', error);
    throw new Error('Failed to save investigation report.', { cause: error });
  }
}

export async function listUserInvestigations(userId: number, limit = 50) {
  try {
    return await db
      .select()
      .from(investigations)
      .where(eq(investigations.userId, userId))
      .orderBy(desc(investigations.createdAt))
      .limit(limit);
  } catch (error) {
    console.error('Database error in listUserInvestigations:', error);
    throw new Error('Failed to retrieve investigation history.', { cause: error });
  }
}

export async function getUserInvestigationByCode(userId: number, investigationCode: string) {
  try {
    const rows = await db
      .select()
      .from(investigations)
      .where(
        and(
          eq(investigations.userId, userId),
          eq(investigations.investigationCode, investigationCode)
        )
      )
      .limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Database error in getUserInvestigationByCode:', error);
    throw new Error('Failed to retrieve investigation details.', { cause: error });
  }
}

export async function deleteUserInvestigation(userId: number, id: number) {
  try {
    const deleted = await db
      .delete(investigations)
      .where(and(eq(investigations.id, id), eq(investigations.userId, userId)))
      .returning();
    return deleted[0] || null;
  } catch (error) {
    console.error('Database error in deleteUserInvestigation:', error);
    throw new Error('Failed to delete investigation.', { cause: error });
  }
}

export async function clearUserInvestigations(userId: number) {
  try {
    await db.delete(investigations).where(eq(investigations.userId, userId));
    return true;
  } catch (error) {
    console.error('Database error in clearUserInvestigations:', error);
    throw new Error('Failed to clear investigation history.', { cause: error });
  }
}

export async function listUserChatMessages(userId: number, limit = 40) {
  try {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt)
      .limit(limit);
  } catch (error) {
    console.error('Database error in listUserChatMessages:', error);
    throw new Error('Failed to load assistant conversation.', { cause: error });
  }
}

export async function addChatMessage(userId: number, role: 'user' | 'assistant', content: string) {
  try {
    const result = await db
      .insert(chatMessages)
      .values({ userId, role, content })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database error in addChatMessage:', error);
    throw new Error('Failed to save assistant message.', { cause: error });
  }
}

export async function clearUserChatMessages(userId: number) {
  try {
    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
    return true;
  } catch (error) {
    console.error('Database error in clearUserChatMessages:', error);
    throw new Error('Failed to clear assistant conversation.', { cause: error });
  }
}
