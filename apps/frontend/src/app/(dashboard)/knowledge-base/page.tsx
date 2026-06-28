"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import {
  Plus,
  Search,
  BookOpen,
  FileText,
  Trash2,
  Edit3,
  Save,
  X,
  Upload,
  Sparkles,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async (search?: string) => {
    try {
      const endpoint = search
        ? `/knowledge-base?search=${encodeURIComponent(search)}`
        : "/knowledge-base";
      const data = await api.get<Article[]>(endpoint);
      setArticles(data);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    loadArticles(value || undefined);
  };

  const startCreate = () => {
    setEditingArticle(null);
    setIsCreating(true);
    setForm({ title: "", content: "", tags: "" });
  };

  const startEdit = (article: Article) => {
    setEditingArticle(article);
    setIsCreating(false);
    setForm({
      title: article.title,
      content: article.content,
      tags: article.tags.join(", "),
    });
  };

  const cancelEdit = () => {
    setEditingArticle(null);
    setIsCreating(false);
    setForm({ title: "", content: "", tags: "" });
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSaving(true);
    const payload = {
      title: form.title,
      content: form.content,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (editingArticle) {
        const updated = await api.patch<Article>(
          `/knowledge-base/${editingArticle.id}`,
          payload
        );
        setArticles((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        );
        toast.success("Article updated");
      } else {
        const created = await api.post<Article>("/knowledge-base", payload);
        setArticles((prev) => [created, ...prev]);
        toast.success("Article created");
      }
      cancelEdit();
    } catch {
      toast.error("Failed to save article");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/knowledge-base/${id}`);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success("Article deleted");
    } catch {
      toast.error("Failed to delete article");
    }
  };

  const filteredArticles = articles.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-neutral-500">
            Store and manage business knowledge for AI agents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast.info("Feature coming soon")}>
            <Upload className="h-4 w-4 mr-1.5" />
            Import
          </Button>
          <Button variant="outline" onClick={() => toast.info("Training knowledge base...")}>
            <Sparkles className="h-4 w-4 mr-1.5" />
            Train AI
          </Button>
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Article
          </Button>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          ) : filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
              <BookOpen className="h-16 w-16 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-300">
                No articles yet
              </h3>
              <p className="text-sm mt-1 mb-4">
                Add knowledge articles to help AI agents answer accurately.
              </p>
              <Button onClick={startCreate}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Article
              </Button>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                className="group rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                      <h3 className="font-semibold text-neutral-900 truncate dark:text-white">
                        {article.title}
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-neutral-600 line-clamp-2 dark:text-neutral-400">
                      {article.content}
                    </p>
                    {article.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="mt-1.5 text-xs text-neutral-400">
                      Updated {new Date(article.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(article)}
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                      aria-label="Edit article"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-900/20 dark:hover:text-error-400"
                      aria-label="Delete article"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {(isCreating || editingArticle) && (
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {editingArticle ? "Edit Article" : "New Article"}
                </h3>
                <button
                  onClick={cancelEdit}
                  className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase mb-1 block">
                    Title
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Article title"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase mb-1 block">
                    Content
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                    rows={10}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50"
                    placeholder="Write your knowledge article content here..."
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase mb-1 block">
                    Tags (comma separated)
                  </label>
                  <Input
                    value={form.tags}
                    onChange={(e) =>
                      setForm({ ...form, tags: e.target.value })
                    }
                    placeholder="faq, product, support"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={cancelEdit}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    loading={isSaving}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {editingArticle ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
