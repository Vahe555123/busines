const API_BASE =
  window.location.hostname === "https"
    ? "http://localhost:3001"
    : "https://server-auto-busines.duckdns.org";
export type UserRole = "client" | "manager" | "admin";
export type UserStatus = "active" | "blocked";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status?: UserStatus;
  isVerified: boolean;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  createdAt: string;
  purchaseCount?: number;
};

export type PurchaseItem = {
  _id: string;
  userId: string;
  pricingId: string;
  title: string;
  price: number;
  status: string;
  createdAt: string;
};

export type ContactRequestItem = {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  userId?: string;
  caseId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CaseItem = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  content: string;
  problem?: string;
  solution?: string;
  results?: string;
  techStack: string[];
  imageUrl?: string;
  gallery: string[];
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LocalizedString = { en?: string; ru?: string; hy?: string };
export type LocalizedArray = { en?: string[]; ru?: string[]; hy?: string[] };

export type PricingItem = {
  _id: string;
  title: string;
  description: string;
  price: number;
  order: number;
  features?: string[];
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Raw pricing document for admin (title/description/features per language) */
export type PricingItemRaw = Omit<PricingItem, "title" | "description" | "features"> & {
  title: LocalizedString;
  description: LocalizedString;
  features: LocalizedArray;
};

export type PricingCreateBody = {
  title: LocalizedString;
  description?: LocalizedString;
  features?: LocalizedArray;
  price: number;
  order?: number;
  isPopular?: boolean;
};

function getToken(): string | null {
  return localStorage.getItem("admin_token");
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: boolean } = {}
): Promise<T> {
  const { token = false, ...fetchOptions } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) ?? {}),
  };
  const t = getToken();
  if (token && t) (headers as Record<string, string>)["Authorization"] = `Bearer ${t}`;

  const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `Ошибка ${res.status}`);
  return data as T;
}

export const api = {
  login: (body: { email: string; password: string }) =>
    request<{ message: string; token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () => request<{ user: AuthUser }>("/api/auth/me", { method: "GET", token: true }),

  pricing: {
    list: (lang?: string) =>
      request<PricingItem[]>(
        lang ? `/api/pricing?lang=${encodeURIComponent(lang)}` : "/api/pricing",
        { method: "GET" }
      ),
    get: (id: string, opts?: { raw?: boolean }) =>
      request<PricingItem | PricingItemRaw>(
        opts?.raw ? `/api/pricing/${id}?raw=1` : `/api/pricing/${id}`,
        { method: "GET" }
      ),
    create: (body: PricingCreateBody) =>
      request<PricingItemRaw>("/api/pricing", {
        method: "POST",
        body: JSON.stringify(body),
        token: true,
      }),
    update: (id: string, body: Partial<PricingCreateBody>) =>
      request<PricingItemRaw>(`/api/pricing/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
        token: true,
      }),
    delete: (id: string) =>
      request<void>(`/api/pricing/${id}`, { method: "DELETE", token: true }),
  },

  users: {
    list: () =>
      request<AdminUser[]>("/api/users", { method: "GET", token: true }),
    get: (id: string) =>
      request<{ user: AdminUser; purchases: PurchaseItem[] }>(`/api/users/${id}`, {
        method: "GET",
        token: true,
      }),
    create: (body: { email: string; password: string; name?: string; role?: UserRole }) =>
      request<AdminUser>("/api/users", {
        method: "POST",
        body: JSON.stringify(body),
        token: true,
      }),
    update: (id: string, body: { name?: string; role?: UserRole; status?: UserStatus }) =>
      request<AdminUser>(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
        token: true,
      }),
    delete: (id: string) =>
      request<void>(`/api/users/${id}`, { method: "DELETE", token: true }),
  },

  purchases: {
    byUser: (userId: string) =>
      request<PurchaseItem[]>(`/api/purchases/user/${userId}`, {
        method: "GET",
        token: true,
      }),
    updateStatus: (id: string, status: string) =>
      request<PurchaseItem>(`/api/purchases/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        token: true,
      }),
  },

  contactRequests: {
    list: () =>
      request<ContactRequestItem[]>(`/api/contact-requests`, {
        method: "GET",
        token: true,
      }),
  },

  cases: {
    list: () =>
      request<CaseItem[]>(`/api/cases/admin/list`, { method: "GET", token: true }),
    get: (id: string) =>
      request<CaseItem>(`/api/cases/admin/${id}`, { method: "GET", token: true }),
    create: (body: Partial<CaseItem>) =>
      request<CaseItem>("/api/cases", {
        method: "POST",
        body: JSON.stringify(body),
        token: true,
      }),
    update: (id: string, body: Partial<CaseItem>) =>
      request<CaseItem>(`/api/cases/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
        token: true,
      }),
    delete: (id: string) =>
      request<void>(`/api/cases/${id}`, { method: "DELETE", token: true }),
  },

  chat: {
    listConversations: () =>
      request<ChatConversationPreview[]>(`/api/chat/admin/conversations`, {
        method: "GET",
        token: true,
      }),
    getConversation: (id: string) =>
      request<{
        conversation: ChatConversation;
        messages: ChatMessage[];
      }>(`/api/chat/admin/conversations/${id}`, {
        method: "GET",
        token: true,
      }),
  },
};

export type ChatConversationPreview = {
  _id: string;
  sessionId?: string;
  user: { id: string; email: string; name?: string } | null;
  lastMessage: { content?: string; role: string; createdAt: string } | null;
  updatedAt: string;
};

export type ChatConversation = {
  _id: string;
  sessionId?: string;
  user: { id: string; email: string; name?: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  _id: string;
  role: "user" | "assistant";
  content: string;
  imageUrls: string[];
  createdAt: string;
};
