import { useState, useEffect } from "react";
import { Product, Category, ProductSpecification, ProductImage } from "@/types";
import { catalogService } from "@/services/catalogService";
import { X, Plus, Trash2, Upload, Loader2, Image as ImageIcon, FileText } from "lucide-react";

interface ProductModalProps {
  product?: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
}

export default function ProductModal({
  product,
  categories,
  isOpen,
  onClose,
  onSave,
}: ProductModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "specs" | "media" | "status">("general");

  // General fields
  const [name, setName] = useState("");
  const [SKU, setSKU] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  // Pricing & Inventory
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState<number>(1);
  const [unit, setUnit] = useState("piece");

  // Specs & Hazard
  const [capacity, setCapacity] = useState("");
  const [weight, setWeight] = useState("");
  const [fireClassInput, setFireClassInput] = useState("");
  const [fireClasses, setFireClasses] = useState<string[]>([]);
  const [certInput, setCertInput] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  // Media
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [datasheet, setDatasheet] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Status
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate data on open/edit
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setSKU(product.SKU || "");
      const catId =
        product.category && typeof product.category === "object"
          ? (product.category as any)._id
          : typeof product.category === "string"
          ? product.category
          : "";
      setCategoryId(catId || "");
      setSubcategory(product.subcategory || "");
      setBrand(product.brand || "");
      setModelNumber(product.modelNumber || "");
      setShortDescription(product.shortDescription || "");
      setDescription(product.description || "");

      setPrice(product.price || 0);
      setDiscountPrice(product.discountPrice !== undefined ? product.discountPrice : "");
      setStock(product.stock || 0);
      setLowStockThreshold(product.lowStockThreshold || 5);
      setMinimumOrderQuantity(product.minimumOrderQuantity || 1);
      setUnit(product.unit || "piece");

      setCapacity(product.capacity || "");
      setWeight(product.weight || "");
      setFireClasses(product.fireClass || []);
      setCertifications(product.certifications || []);
      setSpecifications(product.specifications || []);
      setFeatures(product.features || []);

      setImages(product.images || []);
      setDatasheet(product.datasheet || "");

      setIsActive(product.isActive ?? true);
      setIsFeatured(product.isFeatured ?? false);
      setIsBestSeller(product.isBestSeller ?? false);
    } else {
      setName("");
      setSKU("");
      setCategoryId(categories[0]?._id || "");
      setSubcategory("");
      setBrand("SafePro");
      setModelNumber("");
      setShortDescription("");
      setDescription("");

      setPrice(1000);
      setDiscountPrice("");
      setStock(20);
      setLowStockThreshold(5);
      setMinimumOrderQuantity(1);
      setUnit("piece");

      setCapacity("");
      setWeight("");
      setFireClasses([]);
      setCertifications([]);
      setSpecifications([]);
      setFeatures([]);

      setImages([]);
      setDatasheet("");

      setIsActive(true);
      setIsFeatured(false);
      setIsBestSeller(false);
    }
    setActiveTab("general");
    setError(null);
  }, [product, isOpen, categories]);

  if (!isOpen) return null;

  const selectedCategory = categories.find((c) => c._id === categoryId);

  // Specifications helpers
  function handleAddSpec(e: React.FormEvent) {
    e.preventDefault();
    if (!specKey.trim() || !specVal.trim()) return;
    setSpecifications((prev) => [...prev, { key: specKey.trim(), value: specVal.trim() }]);
    setSpecKey("");
    setSpecVal("");
  }

  function handleRemoveSpec(idx: number) {
    setSpecifications((prev) => prev.filter((_, i) => i !== idx));
  }

  // Features helpers
  function handleAddFeature(e: React.FormEvent) {
    e.preventDefault();
    if (!featureInput.trim()) return;
    setFeatures((prev) => [...prev, featureInput.trim()]);
    setFeatureInput("");
  }

  function handleRemoveFeature(idx: number) {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  }

  // Fire classes helpers
  function handleAddFireClass(fc: string) {
    if (!fc.trim()) return;
    if (fireClasses.includes(fc.trim())) {
      setFireClasses((prev) => prev.filter((f) => f !== fc.trim()));
    } else {
      setFireClasses((prev) => [...prev, fc.trim()]);
    }
  }

  // Image Upload helper
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const result = await catalogService.uploadImage(file);
      setImages((prev) => [
        ...prev,
        { url: result.url, publicId: result.publicId, isPrimary: prev.length === 0 },
      ]);
    } catch (err: any) {
      setError(err?.response?.data?.message || "File upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  // Datasheet Upload helper
  async function handleDatasheetUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const result = await catalogService.uploadDocument(file);
      setDatasheet(result.url);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Datasheet upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function handleAddImageUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      { url: newImageUrl.trim(), isPrimary: prev.length === 0 },
    ]);
    setNewImageUrl("");
  }

  function handleRemoveImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSetPrimaryImage(index: number) {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  }

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !SKU.trim() || !categoryId || !brand.trim() || !description.trim()) {
      setError("Please fill in all required fields (Name, SKU, Category, Brand, Description).");
      setActiveTab("general");
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: Partial<Product> = {
      name: name.trim(),
      SKU: SKU.trim().toUpperCase(),
      category: categoryId as any,
      subcategory: subcategory.trim() || undefined,
      brand: brand.trim(),
      modelNumber: modelNumber.trim() || undefined,
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim(),
      price: Number(price),
      discountPrice: discountPrice !== "" ? Number(discountPrice) : undefined,
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      minimumOrderQuantity: Number(minimumOrderQuantity),
      unit: unit.trim(),
      capacity: capacity.trim() || undefined,
      weight: weight.trim() || undefined,
      fireClass: fireClasses,
      certifications: certifications,
      specifications,
      features,
      images,
      datasheet: datasheet.trim() || undefined,
      isActive,
      isFeatured,
      isBestSeller,
    };

    try {
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save product");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 border border-black/10 z-10 my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/10 shrink-0">
          <div>
            <h3 className="font-bold text-lg text-ink font-display">
              {product ? "Edit Equipment Item" : "Create Fire Safety Product"}
            </h3>
            <p className="text-xs text-steel">Configure catalog item, pricing, specifications, and media</p>
          </div>
          <button onClick={onClose} className="text-steel hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-black/10 gap-4 mt-3 shrink-0">
          {[
            { id: "general", label: "General" },
            { id: "pricing", label: "Pricing & Stock" },
            { id: "specs", label: "Specs & Hazards" },
            { id: "media", label: "Images & Datasheet" },
            { id: "status", label: "Visibility" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-brand text-brand"
                  : "border-transparent text-steel hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium">
              {error}
            </div>
          )}

          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-3.5">
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. SafePro 4kg ABC Fire Extinguisher"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={SKU}
                    onChange={(e) => setSKU(e.target.value)}
                    placeholder="e.g. AK-EXT-ABC-4KG"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs uppercase focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Category *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Subcategory</label>
                  <input
                    type="text"
                    list="subcategory-list"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g. ABC Dry Powder"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                  <datalist id="subcategory-list">
                    {selectedCategory?.subcategories?.map((s) => (
                      <option key={s.slug} value={s.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. SafePro, Ceasefire"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="One sentence summary for catalog listings..."
                  className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">
                  Full Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product write-up, BIS conformity, extinguishing agent composition, suitable locations..."
                  className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & INVENTORY */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">
                    Standard Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">
                    Discounted / Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discountPrice}
                    onChange={(e) =>
                      setDiscountPrice(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="Leave empty if no discount"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Selling Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="piece, set, kg"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPECS & HAZARDS */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Capacity</label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 4 kg, 9 Litres, 30 Meters"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Weight</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 6.8 kg"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
              </div>

              {/* Fire Classes selector */}
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1.5">
                  Fire Hazard Classes
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Class A",
                    "Class B",
                    "Class C",
                    "Class D",
                    "Class K / Cooking Oil",
                    "Electrical",
                    "Hydrant Systems",
                    "Detection",
                    "Alarm Panels",
                    "Safety Signage",
                  ].map((fc) => (
                    <button
                      type="button"
                      key={fc}
                      onClick={() => handleAddFireClass(fc)}
                      className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                        fireClasses.includes(fc)
                          ? "bg-brand text-white border-brand font-semibold"
                          : "bg-paper text-ink border-black/10 hover:bg-gray-200"
                      }`}
                    >
                      {fc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Features list */}
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Key Features</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="e.g. Clear pressure gauge with green safe zone"
                    className="flex-1 px-3 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 bg-paper hover:bg-gray-200 border border-black/10 rounded text-xs font-semibold"
                  >
                    Add Feature
                  </button>
                </div>
                <div className="space-y-1">
                  {features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-2.5 py-1 bg-paper rounded text-xs"
                    >
                      <span>• {f}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(i)}
                        className="text-steel hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications Key-Value table */}
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">
                  Technical Specifications
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Key (e.g. Test Pressure)"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    className="col-span-2 px-3 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 35 bar)"
                    value={specVal}
                    onChange={(e) => setSpecVal(e.target.value)}
                    className="col-span-2 px-3 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3 py-1.5 bg-paper hover:bg-gray-200 border border-black/10 rounded text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {specifications.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-2.5 py-1 bg-paper rounded text-xs"
                    >
                      <span>
                        <strong>{s.key}:</strong> {s.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(i)}
                        className="text-steel hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA & DATASHEET */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Product Images</label>

                {/* Upload File Input */}
                <div className="flex items-center gap-3 p-3 bg-paper border border-dashed border-black/20 rounded mb-3">
                  <label className="cursor-pointer px-3 py-1.5 bg-white border border-black/10 rounded text-xs font-semibold text-ink hover:bg-gray-50 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-steel">or paste image URL below</span>
                  {isUploading && <Loader2 className="w-4 h-4 animate-spin text-brand ml-auto" />}
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-paper hover:bg-gray-200 border border-black/10 rounded text-xs font-semibold"
                  >
                    Add URL
                  </button>
                </div>

                {/* Image List */}
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative border rounded p-1 bg-paper flex flex-col items-center justify-between ${
                        img.isPrimary ? "border-brand ring-2 ring-brand/30" : "border-black/10"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt="Product preview"
                        className="w-full h-20 object-contain rounded"
                      />
                      <div className="flex items-center justify-between w-full pt-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className={`font-semibold ${
                            img.isPrimary ? "text-brand" : "text-steel hover:text-ink"
                          }`}
                        >
                          {img.isPrimary ? "Primary" : "Make Primary"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Datasheet Upload */}
              <div className="pt-4 border-t border-black/10">
                <label className="block text-xs font-semibold text-ink/80 mb-1">
                  Technical Datasheet (PDF)
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-paper border border-black/10 rounded text-xs font-semibold text-ink hover:bg-gray-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Upload PDF Datasheet
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleDatasheetUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    value={datasheet}
                    onChange={(e) => setDatasheet(e.target.value)}
                    placeholder="or enter PDF URL directly"
                    className="flex-1 px-3 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                {datasheet && (
                  <p className="text-xs text-green-700 truncate">Datasheet URL: {datasheet}</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: VISIBILITY & STATUS */}
          {activeTab === "status" && (
            <div className="space-y-4 pt-2">
              <label className="flex items-center gap-3 p-3 bg-paper rounded border border-black/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4"
                />
                <div>
                  <p className="text-xs font-bold text-ink">Active in Catalog</p>
                  <p className="text-[11px] text-steel">Visible for purchase and quoting</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-paper rounded border border-black/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4"
                />
                <div>
                  <p className="text-xs font-bold text-ink">Featured Product</p>
                  <p className="text-[11px] text-steel">
                    Highlighted on the homepage and at the top of category pages
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-paper rounded border border-black/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4"
                />
                <div>
                  <p className="text-xs font-bold text-ink">Best Seller Badge</p>
                  <p className="text-[11px] text-steel">
                    Displays high-demand badge to increase conversion
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex justify-end gap-2 pt-4 border-t border-black/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-black/10 rounded text-xs font-medium hover:bg-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {product ? "Save Equipment" : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
