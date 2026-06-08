import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ConversationPublic {
    id: bigint;
    lastMessageContent?: string;
    lastMessageAt?: Timestamp;
    unreadCount: bigint;
    caseId?: bigint;
    participantIds: Array<UserId>;
}
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface UserPublic {
    id: UserId;
    bio: string;
    timezone: string;
    preferredLanguage: string;
    country: Country;
    lastLoginAt: bigint;
    city: string;
    createdAt: Timestamp;
    role: Role;
    fullName: string;
    isActive: boolean;
    email: string;
    kycStatus: KycStatus;
    avatarRef?: FileRef;
    phoneNumber: string;
}
export interface SupportProofPublic {
    id: bigint;
    files: Array<FileRef>;
    status: ReviewStatus;
    heroId: UserId;
    referenceNumber?: string;
    createdAt: Timestamp;
    adminNote?: string;
    caseId: bigint;
}
export interface FileRef {
    mimeType: string;
    fileName: string;
    storageId: string;
}
export type City = string;
export interface HelpSeekerStatsPublic {
    requestsSubmitted: bigint;
    requestsCompleted: bigint;
    requestsApproved: bigint;
}
export interface CasePublic {
    id: bigint;
    title: string;
    documents: Array<FileRef>;
    country: Country;
    city: City;
    createdAt: Timestamp;
    createdBy: UserId;
    description: string;
    deadline: Timestamp;
    adminNote?: string;
    amountNeeded: USDCents;
    category: Category;
    isPublic: boolean;
    verificationStatus: VerificationStatus;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface CaseSummary {
    id: bigint;
    title: string;
    country: Country;
    city: City;
    createdAt: Timestamp;
    deadline: Timestamp;
    amountNeeded: USDCents;
    category: Category;
    verificationStatus: VerificationStatus;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface PlatformStats {
    totalCases: bigint;
    totalSupportDistributed: bigint;
    totalHeroes: bigint;
    totalCompletedCases: bigint;
}
export type Country = string;
export interface NotificationPublic {
    id: bigint;
    title: string;
    relatedUserId?: UserId;
    notifType: NotificationType;
    userId: UserId;
    createdAt: Timestamp;
    isRead: boolean;
    relatedCaseId?: bigint;
    message: string;
}
export interface PageRequest {
    offset: bigint;
    limit: bigint;
}
export interface MessagePublic {
    id: bigint;
    content: string;
    createdAt: Timestamp;
    isRead: boolean;
    conversationId: bigint;
    receiverId: UserId;
    caseId?: bigint;
    senderId: UserId;
}
export interface PaymentPublic {
    id: bigint;
    status: PaymentStatus;
    createdAt: Timestamp;
    feeType: FeeType;
    amountCents: USDCents;
    caseId?: bigint;
    stripeSessionId: string;
    paidBy: UserId;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface UserSettingsPublic {
    timezone: string;
    theme: string;
    weeklyDigest: boolean;
    emailNotifications: boolean;
    inAppNotifications: boolean;
    language: string;
    largerText: boolean;
    currencyDisplay: string;
    highContrast: boolean;
    reducedAnimations: boolean;
}
export interface LoginDevice {
    id: string;
    os: string;
    deviceName: string;
    lastAccess: bigint;
    ipAddress: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type UserId = Principal;
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type USDCents = bigint;
export interface CreditTransaction {
    id: bigint;
    userId: UserId;
    kind: CreditTxnKind;
    note?: string;
    createdAt: Timestamp;
    amount: bigint;
}
export interface PrivacySettingsPublic {
    profileVisibility: string;
    inAppNotificationsEnabled: boolean;
    countryVisibility: boolean;
    emailNotificationsEnabled: boolean;
    activityVisibility: boolean;
    caseUpdatesEnabled: boolean;
}
export interface HeroStatsPublic {
    peopleHelped: bigint;
    casesSupported: bigint;
    proudHeartCount: bigint;
    casesCompleted: bigint;
    achievements: Array<Achievement>;
}
export interface ProudHeart {
    fromHelpSeeker: UserId;
    toHero: UserId;
    awardedAt: Timestamp;
    caseId: bigint;
}
export enum Achievement {
    TrustedHero = "TrustedHero",
    FirstSupport = "FirstSupport",
    TenPeopleHelped = "TenPeopleHelped",
    EducationHero = "EducationHero",
    MedicalHero = "MedicalHero",
    CommunityHero = "CommunityHero",
    FiftyPeopleHelped = "FiftyPeopleHelped"
}
export enum Category {
    Surgery = "Surgery",
    Orphans = "Orphans",
    Food = "Food",
    DebtRelief = "DebtRelief",
    Books = "Books",
    EmergencyNeeds = "EmergencyNeeds",
    Widows = "Widows",
    Uniform = "Uniform",
    Medicines = "Medicines",
    Employment = "Employment",
    DisabilitySupport = "DisabilitySupport",
    Medical = "Medical",
    Housing = "Housing",
    Transportation = "Transportation",
    UniversityFees = "UniversityFees",
    Other = "Other",
    SchoolFees = "SchoolFees",
    Education = "Education",
    Utilities = "Utilities"
}
export enum CreditTxnKind {
    SpentOnUnlock = "SpentOnUnlock",
    SpentOnCase = "SpentOnCase",
    Purchase = "Purchase",
    AdminGrant = "AdminGrant"
}
export enum FeeType {
    ListingFee = "ListingFee",
    UnlockFee = "UnlockFee"
}
export enum KycStatus {
    UnderReview = "UnderReview",
    Approved = "Approved",
    Rejected = "Rejected",
    Pending = "Pending"
}
export enum NotificationType {
    CaseApproved = "CaseApproved",
    VerificationUpdate = "VerificationUpdate",
    CaseRejected = "CaseRejected",
    SupportSubmitted = "SupportSubmitted",
    UnlockPurchased = "UnlockPurchased",
    NewMessage = "NewMessage",
    ProudHeartReceived = "ProudHeartReceived"
}
export enum PaymentStatus {
    Failed = "Failed",
    Confirmed = "Confirmed",
    Pending = "Pending"
}
export enum ReviewStatus {
    UnderReview = "UnderReview",
    Approved = "Approved",
    Rejected = "Rejected",
    Submitted = "Submitted",
    Completed = "Completed"
}
export enum Role {
    Hero = "Hero",
    HelpSeeker = "HelpSeeker",
    Admin = "Admin"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VerificationStatus {
    DocumentsSubmitted = "DocumentsSubmitted",
    InstitutionVerified = "InstitutionVerified",
    Unverified = "Unverified"
}
export interface backendInterface {
    addCaseDocument(caseId: bigint, fileRef: FileRef): Promise<void>;
    adminGrantCredits(userId: UserId, amount: bigint, note: string | null): Promise<void>;
    adminUpdateKycStatus(userId: UserId, status: KycStatus): Promise<UserPublic>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    awardProudHeart(caseId: bigint, heroId: UserId): Promise<void>;
    banUser(userId: UserId): Promise<void>;
    computeAchievements(heroId: UserId): Promise<Array<Achievement>>;
    confirmCreditPurchase(stripeSessionId: string, creditAmount: bigint): Promise<void>;
    /**
     * / Confirm listing fee after Stripe session completes; records payment + wallet entry
     */
    confirmListingFee(stripeSessionId: string, caseId: bigint | null): Promise<PaymentPublic>;
    /**
     * / Confirm unlock fee after Stripe session completes
     */
    confirmUnlockFee(stripeSessionId: string, caseId: bigint): Promise<PaymentPublic>;
    createCase(title: string, description: string, category: Category, country: Country, city: City, amountNeeded: USDCents, deadline: Timestamp): Promise<bigint>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createCreditPurchaseSession(amount: bigint, successUrl: string, cancelUrl: string): Promise<string>;
    /**
     * / Create a Stripe checkout session for the $1 listing fee
     */
    createListingFeeSession(successUrl: string, cancelUrl: string): Promise<string>;
    /**
     * / Create a Stripe checkout session for the $2 unlock fee
     */
    createUnlockFeeSession(caseId: bigint, successUrl: string, cancelUrl: string): Promise<string>;
    dismissNotification(notifId: bigint): Promise<boolean>;
    getAllCases(): Promise<Array<CasePublic>>;
    getAllProofs(): Promise<Array<SupportProofPublic>>;
    getAllUsers(): Promise<Array<UserPublic>>;
    getCallerUserProfile(): Promise<UserPublic | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCaseDetail(id: bigint): Promise<CasePublic | null>;
    getCaseSummary(id: bigint): Promise<CaseSummary | null>;
    getConversationMessages(conversationId: bigint): Promise<Array<MessagePublic>>;
    getHelpSeekerStats(userId: UserId): Promise<HelpSeekerStatsPublic | null>;
    getHeroStats(userId: UserId): Promise<HeroStatsPublic | null>;
    getLoginDevices(): Promise<Array<LoginDevice>>;
    getMyConversations(): Promise<Array<ConversationPublic>>;
    getMyNotifications(): Promise<Array<NotificationPublic>>;
    /**
     * / Confirm unlock fee after Stripe session completes
     */
    getMyProofs(): Promise<Array<SupportProofPublic>>;
    getMySupportedCases(): Promise<Array<CaseSummary>>;
    getMyTrustScore(): Promise<bigint>;
    getPendingPayments(): Promise<Array<PaymentPublic>>;
    getPlatformStats(): Promise<PlatformStats>;
    getPrivacySettings(): Promise<PrivacySettingsPublic | null>;
    getProofsForCase(caseId: bigint): Promise<Array<SupportProofPublic>>;
    getProudHeartsForHero(heroId: UserId): Promise<Array<ProudHeart>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTransactionHistory(): Promise<Array<CreditTransaction>>;
    getUnreadMessageCount(): Promise<bigint>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUser(id: UserId): Promise<UserPublic | null>;
    getUserSettings(): Promise<UserSettingsPublic | null>;
    getWallet(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    isUnlocked(caseId: bigint): Promise<boolean>;
    listCases(category: Category | null, page: PageRequest): Promise<Array<CaseSummary>>;
    logoutAllOtherDevices(): Promise<bigint>;
    markNotificationAsRead(notifId: bigint): Promise<boolean>;
    registerUser(fullName: string, email: string, role: Role): Promise<UserPublic>;
    requestAccountDeletion(): Promise<string>;
    requestDataDownload(): Promise<string>;
    sendMessage(receiverId: UserId, caseId: bigint | null, content: string): Promise<MessagePublic>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitProof(caseId: bigint, files: Array<FileRef>, referenceNumber: string | null): Promise<bigint>;
    suspendUser(userId: UserId): Promise<void>;
    switchRole(newRole: Role): Promise<UserPublic>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unlockCase(caseId: bigint): Promise<void>;
    updatePrivacySettings(profileVisibility: string, countryVisibility: boolean, activityVisibility: boolean, emailNotificationsEnabled: boolean, inAppNotificationsEnabled: boolean, caseUpdatesEnabled: boolean): Promise<PrivacySettingsPublic>;
    updateProofStatus(proofId: bigint, status: ReviewStatus, adminNote: string | null): Promise<void>;
    updateUserProfile(fullName: string, country: Country, avatarRef: FileRef | null): Promise<UserPublic>;
    updateUserProfileExtended(fullName: string, country: Country, city: string, phoneNumber: string, bio: string, preferredLanguage: string, timezone: string, avatarRef: FileRef | null): Promise<UserPublic>;
    updateUserSettings(language: string, theme: string, currencyDisplay: string, timezone: string, emailNotifications: boolean, inAppNotifications: boolean, weeklyDigest: boolean, highContrast: boolean, largerText: boolean, reducedAnimations: boolean): Promise<UserSettingsPublic>;
    updateVerificationStatus(caseId: bigint, status: VerificationStatus): Promise<void>;
}
