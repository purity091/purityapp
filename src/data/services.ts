import { Service } from '../types';

export const services: Service[] = [
    {
        id: '9',
        name: 'Deep Cleaning',
        description: `Our Deep Cleaning service is an intensive, top-to-bottom cleaning solution designed to reach areas often missed in routine cleaning. It is ideal for homes, offices, or commercial spaces requiring complete sanitation and restoration.

The process includes:
Kitchen: Degreasing of ovens, stoves, cabinets, countertops, and sinks; sanitizing cutting boards and appliances.
Bathrooms: Thorough scrubbing of tiles, grout, toilets, bathtubs, sinks, and faucets; removal of soap scum and lime deposits.
Floors & Carpets: Deep vacuuming, shampooing, steam cleaning, and polishing for tiles, hardwood, and carpets.
Furniture & Upholstery: Dusting, stain treatment, and deodorizing sofas, chairs, and mattresses.
High-touch Areas: Door handles, switches, remote controls, railings, and air vents sanitized to reduce bacteria and allergens.

Deep Cleaning is recommended for periodic maintenance, pre- or post-renovation, and situations requiring the highest level of hygiene. This service improves air quality, enhances the appearance of your space, and promotes a healthier living or working environment.`,
        price: 45,
        category: 'Home Cleaning',
        rating: 5.0,
        image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=800',
        offerTag: 'Recommended',
        soldCount: 200,
        icon: 'sparkles'
    },
    {
        id: '10',
        name: 'Regular Cleaning',
        description: `Our Regular Cleaning service provides a consistent, professional solution for maintaining cleanliness and hygiene in your home or office. Designed to be flexible, it can be scheduled daily, weekly, or bi-weekly.

Service features include:
General Surface Cleaning: Dusting, wiping, and sanitizing surfaces including desks, tables, and shelves.
Floor Maintenance: Sweeping, mopping, and vacuuming to keep floors spotless and safe.
Bathroom & Kitchen Upkeep: Cleaning sinks, countertops, and fixtures; replenishing essentials; removing light stains and residues.
Trash Removal: Collection and disposal of garbage and recyclables.

This service helps maintain a consistently clean, welcoming, and safe environment, reducing buildup of dirt, allergens, and germs over time. It is ideal for busy households and professional workspaces seeking ongoing hygiene and organization.`,
        price: 35,
        category: 'Home Cleaning',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
        soldCount: 600,
        icon: 'home'
    },
    {
        id: '1',
        name: 'Floor Cleaning',
        description: `Our Floor Cleaning service is designed to restore the appearance, hygiene, and durability of all types of flooring. We handle tile, marble, granite, vinyl, laminate, hardwood, and concrete floors using surface-appropriate equipment and cleaning agents.

The process begins with dust and debris removal to prevent scratches, followed by deep cleaning using professional-grade scrubbers and neutral-pH solutions that remove embedded dirt, grease, and bacteria. For stone and marble floors, specialized non-acidic products are used to protect the surface while enhancing natural shine. High-traffic areas receive extra attention to eliminate stains and discoloration.

This service not only improves appearance but also extends the lifespan of flooring, reduces slip hazards, and ensures a healthier indoor environment.`,
        price: 200,
        originalPrice: 300,
        category: 'Flooring',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=800',
        offerTag: 'Popular',
        isPopular: true,
        soldCount: 320,
        icon: 'sparkles'
    },
    {
        id: '2',
        name: 'Carpet Cleaning',
        description: `Our Carpet Cleaning service delivers deep sanitation beyond surface vacuuming. It targets dust mites, allergens, bacteria, odors, and deep-seated stains trapped within carpet fibers.

We use advanced methods such as hot water extraction (steam cleaning) or low-moisture techniques depending on carpet type and condition. Pre-treatment solutions loosen dirt and stains, followed by powerful extraction that removes contaminants without damaging fibers or colors.

This service is ideal for homes, offices, hotels, and commercial spaces, helping improve air quality, restore carpet texture, and maintain a fresh, clean appearance.`,
        price: 200,
        originalPrice: 250,
        category: 'Home Cleaning',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
        soldCount: 210,
        icon: 'home'
    },
    {
        id: '3',
        name: 'Mattress Cleaning',
        description: `Mattresses accumulate sweat, dead skin cells, dust mites, and bacteria over time. Our Mattress Cleaning service focuses on deep hygiene and allergen removal, not just visual cleanliness.

The process includes vacuum extraction with HEPA filtration, targeted stain treatment, antibacterial steam or low-moisture cleaning, and deodorization. We use child-safe and eco-friendly products to ensure safety for all household members.

Regular mattress cleaning improves sleep quality, reduces allergy symptoms, and extends the mattress lifespan while maintaining a healthier sleeping environment.`,
        price: 150,
        originalPrice: 200,
        category: 'Furniture',
        rating: 5.0,
        image: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&q=80&w=800',
        offerTag: 'Best Seller',
        soldCount: 540,
        icon: 'bed'
    },
    {
        id: '4',
        name: 'Sofa Cleaning',
        description: `Our Sofa Cleaning service is customized for fabric, leather, suede, and microfiber upholstery. It removes stains, body oils, dust, and odors while preserving fabric texture and color.

The service starts with fabric inspection and testing, followed by deep vacuuming. Specialized cleaning solutions are applied to break down dirt, then extracted using professional equipment. Leather sofas receive conditioning treatments to prevent cracking and dryness.

This service revitalizes furniture, enhances comfort, and helps maintain a clean and presentable living or office space.`,
        price: 35,
        originalPrice: 180,
        category: 'Furniture',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
        soldCount: 420,
        icon: 'sofa'
    },
    {
        id: '5',
        name: 'Curtain Cleaning',
        description: `Curtains trap dust, smoke particles, allergens, and odors while often being overlooked. Our Curtain Cleaning service restores freshness and cleanliness without damaging fabric or structure.

Depending on fabric type, we use on-site steam cleaning, low-moisture cleaning, or controlled dry-cleaning methods. This ensures minimal shrinkage, color protection, and effective dust removal.

Clean curtains improve indoor air quality, enhance natural light, and refresh the overall look of the room.`,
        price: 200,
        originalPrice: 150,
        category: 'Home Cleaning',
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
        soldCount: 150,
        icon: 'wind'
    },
    {
        id: '7',
        name: 'Office Cleaning',
        description: `Our Office Cleaning service ensures a clean, organized, and hygienic work environment that supports productivity and employee well-being.

Services include desk and workstation cleaning, floor care, carpet vacuuming, trash removal, restroom sanitation, pantry cleaning, and disinfection of high-touch surfaces such as door handles, switches, and shared equipment.

We follow structured cleaning checklists and can operate daily, weekly, or on a custom schedule, using safe disinfectants that meet workplace hygiene standards.

A clean office enhances company image, reduces illness-related absences, and creates a professional atmosphere for staff and visitors.`,
        price: 499,
        originalPrice: 650,
        category: 'Commercial',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
        offerTag: 'Corporate',
        soldCount: 50,
        icon: 'briefcase'
    },
    {
        id: '8',
        name: 'Housekeeping / Part-time Maid',
        description: `Our Housekeeping and Part-time Maid service provides flexible, reliable assistance for daily or periodic household tasks.

Services may include sweeping, mopping, dusting, kitchen and bathroom cleaning, dishwashing, laundry assistance, bed making, and general home organization. The service can be scheduled hourly, daily, weekly, or monthly, depending on client needs.

All staff are trained to follow hygiene standards, respect privacy, and handle household items with care. This service is ideal for busy families, working professionals, and elderly households seeking consistent home support.`,
        price: 35,
        category: 'Home Cleaning',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=800',
        isPopular: true,
        soldCount: 1200,
        icon: 'user'
    },
    {
        id: '11',
        name: 'Babysitting At Home',
        description: `Our Babysitting At Home service offers professional, reliable, and safe childcare tailored to your family’s needs. Our trained sitters ensure a nurturing environment for children of all ages.

Key features:
Supervision and monitoring for safety and well-being.
Educational and recreational activities tailored to the child’s age and development stage.
Meal preparation and feeding assistance, following dietary instructions.
Assistance with homework, reading, storytelling, and skill-building activities.
Flexible hours, including part-time, full-time, or on-demand support.

All babysitters are background-checked, trained in first aid, and equipped to handle emergencies. This service provides parents peace of mind while promoting safe, engaging, and structured care for children at home.`,
        price: 250,
        category: 'Care',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800',
        isPopular: true,
        soldCount: 90,
        icon: 'heart'
    },
    {
        id: '12',
        name: 'Move In/Out Cleaning',
        description: `Our Move In/Out Cleaning service ensures properties are spotless and ready for occupancy or handover. This specialized service is ideal for tenants, landlords, or homeowners transitioning between properties.

Key tasks include:
Kitchen & Bathroom: Degreasing, deep scrubbing, disinfecting surfaces, cabinets, appliances, sinks, toilets, bathtubs, and tiles.
Floors & Carpets: Dust, stain, and debris removal; steam cleaning for carpets; polishing or waxing for hardwood and tiles.
Walls & Fixtures: Spot cleaning, dusting light fixtures, switches, doors, and window sills.
Odor Removal: Deodorizing rooms and closets to ensure a fresh environment.

Move In/Out Cleaning guarantees the space is pristine, hygienic, and welcoming, helping landlords impress tenants and ensuring renters move into a clean, healthy home.`,
        price: 35,
        category: 'Home Cleaning',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&q=80&w=800',
        soldCount: 150,
        icon: 'sparkles'
    },
    {
        id: '13',
        name: 'Party Cleaning',
        description: `Our Party Cleaning service handles all pre- and post-event cleaning to keep your venue spotless, stress-free, and ready for guests.

Services include:
Pre-Party Preparation: Floor cleaning, surface dusting, table setup, and sanitization of kitchens and bathrooms.
Post-Party Cleanup: Garbage disposal, leftover food removal, wiping surfaces, vacuuming or mopping floors, and sanitizing restrooms.
Special Treatments: Carpet shampooing, furniture spot cleaning, and stain removal for spills.

This service is perfect for birthday parties, corporate events, weddings, or social gatherings, saving you time and ensuring a safe, hygienic, and presentable environment for everyone.`,
        price: 35,
        category: 'Home Cleaning',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
        soldCount: 80,
        icon: 'sparkles'
    },
    {
        id: '14',
        name: 'Wash and Iron',
        description: `Our Wash and Iron service offers professional laundry care for clothing, linens, and household fabrics. We focus on maintaining fabric quality, colors, and longevity.

Service includes:
Sorting and Treatment: Separate washing by color, fabric, and care requirements; pre-treatment of stains and delicate items.
Professional Washing: Use of appropriate detergents, softeners, and washing methods.
Ironing & Folding: Precision ironing to ensure garments are wrinkle-free; careful folding for storage.
Optional Delivery: Cleaned items can be picked up and delivered to your home or office.

This service helps you maintain a fresh, neat, and polished wardrobe while saving time and effort for busy professionals and families.`,
        price: 35,
        category: 'Laundry',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=800',
        soldCount: 300,
        icon: 'shirt'
    },
    {
        id: '15',
        name: 'Pet Sitting',
        description: `Our Pet Sitting service provides reliable care for your pets when you are away, ensuring they remain happy, safe, and healthy.

Key features:
Daily feeding according to dietary instructions.
Playtime, exercise, and companionship to keep pets active and stress-free.
Cleaning of litter boxes, cages, or bedding.
Administering medication if needed and monitoring health signs.
Flexible schedules including short-term, overnight, or extended stays.

All pet sitters are experienced with animals, trained in safety protocols, and committed to providing love and attention. This service ensures your pet experiences minimal stress and maximum care in your absence.`,
        price: 35,
        category: 'Care',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800',
        soldCount: 75,
        icon: 'heart'
    }
];

export const clientReviews = [
    { id: 1, name: "Mohammed Al-Otaibi", comment: "Excellent and fast service, very professional cleaning team.", rating: 5 },
    { id: 2, name: "Sarah Al-Ahmed", comment: "Cleaning was flawless, and the dealing was classy. Highly recommend them.", rating: 5 },
    { id: 3, name: "Khalid Al-Dossari", comment: "Reasonable prices for high quality. Thanks Purity.", rating: 4 },
];
