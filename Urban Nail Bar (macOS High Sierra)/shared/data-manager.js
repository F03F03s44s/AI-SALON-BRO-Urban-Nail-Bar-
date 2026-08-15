/**
 * Urban Nail Bar - Shared Data Layer
 * All 6 pages use this for bidirectional sync
 * Pages: Scheduler, Admin, Manager, Staff, Booking, Website
 */

const SALON_STORAGE_KEY = 'aiSalonPro_v3_data';
const SALON_SETTINGS_KEY = 'aiSalonPro_v3_settings';
const SALON_SYNC_KEY = 'aiSalonPro_v3_lastSync';

// Default data structure - shared across ALL pages
const DEFAULT_SALON_DATA = {
    version: '3.0',
    lastUpdated: new Date().toISOString(),
    
    // Staff (shared across all pages) — Urban Nail Bar team
    // roles[] supports multi-role (e.g. manager + technician). Only technicians are bookable.
    staff: [
        { id: 1, name: 'Lance', role: 'manager', roles: ['manager'], pin: '1001', email: '', phone: '', status: 'active', commission: 60, hoursWorked: 0, specialties: ['Manager', 'Reception'], avatar: 'L', color: '#f59e0b', isClockedIn: false },
        { id: 2, name: 'Keith', role: 'admin', roles: ['admin'], pin: '1002', email: '', phone: '', status: 'active', commission: 50, hoursWorked: 0, specialties: ['Admin'], avatar: 'K', color: '#3b82f6', isClockedIn: false },
        { id: 3, name: 'Sky', role: 'admin', roles: ['admin'], pin: '1003', email: '', phone: '', status: 'active', commission: 50, hoursWorked: 0, specialties: ['Admin'], avatar: 'S', color: '#8b5cf6', isClockedIn: false },
        { id: 4, name: 'Amy', role: 'technician', roles: ['technician'], pin: '1004', email: '', phone: '', status: 'active', commission: 40, payType: 'salary', salaryAmount: 0, salarySplit: 60, salaryFrequency: 'weekly', hoursWorked: 0, specialties: ['Nails'], avatar: 'A', color: '#10b981', isClockedIn: false },
        { id: 5, name: 'Kathy', role: 'technician', roles: ['technician'], pin: '1005', email: '', phone: '', status: 'active', commission: 40, payType: 'salary', salaryAmount: 0, salarySplit: 60, salaryFrequency: 'weekly', hoursWorked: 0, specialties: ['Nails'], avatar: 'K', color: '#ef4444', isClockedIn: false },
        { id: 6, name: 'Danley', role: 'technician', roles: ['technician'], pin: '1006', email: '', phone: '', status: 'active', commission: 40, payType: 'salary', salaryAmount: 0, salarySplit: 60, salaryFrequency: 'weekly', hoursWorked: 0, specialties: ['Nails'], avatar: 'D', color: '#06b6d4', isClockedIn: false },
        { id: 7, name: 'Kelly', role: 'technician', roles: ['technician'], pin: '1007', email: '', phone: '', status: 'active', commission: 40, payType: 'salary', salaryAmount: 0, salarySplit: 60, salaryFrequency: 'weekly', hoursWorked: 0, specialties: ['Nails'], avatar: 'K', color: '#ec4899', isClockedIn: false },
        { id: 8, name: 'Addison', role: 'technician', roles: ['technician'], pin: '1008', email: '', phone: '', status: 'active', commission: 40, payType: 'salary', salaryAmount: 0, salarySplit: 60, salaryFrequency: 'weekly', hoursWorked: 0, specialties: ['Nails'], avatar: 'A', color: '#84cc16', isClockedIn: false },
        { id: 9, name: 'Paula', role: 'technician', roles: ['technician'], pin: '1009', email: '', phone: '', status: 'active', commission: 40, payType: 'salary', salaryAmount: 0, salarySplit: 60, salaryFrequency: 'weekly', hoursWorked: 0, specialties: ['Nails'], avatar: 'P', color: '#f97316', isClockedIn: false }
    ],
    
    // Clients (shared across all pages)
    clients: [],
    
    // Services (shared across all pages) ? Urban Nail Bar menu (nails, waxing)
    // NOTE : shared/site-content.js (UNB_MENU) self-heals this to the full menu on page load.
    // Services (shared across all pages) — Urban Nail Bar NAILS-ONLY menu
    // (kept in sync with shared/site-content.js ? no hair, no waxing, no lashes)
    services : [
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
        { id: 11, name: 'Soak Off with Service', price: 5, duration: 0, category: 'Nail Enhancements' },
        { id: 12, name: 'Extra Tip Length', price: 5, duration: 0, category: 'Nail Enhancements', priceNote: '+' },
        { id: 13, name: 'Shape', price: 5, duration: 0, category: 'Nail Enhancements', priceNote: '+' },
        { id: 14, name: 'Add Cuticle Trim', price: 10, duration: 0, category: 'Nail Enhancements' },
        { id: 15, name: 'Regular French', price: 10, duration: 0, category: 'Nail Enhancements' },
        { id: 16, name: '2 Nails with Art', price: 10, duration: 0, category: 'Nail Enhancements', priceNote: '+' },
        { id: 17, name: 'Chrome', price: 15, duration: 0, category: 'Nail Enhancements' },
        { id: 18, name: 'Cateye', price: 15, duration: 0, category: 'Nail Enhancements', priceNote: '+' },
        { id: 19, name: 'Ombre', price: 15, duration: 0, category: 'Nail Enhancements' },
        { id: 20, name: 'Dip with Tips', price: 60, duration: 75, category: 'Dip Powder', priceNote: '+' },
        { id: 21, name: 'Dip Overlay', price: 50, duration: 60, category: 'Dip Powder', priceNote: '+', popular: true },
        { id: 22, name: 'Soak Off with Service', price: 5, duration: 0, category: 'Dip Powder' },
        { id: 23, name: 'Extra Tip Length', price: 5, duration: 0, category: 'Dip Powder', priceNote: '+' },
        { id: 24, name: 'Shape', price: 5, duration: 0, category: 'Dip Powder', priceNote: '+' },
        { id: 25, name: 'Add Cuticle Trim', price: 10, duration: 0, category: 'Dip Powder' },
        { id: 26, name: 'Regular French', price: 10, duration: 0, category: 'Dip Powder' },
        { id: 27, name: '2 Nails with Art', price: 10, duration: 0, category: 'Dip Powder', priceNote: '+' },
        { id: 28, name: 'Deep French', price: 15, duration: 0, category: 'Dip Powder' },
        { id: 29, name: 'Chrome', price: 15, duration: 0, category: 'Dip Powder' },
        { id: 30, name: 'Cateye', price: 15, duration: 0, category: 'Dip Powder', priceNote: '+' },
        { id: 31, name: 'Ombre', price: 15, duration: 0, category: 'Dip Powder' },
        { id: 32, name: 'Regular Manicure', price: 30, duration: 30, category: 'Manicure', description: 'Includes nail shaping, cuticle care, lotion massage, and regular polish.' },
        { id: 33, name: 'Gel Manicure', price: 40, duration: 60, category: 'Manicure', popular: true, description: 'Includes nail shaping, cuticle care, lotion massage, and gel polish.' },
        { id: 34, name: 'Soak Off with Service', price: 5, duration: 0, category: 'Manicure' },
        { id: 35, name: 'Regular Polish Change Hands', price: 20, duration: 30, category: 'Manicure' },
        { id: 36, name: 'Gel Polish Change Hands', price: 30, duration: 45, category: 'Manicure' },
        { id: 37, name: 'Regular French', price: 10, duration: 0, category: 'Manicure' },
        { id: 38, name: 'Add Shiny Buff', price: 10, duration: 0, category: 'Manicure' },
        { id: 39, name: '2 Nails with Art', price: 10, duration: 0, category: 'Manicure', priceNote: '+' },
        { id: 40, name: 'Chrome', price: 15, duration: 0, category: 'Manicure' },
        { id: 41, name: 'Ombre', price: 15, duration: 0, category: 'Manicure' },
        { id: 42, name: 'Cateye', price: 15, duration: 0, category: 'Manicure', priceNote: '+' },
        { id: 43, name: 'Soak Off with Service', price: 5, duration: 0, category: 'Pedicure' },
        { id: 44, name: 'Silken Pedicure', price: 53, duration: 60, category: 'Pedicure', description: 'NOURISH YOUR FEET - Includes callus removal, 8 min lotion massage, collagen socks & hot towels.' },
        { id: 45, name: 'Gel Pedicure', price: 53, duration: 60, category: 'Pedicure', description: 'Includes nail shaping, cuticle care, basic heel scrub and 5 min lotion massage & gel polish.' },
        { id: 46, name: 'Extra 15 Min Massage', price: 20, duration: 20, category: 'Pedicure' },
        { id: 47, name: 'Spa Pedicure', price: 38, duration: 45, category: 'Pedicure', priceNote: '+', popular: true, description: 'ESSENTIAL CARE FOR YOUR FEET - Includes nail shaping, cuticle care, basic heels scrub, 5 min lotion massage & hot towels.' },
        { id: 48, name: 'Exfoliating Pedicure', price: 50, duration: 60, category: 'Pedicure', priceNote: '+', description: 'REJUVENATE YOUR FEET - Includes nail shaping, cuticle care, sugar scrub, 8 min lotion massage, cooling gel, collagen socks & hot towels' },
        { id: 49, name: 'Detox Pedicure', price: 75, duration: 75, category: 'Pedicure', priceNote: '+', popular: true, description: 'CLEAN AND RENEW YOUR FEET Slip into relaxation w warm neck wrap before indulging in herb rose scented salt foot soak. Continues w / lemongrass sugar scrub, foot mask w / cucumber slices and warm paraffin treatment to refresh the skin. finish w 15 mins cucumber cream massage, enhanced by hot stones and hot towels and finish w regular polish.' },
        { id: 50, name: 'Jelly Pedicure', price: 90, duration: 90, category: 'Pedicure', priceNote: '+', description: 'HYDRATE AND SOOTHE YOUR FEET Begin w / warm neck wrap & warm jelly soak to soften & hydrate, followed by lavender scented salt w / dry rose petal soak, then revive the skin w / orange slices, foot mask, & warm paraffin treatment. finish w 20 min hot oil stone massage, hot towels, & reg polish' },
        { id: 51, name: 'Regular Polish Change Toes', price: 20, duration: 30, category: 'Pedicure' },
        { id: 52, name: 'Gel Polish Change Toes', price: 30, duration: 30, category: 'Pedicure' },
        { id: 53, name: 'Add Paraffin', price: 10, duration: 0, category: 'Pedicure' },
        { id: 54, name: 'Add Sugar Scrub', price: 10, duration: 0, category: 'Pedicure' },
        { id: 55, name: 'Add Callus Remover', price: 10, duration: 0, category: 'Pedicure' },
        { id: 56, name: 'Add Shiny Buff', price: 10, duration: 0, category: 'Pedicure' },
        { id: 57, name: '2 Nails with Art', price: 10, duration: 0, category: 'Pedicure', priceNote: '+' },
        { id: 58, name: 'Deep French', price: 15, duration: 0, category: 'Pedicure' },
        { id: 59, name: 'Regular French', price: 10, duration: 0, category: 'Pedicure' },
        { id: 60, name: 'Chrome', price: 15, duration: 0, category: 'Pedicure' },
        { id: 61, name: 'Cateye', price: 15, duration: 0, category: 'Pedicure', priceNote: '+' },
        { id: 62, name: 'Toenail Trim Only', price: 15, duration: 15, category: 'Pedicure' },
        { id: 63, name: 'Extra 10 Min Massage', price: 15, duration: 10, category: 'Pedicure', priceNote: '+' },
        { id: 64, name: 'Add Gel Polish', price: 15, duration: 0, category: 'Pedicure' },
        { id: 65, name: 'Toes Fullset with Gel', price: 60, duration: 75, category: 'Pedicure', priceNote: '+' },
        { id: 66, name: 'Toes Fill with Gel', price: 50, duration: 45, category: 'Pedicure', priceNote: '+' },
        { id: 67, name: 'Fullset 2 Big Toe Acrylic', price: 15, duration: 0, category: 'Pedicure' },
        { id: 68, name: 'Fill 2 Big Toe Acrylic', price: 10, duration: 0, category: 'Pedicure' },
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
        { id: 96, name: 'Liquid Gel Fullset', price: 60, duration: 75, category: 'Kid Menu', priceNote: '+' },
        { id: 97, name: 'Liquid Gel Fill', price: 50, duration: 60, category: 'Kid Menu', priceNote: '+' },
        { id: 98, name: 'Gel X Fullset', price: 60, duration: 75, category: 'Kid Menu', priceNote: '+' },
        { id: 99, name: 'Gel X Fill', price: 50, duration: 60, category: 'Kid Menu', priceNote: '+' },
        { id: 100, name: 'Dip with Tips', price: 50, duration: 60, category: 'Kid Menu', priceNote: '+' },
        { id: 101, name: 'Dip Overlay', price: 40, duration: 45, category: 'Kid Menu', priceNote: '+', popular: true },
        { id: 102, name: 'Toes Fullset with Gel', price: 45, duration: 60, category: 'Kid Menu', priceNote: '+' },
        { id: 103, name: 'Toes Fill with Gel', price: 40, duration: 45, category: 'Kid Menu', priceNote: '+' },
        { id: 104, name: 'Fullset 2 Big Toe Acrylic', price: 7, duration: 0, category: 'Kid Menu' },
        { id: 105, name: 'Fill 2 Big Toe Acrylic', price: 5, duration: 0, category: 'Kid Menu' },
        { id: 106, name: 'Regular Polish Change Hands', price: 10, duration: 30, category: 'Kid Menu' },
        { id: 107, name: 'Regular Polish Change Toes', price: 15, duration: 30, category: 'Kid Menu' },
        { id: 108, name: 'Gel Polish Change Hands/Toes', price: 20, duration: 30, category: 'Kid Menu' },
        { id: 109, name: 'Soak Off with Service', price: 5, duration: 0, category: 'Kid Menu' },
        { id: 110, name: 'Extra Tip Length', price: 5, duration: 0, category: 'Kid Menu', priceNote: '+' },
        { id: 111, name: 'Shape', price: 5, duration: 0, category: 'Kid Menu', priceNote: '+' },
        { id: 112, name: '2 Nails with Art', price: 5, duration: 0, category: 'Kid Menu', priceNote: '+' },
        { id: 113, name: 'Add Cuticle Trim', price: 7, duration: 0, category: 'Kid Menu' },
        { id: 114, name: 'Add Paraffin', price: 7, duration: 0, category: 'Kid Menu' },
        { id: 115, name: 'Add Sugar Scrub', price: 7, duration: 0, category: 'Kid Menu' },
        { id: 116, name: 'Add Shiny Buff', price: 7, duration: 0, category: 'Kid Menu' },
        { id: 117, name: 'Regular French', price: 7, duration: 0, category: 'Kid Menu', priceNote: '+' },
        { id: 118, name: 'Deep French', price: 10, duration: 10, category: 'Kid Menu' },
        { id: 119, name: 'Add Gel Polish', price: 15, duration: 0, category: 'Kid Menu' },
        { id: 120, name: 'Chrome', price: 10, duration: 0, category: 'Kid Menu' },
        { id: 121, name: 'Cateye', price: 10, duration: 0, category: 'Kid Menu', priceNote: '+' },
        { id: 122, name: 'Ombre', price: 10, duration: 0, category: 'Kid Menu' },
        { id: 123, name: 'Toenail Trim Only', price: 10, duration: 15, category: 'Kid Menu' },
        { id: 124, name: 'Classic Full Set', price: 165, duration: 90, category: 'Lashes', description: 'Full set of classic eyelash extensions — one extension per natural lash.' },
        { id: 125, name: 'Classic Fill', price: 75, duration: 60, category: 'Lashes', description: 'Fill-in for classic eyelash extensions.' },
        { id: 126, name: 'Hybrid Full Set', price: 175, duration: 90, category: 'Lashes', description: 'Mix of classic and volume lashes for a fuller look.' },
        { id: 127, name: 'Hybrid Fill', price: 85, duration: 60, category: 'Lashes', description: 'Fill-in for hybrid eyelash extensions.' },
        { id: 128, name: 'Volume Full Set', price: 185, duration: 90, category: 'Lashes', description: 'Full volume fans for maximum fullness.' },
        { id: 129, name: 'Volume Fill', price: 95, duration: 75, category: 'Lashes', description: 'Fill-in for volume eyelash extensions.' },
        { id: 133, name: 'Dramatic Full Set', price: 220, duration: 150, category: 'Lashes', description: 'Maximum drama lash extensions for a bold look.' },
        { id: 134, name: 'Dramatic Fill', price: 120, duration: 90, category: 'Lashes', description: 'Fill-in for dramatic eyelash extensions.' },
        { id: 130, name: 'Lash Lift', price: 95, duration: 75, category: 'Lashes', description: 'Lift your natural lashes — adds depth and dimension.' },
        { id: 135, name: 'Brow Lamination', price: 85, duration: 60, category: 'Lashes', description: 'Brow lamination for fuller, sculpted brows.' },
        { id: 131, name: 'Lash Removal', price: 30, duration: 30, category: 'Lashes', description: 'Safe removal of eyelash extensions.' }
],
    
    // Appointments (shared across all pages)
    appointments: [],
    
    // Inventory (shared across all pages) — nail salon supplies
    inventory: [
        { id: 1, name: 'Nail Tips (Box)', quantity: 40, minLevel: 10, price: 18, category: 'Nails' },
        { id: 2, name: 'Acrylic Powder', quantity: 25, minLevel: 8, price: 32, category: 'Nails' },
        { id: 3, name: 'Monomer (32oz)', quantity: 20, minLevel: 6, price: 28, category: 'Nails' },
        { id: 4, name: 'Gel Polish Set', quantity: 30, minLevel: 10, price: 45, category: 'Polish' },
        { id: 5, name: 'Dip Powder Kit', quantity: 22, minLevel: 8, price: 38, category: 'Nails' },
        { id: 6, name: 'Nail Glue', quantity: 35, minLevel: 12, price: 8, category: 'Nails' },
        { id: 7, name: 'Files & Buffers (Pack)', quantity: 50, minLevel: 15, price: 10, category: 'Supplies' },
        { id: 8, name: 'Cuticle Oil', quantity: 30, minLevel: 10, price: 12, category: 'Supplies' },
        { id: 9, name: 'Hard Wax (Bag)', quantity: 15, minLevel: 5, price: 25, category: 'Waxing' },
        { id: 10, name: 'Wax Strips & Sticks', quantity: 40, minLevel: 12, price: 9, category: 'Waxing' },
        { id: 11, name: 'Nail Polish - Red', quantity: 30, minLevel: 10, price: 12, category: 'Polish' },
        { id: 12, name: 'Acetone (Gallon)', quantity: 12, minLevel: 4, price: 22, category: 'Supplies' }
    ],
    
    // Reviews (shared across all pages)
    reviews: [],
    
    // Waitlist (shared across all pages)
    waitlist: [],
    
    // POS/Tickets (shared across all pages)
    posTickets: [],
    
    // Gift Cards (shared across all pages)
    giftCards: [],
    
    // Expenses (shared across all pages)
    expenses: [],
    
    // Time Clock (shared across all pages)
    timeClock: [],
    
    // Messages (shared across all pages)
    messages: [],
    
    // Notifications (shared across all pages)
    notifications: [],
    // Cleared waiting/late appointment bell ids (board appointment ids)
    dismissedApptNotifs: [],
    // Soft-cleared notification ids so sync does not resurrect them
    clearedNotificationIds: [],

    // Client visit history (services + polish per visit) — shared across pages
    clientHistory: [],

    // Outbound appointment reminder queue (SMS / confirm links)
    reminderOutbox: [],
    
    // PIN ledger — old + new PINs kept forever so changes can be recovered
    pinHistory: [],

    // Staff Archive (shared across all pages) - deleted staff are kept here forever
    staffArchive: [],

    // Client Archive (shared across all pages) - deleted clients are kept here forever
    clientArchive: [],

    // Payroll Archive - removed payroll runs are kept here forever
    payrollArchive: [],

    // Appointment Archive (shared across all pages) - deleted appointments are kept here forever
    appointmentArchive: [],

    // Daily Closeout Records (sent from Manager page, received on Admin page) - kept forever
    closeouts: [],

    // Closeout Archive - removed closeout records are kept here forever
    closeoutArchive: [],

    // Audit Log - every important change is recorded with a timestamp
    auditLog: [],
    
    // Payroll (shared across all pages)
    payroll: [],
    
    // Leave Requests (shared across all pages)
    leaveRequests: [],

    // Staff Shifts (shared across all pages) - manager/admin assign shifts
    shifts: [],

    // Per-day staff duty status: { 'YYYY-MM-DD': { staffId: { status, note, markedBy, markedAt } } }
    // status: 'late' | 'sick' | 'vacation' | 'called-off'
    dayStatuses: {},
    
    // Competition/Leaderboard (shared across all pages)
    competition: {
        enabled: false,
        startDate: null,
        endDate: null,
        prizes: []
    },
    
    // Analytics (shared across all pages)
    analytics: {
        dailyRevenue: [],
        monthlyRevenue: [],
        staffPerformance: [],
        servicePopularity: []
    }
};

// Default settings - shared across ALL pages
const DEFAULT_SETTINGS = {
    salonName: 'Urban Nail Bar',
    salonAddress: '9290 East Vía de Ventura Ste 103, Scottsdale, AZ 85258',
    salonPhone: '(480) 291-5440',
    salonEmail: '',
    salonWebsite: '',

    // Hours (Mon-Sat; Sunday has shorter hours)
    openTime: '09:30',
    closeTime: '18:30',
    sunOpenTime: '11:00',
    sunCloseTime: '17:00',
    
    // Booking
    defaultDuration: 30,
    interval: 15,
    allowOnlineBooking: true,
    minBookingNotice: 24, // hours
    maxBookingAdvance: 30, // days
    
    // Display
    timeFormat: '12',
    set24Hour: false,
    dateFormat: 'mdy',
    theme: 'dark',
    phoneDisplay: 'full',
    showTimeline: true,
    
    // Financial
    taxRate: 0,
    cardFee: 0,
    commission: 60,
    currency: '$',

    // Overtime (hourly staff) — admin can turn this on or off anytime
    overtimeEnabled: true,
    overtimeThreshold: 40,   // hours per week before overtime kicks in
    overtimeMultiplier: 1.5, // pay multiplier for overtime hours

    // Notification reminders — every rule can be toggled and tuned from
    // Admin → Notifications Center
    reminders: {
        payrollEnabled: true,
        payrollDay: 0,        // 0 = Sunday
        payrollHour: 16,      // 4 PM
        closeoutEnabled: true,
        closeoutGrace: 30,    // minutes after closing before reminding
        taxSeasonEnabled: true,
        taxSeasonEndDay: 15,  // reminds Jan 1 through this day
        uncompletedEnabled: true,
        // Client appointment SMS / confirm cadence
        clientSmsEnabled: true,
        remind3Days: true,
        remind24Hours: true,
        remind2HoursConfirm: true
    },

    // Security
    adminPin: '0000',
    managerPin: '1111',
    requirePinFor: ['delete', 'payroll', 'closeout', 'settings'],
    pinRequired: true,
    
    // Features
    enableReviews: true,
    enableWaitlist: true,
    enableCompetition: true,
    enableGiftCards: true,
    enableInventory: true,
    enablePayroll: true,
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    
    // AI (key lives only in server/.env — never in frontend code)
    geminiApiKey: '',
    enableVoiceAssistant: true,
    
    // Sync
    autoSync: true,
    syncInterval: 30000, // 30 seconds — keep all pages paired

    // Menu management (Admin / Manager) — custom cats + deleted factory ids
    customServiceCategories: [],
    removedServiceIds: [],
    // Website CMS blob (synced via hub settings so all OS packages match)
    websiteContent: null,
    websiteContentSavedAt: 0
};

// ===================== DATA MANAGER =====================

const DataManager = {
    data: null,
    settings: null,
    listeners: [],
    syncInterval: null,
    
    // Initialize data from localStorage or defaults
    init() {
        this.data = this.loadData();
        this.settings = this.loadSettings();
        try {
            this.lastServerSync = parseInt(localStorage.getItem('aiSalonPro_v3_lastServerSync') || '0', 10) || 0;
        } catch (eInitSync) { this.lastServerSync = 0; } /* init restore lastServerSync */
        // Pull server FIRST (before any save) so a wiped server isn't overwritten
        // by stale localStorage from a previous session.
        this._bootPromise = this.pullFromServer().then(() => {
            this.normalizeStaffRoles();
            this.ensureFrontDeskAccount();
            this._healAppointmentClientLinks(this.data);
        }).catch(() => {
            this.normalizeStaffRoles();
            this.ensureFrontDeskAccount();
            this._healAppointmentClientLinks(this.data);
        });
        this.startSync();
        this.watchStorage();
        console.log('DataManager initialized');
        return this;
    },

    // Normalize legacy role strings (nail tech → technician) and ensure roles[]
    _normRole(role) {
        const s = String(role || '').toLowerCase().trim();
        if (!s) return '';
        if (s.includes('tech')) return 'technician';
        if (s.includes('manager')) return 'manager';
        if (s.includes('admin')) return 'admin';
        if (s.includes('reception')) return 'receptionist';
        return s;
    },
    _packRoles(roles) {
        const normalized = [...new Set((roles || []).map(r => this._normRole(r)).filter(Boolean))];
        if (!normalized.length) normalized.push('technician');
        const order = ['admin', 'manager', 'receptionist', 'technician'];
        const primary = order.find(r => normalized.includes(r)) || normalized[0];
        return { roles: normalized, role: primary };
    },
    normalizeStaffRoles() {
        let changed = false;
        (this.data.staff || []).forEach(s => {
            if (!s) return;
            const raw = [];
            if (Array.isArray(s.roles)) raw.push(...s.roles);
            else if (typeof s.roles === 'string' && s.roles.trim()) raw.push(...s.roles.split(/[,|/]/));
            if (s.role) raw.push(s.role);
            const packed = this._packRoles(raw);
            if (s.role !== packed.role || JSON.stringify(s.roles || []) !== JSON.stringify(packed.roles)) {
                s.role = packed.role;
                s.roles = packed.roles;
                changed = true;
            }
            // Keep avatar initials in sync with name (single name → one letter)
            const initials = (typeof Utils !== 'undefined' && Utils.getInitials) ? Utils.getInitials(s.name) : (function (name) {
                    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
                    if (!parts.length) return '?';
                    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
                    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
                })(s.name);
            if (initials && s.avatar !== initials) {
                s.avatar = initials;
                changed = true;
            }
        });
        if (changed) this.saveData();
    },

    // Technicians only — for booking, public site, schedule columns
    getBookableStaff() {
        if (typeof Utils !== 'undefined' && Utils.getBookableStaff) {
            return Utils.getBookableStaff(this.getStaff());
        }
        return this.getStaff().filter(s =>
            s.status !== 'inactive' && s.status !== 'deleted'
            && String(s.role || '').toLowerCase().includes('tech'));
    },

    // Front-desk receptionist login (one-time, idempotent).
    // The Scheduler allows manager/admin/receptionist, but the real team has
    // no receptionist — this creates one. If the account is later deleted on
    // purpose, it is NOT recreated (the one-time flag stays set).
    ensureFrontDeskAccount() {
        try {
            if (localStorage.getItem('aiSalonPro_frontdesk_v1')) return;
            const exists = (this.data.staff || []).some(s => {
                if (typeof Utils !== 'undefined' && Utils.getStaffRoles) {
                    return Utils.getStaffRoles(s).includes('receptionist');
                }
                return (s.role || '').toLowerCase() === 'receptionist';
            });
            if (!exists) {
                const newId = this._nextStaffId();
                this.data.staff.push({
                    id: newId,
                    name: 'Front Desk',
                    role: 'receptionist',
                    roles: ['receptionist'],
                    pin: '1010',
                    email: '',
                    phone: '',
                    status: 'active',
                    commission: 0,
                    hoursWorked: 0,
                    payType: 'hourly',
                    hourlyRate: 18,
                    specialties: ['Reception'],
                    avatar: 'FD',
                    color: '#14b8a6',
                    isClockedIn: false,
                    createdAt: new Date().toISOString()
                });
                if (this.logAudit) this.logAudit('staff_added', 'Front Desk receptionist account auto-created.');
                this.saveData();
            }
            localStorage.setItem('aiSalonPro_frontdesk_v1', '1');
        } catch (e) {
            console.error('Front desk account check failed:', e);
        }
    },
    
    // Load data from localStorage
    loadData() {
        try {
            const saved = localStorage.getItem(SALON_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults to ensure all fields exist
                const merged = this.mergeDeep(DEFAULT_SALON_DATA, parsed);
                // If a saved roster exists (even empty), never resurrect DEFAULT staff
                if (Object.prototype.hasOwnProperty.call(parsed, 'staff') && Array.isArray(parsed.staff)) {
                    merged.staff = parsed.staff;
                }
                if (Object.prototype.hasOwnProperty.call(parsed, 'staffArchive') && Array.isArray(parsed.staffArchive)) {
                    merged.staffArchive = parsed.staffArchive;
                }
                if (Object.prototype.hasOwnProperty.call(parsed, 'pinHistory') && Array.isArray(parsed.pinHistory)) {
                    merged.pinHistory = parsed.pinHistory;
                }
                return this.applyArchiveTombstones(merged);
            }
        } catch (e) {
            console.error('Error loading data:', e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_SALON_DATA));
    },
    
    // Load settings from localStorage
    loadSettings() {
        try {
            const saved = localStorage.getItem(SALON_SETTINGS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...DEFAULT_SETTINGS, ...parsed };
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
        return { ...DEFAULT_SETTINGS };
    },
    
    // Save data to localStorage
    _capsName(v) {
        if (typeof Utils !== 'undefined' && Utils.capsName) return Utils.capsName(v);
        return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().toUpperCase();
    },

    _capsPerson(obj) {
        if (typeof Utils !== 'undefined' && Utils.capsPerson) return Utils.capsPerson(obj);
        if (!obj) return obj;
        ['firstName', 'lastName', 'name', 'clientName', 'staffName', 'lastStaff', 'lastStaffName'].forEach((k) => {
            if (obj[k] != null && obj[k] !== '') obj[k] = this._capsName(obj[k]);
        });
        return obj;
    },

    _normPhoneDigits(p) {
        const raw = String(p == null ? '' : p).trim();
        if (!raw || /^n\/?a$/i.test(raw)) return '';
        const d = raw.replace(/\D/g, '');
        return d.length >= 7 ? d : '';
    },

    _nameKey(s) {
        return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
    },

    _clientDisplayName(c) {
        if (!c) return '';
        const named = String(c.name || '').replace(/\s+/g, ' ').trim();
        if (named) return named;
        return String((c.firstName || '') + ' ' + (c.lastName || '')).replace(/\s+/g, ' ').trim();
    },

    _namesLooselyMatch(a, b) {
        const ka = this._nameKey(a);
        const kb = this._nameKey(b);
        if (!ka || !kb) return false;
        if (ka === kb) return true;
        return ka.indexOf(kb) !== -1 || kb.indexOf(ka) !== -1;
    },

    _isAnonymousGuestName(name) {
        return /^guest(\s+\d+)?$/.test(this._nameKey(name));
    },

    /** Find a client on a data blob by id, phone, or unique name. */
    _findClientOnData(data, hint) {
        const clients = (data && data.clients) || [];
        const h = hint || {};
        const id = (h.clientId != null && h.clientId !== '') ? h.clientId : null;
        if (id != null) {
            const byId = clients.find((c) => c && (c.id == id || String(c.id) === String(id)));
            if (byId) {
                const hintName = h.clientName || h.name || ((h.firstName || '') + ' ' + (h.lastName || '')).trim();
                const clientName = this._clientDisplayName(byId);
                if (!hintName || this._namesLooselyMatch(hintName, clientName)) return byId;
                // Wrong id (e.g. "Guest 2" attached to a different person) — keep searching
            }
        }
        const phoneKey = this._normPhoneDigits(h.phone || h.clientPhone);
        if (phoneKey) {
            const byPhone = clients.find((c) => this._normPhoneDigits(c && c.phone) === phoneKey);
            if (byPhone) return byPhone;
        }
        const nameKey = this._nameKey(h.clientName || h.name || ((h.firstName || '') + ' ' + (h.lastName || '')));
        if (nameKey && nameKey.length >= 3 && !this._isAnonymousGuestName(nameKey)) {
            const matches = clients.filter((c) => this._nameKey(this._clientDisplayName(c)) === nameKey);
            if (matches.length === 1) return matches[0];
        }
        return null;
    },

    _createClientOnData(data, hint) {
        if (!data.clients) data.clients = [];
        const h = hint || {};
        const rawName = String(h.clientName || h.name || ((h.firstName || '') + ' ' + (h.lastName || ''))).replace(/\s+/g, ' ').trim();
        const parts = rawName.split(/\s+/).filter(Boolean);
        const first = this._capsName(h.firstName || parts[0] || 'Guest');
        const last = this._capsName(h.lastName || parts.slice(1).join(' ') || '');
        const fullName = this._capsName(rawName || first);
        const ids = data.clients.map((c) => Number(c && c.id)).filter((n) => Number.isFinite(n) && n > 0);
        const newId = (ids.length ? Math.max.apply(null, ids) : 0) + 1;
        const client = {
            id: newId,
            firstName: first,
            lastName: last,
            name: fullName,
            phone: h.phone || h.clientPhone || '',
            email: h.email || h.clientEmail || '',
            createdAt: new Date().toISOString(),
            points: 0,
            totalVisits: 0,
            totalAmount: 0,
            totalAmountByYear: 0,
            lastVisit: null,
            lastStaff: null,
            lastService: null,
            source: h.source || 'booking'
        };
        this._capsPerson(client);
        data.clients.push(client);
        return client;
    },

    /** Always attach a real client row so scheduler / booking / client list stay identical. */
    _linkAppointmentToClientOnData(data, appt) {
        if (!appt || !data) return appt;
        let client = this._findClientOnData(data, appt);
        const hasIdentity = !!(
            (appt.clientName && String(appt.clientName).trim()) ||
            (appt.name && String(appt.name).trim()) ||
            (appt.firstName && String(appt.firstName).trim()) ||
            this._normPhoneDigits(appt.phone || appt.clientPhone)
        );
        if (!client && hasIdentity) {
            client = this._createClientOnData(data, appt);
        }
        if (client) {
            appt.clientId = client.id;
            const display = this._clientDisplayName(client);
            if (display) appt.clientName = display;
            if (!appt.phone && client.phone) appt.phone = client.phone;
        }
        return appt;
    },

    ensureClientForAppointment(appointmentData) {
        if (!this.data) return appointmentData || {};
        if (!this.data.clients) this.data.clients = [];
        return this._linkAppointmentToClientOnData(this.data, appointmentData || {});
    },

    _healAppointmentClientLinks(data) {
        try {
            if (!data || typeof data !== 'object') return data;
            if (!Array.isArray(data.clients)) data.clients = [];
            const self = this;
            const linkList = function (list) {
                if (!Array.isArray(list)) return;
                list.forEach(function (a) { self._linkAppointmentToClientOnData(data, a); });
            };
            linkList(data.appointments);
            linkList(data.appointmentArchive);
        } catch (eHealClients) { /* ignore */ }
        return data;
    },

    _capsAllPeople() {
        try {
            (this.data.staff || []).forEach((s) => this._capsPerson(s));
            (this.data.clients || []).forEach((c) => this._capsPerson(c));
            (this.data.appointments || []).forEach((a) => this._capsPerson(a));
            // Permanent rename aliases — never let old spellings resurrect
            this._applyStaffNameAliases();
        } catch (eCaps) { /* ignore */ }
    },

    _applyStaffNameAliases() {
        try {
            const ALIASES = {
                danley: 'Danlay'
            };
            const staff = this.data.staff || [];
            const byCanon = {};
            const kept = [];
            staff.forEach((s) => {
                if (!s) return;
                let name = String(s.name || '').trim();
                const key = name.toLowerCase();
                if (ALIASES[key]) {
                    name = ALIASES[key];
                    s.name = name;
                }
                const canon = name.toLowerCase();
                if (byCanon[canon]) {
                    // Duplicate after alias — keep the one already chosen, drop this
                    return;
                }
                byCanon[canon] = s;
                kept.push(s);
            });
            this.data.staff = kept;
            // Scrub archive + appointment staffName fields
            (this.data.staffArchive || []).forEach((s) => {
                if (!s) return;
                const key = String(s.name || '').trim().toLowerCase();
                if (ALIASES[key]) s.name = ALIASES[key];
            });
            const scrubAppt = (a) => {
                if (!a) return;
                const sn = String(a.staffName || '').trim().toLowerCase();
                if (ALIASES[sn]) a.staffName = ALIASES[sn];
                (a.services || []).forEach((sv) => {
                    if (!sv) return;
                    const svn = String(sv.staffName || '').trim().toLowerCase();
                    if (ALIASES[svn]) sv.staffName = ALIASES[svn];
                });
            };
            (this.data.appointments || []).forEach(scrubAppt);
            (this.data.appointmentArchive || []).forEach(scrubAppt);
        } catch (eAlias) { /* ignore */ }
    },

    saveData(opts) {
        try {
            opts = opts || {};
            const persistOnly = !!opts.persistOnly;
            const silent = !!opts.silent;
            this._capsAllPeople();
            // Silent persist (periodic) must not bump lastUpdated or the UI rebuilds for no reason.
            // Close/shutdown persist MUST bump lastUpdated so other OS packages keep this copy.
            if (!silent || persistOnly) this.data.lastUpdated = new Date().toISOString();
            // NEVER silently wipe appointments — restore prior local copy if empty write is accidental
            try {
                if ((!Array.isArray(this.data.appointments) || this.data.appointments.length === 0)
                    && !this._resetInProgress && !this._explicitClearCalendar) {
                    const prevRaw = localStorage.getItem(SALON_STORAGE_KEY);
                    if (prevRaw) {
                        const prev = JSON.parse(prevRaw);
                        const prevAppts = (prev && prev.appointments) || [];
                        if (prevAppts.length > 0) {
                            console.warn('[UNB] Blocked empty appointment wipe — restoring', prevAppts.length, 'appointments');
                            this.data.appointments = prevAppts;
                            if (Array.isArray(prev.appointmentArchive)) {
                                this.data.appointmentArchive = this._mergeRowsById(
                                    this.data.appointmentArchive || [],
                                    prev.appointmentArchive
                                );
                            }
                        }
                    }
                }
            } catch (eGuard) { /* ignore */ }
            // NEVER silently wipe staff roster
            try {
                if ((!Array.isArray(this.data.staff) || this.data.staff.length === 0)
                    && !this._resetInProgress && !this._explicitClearStaff) {
                    const prevRaw = localStorage.getItem(SALON_STORAGE_KEY);
                    if (prevRaw) {
                        const prev = JSON.parse(prevRaw);
                        const prevStaff = (prev && prev.staff) || [];
                        if (prevStaff.length > 0) {
                            console.warn('[UNB] Blocked empty staff wipe — restoring', prevStaff.length, 'staff');
                            this.data.staff = prevStaff;
                        }
                    }
                } else if (Array.isArray(this.data.staff)) {
                    // Merge any previously saved staff missing from this write (by name)
                    const prevRaw = localStorage.getItem(SALON_STORAGE_KEY);
                    if (prevRaw) {
                        const prev = JSON.parse(prevRaw);
                        const prevStaff = (prev && prev.staff) || [];
                        if (prevStaff.length > this.data.staff.length) {
                            this.data.staff = this._mergeRowsById(this.data.staff, prevStaff);
                        } else if (prevStaff.length) {
                            const have = {};
                            this.data.staff.forEach(function (s) {
                                const nm = String((s && s.name) || '').trim().toLowerCase();
                                if (nm) have[nm] = true;
                            });
                            prevStaff.forEach((s) => {
                                const nm = String((s && s.name) || '').trim().toLowerCase();
                                if (!nm || have[nm]) return;
                                this.data.staff.push(s);
                                have[nm] = true;
                            });
                        }
                    }
                }
            } catch (eStaffGuard) { /* ignore */ }
            try {
                localStorage.setItem(SALON_STORAGE_KEY, JSON.stringify(this.data));
                localStorage.setItem(SALON_SYNC_KEY, Date.now().toString());
            } catch (storageErr) {
                // Quota exceeded — keep going so server sync can still persist the import
                console.error('localStorage save failed (quota?):', storageErr);
                if (!silent && !persistOnly) this.notifyListeners('data', this.data);
                if (!persistOnly) this.pushToServer();
                return false;
            }
            if (!silent && !persistOnly) this.notifyListeners('data', this.data);
            if (!persistOnly) this.pushToServer();
            // Automatic hourly backup snapshot so nothing is ever lost
            if (!this._skipBackupSnapshot) {
                const lastSnap = parseInt(localStorage.getItem('aiSalonPro_v3_lastSnapshot') || '0');
                if (Date.now() - lastSnap > 15 * 60 * 1000) {
                    try {
                        localStorage.setItem('aiSalonPro_v3_lastSnapshot', Date.now().toString());
                        this.createBackupSnapshot('auto-hourly');
                    } catch (e) { /* ignore backup failures */ }
                }
            }
            return true;
        } catch (e) {
            console.error('Error saving data:', e);
            try { this.pushToServer(); } catch (e2) { /* ignore */ }
            return false;
        }
    },
    
    // Save settings to localStorage
    saveSettings(opts) {
        try {
            opts = opts || {};
            const persistOnly = !!opts.persistOnly;
            const silent = !!opts.silent;
            localStorage.setItem(SALON_SETTINGS_KEY, JSON.stringify(this.settings));
            localStorage.setItem(SALON_SYNC_KEY, Date.now().toString());
            if (!silent && !persistOnly) this.notifyListeners('settings', this.settings);
            if (!persistOnly) this.pushToServer();
            return true;
        } catch (e) {
            console.error('Error saving settings:', e);
            return false;
        }
    },
    
    // Save everything
    saveAll(opts) {
        this.saveData(opts);
        this.saveSettings(opts);
    },
    
    // Deep merge helper
    mergeDeep(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.mergeDeep(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    },
    
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },
    
    // ===================== STAFF OPERATIONS =====================
    
    getStaff(id) {
        if (id !== undefined && id !== null && id !== '') {
            return (this.data.staff || []).find(s => s && (s.id == id || String(s.id) === String(id))) || null;
        }
        // Name-sorted copy so Admin / Manager / Scheduler / Booking always match
        return (this.data.staff || []).slice().sort(function (a, b) {
            return String(a && a.name || '').localeCompare(String(b && b.name || ''), undefined, { sensitivity: 'base' });
        });
    },
    
    // Notify pages that the staff roster changed (in addition to generic 'data').
    // Same-tab UIs can refresh columns/pickers immediately; cross-tab still uses
    // storage/server sync → notifyListeners('data').
    _emitStaffChanged(action, staffOrId) {
        const detail = {
            action: action || 'change',
            staffId: staffOrId && typeof staffOrId === 'object' ? staffOrId.id : staffOrId,
            staff: staffOrId && typeof staffOrId === 'object' ? staffOrId : null
        };
        try { this.notifyListeners('staff', detail); } catch (e) { /* ignore */ }
        try {
            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new CustomEvent('unb:staff-changed', { detail: detail }));
            }
        } catch (e2) { /* ignore */ }
        // Kick every known staff UI on this page (Admin, Manager, Scheduler, Booking)
        try {
            if (typeof window !== 'undefined' && typeof window.refreshSalonStaffUIs === 'function') {
                window.refreshSalonStaffUIs(detail);
            }
        } catch (e3) { /* ignore */ }
    },

    // Never reuse ids from live staff OR staffArchive — archived ids are
    // tombstoned and would instantly delete a newly added person on sync.
    _nextStaffId() {
        let max = 0;
        const bump = (arr) => {
            (arr || []).forEach((row) => {
                const n = Number(row && row.id);
                if (Number.isFinite(n) && n > max) max = n;
            });
        };
        bump(this.data && this.data.staff);
        bump(this.data && this.data.staffArchive);
        return max + 1;
    },

    _normalizePin(pin) {
        return String(pin == null ? '' : pin).trim();
    },

    _isValidPin(pin) {
        return /^\d{4}$/.test(this._normalizePin(pin));
    },

    _staffRoles(staff) {
        try {
            if (typeof Utils !== 'undefined' && Utils && typeof Utils.getStaffRoles === 'function') {
                return Utils.getStaffRoles(staff);
            }
        } catch (e) { /* ignore */ }
        const raw = [];
        if (staff && Array.isArray(staff.roles)) raw.push.apply(raw, staff.roles);
        else if (staff && typeof staff.roles === 'string' && staff.roles.trim()) {
            raw.push.apply(raw, staff.roles.split(/[,|/]/).map(function (x) { return x.trim(); }).filter(Boolean));
        }
        if (staff && staff.role) raw.push(staff.role);
        return raw.map(function (r) { return String(r || '').toLowerCase().trim(); }).filter(Boolean);
    },

    // Signature used to detect role / roster edits across tabs (not just add/delete count)
    _staffSyncSig(dataOrStaffList) {
        const list = Array.isArray(dataOrStaffList)
            ? dataOrStaffList
            : ((dataOrStaffList && dataOrStaffList.staff) || []);
        return list.map(function (s) {
            if (!s) return '';
            const roles = Array.isArray(s.roles) ? s.roles.slice().map(String).sort().join('+') : String(s.role || '');
            return [
                String(s.id),
                String(s.name || ''),
                String(s.role || ''),
                roles,
                String(s.status || ''),
                String(s.pin || ''),
                String(s.isClockedIn ? 1 : 0)
            ].join(':');
        }).join('|');
    },

    _staffIsActive(staff) {
        const st = String((staff && staff.status) || 'active').toLowerCase();
        return st !== 'inactive' && st !== 'deleted';
    },

    findStaffByPin(pin, excludeStaffId) {
        const p = this._normalizePin(pin);
        if (!p) return null;
        const ex = excludeStaffId == null ? null : String(excludeStaffId);
        return (this.data.staff || []).find(function (s) {
            if (!s || String(s.pin || '') !== p) return false;
            if (ex != null && String(s.id) === ex) return false;
            return true;
        }) || null;
    },

    _actorFromPin(pin) {
        const p = this._normalizePin(pin);
        if (!p) return { ok: false, isAdmin: false, isManager: false };
        if (p === String((this.settings && this.settings.adminPin) || '')) {
            return { ok: true, isAdmin: true, isManager: true, via: 'adminPin', name: 'Admin' };
        }
        if (p === String((this.settings && this.settings.managerPin) || '')) {
            return { ok: true, isAdmin: false, isManager: true, via: 'managerPin', name: 'Manager' };
        }
        const staff = this.findStaffByPin(p);
        if (!staff || !this._staffIsActive(staff)) {
            return { ok: false, isAdmin: false, isManager: false };
        }
        const roles = this._staffRoles(staff);
        const isAdmin = roles.indexOf('admin') >= 0;
        const isManager = isAdmin || roles.indexOf('manager') >= 0;
        return {
            ok: isAdmin || isManager,
            isAdmin: isAdmin,
            isManager: isManager,
            via: 'staffPin',
            name: staff.name || 'Staff',
            staffId: staff.id,
            staff: staff
        };
    },

    _pinInUse(pin, excludeStaffId) {
        const p = this._normalizePin(pin);
        if (!p) return false;
        if (p === String((this.settings && this.settings.adminPin) || '')) return true;
        if (p === String((this.settings && this.settings.managerPin) || '')) return true;
        return !!this.findStaffByPin(p, excludeStaffId);
    },

    allocateUniquePin() {
        const used = {};
        used[String((this.settings && this.settings.adminPin) || '0000')] = true;
        used[String((this.settings && this.settings.managerPin) || '1111')] = true;
        (this.data.staff || []).forEach(function (s) {
            if (s && s.pin) used[String(s.pin)] = true;
        });
        for (let n = 1020; n <= 9999; n++) {
            const p = String(n).padStart(4, '0');
            if (!used[p]) return p;
        }
        return String(1000 + Math.floor(Math.random() * 9000));
    },

    _recordPinChange(entry) {
        if (!Array.isArray(this.data.pinHistory)) this.data.pinHistory = [];
        const row = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            at: new Date().toISOString(),
            kind: entry.kind || 'staff',
            staffId: entry.staffId != null ? entry.staffId : null,
            staffName: entry.staffName || '',
            oldPin: this._normalizePin(entry.oldPin),
            newPin: this._normalizePin(entry.newPin),
            by: entry.by || 'unknown',
            source: entry.source || 'app'
        };
        this.data.pinHistory.push(row);
        if (this.data.pinHistory.length > 400) {
            this.data.pinHistory = this.data.pinHistory.slice(-400);
        }
        try {
            const key = 'aiSalonPro_v3_pin_history';
            const extra = JSON.parse(localStorage.getItem(key) || '[]');
            extra.push(row);
            while (extra.length > 400) extra.shift();
            localStorage.setItem(key, JSON.stringify(extra));
        } catch (eLed) { /* ignore */ }
        return row;
    },

    _backupPinsNow(label) {
        try { this.createBackupSnapshot(label || 'pin-change'); } catch (e) { /* ignore */ }
    },

    _syncSessionPin(oldPin, newPin) {
        const o = this._normalizePin(oldPin);
        const n = this._normalizePin(newPin);
        if (!o || !n || o === n) return;
        try {
            const raw = localStorage.getItem('aiSalonPro_v3_session');
            if (!raw) return;
            const sess = JSON.parse(raw);
            if (sess && sess.user && String(sess.user.pin || '') === o) {
                sess.user.pin = n;
                localStorage.setItem('aiSalonPro_v3_session', JSON.stringify(sess));
            }
        } catch (e) { /* ignore */ }
    },

    _persistPinAndSync(staffOrNull, label) {
        this._backupPinsNow(label);
        this.saveData();
        try { this.flushPushToServer(); } catch (e) { /* ignore */ }
        if (staffOrNull) this._emitStaffChanged('update', staffOrNull);
        try {
            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new CustomEvent('unb:pin-changed', {
                    detail: { staffId: staffOrNull && staffOrNull.id, at: new Date().toISOString() }
                }));
            }
        } catch (e2) { /* ignore */ }
    },

    addStaff(staffData) {
        const newId = this._nextStaffId();
        const packed = this._packRoles(staffData.roles || [staffData.role || 'technician']);
        let pin = this._normalizePin(staffData && staffData.pin);
        if (!this._isValidPin(pin) || this._pinInUse(pin)) {
            pin = this.allocateUniquePin();
        }
        const staff = { 
            id: newId, 
            createdAt: new Date().toISOString(),
            isClockedIn: false,
            hoursWorked: 0,
            ...staffData,
            pin: pin,
            role: packed.role,
            roles: packed.roles
        };
        this._capsPerson(staff);
        // Re-adding a previously deleted name clears the name tombstone
        try {
            const nm = String(staff.name || '').trim().toLowerCase();
            if (nm && Array.isArray(this.data.staffArchive)) {
                this.data.staffArchive = this.data.staffArchive.filter(a =>
                    String(a && a.name || '').trim().toLowerCase() !== nm
                );
            }
        } catch (eArch) { /* ignore */ }
        this.data.staff.push(staff);
        this._recordPinChange({
            kind: 'staff-add',
            staffId: staff.id,
            staffName: staff.name,
            oldPin: '',
            newPin: pin,
            by: 'addStaff',
            source: 'add'
        });
        this.logAudit('staff_added', 'Staff "' + (staff.name || '') + '" added with PIN (ID ' + staff.id + ').');
        this._persistPinAndSync(staff, 'staff-pin-add-' + String(staff.name || staff.id).replace(/\s+/g, '-'));
        this._emitStaffChanged('add', staff);
        return staff;
    },
    
    updateStaff(id, updates) {
        const idx = this.data.staff.findIndex(s => s.id == id || String(s.id) === String(id));
        if (idx >= 0) {
            const prev = this.data.staff[idx];
            const nextUpdates = Object.assign({}, updates || {});
            const requestedPin = nextUpdates.pin;
            delete nextUpdates.pin;
            const prevRolesSig = JSON.stringify(this._staffRoles(prev).slice().sort());
            const next = { ...prev, ...nextUpdates, updatedAt: new Date().toISOString() };
            this._capsPerson(next);
            if (Object.prototype.hasOwnProperty.call(nextUpdates, 'roles')
                || Object.prototype.hasOwnProperty.call(nextUpdates, 'role')) {
                const packed = this._packRoles(nextUpdates.roles || [nextUpdates.role || next.role]);
                next.role = packed.role;
                next.roles = packed.roles;
            }
            const rolesChanged = JSON.stringify(this._staffRoles(next).slice().sort()) !== prevRolesSig;
            let pinChanged = false;
            if (requestedPin != null && String(requestedPin).trim() !== '') {
                const p = this._normalizePin(requestedPin);
                if (this._isValidPin(p) && p !== String(prev.pin || '')) {
                    if (this._pinInUse(p, prev.id)) {
                        // Keep existing PIN rather than colliding
                    } else {
                        this._recordPinChange({
                            kind: 'staff-update',
                            staffId: prev.id,
                            staffName: next.name || prev.name,
                            oldPin: prev.pin,
                            newPin: p,
                            by: 'updateStaff',
                            source: 'update'
                        });
                        next.pin = p;
                        next.pinPrevious = this._normalizePin(prev.pin);
                        pinChanged = true;
                        this._syncSessionPin(prev.pin, p);
                    }
                }
            }
            this.data.staff[idx] = next;
            if (pinChanged) {
                this.logAudit('pin_changed', 'PIN changed for staff "' + (next.name || '') + '" (ID ' + next.id + ') via updateStaff.');
                this._persistPinAndSync(next, 'staff-pin-update-' + String(next.name || next.id).replace(/\s+/g, '-'));
                if (rolesChanged) {
                    try {
                        this.logAudit(
                            'staff_roles_changed',
                            'Roles updated for "' + (next.name || '') + '": ' + (next.roles || []).join(', ')
                        );
                    } catch (eRoleLog) { /* ignore */ }
                }
            } else {
                this.saveData();
                if (rolesChanged) {
                    try {
                        this.createBackupSnapshot(
                            'staff-roles-' + String(next.name || next.id).replace(/\s+/g, '-').toLowerCase()
                        );
                    } catch (eBak) { /* ignore */ }
                    try {
                        this.logAudit(
                            'staff_roles_changed',
                            'Roles updated for "' + (next.name || '') + '": ' + (next.roles || []).join(', ')
                        );
                    } catch (eRoleLog2) { /* ignore */ }
                }
                try { this.flushPushToServer(); } catch (e) { /* ignore */ }
                this._emitStaffChanged(rolesChanged ? 'roles' : 'update', this.data.staff[idx]);
            }
            return this.data.staff[idx];
        }
        return null;
    },
    
    deleteStaff(id, deletedBy = 'unknown') {
        const nid = Number(id);
        const staff = this.data.staff.find(s => s.id == id || s.id === nid || String(s.id) === String(id));
        if (staff) {
            const sid = staff.id;
            // NEVER remove appointment blocks when archiving staff — keep all bookings on the calendar.
            if (!Array.isArray(this.data.staffArchive)) this.data.staffArchive = [];
            this.data.staffArchive.push({
                ...staff,
                archivedAt: new Date().toISOString(),
                deletedBy: deletedBy,
                archivedAppointments: 0
            });
            this.data.staff = this.data.staff.filter(s => s.id != sid && s.id !== nid && String(s.id) !== String(id));
            this.logAudit('staff_deleted', 'Staff "' + staff.name + '" (ID ' + sid + ') archived by ' + deletedBy + '. Appointments kept on calendar.');
            this.saveData();
            try { this.flushPushToServer(); } catch (e) { /* ignore */ }
            this._emitStaffChanged('delete', staff);
            return true;
        }
        return false;
    },
    
    changeStaffRole(staffId, newRole, managerPin) {
        const staff = this.data.staff.find(s => s.id === staffId || String(s.id) === String(staffId));
        if (!staff) return { success: false, message: 'Staff not found' };
        const actor = this._actorFromPin(managerPin);
        if (!actor.ok) {
            return { success: false, message: 'Invalid PIN or insufficient permissions' };
        }
        if (actor.isAdmin) {
            staff.role = newRole;
            staff.updatedAt = new Date().toISOString();
            this.saveData();
            try { this.flushPushToServer(); } catch (e) { /* ignore */ }
            this._emitStaffChanged('update', staff);
            return { success: true, message: `Role changed to ${newRole}` };
        }
        if (actor.isManager) {
            const targetRoles = this._staffRoles(staff);
            if (targetRoles.indexOf('admin') >= 0) {
                return { success: false, message: 'Only admin can change an admin role' };
            }
            if (String(newRole || '').toLowerCase() === 'admin') {
                return { success: false, message: 'Only admin can assign admin role' };
            }
            staff.role = newRole;
            staff.updatedAt = new Date().toISOString();
            this.saveData();
            try { this.flushPushToServer(); } catch (e) { /* ignore */ }
            this._emitStaffChanged('update', staff);
            return { success: true, message: `Role changed to ${newRole}` };
        }
        return { success: false, message: 'Invalid PIN or insufficient permissions' };
    },

    // Change a staff member's PIN.
    // Acting PIN may be the master admin/manager PIN OR an active admin/manager staff PIN.
    // Only ADMIN may change a manager's or admin's PIN.
    // Old + new PINs are written to pinHistory and a backup snapshot.
    changeStaffPin(staffId, newPin, actingPin) {
        const staff = (this.data.staff || []).find(s => s && (s.id == staffId || String(s.id) === String(staffId)));
        if (!staff) return { success: false, message: 'Staff not found' };
        const pin = this._normalizePin(newPin);
        if (!this._isValidPin(pin)) {
            return { success: false, message: 'PIN must be exactly 4 digits' };
        }
        if (pin === String(staff.pin || '')) {
            return { success: true, message: 'PIN unchanged', staff: staff };
        }
        if (this._pinInUse(pin, staff.id)) {
            return { success: false, message: 'That PIN is already in use. Choose a different 4-digit PIN.' };
        }

        const actor = this._actorFromPin(actingPin);
        if (!actor.ok) {
            return { success: false, message: 'A valid admin or manager PIN is required to change staff PINs' };
        }

        const targetRoles = this._staffRoles(staff);
        const targetIsPrivileged = targetRoles.indexOf('admin') >= 0 || targetRoles.indexOf('manager') >= 0;
        if (targetIsPrivileged && !actor.isAdmin) {
            return { success: false, message: 'Only admin can change a manager or admin PIN' };
        }

        const oldPin = this._normalizePin(staff.pin);
        staff.pinPrevious = oldPin;
        staff.pin = pin;
        staff.updatedAt = new Date().toISOString();
        this._recordPinChange({
            kind: 'staff-change',
            staffId: staff.id,
            staffName: staff.name,
            oldPin: oldPin,
            newPin: pin,
            by: actor.name || (actor.isAdmin ? 'admin' : 'manager'),
            source: 'changeStaffPin'
        });
        this.logAudit('pin_changed', 'PIN changed for staff "' + staff.name + '" (ID ' + staff.id + ') by ' + (actor.name || (actor.isAdmin ? 'admin' : 'manager')) + '.');
        this._syncSessionPin(oldPin, pin);
        this._persistPinAndSync(staff, 'staff-pin-change-' + String(staff.name || staff.id).replace(/\s+/g, '-'));
        return { success: true, message: 'PIN updated for ' + staff.name, staff: staff, oldPin: oldPin, newPin: pin };
    },

    // Change master Admin / Manager page PINs. Backs up old + new automatically.
    changeMasterPins(updates, confirmAdminPin) {
        updates = updates || {};
        if (confirmAdminPin != null && !this.verifyAdminPin(confirmAdminPin)) {
            return { success: false, message: 'Current admin PIN is incorrect' };
        }
        const nextAdmin = updates.adminPin != null ? this._normalizePin(updates.adminPin) : '';
        const nextManager = updates.managerPin != null ? this._normalizePin(updates.managerPin) : '';
        if (nextAdmin && !this._isValidPin(nextAdmin)) {
            return { success: false, message: 'Admin PIN must be exactly 4 digits' };
        }
        if (nextManager && !this._isValidPin(nextManager)) {
            return { success: false, message: 'Manager PIN must be exactly 4 digits' };
        }
        const oldAdmin = this._normalizePin(this.settings.adminPin);
        const oldManager = this._normalizePin(this.settings.managerPin);
        let changed = false;
        if (nextAdmin && nextAdmin !== oldAdmin) {
            this._recordPinChange({
                kind: 'master-admin',
                staffName: 'Admin (master)',
                oldPin: oldAdmin,
                newPin: nextAdmin,
                by: 'admin',
                source: 'changeMasterPins'
            });
            this.settings.adminPin = nextAdmin;
            this._syncSessionPin(oldAdmin, nextAdmin);
            changed = true;
        }
        if (nextManager && nextManager !== oldManager) {
            this._recordPinChange({
                kind: 'master-manager',
                staffName: 'Manager (master)',
                oldPin: oldManager,
                newPin: nextManager,
                by: 'admin',
                source: 'changeMasterPins'
            });
            this.settings.managerPin = nextManager;
            this._syncSessionPin(oldManager, nextManager);
            changed = true;
        }
        if (!changed) return { success: true, message: 'Nothing to change' };
        this._backupPinsNow('master-pin-change');
        this.saveSettings();
        this.saveData();
        try { this.flushPushToServer(); } catch (e) { /* ignore */ }
        this.logAudit('security_updated', 'Master admin/manager PIN updated. Old and new PINs backed up.');
        return { success: true, message: 'Security PINs saved and backed up' };
    },

    // Search staff by first name, last name, full name, full phone number,
    // last 4 digits of phone, or email
    getStaffSearch(search) {
        let staff = this.data.staff;
        if (search) {
            const term = search.toLowerCase().trim();
            const termDigits = term.replace(/\D/g, '');
            staff = staff.filter(s => {
                const parts = (s.name || '').toLowerCase().split(/\s+/);
                const firstName = parts[0] || '';
                const lastName = parts[parts.length - 1] || '';
                const fullName = (s.name || '').toLowerCase();
                const phone = (s.phone || '').replace(/\D/g, '');
                const phoneLast4 = phone.slice(-4);
                const email = (s.email || '').toLowerCase();

                return fullName.includes(term) ||
                       firstName.includes(term) ||
                       lastName.includes(term) ||
                       (termDigits && phone.includes(termDigits)) ||
                       (termDigits.length === 4 && phoneLast4 === termDigits) ||
                       email.includes(term);
            });
        }
        return staff;
    },
    
    // ===================== CLIENT OPERATIONS =====================
    
    getClients(search) {
        let clients = this.data.clients;
        if (search) {
            const term = search.toLowerCase().trim();
            const termDigits = term.replace(/\D/g, '');
            clients = clients.filter(c => {
                const firstName = (c.firstName || '').toLowerCase();
                const lastName = (c.lastName || '').toLowerCase();
                const fullName = `${firstName} ${lastName}`.trim();
                const phone = (c.phone || '').replace(/\D/g, '');
                const phoneLast4 = phone.slice(-4);
                const email = (c.email || '').toLowerCase();
                
                return fullName.includes(term) ||
                       firstName.includes(term) ||
                       lastName.includes(term) ||
                       phone.includes(termDigits) ||
                       (termDigits.length === 4 && phoneLast4 === termDigits) ||
                       email.includes(term);
            });
        }
        return clients;
    },
    
    getClient(id) {
        if (id == null || id === '') return null;
        return (this.data.clients || []).find(c => c && (c.id == id || String(c.id) === String(id))) || null;
    },
    
    addClient(clientData) {
        if (!this.data.clients) this.data.clients = [];
        const data = clientData || {};
        const normPhone = (p) => {
            const raw = String(p || '').trim();
            if (!raw || /^n\/?a$/i.test(raw)) return '';
            const d = raw.replace(/\D/g, '');
            return d.length >= 7 ? d : raw.toLowerCase();
        };
        const phoneRaw = data.phone != null ? String(data.phone).trim() : '';
        const phoneKey = normPhone(phoneRaw);
        const first = this._capsName(data.firstName != null ? data.firstName : '');
        const last = this._capsName(data.lastName != null ? data.lastName : '');
        const fullName = this._capsName(data.name || ((first + (last ? ' ' + last : '')).trim()));
        // Reuse existing by phone so New Appointment adds stay in sync across pages
        if (phoneKey) {
            const existing = this.data.clients.find(c => {
                const ck = normPhone(c && c.phone);
                return ck && ck === phoneKey;
            });
            if (existing) {
                Object.assign(existing, {
                    firstName: first || existing.firstName || '',
                    lastName: last || existing.lastName || '',
                    name: fullName || existing.name || '',
                    phone: phoneRaw || existing.phone || '',
                    email: data.email != null ? data.email : (existing.email || ''),
                    updatedAt: new Date().toISOString()
                });
                this._capsPerson(existing);
                this.saveData();
                try { this.createBackupSnapshot('client-updated'); } catch (eBak) { /* ignore */ }
                try { this.flushPushToServer(); } catch (eFlush) { /* ignore */ }
                return existing;
            }
        }
        const ids = this.data.clients.map(c => Number(c && c.id)).filter(n => Number.isFinite(n) && n > 0);
        const newId = (ids.length ? Math.max.apply(null, ids) : 0) + 1;
        const client = Object.assign({
            createdAt: new Date().toISOString(),
            points: 0,
            totalVisits: 0,
            totalAmount: 0,
            totalAmountByYear: 0,
            lastVisit: null,
            lastStaff: null,
            lastService: null
        }, data, {
            id: newId,
            firstName: first,
            lastName: last,
            name: fullName,
            phone: phoneRaw,
            email: data.email || ''
        });
        this._capsPerson(client);
        this.data.clients.push(client);
        this.saveData();
        try { this.createBackupSnapshot('client-added'); } catch (eBak) { /* ignore */ }
        try { this.flushPushToServer(); } catch (eFlush) { /* ignore */ }
        return client;
    },
    
    updateClient(id, updates) {
        if (!this.data.clients) this.data.clients = [];
        const idx = this.data.clients.findIndex(c =>
            c && (c.id == id || Number(c.id) === Number(id) || String(c.id) === String(id)));
        if (idx >= 0) {
            const next = { ...this.data.clients[idx], ...updates, updatedAt: new Date().toISOString() };
            this._capsPerson(next);
            this.data.clients[idx] = next;
            this.saveData();
            try { this.createBackupSnapshot('client-updated'); } catch (eBak) { /* ignore */ }
            try { this.flushPushToServer(); } catch (eFlush) { /* ignore */ }
            return this.data.clients[idx];
        }
        return null;
    },

    /** Record a completed visit with services + polish; updates client last-* fields. */
    recordClientVisit(entry) {
        if (!this.data.clientHistory) this.data.clientHistory = [];
        const clientId = entry.clientId;
        if (!clientId) return null;
        const services = Array.isArray(entry.services)
            ? entry.services.map(s => (typeof s === 'string' ? s : (s && s.name) || '')).filter(Boolean)
            : [];
        if (!services.length) return null;
        const id = Math.max(0, ...this.data.clientHistory.map(h => h.id || 0)) + 1;
        const row = {
            id,
            clientId,
            appointmentId: entry.appointmentId || null,
            services,
            staffId: entry.staffId || null,
            staffName: entry.staffName || '',
            date: entry.date,
            time: entry.time || '',
            polishColor: (entry.polishColor || '').trim(),
            notes: (entry.notes || '').trim(),
            createdAt: new Date().toISOString()
        };
        this.data.clientHistory.push(row);
        const client = this.getClient(clientId);
        if (client) {
            client.totalVisits = (client.totalVisits || client.visits || 0) + 1;
            client.visits = client.totalVisits;
            client.lastVisit = entry.date;
            client.lastService = services.join(', ');
            client.lastServices = client.lastService;
            client.lastStaff = entry.staffName || client.lastStaff || null;
            client.lastStaffName = client.lastStaff;
            client.lastStaffId = entry.staffId || client.lastStaffId || null;
            if (row.polishColor) client.lastPolish = row.polishColor;
            client.updatedAt = new Date().toISOString();
        }
        this.saveData();
        return row;
    },

    getClientHistory(clientId) {
        const hist = (this.data.clientHistory || []).filter(h => h.clientId == clientId);
        // Also derive from completed appointments if history is thin
        const fromAppts = (this.data.appointments || [])
            .filter(a => a.clientId == clientId && a.status === 'complete')
            .map(a => ({
                id: 'a-' + a.id,
                clientId,
                appointmentId: a.id,
                services: Array.isArray(a.services)
                    ? a.services.map(s => (typeof s === 'string' ? s : s.name)).filter(Boolean)
                    : (a.serviceName ? [a.serviceName] : []),
                staffId: a.staffId,
                staffName: a.staffName || '',
                date: a.date,
                time: a.time || '',
                polishColor: a.polishColor || '',
                notes: a.notes || a.request || '',
                derived: true
            }))
            .filter(h => h.services.length);
        const seen = new Set(hist.map(h => `${h.date}|${h.time}|${(h.services || []).join(',')}`));
        fromAppts.forEach(h => {
            const key = `${h.date}|${h.time}|${h.services.join(',')}`;
            if (!seen.has(key)) hist.push(h);
        });
        return hist.sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.time).localeCompare(String(a.time)));
    },

    /** Confirm appointment via public token (client clicked confirm). */
    confirmAppointmentByToken(token) {
        if (!token) return { ok: false, error: 'Missing token' };
        const appt = (this.data.appointments || []).find(a => a.confirmToken === token);
        if (!appt) return { ok: false, error: 'Invalid or expired confirmation link' };
        if (appt.status === 'cancelled') return { ok: false, error: 'This appointment was cancelled' };
        appt.clientConfirmed = true;
        appt.clientConfirmedAt = new Date().toISOString();
        appt.reminders = appt.reminders || {};
        appt.reminders.confirmed = true;
        this.notifyManagers(
            'booking',
            `✅ ${appt.clientName || 'Client'} confirmed they are coming — ${appt.date} ${appt.time || ''}`
        );
        this.saveData();
        return { ok: true, appointment: { id: appt.id, clientName: appt.clientName, date: appt.date, time: appt.time } };
    },
    
    deleteClient(id, deletedBy = 'unknown') {
        const nid = Number(id);
        const client = this.data.clients.find(c => c.id == id || c.id === nid || String(c.id) === String(id));
        if (client) {
            const cid = client.id;
            if (!Array.isArray(this.data.clientArchive)) this.data.clientArchive = [];
            this.data.clientArchive.push({
                ...client,
                archivedAt: new Date().toISOString(),
                deletedBy: deletedBy
            });
            this.data.clients = this.data.clients.filter(c => c.id != cid && c.id !== nid && String(c.id) !== String(id));
            // Archive then remove appointments for this client so boards stay in sync
            (this.data.appointments || []).forEach(a => {
                if (a.clientId == cid || a.clientId === nid) {
                    if (!Array.isArray(this.data.appointmentArchive)) this.data.appointmentArchive = [];
                    this.data.appointmentArchive.push(Object.assign({}, a, {
                        archivedAt: new Date().toISOString(),
                        archiveReason: 'Client deleted'
                    }));
                }
            });
            this.data.appointments = (this.data.appointments || []).filter(a => a.clientId != cid && a.clientId !== nid);
            this.logAudit('client_deleted', 'Client "' + ((client.firstName || '') + ' ' + (client.lastName || '')).trim() + '" (ID ' + cid + ') deleted by ' + deletedBy + '. Record archived.');
            this.saveData();
            try { this.flushPushToServer(); } catch (e) { /* ignore */ }
            return true;
        }
        return false;
    },
    
    // Split one CSV/TSV line respecting double-quoted fields
    _parseCsvLine(line, delimiter = ',') {
        const cols = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuotes) {
                if (ch === '"') {
                    if (line[i + 1] === '"') { cur += '"'; i++; }
                    else inQuotes = false;
                } else cur += ch;
            } else if (ch === '"') {
                inQuotes = true;
            } else if (ch === delimiter) {
                cols.push(cur);
                cur = '';
            } else cur += ch;
        }
        cols.push(cur);
        return cols.map(c => String(c || '').trim());
    },

    _detectCsvDelimiter(headerLine) {
        const candidates = [',', '\t', ';', '|'];
        let best = ',';
        let bestCount = -1;
        candidates.forEach(d => {
            const count = this._parseCsvLine(headerLine, d).length;
            if (count > bestCount) { bestCount = count; best = d; }
        });
        return best;
    },

    _normCsvHeader(h) {
        return String(h || '')
            .replace(/^\uFEFF/, '') // strip BOM
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '');
    },

    // Excel often exports phones as 4.805551212E+9 — turn those back into digits
    _normalizeImportedPhone(raw) {
        if (raw == null) return '';
        let s = String(raw).trim();
        if (!s || s === '-' || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'null') return '';

        // Scientific notation from Excel
        if (/e[+\-]?\d+/i.test(s)) {
            const n = Number(s);
            if (Number.isFinite(n) && n > 0) s = Math.round(n).toString();
        }

        // Keep leading + for now, then digits only
        let digits = s.replace(/\D/g, '');
        // Strip US country code
        if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
        if (digits.length < 7) return s.replace(/[^\d+()\-\s.]/g, '').trim(); // keep original-ish if too short
        if (digits.length === 10) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        }
        return digits;
    },

    _phoneDigits(raw) {
        let digits = String(raw || '').replace(/\D/g, '');
        if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
        return digits;
    },

    _looksLikePhoneValue(raw) {
        if (raw == null || raw === '') return false;
        const s = String(raw).trim();
        // Never treat dates / money as phones (e.g. 6/14/2023 19:07 → digits look 11-long)
        if (/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(s)) return false;
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return false;
        if (/^\$?\d+(\.\d+)?$/.test(s) && !/e[+\-]?\d+/i.test(s) && s.replace(/\D/g, '').length < 10) return false;
        if (/e[+\-]?\d+/i.test(s) && Number.isFinite(Number(s))) return true;
        const digits = this._phoneDigits(s);
        return digits.length === 10 || digits.length === 11;
    },

    // Normalize imported visit dates (handles "6/14/2023 19:07", ISO, etc.) → YYYY-MM-DD
    _normalizeImportedDate(raw) {
        if (raw == null || raw === '') return null;
        const s = String(raw).trim();
        if (!s || s.toLowerCase() === 'never' || s === '-') return null;
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
        const d = new Date(s);
        if (isNaN(d.getTime())) return s;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    },

    _isPhoneHeader(h) {
        if (!h) return false;
        if (/(email|e_mail)/.test(h)) return false;
        return (
            h === 'phone' || h === 'tel' || h === 'telephone' || h === 'mobile' || h === 'cell' ||
            h === 'cellphone' || h === 'phone_number' || h === 'phonenumber' || h === 'ph' ||
            h.endsWith('_phone') || h.startsWith('phone_') ||
            h.includes('mobile') || h.includes('cell') ||
            (h.includes('phone') && !h.includes('extension') && !h.includes('ext'))
        );
    },

    importClientsFromCSV(csvData) {
        let text = String(csvData || '');
        // UTF-16 LE/BE BOM leftovers sometimes show as \0 between chars
        if (text.indexOf('\u0000') !== -1) {
            text = text.replace(/\u0000/g, '');
        }
        text = text.replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) return { imported: 0, skipped: 0, updated: 0, errors: ['CSV is empty'] };

        const delimiter = this._detectCsvDelimiter(lines[0]);
        const header = this._parseCsvLine(lines[0], delimiter).map(h => this._normCsvHeader(h));
        const idx = {};
        header.forEach((h, i) => { idx[h] = i; });

        // Prefer explicit phone headers; else sniff a column that looks like phones
        let phoneCol = header.findIndex(h => this._isPhoneHeader(h));
        if (phoneCol < 0) {
            const sampleCount = Math.min(lines.length - 1, 25);
            const scores = header.map(() => 0);
            for (let i = 1; i <= sampleCount; i++) {
                const cols = this._parseCsvLine(lines[i], delimiter);
                cols.forEach((v, j) => { if (this._looksLikePhoneValue(v)) scores[j] = (scores[j] || 0) + 1; });
            }
            let best = -1, bestScore = 0;
            scores.forEach((sc, j) => { if (sc > bestScore) { bestScore = sc; best = j; } });
            if (bestScore >= Math.max(1, Math.floor(sampleCount * 0.4))) phoneCol = best;
        }

        const col = (cols, ...keys) => {
            for (const k of keys) {
                if (idx[k] != null && cols[idx[k]] != null && String(cols[idx[k]]).trim() !== '') {
                    return String(cols[idx[k]]).trim();
                }
            }
            return '';
        };

        let imported = 0, skipped = 0, updated = 0;
        const errors = [];
        const existingByPhone = new Map();
        (this.data.clients || []).forEach(c => {
            const digits = this._phoneDigits(c.phone);
            if (digits) existingByPhone.set(digits, c);
        });

        const pending = [];
        let phonesFound = 0;

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            let cols;
            try { cols = this._parseCsvLine(lines[i], delimiter); }
            catch (e) { errors.push('Row ' + (i + 1) + ': parse error'); skipped++; continue; }

            let firstName = col(cols, 'first_name', 'firstname', 'first', 'client_first_name', 'fname');
            let lastName = col(cols, 'last_name', 'lastname', 'last', 'client_last_name', 'lname');
            const fullName = col(cols, 'name', 'client_name', 'full_name', 'client', 'customer', 'customer_name');
            if ((!firstName && !lastName) && fullName) {
                const parts = fullName.split(/\s+/);
                firstName = parts[0] || '';
                lastName = parts.slice(1).join(' ') || '';
            }

            let rawPhone = '';
            if (phoneCol >= 0 && cols[phoneCol] != null) rawPhone = String(cols[phoneCol]).trim();
            if (!rawPhone) {
                rawPhone = col(
                    cols,
                    'phone', 'phone_number', 'phonenumber', 'mobile', 'mobile_phone', 'cell', 'cell_phone',
                    'cellphone', 'telephone', 'tel', 'primary_phone', 'contact_phone', 'customer_phone',
                    'home_phone', 'work_phone', 'ph'
                );
            }
            // Last resort: any cell on the row that looks like a phone
            if (!rawPhone) {
                for (let j = 0; j < cols.length; j++) {
                    if (this._looksLikePhoneValue(cols[j])) { rawPhone = cols[j]; break; }
                }
            }

            const phone = this._normalizeImportedPhone(rawPhone);
            const phoneDigits = this._phoneDigits(phone);
            if (phoneDigits) phonesFound++;

            const email = col(cols, 'email', 'e_mail', 'email_address', 'mail');

            if (!firstName && !lastName && !phoneDigits) {
                skipped++;
                continue;
            }

            const payload = {
                firstName: firstName || 'Client',
                lastName: lastName || '',
                phone: phone,
                email: email,
                lastVisit: this._normalizeImportedDate(col(cols, 'last_visit', 'lastvisit', 'last_service_date', 'last_service', 'last_seen')),
                totalAmountByYear: parseFloat(col(cols, 'total_amount_by_year', 'amount_by_year').replace(/[^0-9.]/g, '')) || 0,
                totalAmount: parseFloat(col(cols, 'total_amount', 'total_spent', 'spent', 'revenue').replace(/[^0-9.]/g, '')) || 0,
                // CSV from Kimi export uses "Total Points"
                points: parseFloat(col(cols, 'points', 'total_points', 'loyalty_points', 'pts').replace(/[^0-9.]/g, '')) || 0,
                totalVisits: parseInt(col(cols, 'total_visit', 'total_visits', 'visits', 'visit_count').replace(/[^0-9]/g, ''), 10) || 0
            };

            if (phoneDigits && existingByPhone.has(phoneDigits)) {
                const existing = existingByPhone.get(phoneDigits);
                Object.assign(existing, payload, { updatedAt: new Date().toISOString() });
                updated++;
                continue;
            }

            pending.push(payload);
        }

        // Fast sequential IDs (Math.max(...spread) on 3k+ rows freezes the tab)
        let nextId = 0;
        (this.data.clients || []).forEach(c => {
            const id = Number(c && c.id) || 0;
            if (id > nextId) nextId = id;
        });

        this._skipBackupSnapshot = true;
        try {
            pending.forEach(p => {
                nextId += 1;
                const client = {
                    id: nextId,
                    createdAt: new Date().toISOString(),
                    points: 0,
                    totalVisits: 0,
                    totalAmount: 0,
                    totalAmountByYear: 0,
                    lastVisit: null,
                    lastStaff: null,
                    lastService: null,
                    ...p
                };
                this.data.clients.push(client);
                const digits = this._phoneDigits(client.phone);
                if (digits) existingByPhone.set(digits, client);
                imported++;
            });

            if (imported > 0 || updated > 0) {
                this.data.lastUpdated = new Date().toISOString();
                const saved = this.saveData();
                if (!saved) {
                    // localStorage may be full — still try server so import isn't lost
                    try { this.pushToServer(); } catch (e) { /* ignore */ }
                    errors.push('Saved in memory / server, but browser storage is full. Keep the staff app running so data syncs.');
                }
            }
        } finally {
            this._skipBackupSnapshot = false;
        }

        if (imported + updated > 0 && phonesFound === 0) {
            errors.push('Clients imported but no phone numbers were found in the file. Put phones in a Phone / Mobile column, or format as 10 digits (not Excel scientific notation).');
        }

        return { imported, updated, skipped, errors, phonesFound, headers: header };
    },
    
    // ===================== APPOINTMENT OPERATIONS =====================
    
    getAppointments(date, staffId) {
        let appts = this.data.appointments;
        if (date) {
            const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
            appts = appts.filter(a => a.date === dateStr);
        }
        if (staffId) {
            appts = appts.filter(a => a.staffId === staffId);
        }
        return appts.sort((a, b) => a.time.localeCompare(b.time));
    },
    
    getAppointment(id) {
        return this.data.appointments.find(a => a.id === id);
    },
    
    addAppointment(appointmentData) {
        const linked = this.ensureClientForAppointment(appointmentData || {});
        const liveIds = (this.data.appointments || []).map(a => Number(a && a.id)).filter(n => Number.isFinite(n));
        const archIds = (this.data.appointmentArchive || []).map(a => Number(a && a.id)).filter(n => Number.isFinite(n));
        const maxId = Math.max(0, ...(liveIds.length ? liveIds : [0]), ...(archIds.length ? archIds : [0]));
        const newId = maxId + 1;
        const appointment = {
            id: newId,
            status: 'booked',
            createdAt: new Date().toISOString(),
            ...linked,
            id: newId
        };
        this._capsPerson(appointment);
        this.data.appointments.push(appointment);
        this.saveData();
        try { this.flushPushToServer(); } catch (eFlush) { /* ignore */ }
        this.notifyManagers('booking', this.describeAppointment(appointment, '📅 New appointment booked'));
        // Also alert the staff member the client booked with
        if (appointment.staffId) {
            this.notifyStaffMember(appointment.staffId, 'booking', this.describeAppointment(appointment, '📅 New booking with you'));
        }
        return appointment;
    },
    
    updateAppointment(id, updates) {
        const idx = this.data.appointments.findIndex(a => a.id == id || String(a.id) === String(id));
        if (idx >= 0) {
            const before = this.data.appointments[idx];
            const merged = this.ensureClientForAppointment({ ...before, ...updates });
            this.data.appointments[idx] = this._capsPerson({ ...merged, updatedAt: new Date().toISOString() });
            this.saveData();
            try { this.flushPushToServer(); } catch (eFlush) { /* ignore */ }
            // Alert managers the moment an appointment gets cancelled
            if (updates.status === 'cancelled' && before.status !== 'cancelled') {
                this.notifyManagers('cancellation', this.describeAppointment(this.data.appointments[idx], '❌ Appointment cancelled'));
                // Also alert the staff member who lost the booking
                if (before.staffId) {
                    this.notifyStaffMember(before.staffId, 'cancellation', this.describeAppointment(this.data.appointments[idx], '❌ A booking with you was cancelled'));
                }
            }
            return this.data.appointments[idx];
        }
        return null;
    },

    // Build a human-readable appointment description for notifications
    describeAppointment(appt, prefix) {
        const client = appt.clientId ? this.data.clients.find(c => c.id === appt.clientId) : null;
        const clientName = client ? `${client.firstName || ''} ${client.lastName || ''}`.trim() : (appt.clientName || 'A client');
        const staff = appt.staffId ? this.data.staff.find(s => s.id === appt.staffId) : null;
        const service = this.data.services.find(s => s.id === appt.serviceId);
        const timeLabel = this.formatTime12(appt.time);
        return `${prefix}: ${clientName} — ${(service && service.name) || 'Service'} on ${appt.date} at ${timeLabel}${staff ? ' with ' + staff.name : ''}`;
    },

    // Always 12-hour for SMS / UI copy (stores still use HH:MM internally)
    formatTime12(t) {
        if (t == null || t === '') return '';
        if (typeof Utils !== 'undefined' && Utils && typeof Utils.formatTime12 === 'function') {
            try { return Utils.formatTime12(t); } catch (e) { /* fall through */ }
        }
        const raw = String(t).trim();
        if (/\b(am|pm)\b/i.test(raw)) return raw.replace(/\s*(am|pm)\b/i, (_, ap) => ' ' + ap.toUpperCase());
        if (/[T-]/.test(raw) && raw.length > 8) {
            const d = new Date(raw);
            if (!isNaN(d.getTime())) {
                const h = d.getHours();
                return (h % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + (h >= 12 ? 'PM' : 'AM');
            }
        }
        const parts = raw.split(':');
        let h = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        if (isNaN(h)) return raw;
        if (isNaN(m)) m = 0;
        const ap = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        if (h === 0) h = 12;
        return h + ':' + String(m).padStart(2, '0') + ' ' + ap;
    },

    // Push a notification to the shared "managers" channel
    notifyManagers(type, message, timestamp) {
        this.pushNotification('managers', type, message, timestamp);
    },

    // Push a notification to one staff member's personal channel
    notifyStaffMember(staffId, type, message, timestamp) {
        this.pushNotification(staffId, type, message, timestamp);
    },

    pushNotification(channel, type, message, timestamp) {
        this.data.notifications.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            staffId: channel,
            type,
            message,
            timestamp: timestamp || new Date().toISOString(),
            read: false
        });
        if (this.data.notifications.length > 500) {
            this.data.notifications = this.data.notifications.slice(-500);
        }
        this.saveData();
    },
    
    deleteAppointment(id, deletedBy = 'unknown') {
        // Loose id match — board/localStorage may pass string or number
        const appt = this.data.appointments.find(a => a.id == id || String(a.id) === String(id));
        if (appt) {
            if (!Array.isArray(this.data.appointmentArchive)) this.data.appointmentArchive = [];
            // Keep a full permanent record of the deleted appointment
            this.data.appointmentArchive.push({
                ...appt,
                archivedAt: new Date().toISOString(),
                deletedBy: deletedBy
            });
            this.data.appointments = this.data.appointments.filter(a => a !== appt && a.id != id);
            this.logAudit('appointment_deleted', `Appointment #${appt.id} (${appt.date} ${appt.time}) deleted by ${deletedBy}. Record archived.`);
            this.saveData();
            // Push immediately so a sibling pull cannot resurrect before debounce
            try { this.flushPushToServer(); } catch (e) { /* ignore */ }
            return true;
        }
        return false;
    },
    
    // ===================== SERVICE OPERATIONS =====================
    
    getServices(category) {
        let list = this.data.services || [];
        // Keep category labels consistent across every page (Pedicures → Pedicure, etc.)
        if (typeof Utils !== 'undefined' && Utils.normalizeCategory) {
            list.forEach(s => {
                const n = Utils.normalizeCategory(s.category);
                if (n !== s.category) s.category = n;
            });
        }
        if (typeof Utils !== 'undefined' && Utils.uniqueServices) {
            list = Utils.uniqueServices(list);
        }
        if (category) {
            const want = (typeof Utils !== 'undefined' && Utils.normalizeCategory)
                ? Utils.normalizeCategory(category) : category;
            return list.filter(s => s.category === want);
        }
        return list;
    },
    
    addService(serviceData) {
        const existingList = this.data.services || [];
        if (typeof Utils !== 'undefined' && Utils.findMatchingService) {
            const existing = Utils.findMatchingService(existingList, serviceData || {});
            if (existing) return existing;
        }
        const newId = Math.max(...existingList.map(s => s.id), 0) + 1;
        const service = { id: newId, ...serviceData };
        if (typeof Utils !== 'undefined' && Utils.normalizeCategory) {
            service.category = Utils.normalizeCategory(service.category);
        }
        this.data.services.push(service);
        // If this id was previously deleted, allow it again
        const removed = Array.isArray(this.settings.removedServiceIds) ? this.settings.removedServiceIds : [];
        if (removed.includes(newId)) {
            this.settings.removedServiceIds = removed.filter(x => x !== newId);
            this.saveSettings();
        }
        this.saveData();
        return service;
    },
    
    updateService(id, updates) {
        const idx = this.data.services.findIndex(s => s.id === id);
        if (idx >= 0) {
            const next = { ...this.data.services[idx], ...updates };
            if (next.category != null && typeof Utils !== 'undefined' && Utils.normalizeCategory) {
                next.category = Utils.normalizeCategory(next.category);
            }
            this.data.services[idx] = next;
            this.saveData();
            return this.data.services[idx];
        }
        return null;
    },
    
    deleteService(id) {
        const nid = Number(id);
        const before = (this.data.services || []).length;
        this.data.services = (this.data.services || []).filter(s => Number(s.id) !== nid);
        if (this.data.services.length === before) return false;
        // Tombstone so menu healers never resurrect factory stock rows the shop deleted
        if (!Array.isArray(this.settings.removedServiceIds)) this.settings.removedServiceIds = [];
        if (!this.settings.removedServiceIds.includes(nid)) {
            this.settings.removedServiceIds.push(nid);
            this.saveSettings();
        }
        this.saveData();
        return true;
    },

    /** Live menu categories (built-in order + custom + any present on services). */
    getServiceCategories() {
        const services = this.getServices();
        if (typeof Utils !== 'undefined' && Utils.serviceCategories) {
            const live = Utils.serviceCategories(services);
            const custom = Array.isArray(this.settings.customServiceCategories)
                ? this.settings.customServiceCategories : [];
            const seen = new Set(live);
            custom.forEach(c => {
                const n = Utils.normalizeCategory ? Utils.normalizeCategory(c) : String(c || '').trim();
                if (n && !seen.has(n) && n !== 'Add-ons' && n !== 'Combos') {
                    seen.add(n);
                    live.push(n);
                }
            });
            return live;
        }
        return [...new Set((services || []).map(s => s.category).filter(Boolean))];
    },

    addServiceCategory(name) {
        const n = (typeof Utils !== 'undefined' && Utils.normalizeCategory) ? Utils.normalizeCategory(name) : String(name || '').trim();
        if (!n) return null;
        const list = Array.isArray(this.settings.customServiceCategories)
            ? this.settings.customServiceCategories.slice() : [];
        if (!list.map(c => String(c).toLowerCase()).includes(n.toLowerCase())) {
            list.push(n);
            this.updateSettings({ customServiceCategories: list });
        }
        return n;
    },

    renameServiceCategory(fromName, toName) {
        const from = (typeof Utils !== 'undefined' && Utils.normalizeCategory) ? Utils.normalizeCategory(fromName) : String(fromName || '').trim();
        const to = (typeof Utils !== 'undefined' && Utils.normalizeCategory) ? Utils.normalizeCategory(toName) : String(toName || '').trim();
        if (!from || !to || from === to) return 0;
        let n = 0;
        (this.data.services || []).forEach(s => {
            const cat = (typeof Utils !== 'undefined' && Utils.normalizeCategory)
                ? Utils.normalizeCategory(s.category) : s.category;
            if (cat === from) {
                s.category = to;
                n++;
            }
        });
        const custom = Array.isArray(this.settings.customServiceCategories)
            ? this.settings.customServiceCategories.map(c => {
                const nc = (typeof Utils !== 'undefined' && Utils.normalizeCategory)
                    ? Utils.normalizeCategory(c) : c;
                return nc === from ? to : c;
            }) : [];
        if (!custom.map(c => String(c).toLowerCase()).includes(to.toLowerCase())) custom.push(to);
        this.updateSettings({ customServiceCategories: [...new Set(custom.filter(Boolean))] });
        if (n) this.saveData();
        return n;
    },

    deleteServiceCategory(name) {
        const cat = (typeof Utils !== 'undefined' && Utils.normalizeCategory) ? Utils.normalizeCategory(name) : String(name || '').trim();
        if (!cat) return 0;
        const inCat = (this.data.services || []).filter(s => {
            const c = (typeof Utils !== 'undefined' && Utils.normalizeCategory)
                ? Utils.normalizeCategory(s.category) : s.category;
            return c === cat;
        });
        inCat.forEach(s => this.deleteService(s.id));
        const custom = Array.isArray(this.settings.customServiceCategories)
            ? this.settings.customServiceCategories.filter(c => {
                const nc = (typeof Utils !== 'undefined' && Utils.normalizeCategory)
                    ? Utils.normalizeCategory(c) : c;
                return nc !== cat;
            }) : [];
        this.updateSettings({ customServiceCategories: custom });
        return inCat.length;
    },
    
    // ===================== INVENTORY OPERATIONS =====================
    
    getInventory() {
        return this.data.inventory;
    },
    
    updateInventory(id, updates) {
        const idx = this.data.inventory.findIndex(i => i.id === id);
        if (idx >= 0) {
            this.data.inventory[idx] = { ...this.data.inventory[idx], ...updates };
            this.saveData();
            return this.data.inventory[idx];
        }
        return null;
    },
    
    // ===================== SHIFT & DUTY STATUS OPERATIONS =====================

    getShifts(staffId) {
        if (staffId) return this.data.shifts.filter(s => s.staffId === staffId);
        return this.data.shifts;
    },

    addShift(shiftData) {
        const newId = Math.max(0, ...this.data.shifts.map(s => s.id)) + 1;
        const shift = { id: newId, createdAt: new Date().toISOString(), ...shiftData };
        this.data.shifts.push(shift);
        this.saveData();
        return shift;
    },

    deleteShift(id) {
        this.data.shifts = this.data.shifts.filter(s => s.id !== id);
        this.saveData();
        return true;
    },

    // Mark a staff member late / sick / vacation / called-off for a specific date
    setDayStatus(staffId, date, status, note = '', markedBy = 'manager') {
        if (!this.data.dayStatuses) this.data.dayStatuses = {};
        if (!this.data.dayStatuses[date]) this.data.dayStatuses[date] = {};
        if (!status) {
            delete this.data.dayStatuses[date][staffId];
        } else {
            this.data.dayStatuses[date][staffId] = {
                status, note, markedBy, markedAt: new Date().toISOString()
            };
        }
        this.logAudit('day_status', `Staff #${staffId} marked "${status || 'cleared'}" for ${date} by ${markedBy}.`);
        this.saveData();
    },

    getDayStatuses(date) {
        return (this.data.dayStatuses && this.data.dayStatuses[date]) || {};
    },

    // ===================== LEAVE / TIME-OFF REQUESTS =====================
    // Staff submit these on the Staff page; Manager/Admin approve or deny them
    // on the Manager page. Full-day approvals mark the duty board. Quick
    // step-outs (30 / 60 / 120 min) only block that window on the Scheduler.

    isPartialLeave(req) {
        if (!req) return false;
        const mins = Number(req.durationMinutes);
        if (req.scope === 'partial' || req.kind === 'step-out') return true;
        return Number.isFinite(mins) && mins > 0 && mins < 24 * 60;
    },

    addMinutesToTime(time, minutes) {
        const parts = String(time || '12:00').split(':');
        let h = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        if (isNaN(h)) h = 12;
        if (isNaN(m)) m = 0;
        const total = ((h * 60 + m + (Number(minutes) || 0)) % (24 * 60) + (24 * 60)) % (24 * 60);
        return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
    },

    leaveDurationLabel(req) {
        const mins = Number(req && req.durationMinutes);
        if (!mins) return '';
        if (mins === 30) return '30 min';
        if (mins === 60) return '1 hour';
        if (mins === 120) return '2 hours';
        if (mins % 60 === 0) return (mins / 60) + ' hours';
        return mins + ' min';
    },

    formatLeaveTimeRange(req) {
        if (!this.isPartialLeave(req) || !req.startTime) return '';
        const end = req.endTime || this.addMinutesToTime(req.startTime, req.durationMinutes || 30);
        return this.formatTime12(req.startTime) + '–' + this.formatTime12(end);
    },

    formatLeaveWindow(req) {
        if (!req) return '';
        const dateLabel = (typeof Utils !== 'undefined' && Utils.formatDate)
            ? Utils.formatDate(req.startDate)
            : (req.startDate || '');
        if (this.isPartialLeave(req) && req.startTime) {
            const dur = this.leaveDurationLabel(req);
            return dateLabel + ' · ' + this.formatLeaveTimeRange(req) + (dur ? ' (' + dur + ')' : '');
        }
        if (req.endDate && req.endDate !== req.startDate) {
            const endLabel = (typeof Utils !== 'undefined' && Utils.formatDate)
                ? Utils.formatDate(req.endDate)
                : req.endDate;
            return dateLabel + ' → ' + endLabel;
        }
        return dateLabel;
    },

    getLeaveRequests(staffId) {
        const reqs = this.data.leaveRequests || [];
        if (staffId) return reqs.filter(r => r.staffId === staffId);
        return reqs;
    },

    addLeaveRequest(reqData) {
        if (!this.data.leaveRequests) this.data.leaveRequests = [];
        const newId = Math.max(0, ...this.data.leaveRequests.map(r => r.id || 0)) + 1;
        const req = {
            id: newId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            ...reqData
        };
        if (this.isPartialLeave(req) && req.startTime) {
            req.scope = 'partial';
            req.endDate = req.startDate;
            req.endTime = req.endTime || this.addMinutesToTime(req.startTime, req.durationMinutes || 30);
        } else {
            req.scope = req.scope || 'full';
        }
        const when = this.formatLeaveWindow(req) || (req.startDate + ' → ' + (req.endDate || req.startDate));
        this.data.leaveRequests.push(req);
        this.logAudit('leave_requested', `Time-off request #${newId} (${req.type || 'time off'}, ${when}) submitted by ${req.staffName || 'staff #' + req.staffId}.`);
        this.saveData();
        return req;
    },

    updateLeaveRequest(id, updates) {
        const req = (this.data.leaveRequests || []).find(r => r.id === id);
        if (!req) return null;
        Object.assign(req, updates, { updatedAt: new Date().toISOString() });
        this.saveData();
        return req;
    },

    // Silent calendar block for an approved step-out (no "new booking" alerts).
    ensureLeaveBlockAppointment(req) {
        if (!req || !req.startDate || !req.startTime) return null;
        if (!this.data.appointments) this.data.appointments = [];
        const mins = Number(req.durationMinutes) || 30;
        const endTime = req.endTime || this.addMinutesToTime(req.startTime, mins);
        const window = this.formatTime12(req.startTime) + '–' + this.formatTime12(endTime);
        const label = 'Step-out ' + window;
        const existing = this.data.appointments.find(a =>
            a && a.leaveRequestId === req.id && (a.status === 'blocked' || a.isBlock));
        if (existing) {
            existing.date = req.startDate;
            existing.time = req.startTime;
            existing.duration = mins;
            existing.clientName = label;
            existing.notes = req.reason || label;
            existing.services = [{ name: label, price: 0, duration: mins }];
            req.blockAppointmentId = existing.id;
            return existing;
        }
        const liveIds = (this.data.appointments || []).map(a => Number(a && a.id)).filter(n => Number.isFinite(n));
        const archIds = (this.data.appointmentArchive || []).map(a => Number(a && a.id)).filter(n => Number.isFinite(n));
        const newId = Math.max(0, ...(liveIds.length ? liveIds : [0]), ...(archIds.length ? archIds : [0])) + 1;
        const appt = {
            id: newId,
            staffId: req.staffId,
            clientId: null,
            clientName: label,
            date: req.startDate,
            time: req.startTime,
            duration: mins,
            price: 0,
            services: [{ name: label, price: 0, duration: mins }],
            status: 'blocked',
            isBlock: true,
            source: 'leave',
            leaveRequestId: req.id,
            notes: req.reason || label,
            createdAt: new Date().toISOString()
        };
        this.data.appointments.push(appt);
        req.blockAppointmentId = newId;
        return appt;
    },

    // Approve a request. Full-day leave marks the duty board. Quick step-outs
    // only block that time on the Scheduler so the tech can come back.
    approveLeaveRequest(id, approver = 'manager') {
        const req = (this.data.leaveRequests || []).find(r => r.id === id);
        if (!req) return null;
        req.status = 'approved';
        req.reviewedBy = approver;
        req.reviewedAt = new Date().toISOString();

        if (this.isPartialLeave(req)) {
            if (req.startTime) {
                req.endDate = req.startDate;
                req.endTime = req.endTime || this.addMinutesToTime(req.startTime, req.durationMinutes || 30);
                this.ensureLeaveBlockAppointment(req);
            }
            this.logAudit('leave_approved', `Step-out #${id} for ${req.staffName || 'staff #' + req.staffId} (${this.formatLeaveWindow(req)}) approved by ${approver}.`);
            this.saveData();
            return req;
        }

        // Mark the duty board for every day covered by the request
        const statusMap = { vacation: 'vacation', sick: 'sick', emergency: 'called-off', personal: 'vacation' };
        const dayStatus = statusMap[(req.type || '').toLowerCase()] || 'vacation';
        const start = new Date(req.startDate + 'T00:00:00');
        const end = new Date((req.endDate || req.startDate) + 'T00:00:00');
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (!this.data.dayStatuses) this.data.dayStatuses = {};
            if (!this.data.dayStatuses[dateStr]) this.data.dayStatuses[dateStr] = {};
            this.data.dayStatuses[dateStr][req.staffId] = {
                status: dayStatus,
                note: req.reason || req.type || 'Time off',
                markedBy: approver,
                markedAt: new Date().toISOString()
            };
        }
        this.logAudit('leave_approved', `Time-off request #${id} for ${req.staffName || 'staff #' + req.staffId} (${req.startDate} → ${req.endDate || req.startDate}) approved by ${approver}.`);
        this.saveData();
        return req;
    },

    denyLeaveRequest(id, approver = 'manager') {
        const req = (this.data.leaveRequests || []).find(r => r.id === id);
        if (!req) return null;
        req.status = 'denied';
        req.reviewedBy = approver;
        req.reviewedAt = new Date().toISOString();
        this.logAudit('leave_denied', `Time-off request #${id} for ${req.staffName || 'staff #' + req.staffId} denied by ${approver}.`);
        this.saveData();
        return req;
    },

    // ===================== POS TICKETS =====================
    // Shared ticket records. The Scheduler pushes every checkout here so the
    // Staff page closeout, Manager reports, and Admin records all match.

    getPosTickets(date, staffId) {
        let tickets = this.data.posTickets || [];
        if (date) {
            const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
            tickets = tickets.filter(t => t.date === dateStr);
        }
        if (staffId) tickets = tickets.filter(t => t.staffId === staffId);
        return tickets;
    },

    addPosTicket(ticketData) {
        if (!this.data.posTickets) this.data.posTickets = [];
        const newId = Math.max(0, ...this.data.posTickets.map(t => t.id || 0)) + 1;
        const ticket = {
            id: newId,
            createdAt: new Date().toISOString(),
            ...ticketData
        };
        this.data.posTickets.push(ticket);
        this.saveData();
        return ticket;
    },

    updatePosTicket(id, updates) {
        const idx = (this.data.posTickets || []).findIndex(t => t.id === id);
        if (idx >= 0) {
            this.data.posTickets[idx] = { ...this.data.posTickets[idx], ...updates, updatedAt: new Date().toISOString() };
            this.saveData();
            return this.data.posTickets[idx];
        }
        return null;
    },

    deletePosTicket(id) {
        this.data.posTickets = (this.data.posTickets || []).filter(t => t.id !== id);
        this.saveData();
        return true;
    },

    // ===================== STAFF END-OF-DAY CLOSEOUT =====================
    // A staff member cannot clock out until their counted tickets, service
    // totals, and tips match the system's expected numbers — or a
    // manager/admin overrides with their PIN. Every closeout (matched or
    // overridden) is stored permanently in closeouts and the audit log.

    // What the system expects a staff member to close out with for a date:
    // completed appointments (ticket count + service dollars) plus tips from
    // shared POS tickets assigned to them that day.
    getStaffExpectedCloseout(staffId, date) {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        const myAppts = (this.data.appointments || []).filter(a => a.staffId === staffId && a.date === dateStr);
        const completed = myAppts.filter(a => a.status === 'complete');
        const myTickets = this.getPosTickets(dateStr, staffId);
        const tips = myTickets.reduce((sum, t) => sum + (t.tip || 0), 0);
        const servicesTotal = completed.reduce((sum, a) => sum + (a.price || 0), 0);
        const staff = this.getStaff(staffId);
        const rate = ((staff && staff.commission) || 0) / 100;
        return {
            date: dateStr,
            staffId,
            staffName: staff ? staff.name : '',
            commissionRate: staff ? (staff.commission || 0) : 0,
            ticketCount: completed.length,
            servicesTotal: Math.round(servicesTotal * 100) / 100,
            tipsTotal: Math.round(tips * 100) / 100,
            posTicketCount: myTickets.length,
            commissionEarned: Math.round(servicesTotal * rate * 100) / 100,
            appointments: myAppts.length,
            cancelled: myAppts.filter(a => a.status === 'cancelled').length
        };
    },

    getStaffCloseouts(staffId) {
        return (this.data.closeouts || [])
            .filter(c => c.kind === 'staff' && (!staffId || c.staffId === staffId))
            .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    },

    addStaffCloseout(closeoutData) {
        const newId = Math.max(0, ...this.data.closeouts.map(c => c.id || 0)) + 1;
        const closeout = {
            id: newId,
            kind: 'staff',
            createdAt: new Date().toISOString(),
            status: closeoutData.override ? 'overridden' : 'matched',
            ...closeoutData
        };
        this.data.closeouts.push(closeout);
        const who = closeout.staffName || 'staff #' + closeout.staffId;
        if (closeout.override) {
            var exp = closeout.expected || {};
            var act = closeout.actual || {};
            var expTickets = (exp.ticketCount != null) ? exp.ticketCount : '?';
            var actTickets = (act.ticketCount != null) ? act.ticketCount : '?';
            this.logAudit('staff_closeout_override', `Closeout OVERRIDE for ${who} on ${closeout.date} approved by ${closeout.override.by}. Expected ${expTickets} tickets / $${(exp.servicesTotal || 0).toFixed(2)} / $${(exp.tipsTotal || 0).toFixed(2)} tips — counted ${actTickets} / $${(act.servicesTotal || 0).toFixed(2)} / $${(act.tipsTotal || 0).toFixed(2)}. Reason: ${closeout.override.reason || 'none given'}`);
        } else {
            var expOk = closeout.expected || {};
            this.logAudit('staff_closeout', `Closeout for ${who} on ${closeout.date} matched: ${(expOk.ticketCount != null ? expOk.ticketCount : 0)} tickets, $${(expOk.servicesTotal || 0).toFixed(2)} services, $${(expOk.tipsTotal || 0).toFixed(2)} tips.`);
        }
        this.saveData();
        return closeout;
    },

    // ===================== SETTINGS OPERATIONS =====================
    
    getSettings() {
        return this.settings;
    },

    // Reminder settings with defaults filled in (safe for older saved data)
    getReminderSettings() {
        return { ...DEFAULT_SETTINGS.reminders, ...(this.settings.reminders || {}) };
    },

    updateReminderSettings(updates) {
        this.settings.reminders = { ...this.getReminderSettings(), ...updates };
        this.saveSettings();
        return this.settings.reminders;
    },

    _apptStartMs(appt) {
        if (!appt || !appt.date || !appt.time) return null;
        const t = String(appt.time).trim();
        let hh = 0, mm = 0;
        const m24 = t.match(/^(\d{1,2}):(\d{2})$/);
        const m12 = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (m24) { hh = +m24[1]; mm = +m24[2]; }
        else if (m12) {
            hh = +m12[1] % 12;
            if (/pm/i.test(m12[3])) hh += 12;
            mm = +m12[2];
        } else return null;
        const d = new Date(`${appt.date}T00:00:00`);
        if (isNaN(d.getTime())) return null;
        d.setHours(hh, mm, 0, 0);
        return d.getTime();
    },

    _ensureConfirmToken(appt) {
        if (appt.confirmToken) return appt.confirmToken;
        const token = 'c' + appt.id + '_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        appt.confirmToken = token;
        return token;
    },

    /**
     * Auto client reminders: 3 days, 24 hours, and 2-hour confirm request.
     * Queues SMS-ready messages + staff notifications. Safe to call often (idempotent flags).
     */
    processAppointmentReminders(opts = {}) {
        const cfg = this.getReminderSettings();
        if (cfg.clientSmsEnabled === false) return { sent: 0, queued: [] };
        const now = Date.now();
        const publicBase = (opts.publicBaseUrl || '').replace(/\/$/, '');
        if (!this.data.reminderOutbox) this.data.reminderOutbox = [];
        const queued = [];
        const active = (this.data.appointments || []).filter(a =>
            a && a.status !== 'cancelled' && a.status !== 'complete' && a.status !== 'noshow' && a.status !== 'no-show'
        );

        const pushOutbox = (appt, kind, body, needsConfirm) => {
            const client = this.getClient(appt.clientId);
            const phone = (client && client.phone) || appt.clientPhone || '';
            let confirmUrl = '';
            if (needsConfirm) {
                const token = this._ensureConfirmToken(appt);
                confirmUrl = publicBase
                    ? `${publicBase}/confirm.html?token=${encodeURIComponent(token)}`
                    : `confirm-appointment.html?token=${encodeURIComponent(token)}`;
                body += `\n\nConfirm you're coming: ${confirmUrl}`;
            }
            const item = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                appointmentId: appt.id,
                kind,
                phone,
                clientName: appt.clientName || (client ? `${client.firstName} ${client.lastName}` : 'Client'),
                body,
                confirmUrl,
                createdAt: new Date().toISOString(),
                status: 'queued'
            };
            this.data.reminderOutbox.push(item);
            queued.push(item);
            this.notifyManagers(
                'booking',
                `⏰ ${kind} reminder queued for ${item.clientName} (${appt.date} ${appt.time || ''})`
            );
        };

        active.forEach(appt => {
            const startMs = this._apptStartMs(appt);
            if (!startMs || startMs <= now) return;
            const hoursUntil = (startMs - now) / 3600000;
            appt.reminders = appt.reminders || {};

            // Catch-up friendly windows (if staff opens scheduler late, still queue missed reminders once)
            if (cfg.remind3Days !== false && !appt.reminders.d3 && hoursUntil <= 72 && hoursUntil > 24) {
                appt.reminders.d3 = true;
                appt.reminders.d3At = new Date().toISOString();
                pushOutbox(appt, '3-day',
                    `Hi ${appt.clientName || 'there'}! Reminder: your appointment at Urban Nail Bar is in about 3 days (${appt.date} at ${this.formatTime12(appt.time)}). Reply if you need to reschedule.`,
                    false);
            }
            if (cfg.remind24Hours !== false && !appt.reminders.h24 && hoursUntil <= 24 && hoursUntil > 2) {
                appt.reminders.h24 = true;
                appt.reminders.h24At = new Date().toISOString();
                pushOutbox(appt, '24-hour',
                    `Hi ${appt.clientName || 'there'}! Reminder: your Urban Nail Bar appointment is in about 24 hours (${appt.date} at ${this.formatTime12(appt.time)}). See you soon!`,
                    false);
            }
            if (cfg.remind2HoursConfirm !== false && !appt.reminders.h2 && hoursUntil <= 2 && hoursUntil > 0.25) {
                appt.reminders.h2 = true;
                appt.reminders.h2At = new Date().toISOString();
                pushOutbox(appt, '2-hour-confirm',
                    `Hi ${appt.clientName || 'there'}! Your Urban Nail Bar appointment is in about 2 hours (${this.formatTime12(appt.time)}). Please confirm you are still coming:`,
                    true);
            }
        });

        if (this.data.reminderOutbox.length > 300) {
            this.data.reminderOutbox = this.data.reminderOutbox.slice(-300);
        }
        if (queued.length) this.saveData();
        return { sent: queued.length, queued };
    },
    
    updateSettings(updates) {
        updates = updates || {};
        const pinUpdates = {};
        if (updates.adminPin != null && String(updates.adminPin).trim() !== '') pinUpdates.adminPin = updates.adminPin;
        if (updates.managerPin != null && String(updates.managerPin).trim() !== '') pinUpdates.managerPin = updates.managerPin;
        const rest = Object.assign({}, updates);
        delete rest.adminPin;
        delete rest.managerPin;
        this.settings = { ...this.settings, ...rest };
        // Salon displays are always 12-hour
        this.settings.timeFormat = '12';
        this.settings.set24Hour = false;
        if (pinUpdates.adminPin || pinUpdates.managerPin) {
            this.changeMasterPins(pinUpdates);
        } else {
            this.saveSettings();
        }
        return this.settings;
    },
    
    // ===================== ANALYTICS =====================
    
    getTodayStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = this.data.appointments.filter(a => a.date === today);
        return {
            total: todayAppts.length,
            completed: todayAppts.filter(a => a.status === 'complete').length,
            pending: todayAppts.filter(a => a.status === 'booked').length,
            cancelled: todayAppts.filter(a => a.status === 'cancelled').length,
            revenue: todayAppts.filter(a => a.status === 'complete').reduce((sum, a) => sum + (a.price || 0), 0)
        };
    },
    
    getRevenueStats(startDate, endDate) {
        const appts = this.data.appointments.filter(a => {
            return a.date >= startDate && a.date <= endDate && a.status === 'complete';
        });
        return {
            totalRevenue: appts.reduce((sum, a) => sum + (a.price || 0), 0),
            totalAppointments: appts.length,
            averageTicket: appts.length > 0 ? appts.reduce((sum, a) => sum + (a.price || 0), 0) / appts.length : 0
        };
    },
    
    // ===================== CLOSEOUT RECORDS =====================
    // Manager closes out at end of day on the Manager page; the record syncs
    // straight to the Admin page and is kept forever (day/week/month/year views).

    // Exact per-staff dollar shares of one appointment — the single source of
    // truth used by closeouts, payroll, and tax summaries so the Admin page
    // always shows the same split numbers as the Manager page.
    // Priority: per-service staff tags > splits array > primary staffId.
    _apptStaffShares(a) {
        const svcWithStaff = (a.services || []).filter(s => s.staffId || s.staffName);
        if (svcWithStaff.length > 0) {
            const groups = {};
            svcWithStaff.forEach(s => {
                const key = s.staffId ? 'id_' + s.staffId : 'name_' + s.staffName;
                if (!groups[key]) groups[key] = { staffId: s.staffId || null, name: s.staffName || '', amount: 0, svcCount: 0 };
                groups[key].amount += s.price || 0;
                groups[key].svcCount++;
            });
            // Services with no staff tag go to the appointment's primary staff
            const untagged = (a.services || []).filter(s => !s.staffId && !s.staffName);
            if (untagged.length > 0) {
                const key = a.staffId ? 'id_' + a.staffId : 'name_unassigned';
                if (!groups[key]) groups[key] = { staffId: a.staffId || null, name: '', amount: 0, svcCount: 0 };
                untagged.forEach(s => { groups[key].amount += s.price || 0; groups[key].svcCount++; });
            }
            return Object.values(groups);
        }
        if (Array.isArray(a.splits) && a.splits.length > 0) {
            return a.splits.map(sp => ({ staffId: sp.staffId || null, name: sp.staffName || '', amount: sp.amount || 0, svcCount: 1 }));
        }
        return [{ staffId: a.staffId || null, name: '', amount: a.price || 0, svcCount: 1 }];
    },

    // ===================== TIME CLOCK / HOURLY PAY / OVERTIME =====================

    // Total hours worked by a staff member within a date range, from the
    // shared time clock (pairs of in/out entries; an open "in" counts to now)
    getHoursWorked(staffId, startDate, endDate) {
        const entries = this.data.timeClock
            .filter(t => t.staffId === staffId && t.date >= startDate && t.date <= endDate)
            .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
        let hours = 0;
        let lastIn = null;
        entries.forEach(e => {
            if (e.type === 'in') {
                lastIn = e.timestamp;
            } else if (e.type === 'out' && lastIn) {
                hours += (new Date(e.timestamp) - new Date(lastIn)) / 3600000;
                lastIn = null;
            }
        });
        // Still clocked in right now — count the time up to this moment
        if (lastIn) {
            hours += (Date.now() - new Date(lastIn)) / 3600000;
        }
        return Math.round(hours * 100) / 100;
    },

    // Hours worked grouped by calendar week (Sunday start) — the basis for
    // weekly overtime calculations
    getHoursWorkedWeekly(staffId, startDate, endDate) {
        const entries = this.data.timeClock
            .filter(t => t.staffId === staffId && t.date >= startDate && t.date <= endDate)
            .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));

        const weekKey = (ts) => {
            const d = new Date(ts);
            d.setDate(d.getDate() - d.getDay()); // Sunday
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        const weeks = {};
        let lastIn = null;
        const addHours = (ts, hrs) => {
            const key = weekKey(ts);
            weeks[key] = (weeks[key] || 0) + hrs;
        };
        entries.forEach(e => {
            if (e.type === 'in') {
                lastIn = e.timestamp;
            } else if (e.type === 'out' && lastIn) {
                addHours(lastIn, (new Date(e.timestamp) - new Date(lastIn)) / 3600000);
                lastIn = null;
            }
        });
        if (lastIn) {
            addHours(lastIn, (Date.now() - new Date(lastIn)) / 3600000);
        }

        return Object.keys(weeks).sort().map(k => ({
            weekStart: k,
            hours: Math.round(weeks[k] * 100) / 100
        }));
    },

    // Hourly pay for a date range WITH overtime rules applied per week.
    // When overtime is enabled, hours past the weekly threshold earn
    // rate × multiplier; admin can toggle the whole thing on or off.
    computeHourlyPay(staff, startDate, endDate) {        const rate = staff.hourlyRate || 0;
        const weeks = this.getHoursWorkedWeekly(staff.id, startDate, endDate);
        const totalHours = Math.round(weeks.reduce((s, w) => s + w.hours, 0) * 100) / 100;

        const otEnabled = this.settings.overtimeEnabled !== false && staff.overtimeEligible === true; // global toggle AND per-staff eligibility required
        const threshold = this.settings.overtimeThreshold || 40;
        const multiplier = this.settings.overtimeMultiplier || 1.5;

        let regular = 0, overtime = 0;
        weeks.forEach(w => {
            if (otEnabled) {
                regular += Math.min(w.hours, threshold);
                overtime += Math.max(0, w.hours - threshold);
            } else {
                regular += w.hours;
            }
        });
        regular = Math.round(regular * 100) / 100;
        overtime = Math.round(overtime * 100) / 100;

        return {
            hours: totalHours,
            regularHours: regular,
            overtimeHours: overtime,
            hourlyRate: rate,
            overtimeRate: Math.round(rate * multiplier * 100) / 100,
            overtimeEnabled: otEnabled,
            estimatedPay: Math.round((regular * rate + overtime * rate * multiplier) * 100) / 100
        };
    },

    // Salary pay (nail techs): guaranteed weekly base salary. When completed
    // sales pass the base, the overage is split — staff gets salarySplit%
    // (default 60), the owner keeps the rest. Base is prorated by day for
    // any date range (weekly salary / 7 per day).
    // Example: $1000/wk salary, $1100 sales → staff $1000 + 60% × $100 = $1060,
    //          owner keeps $40, everything totals $1100.
    computeSalaryPay(staff, grossSales, startDate, endDate) {
        const amount = staff.salaryAmount || 0;
        const split = ((staff.salarySplit != null) ? staff.salarySplit : 60) / 100;
        // Salary can be paid weekly (÷7 per day) or bi-weekly (÷14 per day)
        const periodDays = staff.salaryFrequency === 'biweekly' ? 14 : 7;
        const days = Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1);
        const base = Math.round(amount * (days / periodDays) * 100) / 100;
        const overage = Math.max(0, Math.round((grossSales - base) * 100) / 100);
        const commission = Math.round(overage * split * 100) / 100;
        return {
            payType: 'salary',
            salaryAmount: amount,
            salarySplit: (staff.salarySplit != null) ? staff.salarySplit : 60,
            salaryFrequency: staff.salaryFrequency || 'weekly',
            days,
            base,
            overage,
            commission,
            estimatedPay: Math.round((base + commission) * 100) / 100
        };
    },

    // Shared per-staff accumulator used by closeout + payroll breakdowns
    _staffBreakdownForRange(startDate, endDate) {
        const appts = this.data.appointments.filter(a => a.date >= startDate && a.date <= endDate);
        const byStaff = {};
        appts.forEach(a => {
            this._apptStaffShares(a).forEach(sh => {
                const key = sh.staffId ? 'id_' + sh.staffId : 'name_' + (sh.name || 'Unassigned');
                if (!byStaff[key]) {
                    const st = sh.staffId ? this.data.staff.find(s => s.id === sh.staffId) : null;
                    byStaff[key] = {
                        staffId: sh.staffId,
                        name: st ? st.name : (sh.name || 'Unassigned'),
                        role: st ? st.role : '-',
                        appointments: 0,
                        completed: 0,
                        cancelled: 0,
                        services: 0,
                        grossSales: 0,
                        commissionRate: st ? (st.commission || 0) : (this.settings.commission || 0)
                    };
                }
                const b = byStaff[key];
                b.appointments++;
                if (a.status === 'complete') {
                    b.completed++;
                    b.services += sh.svcCount;
                    b.grossSales += sh.amount;
                }
                if (a.status === 'cancelled') b.cancelled++;
            });
        });
        // Hourly staff get paid for time worked even on days with no appointments
        this.data.staff.filter(s => s.payType === 'hourly').forEach(st => {
            const key = 'id_' + st.id;
            if (!byStaff[key] && this.getHoursWorked(st.id, startDate, endDate) > 0) {
                byStaff[key] = {
                    staffId: st.id,
                    name: st.name,
                    role: st.role,
                    appointments: 0,
                    completed: 0,
                    cancelled: 0,
                    services: 0,
                    grossSales: 0,
                    commissionRate: 0
                };
            }
        });
        // Salaried techs earn their base pay every period, even with no sales
        this.data.staff.filter(s => s.payType === 'salary').forEach(st => {
            const key = 'id_' + st.id;
            if (!byStaff[key]) {
                byStaff[key] = {
                    staffId: st.id,
                    name: st.name,
                    role: st.role,
                    appointments: 0,
                    completed: 0,
                    cancelled: 0,
                    services: 0,
                    grossSales: 0,
                    commissionRate: 0
                };
            }
        });
        return {
            appts,
            staffBreakdown: Object.values(byStaff).map(b => {
                const st = b.staffId ? this.data.staff.find(s => s.id === b.staffId) : null;
                // Hourly staff: pay from time clock with weekly overtime rules
                if (st && st.payType === 'hourly') {
                    const hp = this.computeHourlyPay(st, startDate, endDate);
                    return {
                        ...b,
                        payType: 'hourly',
                        hours: hp.hours,
                        regularHours: hp.regularHours,
                        overtimeHours: hp.overtimeHours,
                        hourlyRate: hp.hourlyRate,
                        commissionRate: null,
                        estimatedPay: hp.estimatedPay,
                        salonCut: Math.round((b.grossSales - hp.estimatedPay) * 100) / 100
                    };
                }
                // Salaried techs: base salary + overage split (staff/owner)
                if (st && st.payType === 'salary') {
                    const sp = this.computeSalaryPay(st, b.grossSales, startDate, endDate);
                    return {
                        ...b,
                        payType: 'salary',
                        salaryAmount: sp.salaryAmount,
                        salarySplit: sp.salarySplit,
                        salaryFrequency: sp.salaryFrequency,
                        base: sp.base,
                        overage: sp.overage,
                        commission: sp.commission,
                        commissionRate: null,
                        estimatedPay: sp.estimatedPay,
                        salonCut: Math.round((b.grossSales - sp.estimatedPay) * 100) / 100
                    };
                }
                // Commission staff: pay = completed sales × commission rate
                const pay = Math.round(b.grossSales * (b.commissionRate / 100) * 100) / 100;
                return {
                    ...b,
                    payType: 'commission',
                    hours: null,
                    hourlyRate: null,
                    estimatedPay: pay,
                    salonCut: Math.round((b.grossSales - pay) * 100) / 100
                };
            }).filter(b => b.appointments > 0 || (b.hours || 0) > 0 || b.payType === 'salary')
        };
    },

    // Per-staff earnings breakdown for a single date — who earned what that day.
    // Used for the closeout preview on the Manager page, stored inside every
    // closeout record, and reused by the Admin closeout viewer and payroll.
    getStaffBreakdownForDate(date) {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        return this._staffBreakdownForRange(dateStr, dateStr).staffBreakdown;
    },

    addCloseout(closeoutData) {
        const newId = Math.max(0, ...this.data.closeouts.map(c => c.id)) + 1;
        const closeout = {
            id: newId,
            createdAt: new Date().toISOString(),
            status: 'submitted',
            ...closeoutData
        };
        this.data.closeouts.push(closeout);
        this.logAudit('closeout_submitted', `Closeout for ${closeout.date} submitted by ${closeout.closedBy || 'manager'}. Total: $${(closeout.totalRevenue || 0).toFixed(2)}`);
        this.saveData();
        return closeout;
    },

    getCloseouts() {
        return [...this.data.closeouts].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    },

    // Remove a closeout from the active list but keep it in the archive forever
    deleteCloseout(id, deletedBy = 'admin') {
        const rec = this.data.closeouts.find(c => c.id === id);
        if (rec) {
            this.data.closeoutArchive.push({ ...rec, archivedAt: new Date().toISOString(), deletedBy });
            this.data.closeouts = this.data.closeouts.filter(c => c.id !== id);
            this.logAudit('closeout_archived', `Closeout #${id} (${rec.date}) archived by ${deletedBy}.`);
            this.saveData();
            return true;
        }
        return false;
    },

    // ===================== PAYROLL RUNS =====================
    // Turns daily staff earnings into weekly / bi-weekly / monthly payroll runs.
    // Saved runs are kept forever and feed the Tax Center at year-end.

    // Compute a payroll run for a date range (does not save anything).
    // Split-aware: each staff member is credited exactly for the services they
    // performed, so the numbers match the Manager page and the closeout viewer.
    getPayrollRun(startDate, endDate) {
        const { appts, staffBreakdown } = this._staffBreakdownForRange(startDate, endDate);

        return {
            startDate,
            endDate,
            staffBreakdown,
            totalAppointments: appts.length,
            totalCompleted: appts.filter(a => a.status === 'complete').length,
            totalGross: staffBreakdown.reduce((s, b) => s + b.grossSales, 0),
            totalPay: Math.round(staffBreakdown.reduce((s, b) => s + b.estimatedPay, 0) * 100) / 100,
            totalSalonCut: Math.round(staffBreakdown.reduce((s, b) => s + b.salonCut, 0) * 100) / 100
        };
    },

    // Save a payroll run permanently
    savePayrollRun(run) {
        const newId = Math.max(0, ...this.data.payroll.map(p => p.id || 0)) + 1;
        const record = {
            id: newId,
            createdAt: new Date().toISOString(),
            status: 'pending',
            ...run
        };
        this.data.payroll.push(record);
        this.logAudit('payroll_saved', `Payroll run #${newId} (${run.startDate} → ${run.endDate}) saved. Total pay: $${(record.totalPay || 0).toFixed(2)}`);
        this.saveData();
        return record;
    },

    getPayrollRuns() {
        return [...this.data.payroll].sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
    },

    markPayrollPaid(id) {
        const run = this.data.payroll.find(p => p.id === id);
        if (run) {
            run.status = 'paid';
            run.paidAt = new Date().toISOString();
            this.logAudit('payroll_paid', `Payroll run #${id} (${run.startDate} → ${run.endDate}) marked as paid.`);
            // Notify every staff member in this run that their pay is on the way
            (run.staffBreakdown || []).forEach(b => {
                this.data.notifications.push({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    staffId: b.staffId,
                    type: 'payroll_paid',
                    message: `💸 Payroll for ${run.startDate} → ${run.endDate} was marked as PAID. Your pay of $${(b.estimatedPay || 0).toFixed(2)} is on the way!`,
                    timestamp: new Date().toISOString(),
                    read: false
                });
            });
            // Keep notification history bounded but never drop recent ones
            if (this.data.notifications.length > 500) {
                this.data.notifications = this.data.notifications.slice(-500);
            }
            this.saveData();
            return true;
        }
        return false;
    },

    // Remove a payroll run from the active list but keep it in the archive forever
    deletePayrollRun(id, deletedBy = 'admin') {
        const run = this.data.payroll.find(p => p.id === id);
        if (run) {
            this.data.payrollArchive.push({ ...run, archivedAt: new Date().toISOString(), deletedBy });
            this.data.payroll = this.data.payroll.filter(p => p.id !== id);
            this.logAudit('payroll_archived', `Payroll run #${id} (${run.startDate} → ${run.endDate}) archived by ${deletedBy}.`);
            this.saveData();
            return true;
        }
        return false;
    },

    // ===================== NOTIFICATIONS =====================

    getNotificationsFor(staffId) {
        return this.data.notifications
            .filter(n => n.staffId === staffId || n.staffId === 'all')
            .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    },

    markNotificationsRead(staffId) {
        let changed = false;
        this.data.notifications.forEach(n => {
            if ((n.staffId === staffId || n.staffId === 'all') && !n.read) {
                n.read = true;
                changed = true;
            }
        });
        if (changed) this.saveData();
    },

    // ===================== AUDIT LOG =====================

    logAudit(action, details) {
        this.data.auditLog.push({
            id: this.data.auditLog.length + 1,
            action,
            details,
            timestamp: new Date().toISOString()
        });
        // Keep the log from growing without bound but never drop recent history
        if (this.data.auditLog.length > 5000) {
            this.data.auditLog = this.data.auditLog.slice(-5000);
        }
    },

    getAuditLog(limit = 100) {
        return [...this.data.auditLog].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
    },

    // ===================== TAX RECORDS (W-2 / 1099) =====================
    // Builds per-staff year-end totals from completed appointments + payroll.

    getStaffTaxSummary(year) {
        const yearStr = String(year);
        const yearCompleted = this.data.appointments.filter(a =>
            a.status === 'complete' && (a.date || '').startsWith(yearStr)
        );
        return this.data.staff.map(s => {
            // Split-aware: credit each staff member only for the services they
            // performed, matching payroll and the closeout viewer exactly
            let grossSales = 0;
            let apptCount = 0;
            yearCompleted.forEach(a => {
                const mine = this._apptStaffShares(a).filter(sh =>
                    sh.staffId === s.id || (!sh.staffId && sh.name && sh.name === s.name));
                if (mine.length > 0) apptCount++;
                grossSales += mine.reduce((sum, sh) => sum + sh.amount, 0);
            });
            const commissionRate = (s.commission || 0) / 100;
            const commissionPay = grossSales * commissionRate;
            // Hourly staff: estimate from hours worked × rate (with overtime rules)
            // Salaried techs: base salary + overage split for the year
            const rawEstimate = s.payType === 'hourly' ? this.computeHourlyPay(s, yearStr + '-01-01', yearStr + '-12-31').estimatedPay : s.payType === 'salary'
                    ? this.computeSalaryPay(s, grossSales, yearStr + '-01-01', yearStr + '-12-31').estimatedPay
                    : commissionPay;
            // Saved payroll runs for the year take priority over raw commission math.
            // Supports both new run format (staffBreakdown) and legacy format (staffId/amount).
            const payrollPaid = this.data.payroll
                .filter(p => (p.startDate || p.date || '').startsWith(yearStr))
                .reduce((sum, p) => {
                    if (Array.isArray(p.staffBreakdown)) {
                        const entry = p.staffBreakdown.find(b => b.staffId === s.id);
                        return sum + (entry ? (entry.estimatedPay || 0) : 0);
                    }
                    return sum + (p.staffId === s.id ? (p.amount || 0) : 0);
                }, 0);
            return {
                staffId: s.id,
                name: s.name,
                role: s.role,
                email: s.email || '',
                phone: s.phone || '',
                employmentType: s.employmentType || 'W-2',
                ssn: s.ssn || '',
                address: s.address || '',
                year: yearStr,
                appointmentsCompleted: apptCount,
                grossSales: grossSales,
                commissionRate: s.payType === 'hourly' ? null : (s.commission || 0),
                hourlyRate: s.payType === 'hourly' ? (s.hourlyRate || 0) : null,
                payType: s.payType || 'commission',
                salaryAmount: s.payType === 'salary' ? (s.salaryAmount || 0) : null,
                salaryFrequency: s.payType === 'salary' ? (s.salaryFrequency || 'weekly') : null,
                estimatedPay: payrollPaid > 0 ? payrollPaid : rawEstimate
            };
        });
    },

    // ===================== DEMO DAY (training / presentations) =====================
    // Loads one realistic demo day — walk-ins, multi-staff split tickets, pending
    // and cancelled appointments, clock-ins, and reviews — so the full workflow
    // (dashboard, reports, closeout, payroll) can be demoed with one click.
    // Every demo record is tagged demo:true and can be wiped with removeDemoData()
    // without touching real data.

    loadDemoDay() {
        const today = new Date().toISOString().split('T')[0];
        // Re-clicking never duplicates: wipe any previous demo data first
        this.removeDemoData(true);

        // Use existing active staff where possible; create tagged demo staff if needed
        const demoNames = ['Lisa Park', 'Mike Chen', 'Sarah Johnson'];
        const demoComms = [50, 60, 40];
        let active = this.data.staff.filter(s => s.status !== 'archived');
        for (let i = active.length; i < 3; i++) {
            this.addStaff({
                name: demoNames[i] || ('Demo Tech ' + (i + 1)),
                role: i === 2 ? 'manager' : 'nail tech',
                pin: '9999',
                status: 'active',
                commission: demoComms[i] || 50,
                phone: '555-010' + (i + 1),
                email: `demo${i + 1}@salon.com`,
                demo: true
            });
        }
        const staff = this.data.staff.filter(s => s.status !== 'archived');
        const s1 = staff[0], s2 = staff[1] || staff[0], s3 = staff[2] || staff[1] || staff[0];

        // Demo clients (tagged)
        const c1 = this.addClient({ firstName: 'John', lastName: 'Doe', phone: '555-0181', email: 'john.demo@email.com', demo: true });
        const c2 = this.addClient({ firstName: 'Jane', lastName: 'Smith', phone: '555-0182', email: 'jane.demo@email.com', demo: true });

        // Demo appointments for today (tagged) — mirrors a real busy day
        const appts = [
            // Multi-staff booked appointment: s1 does the manicure, s2 does the pedicure
            { clientId: c1.id, staffId: s1.id, time: '09:00', price: 85, status: 'complete',
              services: [ { name: 'Gel', price: 35, staffId: s1.id, staffName: s1.name },
                          { name: 'Spa', price: 50, staffId: s2.id, staffName: s2.name } ],
              splits: [ { staffId: s1.id, staffName: s1.name, amount: 35 }, { staffId: s2.id, staffName: s2.name, amount: 50 } ],
              clientName: 'John Doe', isWalkIn: false },
            // Walk-in completed by s2
            { clientId: null, staffId: s2.id, time: '10:00', price: 60, status: 'complete',
              services: [ { name: 'Acrylic Full Set', price: 60, staffId: s2.id, staffName: s2.name } ],
              splits: [ { staffId: s2.id, staffName: s2.name, amount: 60 } ],
              clientName: 'Walk-In Amy', isWalkIn: true },
            // Booked appointment completed by s3
            { clientId: c2.id, staffId: s3.id, time: '11:00', price: 25, status: 'complete',
              services: [ { name: 'Classic Manicure', price: 25, staffId: s3.id, staffName: s3.name } ],
              splits: [ { staffId: s3.id, staffName: s3.name, amount: 25 } ],
              clientName: 'Jane Smith', isWalkIn: false },
            // Pending booking (still to come — not revenue yet)
            { clientId: c1.id, staffId: s1.id, time: '13:00', price: 20, status: 'booked',
              services: [ { name: 'Nail Art', price: 20 } ], clientName: 'John Doe', isWalkIn: false },
            // Cancelled walk-in
            { clientId: null, staffId: s1.id, time: '14:00', price: 15, status: 'cancelled',
              services: [ { name: 'Polish Change', price: 15 } ], clientName: 'Walk-In Tom', isWalkIn: true },
            // Legacy-style completed appointment (no split tags — fallback path)
            { clientId: c2.id, staffId: s2.id, time: '15:00', price: 45, status: 'complete',
              clientName: 'Jane Smith', isWalkIn: false }
        ];
        appts.forEach(a => {
            const svc = this.data.services.find(x => x.name === ((a.services && a.services[0] && a.services[0].name) || ''));
            this.addAppointment({ ...a, date: today, duration: 45, serviceId: svc ? svc.id : null, source: 'demo', demo: true });
        });

        // Demo reviews (tagged) — drives the Avg Rating card and its breakdown
        [
            { staffId: s1.id, staffName: s1.name, clientName: 'John Doe', rating: 5, comment: 'Perfect nails as always!' },
            { staffId: s2.id, staffName: s2.name, clientName: 'Walk-In Amy', rating: 4, comment: 'Great acrylic set' },
            { staffId: s3.id, staffName: s3.name, clientName: 'Jane Smith', rating: 3, comment: 'Good, but a bit of a wait' },
            { staffId: s2.id, staffName: s2.name, clientName: 'Jane Smith', rating: 5, comment: 'Loved the pedicure!' }
        ].forEach(r => this.data.reviews.push({ id: Date.now() + Math.floor(Math.random() * 1000), ...r, date: today, demo: true }));

        // Demo clock-ins (tagged) — drives Staff On Duty and the duty board
        [[s1, '08:55'], [s2, '09:05']].forEach(([s, t]) => {
            this.data.timeClock.push({ staffId: s.id, date: today, time: t, timestamp: today + 'T' + t + ':00', type: 'in', demo: true });
            this.updateStaff(s.id, { isClockedIn: true });
        });

        this.logAudit('demo_loaded', `Demo day loaded for ${today}. Use "Remove Demo Data" to wipe it.`);
        this.saveData();
        return { appointments: appts.length, reviews: 4, clockIns: 2 };
    },

    // Remove every demo-tagged record; real data is never touched
    removeDemoData(silent = false) {
        const d = this.data;
        const before = d.appointments.length + d.clients.length + d.reviews.length + d.timeClock.length + d.staff.filter(s => s.demo).length;
        d.appointments = d.appointments.filter(a => !a.demo);
        d.clients = d.clients.filter(c => !c.demo);
        d.reviews = d.reviews.filter(r => !r.demo);
        d.timeClock = d.timeClock.filter(t => !t.demo);
        d.staff = d.staff.filter(s => !s.demo);
        // Recompute clock-in state from the remaining real time-clock entries
        d.staff.forEach(s => {
            const entries = d.timeClock
                .filter(t => t.staffId === s.id)
                .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
            s.isClockedIn = entries.length > 0 ? entries[entries.length - 1].type === 'in' : false;
        });
        const after = d.appointments.length + d.clients.length + d.reviews.length + d.timeClock.length + d.staff.filter(s => s.demo).length;
        const removed = before - after;
        if (removed > 0) {
            if (!silent) this.logAudit('demo_removed', `Demo data removed (${removed} records).`);
            this.saveData();
        }
        return removed;
    },

    // ===================== BACKUP SNAPSHOTS =====================
    // Automatic backups: every save also writes a rotating snapshot so nothing
    // is ever lost, even if the main record is edited or deleted.

    createBackupSnapshot(label = 'auto') {
        try {
            const key = 'aiSalonPro_v3_backups';
            let backups = [];
            try { backups = JSON.parse(localStorage.getItem(key) || '[]'); } catch (eB) { backups = []; }
            const snap = {
                id: Date.now(),
                label,
                createdAt: new Date().toISOString(),
                data: JSON.parse(JSON.stringify(this.data)),
                settings: { ...this.settings }
            };
            backups.push(snap);
            // Keep the most recent 15 snapshots (full copies are large; avoid quota wipe)
            while (backups.length > 15) backups.shift();
            try {
                localStorage.setItem(key, JSON.stringify(backups));
            } catch (quotaErr) {
                // Drop oldest until it fits — never lose the newest snapshot
                while (backups.length > 1) {
                    backups.shift();
                    try {
                        localStorage.setItem(key, JSON.stringify(backups));
                        break;
                    } catch (e2) { /* keep dropping */ }
                }
            }
            // Always also push a disk backup via server when available
            try { this._pushDiskBackupSnapshot(label, snap); } catch (eDisk) { /* ignore */ }
            return true;
        } catch (e) {
            console.error('Backup snapshot failed:', e);
            return false;
        }
    },

    _pushDiskBackupSnapshot(label, snap) {
        try {
            if (typeof fetch !== 'function') return;
            const payload = {
                label: label || 'snapshot',
                createdAt: (snap && snap.createdAt) || new Date().toISOString(),
                appointmentCount: ((snap && snap.data && snap.data.appointments) || []).length,
                data: snap && snap.data,
                settings: snap && snap.settings
            };
            fetch('/api/salon-backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(function () { /* offline ok */ });
        } catch (e) { /* ignore */ }
    },

    listBackupSnapshots() {
        try {
            const backups = JSON.parse(localStorage.getItem('aiSalonPro_v3_backups') || '[]');
            return backups.map(b => ({ id: b.id, label: b.label, createdAt: b.createdAt })).reverse();
        } catch (e) {
            return [];
        }
    },

    restoreBackupSnapshot(id) {
        try {
            const backups = JSON.parse(localStorage.getItem('aiSalonPro_v3_backups') || '[]');
            const snap = backups.find(b => b.id === id);
            if (!snap) return false;
            // Snapshot current state first so the restore itself is reversible
            this.createBackupSnapshot('before-restore');
            this.data = this.mergeDeep(DEFAULT_SALON_DATA, snap.data);
            if (snap.settings) this.settings = { ...DEFAULT_SETTINGS, ...snap.settings };
            this.saveAll();
            return true;
        } catch (e) {
            console.error('Restore failed:', e);
            return false;
        }
    },

    // ===================== SYNC & LISTENERS =====================
    
    // Add change listener
    addListener(callback) {
        this.listeners.push(callback);
    },
    
    // Remove change listener
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    },
    
    // Notify all listeners
    notifyListeners(type, data) {
        this.listeners.forEach(callback => {
            try {
                callback(type, data);
            } catch (e) {
                console.error('Listener error:', e);
            }
        });
    },
    
    // Start auto-sync
    startSync() {
        if (this.syncInterval) clearInterval(this.syncInterval);
        // Always keep cross-OS / cross-page pairing at 30s
        if (!this.settings) this.settings = {};
        this.settings.autoSync = true;
        this.settings.syncInterval = 30000;
        this.syncInterval = setInterval(() => {
            this.checkForUpdates();
        }, 30000);
    },
    
    // Stop auto-sync
    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    },

    // Instant cross-tab sync: the moment another open page saves data or
    // settings, this page reloads them and notifies its listeners — no
    // waiting for the 30-second poll. (The polling above stays as fallback.)
    watchStorage() {
        if (this._watchingStorage) return;
        this._watchingStorage = true;
        window.addEventListener('storage', (e) => {
            try {
                if (e.key === SALON_STORAGE_KEY) {
                    const newData = this.loadData();
                    // Prefer lastUpdated (cheap) over full JSON.stringify of the salon blob
                    const changed = !newData.lastUpdated || !this.data.lastUpdated
                        ? JSON.stringify(newData) !== JSON.stringify(this.data)
                        : newData.lastUpdated !== this.data.lastUpdated;
                    if (changed) {
                        const prevStaffSig = this._staffSyncSig(this.data);
                        this.data = newData;
                        this.notifyListeners('data', this.data);
                        if (this._staffSyncSig(newData) !== prevStaffSig) {
                            this._emitStaffChanged('sync', null);
                        }
                    }
                } else if (e.key === SALON_SETTINGS_KEY) {
                    const newSettings = this.loadSettings();
                    if (JSON.stringify(newSettings) !== JSON.stringify(this.settings)) {
                        this.settings = newSettings;
                        this.notifyListeners('settings', this.settings);
                    }
                }
            } catch (err) {
                console.error('Storage sync error:', err);
            }
        });
    },

    // ===================== SERVER SYNC (multi-device) =====================
    // When the app is served over http(s) by the salon server, every page also
    // syncs through the server, so ALL devices (front-desk PC, phones running
    // the My Schedule app) share ONE live dataset. file:// mode is unchanged.

    serverEnabled() {
        try { return /^https?:$/.test(location.protocol); } catch (e) { return false; }
    },

    // Strip live rows whose ids live in archives so deleted items stay deleted
    // even if an older/richer sibling blob briefly reappears during sync.
    applyArchiveTombstones(data) {
        if (!data || typeof data !== 'object') return data;
        // Heal false-positive appointment archives before applying tombstones
        data = this._healAppointmentArchives(data);
        data = this._healAppointmentClientLinks(data);
        const apptArch = {};
        (data.appointmentArchive || []).forEach(function (a) {
            // 'unknown' = old scheduler delete-sweep false positives — do not tombstone
            if (a && a.id != null && a.deletedBy !== 'unknown') apptArch[String(a.id)] = true;
        });
        const clientArch = {};
        (data.clientArchive || []).forEach(function (c) {
            if (c && c.id != null) clientArch[String(c.id)] = true;
        });
        const staffArch = {};
        const staffArchNames = {};
        (data.staffArchive || []).forEach(function (s) {
            if (!s) return;
            if (s.id != null) staffArch[String(s.id)] = true;
            const nm = String(s.name || '').trim().toLowerCase();
            if (nm) staffArchNames[nm] = true;
        });
        if (Array.isArray(data.appointments) && Object.keys(apptArch).length) {
            data.appointments = data.appointments.filter(function (a) {
                if (!a || !apptArch[String(a.id)]) return true;
                const archRow = (data.appointmentArchive || []).find(function (ar) {
                    return ar && String(ar.id) === String(a.id);
                });
                if (!archRow) return true;
                const liveT = Date.parse(a.updatedAt || a.createdAt || '') || 0;
                const archT = Date.parse(archRow.archivedAt || archRow.deletedAt || archRow.updatedAt || '') || 0;
                if (liveT && archT && liveT > archT) return true;
                const sameBooking = String(a.date || '') === String(archRow.date || '')
                    && String(a.time || '') === String(archRow.time || '')
                    && String(a.clientName || '').trim().toLowerCase() === String(archRow.clientName || '').trim().toLowerCase();
                if (!sameBooking && (a.date || a.clientName)) return true;
                return false;
            });
        }
        if (Array.isArray(data.clients) && Object.keys(clientArch).length) {
            data.clients = data.clients.filter(function (c) {
                return !(c && clientArch[String(c.id)]);
            });
        }
        if (Array.isArray(data.staff) && (Object.keys(staffArch).length || Object.keys(staffArchNames).length)) {
            data.staff = data.staff.filter(function (s) {
                if (!s) return false;
                const nm = String(s.name || '').trim().toLowerCase();
                if (nm && staffArchNames[nm]) return false;
                if (staffArch[String(s.id)]) {
                    // Id reused for a *different* person (legacy bug) — keep the new hire
                    try {
                        const archRow = (data.staffArchive || []).find(function (a) {
                            return a && String(a.id) === String(s.id);
                        });
                        const archNm = String(archRow && archRow.name || '').trim().toLowerCase();
                        if (nm && archNm && nm !== archNm) return true;
                    } catch (eKeep) { /* fall through */ }
                    return false;
                }
                return true;
            });
        }
        return data;
    },

    // Drop ONLY false-positive delete-sweep archives (deletedBy === 'unknown').
    // Real manager/admin deletes must stay archived even if a sibling blob
    // still has the live row — applyArchiveTombstones then strips it from live.
    _healAppointmentArchives(data) {
        try {
            if (!data || !Array.isArray(data.appointments) || !Array.isArray(data.appointmentArchive)) return data;
            const live = {};
            data.appointments.forEach(function (a) {
                if (!a || a.id == null) return;
                if (a.status === 'cancelled') return;
                live[String(a.id)] = true;
            });
            data.appointmentArchive = data.appointmentArchive.filter(function (a) {
                if (!a || a.id == null) return true;
                const who = String(a.deletedBy || '');
                if (who && who !== 'unknown') return true;
                return !live[String(a.id)];
            });
        } catch (e) { /* ignore */ }
        return data;
    },

    // Union two id-keyed arrays. Prefer the row with the newer updatedAt/createdAt.
    // Never drop a row that only exists on one side (prevents online/scheduler wipe races).
    _mergeRowsById(localArr, remoteArr) {
        const byId = {};
        const order = [];
        const stamp = (row) => {
            if (!row) return 0;
            return Date.parse(row.updatedAt || row.createdAt || row.lastUpdated || '') || 0;
        };
        const take = (row, preferIfEqual) => {
            if (!row || row.id == null) return;
            const k = String(row.id);
            if (!byId[k]) {
                byId[k] = row;
                order.push(k);
                return;
            }
            const cur = byId[k];
            const sNew = stamp(row);
            const sCur = stamp(cur);
            if (sNew > sCur) byId[k] = row;
            else if (sNew === sCur && preferIfEqual) byId[k] = row;
        };
        (remoteArr || []).forEach(r => take(r, false));
        (localArr || []).forEach(r => take(r, true));
        return order.map(k => byId[k]);
    },

    _mergeClientsById(localArr, remoteArr) {
        return this._mergeRowsById(localArr, remoteArr);
    },

    // Pull the canonical copy from the server; adopt it if newer than what we
    // last synced. Only adopt a richer-but-not-newer blob when local is empty
    // so deletes cannot be resurrected by a stale sibling with more rows.
    async pullFromServer() {
        if (!this.serverEnabled() || this._resetInProgress) return;
        try {
            const res = await fetch('/api/salon-data', { cache: 'no-store' });
            if (!res.ok) return;
            const payload = await res.json();
            if (!payload || !payload.savedAt) return;
            const remoteData = payload.data || {};
            const remoteClients = (remoteData.clients || []).length;
            const remoteAppts = (remoteData.appointments || []).length;
            const localClients = ((this.data && this.data.clients) || []).length;
            const localAppts = ((this.data && this.data.appointments) || []).length;
            const storedSync = parseInt(localStorage.getItem('aiSalonPro_v3_lastServerSync') || '0', 10) || 0;
            const lastSync = Math.max(this.lastServerSync || 0, storedSync);
            const localUpdated = Date.parse((this.data && this.data.lastUpdated) || '') || 0;
            // Local stamp ahead of hub savedAt — still MERGE remote appointments/clients
            // so online bookings are never overwritten by a "fresher" scheduler blob.
            const localIsFresherThanRemote = localUpdated > 0 && localUpdated >= payload.savedAt;
            const newer = payload.savedAt > lastSync;
            const localEmpty = localClients === 0 && localAppts === 0 && ((this.data.staff || []).length === 0);
            const remoteHasData = remoteClients > 0 || remoteAppts > 0 || ((remoteData.staff || []).length > 0);
            const rescueEmpty = localEmpty && remoteHasData &&
                (remoteClients > localClients || remoteAppts > localAppts || (remoteData.staff || []).length > ((this.data.staff || []).length));

            // Always absorb remote appointments/clients that local is missing
            // (online public book writes hub-only rows).
            const absorbRemoteBookings = () => {
                try {
                    const localA = (this.data && this.data.appointments) || [];
                    const remoteA = remoteData.appointments || [];
                    const localC = (this.data && this.data.clients) || [];
                    const remoteC = remoteData.clients || [];
                    const mergedA = this._mergeRowsById(localA, remoteA);
                    const mergedC = this._mergeClientsById(localC, remoteC);
                    const apptGrew = mergedA.length > localA.length;
                    const clientGrew = mergedC.length > localC.length;
                    if (apptGrew || clientGrew) {
                        // Never shrink appointments on absorb — only grow via merge
                        if (mergedA.length < localA.length) {
                            this.data.appointments = this._mergeRowsById(localA, remoteA);
                        } else {
                            this.data.appointments = mergedA;
                        }
                        this.data.clients = mergedC;
                        if (Array.isArray(remoteData.appointmentArchive)) {
                            this.data.appointmentArchive = this._mergeRowsById(
                                this.data.appointmentArchive || [],
                                remoteData.appointmentArchive
                            );
                        }
                        this.data = this.applyArchiveTombstones(this.data);
                        // Only bump lastUpdated if we actually absorbed something new
                        this.data.lastUpdated = new Date().toISOString();
                        try { localStorage.setItem(SALON_STORAGE_KEY, JSON.stringify(this.data)); } catch (eL) { /* ignore */ }
                        this.notifyListeners('data', this.data);
                        return true;
                    }
                } catch (eAbs) { /* ignore */ }
                return false;
            };

            if (localIsFresherThanRemote && !rescueEmpty) {
                const absorbed = absorbRemoteBookings();
                // Push merged local so hub gets scheduler edits + online bookings
                try { this.flushPushToServer(); } catch (ePush) { /* ignore */ }
                if (absorbed) {
                    try { this._emitStaffChanged('sync', null); } catch (eS) { /* ignore */ }
                }
                return;
            }
            if (!newer && !rescueEmpty) {
                // Even when hub isn't "newer" by savedAt watermark, absorb missing online rows
                if (absorbRemoteBookings()) {
                    try { this.flushPushToServer(); } catch (ePush2) { /* ignore */ }
                }
                return;
            }
            // Never let a stale server blob resurrect clients after a full wipe
            const wipedAt = parseInt(localStorage.getItem('aiSalonPro_v3_wipedAt') || '0', 10);
            if (wipedAt && payload.savedAt < wipedAt) return;

            // Preserve local archives so deletes stay deleted even if remote archive is stale
            const unionById = (a, b) => {
                const out = [];
                const seen = {};
                (a || []).concat(b || []).forEach(function (row) {
                    if (!row || row.id == null) { if (row) out.push(row); return; }
                    const k = String(row.id);
                    if (seen[k]) return;
                    seen[k] = true;
                    out.push(row);
                });
                return out;
            };
            const localStaffArch = ((this.data && this.data.staffArchive) || []).slice();
            const localClientArch = ((this.data && this.data.clientArchive) || []).slice();
            const localApptArch = ((this.data && this.data.appointmentArchive) || []).slice();
            const localApptsSnap = ((this.data && this.data.appointments) || []).slice();
            const localClientsSnap = ((this.data && this.data.clients) || []).slice();
            const localStaffSnap = ((this.data && this.data.staff) || []).slice();

            this.lastServerSync = payload.savedAt;
            try { localStorage.setItem('aiSalonPro_v3_lastServerSync', String(payload.savedAt)); } catch (eLS) { /* ignore */ }
            this._applyingRemote = true;
            try {
                if (payload.data) {
                    let merged = this.mergeDeep(DEFAULT_SALON_DATA, payload.data);
                    if (Array.isArray(payload.data.staff)) merged.staff = payload.data.staff.slice();
                    if (Array.isArray(payload.data.staffArchive)) {
                        merged.staffArchive = payload.data.staffArchive.slice();
                    }
                    merged.staffArchive = unionById(localStaffArch, merged.staffArchive || []);
                    merged.clientArchive = unionById(localClientArch, merged.clientArchive || []);
                    merged.appointmentArchive = unionById(localApptArch, merged.appointmentArchive || []);
                    // MERGE appointments + clients (never whole-array replace)
                    merged.appointments = this._mergeRowsById(localApptsSnap, payload.data.appointments || merged.appointments || []);
                    merged.clients = this._mergeClientsById(localClientsSnap, payload.data.clients || merged.clients || []);
                    // If local is equal-or-newer on staff roster, prefer local staff arrays
                    if (localUpdated && localUpdated >= payload.savedAt) {
                        merged.staff = localStaffSnap.slice();
                        merged.staffArchive = unionById(localStaffArch, merged.staffArchive || []);
                    }
                    this.data = this.applyArchiveTombstones(merged);
                    localStorage.setItem(SALON_STORAGE_KEY, JSON.stringify(this.data));
                    this.notifyListeners('data', this.data);
                    try { this._emitStaffChanged('sync', null); } catch (eStaff) { /* ignore */ }
                }
                if (payload.settings) {
                    this.settings = { ...DEFAULT_SETTINGS, ...payload.settings };
                    // Keep 12-hour lock
                    this.settings.timeFormat = '12';
                    this.settings.set24Hour = false;
                    localStorage.setItem(SALON_SETTINGS_KEY, JSON.stringify(this.settings));
                    this.notifyListeners('settings', this.settings);
                }
            } finally {
                this._applyingRemote = false;
            }
            try {
                if (window.SiteContent && typeof SiteContent.ensureMenu === 'function') {
                    SiteContent.ensureMenu();
                }
            } catch (eHeal) { /* ignore */ }
        } catch (e) { /* server unreachable — local mode continues */ }
    },

    // Push local changes to the server (debounced; skipped while applying a pull)
    pushToServer() {
        if (!this.serverEnabled() || this._applyingRemote || this._resetInProgress) return;
        clearTimeout(this._pushTimer);
        this._pushTimer = setTimeout(() => { this.flushPushToServer(); }, 800);
    },

    // Immediate server push (used by Clear Everything so reload can't race the debounce)
    async flushPushToServer() {
        if (!this.serverEnabled()) return true;
        clearTimeout(this._pushTimer);
        this._pushTimer = null;
        try {
            const savedAt = Date.now();
            const staffTruth = JSON.parse(JSON.stringify(this.data.staff || []));
            const staffArchTruth = JSON.parse(JSON.stringify(this.data.staffArchive || []));
            const apptTruth = JSON.parse(JSON.stringify(this.data.appointments || []));
            const apptArchTruth = JSON.parse(JSON.stringify(this.data.appointmentArchive || []));
            const clientTruth = JSON.parse(JSON.stringify(this.data.clients || []));
            const body = JSON.stringify({ data: this.data, settings: this.settings, savedAt });
            let res;
            try {
                res = await fetch('/api/salon-data', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body,
                    keepalive: true
                });
            } catch (fetchErr) {
                // Last-chance beacon on hard close (sendBeacon is always POST)
                try {
                    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                        const blob = new Blob([body], { type: 'application/json' });
                        navigator.sendBeacon('/api/salon-data', blob);
                    }
                } catch (eBeacon) { /* ignore */ }
                return false;
            }
            if (!res.ok) return false;
            let json = {};
            try { json = await res.json(); } catch (eJ) { json = {}; }
            if (json && json.skipped === 'older') {
                // Hub clock is ahead — merge our appointments/clients/staff and retry once
                this.lastServerSync = Number(json.savedAt) || this.lastServerSync || 0;
                try { localStorage.setItem('aiSalonPro_v3_lastServerSync', String(this.lastServerSync)); } catch (eS) { /* ignore */ }
                if (this._staffPushRetry) return false;
                this._staffPushRetry = true;
                try {
                    const unionById = (a, b) => {
                        const out = [];
                        const seen = {};
                        (a || []).concat(b || []).forEach(function (row) {
                            if (!row || row.id == null) { if (row) out.push(row); return; }
                            const k = String(row.id);
                            if (seen[k]) return;
                            seen[k] = true;
                            out.push(row);
                        });
                        return out;
                    };
                    const remoteRes = await fetch('/api/salon-data', { cache: 'no-store' });
                    if (remoteRes.ok) {
                        const remotePayload = await remoteRes.json();
                        if (remotePayload && remotePayload.data) {
                            let merged = this.mergeDeep(DEFAULT_SALON_DATA, remotePayload.data);
                            if (Array.isArray(remotePayload.data.staff)) merged.staff = remotePayload.data.staff.slice();
                            merged.staff = staffTruth;
                            merged.staffArchive = unionById(staffArchTruth, merged.staffArchive || remotePayload.data.staffArchive || []);
                            // CRITICAL: merge appointments/clients — never drop local bookings
                            merged.appointments = this._mergeRowsById(apptTruth, remotePayload.data.appointments || []);
                            merged.clients = this._mergeClientsById(clientTruth, remotePayload.data.clients || []);
                            merged.appointmentArchive = unionById(apptArchTruth, merged.appointmentArchive || remotePayload.data.appointmentArchive || []);
                            this.data = this.applyArchiveTombstones(merged);
                            this.data.lastUpdated = new Date().toISOString();
                            try { localStorage.setItem(SALON_STORAGE_KEY, JSON.stringify(this.data)); } catch (eL) { /* ignore */ }
                        }
                    } else {
                        this.data.staff = staffTruth;
                        this.data.staffArchive = unionById(staffArchTruth, this.data.staffArchive || []);
                        this.data.appointments = apptTruth;
                        this.data.clients = clientTruth;
                        this.data.appointmentArchive = unionById(apptArchTruth, this.data.appointmentArchive || []);
                        this.data = this.applyArchiveTombstones(this.data);
                    }
                    return await this.flushPushToServer();
                } finally {
                    this._staffPushRetry = false;
                }
            }
            const acceptedAt = (json && json.savedAt) ? Number(json.savedAt) : savedAt;
            this.lastServerSync = acceptedAt;
            try { localStorage.setItem('aiSalonPro_v3_lastServerSync', String(acceptedAt)); } catch (eSync) { /* ignore */ }
            return true;
        } catch (e) {
            return false;
        }
    },

    // Check for updates from other pages / OS packages (await hub pull so boards stay paired)
    async checkForUpdates() {
        try {
            // multi-device sync via shared hub (no-op on file://)
            try { await this.pullFromServer(); } catch (ePull) { /* offline ok */ }
            const lastSync = localStorage.getItem(SALON_SYNC_KEY);
            if (lastSync) {
                const syncTime = parseInt(lastSync);
                const dataTime = new Date(this.data.lastUpdated).getTime();
                
                if (syncTime > dataTime) {
                    // Data was updated by another page
                    const newData = this.loadData();
                    const newSettings = this.loadSettings();
                    
                    // Cheap change check: lastUpdated first (avoid stringify every 5s)
                    const dataChanged = !newData.lastUpdated || !this.data.lastUpdated
                        ? JSON.stringify(newData) !== JSON.stringify(this.data)
                        : newData.lastUpdated !== this.data.lastUpdated;
                    if (dataChanged) {
                        const prevStaffSig = this._staffSyncSig(this.data);
                        this.data = newData;
                        this.notifyListeners('data', this.data);
                        if (this._staffSyncSig(newData) !== prevStaffSig) {
                            this._emitStaffChanged('sync', null);
                        }
                    }
                    
                    if (JSON.stringify(newSettings) !== JSON.stringify(this.settings)) {
                        this.settings = newSettings;
                        this.notifyListeners('settings', this.settings);
                    }
                }
            }
        } catch (e) {
            console.error('Sync error:', e);
        }
    },
    
    // Force refresh from storage
    refresh() {
        this.data = this.loadData();
        this.settings = this.loadSettings();
        this.notifyListeners('data', this.data);
        this.notifyListeners('settings', this.settings);
    },
    
    // ===================== EXPORT/IMPORT =====================
    
    exportAllData() {
        return {
            data: this.data,
            settings: this.settings,
            exportedAt: new Date().toISOString()
        };
    },
    
    importAllData(backup) {
        if (backup.data) {
            this.data = this.mergeDeep(DEFAULT_SALON_DATA, backup.data);
            this.saveData();
        }
        if (backup.settings) {
            this.settings = { ...DEFAULT_SETTINGS, ...backup.settings };
            this.saveSettings();
        }
        this.notifyListeners('data', this.data);
        this.notifyListeners('settings', this.settings);
    },
    
    // Verify admin PIN — master admin PIN or any active staff with the admin role
    verifyAdminPin(pin) {
        return !!this._actorFromPin(pin).isAdmin;
    },

    // Master admin/manager PIN or any active admin/manager staff PIN
    verifyAdminOrManagerPin(pin) {
        return !!this._actorFromPin(pin).ok;
    },

    // Clear scheduler + calendar appointments only (keeps staff, clients, services, settings).
    // Requires admin PIN. Saves a backup snapshot first.
    clearSchedulerCalendar(adminPin) {
        if (!this.verifyAdminPin(adminPin)) {
            return { ok: false, error: 'Incorrect admin PIN' };
        }
        try {
            this.createBackupSnapshot('before-clear-scheduler');
            const apptCount = (this.data.appointments || []).length;
            const waitCount = (this.data.waitlist || []).length;
            const reminderCount = (this.data.reminderOutbox || []).length;

            // Soft-archive current appointments before wipe so history isn’t lost forever
            if (!Array.isArray(this.data.appointmentArchive)) this.data.appointmentArchive = [];
            (this.data.appointments || []).forEach(a => {
                if (!a) return;
                this.data.appointmentArchive.push({
                    ...a,
                    archivedAt: new Date().toISOString(),
                    archivedReason: 'clear-scheduler-calendar',
                    deletedBy: 'admin'
                });
            });

            this._explicitClearCalendar = true;
            this.data.appointments = [];
            this.data.waitlist = [];
            this.data.reminderOutbox = [];
            this.data.lastUpdated = new Date().toISOString();
            this.saveData();
            this._explicitClearCalendar = false;
            this.notifyListeners('data', this.data);
            this.logAudit('clear_scheduler_calendar',
                `Cleared scheduler/calendar: ${apptCount} appointments, ${waitCount} waitlist, ${reminderCount} reminders (admin PIN).`);
            return { ok: true, appointments: apptCount, waitlist: waitCount, reminders: reminderCount };
        } catch (e) {
            this._explicitClearCalendar = false;
            console.error('clearSchedulerCalendar failed:', e);
            return { ok: false, error: 'Clear failed — please try again.' };
        }
    },

    // Reset to defaults — requires admin PIN. Backup snapshot saved first.
    // Wipes clients, appointments, tickets, history, archives, waitlist — brand new salon data.
    // Caller should await flushPushToServer() before reloading the page.
    resetAll(adminPin) {
        if (!this.verifyAdminPin(adminPin)) {
            return { ok: false, error: 'Incorrect admin PIN' };
        }
        try {
            this._resetInProgress = true;
            clearTimeout(this._pushTimer);
            this.createBackupSnapshot('before-reset');
            const keepPins = {
                adminPin: this.settings.adminPin,
                managerPin: this.settings.managerPin
            };
            this.data = JSON.parse(JSON.stringify(DEFAULT_SALON_DATA));
            // Guarantee transactional lists are empty (brand new)
            this.data.clients = [];
            this.data.appointments = [];
            this.data.waitlist = [];
            this.data.posTickets = [];
            this.data.reviews = [];
            this.data.expenses = [];
            this.data.giftCards = [];
            this.data.timeClock = [];
            this.data.messages = [];
            this.data.notifications = [];
            this.data.clientHistory = [];
            this.data.reminderOutbox = [];
            this.data.staffArchive = [];
            this.data.clientArchive = [];
            this.data.appointmentArchive = [];
            this.data.payrollArchive = [];
            this.data.closeouts = [];
            this.data.closeoutArchive = [];
            this.data.auditLog = [];
            this.data.payroll = [];
            this.data.leaveRequests = [];
            this.data.shifts = [];
            this.data.dayStatuses = {};
            this.data.competition = { enabled: false, startDate: null, endDate: null, prizes: [] };
            this.data.analytics = { dailyRevenue: [], monthlyRevenue: [], staffPerformance: [], servicePopularity: [] };
            this.data.clientAuth = {};
            this.data.lastUpdated = new Date().toISOString();
            this.settings = { ...DEFAULT_SETTINGS, ...keepPins };
            const wipedAt = Date.now();
            localStorage.setItem('aiSalonPro_v3_wipedAt', String(wipedAt));
            this.lastServerSync = wipedAt;
            // Write local immediately (skip debounced server push — caller flushes)
            try {
                localStorage.setItem(SALON_STORAGE_KEY, JSON.stringify(this.data));
                localStorage.setItem(SALON_SETTINGS_KEY, JSON.stringify(this.settings));
                localStorage.setItem(SALON_SYNC_KEY, String(wipedAt));
            } catch (e) { /* ignore */ }
            this.notifyListeners('data', this.data);
            this.notifyListeners('settings', this.settings);
            try {
                if (!Array.isArray(this.data.auditLog)) this.data.auditLog = [];
                this.data.auditLog.unshift({
                    id: Date.now(),
                    action: 'reset_all',
                    detail: 'FULL clear — brand new data (admin PIN). PINs preserved.',
                    at: new Date().toISOString()
                });
                localStorage.setItem(SALON_STORAGE_KEY, JSON.stringify(this.data));
            } catch (e) { /* ignore */ }
            return { ok: true, wipedAt };
        } catch (e) {
            console.error('resetAll failed:', e);
            this._resetInProgress = false;
            return { ok: false, error: 'Reset failed — please try again.' };
        }
    }
};

// Initialize on load
DataManager.init();

// Flush saves + snapshot when the tab closes / hides, and take an end-of-day backup once per calendar day.
(function unbInstallAutoPersistGuards() {
    var _lastCloseSnap = 0;
    function isHardCloseLabel(label) {
        return label === 'beforeunload' || label === 'pagehide' || label === 'freeze' || label === 'unload';
    }
    function beaconFullBlob(label) {
        try {
            if (typeof navigator === 'undefined' || !navigator.sendBeacon) return;
            var savedAt = Date.now();
            var payload = JSON.stringify({
                data: DataManager.data,
                settings: DataManager.settings,
                savedAt: savedAt
            });
            var blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon('/api/salon-data', blob);
            var appts = (DataManager.data && DataManager.data.appointments) || [];
            var bak = JSON.stringify({
                label: label || 'close',
                createdAt: new Date().toISOString(),
                appointmentCount: appts.length,
                data: DataManager.data,
                settings: DataManager.settings
            });
            navigator.sendBeacon('/api/salon-backup', new Blob([bak], { type: 'application/json' }));
        } catch (eBeacon) { /* ignore */ }
    }
    function flushNow(label) {
        try {
            if (!DataManager || DataManager._resetInProgress) return;
            var hard = isHardCloseLabel(label);
            // Scheduler calendar blocks live in memory first — force them into DataManager now
            try {
                if (typeof window !== 'undefined' && typeof window.persistBoardEmergency === 'function') {
                    window.persistBoardEmergency();
                }
            } catch (eEmerg) { /* ignore */ }
            try {
                if (typeof window !== 'undefined' && typeof window.flushSyncToDM === 'function') {
                    window.flushSyncToDM(true);
                } else if (typeof window !== 'undefined' && typeof window.syncToDM === 'function') {
                    window.syncToDM(true);
                }
            } catch (eBoard) { /* ignore */ }
            try { DataManager.saveAll({ persistOnly: true }); } catch (e2) { /* ignore */ }
            try {
                if (hard || (Date.now() - _lastCloseSnap > 90000)) {
                    _lastCloseSnap = Date.now();
                    DataManager.createBackupSnapshot(label || 'auto-flush');
                }
            } catch (eSnap) { /* ignore */ }
            try {
                if (typeof DataManager._pushDiskBackupSnapshot === 'function') {
                    DataManager._pushDiskBackupSnapshot(label || 'close', {
                        createdAt: new Date().toISOString(),
                        data: DataManager.data,
                        settings: DataManager.settings
                    });
                }
            } catch (eDisk) { /* ignore */ }
            try {
                if (typeof DataManager.flushPushToServer === 'function') {
                    DataManager.flushPushToServer();
                }
            } catch (e) { /* ignore */ }
            if (hard) beaconFullBlob(label);
        } catch (e) { /* ignore */ }
    }
    try { window.unbFlushNow = flushNow; } catch (eEx) { /* ignore */ }
    function maybeEndOfDayBackup() {
        try {
            const key = 'aiSalonPro_v3_eodBackupDay';
            const today = new Date().toISOString().slice(0, 10);
            const last = localStorage.getItem(key) || '';
            const hour = new Date().getHours();
            // After 7pm local, snapshot once per day
            if (hour >= 19 && last !== today) {
                DataManager.createBackupSnapshot('end-of-day');
                localStorage.setItem(key, today);
                if (typeof DataManager.flushPushToServer === 'function') {
                    DataManager.flushPushToServer();
                }
            }
        } catch (e) { /* ignore */ }
    }
    window.addEventListener('beforeunload', function () { flushNow('beforeunload'); });
    window.addEventListener('pagehide', function () { flushNow('pagehide'); });
    window.addEventListener('unload', function () { flushNow('unload'); });
    try { document.addEventListener('freeze', function () { flushNow('freeze'); }); } catch (eFrz) { /* ignore */ }
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') flushNow('visibility-hidden');
        else maybeEndOfDayBackup();
    });
    // Periodic EOD check while salon stays open late
    setInterval(maybeEndOfDayBackup, 5 * 60 * 1000);
    setTimeout(maybeEndOfDayBackup, 15000);
    // Soft persist while salon is open. Keep it light so dragging/adding appointments stays snappy.
    // Full UI rebuilds / lastUpdated bumps belong on real edits — not a 5-second timer.
    setInterval(function () {
        try {
            if (!DataManager || DataManager._resetInProgress) return;
            try {
                if (typeof document !== 'undefined' && document.body && document.body.classList.contains('is-appt-dragging')) return;
            } catch (eDrag) { /* ignore */ }
            try {
                if (typeof window !== 'undefined' && typeof window.flushSyncToDM === 'function') {
                    window.flushSyncToDM();
                } else if (typeof window !== 'undefined' && typeof window.syncToDM === 'function') {
                    window.syncToDM();
                }
            } catch (eBoard) { /* ignore */ }
            try { DataManager.saveAll({ silent: true }); } catch (eSave) { /* ignore */ }
            try {
                if (typeof DataManager.flushPushToServer === 'function') {
                    DataManager.flushPushToServer();
                }
            } catch (ePush) { /* ignore */ }
            // Disk + local snapshots at most once a minute (stringify of the full salon blob is expensive)
            try {
                const lastDisk = parseInt(localStorage.getItem('aiSalonPro_v3_lastDiskSnap') || '0', 10) || 0;
                if (Date.now() - lastDisk > 60000) {
                    localStorage.setItem('aiSalonPro_v3_lastDiskSnap', String(Date.now()));
                    DataManager._pushDiskBackupSnapshot('auto-60s', {
                        createdAt: new Date().toISOString(),
                        data: DataManager.data,
                        settings: DataManager.settings
                    });
                    DataManager.createBackupSnapshot('auto-60s');
                }
            } catch (eSnap) { /* ignore */ }
        } catch (e) { /* ignore */ }
    }, 20000);
})();

// Make available globally
window.DataManager = DataManager;
window.SALON_STORAGE_KEY = SALON_STORAGE_KEY;
window.SALON_SETTINGS_KEY = SALON_SETTINGS_KEY;

/** Refresh every staff UI on this page so Admin / Manager / Scheduler / Booking stay identical. */
window.refreshSalonStaffUIs = function refreshSalonStaffUIs(detail) {
    if (window._refreshingSalonStaffUIs) return;
    window._refreshingSalonStaffUIs = true;
    try {
        try {
            if (typeof window.syncFromDM === 'function') window.syncFromDM();
        } catch (e0) { /* ignore */ }
        var fns = [
            'renderStaffTable', 'renderStaffList', 'renderStaffPageList',
            'renderSidebarStaffList', 'renderHeaderStaffList',
            'populatePinResetSelect', 'populateSelects', 'populateStaffFilter',
            'refreshApptStaffSelects',
            'populateCalendarStaffFilter', 'renderSchedulePage',
            'renderQbStaffPills', 'qbRenderStaff', 'initStaffColumns',
            'renderAppointments', 'updateStats', 'renderArchiveStats',
            'renderTeam', 'renderMeetTheTeam', 'renderWebsiteStaff'
        ];
        for (var i = 0; i < fns.length; i++) {
            try {
                var fn = window[fns[i]];
                if (typeof fn === 'function') {
                    if (fns[i] === 'renderStaffTable') {
                        var searchEl = document.getElementById('staffSearch');
                        fn(searchEl ? searchEl.value : '');
                    } else if (fns[i] === 'renderStaffPageList') {
                        fn();
                    } else {
                        fn();
                    }
                }
            } catch (e1) { /* ignore */ }
        }
        try {
            if (typeof window.initStaffColumns === 'function') {
                window.initStaffColumns();
                if (typeof window.renderAppointments === 'function') window.renderAppointments();
            }
        } catch (e2) { /* ignore */ }
        // Always re-paint the header Staff / Technicians box after role sync
        try {
            if (typeof window.renderHeaderStaffList === 'function') window.renderHeaderStaffList();
        } catch (eHdr) { /* ignore */ }
    } finally {
        window._refreshingSalonStaffUIs = false;
    }
};
