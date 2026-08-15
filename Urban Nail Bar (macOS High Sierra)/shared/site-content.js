/**
 * Urban Nail Bar - Website Content Layer
 * Independent of shared/data-manager.js so website content (jingle, hero,
 * gallery, reviews, contact info) survives edits to the core data file.
 * Also self-heals the shared services menu and salon identity whenever
 * any website page loads: if they still match a factory default, they get
 * upgraded to the Urban Nail Bar versions.
 *
 * Used by: website.html, gallery.html, website-admin.html, booking.html
 */

const UNB_CONTENT_KEY = 'unb_site_content_v2';
const UNB_CONTENT_SYNC_KEY = 'unb_site_content_v2_sync';

// ===================== DEFAULT WEBSITE CONTENT =====================
const UNB_DEFAULT_CONTENT = {
    salonName: 'Urban Nail Bar',
    salonPhone: '(480) 291-5440',
    salonAddress: '9290 East Vía de Ventura Suite #103, Scottsdale, AZ 85258',
    // Live site publishes phone only (no public email) — Email Us falls back to contact form
    salonEmail: '',
    sitePhone: '(480) 291-5440',
    siteEmail: '',
    siteMapUrl: 'https://www.google.com/maps/search/?api=1&query=Urban+Nail+Bar+LLC+9290+East+Via+de+Ventura+Suite+103+Scottsdale+AZ+85258',
    siteDirectionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Urban+Nail+Bar+LLC%2C+9290+East+Via+de+Ventura+Suite+103%2C+Scottsdale%2C+AZ+85258',
    siteMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3944.075791248265!2d-111.8805589!3d33.554083399999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b0b875ed02aad%3A0x27b5654f8161c515!2sUrban%20Nail%20Bar%20LLC!5e1!3m2!1sen!2s!4v1773384287072!5m2!1sen!2s',

    openTime: '09:30',
    closeTime: '18:30',
    sunOpenTime: '11:00',
    sunCloseTime: '17:00',

    siteAnnouncement: '✨ $5 OFF any Mani + Pedi Combo — Book Today! ✨',
    discountAds : [
        { title: 'New Client', text: '10% OFF your first visit', icon: 'fa-sparkles' },
        { title: 'First Timer', text: 'Welcome deal — 10% OFF', icon: 'fa-hand-holding-heart' },
        { title: 'Birthday', text: 'Celebrate with 20% OFF', icon: 'fa-cake-candles' },
        { title: 'Senior', text: '15% OFF for seniors', icon: 'fa-user-friends' },
        { title: 'Military', text: '25% OFF with ID', icon: 'fa-medal' },
        { title: 'Ask Us', text: 'Custom discounts available', icon: 'fa-tags' }
    ],
    siteJingle: 'Buff it, dip it, make it glow — mani, pedi, steal the show!',
    siteJingleSub: 'Manicure • Pedicure • Waxing • Lashes • Dip Powder',
    siteHeroTitle: 'Modern nail care in Scottsdale',
    siteHeroSubtitle: 'Enjoy manicures, pedicures, nail enhancements, and custom designs in a clean, polished salon environment tailored to your style.',
    siteTagline: 'Look good and feel even better',
    siteSource: 'https://urbannailbarscottsdale.com',
    siteRating: 4.8,
    siteReviewCount: 1150,

    // Review + social links (Urban Nail Bar — Scottsdale, AZ)
    siteReviewLinks: [
        { id: 'google', label: 'Google Reviews', shortLabel: 'Google', url: 'https://share.google/tSfd3wWwhLNeabaV9', icon: 'fa-google' },
        { id: 'yelp', label: 'Yelp Reviews', shortLabel: 'Yelp', url: 'https://www.yelp.com/biz/urban-nail-bar-scottsdale', icon: 'fa-yelp' },
        { id: 'facebook', label: 'Facebook Reviews', shortLabel: 'Facebook', url: 'https://www.facebook.com/urbannailbarscottsdale', icon: 'fa-facebook-f' }
    ],
    siteSocialLinks: [
        { id: 'instagram', label: 'Instagram', shortLabel: 'Instagram', url: 'https://www.instagram.com/urbannailbar_az', icon: 'fa-instagram' },
        { id: 'tiktok', label: 'TikTok', shortLabel: 'TikTok', url: 'https://www.tiktok.com/@urban_nailbar', icon: 'fa-tiktok' }
    ],

    // Contact page copy / hours from urbannailbarscottsdale.com/contact
    siteContactTitle: 'Start your journey now',
    siteContactSubtitle: 'Phone, hours, map, and social links — or send us a message below.',
    siteContactInfoLabel: 'Information',
    siteHoursLabel: 'Hours',
    siteHoursWeekdayLabel: 'Mon - Sat',
    siteHoursWeekday: '9:30 AM - 6:30 PM',
    siteHoursSundayLabel: 'Sun',
    siteHoursSunday: '11:00 AM - 5:00 PM',
    siteContactCtaTitle: 'Book your next nail appointment',
    siteContactCtaBody: 'Visit Urban Nail Bar LLC in Scottsdale for elevated nail care in a polished, welcoming space. We are here to help you relax, refresh, and leave feeling confident.',
    siteContactCtaBtn: 'Book now',

    siteAboutTitle: '💛 What Makes Us Different 💛',
    siteAboutLead: 'Our Luxurious Phenomenal Treatments & Premium Spectacular Offerings',
    siteAboutBody: 'Urban Nail Bar is dedicated to creating a clean, welcoming, and relaxing salon experience where every manicure, pedicure, and enhancement service is delivered with care, consistency, and attention to detail.',
    siteAboutStory: 'Located at 9290 East Vía de Ventura Suite #103 in Scottsdale, Urban Nail Bar offers a modern nail salon experience focused on comfort, cleanliness, and beautiful results. We welcome guests looking for dependable everyday maintenance as well as elevated nail designs for special occasions.',
    siteWhyChooseUs: [
        'Our pedicures leave your feet soft and smooth — and include a relaxing massage to help you unwind.',
        'Our manicures can be customized with a variety of colors and designs to fit your personal style.',
        'In addition to nail services, we offer waxing for silky-smooth skin, plus lash and eyebrow tinting to add depth and dimension.'
    ],
    siteServicesCategories: 'Manicure · Pedicure · Enhancements · Dip · Waxing · Lashes & more',
    siteServicesIntro: 'Explore our manicure, pedicure, nail enhancement, and design options to find the services that best match your style, routine, and occasion. From simple upkeep to detailed sets and finishing touches, our menu gives you plenty of choices before you book online.',
    siteServicesNote: 'Want it perfect and need it quick? It’s always important to take good care of yourself — you deserve every bit of it.',
    siteWorkSectionTitle: 'Our Craft & Services',
    siteWorkSubnote: 'Premium nail art & signature finished looks by our talented team.',
    siteFooterCopyright: 'Copyright ©2026 Urban Nail Bar. Created, managed & run by Urban Nail Bar.',

    siteTestimonials: [
        { name: 'Libby Engelbrecht', date: '2024-12-27', text: 'Love this place! Great staff and amazing work.' },
        { name: 'Daniel Whitlatch', date: '2024-12-19', text: 'Love this place! They treat my daughter and I like family.' },
        { name: 'Sophia Koritz', date: '2024-12-19', text: 'Always do an amazing job! Love my nails — Diane and Ly are both great!' },
        { name: 'Claire Haugner', date: '2024-07-25', text: 'Best nail salon in Scottsdale!! :)' },
        { name: 'Kellie Decou', date: '2024-07-25', text: 'This was the best pedicure I have ever had — ask for Pam, she is amazing!' }
    ],

    sitePolicies: [
        {
            title: 'Refunds, Returns and Exchanges',
            body: 'If your nails get scratched or misshapen, we will fix them for you. Please inform the salon within 24 hours of your initial service, and schedule a repair appointment within one week. We do not offer refunds or credit notes for a change of mind. If you are unhappy with the quality of our work, we will redo the service at no extra cost when you tell us right away after the service. Once you leave the salon, it is assumed you are satisfied. Damage due to negligence may be charged for repair or replacement. If you are unsure about nail care, ask your technician.'
        },
        {
            title: 'Punctuality',
            body: 'If you think you will be late, please let a salon coordinator know. Delays of more than ten minutes may mean we cannot complete all booked services — we will do our best, but we cannot promise a full service window.'
        },
        {
            title: 'Personal Belongings',
            body: 'Urban Nail Bar cannot be held accountable for personal belongings damaged during services. Please handle nail polishes with caution and make sure you have not left any possessions behind.'
        },
        {
            title: 'Payment Methods',
            body: 'You can pay for services and products with cash, Visa, MasterCard, Discover, or Urban Nail Bar Gift Certificates. We do not accept checks or other forms of payment.'
        },
        {
            title: 'Gift Card / Voucher Terms',
            body: 'Gift cards cannot be exchanged for cash or used for cash advances. We are not responsible for redeeming expired gift cards. Lost or stolen gift cards will not be replaced or refunded. Gift cards cannot be cancelled — please keep them safe as you would cash.'
        },
        {
            title: 'What You Need To Do',
            body: 'Tell us which service you would like (our salon manager can help if you are unsure). Inform staff of any allergies before service begins. Share feedback during your visit so we can meet your needs immediately. Raise concerns about the salon, staff, or services with the salon manager right away. Notify the manager immediately if you suspect an infection or unusual reaction related to your nails.'
        }
    ],

    // Split galleries (July 2026): interiors vs nail work. siteGallery = concat for older consumers.
    siteSalonGallery: [
        { url: '../assets/images/salon-1.jpg', caption: 'Pedi & mani stations' },
        { url: '../assets/images/salon-2.jpg', caption: 'Inside the salon' },
        { url: '../assets/images/salon-3.jpg', caption: 'Welcome desk & logo wall' },
        { url: '../assets/images/salon-4.jpg', caption: 'Polish wall' },
        { url: '../assets/images/salon-5.jpg', caption: 'Rinse & vanity area' }
    ],
    siteWorkGallery: [
        { url: '../assets/images/gallery-1.jpg', caption: 'Earthy French tips' },
        { url: '../assets/images/gallery-2.jpg', caption: 'Lavender French' },
        { url: '../assets/images/gallery-3.jpg', caption: 'Watercolor & crystals' },
        { url: '../assets/images/gallery-4.jpg', caption: 'Marble & silver art' },
        { url: '../assets/images/gallery-5.jpg', caption: 'Pink & teal glitter' },
        { url: '../assets/images/gallery-6.jpg', caption: 'Blue glitter bridal' }
    ],
    siteGallery: [
        { url: '../assets/images/salon-1.jpg', caption: 'Pedi & mani stations' },
        { url: '../assets/images/salon-2.jpg', caption: 'Inside the salon' },
        { url: '../assets/images/salon-3.jpg', caption: 'Welcome desk & logo wall' },
        { url: '../assets/images/salon-4.jpg', caption: 'Polish wall' },
        { url: '../assets/images/salon-5.jpg', caption: 'Rinse & vanity area' },
        { url: '../assets/images/gallery-1.jpg', caption: 'Earthy French tips' },
        { url: '../assets/images/gallery-2.jpg', caption: 'Lavender French' },
        { url: '../assets/images/gallery-3.jpg', caption: 'Watercolor & crystals' },
        { url: '../assets/images/gallery-4.jpg', caption: 'Marble & silver art' },
        { url: '../assets/images/gallery-5.jpg', caption: 'Pink & teal glitter' },
        { url: '../assets/images/gallery-6.jpg', caption: 'Blue glitter bridal' }
    ],
    siteLogo: '../assets/images/logo.png',
    siteHeroImage: '../assets/images/nail-hero-image.png',
    siteHeroBg: '../assets/images/nail-hero-bg.png',

    // Salon Home (index.html) — editable from Admin → Website & Home
    homeTagline: 'Booking Management System',
    homeClientsLabel: 'For Clients',
    homeStaffLabel: 'Staff & Alert',

    // Our Salon gallery section (website #gallery)
    siteSalonSectionTitle: 'Urban Nail Bar',
    siteSalonFamily: 'The Urban Nail Bar Family',
    siteSalonWelcome: 'Would Like To Welcome You To Our Wonderful Family Friendly Environment Salon & Spa Located in Scottsdale, Arizona.',
    siteSalonSubhead: 'Our Salon',
    siteSalonSubnote: 'A Quick Look At Our Scottsdale Salon Space!'
};

// ===================== URBAN NAIL BAR MENU =====================
// Sections: Manicure, Pedicure, Nail Enhancements, Dip Powder, Waxing, Lashes, Kid Menu, Fix & Removal, Add-ons
// priceNote: '+' shows as "$XX+" starting-price style; popular: shows in quick-book
const UNB_MENU = [
    { id: 3, name: 'Acrylic Fullset Color Powder', price: 65, duration: 90, category: 'Nail Enhancements', priceNote: '+' },
    { id: 4, name: 'Acrylic Fullset Gel Polish', price: 65, duration: 90, category: 'Nail Enhancements', priceNote: '+' },
    { id: 7, name: 'Acrylic Fill Color Powder', price: 55, duration: 75, category: 'Nail Enhancements', priceNote: '+' },
    { id: 8, name: 'Acrylic Fill Gel Polish', price: 55, duration: 75, category: 'Nail Enhancements', priceNote: '+' },
    { id: 5, name: 'Gel X Fullset', price: 70, duration: 90, category: 'Nail Enhancements', priceNote: '+', popular: true },
    { id: 9, name: 'Gel X Fill', price: 60, duration: 75, category: 'Nail Enhancements', priceNote: '+' },
    { id: 1, name: 'Polygel Fullset', price: 70, duration: 90, category: 'Nail Enhancements', priceNote: '+' },
    { id: 2, name: 'Polygel Fill', price: 60, duration: 75, category: 'Nail Enhancements', priceNote: '+' },
    { id: 6, name: 'Liquid Gel Fullset', price: 70, duration: 70, category: 'Nail Enhancements', priceNote: '+' },
    { id: 10, name: 'Liquid Gel Fill', price: 60, duration: 75, category: 'Nail Enhancements', priceNote: '+' },
    { id: 11, name: 'Soak Off with Service', price: 5, duration: 0, category: 'Add-ons' },
    { id: 12, name: 'Extra Tip Length', price: 5, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 13, name: 'Shape', price: 5, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 14, name: 'Add Cuticle Trim', price: 10, duration: 0, category: 'Add-ons' },
    { id: 15, name: 'Regular French', price: 10, duration: 0, category: 'Add-ons' },
    { id: 16, name: '2 Nails with Art', price: 10, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 17, name: 'Chrome', price: 15, duration: 0, category: 'Add-ons' },
    { id: 18, name: 'Cateye', price: 15, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 19, name: 'Ombre', price: 15, duration: 0, category: 'Add-ons' },
    { id: 20, name: 'Dip with Tips', price: 60, duration: 75, category: 'Dip Powder', priceNote: '+' },
    { id: 21, name: 'Dip Overlay', price: 50, duration: 60, category: 'Dip Powder', priceNote: '+', popular: true },
    { id: 22, name: 'Soak Off with Service', price: 5, duration: 0, category: 'Add-ons' },
    { id: 23, name: 'Extra Tip Length', price: 5, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 24, name: 'Shape', price: 5, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 25, name: 'Add Cuticle Trim', price: 10, duration: 0, category: 'Add-ons' },
    { id: 26, name: 'Regular French', price: 10, duration: 0, category: 'Add-ons' },
    { id: 27, name: '2 Nails with Art', price: 10, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 28, name: 'Deep French', price: 15, duration: 0, category: 'Add-ons' },
    { id: 29, name: 'Chrome', price: 15, duration: 0, category: 'Add-ons' },
    { id: 30, name: 'Cateye', price: 15, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 31, name: 'Ombre', price: 15, duration: 0, category: 'Add-ons' },
    { id: 32, name: 'Regular Manicure', price: 30, duration: 30, category: 'Manicure', description: 'Includes nail shaping, cuticle care, lotion massage, and regular polish.' },
    { id: 33, name: 'Gel Manicure', price: 40, duration: 60, category: 'Manicure', popular: true, description: 'Includes nail shaping, cuticle care, lotion massage, and gel polish.' },
    { id: 34, name: 'Soak Off with Service', price: 5, duration: 0, category: 'Add-ons' },
    { id: 35, name: 'Regular Polish Change Hands', price: 20, duration: 30, category: 'Manicure' },
    { id: 36, name: 'Gel Polish Change Hands', price: 30, duration: 45, category: 'Manicure' },
    { id: 37, name: 'Regular French', price: 10, duration: 0, category: 'Add-ons' },
    { id: 38, name: 'Add Shiny Buff', price: 10, duration: 0, category: 'Add-ons' },
    { id: 39, name: '2 Nails with Art', price: 10, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 40, name: 'Chrome', price: 15, duration: 0, category: 'Add-ons' },
    { id: 41, name: 'Ombre', price: 15, duration: 0, category: 'Add-ons' },
    { id: 42, name: 'Cateye', price: 15, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 43, name: 'Soak Off with Service', price: 5, duration: 0, category: 'Add-ons' },
    { id: 47, name: 'Spa Pedicure', price: 38, duration: 45, category: 'Pedicure', priceNote: '+', popular: true, description: 'ESSENTIAL CARE FOR YOUR FEET - Includes nail shaping, cuticle care, basic heels scrub, 5 min lotion massage & hot towels.' },
    { id: 44, name: 'Silken Pedicure', price: 53, duration: 60, category: 'Pedicure', description: 'NOURISH YOUR FEET - Includes callus removal, 8 min lotion massage, collagen socks & hot towels.' },
    { id: 45, name: 'Gel Pedicure', price: 53, duration: 60, category: 'Pedicure', description: 'Includes nail shaping, cuticle care, basic heel scrub and 5 min lotion massage & gel polish.' },
    { id: 48, name: 'Exfoliating Pedicure', price: 50, duration: 60, category: 'Pedicure', priceNote: '+', description: 'REJUVENATE YOUR FEET - Includes nail shaping, cuticle care, sugar scrub, 8 min lotion massage, cooling gel, collagen socks & hot towels' },
    { id: 49, name: 'Detox Pedicure', price: 65, duration: 75, category: 'Pedicure', priceNote: '+', popular: true, description: 'CLEAN AND RENEW YOUR FEET Slip into relaxation w warm neck wrap before indulging in herb rose scented salt foot soak. Continues w / lemongrass sugar scrub, foot mask w / cucumber slices and warm paraffin treatment to refresh the skin. finish w 15 mins cucumber cream massage, enhanced by hot stones and hot towels and finish w regular polish.' },
    { id: 50, name: 'Jelly Pedicure', price: 90, duration: 90, category: 'Pedicure', priceNote: '+', description: 'HYDRATE AND SOOTHE YOUR FEET Begin w / warm neck wrap & warm jelly soak to soften & hydrate, followed by lavender scented salt w / dry rose petal soak, then revive the skin w / orange slices, foot mask, & warm paraffin treatment. finish w 20 min hot oil stone massage, hot towels, & reg polish' },
    { id: 51, name: 'Regular Polish Change Toes', price: 20, duration: 30, category: 'Pedicure' },
    { id: 52, name: 'Gel Polish Change Toes', price: 30, duration: 30, category: 'Pedicure' },
    { id: 65, name: 'Toes Fullset with Gel', price: 60, duration: 75, category: 'Pedicure', priceNote: '+' },
    { id: 66, name: 'Toes Fill with Gel', price: 50, duration: 45, category: 'Pedicure', priceNote: '+' },
    { id: 62, name: 'Toenail Trim Only', price: 15, duration: 15, category: 'Pedicure' },
    { id: 46, name: 'Extra 15 Min Massage', price: 20, duration: 20, category: 'Pedicure' },
    { id: 63, name: 'Extra 10 Min Massage', price: 15, duration: 10, category: 'Pedicure', priceNote: '+' },
    { id: 53, name: 'Add Paraffin', price: 10, duration: 0, category: 'Add-ons' },
    { id: 54, name: 'Add Sugar Scrub', price: 10, duration: 0, category: 'Add-ons' },
    { id: 55, name: 'Add Callus Remover', price: 10, duration: 0, category: 'Add-ons' },
    { id: 56, name: 'Add Shiny Buff', price: 10, duration: 0, category: 'Add-ons' },
    { id: 57, name: '2 Nails with Art', price: 10, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 58, name: 'Deep French', price: 15, duration: 0, category: 'Add-ons' },
    { id: 59, name: 'Regular French', price: 10, duration: 0, category: 'Add-ons' },
    { id: 60, name: 'Chrome', price: 15, duration: 0, category: 'Add-ons' },
    { id: 61, name: 'Cateye', price: 15, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 64, name: 'Add Gel Polish', price: 15, duration: 0, category: 'Add-ons' },
    { id: 67, name: 'Fullset 2 Big Toe Acrylic', price: 15, duration: 0, category: 'Add-ons' },
    { id: 68, name: 'Fill 2 Big Toe Acrylic', price: 10, duration: 0, category: 'Add-ons' },
    { id: 69, name: 'Eyebrows', price: 16, duration: 15, category: 'Waxing' },
    { id: 70, name: 'Lips', price: 10, duration: 5, category: 'Waxing', priceNote: '+' },
    { id: 71, name: 'Chin', price: 15, duration: 15, category: 'Waxing', priceNote: '+' },
    { id: 72, name: 'Sideburns', price: 25, duration: 15, category: 'Waxing', priceNote: '+' },
    { id: 73, name: 'Full Face', price: 50, duration: 30, category: 'Waxing', priceNote: '+' },
    { id: 74, name: 'Brown Tint', price: 25, duration: 45, category: 'Waxing' },
    { id: 75, name: 'Underarms', price: 30, duration: 15, category: 'Waxing', priceNote: '+' },
    { id: 76, name: 'Half Arm', price: 40, duration: 30, category: 'Waxing', priceNote: '+' },
    { id: 77, name: 'Full Arm', price: 55, duration: 45, category: 'Waxing', priceNote: '+' },
    { id: 78, name: 'Half Leg', price: 50, duration: 45, category: 'Waxing', priceNote: '+' },
    { id: 79, name: 'Full Leg', price: 80, duration: 60, category: 'Waxing', priceNote: '+' },
    { id: 80, name: 'Half Back', price: 35, duration: 30, category: 'Waxing', priceNote: '+' },
    { id: 81, name: 'Full Back', price: 60, duration: 60, category: 'Waxing', priceNote: '+' },
    { id: 82, name: 'Stomach', price: 40, duration: 30, category: 'Waxing', priceNote: '+' },
    { id: 83, name: 'Chest', price: 40, duration: 30, category: 'Waxing', priceNote: '+' },
    { id: 84, name: 'Bikini', price: 45, duration: 45, category: 'Waxing', priceNote: '+' },
    { id: 85, name: 'Brazilian', price: 60, duration: 60, category: 'Waxing', priceNote: '+' },
    { id: 86, name: 'Nail Repair — 1+ Weeks', price: 10, duration: 45, category: 'Fix & Removal', priceNote: '+' },
    { id: 87, name: 'Nail Repair — Less Than 1 Week', price: 0, duration: 45, category: 'Fix & Removal' },
    { id: 88, name: 'Acrylic Removal Only', price: 20, duration: 30, category: 'Fix & Removal' },
    { id: 89, name: 'Dip/Gel Removal Only', price: 15, duration: 30, category: 'Fix & Removal', priceNote: '+' },
    { id: 90, name: 'Manicure', price: 25, duration: 15, category: 'Kid Menu', priceNote: '+' },
    { id: 91, name: 'Gel Manicure', price: 30, duration: 30, category: 'Kid Menu', priceNote: '+', popular: true, description: 'Includes nail shaping, cuticle care, lotion massage, and gel polish.' },
    { id: 92, name: 'Pedicure', price: 25, duration: 25, category: 'Kid Menu', priceNote: '+' },
    { id: 93, name: 'Gel Pedicure', price: 40, duration: 30, category: 'Kid Menu', priceNote: '+' },
    { id: 94, name: 'Acrylic Fullset', price: 55, duration: 75, category: 'Kid Menu', priceNote: '+' },
    { id: 95, name: 'Acrylic Fill', price: 45, duration: 60, category: 'Kid Menu', priceNote: '+' },
    { id: 98, name: 'Gel X Fullset', price: 60, duration: 75, category: 'Kid Menu', priceNote: '+' },
    { id: 99, name: 'Gel X Fill', price: 50, duration: 60, category: 'Kid Menu', priceNote: '+' },
    { id: 96, name: 'Liquid Gel Fullset', price: 60, duration: 75, category: 'Kid Menu', priceNote: '+' },
    { id: 97, name: 'Liquid Gel Fill', price: 50, duration: 60, category: 'Kid Menu', priceNote: '+' },
    { id: 100, name: 'Dip with Tips', price: 50, duration: 60, category: 'Kid Menu', priceNote: '+' },
    { id: 101, name: 'Dip Overlay', price: 40, duration: 45, category: 'Kid Menu', priceNote: '+', popular: true },
    { id: 102, name: 'Toes Fullset with Gel', price: 45, duration: 60, category: 'Kid Menu', priceNote: '+' },
    { id: 103, name: 'Toes Fill with Gel', price: 40, duration: 45, category: 'Kid Menu', priceNote: '+' },
    { id: 104, name: 'Fullset 2 Big Toe Acrylic', price: 7, duration: 0, category: 'Add-ons' },
    { id: 105, name: 'Fill 2 Big Toe Acrylic', price: 5, duration: 0, category: 'Add-ons' },
    { id: 106, name: 'Regular Polish Change Hands', price: 10, duration: 30, category: 'Kid Menu' },
    { id: 107, name: 'Regular Polish Change Toes', price: 15, duration: 30, category: 'Kid Menu' },
    { id: 108, name: 'Gel Polish Change Hands/Toes', price: 20, duration: 30, category: 'Kid Menu' },
    { id: 109, name: 'Soak Off with Service', price: 5, duration: 0, category: 'Add-ons' },
    { id: 110, name: 'Extra Tip Length', price: 5, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 111, name: 'Shape', price: 5, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 112, name: '2 Nails with Art', price: 5, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 113, name: 'Add Cuticle Trim', price: 7, duration: 0, category: 'Add-ons' },
    { id: 114, name: 'Add Paraffin', price: 7, duration: 0, category: 'Add-ons' },
    { id: 115, name: 'Add Sugar Scrub', price: 7, duration: 0, category: 'Add-ons' },
    { id: 116, name: 'Add Shiny Buff', price: 7, duration: 0, category: 'Add-ons' },
    { id: 117, name: 'Regular French', price: 7, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 118, name: 'Deep French', price: 10, duration: 10, category: 'Kid Menu' },
    { id: 119, name: 'Add Gel Polish', price: 15, duration: 0, category: 'Add-ons' },
    { id: 120, name: 'Chrome', price: 10, duration: 0, category: 'Add-ons' },
    { id: 121, name: 'Cateye', price: 10, duration: 0, category: 'Add-ons', priceNote: '+' },
    { id: 122, name: 'Ombre', price: 10, duration: 0, category: 'Add-ons' },
    { id: 123, name: 'Toenail Trim Only', price: 10, duration: 15, category: 'Kid Menu' },
    // ---- LASHES ----
    { id: 124, name: 'Classic Full Set', price: 120, duration: 120, category: 'Lashes', description: 'Full set of classic eyelash extensions — one extension per natural lash.' },
    { id: 125, name: 'Classic Fill', price: 55, duration: 60, category: 'Lashes', description: 'Fill-in for classic eyelash extensions.' },
    { id: 126, name: 'Hybrid Full Set', price: 150, duration: 135, category: 'Lashes', description: 'Mix of classic and volume lashes for a fuller look.' },
    { id: 127, name: 'Hybrid Fill', price: 65, duration: 75, category: 'Lashes', description: 'Fill-in for hybrid eyelash extensions.' },
    { id: 128, name: 'Volume Full Set', price: 180, duration: 150, category: 'Lashes', description: 'Full volume fans for maximum fullness.' },
    { id: 129, name: 'Volume Fill', price: 75, duration: 90, category: 'Lashes', description: 'Fill-in for volume eyelash extensions.' },
    { id: 130, name: 'Lash Lift & Tint', price: 65, duration: 60, category: 'Lashes', description: 'Lift and tint your natural lashes — adds depth and dimension.' },
    { id: 131, name: 'Lash Removal', price: 25, duration: 30, category: 'Lashes', description: 'Safe removal of eyelash extensions.' }
];

// ===================== SITE CONTENT MANAGER =====================
const SiteContent = {
    content: null,
    listeners: [],

    init() {
        this.content = this.load();
        this.ensureMenu();
        this.ensureIdentity();
        this.ensureGallery();
        // Cross-tab sync: any change on another tab/page updates this one live
        window.addEventListener('storage', (e) => {
            if (e.key === UNB_CONTENT_SYNC_KEY) {
                this.content = this.load();
                this.notify();
            }
        });
        return this;
    },

    // Keep gallery/hero pointing at the real urbannailbarscottsdale.com photos
    ensureGallery() {
        try {
            const defs = UNB_DEFAULT_CONTENT;
            let changed = false;
            const gallery = Array.isArray(this.content.siteGallery) ? this.content.siteGallery : [];
            const looksStale = gallery.length < 6 || gallery.some(p => {
                const u = String((p && p.url) || '');
                return !u || /Photo \d|placeholder|nail-\d\.jpg/i.test(u) || !/assets\/(images|gallery|brand)\//i.test(u);
            });
            if (looksStale) {
                this.content.siteGallery = JSON.parse(JSON.stringify(defs.siteGallery));
                changed = true;
            }
            ['siteLogo', 'siteHeroImage', 'siteHeroBg'].forEach(k => {
                const cur = String(this.content[k] || '');
                if (!cur || /Photo \d|placeholder/i.test(cur) || !/assets\/(images|gallery|brand)\//i.test(cur)) {
                    this.content[k] = defs[k];
                    changed = true;
                }
            });
            // Force-upgrade to July 2026 salon + nail-art photo set + marketing copy
            if (!this.content._galleryV5) {
                this.content.siteGallery = JSON.parse(JSON.stringify(defs.siteGallery));
                this.content.siteLogo = defs.siteLogo;
                this.content.siteHeroImage = defs.siteHeroImage;
                this.content.siteHeroBg = defs.siteHeroBg;
                this.content.siteTestimonials = JSON.parse(JSON.stringify(defs.siteTestimonials));
                this.content.sitePolicies = JSON.parse(JSON.stringify(defs.sitePolicies));
                [
                    'siteAboutTitle', 'siteAboutLead', 'siteAboutBody', 'siteAboutStory',
                    'siteWhyChooseUs', 'siteServicesIntro', 'siteServicesNote', 'siteFooterCopyright',
                    'siteRating', 'siteReviewCount'
                ].forEach(k => { this.content[k] = defs[k]; });
                this.content._galleryV5 = true;
                changed = true;
            }
            // Contact + review platform links (from live urbannailbarscottsdale.com)
            if (!this.content._reviewLinksV1) {
                [
                    'salonPhone', 'salonAddress', 'salonEmail', 'sitePhone', 'siteEmail',
                    'siteMapUrl', 'siteDirectionsUrl', 'siteMapEmbedUrl',
                    'siteReviewLinks', 'siteSocialLinks', 'siteRating', 'siteReviewCount'
                ].forEach(k => { this.content[k] = JSON.parse(JSON.stringify(defs[k])); });
                this.content.siteTestimonials = JSON.parse(JSON.stringify(defs.siteTestimonials));
                this.content._reviewLinksV1 = true;
                changed = true;
            }
            // Full contact-page parity (hours, CTA copy, social info strip)
            if (!this.content._contactPageV1) {
                [
                    'salonPhone', 'salonAddress', 'salonEmail', 'sitePhone', 'siteEmail',
                    'siteMapUrl', 'siteDirectionsUrl', 'siteMapEmbedUrl',
                    'openTime', 'closeTime', 'sunOpenTime', 'sunCloseTime',
                    'siteReviewLinks', 'siteSocialLinks',
                    'siteContactTitle', 'siteContactSubtitle', 'siteContactInfoLabel',
                    'siteHoursLabel', 'siteHoursWeekdayLabel', 'siteHoursWeekday',
                    'siteHoursSundayLabel', 'siteHoursSunday',
                    'siteContactCtaTitle', 'siteContactCtaBody', 'siteContactCtaBtn'
                ].forEach(k => { this.content[k] = JSON.parse(JSON.stringify(defs[k])); });
                this.content._contactPageV1 = true;
                changed = true;
            }
            // Split Our Salon into interiors + nail work galleries
            if (!this.content._gallerySplitV1) {
                this.content.siteSalonGallery = JSON.parse(JSON.stringify(defs.siteSalonGallery));
                this.content.siteWorkGallery = JSON.parse(JSON.stringify(defs.siteWorkGallery));
                this.content.siteGallery = this.content.siteSalonGallery.concat(this.content.siteWorkGallery);
                this.content._gallerySplitV1 = true;
                changed = true;
            }
            // Mac Safari fix: gallery/salon files are JPEG — use .jpg URLs (not mislabeled .png)
            if (!this.content._galleryJpgV1) {
                this.content.siteSalonGallery = JSON.parse(JSON.stringify(defs.siteSalonGallery));
                this.content.siteWorkGallery = JSON.parse(JSON.stringify(defs.siteWorkGallery));
                this.content.siteGallery = this.content.siteSalonGallery.concat(this.content.siteWorkGallery);
                this.content._galleryJpgV1 = true;
                changed = true;
            } else {
                // Keep combined siteGallery in sync for older consumers
                const salon = Array.isArray(this.content.siteSalonGallery) ? this.content.siteSalonGallery : [];
                const work = Array.isArray(this.content.siteWorkGallery) ? this.content.siteWorkGallery : [];
                if (salon.length || work.length) {
                    this.content.siteGallery = salon.concat(work);
                }
            }
            // Restore $5 Mani+Pedi combo promo above special discount ads
            if (!this.content._comboPromoV1) {
                this.content.siteAnnouncement = defs.siteAnnouncement;
                if (!Array.isArray(this.content.discountAds) || !this.content.discountAds.length) {
                    this.content.discountAds = JSON.parse(JSON.stringify(defs.discountAds));
                }
                this.content._comboPromoV1 = true;
                changed = true;
            }
            if (!this.content._comboPromoNoBangV1) {
                this.content.siteAnnouncement = defs.siteAnnouncement;
                this.content._comboPromoNoBangV1 = true;
                changed = true;
            }
            if (!this.content._salonWelcomePeriodV1) {
                this.content.siteSalonWelcome = defs.siteSalonWelcome;
                this.content._salonWelcomePeriodV1 = true;
                changed = true;
            }
            if (!this.content._salonSubnoteBangV1) {
                this.content.siteSalonSubnote = defs.siteSalonSubnote;
                this.content._salonSubnoteBangV1 = true;
                changed = true;
            }
            if (!this.content._workSubnoteAmpV1) {
                this.content.siteWorkSubnote = defs.siteWorkSubnote;
                this.content._workSubnoteAmpV1 = true;
                changed = true;
            }
            if (!this.content._comboPromoBangBackV1) {
                this.content.siteAnnouncement = defs.siteAnnouncement;
                this.content._comboPromoBangBackV1 = true;
                changed = true;
            }
            // Fix corrupted em-dash that showed as "?" in the promo banner
            if (!this.content._comboPromoDashFixV1) {
                this.content.siteAnnouncement = defs.siteAnnouncement;
                this.content._comboPromoDashFixV1 = true;
                changed = true;
            }
            // Our Salon gallery welcome copy
            if (!this.content._logoOutlineV2) {
                this.content.siteLogo = defs.siteLogo;
                this.content._logoOutlineV2 = true;
                changed = true;
            }
            if (!this.content._salonGalleryCopyV3) {
                this.content.siteSalonSectionTitle = defs.siteSalonSectionTitle;
                this.content.siteSalonFamily = defs.siteSalonFamily;
                this.content.siteSalonWelcome = defs.siteSalonWelcome;
                this.content.siteSalonSubhead = defs.siteSalonSubhead;
                this.content.siteSalonSubnote = defs.siteSalonSubnote;
                this.content._salonGalleryCopyV3 = true;
                changed = true;
            }
            if (!this.content._siteCopyPolishV1) {
                this.content.siteAboutTitle = defs.siteAboutTitle;
                this.content.siteSalonFamily = defs.siteSalonFamily;
                this.content.siteWorkSectionTitle = defs.siteWorkSectionTitle;
                this.content.siteWorkSubnote = defs.siteWorkSubnote;
                this.content.siteServicesCategories = defs.siteServicesCategories;
                this.content._siteCopyPolishV1 = true;
                changed = true;
            }
            if (!this.content._aboutLeadV2) {
                this.content.siteAboutLead = defs.siteAboutLead;
                this.content._aboutLeadV2 = true;
                changed = true;
            }
            if (!this.content._emojiFrameV1) {
                this.content.siteAboutTitle = defs.siteAboutTitle;
                this.content.siteSalonFamily = defs.siteSalonFamily;
                this.content._emojiFrameV1 = true;
                changed = true;
            }
            if (!this.content._hoursPlainLabelsV3) {
                this.content.siteHoursWeekdayLabel = defs.siteHoursWeekdayLabel;
                this.content.siteHoursSundayLabel = defs.siteHoursSundayLabel;
                this.content._hoursPlainLabelsV3 = true;
                changed = true;
            }
            if (changed) this.save();
        } catch (e) { /* ignore */ }
    },

    load() {
        try {
            var hubContent = null;
            var hubAt = 0;
            try {
                if (window.DataManager && DataManager.settings && DataManager.settings.websiteContent) {
                    hubContent = DataManager.settings.websiteContent;
                    hubAt = Number(DataManager.settings.websiteContentSavedAt) || 0;
                }
            } catch (eHub) { /* DataManager not ready */ }
            const lsAt = parseInt(localStorage.getItem(UNB_CONTENT_SYNC_KEY) || '0', 10);
            const saved = localStorage.getItem(UNB_CONTENT_KEY);
            var localContent = null;
            if (saved) {
                localContent = Object.assign({}, JSON.parse(JSON.stringify(UNB_DEFAULT_CONTENT)), JSON.parse(saved));
            }
            // Prefer hub when it is newer or local is empty — keeps website edits OS-identical
            if (hubContent && typeof hubContent === 'object') {
                if (!localContent || hubAt >= lsAt) {
                    return Object.assign({}, JSON.parse(JSON.stringify(UNB_DEFAULT_CONTENT)), hubContent);
                }
            }
            if (localContent) return localContent;
        } catch (e) {
            console.error('SiteContent load error:', e);
        }
        return JSON.parse(JSON.stringify(UNB_DEFAULT_CONTENT));
    },

    save() {
        try {
            localStorage.setItem(UNB_CONTENT_KEY, JSON.stringify(this.content));
            const stamp = Date.now();
            localStorage.setItem(UNB_CONTENT_SYNC_KEY, stamp.toString());
            // Persist into shared salon settings so Windows / Sierra / Big Sur share one CMS
            try {
                if (window.DataManager && DataManager.settings && !DataManager._applyingRemote) {
                    DataManager.settings.websiteContent = JSON.parse(JSON.stringify(this.content));
                    DataManager.settings.websiteContentSavedAt = stamp;
                    DataManager.saveSettings();
                }
            } catch (eHub) { /* ignore hub mirror failures */ }
            this.notify();
            return true;
        } catch (e) {
            console.error('SiteContent save error:', e);
            return false;
        }
    },

    /** Reload CMS from hub settings after DataManager server pull. */
    pullFromHub() {
        try {
            if (!window.DataManager || !DataManager.settings || !DataManager.settings.websiteContent) return false;
            const hubAt = Number(DataManager.settings.websiteContentSavedAt) || 0;
            const lsAt = parseInt(localStorage.getItem(UNB_CONTENT_SYNC_KEY) || '0', 10);
            if (hubAt < lsAt) return false;
            this.content = Object.assign(
                {},
                JSON.parse(JSON.stringify(UNB_DEFAULT_CONTENT)),
                DataManager.settings.websiteContent
            );
            localStorage.setItem(UNB_CONTENT_KEY, JSON.stringify(this.content));
            if (hubAt) localStorage.setItem(UNB_CONTENT_SYNC_KEY, String(hubAt));
            this.notify();
            return true;
        } catch (e) {
            return false;
        }
    },

    get() {
        return this.content;
    },

    // Update website content fields; also mirrors salon identity into the
    // shared DataManager settings so every page sees the same name/phone/hours
    update(fields) {
        Object.assign(this.content, fields);
        this.save();
        try {
            if (window.DataManager && DataManager.settings) {
                const mirror = {};
                ['salonName', 'salonPhone', 'salonAddress', 'salonEmail', 'openTime', 'closeTime'].forEach(k => {
                    if (k in fields) mirror[k] = fields[k];
                });
                if (Object.keys(mirror).length) DataManager.updateSettings(mirror);
            }
        } catch (e) { /* DataManager not ready */ }
        return this.content;
    },

    addListener(cb) {
        this.listeners.push(cb);
    },

    notify() {
        this.listeners.forEach(cb => {
            try { cb(this.content); } catch (e) { console.error('SiteContent listener error:', e); }
        });
    },

    // Keep the shared menu current without wiping shop price/name edits.
    // Full replace only for known old demo/generic catalogs.
    ensureMenu() {
        try {
            if (!window.DataManager || !DataManager.data) return;
            let svc = DataManager.data.services || [];
            const oldGeneric8 = ['Haircut', 'Hair Color', 'Manicure', 'Pedicure', 'Facial', 'Massage', 'Blow Dry', 'Highlights'];
            const isOldGeneric8 = svc.length === oldGeneric8.length && svc.every((s, i) => s.name === oldGeneric8[i]);
            const isOldNail41 = svc.length === 41 && svc[0] && svc[0].name === 'Classic Manicure' && svc[40] && svc[40].name === 'Lash Removal';
            const isOldUnb38 = svc.length === 38 && svc[0] && svc[0].name === 'Spa Pedicure' && svc[37] && svc[37].name === 'Kids Pedicure (Under 10)';
            const isOldUnb49 = svc.length === 49 && svc[0] && svc[0].name === 'Regular Manicure' && svc[48] && svc[48].name === 'Lash Removal';
            const hasNonNail = svc.some(s => ['Hair', 'Spa'].includes(s.category));
            if (isOldGeneric8 || isOldNail41 || isOldUnb38 || isOldUnb49 || hasNonNail) {
                DataManager.data.services = JSON.parse(JSON.stringify(UNB_MENU));
                DataManager.saveData();
                console.log('SiteContent: services upgraded to Urban Nail Bar full menu');
                return;
            }
            let changed = false;
            const norm = (c) => (typeof Utils !== 'undefined' && Utils.normalizeCategory) ? Utils.normalizeCategory(c) : ({ 'Pedicures': 'Pedicure', 'Fix & Removal Only': 'Fix & Removal' }[c] || c);
            svc = svc.map(s => {
                const n = norm(s.category);
                if (n !== s.category) { changed = true; return Object.assign({}, s, { category: n }); }
                return s;
            });

            // Strip Combos category (removed from menu — keep history names on old tickets)
            const beforeCombo = svc.length;
            svc = svc.filter(s => String(s.category || '').toLowerCase() !== 'combos' && s.id !== 132);
            if (svc.length !== beforeCombo) changed = true;

            // Honor shop deletes — never re-insert factory rows that were removed
            const removed = new Set(
                ((DataManager.settings && DataManager.settings.removedServiceIds) || []).map(Number)
            );
            if (removed.size) {
                const beforeTomb = svc.length;
                svc = svc.filter(s => !removed.has(Number(s.id)));
                if (svc.length !== beforeTomb) changed = true;
            }

            // Short menu names → full labels (Spa → Spa Pedicure, Regular → Regular Manicure, Gel → …)
            svc = svc.map(s => {
                const cleaned = (typeof Utils !== 'undefined' && Utils.cleanServiceName)
                    ? Utils.cleanServiceName(s.name, s.category)
                    : s.name;
                if (cleaned && cleaned !== s.name) {
                    changed = true;
                    return Object.assign({}, s, { name: cleaned });
                }
                return s;
            });

            // Clean redundant names (Acrylic Acrylic / W/) — already applied above via cleanServiceName
            // (kept as no-op pass for shops without Utils)

            // Collapse ticket-sync duplicates (same Kind | Variant + category + price)
            if (typeof Utils !== 'undefined' && Utils.uniqueServices) {
                const beforeDup = svc.length;
                svc = Utils.uniqueServices(svc);
                if (svc.length !== beforeDup) changed = true;
            }

            // Do NOT merge missing factory catalog ids — Admin/Manager deletes must stick.
            // One-time old-catalog upgrades are handled above.
            svc = svc.slice().sort((a, b) => (a.id || 0) - (b.id || 0));
            if (changed) {
                DataManager.data.services = svc;
                DataManager.saveData();
                console.log('SiteContent: service menu normalized (shop add/delete preserved)');
            }
        } catch (e) {
            console.error('SiteContent ensureMenu error:', e);
        }
    },

    // If shared salon identity still holds old factory values, upgrade them
    ensureIdentity() {
        try {
            if (!window.DataManager || !DataManager.settings) return;
            const factory = {
                salonName: 'Urban Nail Bar',
                salonAddress: '123 Beauty Lane, Style City, SC 12345',
                salonPhone: '555-0199',
                openTime: '09:00',
                closeTime: '19:00'
            };
            const updates = {};
            Object.keys(factory).forEach(k => {
                if (DataManager.settings[k] === factory[k]) updates[k] = this.content[k];
            });
            // Upgrade legacy weekday hours → Mon–Sat 9:30 AM – 6:30 PM / Sun 11:00 AM – 5:00 PM
            if (DataManager.settings.openTime === '09:00' && (DataManager.settings.closeTime === '19:00' || DataManager.settings.closeTime === '18:00')) {
                updates.openTime = '09:30';
                updates.closeTime = '18:30';
            }
            if (!DataManager.settings.sunOpenTime) updates.sunOpenTime = '11:00';
            if (!DataManager.settings.sunCloseTime) updates.sunCloseTime = '17:00';
            updates.timeFormat = '12';
            updates.set24Hour = false;
            if (Object.keys(updates).length) {
                DataManager.updateSettings(updates);
                console.log('SiteContent: salon identity upgraded');
            }
        } catch (e) {
            console.error('SiteContent ensureIdentity error:', e);
        }
    }
};

// Initialize after DataManager (include this script AFTER data-manager.js)
SiteContent.init();
// Re-run menu heal + adopt hub website CMS after DataManager finishes server pull
if (window.DataManager && DataManager._bootPromise && typeof DataManager._bootPromise.then === 'function') {
    DataManager._bootPromise.then(() => {
        try { SiteContent.pullFromHub(); } catch (e) { /* ignore */ }
        try { SiteContent.ensureMenu(); } catch (e) { /* ignore */ }
    });
}
// Keep CMS live when settings sync from another device/tab
if (window.DataManager && typeof DataManager.addListener === 'function') {
    DataManager.addListener(function (type) {
        if (type === 'settings') {
            try { SiteContent.pullFromHub(); } catch (e) { /* ignore */ }
        }
    });
}
window.SiteContent = SiteContent;
