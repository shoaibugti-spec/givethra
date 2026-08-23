import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // ✅ اگر صارف email سے موجود ہے تو اپڈیٹ کریں
    if (user.email) {
      const existingByEmail = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
      if (existingByEmail.length > 0) {
        const existing = existingByEmail[0];
        const updateSet: Record<string, unknown> = {
          openId: user.openId,
          lastSignedIn: user.lastSignedIn || new Date(),
        };
        if (user.name) updateSet.name = user.name;
        if (user.loginMethod) updateSet.loginMethod = user.loginMethod;

        await db.update(users).set(updateSet).where(eq(users.id, existing.id));
        return;
      }
    }

    // ✅ اگر صارف openId سے موجود ہے تو اپڈیٹ کریں
    const existingByOpenId = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    if (existingByOpenId.length > 0) {
      const existing = existingByOpenId[0];
      const updateSet: Record<string, unknown> = {
        lastSignedIn: user.lastSignedIn || new Date(),
      };
      if (user.name) updateSet.name = user.name;
      if (user.email) updateSet.email = user.email;
      if (user.loginMethod) updateSet.loginMethod = user.loginMethod;
      if (user.role) updateSet.role = user.role;

      await db.update(users).set(updateSet).where(eq(users.id, existing.id));
      return;
    }

    // ✅ اگر صارف موجود نہیں تو نیا بنائیں (یہ وہی ہے جو آپ چاہتے ہیں)
    const values: InsertUser = {
      openId: user.openId,
    };

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    await db.insert(users).values(values);
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
