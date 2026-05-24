/**
 * Category Utility
 * Strategic classification logic for companies
 *
 * Four-pillar classification:
 *   1. Tech Giants       — Mega-cap platform / infrastructure companies
 *   2. Product Companies  — Product-led / SaaS / R&D software companies
 *   3. Service Companies  — IT services, consulting, outsourcing
 *   4. Startups / Scale-ups — Venture-backed, unicorns, high-growth
 */

export const STRATEGIC_CATEGORIES = [
  { id: "tech-giants", label: "Tech Giants", icon: "💎", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  { id: "product-companies", label: "Product Companies", icon: "🚀", color: "text-blue-600 bg-blue-50 border-blue-100" },
  { id: "service-companies", label: "Service Companies", icon: "🛠️", color: "text-slate-600 bg-slate-50 border-slate-100" },
  { id: "startups", label: "Startups / Scale-ups", icon: "⚡", color: "text-amber-600 bg-amber-50 border-amber-100" },
];

// ---------------------------------------------------------------------------
// Canonical name sets — used for deterministic first-pass matching
// ---------------------------------------------------------------------------

const TECH_GIANT_NAMES = new Set([
  "google", "alphabet", "microsoft", "amazon", "apple", "meta",
  "nvidia", "netflix", "intel", "ibm", "oracle", "samsung",
  "qualcomm", "broadcom", "cisco", "dell", "hp", "hewlett",
  "uber", "airbnb",
]);

const PRODUCT_COMPANY_NAMES = new Set([
  "adobe", "atlassian", "salesforce", "zoho", "freshworks",
  "servicenow", "shopify", "intuit", "workday", "twilio",
  "datadog", "snowflake", "palantir", "stripe", "hubspot",
  "notion", "figma", "canva", "slack", "dropbox",
  "vmware", "sap", "paypal", "square", "block",
  "autodesk", "splunk", "elastic", "mongodb", "confluent",
  "cloudera", "teradata", "thoughtspot", "postman",
]);

const SERVICE_COMPANY_NAMES = new Set([
  "tcs", "infosys", "wipro", "cognizant", "accenture",
  "capgemini", "deloitte", "ey", "ernst", "kpmg", "pwc",
  "hcl", "tech mahindra", "mphasis", "mindtree", "ltimindtree",
  "lti", "l&t infotech", "hexaware", "cyient", "persistent",
  "birlasoft", "zensar", "coforge", "niit", "sonata",
  "atos", "dxc", "genpact", "mu sigma",
  "jpmorgan", "goldman", "morgan stanley", "hsbc", "barclays",
  "deutsche bank", "citi", "citibank", "ubs", "credit suisse",
  "wells fargo", "bank of america",
]);

const STARTUP_NAMES = new Set([
  "byju", "swiggy", "zomato", "razorpay", "cred",
  "paytm", "phonepe", "groww", "zerodha", "meesho",
  "unacademy", "ola", "rapido", "dunzo", "lenskart",
  "nykaa", "dream11", "mpl", "udaan", "slice",
  "jar", "khatabook", "dailyhunt", "sharechat", "verse",
  "instamojo", "darwinbox", "leadsquared", "yellowai", "yellow.ai",
  "jupitermoney", "jupiter", "fi", "open", "smallcase",
  "delhivery", "shiprocket", "moglix", "ofbusiness",
  "spinny", "park+", "cars24", "urban company", "urbanclap",
  "practo", "pharmeasy", "1mg", "cult.fit", "cure.fit",
]);

// ---------------------------------------------------------------------------
// Category / nature keyword patterns
// ---------------------------------------------------------------------------

const SERVICE_CATEGORY_KEYWORDS = [
  "service", "consulting", "outsourcing", "transformation",
  "gcc", "global capability", "staff augmentation", "bpo",
  "managed service", "it solutions",
];

const STARTUP_CATEGORY_KEYWORDS = [
  "startup", "scale-up", "scaleup", "unicorn",
  "seed", "series a", "series b", "series c",
  "pre-revenue", "early stage", "growth stage",
  "venture", "vc-backed",
];

const PRODUCT_CATEGORY_KEYWORDS = [
  "product", "saas", "platform", "cloud",
  "deep-tech", "deeptech", "software",
];

// ---------------------------------------------------------------------------
// Heuristic helpers
// ---------------------------------------------------------------------------

function nameMatches(name: string, dict: Set<string>): boolean {
  for (const entry of dict) {
    if (name.includes(entry)) return true;
  }
  return false;
}

function keywordsMatch(text: string, keywords: string[]): boolean {
  return keywords.some(kw => text.includes(kw));
}

/**
 * Parse employee size string to approximate headcount.
 * Returns 0 if indeterminate.
 */
function parseEmployeeSize(raw: string | null | undefined): number {
  if (!raw) return 0;
  const s = String(raw).replace(/,/g, "").toLowerCase();
  // Handle range patterns like "10001-50000" or "50000+"
  const rangeMatch = s.match(/(\d+)\s*[-–to]+\s*(\d+)/);
  if (rangeMatch) return (parseInt(rangeMatch[1], 10) + parseInt(rangeMatch[2], 10)) / 2;
  const singleMatch = s.match(/(\d+)/);
  if (singleMatch) return parseInt(singleMatch[1], 10);
  return 0;
}

// ---------------------------------------------------------------------------
// Main classifier
// ---------------------------------------------------------------------------

export function getStrategicCategory(company: any) {
  const name = String(company.name ?? "").toLowerCase().trim();
  const cat = String(company.category ?? "").toLowerCase();
  const tier = String(company.company_tier ?? "").toLowerCase();
  const nature = String(company.nature_of_company ?? "").toLowerCase();
  const empSize = parseEmployeeSize(company.employee_size);

  // ── Pass 1: Deterministic name matching (highest confidence) ──────────

  if (nameMatches(name, TECH_GIANT_NAMES)) return findCat("tech-giants");
  if (nameMatches(name, SERVICE_COMPANY_NAMES)) return findCat("service-companies");
  if (nameMatches(name, STARTUP_NAMES)) return findCat("startups");
  if (nameMatches(name, PRODUCT_COMPANY_NAMES)) return findCat("product-companies");

  // ── Pass 2: Category / nature field keywords ──────────────────────────

  const combined = `${cat} ${nature} ${tier}`;

  if (keywordsMatch(combined, SERVICE_CATEGORY_KEYWORDS)) return findCat("service-companies");
  if (keywordsMatch(combined, STARTUP_CATEGORY_KEYWORDS)) return findCat("startups");
  if (keywordsMatch(combined, PRODUCT_CATEGORY_KEYWORDS)) return findCat("product-companies");

  // ── Pass 3: Tier-based inference ──────────────────────────────────────

  if (tier.includes("marquee") || tier.includes("tier 1")) {
    // Large marquee companies with big employee bases → likely service or tech giant
    if (empSize > 50000) return findCat("tech-giants");
    return findCat("product-companies");
  }

  // ── Pass 4: Employee size heuristic (last resort) ─────────────────────

  if (empSize > 100000) return findCat("tech-giants");
  if (empSize > 10000) return findCat("service-companies");
  if (empSize > 0 && empSize < 2000) return findCat("startups");

  // ── Default: Product Companies ─────────────────────────────────────────
  return findCat("product-companies");
}

// Helper to avoid repetitive find calls - with safety guard
function findCat(id: string) {
  const category = STRATEGIC_CATEGORIES.find(c => c.id === id);
  if (!category) {
    console.error(`[FAIL] Strategic category not found for id: "${id}". Returning default category.`);
    // Return default category instead of undefined
    return STRATEGIC_CATEGORIES[1]; // Product Companies as default
  }
  return category;
}
