export async function upsertUser(user: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: string;
  lastSignedIn?: Date;
}) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // Check if user exists by email
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

    // Check if user exists by openId
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

    // Create new user
    const values: any = {
      openId: user.openId,
    };

    if (user.name !== undefined) values.name = user.name ?? null;
    if (user.email !== undefined) values.email = user.email ?? null;
    if (user.loginMethod !== undefined) values.loginMethod = user.loginMethod ?? null;
    if (user.role !== undefined) values.role = user.role;
    if (user.lastSignedIn !== undefined) values.lastSignedIn = user.lastSignedIn;

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    await db.insert(users).values(values);
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
