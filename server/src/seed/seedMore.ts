// server/src/seed/seedMore.ts
import { connectDB, disconnectDB } from "../config/db";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Banner } from "../models/Banner";
import { FAQ } from "../models/FAQ";
import { BlogPost } from "../models/BlogPost";
import { Gallery } from "../models/Gallery";
import { CustomerEquipment } from "../models/CustomerEquipment";
import { AMCContract } from "../models/AMCContract";
import { logger } from "../utils/logger";

async function seedMore() {
  await connectDB();

  // Find super_admin or create demo user for blog/equipment relations
  let admin = await User.findOne({ role: "super_admin" });
  if (!admin) {
    admin = await User.findOne({});
  }

  // 1. Seed Banners
  const banners = [
    {
      title: "Government-Approved Fire Safety Solutions in Navi Mumbai",
      subtitle: "Category 'A' Licensed Agency providing ISI-certified fire protection systems, statutory audits, and emergency response.",
      image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1600&q=80",
      link: "/products",
      buttonText: "Explore Equipment",
      position: "home_hero",
      sortOrder: 1,
      isActive: true,
    },
    {
      title: "Annual Maintenance Contracts (AMC) with Form B Compliance",
      subtitle: "Preventive inspections, on-site pressure tests, and guaranteed statutory Form B certification under Maharashtra Fire Prevention Act.",
      image: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1600&q=80",
      link: "/services/amc",
      buttonText: "Get AMC Proposal",
      position: "home_hero",
      sortOrder: 2,
      isActive: true,
    },
    {
      title: "Instant On-Site Cylinder Refilling & Hydro-Testing",
      subtitle: "Quick-turnaround refilling with genuine MAP 50 powder, pure CO2 gas, and certified hydraulic pressure testing certificates.",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80",
      link: "/services/refilling",
      buttonText: "Book Refill Service",
      position: "home_middle",
      sortOrder: 1,
      isActive: true,
    },
  ];

  for (const b of banners) {
    const exists = await Banner.findOne({ title: b.title });
    if (!exists) {
      await Banner.create(b);
      logger.info(`Created banner: ${b.title}`);
    }
  }

  // 2. Seed FAQs
  const faqs = [
    {
      question: "How frequently should fire extinguishers be inspected and refilled?",
      answer: "Under Indian Standard IS 2190:2024, stored pressure fire extinguishers require a monthly visual inspection, an annual thorough maintenance check by a licensed agency, and hydraulic pressure testing every 3 to 5 years depending on the cylinder type.",
      category: "Maintenance",
      sortOrder: 1,
      isActive: true,
    },
    {
      question: "What is Form B certification and why is it mandatory in Maharashtra?",
      answer: "Form B is a statutory compliance certificate issued by a licensed agency under Section 3(1) of the Maharashtra Fire Prevention and Life Safety Measures Act, 2006. It certifies that the fire prevention and protection systems in your building are in good working order. It must be submitted bi-annually (January and July) to the local fire authority.",
      category: "Compliance",
      sortOrder: 2,
      isActive: true,
    },
    {
      question: "What is covered under an Annual Maintenance Contract (AMC)?",
      answer: "Our comprehensive AMC covers quarterly preventive inspections, checking gauge pressures, servicing hose reels and landing valves, emergency breakdown assistance within 2 hours, testing alarm panels and detectors, and statutory Form B bi-annual issuance.",
      category: "AMC",
      sortOrder: 3,
      isActive: true,
    },
    {
      question: "Which fire extinguisher should be used for electrical panel fires?",
      answer: "Carbon Dioxide (CO2) or Clean Agent (HFC-236fa) fire extinguishers must be used for electrical fires. They are electrically non-conductive and leave zero corrosive chemical residue, protecting critical IT and power infrastructure.",
      category: "Products",
      sortOrder: 4,
      isActive: true,
    },
    {
      question: "Do you provide on-site hydro testing for gas cylinders?",
      answer: "Yes, our certified mobile testing unit and licensed workshop in Turbhe MIDC provide hydraulic pressure testing up to 250 bar with PESO and BIS compliant digital test certificates.",
      category: "Services",
      sortOrder: 5,
      isActive: true,
    },
    {
      question: "How can my company request an official B2B quotation or RFQ?",
      answer: "You can submit an online RFQ directly through our B2B Quotation page. Select equipment, enter your required quantities, provide your GSTIN and site address, and our engineering desk will dispatch an official PDF proposal within 2 hours.",
      category: "General",
      sortOrder: 6,
      isActive: true,
    },
  ];

  for (const f of faqs) {
    const exists = await FAQ.findOne({ question: f.question });
    if (!exists) {
      await FAQ.create(f);
      logger.info(`Created FAQ: ${f.question}`);
    }
  }

  // 3. Seed Blog Posts
  const authorId = admin?._id;
  const authorName = admin?.name || "AK Fire Safety Technical Desk";

  const posts = [
    {
      title: "Understanding IS 2190:2024: Selection and Maintenance of Fire Extinguishers",
      slug: "understanding-is-2190-2024-selection-maintenance-fire-extinguishers",
      excerpt: "A complete practical overview of the updated BIS standards governing portable fire extinguishers, inspection intervals, and testing protocols in commercial buildings.",
      content: `### Introduction to IS 2190:2024

The Bureau of Indian Standards (BIS) revised standard IS 2190 lays down stringent requirements for the selection, installation, and maintenance of first-aid fire extinguishers in residential, commercial, and industrial occupancies across India.

### Key Classifications Covered
- **Class A:** Solid carbonaceous materials (paper, wood, textiles).
- **Class B:** Flammable liquids and solvents (petrol, diesel, paints).
- **Class C:** Flammable gases (LPG, CNG, acetylene).
- **Class D:** Combustible metals (magnesium, sodium, aluminium).
- **Electrical Hazards:** Live electrical equipment requiring non-conductive agents.

### Mandatory Maintenance Schedule
1. **Monthly Visual Check:** Ensure pressure gauge needle is firmly in the green zone, safety seal and pin are intact, and nozzle is unobstructed.
2. **Annual Servicing:** Discharge testing, internal examination for corrosion, valve greasing, and weight verification.
3. **Hydraulic Pressure Test:** Stored pressure cylinders must undergo pressure testing at the intervals specified in IS 2190.`,
      featuredImage: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1200&q=80",
      author: { id: authorId, name: authorName, role: "Chief Safety Officer" },
      category: "Compliance & Standards",
      tags: ["IS 2190", "Extinguishers", "BIS Standards", "Fire Safety"],
      seoTitle: "IS 2190:2024 Fire Extinguisher Selection & Maintenance Guide",
      seoDescription: "Learn everything about the updated IS 2190:2024 guidelines for fire extinguisher maintenance, testing intervals, and Indian compliance standards.",
      readTime: 6,
      status: "published" as const,
      publishedAt: new Date(),
      viewCount: 142,
    },
    {
      title: "Navigating Maharashtra Fire Act & Form B Bi-Annual Compliance",
      slug: "navigating-maharashtra-fire-act-form-b-compliance",
      excerpt: "Step-by-step compliance roadmap for building secretaries, facility managers, and factory owners in Mumbai and Navi Mumbai under the Maharashtra Fire Act 2006.",
      content: `### Statutory Mandate
Under Section 3(1) of the Maharashtra Fire Prevention and Life Safety Measures Act, 2006, the owner or occupier of every building must maintain fire prevention and life safety systems in efficient working condition at all times.

### Submission Timeline
- **First Half:** Form B must be obtained and submitted in **January** covering January to June.
- **Second Half:** Form B must be submitted in **July** covering July to December.

### Verification Criteria by Licensed Agency
A Category 'A' Licensed Agency must conduct on-site tests:
- Running hydrant main and jockey pumps under load.
- Smoke detector functional activation with test smoke.
- Hose reel pressure test at 7 bar minimum.
- Inspection of emergency exit staircases and signage.`,
      featuredImage: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=80",
      author: { id: authorId, name: authorName, role: "Statutory Auditor" },
      category: "Legal & Regulatory",
      tags: ["Form B", "Maharashtra Fire Act", "Navi Mumbai Fire Brigade", "AMC"],
      seoTitle: "Form B Compliance Guide: Maharashtra Fire Safety Act",
      seoDescription: "How to obtain Form B fire safety certificate in Navi Mumbai and Mumbai. Complete compliance checklist and licensed agency certification guidelines.",
      readTime: 5,
      status: "published" as const,
      publishedAt: new Date(Date.now() - 86400000 * 5),
      viewCount: 285,
    },
  ];

  for (const p of posts) {
    const exists = await BlogPost.findOne({ slug: p.slug });
    if (!exists) {
      await BlogPost.create(p);
      logger.info(`Created blog post: ${p.title}`);
    }
  }

  // 4. Seed Gallery Items
  const galleryItems = [
    {
      title: "Industrial Hydrant System at Turbhe MIDC",
      description: "Complete wet riser and hydrant pump room installation conforming to NBC 2016 Part 4.",
      imageUrl: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80",
      category: "installation" as const,
      tags: ["Hydrant", "Industrial", "Navi Mumbai"],
      sortOrder: 1,
      isActive: true,
    },
    {
      title: "Server Room FM-200 Clean Agent Flooding System",
      description: "Automatic clean agent suppression system installation in high-density data centre, Airoli.",
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
      category: "industrial" as const,
      tags: ["Suppression", "Clean Agent", "Data Center"],
      sortOrder: 2,
      isActive: true,
    },
    {
      title: "Annual Extinguisher Refill & Hydro-Testing Drive",
      description: "Batch hydraulic pressure testing and dry chemical refilling for a 20-storey commercial complex in Vashi.",
      imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
      category: "service" as const,
      tags: ["Refilling", "Hydro Test", "Extinguishers"],
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const g of galleryItems) {
    const exists = await Gallery.findOne({ title: g.title });
    if (!exists) {
      await Gallery.create(g);
      logger.info(`Created gallery item: ${g.title}`);
    }
  }

  // 5. Seed Customer Equipment and AMC for Demo Users
  const users = await User.find({ customerType: { $in: ["b2b", "corporate", "b2c"] } }).limit(5);
  const sampleProduct = await Product.findOne();

  for (const u of users) {
    const existingEquipment = await CustomerEquipment.findOne({ userId: u._id });
    if (!existingEquipment) {
      const now = new Date();
      await CustomerEquipment.create({
        userId: u._id,
        equipmentId: `EQ-${u._id.toString().slice(-4).toUpperCase()}-01`,
        name: "4kg ABC Dry Chemical Extinguisher",
        product: sampleProduct?._id,
        serialNumber: `AK-ABC-${Math.floor(100000 + Math.random() * 900000)}`,
        equipmentType: "Fire Extinguisher",
        capacity: "4 kg",
        location: "1st Floor Server Room Entrance",
        installationDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
        lastInspectionDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        lastRefillDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
        nextInspectionDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        nextRefillDate: new Date(now.getTime() + 185 * 24 * 60 * 60 * 1000),
        hydroTestDueDate: new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000),
        status: "Healthy",
        notes: "Pressure gauge in healthy green zone. Wall mounted at 1.2m elevation.",
      });
      logger.info(`Created sample customer equipment for user: ${u.email}`);
    }

    const existingAMC = await AMCContract.findOne({ userId: u._id });
    if (!existingAMC) {
      const now = new Date();
      await AMCContract.create({
        contractNumber: `AMC-${now.getFullYear()}-${u._id.toString().slice(-4).toUpperCase()}`,
        userId: u._id,
        clientName: u.name,
        companyName: u.companyName || "AK Safety Client",
        phone: u.phone,
        email: u.email,
        premisesType: "Commercial Office",
        location: "Sector 19, Vashi, Navi Mumbai",
        planName: "Comprehensive Annual Safety AMC",
        startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 275 * 24 * 60 * 60 * 1000),
        renewalDate: new Date(now.getTime() + 275 * 24 * 60 * 60 * 1000),
        frequency: "Quarterly",
        visitsPerYear: 4,
        visitsCompleted: 1,
        visitsScheduled: [
          {
            visitNumber: 1,
            scheduledDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
            completedDate: new Date(now.getTime() - 58 * 24 * 60 * 60 * 1000),
            status: "Completed",
            notes: "Quarterly extinguisher weight and hose check passed.",
          },
          {
            visitNumber: 2,
            scheduledDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            status: "Pending",
          },
        ],
        formBStatus: "Current",
        formBNumber: `FB-NMMC-${now.getFullYear()}-8492`,
        equipmentCount: 12,
        annualValue: 28500,
        status: "Active",
      });
      logger.info(`Created sample AMC contract for user: ${u.email}`);
    }
  }

  logger.info("seedMore completed successfully!");
  await disconnectDB();
  process.exit(0);
}

seedMore().catch((err) => {
  logger.error("seedMore failed", err);
  process.exit(1);
});
