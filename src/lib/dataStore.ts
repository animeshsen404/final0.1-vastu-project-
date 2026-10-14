import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_STORE_PATH = path.resolve(process.cwd(), 'data-store.json');

export interface StoredArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  categoryId: number | null;
  categoryName?: string;
  categorySlug?: string;
  authorId?: number;
  authorName?: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  metaTitle?: string;
  metaDescription?: string;
  readingTimeMinutes: number;
  viewsCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  topics?: Array<{ id: number; name: string; slug: string }>;
  keywords?: Array<{ id: number; name: string; slug: string }>;
}

export interface StoredTopic {
  id: number;
  name: string;
  slug: string;
  sanskritName: string;
  entityType: 'concept' | 'direction' | 'deity' | 'text' | 'remedy';
  summary: string;
  description?: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  metaTitle?: string;
  metaDescription?: string;
  displayOrder: number;
  articleCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredVideo {
  id: number;
  title: string;
  slug: string;
  videoUrl: string;
  videoProvider: 'youtube' | 'vimeo';
  videoPlatform?: 'youtube' | 'vimeo';
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
  description: string;
  duration?: string | null;
  instructor?: string | null;
  durationSeconds?: number;
  categoryId: number | null;
  categoryName?: string;
  categorySlug?: string;
  topicId?: number | null;
  topicName?: string;
  topicSlug?: string;
  status: 'draft' | 'published' | 'unpublished';
  displayOrder: number;
  viewCount: number;
  isFeatured: boolean;
  authorId?: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSiteSettings {
  id: number;
  primaryPhone: string;
  secondaryPhone: string | null;
  primaryEmail: string;
  consultationEmail: string | null;
  whatsappNumber: string | null;
  whatsappNotice: string | null;
  whatsappMessage?: string | null;
  telegramUrl?: string | null;
  telegramHandle?: string | null;
  consultationTimings: string | null;
  appointmentNotice: string | null;
  youtubeUrl: string | null;
  youtubeHandle: string | null;
  twitterUrl: string | null;
  twitterHandle: string | null;
  facebookUrl: string | null;
  facebookHandle: string | null;
  instagramUrl: string | null;
  instagramHandle: string | null;
  officeAddress: string | null;
  collaborationNotice: string | null;
  logoUrl: string | null;
  adsensePublisherId: string | null;
  adsenseEnabled: boolean;
  adsenseAutoAds: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoredUser {
  id: number;
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  role: 'admin' | 'editor' | 'viewer';
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredKeyword {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export interface StoredAd {
  id: number;
  title: string;
  imageUrl: string;
  destinationUrl: string;
  placement: string;
  adType: string;
  adSenseSlot?: string | null;
  adSenseFormat?: string;
  customHtml?: string | null;
  isActive: boolean;
  priority: number;
  startDate?: string | null;
  endDate?: string | null;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredMedia {
  id: number;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  altText: string;
  uploadedById?: number;
  createdAt: string;
}

export interface StoredAuditLog {
  id: number;
  userId?: number;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface StoredHandbook {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  targetAudience: string;
  pages: number;
  topics: string[];
  summary: string;
  pdfFileName?: string | null;
  pdfFilePath?: string | null;
  pdfFileSizeBytes?: number | null;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredHandbookLead {
  id: number;
  handbookId: string;
  handbookTitle: string;
  fullName?: string | null;
  email: string;
  phone: string;
  accessToken?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface DataStoreState {
  articles: StoredArticle[];
  topics: StoredTopic[];
  categories: StoredCategory[];
  videos: StoredVideo[];
  settings: StoredSiteSettings;
  users: StoredUser[];
  keywords: StoredKeyword[];
  ads: StoredAd[];
  media: StoredMedia[];
  auditLogs: StoredAuditLog[];
  handbooks: StoredHandbook[];
  handbookLeads: StoredHandbookLead[];
}

class PersistentDataStore {
  private state: DataStoreState;

  constructor() {
    this.state = this.loadInitialData();
  }

  private loadInitialData(): DataStoreState {
    if (fs.existsSync(DATA_STORE_PATH)) {
      try {
        const raw = fs.readFileSync(DATA_STORE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.articles && parsed.categories && parsed.settings) {
          if (!parsed.handbooks || !Array.isArray(parsed.handbooks) || parsed.handbooks.length === 0) {
            parsed.handbooks = this.generateInitialHandbooks();
            this.saveToDisk(parsed);
          }
          if (!parsed.handbookLeads || !Array.isArray(parsed.handbookLeads)) {
            parsed.handbookLeads = [];
            this.saveToDisk(parsed);
          }
          if (!parsed.ads || !Array.isArray(parsed.ads) || parsed.ads.length === 0) {
            parsed.ads = this.generateInitialAds();
            this.saveToDisk(parsed);
          } else if (!parsed.ads.some((a: any) => a.placement === 'ARTICLE_TOP')) {
            const initAds = this.generateInitialAds();
            const topAd = initAds.find((a) => a.placement === 'ARTICLE_TOP');
            if (topAd) {
              parsed.ads.push({
                ...topAd,
                id: Math.max(...parsed.ads.map((a: any) => a.id || 0), 0) + 1,
              });
              this.saveToDisk(parsed);
            }
          }
          if (parsed.topics && Array.isArray(parsed.topics) && parsed.topics.length < 9) {
            const fresh = this.generateInitialData();
            for (const ft of fresh.topics) {
              if (!parsed.topics.some((t: any) => t.slug === ft.slug)) {
                parsed.topics.push(ft);
              }
            }
            this.saveToDisk(parsed);
          }
          return parsed;
        }
      } catch (err) {
        console.warn('Error reading data-store.json, creating initial store:', err);
      }
    }

    const initial = this.generateInitialData();
    this.saveToDisk(initial);
    return initial;
  }

  private generateInitialData(): DataStoreState {
    const adminHash = bcrypt.hashSync('VastuAdmin2026!', 10);
    const scholarHash = bcrypt.hashSync('VastuScholar2026!', 10);
    const now = new Date().toISOString();

    const categories: StoredCategory[] = [
      {
        id: 1,
        name: 'Classical Vastu Vidya',
        slug: 'classical-vastu-vidya',
        description: 'Foundational canons and architectural principles from Samarāṅgaṇa Sūtradhāra, Mayamatam, and Mānasāra.',
        icon: 'BookOpen',
        metaTitle: 'Classical Vastu Vidya - Ancient Architectural Shastras',
        metaDescription: 'Explore canonical Vedic treatises, geometric proportions, and spatial harmonics from authentic manuscripts.',
        displayOrder: 1,
        articleCount: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: 'Spiritual Knowledge',
        slug: 'spiritual-knowledge',
        description: 'Cosmic energies, presiding deities (Devatas), and metaphysical laws governing the subtle field of dwellings.',
        icon: 'Sun',
        metaTitle: 'Spiritual Knowledge & Metaphysical Vastu',
        metaDescription: 'Deities, cosmic consciousness, and sacred orientation according to Vedic cosmology.',
        displayOrder: 2,
        articleCount: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        name: 'Architectural Harmony',
        slug: 'architectural-harmony',
        description: 'Harmonising structural engineering, natural light, cross-ventilation, and sacred geometry.',
        icon: 'Compass',
        metaTitle: 'Architectural Harmony & Natural Ventilation',
        metaDescription: 'How traditional courtyard systems and spatial orientation enhance modern building design.',
        displayOrder: 3,
        articleCount: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        name: 'Contemporary Space Solutions',
        slug: 'contemporary-space-solutions',
        description: 'Non-demolition remedies, urban apartments, corporate offices, and modern interior alignments.',
        icon: 'Building',
        metaTitle: 'Contemporary Space Solutions & Non-Demolition Vastu',
        metaDescription: 'Applying classical principles in modern urban apartments and commercial workspaces.',
        displayOrder: 4,
        articleCount: 2,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const topics: StoredTopic[] = [
      {
        id: 1,
        name: 'Vastu Purusha Mandala',
        slug: 'vastu-purusha-mandala',
        sanskritName: 'वास्तु पुरुष मण्डल',
        entityType: 'concept',
        summary: 'The sacred directional floor-plan grid (9x9 or 8x8 squares) used to map out rooms, sunlight, and energy zones in any home, flat, or plot.',
        description: 'The Vastu Purusha Mandala is the foundational floor-plan grid of classical architectural design. It divides any plot or apartment into 81 (Paramashayika) or 64 (Manduka) squares so that the kitchen, bedrooms, entrance, and open areas sit in harmony with morning sunlight, natural airflow, and magnetic directions.\n\nPractical Home Example: When an architect overlays a 9x9 grid on your flat floor plan, the center 9 squares form the Brahmasthana (open living space), the North-East squares mark the ideal prayer/study zone, and the South-East squares show the healthiest spot for cooking.',
        imageUrl: '/emblem-circle.png',
        metaTitle: 'Vastu Purusha Mandala - The Sacred Cosmic Grid',
        metaDescription: 'Simple explanation of the 81-grid Paramashayika and 64-grid Manduka mandalas in classical Vastu.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: 'Brahmasthana',
        slug: 'brahmasthana',
        sanskritName: 'ब्रह्मस्थान',
        entityType: 'concept',
        summary: 'The exact center of a house, flat, or plot. It represents the Space (Akasha) element and acts as the lungs of the home for light and fresh air.',
        description: 'In traditional Indian architecture, the Brahmasthana is kept open, clean, and free from heavy pillars, toilets, kitchens, or staircases. In traditional courtyard homes (Angana), it allows warm indoor air to rise and escape naturally.\n\nPractical Home Example: In a modern 2BHK or 3BHK flat, the Brahmasthana usually falls in the central living or dining hall. Keeping this central area clutter-free with a light fixture or simple rug instead of heavy storage cabinets keeps the entire home feeling spacious and peaceful.',
        imageUrl: '/hero-sanctuary.jpg',
        metaTitle: 'Brahmasthana - The Luminous Heart of Architecture',
        metaDescription: 'Why the central courtyard void acts as the energetic and ventilation center of Indian homes.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        name: 'Ishanya (North-East)',
        slug: 'ishanya-north-east',
        sanskritName: 'ईशान्य',
        entityType: 'direction',
        summary: 'The North-East corner of a home or plot, associated with the Water element (Jala), gentle morning sunlight, mental clarity, and spiritual peace.',
        description: 'Best suited for the prayer room (Puja Ghar), meditation corner, study room, living room windows, or underground water tank. Keep this zone light, clean, and well-lit.\n\nPractical Home Example: Opening windows in the North-East lets soft morning UV sunlight enter your home without harsh afternoon heat. Avoid placing a toilet, heavy store room, or septic tank in this corner.',
        imageUrl: '/heaven-portal.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        name: 'Agneya (South-East)',
        slug: 'agneya-south-east',
        sanskritName: 'आग्नेय',
        entityType: 'direction',
        summary: 'The South-East corner governed by the Fire element (Agni). It supports cooking, digestion, good health, and active daily energy.',
        description: 'The ideal zone for the kitchen stove, electrical main board, inverter, geyser, or boiler. Avoid underground water tanks or master bedrooms here.\n\nPractical Home Example: Placing your kitchen in the South-East ensures morning sunlight sanitizes the cooking counter while prevailing breezes carry cooking heat outward rather than into the living hall.',
        imageUrl: '/hero-sanctuary.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        name: 'Nairutya (South-West)',
        slug: 'nairutya-south-west',
        sanskritName: 'नैऋत्य',
        entityType: 'direction',
        summary: 'The South-West corner representing the Earth element (Prithvi). It gives stability, sound sleep, financial security, and family leadership.',
        description: 'Should ideally have thicker walls, higher elevation, and heavier furniture. Best location for the Master Bedroom, wardrobes, and safe lockers.\n\nPractical Home Example: In an Indian family home, giving the South-West bedroom to the head of the family promotes deep rest and emotional stability. Never dig an underground water sump or borewell in the South-West.',
        imageUrl: '/emblem-circle.png',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        name: 'Vayavya (North-West)',
        slug: 'vayavya-north-west',
        sanskritName: 'वायव्य',
        entityType: 'direction',
        summary: 'The North-West corner governed by the Air element (Vayu). It regulates airflow, movement, guest hospitality, and business circulation.',
        description: 'Ideal for the guest bedroom, children room, finished goods storage in offices, car parking, and ventilation shafts.\n\nPractical Home Example: If you run a business or shop, keeping ready-to-sell stock in the North-West helps goods move quickly. In a house, it makes a comfortable guest room or dining area.',
        imageUrl: '/heaven-portal.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 7,
        name: 'Ayadi Shadvarga',
        slug: 'ayadi-shadvarga',
        sanskritName: 'आयादि षड्वर्ग',
        entityType: 'concept',
        summary: 'A set of six classical Vastu proportion formulas used by architects to calculate harmonious length, breadth, and height of a house.',
        description: 'Checks that the room and building dimensions create positive acoustic and visual harmony (Aya = gain, Vyaya = expense, Yoni = orientation, Ayu = durability).\n\nPractical Home Example: When designing a new bungalow or temple room, architects adjust the room length-to-width ratio by a few inches so the room feels naturally balanced and proportionate.',
        imageUrl: '/palm-leaf-texture.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 8,
        name: 'Marma Sthana',
        slug: 'marma-sthana',
        sanskritName: 'मर्म स्थान',
        entityType: 'concept',
        summary: 'Sensitive energy junction points on the floor-plan grid—similar to vital pressure points in the human body.',
        description: 'Heavy RCC columns, nails, or deep drainage pipes should not pierce the primary Marma points in the center of the house.\n\nPractical Home Example: Before finalizing column positions with a civil engineer, checking the floor plan ensures no heavy pillar sits directly in the exact central point of the living room.',
        imageUrl: '/emblem-circle.png',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 9,
        name: 'Veedhi Shoola',
        slug: 'veedhi-shoola',
        sanskritName: 'वीथी शूल',
        entityType: 'remedy',
        summary: 'A T-junction or dead-end road pointing straight at a plot or house entrance (literally Road Spear).',
        description: 'Not all road thrusts are bad! A road coming from the North-East or East brings open light and positive flow, whereas a South-West or South-East road thrust needs a boundary wall and entrance offset.\n\nPractical Home Example: If your house sits at a T-junction, you do not need to panic or sell the house. Placing the main gate slightly to the side of the oncoming road and planting thick greenery blocks headlight glare and wind dust.',
        imageUrl: '/hero-sanctuary.jpg',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const articles: StoredArticle[] = [
      {
        id: 1,
        title: 'Understanding Before Remedies: Reclaiming Classical Vastu From Modern Superstition',
        slug: 'understanding-before-remedies',
        excerpt: 'Why installing commercial pyramids and yantras without understanding simple home physics creates fear rather than genuine peace—and how real Vastu actually works.',
        content: `## Why True Vastu Starts With Simple Understanding, Not Fear

In today's market, Vastu Shastra is often presented through fear. Homeowners and flat buyers are told that a small directional flaw will bring bad luck unless they buy expensive metal pyramids, hang dozens of mirrors, or break down strong walls.

At Vastu Ritam, our foundational rule is simple: "We do not begin with remedies. We begin with understanding." Classical texts like Mayamatam, Manasara, and Samarangana Sutradhara were written by master architects, town planners, and natural scientists. They studied how morning sunlight, wind flow, earth magnetism, and heat affect the human body inside a house.

> "When you understand WHY a room is placed in a particular direction, you stop fearing your home and start working with nature."

## The Real Logic Behind Common Vastu Rules

### 1. Why the Kitchen Belongs in the South-East (Agneya)
Morning sunlight comes from the East and North-East, carrying gentle ultraviolet rays that naturally keep water and living spaces fresh. By placing the kitchen in the South-East (Agneya), morning light sanitizes the cooking platform, while prevailing winds carry smoke and cooking heat away from the bedrooms and living hall.

### 2. Why the Master Bedroom Suits the South-West (Nairutya)
The South and South-West walls receive strong afternoon sunlight. Making these walls thicker or placing wardrobes along the South-West wall insulates the bedroom from harsh heat, creating a cool, quiet, and grounded space for deep family rest.

## Practical Home Checklist Before Buying Any Remedy

- Check Sunlight & Ventilation First: Is your North-East or East window blocked by heavy curtains or clutter? Open it to let natural daylight enter.
- Keep the Center (Brahmasthana) Light: Avoid piling heavy storage trunks or shoe racks in the middle of your flat.
- Balance Elements Naturally: If a kitchen is in the North or West in a rented flat, use clean ventilation, warm earthy stone colors under the stove, and proper lighting rather than panic demolition.`,
        featuredImage: '/hero-sanctuary.jpg',
        categoryId: 1,
        categoryName: 'Classical Vastu Vidya',
        categorySlug: 'classical-vastu-vidya',
        authorName: 'Vastu Ritam Research Desk',
        status: 'published',
        metaTitle: 'Understanding Before Remedies: Classical Vastu vs Superstition',
        metaDescription: 'Reclaiming authentic classical Vastu principles from fear-driven commercial remedies.',
        readingTimeMinutes: 7,
        viewsCount: 420,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
        topics: [
          { id: 1, name: 'Vastu Purusha Mandala', slug: 'vastu-purusha-mandala' },
          { id: 3, name: 'Ishanya (North-East)', slug: 'ishanya-north-east' },
          { id: 4, name: 'Agneya (South-East)', slug: 'agneya-south-east' },
        ],
      },
      {
        id: 2,
        title: 'The Brahmasthana: The Luminous Heart of Spatial Architecture',
        slug: 'the-brahmasthana-luminous-heart',
        excerpt: 'A beginner-friendly guide to the Brahmasthana (center of the home), explaining how traditional Indian courtyards keep homes cool, bright, and peaceful—and how to care for it in modern flats.',
        content: `## What is the Brahmasthana in a Home?

The Brahmasthana is the exact geometric center of any plot, bungalow, or apartment. In classical Vastu Shastra, it represents the Ether or Space element (Akasha Tattva)—the open breathing heart that connects all rooms of your household.

In traditional Indian homes—whether a Wada in Maharashtra, a Haveli in Rajasthan, or a Nalukettu in Kerala—this central zone was always kept open to the sky as an inner courtyard (Angana or Chowk).

> "Just as the navel and lungs circulate breath through the human body, an open Brahmasthana circulates fresh air and natural light to every corner of the house."

## The Simple Science of the Central Courtyard

Modern green-building science calls this the Thermal Stack Effect:

- During the day, warm indoor air naturally becomes lighter and rises upward through the central open zone.
- As warm air escapes from the top, cooler fresh air is gently pulled in through shaded windows in the North and East.
- Family members naturally gather around this bright, airy center, strengthening family communication and mental peace.

## How to Care for the Brahmasthana in a Modern Apartment

In city apartments, you cannot have an open-to-sky courtyard, but you can easily protect your home's Brahmasthana:

### 1. Keep the Center Floor Uncluttered
In most flats, the center falls in the living or dining room. Avoid placing massive sofas, heavy iron cupboards, or store-room partitions right in the middle of the floor plan.

### 2. Use Warm, Bright Lighting
If the center of your flat feels dim because of surrounding apartments, install a warm white ceiling light or crystal fixture to keep the central zone bright and welcoming.

### 3. Avoid Structural Punctures
When building a new house, instruct your architect and civil engineer not to place a heavy column, toilet, septic tank, or spiral staircase in the exact central 9 squares of the grid.`,
        featuredImage: '/heaven-portal.jpg',
        categoryId: 3,
        categoryName: 'Architectural Harmony',
        categorySlug: 'architectural-harmony',
        authorName: 'Ph.D. Research Scholar',
        status: 'published',
        metaTitle: 'The Brahmasthana: The Luminous Heart of Spatial Architecture',
        metaDescription: 'Thermodynamics, courtyard design, and cosmic center of classical dwellings.',
        readingTimeMinutes: 9,
        viewsCount: 310,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
        topics: [
          { id: 2, name: 'Brahmasthana', slug: 'brahmasthana' },
          { id: 8, name: 'Marma Sthana', slug: 'marma-sthana' },
        ],
      },
      {
        id: 3,
        title: 'The Geometry of the Mandala: The 81-Grid Paramashayika Explained',
        slug: 'the-geometry-of-the-mandala',
        excerpt: 'Learn how the 9x9 Vastu Purusha Mandala grid divides any home or plot into 81 clear energy squares to help you place entrances, bedrooms, and water tanks accurately.',
        content: `## What is the 81-Grid Paramashayika Mandala?

When planning a residential home, villa, or apartment building, classical Vastu architects divide the floor plan into 9 equal rows and 9 equal columns—creating 81 squares (Padas) known as the Paramashayika Mandala.

Think of this 81-square grid as an intelligent zoning map that tells you what each part of your house is naturally best suited for.

> "The Vastu Mandala is not a mysterious ritual chart—it is India's classical architectural zoning grid for healthy, balanced living."

## The Three Concentric Rings of Your Home

### 1. The Center 9 Squares (Brahma Pada)
The innermost 3x3 squares form the Brahmasthana. This is the quiet, open core of the building meant for light, air circulation, and family gathering.

### 2. The Middle Ring of Squares (Daivika & Manusha Padas)
Surrounding the center are the zones for daily family activities—living room, dining area, study tables, and internal walkways where movement is smooth and comfortable.

### 3. The Outer Perimeter of 32 Squares (Ishanya to Nairutya)
The outer ring of 32 squares along the walls controls where your Main Entrance Door (Mukhya Dwara), windows, kitchen, and bedrooms should be placed:

- North & East Entrance Padas: Entrances in the central-right padas of North (Mukhya, Bhallata) and East (Jayanta, Indra) invite bright light and positive prosperity.
- South Entrance Padas: Contrary to popular myth, a South-facing house is auspicious when the main door is placed in the 4th Pada (Grihakshata).
- Corner Zones: The four corners—Ishanya (NE), Agneya (SE), Nairutya (SW), and Vayavya (NW)—balance the five elements of Water, Fire, Earth, and Air.`,
        featuredImage: '/palm-leaf-texture.jpg',
        categoryId: 2,
        categoryName: 'Spiritual Knowledge',
        categorySlug: 'spiritual-knowledge',
        authorName: 'Vastu Ritam Academic Council',
        status: 'published',
        metaTitle: 'The Geometry of the Mandala: 81-Grid Paramashayika',
        metaDescription: 'Mathematical and metaphysical grid of the sacred architectural mandala.',
        readingTimeMinutes: 11,
        viewsCount: 535,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
        topics: [
          { id: 1, name: 'Vastu Purusha Mandala', slug: 'vastu-purusha-mandala' },
          { id: 5, name: 'Nairutya (South-West)', slug: 'nairutya-south-west' },
          { id: 7, name: 'Ayadi Shadvarga', slug: 'ayadi-shadvarga' },
        ],
      },
    ];

    const settings: StoredSiteSettings = {
      id: 1,
      primaryPhone: '+91 98200 18272',
      secondaryPhone: '+91 98200 45678',
      primaryEmail: 'contact@vasturitam.com',
      consultationEmail: 'consultation@vasturitam.com',
      whatsappNumber: '+91 98200 18272',
      whatsappNotice: '✦ WhatsApp Available for Blueprint Sharing',
      whatsappMessage: 'Namaste Vastu Ritam, I would like to inquire about a Vastu consultation.',
      telegramUrl: 'https://t.me/vasturitam',
      telegramHandle: '@VastuRitam',
      consultationTimings: 'Monday – Saturday: 10:00 AM – 6:30 PM (IST)',
      appointmentNotice: 'Prior appointment required for in-depth architectural floor plan audit.',
      youtubeUrl: 'https://youtube.com',
      youtubeHandle: '@VastuRitam',
      twitterUrl: 'https://x.com',
      twitterHandle: '@VastuRitam',
      facebookUrl: 'https://facebook.com/vasturitam',
      facebookHandle: '@VastuRitam',
      instagramUrl: 'https://instagram.com/vasturitam',
      instagramHandle: '@vasturitam',
      officeAddress: 'Vastu Ritam Research & Vedic Architecture Sanctuary, Pune / Mumbai, Maharashtra, Bharat',
      collaborationNotice: 'Collaborations welcome from registered Architects (COA), Civil Structural Engineers, and Researchers.',
      logoUrl: '/trademark-logo.jpg',
      adsensePublisherId: 'ca-pub-9697854430800000',
      adsenseEnabled: true,
      adsenseAutoAds: false,
      createdAt: now,
      updatedAt: now,
    };

    const users: StoredUser[] = [
      {
        id: 1,
        uid: 'admin_vr_master_uid',
        email: 'admin@vasturitam.com',
        displayName: 'Vastu Ritam Acharya',
        passwordHash: adminHash,
        role: 'admin',
        avatarUrl: '/trademark-logo.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        uid: 'scholar_vr_editor_uid',
        email: 'scholar@vasturitam.com',
        displayName: 'Vedic Shastra Scholar',
        passwordHash: scholarHash,
        role: 'editor',
        avatarUrl: '/trademark-logo.jpg',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const keywords: StoredKeyword[] = [
      { id: 1, name: 'Vastu Vidya', slug: 'vastu-vidya', description: 'Classical architectural canon', createdAt: now },
      { id: 2, name: 'Brahmasthana', slug: 'brahmasthana', description: 'Central courtyard void', createdAt: now },
      { id: 3, name: 'Mandala', slug: 'mandala', description: 'Sacred spatial diagram', createdAt: now },
      { id: 4, name: 'Paramashayika', slug: 'paramashayika', description: '81-square layout matrix', createdAt: now },
    ];

    const videos: StoredVideo[] = [
      {
        id: 1,
        title: 'Samarāṅgaṇa Sūtradhāra: The Foundations of Classical Space Planning',
        slug: 'samarangana-sutradhara-foundations',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoProvider: 'youtube',
        videoPlatform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1',
        thumbnailUrl: '/hero-sanctuary.jpg',
        description: 'A scholarly breakdown of King Bhoja’s 11th-century encyclopedic treatise on town planning, mechanical devices, and architectural proportioning.',
        duration: '25:40',
        instructor: 'Vastu Ritam Research Fellowship',
        durationSeconds: 1540,
        categoryId: 1,
        categoryName: 'Classical Vastu Vidya',
        categorySlug: 'classical-vastu-vidya',
        topicId: 1,
        topicName: 'Vastu Purusha Mandala',
        topicSlug: 'vastu-purusha-mandala',
        status: 'published',
        displayOrder: 1,
        viewCount: 384,
        isFeatured: true,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        title: 'Understanding the Brahmasthana & Thermal Stack Ventilation in Indian Homes',
        slug: 'brahmasthana-thermal-stack-ventilation',
        videoUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
        videoProvider: 'youtube',
        videoPlatform: 'youtube',
        videoId: 'M7lc1UVf-VE',
        embedUrl: 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?rel=0&modestbranding=1',
        thumbnailUrl: '/heaven-portal.jpg',
        description: 'Learn how traditional courtyard homes (Wada, Haveli, Nalukettu) naturally regulate indoor airflow and light—and how to apply this in modern apartments.',
        duration: '18:20',
        instructor: 'Vastu Ritam Architectural Desk',
        durationSeconds: 1100,
        categoryId: 3,
        categoryName: 'Architectural Harmony',
        categorySlug: 'architectural-harmony',
        topicId: 2,
        topicName: 'Brahmasthana',
        topicSlug: 'brahmasthana',
        status: 'published',
        displayOrder: 2,
        viewCount: 290,
        isFeatured: true,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ];

    return {
      articles,
      topics,
      categories,
      videos,
      settings,
      users,
      keywords,
      ads: this.generateInitialAds(),
      media: [],
      auditLogs: [],
      handbooks: this.generateInitialHandbooks(),
      handbookLeads: [],
    };
  }

  private generateInitialAds(): StoredAd[] {
    const now = new Date().toISOString();
    return [
      {
        id: 1,
        title: 'Sthapatya Shilp Studios — Sacred Vastu Metals & Consecrated Brass Yantras',
        imageUrl: '/hero-sanctuary.jpg',
        destinationUrl: '/gyan-kosh',
        placement: 'ARTICLE_MIDDLE',
        adType: 'BANNER',
        adSenseSlot: null,
        adSenseFormat: 'auto',
        customHtml: null,
        isActive: true,
        priority: 10,
        startDate: null,
        endDate: null,
        impressions: 245,
        clicks: 38,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        title: 'Prana Earth Architecture — Breathable Non-Hydraulic Lime Mortars & CSEB Masonry',
        imageUrl: '/heaven-portal.jpg',
        destinationUrl: '/what-we-do',
        placement: 'SIDEBAR',
        adType: 'BANNER',
        adSenseSlot: null,
        adSenseFormat: 'auto',
        customHtml: null,
        isActive: true,
        priority: 9,
        startDate: null,
        endDate: null,
        impressions: 198,
        clicks: 27,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        title: 'VedaCraft Sustainable Timber — Precision Ayadi-Proportioned Teak & Sal Portals',
        imageUrl: '/palm-leaf-texture.jpg',
        destinationUrl: '/discover',
        placement: 'HEADER',
        adType: 'BANNER',
        adSenseSlot: null,
        adSenseFormat: 'auto',
        customHtml: null,
        isActive: true,
        priority: 8,
        startDate: null,
        endDate: null,
        impressions: 312,
        clicks: 44,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        title: 'Vastu Purusha Spatial Research Fellowship — Peer-Reviewed Architectural Monographs',
        imageUrl: '/hero-sanctuary.jpg',
        destinationUrl: '/gyan-kosh',
        placement: 'BELOW_RESULTS',
        adType: 'BANNER',
        adSenseSlot: null,
        adSenseFormat: 'auto',
        customHtml: null,
        isActive: true,
        priority: 8,
        startDate: null,
        endDate: null,
        impressions: 164,
        clicks: 22,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        title: 'Mayamatam & Samarāṅgaṇa Sūtradhāra — Classical Architectural Video Symposiums',
        imageUrl: '/heaven-portal.jpg',
        destinationUrl: '/knowledge',
        placement: 'BELOW_VIDEO',
        adType: 'BANNER',
        adSenseSlot: null,
        adSenseFormat: 'auto',
        customHtml: null,
        isActive: true,
        priority: 9,
        startDate: null,
        endDate: null,
        impressions: 129,
        clicks: 19,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        title: 'CAD & BIM Vastu Orientation Audit — Non-Demolition Spatial Alignment for Architects',
        imageUrl: '/palm-leaf-texture.jpg',
        destinationUrl: '/what-we-do',
        placement: 'ARTICLE_BOTTOM',
        adType: 'BANNER',
        adSenseSlot: null,
        adSenseFormat: 'auto',
        customHtml: null,
        isActive: true,
        priority: 7,
        startDate: null,
        endDate: null,
        impressions: 152,
        clicks: 24,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 7,
        title: 'Vastu Before You Buy — Complete Floor Plan & Plot Direction Verification',
        imageUrl: '/hero-sanctuary.jpg',
        destinationUrl: '/what-we-do',
        placement: 'ARTICLE_TOP',
        adType: 'BANNER',
        adSenseSlot: null,
        adSenseFormat: 'auto',
        customHtml: null,
        isActive: true,
        priority: 10,
        startDate: null,
        endDate: null,
        impressions: 210,
        clicks: 33,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  private generateInitialHandbooks(): StoredHandbook[] {
    const now = new Date().toISOString();
    return [
      {
        id: 1,
        title: 'Vastu for Contemporary Architects',
        slug: 'vastu-for-contemporary-architects',
        subtitle: 'A Field Guide to Seamless Integration with Modern CAD & BIM Workflows',
        targetAudience: 'Architects & Urban Planners',
        pages: 48,
        topics: [
          'Solar Vector Mapping',
          'Brahmasthan in Multi-Story Apartments',
          'Façade Openings vs Dik-Bala',
          'Non-Destructive Layout Optimization',
        ],
        summary:
          'Written specifically for registered architects who want to respect client Vastu sentiments while preserving aesthetic integrity and building code compliance.',
        pdfFileName: 'sample_handbook_1.pdf',
        pdfFilePath: 'storage/handbooks/handbook_1_default.pdf',
        pdfFileSizeBytes: 18450,
        isPublished: true,
        displayOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        title: "The Informed Homebuyer's Vastu Checklist",
        slug: 'informed-homebuyers-vastu-checklist',
        subtitle: 'What to Observe Before Signing Property Deeds',
        targetAudience: 'Home Buyers & Real Estate Investors',
        pages: 36,
        topics: [
          'Evaluating Main Entrance Pada',
          'Slope & Drainage Verification',
          'Surrounding Negative Structures',
          'Separating Remediable Flaws from Critical Defects',
        ],
        summary:
          'A transparent, easy-to-follow guide to protect your life savings from high-risk property purchases without being misled by sensationalist claims.',
        pdfFileName: 'sample_handbook_2.pdf',
        pdfFilePath: 'storage/handbooks/handbook_2_default.pdf',
        pdfFileSizeBytes: 18240,
        isPublished: true,
        displayOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        title: 'Industrial & Factory Spatial Harmonics',
        slug: 'industrial-factory-spatial-harmonics',
        subtitle: 'Aligning Heavy Machinery, Substations, and Inventory Logistics',
        targetAudience: 'Plant Managers & Civil Engineers',
        pages: 54,
        topics: [
          'Earth-Bearing Capacity in Nairutya',
          'Hazardous Chemical Storage in Agni',
          'Raw Material Inflow vs Finished Goods Outflow',
          'Workforce Well-being',
        ],
        summary:
          'A practical technical treatise for manufacturing facilities, warehouse logistics, and corporate processing plants.',
        pdfFileName: 'sample_handbook_3.pdf',
        pdfFilePath: 'storage/handbooks/handbook_3_default.pdf',
        pdfFileSizeBytes: 18620,
        isPublished: true,
        displayOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  private saveToDisk(stateToSave?: DataStoreState) {
    try {
      fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(stateToSave || this.state, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to persist data-store.json:', err);
    }
  }

  // --- Articles ---
  getArticles(filterPublishedOnly = false): StoredArticle[] {
    if (filterPublishedOnly) {
      return this.state.articles.filter((a) => a.status === 'published');
    }
    return [...this.state.articles];
  }

  getArticleById(id: number): StoredArticle | undefined {
    return this.state.articles.find((a) => a.id === id);
  }

  getArticleBySlug(slug: string): StoredArticle | undefined {
    const clean = slug.toLowerCase().trim();
    return this.state.articles.find((a) => a.slug === clean);
  }

  createArticle(data: Partial<StoredArticle>): StoredArticle {
    const now = new Date().toISOString();
    const nextId = this.state.articles.length > 0 ? Math.max(...this.state.articles.map((a) => a.id)) + 1 : 1;
    const cat = data.categoryId ? this.getCategoryById(data.categoryId) : undefined;

    const newArticle: StoredArticle = {
      id: nextId,
      title: data.title || 'Untitled Article',
      slug: (data.slug || data.title || `article-${nextId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      excerpt: data.excerpt || '',
      content: data.content || '',
      featuredImage: data.featuredImage || '/hero-sanctuary.jpg',
      categoryId: data.categoryId || null,
      categoryName: cat?.name,
      categorySlug: cat?.slug,
      authorId: data.authorId || 1,
      authorName: data.authorName || 'Vastu Ritam Acharya',
      status: data.status || 'draft',
      metaTitle: data.metaTitle || data.title,
      metaDescription: data.metaDescription || data.excerpt,
      readingTimeMinutes: data.readingTimeMinutes || Math.max(1, Math.round((data.content || '').split(/\s+/).length / 150)),
      viewsCount: 0,
      publishedAt: data.status === 'published' ? (data.publishedAt || now) : null,
      createdAt: now,
      updatedAt: now,
      topics: data.topics || [],
      keywords: data.keywords || [],
    };

    this.state.articles.unshift(newArticle);
    this.saveToDisk();
    return newArticle;
  }

  updateArticle(id: number, data: Partial<StoredArticle>): StoredArticle | undefined {
    const idx = this.state.articles.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;

    const existing = this.state.articles[idx];
    const now = new Date().toISOString();
    const nextStatus = data.status || existing.status;
    let publishedAt = existing.publishedAt;
    if (nextStatus === 'published' && !publishedAt) {
      publishedAt = now;
    }

    const cat = data.categoryId ? this.getCategoryById(data.categoryId) : undefined;

    const updated: StoredArticle = {
      ...existing,
      ...data,
      categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId,
      categoryName: cat ? cat.name : existing.categoryName,
      categorySlug: cat ? cat.slug : existing.categorySlug,
      status: nextStatus,
      publishedAt,
      updatedAt: now,
    };

    this.state.articles[idx] = updated;
    this.saveToDisk();
    return updated;
  }

  deleteArticle(id: number): boolean {
    const initialLen = this.state.articles.length;
    this.state.articles = this.state.articles.filter((a) => a.id !== id);
    if (this.state.articles.length !== initialLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  setArticleTopics(articleId: number, topicIds: number[]): void {
    const article = this.state.articles.find((a) => a.id === articleId);
    if (!article) return;
    article.topics = topicIds
      .map((id) => this.getTopicById(id))
      .filter((t): t is StoredTopic => Boolean(t))
      .map((t) => ({ id: t.id, name: t.name, slug: t.slug }));
    this.saveToDisk();
  }

  setArticleKeywords(articleId: number, keywordIds: number[]): void {
    const article = this.state.articles.find((a) => a.id === articleId);
    if (!article) return;
    article.keywords = keywordIds
      .map((id) => this.state.keywords.find((k) => k.id === id))
      .filter((k): k is StoredKeyword => Boolean(k))
      .map((k) => ({ id: k.id, name: k.name, slug: k.slug }));
    this.saveToDisk();
  }

  // --- Topics ---
  getTopics(): StoredTopic[] {
    return [...this.state.topics];
  }

  getTopicById(id: number): StoredTopic | undefined {
    return this.state.topics.find((t) => t.id === id);
  }

  getTopicBySlug(slug: string): StoredTopic | undefined {
    const clean = slug.toLowerCase().trim();
    return this.state.topics.find((t) => t.slug === clean);
  }

  createTopic(data: Partial<StoredTopic>): StoredTopic {
    const now = new Date().toISOString();
    const nextId = this.state.topics.length > 0 ? Math.max(...this.state.topics.map((t) => t.id)) + 1 : 1;
    const newTopic: StoredTopic = {
      id: nextId,
      name: data.name || 'New Topic',
      slug: (data.slug || data.name || `topic-${nextId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      sanskritName: data.sanskritName || '',
      entityType: data.entityType || 'concept',
      summary: data.summary || '',
      description: data.description || '',
      imageUrl: data.imageUrl || '/trademark-logo.jpg',
      metaTitle: data.metaTitle || data.name,
      metaDescription: data.metaDescription || data.summary,
      createdAt: now,
      updatedAt: now,
    };
    this.state.topics.push(newTopic);
    this.saveToDisk();
    return newTopic;
  }

  updateTopic(id: number, data: Partial<StoredTopic>): StoredTopic | undefined {
    const idx = this.state.topics.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.state.topics[idx] = {
      ...this.state.topics[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.state.topics[idx];
  }

  deleteTopic(id: number): boolean {
    const len = this.state.topics.length;
    this.state.topics = this.state.topics.filter((t) => t.id !== id);
    if (this.state.topics.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Categories ---
  getCategories(): StoredCategory[] {
    return [...this.state.categories];
  }

  getCategoryById(id: number): StoredCategory | undefined {
    return this.state.categories.find((c) => c.id === id);
  }

  getCategoryBySlug(slug: string): StoredCategory | undefined {
    const clean = slug.toLowerCase().trim();
    return this.state.categories.find((c) => c.slug === clean);
  }

  createCategory(data: Partial<StoredCategory>): StoredCategory {
    const now = new Date().toISOString();
    const nextId = this.state.categories.length > 0 ? Math.max(...this.state.categories.map((c) => c.id)) + 1 : 1;
    const newCat: StoredCategory = {
      id: nextId,
      name: data.name || 'New Category',
      slug: (data.slug || data.name || `cat-${nextId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      description: data.description || '',
      icon: data.icon || 'BookOpen',
      metaTitle: data.metaTitle || data.name,
      metaDescription: data.metaDescription || data.description,
      displayOrder: data.displayOrder || this.state.categories.length + 1,
      articleCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.state.categories.push(newCat);
    this.saveToDisk();
    return newCat;
  }

  updateCategory(id: number, data: Partial<StoredCategory>): StoredCategory | undefined {
    const idx = this.state.categories.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.state.categories[idx] = {
      ...this.state.categories[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.state.categories[idx];
  }

  deleteCategory(id: number): boolean {
    const len = this.state.categories.length;
    this.state.categories = this.state.categories.filter((c) => c.id !== id);
    if (this.state.categories.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Videos ---
  getVideos(filterPublishedOnly = false): StoredVideo[] {
    const rawList = (this.state.videos || []).map((v) => ({
      ...v,
      videoProvider: (v.videoProvider || v.videoPlatform || 'youtube') as 'youtube' | 'vimeo',
      videoPlatform: (v.videoPlatform || v.videoProvider || 'youtube') as 'youtube' | 'vimeo',
      thumbnailUrl: v.thumbnailUrl || '/hero-sanctuary.jpg',
      duration: v.duration || '20:00',
      instructor: v.instructor || 'Vastu Ritam Research Fellowship',
    }));
    if (filterPublishedOnly) {
      return rawList.filter((v) => v.status === 'published');
    }
    return rawList;
  }

  getVideoById(id: number): StoredVideo | undefined {
    const found = (this.state.videos || []).find((v) => v.id === id);
    if (!found) return undefined;
    return {
      ...found,
      videoProvider: (found.videoProvider || found.videoPlatform || 'youtube') as 'youtube' | 'vimeo',
      videoPlatform: (found.videoPlatform || found.videoProvider || 'youtube') as 'youtube' | 'vimeo',
      thumbnailUrl: found.thumbnailUrl || '/hero-sanctuary.jpg',
    };
  }

  createVideo(data: Partial<StoredVideo>): StoredVideo {
    const now = new Date().toISOString();
    const list = this.state.videos || [];
    const nextId = list.length > 0 ? Math.max(...list.map((v) => v.id)) + 1 : 1;
    const cat = data.categoryId ? this.getCategoryById(data.categoryId) : undefined;
    const top = data.topicId ? this.getTopicById(data.topicId) : undefined;
    const provider = (data.videoProvider || data.videoPlatform || 'youtube') as 'youtube' | 'vimeo';

    const newVideo: StoredVideo = {
      id: nextId,
      title: data.title || 'Untitled Video',
      slug: (data.slug || data.title || `video-${nextId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      videoUrl: data.videoUrl || '',
      videoProvider: provider,
      videoPlatform: provider,
      videoId: data.videoId || '',
      embedUrl: data.embedUrl || '',
      thumbnailUrl: data.thumbnailUrl || '/hero-sanctuary.jpg',
      description: data.description || '',
      duration: data.duration || null,
      instructor: data.instructor || 'Vastu Ritam Research Fellowship',
      durationSeconds: data.durationSeconds || 0,
      categoryId: data.categoryId || null,
      categoryName: cat?.name || data.categoryName,
      categorySlug: cat?.slug || data.categorySlug,
      topicId: data.topicId || null,
      topicName: top?.name || data.topicName,
      topicSlug: top?.slug || data.topicSlug,
      status: data.status || 'draft',
      displayOrder: data.displayOrder ?? list.length + 1,
      viewCount: 0,
      isFeatured: Boolean(data.isFeatured),
      publishedAt: data.status === 'published' ? now : null,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(newVideo);
    this.state.videos = list;
    this.saveToDisk();
    return newVideo;
  }

  updateVideo(id: number, data: Partial<StoredVideo>): StoredVideo | undefined {
    const list = this.state.videos || [];
    const idx = list.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;
    const existing = list[idx];
    const now = new Date().toISOString();
    const nextStatus = data.status || existing.status;
    let publishedAt = existing.publishedAt;
    if (nextStatus === 'published' && !publishedAt) {
      publishedAt = now;
    }
    const cat = data.categoryId ? this.getCategoryById(data.categoryId) : undefined;
    const top = data.topicId ? this.getTopicById(data.topicId) : undefined;
    const provider = (data.videoProvider || data.videoPlatform || existing.videoProvider || existing.videoPlatform || 'youtube') as 'youtube' | 'vimeo';

    const updated: StoredVideo = {
      ...existing,
      ...data,
      videoProvider: provider,
      videoPlatform: provider,
      categoryName: cat ? cat.name : existing.categoryName,
      categorySlug: cat ? cat.slug : existing.categorySlug,
      topicName: top ? top.name : existing.topicName,
      topicSlug: top ? top.slug : existing.topicSlug,
      status: nextStatus,
      publishedAt,
      updatedAt: now,
    };
    list[idx] = updated;
    this.state.videos = list;
    this.saveToDisk();
    return updated;
  }

  deleteVideo(id: number): boolean {
    const list = this.state.videos || [];
    const len = list.length;
    this.state.videos = list.filter((v) => v.id !== id);
    if (this.state.videos.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Site Settings & Logo ---
  getSettings(): StoredSiteSettings {
    return { ...this.state.settings };
  }

  updateSettings(data: Partial<StoredSiteSettings>): StoredSiteSettings {
    this.state.settings = {
      ...this.state.settings,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return { ...this.state.settings };
  }

  updateLogo(logoUrl: string): StoredSiteSettings {
    this.state.settings.logoUrl = logoUrl;
    this.state.settings.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return { ...this.state.settings };
  }

  // --- Users & Credentials ---
  getUsers(): StoredUser[] {
    return [...this.state.users];
  }

  getUserByEmail(email: string): StoredUser | undefined {
    const clean = email.toLowerCase().trim();
    return this.state.users.find((u) => u.email.toLowerCase().trim() === clean);
  }

  getUserById(id: number): StoredUser | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  updateUser(id: number, data: Partial<StoredUser>): StoredUser | undefined {
    const idx = this.state.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.state.users[idx] = {
      ...this.state.users[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.state.users[idx];
  }

  // --- Keywords ---
  getKeywords(): StoredKeyword[] {
    return [...this.state.keywords];
  }

  createKeyword(data: Partial<StoredKeyword>): StoredKeyword {
    const nextId = this.state.keywords.length > 0 ? Math.max(...this.state.keywords.map((k) => k.id)) + 1 : 1;
    const newK: StoredKeyword = {
      id: nextId,
      name: data.name || 'New Keyword',
      slug: (data.slug || data.name || `kw-${nextId}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || '',
      createdAt: new Date().toISOString(),
    };
    this.state.keywords.push(newK);
    this.saveToDisk();
    return newK;
  }

  updateKeyword(id: number, data: Partial<StoredKeyword>): StoredKeyword | undefined {
    const idx = this.state.keywords.findIndex((k) => k.id === id);
    if (idx === -1) return undefined;
    this.state.keywords[idx] = {
      ...this.state.keywords[idx],
      ...data,
    };
    this.saveToDisk();
    return this.state.keywords[idx];
  }

  deleteKeyword(id: number): boolean {
    const len = this.state.keywords.length;
    this.state.keywords = this.state.keywords.filter((k) => k.id !== id);
    if (this.state.keywords.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Ads ---
  getAds(): StoredAd[] {
    return [...this.state.ads];
  }

  getActiveAds(placement?: string): StoredAd[] {
    const now = new Date();
    return this.state.ads.filter((a) => {
      if (!a.isActive) return false;
      if (placement && a.placement.toUpperCase() !== placement.toUpperCase()) return false;
      if (a.startDate && new Date(a.startDate) > now) return false;
      if (a.endDate && new Date(a.endDate) < now) return false;
      return true;
    });
  }

  createAd(data: Partial<StoredAd>): StoredAd {
    const nextId = this.state.ads.length > 0 ? Math.max(...this.state.ads.map((a) => a.id)) + 1 : 1;
    const now = new Date().toISOString();
    const newAd: StoredAd = {
      id: nextId,
      title: data.title || 'New Advertisement',
      imageUrl: data.imageUrl || '/hero-sanctuary.jpg',
      destinationUrl: data.destinationUrl || '/',
      placement: (data.placement || 'SIDEBAR').toUpperCase(),
      adType: data.adType || 'BANNER',
      adSenseSlot: data.adSenseSlot || null,
      adSenseFormat: data.adSenseFormat || 'auto',
      customHtml: data.customHtml || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      priority: data.priority || 1,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      impressions: 0,
      clicks: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.state.ads.unshift(newAd);
    this.saveToDisk();
    return newAd;
  }

  updateAd(id: number, data: Partial<StoredAd>): StoredAd | undefined {
    const idx = this.state.ads.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.state.ads[idx] = {
      ...this.state.ads[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.state.ads[idx];
  }

  deleteAd(id: number): boolean {
    const len = this.state.ads.length;
    this.state.ads = this.state.ads.filter((a) => a.id !== id);
    if (this.state.ads.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  getAdById(id: number): StoredAd | undefined {
    return this.state.ads.find((a) => a.id === id);
  }

  recordAdImpression(id: number): StoredAd | undefined {
    const idx = this.state.ads.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.state.ads[idx] = {
      ...this.state.ads[idx],
      impressions: (this.state.ads[idx].impressions || 0) + 1,
    };
    this.saveToDisk();
    return this.state.ads[idx];
  }

  recordAdClick(id: number): StoredAd | undefined {
    const idx = this.state.ads.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.state.ads[idx] = {
      ...this.state.ads[idx],
      clicks: (this.state.ads[idx].clicks || 0) + 1,
    };
    this.saveToDisk();
    return this.state.ads[idx];
  }

  // --- Media ---
  getMedia(): StoredMedia[] {
    return [...this.state.media];
  }

  addMedia(data: Partial<StoredMedia>): StoredMedia {
    const nextId = this.state.media.length > 0 ? Math.max(...this.state.media.map((m) => m.id)) + 1 : 1;
    const newM: StoredMedia = {
      id: nextId,
      fileName: data.fileName || 'file',
      fileUrl: data.fileUrl || '',
      mimeType: data.mimeType || 'image/jpeg',
      sizeBytes: data.sizeBytes || 0,
      altText: data.altText || '',
      uploadedById: data.uploadedById,
      createdAt: new Date().toISOString(),
    };
    this.state.media.unshift(newM);
    this.saveToDisk();
    return newM;
  }

  deleteMedia(id: number): boolean {
    const len = this.state.media.length;
    this.state.media = this.state.media.filter((m) => m.id !== id);
    if (this.state.media.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Audit Logs ---
  getAuditLogs(): StoredAuditLog[] {
    return [...this.state.auditLogs];
  }

  addAuditLog(data: Partial<StoredAuditLog>): StoredAuditLog {
    const nextId = this.state.auditLogs.length > 0 ? Math.max(...this.state.auditLogs.map((l) => l.id)) + 1 : 1;
    const newLog: StoredAuditLog = {
      id: nextId,
      userId: data.userId,
      action: data.action || 'GENERAL_ACTION',
      entityType: data.entityType || 'SYSTEM',
      entityId: data.entityId || '0',
      details: data.details || '',
      ipAddress: data.ipAddress,
      createdAt: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(newLog);
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 200);
    }
    this.saveToDisk();
    return newLog;
  }

  createAuditLog(data: Partial<StoredAuditLog>): StoredAuditLog {
    return this.addAuditLog(data);
  }

  // --- Handbooks Management ---
  getHandbooks(publishedOnly = false): StoredHandbook[] {
    const list = this.state.handbooks || [];
    if (publishedOnly) {
      return list.filter((h) => h.isPublished).sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getHandbookById(id: number | string): StoredHandbook | undefined {
    const numId = typeof id === 'number' ? id : parseInt(String(id), 10);
    return (this.state.handbooks || []).find((h) => h.id === numId);
  }

  getHandbookBySlug(slug: string): StoredHandbook | undefined {
    const clean = slug.toLowerCase().trim();
    return (this.state.handbooks || []).find((h) => h.slug === clean);
  }

  createHandbook(data: Partial<StoredHandbook>): StoredHandbook {
    const now = new Date().toISOString();
    const list = this.state.handbooks || [];
    const nextId = list.length > 0 ? Math.max(...list.map((h) => h.id)) + 1 : 1;
    const cleanTitle = data.title || `Handbook ${nextId}`;
    const slug = (data.slug || cleanTitle)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newHandbook: StoredHandbook = {
      id: nextId,
      title: cleanTitle,
      slug,
      subtitle: data.subtitle || '',
      targetAudience: data.targetAudience || 'Architects & Homeowners',
      pages: data.pages || 40,
      topics: Array.isArray(data.topics) ? data.topics : [],
      summary: data.summary || '',
      pdfFileName: data.pdfFileName || null,
      pdfFilePath: data.pdfFilePath || null,
      pdfFileSizeBytes: data.pdfFileSizeBytes || null,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      displayOrder: data.displayOrder || nextId,
      createdAt: now,
      updatedAt: now,
    };

    list.push(newHandbook);
    this.state.handbooks = list;
    this.saveToDisk();
    return newHandbook;
  }

  updateHandbook(id: number | string, data: Partial<StoredHandbook>): StoredHandbook | undefined {
    const numId = typeof id === 'number' ? id : parseInt(String(id), 10);
    const list = this.state.handbooks || [];
    const idx = list.findIndex((h) => h.id === numId);
    if (idx === -1) return undefined;

    const existing = list[idx];
    const now = new Date().toISOString();

    const updated: StoredHandbook = {
      ...existing,
      ...data,
      id: existing.id,
      topics: data.topics !== undefined ? (Array.isArray(data.topics) ? data.topics : existing.topics) : existing.topics,
      updatedAt: now,
    };

    list[idx] = updated;
    this.state.handbooks = list;
    this.saveToDisk();
    return updated;
  }

  deleteHandbook(id: number | string): boolean {
    const numId = typeof id === 'number' ? id : parseInt(String(id), 10);
    const list = this.state.handbooks || [];
    const len = list.length;
    this.state.handbooks = list.filter((h) => h.id !== numId);
    if (this.state.handbooks.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Handbook Client Leads ---
  getHandbookLeads(handbookIdFilter?: string): StoredHandbookLead[] {
    const list = this.state.handbookLeads || [];
    if (handbookIdFilter && handbookIdFilter !== 'all') {
      return list.filter((l) => String(l.handbookId) === String(handbookIdFilter));
    }
    return [...list];
  }

  createHandbookLead(data: Partial<StoredHandbookLead>): StoredHandbookLead {
    const now = new Date().toISOString();
    const list = this.state.handbookLeads || [];
    const nextId = list.length > 0 ? Math.max(...list.map((l) => l.id)) + 1 : 1;

    const newLead: StoredHandbookLead = {
      id: nextId,
      handbookId: String(data.handbookId || '1'),
      handbookTitle: data.handbookTitle || 'Vastu Handbook',
      fullName: data.fullName ? data.fullName.trim() : null,
      email: (data.email || '').trim().toLowerCase(),
      phone: (data.phone || '').trim(),
      accessToken: data.accessToken || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      createdAt: now,
    };

    list.unshift(newLead);
    this.state.handbookLeads = list;
    this.saveToDisk();
    return newLead;
  }

  deleteHandbookLead(id: number): boolean {
    const list = this.state.handbookLeads || [];
    const len = list.length;
    this.state.handbookLeads = list.filter((l) => l.id !== id);
    if (this.state.handbookLeads.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }
}

export const dataStore = new PersistentDataStore();
