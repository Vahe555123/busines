import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  type PricingItem,
  type PricingItemRaw,
  type PricingCreateBody,
  type AdminUser,
  type PurchaseItem,
  type ContactRequestItem,
  type CaseItem,
  type ChatConversationPreview,
  type ChatConversation,
  type ChatMessage,
} from "@/lib/api";

type Section = "pricing" | "users" | "chats" | "contacts" | "cases";

function CaseForm({
  item,
  editId,
  loading,
  saving,
  onSave,
  onClose,
}: {
  item: CaseItem | null;
  editId: string | null;
  loading: boolean;
  saving: boolean;
  onSave: (body: Partial<CaseItem>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: item?.title ?? "",
    slug: item?.slug ?? "",
    category: item?.category ?? "",
    shortDescription: item?.shortDescription ?? "",
    content: item?.content ?? "",
    problem: item?.problem ?? "",
    solution: item?.solution ?? "",
    results: item?.results ?? "",
    techStack: (item?.techStack ?? []).join("\n"),
    imageUrl: item?.imageUrl ?? "",
    gallery: (item?.gallery ?? []).join("\n"),
    order: item?.order ?? 0,
    isPublished: item?.isPublished ?? true,
  });

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title,
        slug: item.slug,
        category: item.category,
        shortDescription: item.shortDescription,
        content: item.content,
        problem: item.problem ?? "",
        solution: item.solution ?? "",
        results: item.results ?? "",
        techStack: (item.techStack ?? []).join("\n"),
        imageUrl: item.imageUrl ?? "",
        gallery: (item.gallery ?? []).join("\n"),
        order: item.order ?? 0,
        isPublished: item.isPublished ?? true,
      });
    } else {
      setForm({
        title: "",
        slug: "",
        category: "",
        shortDescription: "",
        content: "",
        problem: "",
        solution: "",
        results: "",
        techStack: "",
        imageUrl: "",
        gallery: "",
        order: 0,
        isPublished: true,
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.category.trim() || !form.shortDescription.trim() || !form.content.trim()) {
      alert("Заполните: название, slug, категорию, краткое описание, контент");
      return;
    }
    const slug = form.slug.trim().toLowerCase().replace(/\s+/g, "-");
    onSave({
      title: form.title.trim(),
      slug,
      category: form.category.trim(),
      shortDescription: form.shortDescription.trim(),
      content: form.content.trim(),
      problem: form.problem.trim() || undefined,
      solution: form.solution.trim() || undefined,
      results: form.results.trim() || undefined,
      techStack: form.techStack.split(/\n/).map((s) => s.trim()).filter(Boolean),
      imageUrl: form.imageUrl.trim() || undefined,
      gallery: form.gallery.split(/\n/).map((s) => s.trim()).filter(Boolean),
      order: Number(form.order) || 0,
      isPublished: form.isPublished,
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center text-slate-400">
          Загрузка…
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto py-8" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h3 className="text-lg font-semibold text-white">{editId ? "Редактировать кейс" : "Новый кейс"}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Название *</label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Slug * (латиница, дефис)</label>
              <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Категория *</label>
              <input type="text" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Порядок</label>
              <input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) || 0 }))} className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Краткое описание * (карточка)</label>
            <textarea value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white min-h-[60px]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Контент * (HTML допускается)</label>
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white min-h-[120px] font-mono text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Задача (problem)</label>
            <textarea value={form.problem} onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))} className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white min-h-[60px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Решение (solution)</label>
            <textarea value={form.solution} onChange={(e) => setForm((f) => ({ ...f, solution: e.target.value }))} className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white min-h-[60px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Результаты (results)</label>
            <textarea value={form.results} onChange={(e) => setForm((f) => ({ ...f, results: e.target.value }))} className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white min-h-[60px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Технологии (каждая с новой строки)</label>
            <textarea value={form.techStack} onChange={(e) => setForm((f) => ({ ...f, techStack: e.target.value }))} className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white min-h-[60px]" placeholder="Python&#10;TensorFlow" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">URL главного изображения</label>
            <input type="text" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Галерея (URL с новой строки)</label>
            <textarea value={form.gallery} onChange={(e) => setForm((f) => ({ ...f, gallery: e.target.value }))} className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white min-h-[60px]" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="case-published" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} className="rounded border-slate-600 bg-slate-900 text-indigo-600" />
            <label htmlFor="case-published" className="text-sm text-slate-400">Опубликован</label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-slate-400 hover:bg-slate-700">Отмена</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 disabled:opacity-50">{saving ? "Сохранение..." : "Сохранить"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<Section>("pricing");

  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"closed" | "add" | "edit">("closed");
  const [editing, setEditing] = useState<PricingItem | null>(null);
  const [editingRaw, setEditingRaw] = useState<PricingItemRaw | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userModal, setUserModal] = useState<"closed" | "add" | "edit">("closed");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userSaving, setUserSaving] = useState(false);
  const [userDeleteId, setUserDeleteId] = useState<string | null>(null);
  const [historyUser, setHistoryUser] = useState<AdminUser | null>(null);
  const [historyPurchases, setHistoryPurchases] = useState<PurchaseItem[]>([]);

  const [conversations, setConversations] = useState<ChatConversationPreview[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState<{
    conversation: ChatConversation;
    messages: ChatMessage[];
  } | null>(null);

  const [contactRequests, setContactRequests] = useState<ContactRequestItem[]>([]);
  const [contactRequestsLoading, setContactRequestsLoading] = useState(false);

  const [caseItems, setCaseItems] = useState<CaseItem[]>([]);
  const [caseLoading, setCaseLoading] = useState(false);
  const [caseModal, setCaseModal] = useState<"closed" | "add" | "edit">("closed");
  const [caseEditing, setCaseEditing] = useState<CaseItem | null>(null);
  const [caseEditingFull, setCaseEditingFull] = useState<CaseItem | null>(null);
  const [caseSaving, setCaseSaving] = useState(false);
  const [caseDeleteId, setCaseDeleteId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.pricing
      .list()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  };

  const loadUsers = () => {
    setUsersLoading(true);
    api.users
      .list()
      .then(setUsers)
      .catch((e) => alert(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setUsersLoading(false));
  };

  useEffect(() => {
    if (section === "pricing") load();
  }, [section]);
  useEffect(() => {
    if (section === "users") loadUsers();
  }, [section]);
  useEffect(() => {
    if (section === "chats") {
      setChatsLoading(true);
      api.chat
        .listConversations()
        .then(setConversations)
        .catch((e) => alert(e instanceof Error ? e.message : "Ошибка загрузки"))
        .finally(() => setChatsLoading(false));
    }
  }, [section]);
  useEffect(() => {
    if (section === "contacts") {
      setContactRequestsLoading(true);
      api.contactRequests
        .list()
        .then(setContactRequests)
        .catch((e) => alert(e instanceof Error ? e.message : "Ошибка загрузки"))
        .finally(() => setContactRequestsLoading(false));
    }
  }, [section]);
  useEffect(() => {
    if (section === "cases") {
      setCaseLoading(true);
      api.cases
        .list()
        .then(setCaseItems)
        .catch((e) => alert(e instanceof Error ? e.message : "Ошибка загрузки"))
        .finally(() => setCaseLoading(false));
    }
  }, [section]);
  useEffect(() => {
    if (caseModal === "edit" && caseEditing) {
      api.cases
        .get(caseEditing._id)
        .then(setCaseEditingFull)
        .catch(() => alert("Не удалось загрузить кейс"));
    } else {
      setCaseEditingFull(null);
    }
  }, [caseModal, caseEditing?._id]);

  const openChat = (id: string) => {
    api.chat.getConversation(id).then(setSelectedChat);
  };
  const closeChat = () => setSelectedChat(null);

  const openAdd = () => {
    setEditing(null);
    setEditingRaw(null);
    setModal("add");
  };
  const openEdit = (item: PricingItem) => {
    setEditing(item);
    setEditingRaw(null);
    setModal("edit");
  };
  useEffect(() => {
    if (modal === "edit" && editing) {
      api.pricing
        .get(editing._id, { raw: true })
        .then((data) => setEditingRaw(data as PricingItemRaw))
        .catch(() => alert("Не удалось загрузить тариф"));
    } else {
      setEditingRaw(null);
    }
  }, [modal, editing?._id]);
  const closeModal = () => {
    setModal("closed");
    setEditing(null);
    setEditingRaw(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Удалить этот тариф?")) return;
    setDeleteId(id);
    api.pricing
      .delete(id)
      .then(() => {
        setItems((prev) => prev.filter((i) => i._id !== id));
        setDeleteId(null);
      })
      .catch((e) => {
        alert(e instanceof Error ? e.message : "Ошибка удаления");
        setDeleteId(null);
      });
  };

  const openUserAdd = () => {
    setEditingUser(null);
    setUserModal("add");
  };
  const openUserEdit = (u: AdminUser) => {
    setEditingUser(u);
    setUserModal("edit");
  };
  const closeUserModal = () => {
    setUserModal("closed");
    setEditingUser(null);
  };
  const openHistory = (u: AdminUser) => {
    setHistoryUser(u);
    api.purchases.byUser(u.id).then(setHistoryPurchases);
  };
  const closeHistory = () => {
    setHistoryUser(null);
    setHistoryPurchases([]);
  };

  const handleUserDelete = (id: string) => {
    if (!confirm("Удалить этого пользователя? Все его покупки также будут удалены.")) return;
    setUserDeleteId(id);
    api.users
      .delete(id)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setUserDeleteId(null);
      })
      .catch((e) => {
        alert(e instanceof Error ? e.message : "Ошибка удаления");
        setUserDeleteId(null);
      });
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-semibold text-white">Админ-панель</h2>
          <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
          <p className="text-xs text-indigo-400">{user?.role}</p>
        </div>
        <nav className="p-2 flex-1 space-y-0.5">
          <button
            onClick={() => setSection("pricing")}
            className={`w-full text-left rounded-lg px-3 py-2 text-sm ${
              section === "pricing" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Тарифы
          </button>
          <button
            onClick={() => setSection("chats")}
            className={`w-full text-left rounded-lg px-3 py-2 text-sm ${
              section === "chats" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Чаты
          </button>
          <button
            onClick={() => setSection("contacts")}
            className={`w-full text-left rounded-lg px-3 py-2 text-sm ${
              section === "contacts" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Заявки
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => setSection("cases")}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm ${
                section === "cases" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Кейсы
            </button>
          )}
        </nav>
        <div className="p-2 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full text-left rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl">
          {section === "pricing" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Тарифы</h1>
                <button
                  onClick={openAdd}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2"
                >
                  + Добавить тариф
                </button>
              </div>
              {error && (
                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2">
                  {error}
                </div>
              )}
              {loading ? (
                <div className="text-slate-500">Загрузка...</div>
              ) : items.length === 0 ? (
                <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-8 text-center text-slate-500">
                  Тарифов пока нет. Нажмите «Добавить тариф».
                </div>
              ) : (
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/80 text-slate-400 text-sm">
                      <tr>
                        <th className="px-4 py-3 font-medium">Название</th>
                        <th className="px-4 py-3 font-medium">Цена</th>
                        <th className="px-4 py-3 font-medium">Порядок</th>
                        <th className="px-4 py-3 font-medium">Популярный</th>
                        <th className="px-4 py-3 w-28">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {items.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 text-white">{item.title}</td>
                          <td className="px-4 py-3 text-slate-300">{item.price}</td>
                          <td className="px-4 py-3 text-slate-400">{item.order}</td>
                          <td className="px-4 py-3">{item.isPopular ? "Да" : "—"}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openEdit(item)}
                              className="text-indigo-400 hover:text-indigo-300 text-sm mr-2"
                            >
                              Изменить
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={deleteId === item._id}
                              className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                            >
                              {deleteId === item._id ? "..." : "Удалить"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {section === "users" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Пользователи</h1>
                <button
                  onClick={openUserAdd}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2"
                >
                  + Добавить пользователя
                </button>
              </div>
              {usersLoading ? (
                <div className="text-slate-500">Загрузка...</div>
              ) : users.length === 0 ? (
                <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-8 text-center text-slate-500">
                  Пользователей нет.
                </div>
              ) : (
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/80 text-slate-400 text-sm">
                      <tr>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Имя</th>
                        <th className="px-4 py-3 font-medium">Роль</th>
                        <th className="px-4 py-3 font-medium">Статус</th>
                        <th className="px-4 py-3 font-medium">Покупок</th>
                        <th className="px-4 py-3">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 text-white">{u.email}</td>
                          <td className="px-4 py-3 text-slate-300">{u.name || "—"}</td>
                          <td className="px-4 py-3 text-slate-300">{u.role}</td>
                          <td className="px-4 py-3">
                            <span className={u.status === "blocked" ? "text-red-400" : "text-green-400"}>
                              {u.status === "blocked" ? "Заблокирован" : "Активен"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{u.purchaseCount ?? 0}</td>
                          <td className="px-4 py-3 space-x-2">
                            <button
                              onClick={() => openHistory(u)}
                              className="text-slate-400 hover:text-white text-sm"
                            >
                              История
                            </button>
                            <button
                              onClick={() => openUserEdit(u)}
                              className="text-indigo-400 hover:text-indigo-300 text-sm"
                            >
                              Изменить
                            </button>
                            <button
                              onClick={() => handleUserDelete(u.id)}
                              disabled={userDeleteId === u.id}
                              className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                            >
                              {userDeleteId === u.id ? "..." : "Удалить"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {section === "contacts" && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Заявки с формы контактов</h1>
                <p className="text-slate-500 text-sm mt-1">Все обращения с страницы «Контакты»</p>
              </div>
              {contactRequestsLoading ? (
                <div className="text-slate-500">Загрузка...</div>
              ) : contactRequests.length === 0 ? (
                <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-8 text-center text-slate-500">
                  Заявок пока нет.
                </div>
              ) : (
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/80 text-slate-400 text-sm">
                      <tr>
                        <th className="px-4 py-3 font-medium">Дата</th>
                        <th className="px-4 py-3 font-medium">Имя</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Компания / Телефон</th>
                        <th className="px-4 py-3 font-medium">Сообщение</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {contactRequests.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 text-slate-500 text-sm whitespace-nowrap">
                            {new Date(r.createdAt).toLocaleString("ru-RU")}
                          </td>
                          <td className="px-4 py-3 text-white">{r.name}</td>
                          <td className="px-4 py-3 text-slate-300">
                            <a href={`mailto:${r.email}`} className="text-indigo-400 hover:underline">
                              {r.email}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-sm">
                            {[r.company, r.phone].filter(Boolean).join(" · ") || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-sm max-w-md">
                            <span className="line-clamp-2">{r.message}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {user?.role === "admin" && section === "cases" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Кейсы</h1>
                  <p className="text-slate-500 text-sm mt-1">Только для роли admin. CRUD кейсов с сайта.</p>
                </div>
                <button
                  onClick={() => {
                    setCaseEditing(null);
                    setCaseModal("add");
                  }}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2"
                >
                  + Добавить кейс
                </button>
              </div>
              {caseLoading ? (
                <div className="text-slate-500">Загрузка...</div>
              ) : caseItems.length === 0 ? (
                <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-8 text-center text-slate-500">
                  Кейсов пока нет.
                </div>
              ) : (
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/80 text-slate-400 text-sm">
                      <tr>
                        <th className="px-4 py-3 font-medium">Название</th>
                        <th className="px-4 py-3 font-medium">Категория</th>
                        <th className="px-4 py-3 font-medium">Slug</th>
                        <th className="px-4 py-3 font-medium">Порядок</th>
                        <th className="px-4 py-3 font-medium">Опубликован</th>
                        <th className="px-4 py-3 w-40">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {caseItems.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 text-white">{c.title}</td>
                          <td className="px-4 py-3 text-slate-300">{c.category}</td>
                          <td className="px-4 py-3 text-slate-400 text-sm">{c.slug}</td>
                          <td className="px-4 py-3 text-slate-400">{c.order}</td>
                          <td className="px-4 py-3">{c.isPublished ? "Да" : "Нет"}</td>
                          <td className="px-4 py-3 space-x-2">
                            <button
                              onClick={() => {
                                setCaseEditing(c);
                                setCaseModal("edit");
                              }}
                              className="text-indigo-400 hover:text-indigo-300 text-sm"
                            >
                              Изменить
                            </button>
                            <button
                              onClick={() => {
                                if (!confirm("Удалить этот кейс?")) return;
                                setCaseDeleteId(c._id);
                                api.cases
                                  .delete(c._id)
                                  .then(() => {
                                    setCaseItems((prev) => prev.filter((x) => x._id !== c._id));
                                    setCaseDeleteId(null);
                                  })
                                  .catch((e) => {
                                    alert(e instanceof Error ? e.message : "Ошибка");
                                    setCaseDeleteId(null);
                                  });
                              }}
                              disabled={caseDeleteId === c._id}
                              className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                            >
                              {caseDeleteId === c._id ? "..." : "Удалить"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {section === "chats" && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Переписки с клиентами</h1>
                <p className="text-slate-500 text-sm mt-1">AI-чат с сайта (по сессии или по почте)</p>
              </div>
              {chatsLoading ? (
                <div className="text-slate-500">Загрузка...</div>
              ) : conversations.length === 0 ? (
                <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-8 text-center text-slate-500">
                  Переписок пока нет.
                </div>
              ) : (
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/80 text-slate-400 text-sm">
                      <tr>
                        <th className="px-4 py-3 font-medium">Клиент</th>
                        <th className="px-4 py-3 font-medium">Последнее сообщение</th>
                        <th className="px-4 py-3 font-medium">Дата</th>
                        <th className="px-4 py-3 w-24">Действие</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {conversations.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 text-white">
                            {c.user ? c.user.email : `Сессия: ${(c.sessionId ?? "").slice(0, 8)}...`}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-sm max-w-xs truncate">
                            {c.lastMessage?.content ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-sm">
                            {c.lastMessage?.createdAt
                              ? new Date(c.lastMessage.createdAt).toLocaleString("ru-RU")
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openChat(c._id)}
                              className="text-indigo-400 hover:text-indigo-300 text-sm"
                            >
                              Открыть
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={closeChat}>
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">Переписка</h3>
                <p className="text-sm text-slate-400">
                  {selectedChat.conversation.user
                    ? selectedChat.conversation.user.email
                    : `Сессия: ${(selectedChat.conversation.sessionId ?? "").slice(0, 12)}...`}
                </p>
              </div>
              <button onClick={closeChat} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-4 overflow-auto flex-1 space-y-3">
              {selectedChat.messages.map((m) => (
                <div
                  key={m._id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-indigo-600/80 text-white"
                        : "bg-slate-700/80 text-slate-200"
                    }`}
                  >
                    {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                    {m.imageUrls?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {m.imageUrls.map((url) => (
                          <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt="" className="max-h-24 rounded object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {historyUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={closeHistory}>
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">История покупок: {historyUser.email}</h3>
              <button onClick={closeHistory} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-4 overflow-auto">
              {historyPurchases.length === 0 ? (
                <p className="text-slate-500">Покупок нет.</p>
              ) : (
                <ul className="space-y-2">
                  {historyPurchases.map((p) => (
                    <li key={p._id} className="flex justify-between py-2 border-b border-slate-700 last:border-0">
                      <span className="text-white">{p.title}</span>
                      <span className="text-slate-400">₽{p.price}</span>
                      <span className="text-slate-500 text-sm">{new Date(p.createdAt).toLocaleDateString("ru-RU")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {(userModal === "add" || userModal === "edit") && (
        <UserForm
          user={editingUser}
          saving={userSaving}
          onSave={async (body) => {
            setUserSaving(true);
            try {
              if (editingUser) {
                const updated = await api.users.update(editingUser.id, body);
                setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
              } else {
                const created = await api.users.create(body as { email: string; password: string; name?: string; role?: import("@/lib/api").UserRole });
                setUsers((prev) => [...prev, created]);
              }
              closeUserModal();
            } catch (e) {
              alert(e instanceof Error ? e.message : "Ошибка сохранения");
            } finally {
              setUserSaving(false);
            }
          }}
          onClose={closeUserModal}
        />
      )}

      {(modal === "add" || modal === "edit") && (
        <PricingForm
          item={modal === "edit" ? editingRaw : null}
          editId={editing?._id ?? null}
          loadingRaw={modal === "edit" && editing != null && editingRaw == null}
          saving={saving}
          onSave={async (body: PricingCreateBody) => {
            setSaving(true);
            try {
              if (editing) {
                await api.pricing.update(editing._id, body);
              } else {
                await api.pricing.create(body);
              }
              load();
              closeModal();
            } catch (e) {
              alert(e instanceof Error ? e.message : "Ошибка сохранения");
            } finally {
              setSaving(false);
            }
          }}
          onClose={closeModal}
        />
      )}

      {(caseModal === "add" || caseModal === "edit") && (
        <CaseForm
          item={caseModal === "edit" ? caseEditingFull : null}
          editId={caseEditing?._id ?? null}
          loading={caseModal === "edit" && caseEditing != null && caseEditingFull == null}
          saving={caseSaving}
          onSave={async (body: Partial<CaseItem>) => {
            setCaseSaving(true);
            try {
              if (caseEditing) {
                await api.cases.update(caseEditing._id, body);
              } else {
                await api.cases.create(body);
              }
              setCaseItems(await api.cases.list());
              setCaseModal("closed");
              setCaseEditing(null);
              setCaseEditingFull(null);
            } catch (e) {
              alert(e instanceof Error ? e.message : "Ошибка сохранения");
            } finally {
              setCaseSaving(false);
            }
          }}
          onClose={() => {
            setCaseModal("closed");
            setCaseEditing(null);
            setCaseEditingFull(null);
          }}
        />
      )}
    </div>
  );
}

type PricingFormState = {
  title_en: string;
  title_ru: string;
  title_hy: string;
  description_en: string;
  description_ru: string;
  description_hy: string;
  features_en: string;
  features_ru: string;
  features_hy: string;
  price: string;
  order: string;
  isPopular: boolean;
};

const emptyForm: PricingFormState = {
  title_en: "",
  title_ru: "",
  title_hy: "",
  description_en: "",
  description_ru: "",
  description_hy: "",
  features_en: "",
  features_ru: "",
  features_hy: "",
  price: "",
  order: "0",
  isPopular: false,
};

function formFromItem(item: PricingItemRaw | null): PricingFormState {
  if (!item) return emptyForm;
  const t = (o: { en?: string; ru?: string; hy?: string } | undefined) =>
    o ? { en: o.en ?? "", ru: o.ru ?? "", hy: o.hy ?? "" } : { en: "", ru: "", hy: "" };
  const f = (o: { en?: string[]; ru?: string[]; hy?: string[] } | undefined) =>
    o ? { en: (o.en ?? []).join("\n"), ru: (o.ru ?? []).join("\n"), hy: (o.hy ?? []).join("\n") } : { en: "", ru: "", hy: "" };
  const title = t(item.title as { en?: string; ru?: string; hy?: string });
  const desc = t(item.description as { en?: string; ru?: string; hy?: string });
  const feat = f(item.features);
  return {
    title_en: title.en,
    title_ru: title.ru,
    title_hy: title.hy,
    description_en: desc.en,
    description_ru: desc.ru,
    description_hy: desc.hy,
    features_en: feat.en,
    features_ru: feat.ru,
    features_hy: feat.hy,
    price: String(item.price),
    order: String(item.order ?? 0),
    isPopular: item.isPopular ?? false,
  };
}

function PricingForm({
  item,
  editId,
  loadingRaw,
  saving,
  onSave,
  onClose,
}: {
  item: PricingItemRaw | null;
  editId: string | null;
  loadingRaw: boolean;
  saving: boolean;
  onSave: (body: PricingCreateBody) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<PricingFormState>(formFromItem(item));

  useEffect(() => {
    setForm(formFromItem(item));
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const hasTitle = form.title_en.trim() || form.title_ru.trim() || form.title_hy.trim();
    if (!hasTitle) {
      alert("Введите название хотя бы на одном языке (EN / RU / HY)");
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      alert("Укажите корректную цену");
      return;
    }
    const lines = (s: string) =>
      s
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
    onSave({
      title: { en: form.title_en.trim(), ru: form.title_ru.trim(), hy: form.title_hy.trim() },
      description: {
        en: form.description_en.trim(),
        ru: form.description_ru.trim(),
        hy: form.description_hy.trim(),
      },
      features: {
        en: lines(form.features_en),
        ru: lines(form.features_ru),
        hy: lines(form.features_hy),
      },
      price,
      order: Number(form.order) || 0,
      isPopular: form.isPopular,
    });
  };

  if (loadingRaw) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
        <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-xl p-8 text-center text-slate-400">
          Загрузка…
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto py-8" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">
            {editId ? "Редактировать тариф" : "Новый тариф"}
          </h3>
          <p className="text-sm text-slate-400 mt-1">Тексты на трёх языках: EN, RU, HY</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {(["en", "ru", "hy"] as const).map((lang) => (
              <div key={lang}>
                <label className="block text-sm font-medium text-slate-400 mb-1">Название ({lang.toUpperCase()}) *</label>
                <input
                  type="text"
                  value={lang === "en" ? form.title_en : lang === "ru" ? form.title_ru : form.title_hy}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ...(lang === "en" ? { title_en: e.target.value } : lang === "ru" ? { title_ru: e.target.value } : { title_hy: e.target.value }),
                    }))
                  }
                  className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white text-sm"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(["en", "ru", "hy"] as const).map((lang) => (
              <div key={lang}>
                <label className="block text-sm font-medium text-slate-400 mb-1">Описание ({lang.toUpperCase()})</label>
                <textarea
                  value={lang === "en" ? form.description_en : lang === "ru" ? form.description_ru : form.description_hy}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ...(lang === "en" ? { description_en: e.target.value } : lang === "ru" ? { description_ru: e.target.value } : { description_hy: e.target.value }),
                    }))
                  }
                  className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white text-sm min-h-[70px]"
                  rows={2}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Цена *</label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Порядок</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="popular"
              checked={form.isPopular}
              onChange={(e) => setForm((f) => ({ ...f, isPopular: e.target.checked }))}
              className="rounded border-slate-600 bg-slate-900 text-indigo-600"
            />
            <label htmlFor="popular" className="text-sm text-slate-400">
              Популярный тариф
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Особенности (каждая с новой строки) — EN / RU / HY
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(["en", "ru", "hy"] as const).map((lang) => (
                <div key={lang}>
                  <span className="text-xs text-slate-500">({lang.toUpperCase()})</span>
                  <textarea
                    value={lang === "en" ? form.features_en : lang === "ru" ? form.features_ru : form.features_hy}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        ...(lang === "en" ? { features_en: e.target.value } : lang === "ru" ? { features_ru: e.target.value } : { features_hy: e.target.value }),
                      }))
                    }
                    className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white text-sm min-h-[80px] mt-1"
                    placeholder="Feature 1"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-slate-400 hover:bg-slate-700"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 disabled:opacity-50"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type UserFormState = {
  email: string;
  password: string;
  name: string;
  role: import("@/lib/api").UserRole;
  status: import("@/lib/api").UserStatus;
};

function UserForm({
  user,
  saving,
  onSave,
  onClose,
}: {
  user: AdminUser | null;
  saving: boolean;
  onSave: (body: Partial<UserFormState>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<UserFormState>({
    email: user?.email ?? "",
    password: "",
    name: user?.name ?? "",
    role: user?.role ?? "client",
    status: user?.status ?? "active",
  });

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email,
        password: "",
        name: user.name ?? "",
        role: user.role,
        status: user.status,
      });
    } else {
      setForm({
        email: "",
        password: "",
        name: "",
        role: "client",
        status: "active",
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && (!form.email.trim() || !form.password || form.password.length < 6)) {
      alert("Email и пароль (не менее 6 символов) обязательны");
      return;
    }
    const body: Partial<UserFormState> = user
      ? { name: form.name, role: form.role, status: form.status }
      : { email: form.email.trim(), password: form.password, name: form.name.trim() || undefined, role: form.role };
    onSave(body);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">
            {user ? "Редактировать пользователя" : "Новый пользователь"}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white"
              disabled={!!user}
            />
          </div>
          {!user && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Пароль *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white"
                minLength={6}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Имя</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Роль</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as import("@/lib/api").UserRole }))}
              className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white"
            >
              <option value="client">client</option>
              <option value="manager">manager</option>
              <option value="admin">admin</option>
            </select>
          </div>
          {user && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Статус</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as import("@/lib/api").UserStatus }))}
                className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-white"
              >
                <option value="active">Активен</option>
                <option value="blocked">Заблокирован</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-slate-400 hover:bg-slate-700">
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 disabled:opacity-50"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
