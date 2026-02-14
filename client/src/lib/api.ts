const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type UserRole = "client" | "manager" | "admin";
export type UserStatus = "active" | "blocked";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  createdAt: string;
};

export type PricingItem = {
  _id: string;
  title: string;
  description: string;
  price: number;
  order: number;
  features?: string[];
  isPopular?: boolean;
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

export type ChatMessage = {
  _id: string;
  role: "user" | "assistant";
  content: string;
  imageUrls: string[];
  createdAt: string;
};

export type CaseListItem = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  imageUrl?: string;
  order: number;
  createdAt: string;
};

export type CaseDetail = CaseListItem & {
  content: string;
  problem?: string;
  solution?: string;
  results?: string;
  techStack: string[];
  gallery: string[];
};

export type RegisterResponse = { message: string; user: AuthUser };
export type LoginResponse = { message: string; token: string; user: AuthUser };
export type VerifyEmailResponse = { message: string; user: AuthUser };
export type MeResponse = { user: AuthUser };

function getToken(): string | null {
  return localStorage.getItem("auth_token");
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

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error ?? `Ошибка ${res.status}`);
  }
  return data as T;
}

export const api = {
  register: (body: { email: string; password: string; name?: string }) =>
    request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  verifyEmail: (body: { email: string; code: string }) =>
    request<VerifyEmailResponse>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  resendCode: (body: { email: string }) =>
    request<{ message: string }>("/api/auth/resend-code", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () =>
    request<MeResponse>("/api/auth/me", { method: "GET", token: true }),

  pricing: {
    list: (lang?: string) =>
      request<PricingItem[]>(
        lang ? `/api/pricing?lang=${encodeURIComponent(lang)}` : "/api/pricing",
        { method: "GET" }
      ),
  },

  purchases: {
    create: (pricingId: string) =>
      request<PurchaseItem>("/api/purchases", {
        method: "POST",
        body: JSON.stringify({ pricingId }),
        token: true,
      }),
    createPayment: (pricingId: string) =>
      request<{ paymentId: string; confirmationUrl: string | null }>("/api/purchases/create-payment", {
        method: "POST",
        body: JSON.stringify({ pricingId }),
        token: true,
      }),
    checkPayment: (paymentId: string) =>
      request<{ paymentId: string; status: string; amount: number; title: string }>(
        `/api/purchases/check-payment/${encodeURIComponent(paymentId)}`,
        { method: "GET", token: true }
      ),
    getMy: () =>
      request<PurchaseItem[]>("/api/purchases/me", { method: "GET", token: true }),
  },

  contactRequests: {
    create: (body: {
      name: string;
      email: string;
      company?: string;
      phone?: string;
      message: string;
      caseId?: string;
    }) =>
      request<ContactRequestItem>("/api/contact-requests", {
        method: "POST",
        body: JSON.stringify(body),
        token: true, // optional: send if user logged in
      }),
    getMy: () =>
      request<ContactRequestItem[]>("/api/contact-requests/me", {
        method: "GET",
        token: true,
      }),
  },

  cases: {
    list: () => request<CaseListItem[]>("/api/cases", { method: "GET" }),
    get: (id: string) =>
      request<CaseDetail>(`/api/cases/${encodeURIComponent(id)}`, { method: "GET" }),
  },

  chat: {
    getHistory: (sessionId?: string) =>
      request<{ conversationId: string; messages: ChatMessage[] }>(
        sessionId
          ? `/api/chat/history?sessionId=${encodeURIComponent(sessionId)}`
          : "/api/chat/history",
        { method: "GET", token: true }
      ),
    send: (body: {
      conversationId?: string;
      content?: string;
      imageUrls?: string[];
      sessionId?: string;
      caseId?: string;
    }) =>
      request<{
        conversationId: string;
        userMessage: ChatMessage;
        assistantMessage: ChatMessage;
      }>("/api/chat/send", {
        method: "POST",
        body: JSON.stringify(body),
        token: true,
      }),
    uploadImage: (file: File) => {
      const form = new FormData();
      form.append("image", file);
      const token = getToken();
      const headers: HeadersInit = {};
      if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      return fetch(`${API_BASE}/api/chat/upload`, {
        method: "POST",
        body: form,
        headers,
      }).then((res) => {
        if (!res.ok)
          return res.json().then((d) => Promise.reject(new Error(d?.error ?? "Upload failed")));
        return res.json() as Promise<{ url: string }>;
      });
    },
  },
};
