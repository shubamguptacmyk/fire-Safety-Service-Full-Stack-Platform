import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogService, AdminProductFilters } from "@/services/catalogService";
import { Product, Category } from "@/types";
import ProductModal from "@/components/ProductModal";
import CategoryModal from "@/components/CategoryModal";
import StockModal from "@/components/StockModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/store/toastStore";
import {
  Package,
  Layers,
  AlertTriangle,
  Plus,
  Search,
  Edit2,
  Trash2,
  Boxes,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export default function Catalog() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "low-stock">("products");

  // Filter state for products table
  const [productFilters, setProductFilters] = useState<AdminProductFilters>({
    page: 1,
    limit: 10,
    search: "",
    category: "",
  });

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);

  const toast = useToast();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Queries
  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["admin-products", productFilters],
    queryFn: () => catalogService.getProducts(productFilters),
  });

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => catalogService.getCategories(),
  });

  const {
    data: lowStockProducts = [],
    isLoading: isLowStockLoading,
    isError: isLowStockError,
    refetch: refetchLowStock,
  } = useQuery({
    queryKey: ["admin-low-stock"],
    queryFn: () => catalogService.getLowStockProducts(),
  });

  // Mutations
  const saveProductMutation = useMutation({
    mutationFn: (payload: Partial<Product>) => {
      if (selectedProduct) {
        return catalogService.updateProduct(selectedProduct._id, payload);
      }
      return catalogService.createProduct(payload);
    },
    onSuccess: () => {
      toast.success(selectedProduct ? "Product updated successfully" : "New product added to catalog");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-low-stock"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to save product");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      setProductToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-low-stock"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete product");
    },
  });

  const saveCategoryMutation = useMutation({
    mutationFn: (payload: Partial<Category>) => {
      if (selectedCategory) {
        return catalogService.updateCategory(selectedCategory._id, payload);
      }
      return catalogService.createCategory(payload);
    },
    onSuccess: () => {
      toast.success(selectedCategory ? "Category updated successfully" : "New category created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to save category");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted successfully");
      setCategoryToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete category");
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      catalogService.updateStock(id, stock),
    onSuccess: () => {
      toast.success("Inventory stock levels updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-low-stock"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update stock");
    },
  });

  // Handlers
  function handleOpenCreateProduct() {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  }

  function handleOpenEditProduct(product: Product) {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  }

  function handleDeleteProduct(product: Product) {
    setProductToDelete(product);
  }

  function handleOpenCreateCategory() {
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  }

  function handleOpenEditCategory(cat: Category) {
    setSelectedCategory(cat);
    setIsCategoryModalOpen(true);
  }

  function handleDeleteCategory(cat: Category) {
    setCategoryToDelete(cat);
  }

  function handleOpenStockModal(product: Product) {
    setStockProduct(product);
    setIsStockModalOpen(true);
  }

  const products = productsData?.products || [];
  const meta = productsData?.meta;
  const page = meta?.page || 1;
  const totalPages = meta?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Page Title & Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink">Catalog & Inventory</h1>
          <p className="text-xs text-steel">Manage fire safety products, categories, and stock alerts</p>
        </div>

        <div className="flex items-center gap-2 bg-paper p-1 rounded-lg border border-black/10">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "products"
                ? "bg-brand text-white shadow-sm"
                : "text-steel hover:text-ink"
            }`}
          >
            <Package className="w-4 h-4" /> Products ({meta?.total ?? products.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "categories"
                ? "bg-brand text-white shadow-sm"
                : "text-steel hover:text-ink"
            }`}
          >
            <Layers className="w-4 h-4" /> Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("low-stock")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "low-stock"
                ? "bg-amber text-ink shadow-sm font-bold"
                : "text-steel hover:text-ink"
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Low Stock ({lowStockProducts.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCTS TABLE */}
      {activeTab === "products" && (
        <div className="bg-white rounded-lg border border-black/10 shadow-sm overflow-hidden">
          {/* Controls toolbar */}
          <div className="p-4 border-b border-black/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-steel absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search products by title or SKU..."
                  value={productFilters.search || ""}
                  onChange={(e) =>
                    setProductFilters((p) => ({ ...p, search: e.target.value, page: 1 }))
                  }
                  className="w-full pl-9 pr-3 py-1.5 border border-black/15 rounded text-xs focus:border-brand outline-none"
                />
              </div>

              <select
                value={productFilters.category || ""}
                onChange={(e) =>
                  setProductFilters((p) => ({ ...p, category: e.target.value, page: 1 }))
                }
                className="px-3 py-1.5 border border-black/15 rounded text-xs focus:border-brand outline-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenCreateProduct}
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> New Product
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper border-b border-black/10 text-steel font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {isProductsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-steel">
                      Loading catalog...
                    </td>
                  </tr>
                ) : isProductsError ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-steel">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-ink">Unable to load catalog</span>
                        <button
                          type="button"
                          onClick={() => refetchProducts()}
                          className="mt-1 px-4 py-1.5 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold shadow-xs transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-steel">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const img =
                      p.images?.find((i) => i?.isPrimary)?.url ||
                      p.images?.[0]?.url ||
                      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=100&q=80";

                    const stock = typeof p.stock === "number" ? p.stock : 0;
                    const isLow = stock <= (p.lowStockThreshold ?? 5);
                    const catName =
                      p.category && typeof p.category === "object"
                        ? p.category.name || "Uncategorized"
                        : typeof p.category === "string" && p.category.trim()
                        ? p.category
                        : "Uncategorized";

                    const price = typeof p.price === "number" ? p.price : 0;
                    const hasDiscount = typeof p.discountPrice === "number" && p.discountPrice < price;
                    const displayPrice = hasDiscount ? p.discountPrice : price;

                    return (
                      <tr key={p._id} className="hover:bg-paper/50 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={img}
                            alt=""
                            className="w-10 h-10 object-contain rounded border border-black/10 p-0.5 bg-white shrink-0"
                          />
                          <div>
                            <p className="font-bold text-ink hover:text-brand transition-colors">
                              {p.name || "Unnamed Product"}
                            </p>
                            <p className="text-[11px] text-steel">
                              SKU: <span className="font-mono">{p.SKU || "N/A"}</span> · Brand: {p.brand || "Unknown"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-steel">
                          <span>{catName}</span>
                          {p.subcategory && typeof p.subcategory === "string" && (
                            <span className="block text-[10px] text-steel/70">
                              {p.subcategory}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-ink">
                            ₹{(displayPrice || 0).toLocaleString("en-IN")}
                          </span>
                          {hasDiscount && (
                            <span className="block text-[10px] text-steel line-through">
                              ₹{(price || 0).toLocaleString("en-IN")}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                                stock <= 0
                                  ? "bg-red-100 text-red-700"
                                  : isLow
                                  ? "bg-amber/20 text-amber-900"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {stock} {p.unit || "units"}
                            </span>
                            <button
                              onClick={() => handleOpenStockModal(p)}
                              className="text-[10px] text-brand hover:underline font-semibold"
                            >
                              Adjust
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {p.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-steel">
                              <XCircle className="w-3.5 h-3.5" /> Hidden
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 text-steel hover:text-brand hover:bg-black/5 rounded"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p)}
                              className="p-1.5 text-steel hover:text-red-600 hover:bg-black/5 rounded"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-black/10 flex items-center justify-between text-xs text-steel">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setProductFilters((p) => ({ ...p, page: Math.max(1, page - 1) }))}
                  disabled={page <= 1}
                  className="p-1.5 border border-black/10 rounded disabled:opacity-40 hover:bg-paper"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    setProductFilters((p) => ({ ...p, page: Math.min(totalPages, page + 1) }))
                  }
                  disabled={page >= totalPages}
                  className="p-1.5 border border-black/10 rounded disabled:opacity-40 hover:bg-paper"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-lg border border-black/10 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-black/10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
              Active Fire Safety Categories ({categories.length})
            </span>
            <button
              onClick={handleOpenCreateCategory}
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> New Category
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper border-b border-black/10 text-steel font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Subcategories</th>
                  <th className="py-3 px-4">Sort Order</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {isCategoriesLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-steel">
                      Loading categories...
                    </td>
                  </tr>
                ) : isCategoriesError ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-steel">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-ink">Unable to load categories</span>
                        <button
                          type="button"
                          onClick={() => refetchCategories()}
                          className="mt-1 px-4 py-1.5 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold shadow-xs transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-steel">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-paper/50">
                      <td className="py-3 px-4 font-bold text-ink flex items-center gap-2">
                        {cat.image && (
                          <img
                            src={cat.image}
                            alt=""
                            className="w-7 h-7 object-contain rounded border border-black/10"
                          />
                        )}
                        <span>{cat.name}</span>
                      </td>
                      <td className="py-3 px-4 text-steel font-mono">{cat.slug}</td>
                      <td className="py-3 px-4 text-steel">
                        <span className="font-semibold text-ink">
                          {cat.subcategories?.length || 0} subcategories
                        </span>
                        <p className="text-[10px] truncate max-w-xs text-steel/70">
                          {cat.subcategories?.map((s) => s.name).join(", ")}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-steel">{cat.sortOrder}</td>
                      <td className="py-3 px-4">
                        {cat.isActive ? (
                          <span className="text-green-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="text-steel flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1.5 text-steel hover:text-brand rounded"
                            title="Edit category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-steel hover:text-red-600 rounded"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOW STOCK INVENTORY */}
      {activeTab === "low-stock" && (
        <div className="bg-white rounded-lg border border-black/10 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-black/10 bg-amber/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-800" />
              <div>
                <h3 className="font-bold text-sm text-ink">Low Inventory Alerts</h3>
                <p className="text-xs text-steel">
                  Products whose current stock is at or below the safety threshold
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper border-b border-black/10 text-steel font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {isLowStockLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-steel">
                      Loading low inventory...
                    </td>
                  </tr>
                ) : isLowStockError ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-steel">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-ink">Unable to load low stock inventory</span>
                        <button
                          type="button"
                          onClick={() => refetchLowStock()}
                          className="mt-1 px-4 py-1.5 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold shadow-xs transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-green-700 font-semibold">
                      ✓ All inventory levels are healthy above safety thresholds.
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((p) => {
                    const stock = typeof p.stock === "number" ? p.stock : 0;
                    const threshold = typeof p.lowStockThreshold === "number" ? p.lowStockThreshold : 5;
                    return (
                      <tr key={p._id} className="hover:bg-paper/50">
                        <td className="py-3 px-4 font-semibold text-ink">{p.name || "Unnamed Product"}</td>
                        <td className="py-3 px-4 font-mono text-steel">{p.SKU || "N/A"}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-xs ${
                              stock <= 0
                                ? "bg-red-100 text-red-700"
                                : "bg-amber/20 text-amber-900"
                            }`}
                          >
                            {stock} {p.unit || "units"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-steel">{threshold} units</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenStockModal(p)}
                            className="px-3 py-1 bg-brand text-white rounded text-xs font-semibold hover:bg-brand-dark"
                          >
                            Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        categories={categories}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={async (data) => {
          await saveProductMutation.mutateAsync(data);
        }}
      />

      {/* Category Modal */}
      <CategoryModal
        category={selectedCategory}
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={async (data) => {
          await saveCategoryMutation.mutateAsync(data);
        }}
      />

      {/* Stock Modal */}
      {stockProduct && (
        <StockModal
          product={stockProduct}
          isOpen={isStockModalOpen}
          onClose={() => setIsStockModalOpen(false)}
          onSave={async (newStock) => {
            await updateStockMutation.mutateAsync({ id: stockProduct._id, stock: newStock });
          }}
        />
      )}

      {/* Confirm Delete Product Dialog */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        title="Delete Product?"
        message={`Are you sure you want to delete "${productToDelete?.name}"? It will be removed from customer searches and catalog.`}
        confirmLabel="Delete Product"
        isDestructive
        isLoading={deleteProductMutation.isPending}
        onConfirm={() => {
          if (productToDelete) deleteProductMutation.mutate(productToDelete._id);
        }}
        onCancel={() => setProductToDelete(null)}
      />

      {/* Confirm Delete Category Dialog */}
      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        title="Delete Category?"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"? This will fail if products are actively mapped to it.`}
        confirmLabel="Delete Category"
        isDestructive
        isLoading={deleteCategoryMutation.isPending}
        onConfirm={() => {
          if (categoryToDelete) deleteCategoryMutation.mutate(categoryToDelete._id);
        }}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}
