// Seeds Admin, Demo Staff, Fire Safety Categories, and Catalog Products.
// Run with: npm run seed (after MONGODB_URI is set in .env)
import { connectDB, disconnectDB } from "../config/db";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const SEED_CATEGORIES = [
  {
    name: "Fire Extinguishers",
    slug: "fire-extinguishers",
    description: "ISI-marked portable and wheeled fire extinguishers for Class A, B, C, D, and electrical hazards.",
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80",
    sortOrder: 1,
    subcategories: [
      { name: "ABC Dry Powder", slug: "abc-powder", description: "Multi-purpose powder extinguishers for solid, liquid, and gas fires" },
      { name: "CO2 Extinguishers", slug: "co2-type", description: "Carbon dioxide gas extinguishers for electrical fires and server rooms" },
      { name: "Clean Agent", slug: "clean-agent", description: "Residue-free clean agent extinguishers for data centers and delicate electronics" },
      { name: "Water & Foam", slug: "water-foam", description: "AFFF foam and pressurized water extinguishers for fabric, paper, and fuel fires" },
      { name: "Wet Chemical", slug: "wet-chemical", description: "Class K kitchen extinguishers for commercial deep fat fryers and cooking oils" },
    ],
  },
  {
    name: "Gas Cylinders",
    slug: "gas-cylinders",
    description: "Certified high-pressure seamless gas cylinders for industrial, medical, and fire suppression applications.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    sortOrder: 2,
    subcategories: [
      { name: "CO2 Gas Cylinders", slug: "co2-cylinder", description: "Liquid CO2 cylinders for beverage, industrial, and firefighting use" },
      { name: "Nitrogen Cylinders", slug: "nitrogen", description: "High-pressure nitrogen gas cylinders for pressurization and purging" },
      { name: "Industrial Oxygen", slug: "industrial-oxygen", description: "High-purity industrial oxygen cylinders for welding and cutting" },
      { name: "Argon Cylinders", slug: "argon", description: "Shielding gas cylinders for fabrication and research applications" },
    ],
  },
  {
    name: "Fire Hydrant Systems",
    slug: "fire-hydrant-systems",
    description: "Complete water-based firefighting distribution systems, landing valves, hose reels, and branch pipes.",
    image: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80",
    sortOrder: 3,
    subcategories: [
      { name: "Landing Valves", slug: "landing-valves", description: "Oblique and bib-nose landing valves conforming to IS 5290" },
      { name: "Fire Hose Reels", slug: "hose-reels", description: "High-pressure swinging hose reel drums conforming to IS 884" },
      { name: "Branch Pipes & Nozzles", slug: "branch-pipes", description: "Gunmetal and aluminium alloy water delivery nozzles" },
      { name: "Hydrant Pumps", slug: "hydrant-pumps", description: "Main, jockey, and diesel engine-driven fire pumps" },
    ],
  },
  {
    name: "Fire Suppression Systems",
    slug: "fire-suppression-systems",
    description: "Automatic gas, water-mist, and foam flooding systems for server rooms, panels, and commercial kitchens.",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
    sortOrder: 4,
    subcategories: [
      { name: "FM-200 Clean Agent", slug: "fm-200", description: "HFC-227ea total flooding systems for high-value asset protection" },
      { name: "Novec 1230 Systems", slug: "novec-1230", description: "Eco-friendly sustainable clean agent fire protection systems" },
      { name: "CO2 Total Flooding", slug: "co2-flooding", description: "High-pressure CO2 suppression systems for unmanned enclosures" },
      { name: "Kitchen Hood Suppression", slug: "kitchen-hood", description: "UL-300 compliant automatic wet chemical fire suppression for restaurants" },
    ],
  },
  {
    name: "Smoke Detectors",
    slug: "smoke-detectors",
    description: "Early-warning photoelectric, ionization, thermal, and multi-criteria fire detection devices.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    sortOrder: 5,
    subcategories: [
      { name: "Optical Smoke Detectors", slug: "optical-smoke", description: "Photoelectric sensors for smoldering and flaming fires" },
      { name: "Heat Detectors", slug: "heat-detectors", description: "Fixed temperature and rate-of-rise thermal sensors" },
      { name: "Multi-Sensor Detectors", slug: "multi-sensor", description: "Combined optical and thermal sensors for false-alarm immunity" },
      { name: "Beam Detectors", slug: "beam-detectors", description: "Reflective projected beam detectors for high-ceiling warehouses" },
    ],
  },
  {
    name: "Fire Alarm Panels",
    slug: "fire-alarm-panels",
    description: "Conventional and analogue addressable fire alarm control panels, manual call points, and strobes.",
    image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=600&q=80",
    sortOrder: 6,
    subcategories: [
      { name: "Conventional Panels", slug: "conventional-panels", description: "2, 4, and 8 zone standalone fire alarm control panels" },
      { name: "Addressable Panels", slug: "addressable-panels", description: "Loop-based intelligent panels with exact device localization" },
      { name: "Manual Call Points", slug: "call-points", description: "Resettable and break-glass emergency activation stations" },
      { name: "Hooters & Strobes", slug: "sounders-hooters", description: "High-decibel audible and visual flash alarms" },
    ],
  },
  {
    name: "Fire Safety Accessories",
    slug: "fire-safety-accessories",
    description: "Essential life safety products, escape equipment, emergency lighting, and photoluminescent signages.",
    image: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=600&q=80",
    sortOrder: 7,
    subcategories: [
      { name: "Fire Blankets", slug: "fire-blankets", description: "Heavy-duty woven fibreglass blankets for smothering small fires" },
      { name: "Emergency Exit Lights", slug: "emergency-lights", description: "Battery-backed LED illuminated directional escape signages" },
      { name: "Fireman Axe & Gear", slug: "fireman-axe-gear", description: "Insulated axes, heat-resistant suits, gloves, and breathing apparatus" },
      { name: "Safety Signage", slug: "safety-signage", description: "IS-compliant glow-in-the-dark fire route and equipment signs" },
    ],
  },
  {
    name: "AMC & Refilling",
    slug: "amc-and-refilling",
    description: "Certified fire safety maintenance contracts, periodic inspection visits, and hydro-testing refill services.",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
    sortOrder: 8,
    subcategories: [
      { name: "Annual Maintenance", slug: "annual-maintenance", description: "Comprehensive and non-comprehensive AMC packages for premises" },
      { name: "Refilling Services", slug: "refilling-services", description: "On-site and workshop certified gas and chemical refilling" },
      { name: "Hydro Testing", slug: "hydro-testing", description: "Hydraulic pressure testing with digital certificate for cylinder fitness" },
    ],
  },
];

async function seed() {
  await connectDB();

  // 1. Admin & Demo staff
  const existingAdmin = await User.findOne({ email: env.SEED_ADMIN_EMAIL });
  if (!existingAdmin) {
    await User.create({
      name: env.SEED_ADMIN_NAME,
      email: env.SEED_ADMIN_EMAIL,
      phone: "9999999999",
      passwordHash: env.SEED_ADMIN_PASSWORD,
      role: "super_admin",
      customerType: "corporate",
      isEmailVerified: true,
    });
    logger.info(`Created super_admin account: ${env.SEED_ADMIN_EMAIL}`);
  }

  const demoStaff = [
    { role: "sales", email: "sales.demo@akfiresafety.example", phone: "9999999001" },
    { role: "technician", email: "technician.demo@akfiresafety.example", phone: "9999999002" },
    { role: "accountant", email: "accountant.demo@akfiresafety.example", phone: "9999999003" },
  ];

  for (const staff of demoStaff) {
    const found = await User.findOne({ email: staff.email });
    if (!found) {
      await User.create({
        name: `Demo ${staff.role[0].toUpperCase()}${staff.role.slice(1)}`,
        email: staff.email,
        phone: staff.phone,
        passwordHash: "ChangeMe123!",
        role: staff.role,
        isEmailVerified: true,
      });
      logger.info(`Created demo ${staff.role} account: ${staff.email}`);
    }
  }

  // 2. Seed Categories
  const categoryMap = new Map<string, string>();
  for (const catData of SEED_CATEGORIES) {
    let cat = await Category.findOne({ slug: catData.slug });
    if (!cat) {
      cat = await Category.create(catData);
      logger.info(`Created category: ${cat.name}`);
    } else {
      cat.name = catData.name;
      cat.description = catData.description;
      cat.image = catData.image;
      cat.subcategories = catData.subcategories as any;
      cat.sortOrder = catData.sortOrder;
      await cat.save();
    }
    categoryMap.set(cat.slug, cat._id.toString());
  }

  // 3. Seed Products
  const productsToSeed = [
    {
      name: "SafePro 4kg ABC Dry Powder Fire Extinguisher (IS 15683)",
      slug: "safepro-4kg-abc-powder-extinguisher",
      SKU: "AK-EXT-ABC-4KG",
      categorySlug: "fire-extinguishers",
      subcategory: "ABC Dry Powder",
      brand: "SafePro",
      description: "Heavy-duty stored pressure ABC dry powder fire extinguisher filled with siliconized mono-ammonium phosphate powder (MAP 50%). Ideal for commercial offices, apartments, retail stores, and warehouse facilities. Conforms strictly to BIS code IS 15683:2018.",
      shortDescription: "ISI-certified 4kg stored pressure ABC extinguisher suitable for Class A, B, C, and electrical fires.",
      price: 2450,
      discountPrice: 2150,
      stock: 48,
      lowStockThreshold: 10,
      minimumOrderQuantity: 1,
      unit: "piece",
      capacity: "4 kg",
      weight: "6.8 kg",
      fireClass: ["Class A", "Class B", "Class C", "Electrical"],
      modelNumber: "SP-ABC-40",
      specifications: [
        { key: "Propellant", value: "Dry Nitrogen Gas (15 bar)" },
        { key: "Discharge Time", value: "> 13 seconds" },
        { key: "Effective Range", value: "2 to 4 meters" },
        { key: "Test Pressure", value: "35 bar" },
        { key: "Operating Temperature", value: "-30°C to +60°C" },
        { key: "Cylinder Material", value: "Cold Rolled Steel (IS 513)" },
      ],
      features: [
        "ISI marked conforming to IS 15683",
        "High-grade brass squeeze grip release valve",
        "Clear pressure gauge with green safe zone",
        "EPDM synthetic rubber discharge hose",
        "Heavy-duty wall mounting bracket included",
      ],
      certifications: ["ISI Marked (IS 15683)", "CE Certified", "ISO 9001:2015"],
      images: [
        { url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80", isPrimary: true },
      ],
      isFeatured: true,
      isBestSeller: true,
      isActive: true,
    },
    {
      name: "SafePro 6kg ABC Stored Pressure Fire Extinguisher (IS 15683)",
      slug: "safepro-6kg-abc-powder-extinguisher",
      SKU: "AK-EXT-ABC-6KG",
      categorySlug: "fire-extinguishers",
      subcategory: "ABC Dry Powder",
      brand: "SafePro",
      description: "High-capacity 6kg ABC powder fire extinguisher designed for factories, workshops, commercial complexes, and parking basements. Delivers superior fire extinguishing performance on solid combustibles, flammable liquids, and pressurized gas leaks.",
      shortDescription: "6kg multipurpose ABC dry chemical extinguisher for industrial and commercial environments.",
      price: 3200,
      discountPrice: 2850,
      stock: 35,
      lowStockThreshold: 8,
      minimumOrderQuantity: 1,
      unit: "piece",
      capacity: "6 kg",
      weight: "9.6 kg",
      fireClass: ["Class A", "Class B", "Class C", "Electrical"],
      modelNumber: "SP-ABC-60",
      specifications: [
        { key: "Propellant", value: "Dry Nitrogen Gas (15 bar)" },
        { key: "Discharge Time", value: "> 18 seconds" },
        { key: "Effective Range", value: "3 to 6 meters" },
        { key: "Test Pressure", value: "35 bar" },
        { key: "Operating Temperature", value: "-30°C to +60°C" },
      ],
      features: [
        "Corrosion-resistant epoxy powder coating",
        "Controlled squeeze lever discharge",
        "Large diameter pressure gauge",
        "Supplied with factory test certificate",
      ],
      certifications: ["ISI Marked (IS 15683)", "ISO 9001:2015"],
      images: [
        { url: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80", isPrimary: true },
      ],
      isFeatured: true,
      isBestSeller: true,
      isActive: true,
    },
    {
      name: "FireShield 4.5kg CO2 Portable Fire Extinguisher (IS 2878)",
      slug: "fireshield-4-5kg-co2-extinguisher",
      SKU: "AK-EXT-CO2-45KG",
      categorySlug: "fire-extinguishers",
      subcategory: "CO2 Extinguishers",
      brand: "FireShield",
      description: "Seamless manganese steel body CO2 fire extinguisher filled with pure Carbon Dioxide gas. Leaves absolutely zero chemical residue, making it the preferred safety device for IT server rooms, electrical distribution boards, telecom shelters, and laboratories.",
      shortDescription: "Clean, non-conductive 4.5kg CO2 gas extinguisher for electrical panels and server equipment.",
      price: 5800,
      discountPrice: 5200,
      stock: 22,
      lowStockThreshold: 5,
      minimumOrderQuantity: 1,
      unit: "piece",
      capacity: "4.5 kg",
      weight: "14.2 kg",
      fireClass: ["Class B", "Class C", "Electrical"],
      modelNumber: "FS-CO2-45",
      specifications: [
        { key: "Working Pressure", value: "150 bar at 15°C" },
        { key: "Test Pressure", value: "250 bar" },
        { key: "Discharge Time", value: "> 15 seconds" },
        { key: "Cylinder Standard", value: "IS 7285 Seamless Steel" },
        { key: "Discharge Horn", value: "Non-conductive swivel horn" },
      ],
      features: [
        "Leaves zero residue, harmless to sensitive electronics",
        "Forged brass wheel/squeeze valve with safety burst disc",
        "Electrostatic powder coated deep red cylinder",
        "Supplied filled with 99.9% pure CO2 gas",
      ],
      certifications: ["ISI Marked (IS 2878)", "PESO Approved Cylinder", "CE Certified"],
      images: [
        { url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80", isPrimary: true },
      ],
      isFeatured: true,
      isBestSeller: false,
      isActive: true,
    },
    {
      name: "SafePro 2kg Clean Agent HFC-236fa Fire Extinguisher",
      slug: "safepro-2kg-clean-agent-extinguisher",
      SKU: "AK-EXT-CLEAN-2KG",
      categorySlug: "fire-extinguishers",
      subcategory: "Clean Agent",
      brand: "SafePro",
      description: "Eco-friendly zero-ozone-depletion clean agent fire extinguisher using certified FE-36 / HFC-236fa gas. Non-corrosive, electrically non-conductive, and non-thermal shock inducing. Ideal for CNC machines, MRI rooms, broadcasting studios, and critical data hubs.",
      shortDescription: "Premium zero-residue clean agent extinguisher for expensive electronics and sensitive machinery.",
      price: 7400,
      discountPrice: 6900,
      stock: 14,
      lowStockThreshold: 4,
      minimumOrderQuantity: 1,
      unit: "piece",
      capacity: "2 kg",
      weight: "3.9 kg",
      fireClass: ["Class A", "Class B", "Class C", "Electrical"],
      modelNumber: "SP-CA-20",
      specifications: [
        { key: "Gas Type", value: "HFC-236fa Clean Agent" },
        { key: "Propellant", value: "Nitrogen" },
        { key: "Discharge Duration", value: "10 to 14 seconds" },
        { key: "Operating Temperature", value: "-20°C to +55°C" },
      ],
      features: [
        "Total residue-free rapid extinguishing",
        "Safe for occupied indoor rooms",
        "Extremely low toxicity",
        "Stainless steel handle and release pin",
      ],
      certifications: ["ISO 9001:2015", "CE Compliant"],
      images: [
        { url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80", isPrimary: true },
      ],
      isFeatured: false,
      isBestSeller: false,
      isActive: true,
    },
    {
      name: "SafePro 9 Litre Mechanical Foam (AFFF) Fire Extinguisher (IS 10204)",
      slug: "safepro-9l-foam-afff-extinguisher",
      SKU: "AK-EXT-FOAM-9L",
      categorySlug: "fire-extinguishers",
      subcategory: "Water & Foam",
      brand: "SafePro",
      description: "Aqueous Film Forming Foam (AFFF 6%) stored pressure extinguisher. Creates a blanketing film on petrol, diesel, paints, and flammable solvents that cuts off oxygen and prevents reignition.",
      shortDescription: "9 Litre AFFF mechanical foam extinguisher specifically designed for oil and petrol fires.",
      price: 3600,
      discountPrice: 3200,
      stock: 19,
      lowStockThreshold: 5,
      minimumOrderQuantity: 1,
      unit: "piece",
      capacity: "9 Litres",
      weight: "13.5 kg",
      fireClass: ["Class A", "Class B"],
      modelNumber: "SP-FOAM-90",
      specifications: [
        { key: "Agent", value: "Aqueous Film Forming Foam (AFFF 6%)" },
        { key: "Discharge Range", value: "4 to 7 meters" },
        { key: "Discharge Time", value: "> 25 seconds" },
        { key: "Internal Lining", value: "Thermoplastic powder lined anti-corrosive" },
      ],
      features: [
        "Forms oxygen-sealing foam blanket over fuel surfaces",
        "Aspirating air induction nozzle",
        "Anti-corrosion internal polymer coating",
      ],
      certifications: ["ISI Marked (IS 10204)", "ISO 9001:2015"],
      images: [
        { url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80", isPrimary: true },
      ],
      isFeatured: false,
      isBestSeller: false,
      isActive: true,
    },
    {
      name: "47 Litre Seamless Industrial CO2 Gas Cylinder",
      slug: "47l-seamless-industrial-co2-gas-cylinder",
      SKU: "AK-CYL-CO2-47L",
      categorySlug: "gas-cylinders",
      subcategory: "CO2 Gas Cylinders",
      brand: "Bharat Cylinders",
      description: "High-grade alloy steel seamless cylinder rated for 150 bar working pressure and 250 bar hydraulic test pressure. Suitable for CO2 manifold systems, industrial welding, and total flooding bank modules. PESO certified with inspection test ring.",
      shortDescription: "47 Litre capacity seamless high pressure CO2 cylinder with PESO certification.",
      price: 14500,
      discountPrice: 13200,
      stock: 12,
      lowStockThreshold: 3,
      minimumOrderQuantity: 1,
      unit: "piece",
      capacity: "47 Litres",
      weight: "52 kg (empty)",
      fireClass: ["Industrial Gas"],
      modelNumber: "BC-CO2-47",
      specifications: [
        { key: "Water Capacity", value: "47 Litres" },
        { key: "Gas Capacity", value: "Approx. 30 kg liquid CO2" },
        { key: "Working Pressure", value: "150 bar" },
        { key: "Test Pressure", value: "250 bar" },
        { key: "Standard", value: "IS 7285 Part 2" },
      ],
      features: [
        "Certified by Petroleum and Explosives Safety Organization (PESO)",
        "Includes heavy-duty brass valve with safety relief disc",
        "Supplied with valve protection guard collar",
      ],
      certifications: ["PESO Approved", "IS 7285", "CCOE Certificate"],
      images: [
        { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80", isPrimary: true },
      ],
      isFeatured: false,
      isBestSeller: false,
      isActive: true,
    },
    {
      name: "Single Landing Valve 63mm Oblique Type (IS 5290)",
      slug: "single-landing-valve-63mm-oblique-is5290",
      SKU: "AK-HYD-VALVE-63",
      categorySlug: "fire-hydrant-systems",
      subcategory: "Landing Valves",
      brand: "Kanex Hydrants",
      description: "Gunmetal IS 318 Grade LTB-2 single outlet oblique landing valve with 63mm instantaneous female coupling and 80mm NB flanged inlet. Tested to 21 kgf/cm² hydraulic pressure for wet riser fire hydrant installations.",
      shortDescription: "IS 5290 Type A 63mm gunmetal landing valve for wet and dry riser hydrant systems.",
      price: 4950,
      discountPrice: 4450,
      stock: 28,
      lowStockThreshold: 6,
      minimumOrderQuantity: 1,
      unit: "piece",
      capacity: "900 LPM @ 7 kg/cm²",
      weight: "7.8 kg",
      fireClass: ["Hydrant Systems"],
      modelNumber: "KH-LV-63A",
      specifications: [
        { key: "Material", value: "Leaded Tin Bronze / Gunmetal (IS 318 LTB2)" },
        { key: "Inlet", value: "80mm NB Flanged BS 10 Table D" },
        { key: "Outlet", value: "63mm Instantaneous Female (IS 903)" },
        { key: "Test Pressure", value: "21 kgf/cm² (Seat & Body)" },
        { key: "Handwheel", value: "Cast Iron epoxy red finish" },
      ],
      features: [
        "Conforms to IS 5290 Type A",
        "Includes blank cap with brass retaining chain",
        "Smooth rotating non-jamming spindle",
      ],
      certifications: ["ISI Marked (IS 5290)", "TAC Approved"],
      images: [
        { url: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80", isPrimary: true },
      ],
      isFeatured: true,
      isBestSeller: false,
      isActive: true,
    },
    {
      name: "30m Heavy-Duty Swinging Type Fire Hose Reel Drum (IS 884)",
      slug: "30m-swinging-fire-hose-reel-drum-is884",
      SKU: "AK-HYD-REEL-30M",
      categorySlug: "fire-hydrant-systems",
      subcategory: "Fire Hose Reels",
      brand: "Kanex Hydrants",
      description: "Wall-mounted 180° swinging hose reel drum complete with 30 meters of 20mm semi-rigid braided thermoplastic hose (IS 12585) and rotary shut-off jet/spray fog nozzle. Provides immediate first-aid firefighting water supply.",
      shortDescription: "Complete 30m swinging hose reel drum with shut-off nozzle conforming to IS 884.",
      price: 6800,
      discountPrice: 6100,
      stock: 18,
      lowStockThreshold: 4,
      minimumOrderQuantity: 1,
      unit: "set",
      capacity: "30 meters",
      weight: "18.5 kg",
      fireClass: ["Hydrant Systems"],
      modelNumber: "KH-HR-30S",
      specifications: [
        { key: "Hose Length", value: "30 Meters (20mm internal dia)" },
        { key: "Hose Standard", value: "IS 12585 Type 2" },
        { key: "Working Pressure", value: "12 kgf/cm²" },
        { key: "Burst Pressure", value: "42 kgf/cm²" },
        { key: "Rotation", value: "180 Degree Swinging Arm" },
      ],
      features: [
        "Mild steel sides with phosphate pre-treatment and red powder coating",
        "Dual-function jet/spray rotary brass nozzle",
        "Includes wall swivel mounting bracket and ball valve",
      ],
      certifications: ["ISI Marked (IS 884)", "ISO 9001:2015"],
      images: [
        { url: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80", isPrimary: true },
      ],
      isFeatured: false,
      isBestSeller: true,
      isActive: true,
    },
    {
      name: "SafeGuard Optical Photoelectric Smoke Detector (IS 11360)",
      slug: "safeguard-optical-photoelectric-smoke-detector",
      SKU: "AK-DET-OPT-01",
      categorySlug: "smoke-detectors",
      subcategory: "Optical Smoke Detectors",
      brand: "SafeGuard",
      description: "Microcontroller-based intelligent optical smoke sensor utilizing infrared scattering technology. Features chamber drift compensation, bug screen protection, 360° visible dual alarm LEDs, and low quiescent current draw.",
      shortDescription: "Reliable photoelectric smoke detector with 360-degree LED indication and false alarm filtering.",
      price: 850,
      discountPrice: 720,
      stock: 140,
      lowStockThreshold: 25,
      minimumOrderQuantity: 2,
      unit: "piece",
      capacity: "Up to 50 sq. meters coverage",
      weight: "130 g",
      fireClass: ["Detection"],
      modelNumber: "SG-OPD-10",
      specifications: [
        { key: "Operating Voltage", value: "9V - 33V DC" },
        { key: "Standby Current", value: "< 45 uA" },
        { key: "Alarm Current", value: "35 mA @ 24V" },
        { key: "Coverage Area", value: "50 sq. meters (ceiling height < 6m)" },
        { key: "Response Time", value: "< 5 seconds" },
      ],
      features: [
        "Advanced optical sensing chamber immune to ambient light",
        "Fine mesh insect barrier screen",
        "Compatible with all 2-wire and 4-wire conventional fire alarm panels",
        "Twist-lock base with anti-tamper locking tab",
      ],
      certifications: ["IS 11360", "EN 54-7", "CE Certified"],
      images: [
        { url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80", isPrimary: true },
      ],
      isFeatured: true,
      isBestSeller: true,
      isActive: true,
    },
    {
      name: "4-Zone Microprocessor Conventional Fire Alarm Panel",
      slug: "4-zone-microprocessor-fire-alarm-panel",
      SKU: "AK-PANEL-CONV-4Z",
      categorySlug: "fire-alarm-panels",
      subcategory: "Conventional Panels",
      brand: "SafeGuard",
      description: "4-zone standalone fire alarm control panel with built-in battery charger, individual zone disable and test functions, open/short circuit fault monitoring, and twin sounder outputs. Features an intuitive front LED diagnostic mimic display.",
      shortDescription: "Compact 4-zone conventional fire alarm control panel for shops, clinics, and offices.",
      price: 7200,
      discountPrice: 6500,
      stock: 15,
      lowStockThreshold: 4,
      minimumOrderQuantity: 1,
      unit: "set",
      capacity: "Up to 25 detectors per zone",
      weight: "5.4 kg",
      fireClass: ["Alarm Panels"],
      modelNumber: "SG-FACP-04Z",
      specifications: [
        { key: "Input Voltage", value: "220V AC ± 10%, 50 Hz" },
        { key: "Zone Capacity", value: "4 Zones (up to 25 detectors/MCPs per zone)" },
        { key: "Sounder Outputs", value: "2 Monitored Outputs (24V DC, 1A total)" },
        { key: "Battery Backup", value: "Space for 2 x 12V 7Ah SMF Batteries" },
        { key: "Relay Outputs", value: "Fire Relay & Fault Relay Form C (1A, 30V DC)" },
      ],
      features: [
        "Full zone short circuit and open loop fault diagnostic",
        "One-man walk test mode for easy periodic maintenance",
        "Keylock access control preventing unauthorized operation",
        "Heavy gauge sheet steel enclosure with powder coating",
      ],
      certifications: ["IS 2189", "CE Certified", "ISO 9001:2015"],
      images: [
        { url: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=800&q=80", isPrimary: true },
      ],
      isFeatured: true,
      isBestSeller: false,
      isActive: true,
    },
    {
      name: "Heavy-Duty Fibreglass Fire Blanket 1.8m x 1.8m (EN 1869)",
      slug: "heavy-duty-fibreglass-fire-blanket-1-8m",
      SKU: "AK-ACC-BLANKET-18",
      categorySlug: "fire-safety-accessories",
      subcategory: "Fire Blankets",
      brand: "FireShield",
      description: "Quick-release woven fibreglass fire blanket resistant to temperatures up to 550°C. Instantly smothers pan fires, clothing fires, and laboratory bench flare-ups by cutting off oxygen supply.",
      shortDescription: "1.8m x 1.8m woven fiberglass fire blanket in quick-release wall pack conforming to EN 1869.",
      price: 1150,
      discountPrice: 950,
      stock: 65,
      lowStockThreshold: 15,
      minimumOrderQuantity: 1,
      unit: "piece",
      capacity: "1.8 x 1.8 meters",
      weight: "950 g",
      fireClass: ["Class A", "Class F / Cooking Oil"],
      modelNumber: "FS-FB-1818",
      specifications: [
        { key: "Dimensions", value: "1.8m x 1.8m (6ft x 6ft)" },
        { key: "Material", value: "100% Woven E-Glass Fibreglass Fabric" },
        { key: "Continuous Temperature", value: "Up to 550°C" },
        { key: "Casing", value: "Quick-pull wall mountable soft PVC pack" },
      ],
      features: [
        "Emergency instant dual-pull release straps",
        "Requires zero maintenance or refills",
        "Effective for clothing fires and domestic/commercial kitchen grease fires",
      ],
      certifications: ["EN 1869:2019", "CE Certified"],
      images: [
        { url: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=800&q=80", isPrimary: true },
      ],
      isFeatured: false,
      isBestSeller: true,
      isActive: true,
    },
    {
      name: "Photoluminescent Glow-in-Dark Fire Exit Safety Signage Set",
      slug: "photoluminescent-glow-in-dark-exit-signage-set",
      SKU: "AK-ACC-SIGN-PACK",
      categorySlug: "fire-safety-accessories",
      subcategory: "Safety Signage",
      brand: "SafePro",
      description: "Pack of 6 essential photoluminescent safety signages including Fire Exit Running Man, Fire Extinguisher Locator, and Hydrant Point signs. Charges automatically under ambient light and glows brightly for up to 6 hours during power failure.",
      shortDescription: "Pack of 6 glow-in-the-dark fire safety and exit signages for buildings and offices.",
      price: 1450,
      discountPrice: 1250,
      stock: 40,
      lowStockThreshold: 10,
      minimumOrderQuantity: 1,
      unit: "pack",
      capacity: "6 Signs per pack (150mm x 300mm)",
      weight: "800 g",
      fireClass: ["Safety Signage"],
      modelNumber: "SP-SIGN-06",
      specifications: [
        { key: "Material", value: "High Intensity Photoluminescent Rigid PVC Sheet" },
        { key: "Luminance Duration", value: "> 6 Hours in complete darkness" },
        { key: "Dimensions", value: "150mm x 300mm each" },
        { key: "Mounting", value: "Pre-applied 3M heavy duty self-adhesive tape" },
      ],
      features: [
        "Conforms to ISO 7010 international safety graphic standards",
        "Weatherproof, UV resistant, and non-toxic",
        "Zero electrical power or batteries required",
      ],
      certifications: ["ISO 7010", "IS 9457", "CE"],
      images: [
        { url: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=800&q=80", isPrimary: true },
      ],
      isFeatured: false,
      isBestSeller: false,
      isActive: true,
    },
  ];

  for (const p of productsToSeed) {
    const catId = categoryMap.get(p.categorySlug);
    if (!catId) continue;

    let product = await Product.findOne({ SKU: p.SKU });
    const productPayload = {
      name: p.name,
      slug: p.slug,
      SKU: p.SKU,
      category: catId,
      subcategory: p.subcategory,
      brand: p.brand,
      description: p.description,
      shortDescription: p.shortDescription,
      price: p.price,
      discountPrice: p.discountPrice,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      minimumOrderQuantity: p.minimumOrderQuantity,
      unit: p.unit,
      capacity: p.capacity,
      weight: p.weight,
      fireClass: p.fireClass,
      modelNumber: p.modelNumber,
      specifications: p.specifications,
      features: p.features,
      certifications: p.certifications,
      images: p.images,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isActive: p.isActive,
    };

    if (!product) {
      product = await Product.create(productPayload);
      logger.info(`Created product: [${p.SKU}] ${p.name}`);
    } else {
      Object.assign(product, productPayload);
      await product.save();
    }
  }

  logger.info("Database seeding completed successfully with 8 categories and 12 products.");
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  logger.error("Seed failed", err);
  process.exit(1);
});
