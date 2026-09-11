import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Globe,
  Eye,
  Loader2,
  RefreshCw,
  CheckCircle2,
  X,
  Image,
  Upload,
  Calendar,
} from "lucide-react";
import { adminBlogService, AdminBlogPost } from "@/services/adminBlogService";
import Breadcrumbs from "@/components/Breadcrumbs";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/store/toastStore";

export default function BlogAdmin() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Fire Safety Standards");
  const [tagsInput, setTagsInput] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminBlogService.getPosts({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
      });
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Failed to load blog posts", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchPosts]);

  function openCreateModal() {
    setEditingPostId(null);
    setTitle("");
    setSlug("");
    setCategory("Fire Safety Standards");
    setTagsInput("IS 2190, Fire Audit, Extinguishers");
    setExcerpt("");
    setContent("");
    setFeaturedImage("");
    setStatus("draft");
    setMetaTitle("");
    setMetaDescription("");
    setIsEditorOpen(true);
  }

  function openEditModal(p: AdminBlogPost) {
    setEditingPostId(p._id);
    setTitle(p.title);
    setSlug(p.slug);
    setCategory(p.category);
    setTagsInput(p.tags?.join(", ") || "");
    setExcerpt(p.excerpt);
    setContent(p.content);
    setFeaturedImage(p.featuredImage || "");
    setStatus(p.status === "published" ? "published" : "draft");
    setMetaTitle(p.seo?.metaTitle || "");
    setMetaDescription(p.seo?.metaDescription || "");
    setIsEditorOpen(true);
  }

  function generateSlug(val: string) {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSavePost(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title,
        slug: slug || generateSlug(title),
        category,
        tags,
        excerpt,
        content,
        featuredImage,
        status,
        seo: {
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || excerpt,
        },
      };

      if (editingPostId) {
        await adminBlogService.updatePost(editingPostId, payload);
      } else {
        await adminBlogService.createPost(payload);
      }
      setIsEditorOpen(false);
      fetchPosts();
    } catch (err) {
      console.error("Failed to save post", err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublishToggle(p: AdminBlogPost) {
    try {
      if (p.status === "published") {
        await adminBlogService.updatePost(p._id, { status: "draft" });
        toast.info("Article unpublished and reverted to draft");
      } else {
        await adminBlogService.publishPost(p._id);
        toast.success("Article published successfully!");
      }
      fetchPosts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to toggle publish status");
    }
  }

  const toast = useToast();
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!deletePostId) return;
    setIsDeleting(true);
    try {
      await adminBlogService.deletePost(deletePostId);
      toast.success("Article deleted successfully");
      setPosts((prev) => prev.filter((p) => p._id !== deletePostId));
      setDeletePostId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Blog & Knowledge CMS" }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Fire Safety Blog & Knowledge CMS</h1>
          <p className="text-xs text-steel mt-0.5">
            Publish educational articles, Form B compliance guides, BIS standards updates, and technical advisories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPosts}
            className="px-3 py-1.5 bg-paper hover:bg-gray-200 border border-black/10 rounded-lg text-xs font-semibold text-ink flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Article
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-black/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles by title, tags, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-paper/50 border border-black/10 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-steel" />
          <div className="flex rounded-lg border border-black/10 p-0.5 bg-paper/50 text-xs">
            {(["all", "published", "draft"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded capitalize font-semibold transition-colors ${
                  statusFilter === s ? "bg-brand text-white shadow-sm" : "text-steel hover:text-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-steel gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
            <span className="text-xs">Loading blog posts...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-steel text-xs">
            No articles found. Click "New Article" to create your first publication.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper/70 border-b border-black/10 text-steel font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Article</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Tags</th>
                  <th className="p-3.5">Author</th>
                  <th className="p-3.5">Views</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-paper/30 transition-colors">
                    <td className="p-3.5 max-w-sm">
                      <div className="font-bold text-ink text-sm">{post.title}</div>
                      <span className="text-[11px] font-mono text-steel block mt-0.5">/blog/{post.slug}</span>
                      <p className="text-steel line-clamp-1 mt-1 text-[11px]">{post.excerpt}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-brand/10 text-brand font-medium text-[11px]">
                        {post.category}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {post.tags?.map((t, i) => (
                          <span key={i} className="text-[10px] text-steel bg-paper px-1.5 py-0.5 rounded border border-black/5">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-steel font-medium">{post.author?.name || "AK Editorial"}</td>
                    <td className="p-3.5 font-mono text-ink font-semibold">{post.viewsCount || 0}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => handlePublishToggle(post)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                          post.status === "published"
                            ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                            : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        }`}
                      >
                        {post.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => openEditModal(post)}
                        className="p-1 text-steel hover:text-ink hover:bg-paper rounded transition-colors"
                        title="Edit Article"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletePostId(post._id)}
                        className="p-1 text-steel hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-black/10 overflow-hidden">
            <div className="px-6 py-4 bg-paper/70 border-b border-black/10 flex items-center justify-between">
              <h2 className="text-base font-display font-bold text-ink">
                {editingPostId ? "Edit Blog Article" : "Create New Blog Article"}
              </h2>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 text-steel hover:text-ink rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-ink block">Article Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra Fire Act Form B AMC Checklist 2026"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingPostId) setSlug(generateSlug(e.target.value));
                    }}
                    className="w-full p-2 bg-paper/50 border border-black/10 rounded focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink block">URL Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. form-b-amc-compliance-checklist"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full p-2 bg-paper/50 border border-black/10 rounded font-mono focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-ink block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-white border border-black/10 rounded font-medium focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="Fire Safety Standards">Fire Safety Standards</option>
                    <option value="AMC & Form B Compliance">AMC & Form B Compliance</option>
                    <option value="Extinguisher Maintenance">Extinguisher Maintenance</option>
                    <option value="Commercial & Industrial">Commercial & Industrial</option>
                    <option value="Residential Safety">Residential Safety</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-ink block">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="IS 2190, PESO, Form B, Hydro-testing"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full p-2 bg-paper/50 border border-black/10 rounded focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink block">Featured Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/banner.jpg"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="w-full p-2 bg-paper/50 border border-black/10 rounded focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink block">Short Excerpt *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief synopsis displayed on catalog cards and Google preview..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full p-2 bg-paper/50 border border-black/10 rounded focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink block">Article Full Content (Markdown / HTML) *</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Write in-depth guide with statutory references, inspection tables, and life safety rules..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2 bg-paper/50 border border-black/10 rounded font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* SEO Section */}
              <div className="pt-3 border-t border-black/10 space-y-3">
                <h4 className="font-bold text-ink text-xs uppercase tracking-wider">Search Engine Optimization (SEO)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-steel block text-[11px] mb-1">SEO Title Tag</label>
                    <input
                      type="text"
                      placeholder="Title displayed in Google search results"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="w-full p-2 bg-paper/50 border border-black/10 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-steel block text-[11px] mb-1">Meta Description</label>
                    <input
                      type="text"
                      placeholder="Search snippet summary (under 160 characters)"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="w-full p-2 bg-paper/50 border border-black/10 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-ink">Publish Status:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="p-1.5 border border-black/10 rounded bg-white font-semibold"
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="published">Publish Instantly</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-3 py-1.5 text-steel hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-brand text-white rounded-lg font-bold hover:bg-brand-dark shadow-sm flex items-center gap-1.5"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {editingPostId ? "Save Updates" : "Create Post"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletePostId)}
        title="Delete Blog Article?"
        message="Are you sure you want to delete this educational article? It will be removed from the public website knowledge center."
        confirmLabel="Delete Article"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletePostId(null)}
      />
    </div>
  );
}
