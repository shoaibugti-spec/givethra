import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  /** Google subject is stored as `google:<sub>` and remains stable if the user changes email. */
  openId: varchar("openId", { length: 128 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const profiles = mysqlTable(
  "profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    displayName: varchar("displayName", { length: 160 }),
    phone: varchar("phone", { length: 40 }),
    city: varchar("city", { length: 120 }),
    country: varchar("country", { length: 120 }),
    bio: text("bio"),
    avatarKey: varchar("avatarKey", { length: 500 }),
    avatarUrl: varchar("avatarUrl", { length: 1000 }),
    coverKey: varchar("coverKey", { length: 500 }),
    coverUrl: varchar("coverUrl", { length: 1000 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("profiles_user_unique").on(table.userId)],
);

export const kycSubmissions = mysqlTable(
  "kyc_submissions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    fullName: varchar("fullName", { length: 180 }).notNull(),
    nationalId: varchar("nationalId", { length: 80 }).notNull(),
    frontKey: varchar("frontKey", { length: 500 }).notNull(),
    frontUrl: varchar("frontUrl", { length: 1000 }).notNull(),
    backKey: varchar("backKey", { length: 500 }).notNull(),
    backUrl: varchar("backUrl", { length: 1000 }).notNull(),
    selfieKey: varchar("selfieKey", { length: 500 }).notNull(),
    selfieUrl: varchar("selfieUrl", { length: 1000 }).notNull(),
    videoKey: varchar("videoKey", { length: 500 }).notNull(),
    videoUrl: varchar("videoUrl", { length: 1000 }).notNull(),
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
    adminNote: text("adminNote"),
    reviewedByUserId: int("reviewedByUserId"),
    submittedAt: timestamp("submittedAt").defaultNow().notNull(),
    reviewedAt: timestamp("reviewedAt"),
  },
  table => [index("kyc_user_submitted_index").on(table.userId, table.submittedAt), index("kyc_status_index").on(table.status)],
);

export const cases = mysqlTable(
  "cases",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    description: text("description").notNull(),
    selfieKey: varchar("selfieKey", { length: 500 }),
    selfieUrl: varchar("selfieUrl", { length: 1000 }),
    videoKey: varchar("videoKey", { length: 500 }),
    videoUrl: varchar("videoUrl", { length: 1000 }),
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
    adminNote: text("adminNote"),
    reviewedByUserId: int("reviewedByUserId"),
    submittedAt: timestamp("submittedAt").defaultNow().notNull(),
    reviewedAt: timestamp("reviewedAt"),
  },
  table => [index("cases_status_category_index").on(table.status, table.category), index("cases_user_submitted_index").on(table.userId, table.submittedAt)],
);

export const caseFiles = mysqlTable(
  "case_files",
  {
    id: int("id").autoincrement().primaryKey(),
    caseId: int("caseId").notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    mimeType: varchar("mimeType", { length: 120 }).notNull(),
    storageKey: varchar("storageKey", { length: 500 }).notNull(),
    storageUrl: varchar("storageUrl", { length: 1000 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("case_files_case_index").on(table.caseId)],
);

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", ["kyc", "case", "message", "system"]).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    content: text("content").notNull(),
    isRead: int("isRead").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("notifications_user_created_index").on(table.userId, table.createdAt)],
);

export const supportMessages = mysqlTable(
  "support_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    senderRole: mysqlEnum("senderRole", ["user", "admin"]).notNull(),
    body: text("body").notNull(),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("support_messages_user_created_index").on(table.userId, table.createdAt)],
);

export const pushSubscriptions = mysqlTable(
  "push_subscriptions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    endpoint: text("endpoint").notNull(),
    p256dh: varchar("p256dh", { length: 255 }).notNull(),
    auth: varchar("auth", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("push_subscriptions_user_index").on(table.userId)],
);


export const publicPosts = mysqlTable(
  "public_posts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"), // optional if visitor is not logged in
    authorName: varchar("authorName", { length: 160 }).notNull(),
    authorEmail: varchar("authorEmail", { length: 320 }),
    content: text("content").notNull(),
    status: mysqlEnum("status", ["pending", "read", "resolved"]).default("pending").notNull(),
    adminReply: text("adminReply"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("public_posts_status_index").on(table.status), index("public_posts_created_index").on(table.createdAt)]
);

export type PublicPost = typeof publicPosts.$inferSelect;
export type InsertPublicPost = typeof publicPosts.$inferInsert;
