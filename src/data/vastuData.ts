import { DictionaryTerm, Article, Handbook, MythItem, Testimonial } from '../types';

export const FOUNDER_INFO = {
  title: "Founder and Vastu Researcher",
  institution: "Vastu Ritam",
  qualifications: [
    "Chartered Accountant (CA)",
    "Bachelor of Laws (LL.B.)",
    "Master's in Vastu Shastra",
    "Vastu Research Expert (Vastu Shastra)"
  ],
  areasOfInterest: [
    "Vastu Shastra",
    "Astro-Vastu",
    "Remedies (Traditional + Modern)",
    "Ancient Vastu Text Study",
    "Practical Space Planning"
  ],
  bio: "Combining the clear, practical thinking of Chartered Accountancy and Law with deep study of traditional Vastu Shastra books, our founder approaches Vastu as a logical, practical, and balanced science of living spaces. Rather than promoting fear or superstition, our work focuses on core Vastu principles, authentic traditional books (Mayamatam, Manasara, Samarangana Sutradhara), and practical harmony with modern architecture and civil engineering."
};

export const EMBLEM_EXPLANATIONS = [
  {
    id: "lotus",
    title: "The Lotus (पद्म)",
    subheading: "North-East (Ishanya)",
    color: "from-pink-500/20 to-rose-500/10",
    borderColor: "border-pink-500",
    badge: "Wisdom & Purity",
    explanation: "Positioned in the north-east (Ishanya), the lotus represents knowledge, purity, and the continuous pursuit of higher understanding. In classical Vastu, Ishanya is the zone of pure ether (Akasha) and water (Jala), the threshold through which subtle cosmic and solar prana enters the dwelling. The blossoming lotus reminds us that architectural design should elevate consciousness and maintain sanctity."
  },
  {
    id: "stem",
    title: "The Unfinished Stem (अनावृत्त नाल)",
    subheading: "Open Boundless Circle",
    color: "from-amber-500/20 to-emerald-500/10",
    borderColor: "border-amber-600",
    badge: "Limitless Wisdom",
    explanation: "The stem begins at the lotus and encircles the Mandala without completing the circle. It symbolises that knowledge is limitless. No individual or institution can claim complete understanding; there is always more to learn. This embodies intellectual humility, honest inquiry, and an enduring quest to research and expand authentic knowledge rather than settling into rigid dogma."
  },
  {
    id: "colours",
    title: "The Colours (रङ्ग द्वय)",
    subheading: "Red & Green Harmony",
    color: "from-red-500/20 to-emerald-500/20",
    borderColor: "border-red-600",
    badge: "Action & Discernment",
    explanation: "Red signifies purposeful action and transformation. Green signifies knowledge, learning, growth, and discernment. Together, they reflect the inseparable relationship between wisdom and action. Knowledge without practical application remains inactive; action without classical understanding remains perilous. Balance between red and green achieves true harmony."
  },
  {
    id: "mandala",
    title: "The Mandala (वास्तु मण्डल)",
    subheading: "The 9-Fold Grid Order",
    color: "from-emerald-500/20 to-amber-500/10",
    borderColor: "border-emerald-600",
    badge: "Spatial Order",
    explanation: "The Mandala represents the ordered relationship between space, direction, and the Vastu Purusha. The simplified nine-fold division symbolises the nine primary spatial zones (Navakhanda) and the harmonious organisation of built space. Each quadrant resonates with distinct elemental frequencies (Pancha Mahabhuta) governing human vitality and productivity."
  },
  {
    id: "purusha",
    title: "The Vastu Purusha (वास्तु पुरुष)",
    subheading: "Cosmic Dwelling Presence",
    color: "from-orange-500/20 to-red-500/10",
    borderColor: "border-orange-600",
    badge: "Reverence to Nature",
    explanation: "The Vastu Purusha is shown respectfully aligned within the Mandala, reminding us that every space exists within a larger natural order that deserves understanding rather than domination. The Purusha's posture—head resting in the North-East, feet in the South-West, navel at the Brahmasthana—instructs us to treat every building as a living, breathing entity."
  },
  {
    id: "motto",
    title: "Our Motto (ध्‍येयवाक्यम्)",
    subheading: "संतुलन · समृद्धि · सौख्यम्",
    color: "from-red-600/20 to-amber-600/10",
    borderColor: "border-red-700",
    badge: "Vedic Foundation",
    explanation: "संतुलन (Balance) forms the foundation of every space and leads to Prosperity.\nसमृद्धि (Prosperity) arises when balance allows life and work to flourish and therefore nurtures Well-being.\nसौख्यम् (Well-Being) is the ultimate objective—a state of physical comfort, mental peace, and holistic harmony.\n\nThese three ideals form the foundation of every consultation, publication, and educational initiative undertaken by Vastu Ritam."
  }
];

export const PHILOSOPHY_PRINCIPLES = [
  {
    number: "01",
    title: "Understanding before application",
    sanskrit: "ज्ञानात् पूर्वम् अनुशीलनम्",
    description: "Every recommendation must arise from a clear understanding of the space, its purpose, its occupants, and the principles governing it—not from assumptions or fear."
  },
  {
    number: "02",
    title: "Knowledge before remedies",
    sanskrit: "उपायात् पूर्वम् तत्त्वबोधः",
    description: "No two spaces are identical. Every recommendation should be based on first principles rather than rigid formulas. Instead of putting all yantras, understand the meaning of the yantra or pyramid, get convinced, and only then introduce that remedy in your space."
  },
  {
    number: "03",
    title: "Principles before prescriptions",
    sanskrit: "विधेः पूर्वम् सिद्धान्तः",
    description: "We respect classical wisdom while encouraging thoughtful study and informed interpretation. When the foundational principles are thoroughly comprehended, the right architectural decisions become self-evident."
  }
];

export const COLLABORATORS_DATA = [
  {
    category: "Professional Collaborators",
    sanskrit: "व्यावसायिक सहयोगिनः",
    description: "Architects, engineers, and designers collaborating to integrate timeless orientation science into contemporary functional structures.",
    items: [
      { role: "Architects", detail: "Integrating solar paths, natural cross-ventilation, and magnetic alignments seamlessly into blueprint layouts without compromising structural aesthetics." },
      { role: "Civil Engineers", detail: "Aligning load distributions, heavy structural pillars, underground tanks, and plumbing lines with directional earth energies." },
      { role: "Interior Designers", detail: "Balancing color frequencies, interior furniture orientation, functional room ergonomics, and element allocations." },
      { role: "Builders & Developers", detail: "Planning townships, multi-unit residential towers, gated communities, and commercial complexes with balanced land contours." }
    ]
  },
  {
    category: "Academic Collaborators",
    sanskrit: "शैक्षणिक एवं अनुसन्धान सहयोगिनः",
    description: "Scholars, university researchers, and inquisitive students dedicated to textual cross-examination and rigorous empirical validation.",
    items: [
      { role: "Researchers", detail: "Conducting systematic comparative studies across classical manuscripts including Mayamatam, Manasara, and Brihat Samhita." },
      { role: "Students & Teachers", detail: "Engaging in structured curriculum, architectural history studies, and foundational workshops devoid of commercial myth-making." }
    ]
  },
  {
    category: "Community Collaborators",
    sanskrit: "नागरिक एवं समाज सहयोगिनः",
    description: "Individuals and families building, purchasing, or renovating their sanctuaries for lifelong peace and prosperity.",
    items: [
      { role: "Home Owners", detail: "Creating living spaces that provide restorative sleep, emotional peace, and harmonious family relationships through sound spatial layout." },
      { role: "Property Buyers", detail: "Evaluating site shape, slope, road thrusts (Veedhi Shoola), and magnetic alignment before investing significant capital." }
    ]
  }
];

export const SERVICES_DATA = [
  {
    id: "residential",
    title: "Residential Vastu",
    sanskrit: "गृह वास्तु",
    tagline: "Cultivating sanctuaries of peace, vitality, and family equilibrium",
    intro: "Whether you are building a new home, renovating an existing one, or simply looking for guidance, we help you create a living space that feels balanced, comfortable, and in harmony with Vastu principles.",
    focusAreas: [
      "Optimal bedroom placement for restorative biorhythm and mental rejuvenation (South-West / Nairutya)",
      "Kitchen fire placement honoring the Agni quadrant for nutritional vitality (South-East)",
      "Uncluttered Brahmasthana (central spatial matrix) for natural cosmic light and ventilation",
      "Prayer, contemplation, and study zones aligned with Ishanya (North-East) solar influx",
      "Remedies without non-destructive structural alterations wherever feasible"
    ]
  },
  {
    id: "commercial",
    title: "Commercial Vastu",
    sanskrit: "व्यावसायिक वास्तु",
    tagline: "Energizing enterprises, productivity, and sustainable prosperity",
    intro: "Every workplace has its own purpose. We help businesses plan offices, shops, clinics, and commercial spaces that support both functionality and a positive working environment.",
    focusAreas: [
      "Executive cabin and leadership seating aligned for clarity and strategic stability",
      "Marketing, sales, and transaction desks positioned in vibrant momentum quadrants",
      "Reception, cashier counter, and financial vaults placed in the Kuber (North) trajectory",
      "Employee workstation ergonomics designed to reduce cognitive burnout and optimize team collaboration",
      "Integration with corporate aesthetic guidelines and brand architectural language"
    ]
  },
  {
    id: "industrial",
    title: "Industrial Vastu",
    sanskrit: "औद्योगिक वास्तु",
    tagline: "Synchronizing heavy manufacturing, logistics, and human safety",
    intro: "Factories and industrial units have unique requirements. We help apply Vastu principles while respecting the practical needs of manufacturing, storage, and day-to-day operations.",
    focusAreas: [
      "Machinery weight distribution honoring earth heavy zones (South and West)",
      "Boilers, furnaces, substations, and electrical transformers oriented to the Agni quadrant",
      "Raw materials inventory vs finished goods warehouse flow optimization",
      "Effluent treatment plants, water storage tanks, and drainage gradient alignment",
      "Safety record enhancement and labor force spatial harmony"
    ]
  },
  {
    id: "before-you-buy",
    title: "Vastu Before You Buy",
    sanskrit: "क्रयण पूर्व वास्तु परीक्षण",
    tagline: "Clarity and confidence before committing your lifelong investment",
    intro: "Planning to buy a home, office, or plot? We help you understand its Vastu strengths and considerations before you make your decision.",
    focusAreas: [
      "Plot shape examination (Chatushkona, Gomukhi, Shermukhi) and topographical slope gradients",
      "Surrounding environmental factors: road thrusts (Veedhi Shoola), high-tension wires, water bodies",
      "Apartment floor plan audit: entrance door orientation, kitchen, and master bedroom balance",
      "Identification of irreparable defects vs easily harmonizable layout attributes",
      "Unbiased, independent evaluation free of broker or developer bias"
    ]
  }
];

export const SHABD_KOSH_DATA: DictionaryTerm[] = [
  {
    id: "1",
    slug: "vastu-purusha-mandala",
    term: "Vastu Purusha Mandala",
    sanskrit: "वास्तु पुरुष मण्डल",
    category: "Cosmology",
    meaning: "The sacred directional floor-plan grid (9x9 or 8x8 squares) used to map out rooms, sunlight, and energy zones in any home, flat, or plot.",
    architecturalSignificance: "Divides any plot or apartment into 81 (Paramashayika) or 64 (Manduka) squares so that the kitchen, bedrooms, entrance, and open areas sit in harmony with sunlight, airflow, and natural magnetic directions.",
    scripturalReference: "Brihat Samhita, Ch. 53; Mayamatam, Ch. 7",
    imageUrl: "/emblem-circle.png",
    practicalExample: "When an architect overlays a 9x9 grid on your flat's floor plan, the center 9 squares form the Brahmasthana (open living space), the North-East squares mark the ideal prayer/study zone, and the South-East squares show the healthiest spot for cooking.",
    relatedTerms: ["brahmasthana", "ishanya-north-east", "marma-sthana"],
    relatedArticles: ["the-geometry-of-the-mandala", "understanding-before-remedies"]
  },
  {
    id: "2",
    slug: "brahmasthana",
    term: "Brahmasthana",
    sanskrit: "ब्रह्मस्थान",
    category: "Architecture",
    meaning: "The exact center of a house, flat, or plot. It represents the Space (Akasha) element and acts as the lungs of the home for light and fresh air.",
    architecturalSignificance: "Should be kept open, clean, and free from heavy pillars, toilets, kitchens, or staircases. In traditional Indian homes (courtyards or Angana), it allows warm indoor air to rise and escape naturally.",
    scripturalReference: "Manasara, Ch. 12",
    imageUrl: "/hero-sanctuary.jpg",
    practicalExample: "In a modern 2BHK or 3BHK flat, the Brahmasthana usually falls in the central living or dining hall. Keeping this central area clutter-free with a light chandelier or simple rug instead of heavy storage cabinets keeps the entire home feeling spacious and peaceful.",
    relatedTerms: ["vastu-purusha-mandala", "marma-sthana", "ishanya-north-east"],
    relatedArticles: ["the-brahmasthana-luminous-heart", "understanding-before-remedies"]
  },
  {
    id: "3",
    slug: "ishanya-north-east",
    term: "Ishanya (North-East)",
    sanskrit: "ईशान्य",
    category: "Directions",
    meaning: "The North-East corner of a home or plot, associated with the Water element (Jala), gentle morning sunlight, mental clarity, and spiritual peace.",
    architecturalSignificance: "Best suited for the prayer room (Puja Ghar), meditation corner, study room, living room windows, or underground water tank. Keep this zone light, clean, and well-lit.",
    scripturalReference: "Samarangana Sutradhara",
    imageUrl: "/heaven-portal.jpg",
    practicalExample: "Opening windows in the North-East lets soft morning UV sunlight enter your home without harsh afternoon heat. Avoid placing a toilet, heavy store room, or septic tank in this corner.",
    relatedTerms: ["brahmasthana", "vastu-purusha-mandala", "agneya-south-east"],
    relatedArticles: ["understanding-before-remedies", "the-geometry-of-the-mandala"]
  },
  {
    id: "4",
    slug: "agneya-south-east",
    term: "Agneya (South-East)",
    sanskrit: "आग्नेय",
    category: "Directions",
    meaning: "The South-East corner governed by the Fire element (Agni). It supports cooking, digestion, good health, and active daily energy.",
    architecturalSignificance: "The ideal zone for the kitchen stove, electrical main board, inverter, geyser, or boiler. Avoid underground water tanks or master bedrooms here.",
    scripturalReference: "Vishvakarma Prakash",
    imageUrl: "/hero-sanctuary.jpg",
    practicalExample: "Placing your kitchen in the South-East ensures morning sunlight sanitizes the cooking counter while prevailing breezes carry cooking heat outward rather than into the living hall.",
    relatedTerms: ["ishanya-north-east", "nairutya-south-west", "vayavya-north-west"],
    relatedArticles: ["understanding-before-remedies", "the-geometry-of-the-mandala"]
  },
  {
    id: "5",
    slug: "nairutya-south-west",
    term: "Nairutya (South-West)",
    sanskrit: "नैऋत्य",
    category: "Directions",
    meaning: "The South-West corner representing the Earth element (Prithvi). It gives stability, sound sleep, financial security, and family leadership.",
    architecturalSignificance: "Should ideally have thicker walls, higher elevation, and heavier furniture. Best location for the Master Bedroom, wardrobes, and safe lockers.",
    scripturalReference: "Mayamatam",
    imageUrl: "/emblem-circle.png",
    practicalExample: "In an Indian family home, giving the South-West bedroom to the head of the family promotes deep rest and emotional stability. Never dig an underground water sump or borewell in the South-West.",
    relatedTerms: ["agneya-south-east", "vayavya-north-west", "vastu-purusha-mandala"],
    relatedArticles: ["the-geometry-of-the-mandala", "understanding-before-remedies"]
  },
  {
    id: "6",
    slug: "vayavya-north-west",
    term: "Vayavya (North-West)",
    sanskrit: "वायव्य",
    category: "Directions",
    meaning: "The North-West corner governed by the Air element (Vayu). It regulates airflow, movement, guest hospitality, and business circulation.",
    architecturalSignificance: "Ideal for the guest bedroom, children's room, finished goods storage in offices, car parking, and ventilation shafts.",
    scripturalReference: "Brihat Samhita",
    imageUrl: "/heaven-portal.jpg",
    practicalExample: "If you run a business or shop, keeping ready-to-sell stock in the North-West helps goods move quickly. In a house, it makes a comfortable guest room or dining area.",
    relatedTerms: ["ishanya-north-east", "nairutya-south-west", "agneya-south-east"],
    relatedArticles: ["the-geometry-of-the-mandala", "the-brahmasthana-luminous-heart"]
  },
  {
    id: "7",
    slug: "ayadi-shadvarga",
    term: "Ayadi Shadvarga",
    sanskrit: "आयादि षड्वर्ग",
    category: "Measures",
    meaning: "A set of six classical Vastu proportion formulas used by architects to calculate harmonious length, breadth, and height of a house.",
    architecturalSignificance: "Checks that the room and building dimensions create positive acoustic and visual harmony (Aya = gain, Vyaya = expense, Yoni = orientation, Ayu = durability).",
    scripturalReference: "Mayamatam, Ch. 9",
    imageUrl: "/palm-leaf-texture.jpg",
    practicalExample: "When designing a new bungalow or temple room, architects adjust the room length-to-width ratio by a few inches so the room feels naturally balanced and proportionate.",
    relatedTerms: ["vastu-purusha-mandala", "marma-sthana", "brahmasthana"],
    relatedArticles: ["the-geometry-of-the-mandala", "understanding-before-remedies"]
  },
  {
    id: "8",
    slug: "marma-sthana",
    term: "Marma Sthana",
    sanskrit: "मर्म स्थान",
    category: "Architecture",
    meaning: "Sensitive energy junction points on the floor-plan grid—similar to vital pressure points in the human body.",
    architecturalSignificance: "Heavy RCC columns, nails, or deep drainage pipes should not pierce the primary Marma points in the center of the house.",
    scripturalReference: "Manasara, Ch. 15",
    imageUrl: "/emblem-circle.png",
    practicalExample: "Before finalizing column positions with a civil engineer, checking the floor plan ensures no heavy pillar sits directly in the exact central point of the living room.",
    relatedTerms: ["brahmasthana", "vastu-purusha-mandala", "ayadi-shadvarga"],
    relatedArticles: ["the-brahmasthana-luminous-heart", "the-geometry-of-the-mandala"]
  },
  {
    id: "9",
    slug: "veedhi-shoola",
    term: "Veedhi Shoola",
    sanskrit: "वीथी शूल",
    category: "Architecture",
    meaning: "A T-junction or dead-end road pointing straight at a plot or house entrance (literally 'Road Spear').",
    architecturalSignificance: "Not all road thrusts are bad! A road coming from the North-East or East brings open light and positive flow, whereas a South-West or South-East road thrust needs a boundary wall and entrance offset.",
    scripturalReference: "Vishvakarma Prakash",
    imageUrl: "/hero-sanctuary.jpg",
    practicalExample: "If your house sits at a T-junction, you do not need to panic or sell the house. Placing the main gate slightly to the side of the oncoming road and planting thick greenery blocks headlight glare and wind dust.",
    relatedTerms: ["ishanya-north-east", "nairutya-south-west", "vastu-purusha-mandala"],
    relatedArticles: ["understanding-before-remedies", "the-geometry-of-the-mandala"]
  }
];

export const PRAKARAN_ARTICLES: Article[] = [
  {
    id: "1",
    slug: "understanding-before-remedies",
    title: "Understanding Before Remedies: Reclaiming Classical Vastu From Modern Superstition",
    sanskritTitle: "उपाय-भ्रान्ति-निवारणम्",
    readTime: "7 min read",
    category: "Classical Vastu Vidya",
    author: "Vastu Ritam Research Desk",
    imageUrl: "/hero-sanctuary.jpg",
    summary: "Why installing commercial pyramids and yantras without understanding simple home physics creates fear rather than genuine peace—and how real Vastu actually works.",
    content: `## Why True Vastu Starts With Simple Understanding, Not Fear

In today's market, Vastu Shastra is often presented through fear. Homeowners and flat buyers are told that a small directional flaw will bring bad luck unless they buy expensive metal pyramids, hang dozens of mirrors, or break down strong walls.

At Vastu Ritam, our foundational rule is simple: **"We do not begin with remedies. We begin with understanding."** Classical texts like *Mayamatam*, *Manasara*, and *Samarangana Sutradhara* were written by master architects, town planners, and natural scientists. They studied how morning sunlight, wind flow, earth magnetism, and heat affect the human body inside a house.

> "When you understand WHY a room is placed in a particular direction, you stop fearing your home and start working with nature."

## The Real Logic Behind Common Vastu Rules

### 1. Why the Kitchen Belongs in the South-East (Agneya)
Morning sunlight comes from the East and North-East, carrying gentle ultraviolet rays that naturally keep water and living spaces fresh. By placing the kitchen in the South-East (Agneya), morning light sanitizes the cooking platform, while prevailing winds carry smoke and cooking heat away from the bedrooms and living hall.

### 2. Why the Master Bedroom Suites the South-West (Nairutya)
The South and South-West walls receive strong afternoon sunlight. Making these walls thicker or placing wardrobes along the South-West wall insulates the bedroom from harsh heat, creating a cool, quiet, and grounded space for deep family rest.

## Practical Home Checklist Before Buying Any Remedy

- **Check Sunlight & Ventilation First**: Is your North-East or East window blocked by heavy curtains or clutter? Open it to let natural daylight enter.
- **Keep the Center (Brahmasthana) Light**: Avoid piling heavy storage trunks or shoe racks in the middle of your flat.
- **Balance Elements Naturally**: If a kitchen is in the North or West in a rented flat, use clean ventilation, warm earthy stone colors under the stove, and proper lighting rather than panic demolition.`,
    keyTakeaway: "True Vastu empowers your family through practical understanding of light, air, and direction rather than fear or expensive commercial trinkets."
  },
  {
    id: "2",
    slug: "the-brahmasthana-luminous-heart",
    title: "The Brahmasthana: The Luminous Heart of Spatial Architecture",
    sanskritTitle: "ब्रह्मस्थानस्य वैज्ञानिक-रहस्यम्",
    readTime: "9 min read",
    category: "Architectural Harmony",
    author: "Ph.D. Research Scholar",
    imageUrl: "/heaven-portal.jpg",
    summary: "A beginner-friendly guide to the Brahmasthana (center of the home), explaining how traditional Indian courtyards keep homes cool, bright, and peaceful—and how to care for it in modern flats.",
    content: `## What is the Brahmasthana in a Home?

The **Brahmasthana** is the exact geometric center of any plot, bungalow, or apartment. In classical Vastu Shastra, it represents the Ether or Space element (*Akasha Tattva*)—the open breathing heart that connects all rooms of your household.

In traditional Indian homes—whether a *Wada* in Maharashtra, a *Haveli* in Rajasthan, or a *Nalukettu* in Kerala—this central zone was always kept open to the sky as an inner courtyard (*Angana* or *Chowk*).

> "Just as the navel and lungs circulate breath through the human body, an open Brahmasthana circulates fresh air and natural light to every corner of the house."

## The Simple Science of the Central Courtyard

Modern green-building science calls this the **Thermal Stack Effect**:

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
    keyTakeaway: "Keeping the center of your home open, clean, and well-lit improves natural airflow, visual spaciousness, and family harmony."
  },
  {
    id: "3",
    slug: "the-geometry-of-the-mandala",
    title: "The Geometry of the Mandala: The 81-Grid Paramashayika Explained",
    sanskritTitle: "परमशायिक मण्डल विवेचनम्",
    readTime: "11 min read",
    category: "Spiritual Knowledge",
    author: "Vastu Ritam Academic Council",
    imageUrl: "/palm-leaf-texture.jpg",
    summary: "Learn how the 9x9 Vastu Purusha Mandala grid divides any home or plot into 81 clear energy squares to help you place entrances, bedrooms, and water tanks accurately.",
    content: `## What is the 81-Grid Paramashayika Mandala?

When planning a residential home, villa, or apartment building, classical Vastu architects divide the floor plan into 9 equal rows and 9 equal columns—creating **81 squares (Padas)** known as the **Paramashayika Mandala**.

Think of this 81-square grid as an intelligent zoning map that tells you what each part of your house is naturally best suited for.

> "The Vastu Mandala is not a mysterious ritual chart—it is India's classical architectural zoning grid for healthy, balanced living."

## The Three Concentric Rings of Your Home

### 1. The Center 9 Squares (Brahma Pada)
The innermost 3x3 squares form the **Brahmasthana**. This is the quiet, open core of the building meant for light, air circulation, and family gathering.

### 2. The Middle Ring of Squares (Daivika & Manusha Padas)
Surrounding the center are the zones for daily family activities—living room, dining area, study tables, and internal walkways where movement is smooth and comfortable.

### 3. The Outer Perimeter of 32 Squares (ishanya to Nairutya)
The outer ring of 32 squares along the walls controls where your **Main Entrance Door (Mukhya Dwara)**, windows, kitchen, and bedrooms should be placed:

- **North & East Entrance Padas**: Entrances in the central-right padas of North (Mukhya, Bhallata) and East (Jayanta, Indra) invite bright light and positive prosperity.
- **South Entrance Padas**: Contrary to popular myth, a South-facing house is auspicious when the main door is placed in the 4th Pada (*Grihakshata*).
- **Corner Zones**: The four corners—Ishanya (NE), Agneya (SE), Nairutya (SW), and Vayavya (NW)—balance the five elements of Water, Fire, Earth, and Air.`,
    keyTakeaway: "By dividing any plot or flat into the 9x9 Paramashayika grid, you can easily find the best spot for your main door, kitchen, and bedrooms without guesswork."
  }
];

export const HANDBOOKS_DATA: Handbook[] = [
  {
    id: "1",
    title: "Vastu for Contemporary Architects",
    subtitle: "A Field Guide to Seamless Integration with Modern CAD & BIM Workflows",
    targetAudience: "Architects & Urban Planners",
    pages: 48,
    topics: ["Solar Vector Mapping", "Brahmasthan in Multi-Story Apartments", "Façade Openings vs Dik-Bala", "Non-Destructive Layout Optimization"],
    summary: "Written specifically for registered architects who want to respect client Vastu sentiments while preserving aesthetic integrity and building code compliance."
  },
  {
    id: "2",
    title: "The Informed Homebuyer's Vastu Checklist",
    subtitle: "What to Observe Before Signing Property Deeds",
    targetAudience: "Home Buyers & Real Estate Investors",
    pages: 36,
    topics: ["Evaluating Main Entrance Pada", "Slope & Drainage Verification", "Surrounding Negative Structures", "Separating Remediable Flaws from Critical Defects"],
    summary: "A transparent, easy-to-follow guide to protect your life savings from high-risk property purchases without being misled by sensationalist claims."
  },
  {
    id: "3",
    title: "Industrial & Factory Spatial Harmonics",
    subtitle: "Aligning Heavy Machinery, Substations, and Inventory Logistics",
    targetAudience: "Plant Managers & Civil Engineers",
    pages: 54,
    topics: ["Earth-Bearing Capacity in Nairutya", "Hazardous Chemical Storage in Agni", "Raw Material Inflow vs Finished Goods Outflow", "Workforce Well-being"],
    summary: "A practical technical treatise for manufacturing facilities, warehouse logistics, and corporate processing plants."
  }
];

export const MYTHS_DATA: MythItem[] = [
  {
    id: "1",
    myth: "All South-facing homes or entrances are inauspicious and bring misfortune.",
    misconceptionContext: "A widespread commercial myth that has caused property buyers to reject otherwise structurally sound and well-lit properties.",
    classicalTruth: "Classical texts like Brihat Samhita and Mayamatam divide each direction into 8 equal entrance zones (Padas). In the South, entrances positioned in the 3rd and 4th Padas (named Vitatha and Grihakshata) are highly praised for prosperity and disciplined success.",
    scripturalPrinciple: "Mayamatam Ch. 9, Sloka 42 explicitly enumerates the beneficial padas of the Southern sector for specific vocations and administrative strength.",
    practicalHarm: "Unnecessary panic, refusal of good real estate investments, and arbitrary alterations."
  },
  {
    id: "2",
    myth: "You must break walls or demolish structures to correct any Vastu defect.",
    misconceptionContext: "Fear-mongering advice that leads to expensive structural damage and legal building violations.",
    classicalTruth: "Traditional texts prioritize functional repurposing, elemental rebalancing (Pancha Tattva adjustment through lighting, colors, textures, sound), and usage realignment. Structural demolition is strictly a last resort and often counter-indicated if it harms the overall structural integrity.",
    scripturalPrinciple: "Vishvakarma Prakash emphasizes that disturbing load-bearing Marmas (vital points) during haphazard demolition creates far greater disturbance than the original defect.",
    practicalHarm: "Huge financial loss, weakening of RCC frames, and severe emotional distress."
  },
  {
    id: "3",
    myth: "Installing numerous metallic pyramids and plastic yantras fixes everything.",
    misconceptionContext: "Commercialization where vendors sell mass-manufactured items claiming instant miracle remedies.",
    classicalTruth: "Authentic Vastu does not rely on commercial trinkets. A yantra is a sacred geometric contemplative device used in sadhana; it does not nullify severe architectural misplacements like an underground septic tank in the North-East or a kitchen in the South-West.",
    scripturalPrinciple: "'We do not begin with remedies. We begin with understanding.' First principles must be respected; remedies are only meaningful when the underlying spatial mechanics are addressed.",
    practicalHarm: "False sense of security while root environmental problems remain unaddressed."
  },
  {
    id: "4",
    myth: "Vastu is a religious dogma tied only to ritualistic belief.",
    misconceptionContext: "Dismissal of Vastu as mere superstition or exclusively sectarian ritual.",
    classicalTruth: "Vastu Shastra is fundamentally an ancient architectural and environmental science combining geobiology, solar astronomy, magnetism, and structural mechanics. It applies universally to any enclosed human dwelling on Earth.",
    scripturalPrinciple: "Treatises such as Samarangana Sutradhara discuss materials, stone selection, soil testing (Bhumi Pariksha), and water table depths with scientific objectivity.",
    practicalHarm: "Deprives modern design of millennia of empirical spatial wisdom."
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "1",
    name: "Ar. Rajesh Mehta",
    designation: "Senior Principal Architect",
    organization: "Mehta & Associates Architects",
    location: "Mumbai & Pune",
    quote: "Working with Vastu Ritam has completely transformed how our firm views Vastu. For the first time, we collaborated with scholars who speak the language of architecture, solar angles, and structural loads. They never demanded arbitrary demolition or superstitious remedies. Their recommendations enhanced our spatial flow while giving our clients absolute peace of mind.",
    category: "Architect",
    avatarInitials: "RM"
  },
  {
    id: "2",
    name: "Er. Anand Kulkarni",
    designation: "Chief Structural Consultant",
    organization: "Apex Infrastructure Solutions",
    location: "Bengaluru",
    quote: "As a structural engineer with 25 years of experience, I was historically skeptical of Vastu consultants who would recommend cutting columns or puncturing beams. Vastu Ritam's approach is founded on first principles and classical research. Their intellectual honesty and non-destructive methodology make them the gold standard for our projects.",
    category: "Engineer",
    avatarInitials: "AK"
  },
  {
    id: "3",
    name: "Sunita Rao",
    designation: "Creative Director",
    organization: "Sanskriti Interior Design Studio",
    location: "Hyderabad",
    quote: "Their motto 'We do not begin with remedies. We begin with understanding' is 100% genuine. Instead of cluttering my interior designs with random brass items, they guided us on lighting, subtle material textures, and functional zone allocations. Our luxury villa clients are deeply satisfied.",
    category: "Interior Designer",
    avatarInitials: "SR"
  },
  {
    id: "4",
    name: "Vikram & Meera Joshi",
    designation: "Homeowners",
    organization: "Independent Villa Residents",
    location: "Ahmedabad",
    quote: "Before moving into our new bungalow, we were terrified by conflicting advice from relatives and internet videos. Vastu Ritam took our floor plan, patiently explained the logic behind every direction, and helped us make minor furniture and room adjustments without spending a fortune. Our home feels profoundly serene.",
    category: "Homeowner",
    avatarInitials: "VJ"
  },
  {
    id: "5",
    name: "Siddharth Singhania",
    designation: "Managing Director",
    organization: "Singhania Polymers Pvt. Ltd.",
    location: "Surat Industrial Corridor",
    quote: "When we expanded our manufacturing plant, our machinery layout had complex logistical constraints. Vastu Ritam worked with our plant engineers to balance heavy earth zones and electrical substations seamlessly. The clarity, professionalism, and research grounding were extraordinary.",
    category: "Commercial",
    avatarInitials: "SS"
  }
];

export const DIRECTIONAL_ZONES = [
  {
    code: "NE",
    name: "Ishanya (ईशान्य)",
    direction: "North-East",
    element: "Water & Ether (जल / आकाश)",
    deity: "Ishana (Shiva)",
    attributes: "Wisdom, clarity, spiritual influx, pristine purity",
    recommendation: "Prayer sanctuary, study, library, light water bodies, open terrace",
    caution: "Avoid toilets, kitchens, overhead heavy water tanks, or staircases"
  },
  {
    code: "E",
    name: "Purva (पूर्व)",
    direction: "East",
    element: "Solar Light (सूर्य / अग्नि)",
    deity: "Indra & Surya",
    attributes: "Vitality, vision, early morning prana, enlightenment",
    recommendation: "Main entrance, living room, expansive window glazing, verandas",
    caution: "Keep boundaries low; avoid tall blocking structures that obstruct morning light"
  },
  {
    code: "SE",
    name: "Agneya (आग्नेय)",
    direction: "South-East",
    element: "Fire (अग्नि)",
    deity: "Agni Deva",
    attributes: "Transformation, digestive metabolic fire, active energy",
    recommendation: "Kitchen culinary hearth, electric meters, generators, boiler units",
    caution: "Strictly avoid water sumps, master bedrooms, and prolonged restful stays"
  },
  {
    code: "S",
    name: "Dakshina (दक्षिण)",
    direction: "South",
    element: "Earth / Heavy Fire (पृथ्वी / अग्नि)",
    deity: "Yama",
    attributes: "Discipline, legal stability, fame, endurance",
    recommendation: "Bedrooms, heavy furniture, higher boundary walls, overhead storage",
    caution: "Avoid deep underground water reservoirs or sunken open atriums"
  },
  {
    code: "SW",
    name: "Nairutya (नैऋत्य)",
    direction: "South-West",
    element: "Earth (पृथ्वी)",
    deity: "Nirriti",
    attributes: "Stability, authority, grounding, load bearing",
    recommendation: "Master bedroom, owner's executive cabin, heaviest building height",
    caution: "Never locate underground water sumps, wells, main entrance, or open voids"
  },
  {
    code: "W",
    name: "Pashchima (पश्चिम)",
    direction: "West",
    element: "Water / Air (जल / वायु)",
    deity: "Varuna",
    attributes: "Sustenance, celebration, financial stability",
    recommendation: "Dining room, children's bedroom, overhead water tanks, study desks",
    caution: "Avoid keeping it lower in elevation than the East or North"
  },
  {
    code: "NW",
    name: "Vayavya (वायव्य)",
    direction: "North-West",
    element: "Air (वायु)",
    deity: "Vayu Deva",
    attributes: "Movement, change, communication, commercial velocity",
    recommendation: "Guest bedroom, dispatch storage, garage, married daughters' room",
    caution: "Do not place master bedroom or heavy permanent vaults here"
  },
  {
    code: "N",
    name: "Uttara (उत्तर)",
    direction: "North",
    element: "Water / Magnetic (जल / चुम्बकीय)",
    deity: "Kuber (Lord of Wealth)",
    attributes: "Prosperity, cash flow, new career opportunities, magnetic prana",
    recommendation: "Cash lockers, accounts department, open gardens, water fountains",
    caution: "Avoid heavy clutter, waste dumps, and high solid obstruction walls"
  },
  {
    code: "CENTER",
    name: "Brahmasthana (ब्रह्मस्थान)",
    direction: "Center / Navel",
    element: "Ether (आकाश)",
    deity: "Lord Brahma",
    attributes: "Universal cosmic balance, life breath, spatial equilibrium",
    recommendation: "Open courtyard, luminous skylight, unencumbered circulation hall",
    caution: "No structural columns, staircases, toilets, septic tanks, or heavy machinery"
  }
];
