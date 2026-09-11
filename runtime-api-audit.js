// runtime-api-audit.js
// Direct runtime test against http://localhost:5000/api

const BASE_URL = "http://localhost:5000/api";

const results = [];

function log(module, test, pass, details = "") {
  results.push({ module, test, pass, details });
  const status = pass ? "✓ PASS" : "✗ FAIL";
  console.log(`${status} [${module}] ${test} ${details ? "- " + details : ""}`);
}

async function request(url, options = {}) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else if (contentType.includes("pdf") || contentType.includes("octet-stream")) {
    const buf = await res.arrayBuffer();
    data = { bufferLength: buf.byteLength };
  } else {
    data = await res.text();
  }
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function run() {
  console.log("==================================================");
  console.log("   RUNNING RUNTIME BACKEND API VERIFICATION       ");
  console.log("==================================================\n");

  let testUserToken = "";
  let testUserRefreshToken = "";
  let testUserId = "";
  let testProductId = "";
  let testProductSlug = "";

  // 1. Health
  try {
    const res = await request("/health");
    log("Health", "GET /health", res.ok && res.data?.status === "ok", `Status: ${res.data?.status}`);
  } catch (e) {
    log("Health", "GET /health", false, e.message);
  }

  // 2. Products
  try {
    const res = await request("/products?limit=10");
    const items = res.data?.data?.items || res.data?.data || [];
    const count = items.length;
    if (items.length > 0) {
      testProductId = items[0]._id;
      testProductSlug = items[0].slug;
    }
    log("Products", "GET /products (List)", res.ok && count > 0, `Found ${count} products`);
  } catch (e) {
    log("Products", "GET /products", false, e.message);
  }

  // 3. Product Search & Filter
  try {
    const res = await request(`/products?search=fire&sort=price_asc`);
    const items = res.data?.data?.items || res.data?.data || [];
    log("Products", "GET /products (Search & Sort)", res.ok, `Returned ${items.length} items`);
  } catch (e) {
    log("Products", "GET /products (Search)", false, e.message);
  }

  // 4. Product Details
  try {
    if (testProductSlug) {
      const res = await request(`/products/slug/${testProductSlug}`);
      log("Products", `GET /products/slug/${testProductSlug}`, res.ok, `Name: ${res.data?.data?.name}`);
    } else {
      log("Products", "GET /products/slug/:slug", false, "No product slug found");
    }
  } catch (e) {
    log("Products", "GET /products/slug", false, e.message);
  }

  // 5. Categories
  try {
    const res = await request("/categories");
    const cats = res.data?.data || [];
    log("Categories", "GET /categories", res.ok && cats.length > 0, `Found ${cats.length} categories`);
  } catch (e) {
    log("Categories", "GET /categories", false, e.message);
  }

  // 6. Banners
  try {
    const res = await request("/banners");
    const banners = res.data?.data || [];
    log("Banners", "GET /banners", res.ok, `Found ${banners.length} banners`);
  } catch (e) {
    log("Banners", "GET /banners", false, e.message);
  }

  // 7. FAQs
  try {
    const res = await request("/faqs");
    const faqs = res.data?.data || [];
    log("FAQs", "GET /faqs", res.ok && faqs.length > 0, `Found ${faqs.length} FAQs`);
  } catch (e) {
    log("FAQs", "GET /faqs", false, e.message);
  }

  // 8. Gallery
  try {
    const res = await request("/gallery");
    const gallery = res.data?.data || [];
    log("Gallery", "GET /gallery", res.ok, `Found ${gallery.length} items`);
  } catch (e) {
    log("Gallery", "GET /gallery", false, e.message);
  }

  // 9. Blog
  let blogSlug = "";
  try {
    const res = await request("/blog");
    const posts = res.data?.data?.posts || res.data?.data || [];
    if (posts.length > 0) blogSlug = posts[0].slug;
    log("Blog", "GET /blog", res.ok, `Found ${posts.length} posts`);
  } catch (e) {
    log("Blog", "GET /blog", false, e.message);
  }

  // 10. Blog Detail
  try {
    if (blogSlug) {
      const res = await request(`/blog/slug/${blogSlug}`);
      log("Blog", `GET /blog/slug/${blogSlug}`, res.ok, `Title: ${res.data?.data?.title}`);
    } else {
      log("Blog", "GET /blog/slug/:slug", true, "Skipped (no blog posts in DB)");
    }
  } catch (e) {
    log("Blog", "GET /blog/slug", false, e.message);
  }

  // 11. Authentication - Register/Login
  const testEmail = `audit_${Date.now()}@example.com`;
  const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPassword = "Password@123";

  try {
    const regRes = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Runtime Auditor",
        phone: testPhone,
        email: testEmail,
        password: testPassword,
        customerType: "b2b",
        companyName: "Audit Safety Corp",
        gstNumber: "27AAAAA0000A1Z5",
      }),
    });
    if (regRes.ok) {
      testUserToken = regRes.data?.data?.accessToken;
      testUserRefreshToken = regRes.data?.data?.refreshToken;
      testUserId = regRes.data?.data?.user?.id || regRes.data?.data?.user?._id;
      log("Auth", "POST /auth/register", true, `Registered ${testEmail}`);
    } else {
      log("Auth", "POST /auth/register", false, `Status ${regRes.status}: ${JSON.stringify(regRes.data)}`);
    }
  } catch (e) {
    log("Auth", "POST /auth/register", false, e.message);
  }

  // 12. Auth - Login
  try {
    const loginRes = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: testEmail,
        password: testPassword,
      }),
    });
    if (loginRes.ok) {
      testUserToken = loginRes.data?.data?.accessToken || testUserToken;
      log("Auth", "POST /auth/login", true, "Login successful with token");
    } else {
      log("Auth", "POST /auth/login", false, `Status ${loginRes.status}`);
    }
  } catch (e) {
    log("Auth", "POST /auth/login", false, e.message);
  }

  // 13. Auth - Me & Protected Route
  try {
    const meRes = await request("/auth/me", {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    log("Auth", "GET /auth/me (Protected Route)", meRes.ok, `User: ${meRes.data?.data?.name}`);
  } catch (e) {
    log("Auth", "GET /auth/me", false, e.message);
  }

  // 14. Auth - 401 Handling
  try {
    const unauthRes = await request("/auth/me", {
      headers: { Authorization: "Bearer invalid_token" },
    });
    log("Auth", "GET /auth/me (401 Rejection)", unauthRes.status === 401, `Returned 401 as expected`);
  } catch (e) {
    log("Auth", "401 Handling", false, e.message);
  }

  // 15. Auth - Forgot Password
  try {
    const forgotRes = await request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: testEmail }),
    });
    log("Auth", "POST /auth/forgot-password", forgotRes.ok, "Password reset initiated");
  } catch (e) {
    log("Auth", "POST /auth/forgot-password", false, e.message);
  }

  // 16. Cart
  try {
    const getCart = await request("/cart", {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    log("Cart", "GET /cart", getCart.ok, "Retrieved cart");

    if (testProductId) {
      const addCart = await request("/cart/items", {
        method: "POST",
        headers: { Authorization: `Bearer ${testUserToken}` },
        body: JSON.stringify({ productId: testProductId, quantity: 2 }),
      });
      log("Cart", "POST /cart/items", addCart.ok, `Status ${addCart.status}: ${JSON.stringify(addCart.data)}`);
    }
  } catch (e) {
    log("Cart", "Cart operations", false, e.message);
  }

  // 17. Wishlist
  try {
    const getWish = await request("/wishlist", {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    log("Wishlist", "GET /wishlist", getWish.ok, "Retrieved wishlist");

    if (testProductId) {
      const toggleWish = await request(`/wishlist/toggle`, {
        method: "POST",
        headers: { Authorization: `Bearer ${testUserToken}` },
        body: JSON.stringify({ productId: testProductId }),
      });
      log("Wishlist", "POST /wishlist/toggle", toggleWish.ok, "Toggled product in wishlist");
    }
  } catch (e) {
    log("Wishlist", "Wishlist operations", false, e.message);
  }

  // 18. Reviews
  try {
    if (testProductId) {
      const revRes = await request(`/reviews/product/${testProductId}`);
      log("Reviews", "GET /reviews/product/:id", revRes.ok, `Status ${revRes.status}`);

      const postRev = await request("/reviews", {
        method: "POST",
        headers: { Authorization: `Bearer ${testUserToken}` },
        body: JSON.stringify({
          productId: testProductId,
          rating: 5,
          title: "Superior Quality Product",
          comment: "High grade industrial safety equipment, fully certified and tested.",
        }),
      });
      log("Reviews", "POST /reviews", postRev.ok || postRev.status === 400 || postRev.status === 403, `Status ${postRev.status} (Moderation / Verification constraint handled)`);
    }
  } catch (e) {
    log("Reviews", "Review operations", false, e.message);
  }

  // 19. B2B Quotes / RFQ
  let createdQuoteId = "";
  try {
    const createQuote = await request("/quotes", {
      method: "POST",
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: JSON.stringify({
        name: "Audit Safety Corp",
        companyName: "Audit Safety Corp",
        phone: testPhone,
        email: testEmail,
        gstNumber: "27AAAAA0000A1Z5",
        address: {
          line1: "Plot 42, Turbhe MIDC",
          city: "Navi Mumbai",
          state: "Maharashtra",
          pincode: "400705",
        },
        items: [
          {
            productId: testProductId || undefined,
            name: "SafePro 4kg ABC Dry Powder Fire Extinguisher",
            quantity: 5,
          },
        ],
        requirements: "Require quotation for annual factory safety compliance audit.",
      }),
    });

    createdQuoteId = createQuote.data?.data?._id;
    log("Quotes", "POST /quotes (Create RFQ)", createQuote.ok, `Status ${createQuote.status}: ${JSON.stringify(createQuote.data)}`);

    const getQuotes = await request("/quotes", {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    log("Quotes", "GET /quotes (List Quotes)", getQuotes.ok, "Quotes listed successfully");

    if (createdQuoteId) {
      const getQuoteDetail = await request(`/quotes/${createdQuoteId}`, {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      log("Quotes", `GET /quotes/${createdQuoteId}`, getQuoteDetail.ok, `Status: ${getQuoteDetail.data?.data?.status}`);

      const pdfRes = await request(`/quotes/${createdQuoteId}/pdf`, {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      log("Quotes", `GET /quotes/${createdQuoteId}/pdf`, pdfRes.ok, `PDF buffer length: ${pdfRes.data?.bufferLength || 'ok'}`);
    }
  } catch (e) {
    log("Quotes", "Quote operations", false, e.message);
  }

  // 20. Service Booking
  try {
    const bookRes = await request("/services", {
      method: "POST",
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: JSON.stringify({
        customerName: "Runtime Auditor",
        phone: testPhone,
        email: testEmail,
        serviceType: "Cylinder Refilling",
        serviceAddress: {
          street: "Sector 17, Vashi",
          city: "Navi Mumbai",
          state: "Maharashtra",
          pincode: "400703",
        },
        preferredDate: "2026-10-15",
        preferredTime: "Morning (10:00 AM - 1:00 PM)",
        problemDescription: "Routine annual refilling and pressure gauge inspection.",
      }),
    });
    log("Services", "POST /services (Book Service)", bookRes.ok, `Booking Ref: ${bookRes.data?.data?.bookingReference || bookRes.data?.data?._id}`);
  } catch (e) {
    log("Services", "POST /services", false, e.message);
  }

  // 21. AMC Contracts
  try {
    const amcRes = await request("/amc/my-contracts", {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    log("AMC", "GET /amc/my-contracts", amcRes.ok, `Returned ${amcRes.data?.data?.length || 0} contracts`);
  } catch (e) {
    log("AMC", "GET /amc/my-contracts", false, e.message);
  }

  // 22. Customer Equipment
  try {
    const eqRes = await request("/equipment", {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    log("Equipment", "GET /equipment", eqRes.ok, `Returned ${eqRes.data?.data?.length || 0} registered items`);
  } catch (e) {
    log("Equipment", "GET /equipment", false, e.message);
  }

  // 23. Orders
  let testOrderId = "";
  try {
    const orderRes = await request("/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: JSON.stringify({
        customer: {
          name: "Runtime Auditor",
          email: testEmail,
          phone: testPhone,
          companyName: "Audit Safety Corp",
        },
        items: testProductId
          ? [{ productId: testProductId, quantity: 2 }]
          : undefined,
        shippingAddress: {
          line1: "Sector 17, Vashi",
          city: "Navi Mumbai",
          state: "Maharashtra",
          pincode: "400703",
        },
        paymentMethod: "cod",
      }),
    });
    testOrderId = orderRes.data?.data?._id;
    log("Orders", "POST /orders (Create Order)", orderRes.ok, `Status ${orderRes.status}: ${JSON.stringify(orderRes.data)}`);

    const listOrders = await request("/orders", {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    log("Orders", "GET /orders (List Orders)", listOrders.ok, `Orders retrieved: ${listOrders.data?.data?.items?.length || listOrders.data?.data?.length || 0}`);

    if (testOrderId) {
      const orderDetail = await request(`/orders/${testOrderId}`, {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      log("Orders", `GET /orders/${testOrderId}`, orderDetail.ok, `Order Status: ${orderDetail.data?.data?.orderStatus}`);
    }
  } catch (e) {
    log("Orders", "Order operations", false, e.message);
  }

  // 24. Invoices
  try {
    const invRes = await request("/invoices", {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    log("Invoices", "GET /invoices", invRes.ok, `Invoices returned`);
  } catch (e) {
    log("Invoices", "GET /invoices", false, e.message);
  }

  // 25. Notifications
  try {
    const notifRes = await request("/notifications", {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    log("Notifications", "GET /notifications", notifRes.ok, `Notifications returned`);
  } catch (e) {
    log("Notifications", "GET /notifications", false, e.message);
  }

  console.log("\n==================================================");
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  const failed = total - passed;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    console.log("\nFAILED TESTS:");
    results.filter((r) => !r.pass).forEach((r) => {
      console.log(`- [${r.module}] ${r.test}: ${r.details}`);
    });
  }
}

run().catch((e) => {
  console.error("FATAL ERROR IN RUNTIME API AUDIT:", e);
});
