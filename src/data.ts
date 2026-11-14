export type Role = 'CUSTOMER' | 'OWNER' | 'ADMIN'
export type ListingStatus = 'APPROVED' | 'PENDING' | 'REJECTED'
export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'

export type Venue = {
  id: string
  name: string
  city: string
  state: string
  address: string
  type: string
  price: number
  pricing: 'hour' | 'day'
  capacity: number
  rating: number
  reviews: number
  image: string
  amenities: string[]
  description: string
  verified: boolean
  discount?: number
  indoor: boolean
  ownerId: string
  status: ListingStatus
}

export type Booking = {
  id: string
  venueId: string
  venueName: string
  date: string
  start: string
  end: string
  guests: number
  event: string
  customer: string
  customerEmail: string
  ownerId: string
  status: BookingStatus
  total: number
  deposit: number
  createdAt: string
  message: string
  payment?: 'SUCCEEDED' | 'FAILED'
}

export const categories = [
  { name: 'Birthday', icon: '🎂', color: 'peach' },
  { name: 'Wedding', icon: '💍', color: 'lavender' },
  { name: 'Baby Shower', icon: '🧸', color: 'mint' },
  { name: 'Corporate Event', icon: '🥂', color: 'blue' },
  { name: 'Engagement', icon: '🌷', color: 'pink' },
  { name: 'Private Party', icon: '🎉', color: 'yellow' },
  { name: 'Photoshoot', icon: '📷', color: 'lavender' },
  { name: 'Workshop', icon: '🪴', color: 'mint' },
]

export const amenities = [
  'Parking',
  'Kitchen',
  'Wi-Fi',
  'Pool',
  'Wheelchair access',
  'Outdoor space',
  'Air conditioning',
  'Tables & chairs',
  'Sound system',
  'Pet friendly',
  'Near airport',
]

const photos = {
  loft: 'photo-1519167758481-83f550bb49b3',
  garden: 'photo-1519225421980-715cb0215aed',
  modern: 'photo-1511795409834-ef04bbd61622',
  barn: 'photo-1478146896981-b80fe463b330',
  rooftop: 'photo-1519671482749-fd09be7ccebf',
  ballroom: 'photo-1464366400600-7168b8af9bc3',
  house: 'photo-1511895426328-dc8714191300',
  studio: 'photo-1497366754035-f200968a6e72',
  patio: 'photo-1507504031003-b417219a0fde',
  lake: 'photo-1500530855697-b586d89ba3ee',
  warehouse: 'photo-1497366811353-6870744d04b2',
  estate: 'photo-1519167758481-83f550bb49b3',
}
const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`

export const initialVenues: Venue[] = [
  { id: 'v1', name: 'The Glasshouse on 5th', city: 'Austin', state: 'TX', address: '501 W 5th St, Austin, TX', type: 'Modern loft', price: 180, pricing: 'hour', capacity: 80, rating: 4.9, reviews: 124, image: image(photos.loft), amenities: ['Parking', 'Kitchen', 'Wi-Fi', 'Air conditioning', 'Tables & chairs', 'Wheelchair access'], description: 'Sunlit, design-forward loft in the heart of downtown Austin. A flexible open floor plan, thoughtful furnishings and a fully equipped kitchen make hosting effortless.', verified: true, discount: 10, indoor: true, ownerId: 'owner-1', status: 'APPROVED' },
  { id: 'v2', name: 'Willow Creek Garden', city: 'Austin', state: 'TX', address: '1420 River Bend Rd, Austin, TX', type: 'Garden', price: 1250, pricing: 'day', capacity: 120, rating: 4.8, reviews: 89, image: image(photos.garden), amenities: ['Parking', 'Kitchen', 'Outdoor space', 'Tables & chairs', 'Pet friendly'], description: 'A tucked-away garden escape with oak-shaded lawns and a charming glass conservatory. A lovely setting for intimate celebrations and ceremonies.', verified: true, indoor: false, ownerId: 'owner-1', status: 'APPROVED' },
  { id: 'v3', name: 'Juniper & Stone', city: 'Austin', state: 'TX', address: '2207 E Cesar Chavez St, Austin, TX', type: 'Event studio', price: 145, pricing: 'hour', capacity: 65, rating: 4.9, reviews: 67, image: image(photos.modern), amenities: ['Parking', 'Kitchen', 'Wi-Fi', 'Air conditioning', 'Tables & chairs', 'Sound system'], description: 'A warm, textured event studio with an easy indoor-outdoor flow, a chef-ready kitchen and beautiful natural light.', verified: true, indoor: true, ownerId: 'owner-2', status: 'APPROVED' },
  { id: 'v4', name: 'The Harper House', city: 'Austin', state: 'TX', address: '1711 S Congress Ave, Austin, TX', type: 'Historic home', price: 160, pricing: 'hour', capacity: 45, rating: 4.7, reviews: 52, image: image(photos.house), amenities: ['Parking', 'Kitchen', 'Outdoor space', 'Pet friendly', 'Air conditioning'], description: 'An inviting historic home with a leafy courtyard, original details and room for the kind of gathering that feels like you.', verified: true, indoor: true, ownerId: 'owner-3', status: 'APPROVED' },
  { id: 'v5', name: 'Eastside Social Club', city: 'Austin', state: 'TX', address: '1101 E 6th St, Austin, TX', type: 'Rooftop', price: 210, pricing: 'hour', capacity: 100, rating: 4.8, reviews: 103, image: image(photos.rooftop), amenities: ['Parking', 'Wi-Fi', 'Outdoor space', 'Sound system', 'Tables & chairs'], description: 'A lively rooftop hideaway with skyline views, flexible lounge seating and an easy-to-love East Austin address.', verified: true, indoor: false, ownerId: 'owner-2', status: 'APPROVED' },
  { id: 'v6', name: 'Bluebird Barn', city: 'Dripping Springs', state: 'TX', address: '890 Ranch Road 12, Dripping Springs, TX', type: 'Barn', price: 1950, pricing: 'day', capacity: 180, rating: 4.9, reviews: 141, image: image(photos.barn), amenities: ['Parking', 'Kitchen', 'Outdoor space', 'Tables & chairs', 'Pet friendly'], description: 'A relaxed Hill Country barn surrounded by live oaks and open sky. The restored timber interior is ready for long-table dinners and joyful dance floors.', verified: true, indoor: true, ownerId: 'owner-3', status: 'APPROVED' },
  { id: 'v7', name: 'Casa Sol Courtyard', city: 'San Antonio', state: 'TX', address: '302 Madison St, San Antonio, TX', type: 'Courtyard', price: 115, pricing: 'hour', capacity: 55, rating: 4.6, reviews: 38, image: image(photos.patio), amenities: ['Parking', 'Kitchen', 'Outdoor space', 'Tables & chairs', 'Wheelchair access'], description: 'A colorful, private courtyard in the heart of downtown with a shaded patio, string lights and a beautifully restored indoor salon.', verified: true, indoor: true, ownerId: 'owner-2', status: 'APPROVED' },
  { id: 'v8', name: 'The Marigold Ballroom', city: 'Dallas', state: 'TX', address: '4212 McKinney Ave, Dallas, TX', type: 'Ballroom', price: 240, pricing: 'hour', capacity: 220, rating: 4.8, reviews: 96, image: image(photos.ballroom), amenities: ['Parking', 'Kitchen', 'Wi-Fi', 'Air conditioning', 'Tables & chairs', 'Wheelchair access'], description: 'A polished, light-filled ballroom with warm brass details, dedicated prep space and plenty of room to celebrate.', verified: true, indoor: true, ownerId: 'owner-1', status: 'APPROVED' },
  { id: 'v9', name: 'Daybreak Creative Studio', city: 'Houston', state: 'TX', address: '701 Summer St, Houston, TX', type: 'Creative studio', price: 95, pricing: 'hour', capacity: 35, rating: 4.7, reviews: 44, image: image(photos.studio), amenities: ['Parking', 'Wi-Fi', 'Air conditioning', 'Kitchen', 'Wheelchair access'], description: 'A bright, adaptable creative space for workshops, team days, intimate dinners and all the in-between ideas.', verified: true, indoor: true, ownerId: 'owner-3', status: 'APPROVED' },
  { id: 'v10', name: 'Lake Travis Lookout', city: 'Austin', state: 'TX', address: '2400 Lakeshore Dr, Austin, TX', type: 'Lake house', price: 1650, pricing: 'day', capacity: 70, rating: 4.9, reviews: 76, image: image(photos.lake), amenities: ['Parking', 'Kitchen', 'Outdoor space', 'Pool', 'Tables & chairs'], description: 'A laid-back lakefront home with sweeping water views, a generous deck and a private pool for sun-soaked gatherings.', verified: true, indoor: true, ownerId: 'owner-1', status: 'APPROVED' },
  { id: 'v11', name: 'Foundry No. 8', city: 'Dallas', state: 'TX', address: '800 Industrial Blvd, Dallas, TX', type: 'Industrial loft', price: 175, pricing: 'hour', capacity: 90, rating: 4.5, reviews: 29, image: image(photos.warehouse), amenities: ['Parking', 'Wi-Fi', 'Air conditioning', 'Sound system', 'Tables & chairs'], description: 'A character-rich warehouse space with exposed brick, high ceilings and an open floor plan for big ideas.', verified: false, indoor: true, ownerId: 'owner-2', status: 'APPROVED' },
  { id: 'v12', name: 'Magnolia Estate', city: 'Fredericksburg', state: 'TX', address: '1142 Wine Country Rd, Fredericksburg, TX', type: 'Estate', price: 2800, pricing: 'day', capacity: 160, rating: 5.0, reviews: 18, image: image(photos.estate), amenities: ['Parking', 'Kitchen', 'Outdoor space', 'Pool', 'Pet friendly'], description: 'A peaceful country estate with an expansive lawn, mature magnolias and a beautifully restored gathering house.', verified: true, indoor: true, ownerId: 'owner-3', status: 'APPROVED' },
  { id: 'v13', name: 'Cedar & Sage Studio', city: 'Austin', state: 'TX', address: '5600 Burnet Rd, Austin, TX', type: 'Event studio', price: 120, pricing: 'hour', capacity: 50, rating: 4.8, reviews: 0, image: image(photos.modern), amenities: ['Parking', 'Kitchen', 'Wi-Fi', 'Tables & chairs'], description: 'A new neighborhood studio with warm wood details and a flexible layout for life’s smaller celebrations.', verified: false, indoor: true, ownerId: 'owner-3', status: 'PENDING' },
  { id: 'v14', name: 'Old Mill Pavilion', city: 'San Antonio', state: 'TX', address: '100 Mill Creek, San Antonio, TX', type: 'Pavilion', price: 780, pricing: 'day', capacity: 100, rating: 4.2, reviews: 11, image: image(photos.patio), amenities: ['Parking', 'Outdoor space'], description: 'A covered riverside pavilion with plenty of room for community events and family get-togethers.', verified: false, indoor: false, ownerId: 'owner-2', status: 'REJECTED' },
]

export const initialBookings: Booking[] = [
  { id: 'VL-2841', venueId: 'v3', venueName: 'Juniper & Stone', date: '2026-12-12', start: '16:00', end: '20:00', guests: 42, event: 'Birthday', customer: 'Alex Morgan', customerEmail: 'alex@demo.com', ownerId: 'owner-2', status: 'PENDING', total: 734.4, deposit: 183.6, createdAt: '2026-10-24', message: 'We are planning a relaxed milestone birthday dinner. Is the patio available?' },
  { id: 'VL-1936', venueId: 'v1', venueName: 'The Glasshouse on 5th', date: '2026-11-18', start: '17:00', end: '22:00', guests: 60, event: 'Corporate Event', customer: 'Jamie Rivera', customerEmail: 'jamie@demo.com', ownerId: 'owner-1', status: 'ACCEPTED', total: 972, deposit: 243, createdAt: '2026-10-20', message: 'Team dinner and end-of-year celebration.' },
]
