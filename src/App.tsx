import { useMemo, useState } from 'react'
import {
  ArrowDownUp, ArrowRight, BadgeCheck, CalendarDays, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleHelp, Clock3, Compass, Heart, House, MapPin,
  Menu, MessageCircle, Plus, Search, ShieldCheck, SlidersHorizontal, Sparkles,
  Star, Users, X,
} from 'lucide-react'
import { amenities, categories, initialBookings, initialVenues, type Booking, type Role, type Venue } from './data'
import './App.css'

type Page = 'home' | 'explore' | 'planner' | 'saved' | 'compare' | 'customer' | 'owner' | 'admin'
type SearchForm = { city: string; event: string; guests: string; budget: string; space: '' | 'indoor' | 'outdoor'; required: string[] }
const blankSearch: SearchForm = { city: '', event: '', guests: '', budget: '', space: '', required: [] }
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
const DEMO_TODAY = new Date().toISOString().slice(0, 10)
const readStored = <T,>(key: string, fallback: T): T => {
  const value = localStorage.getItem(`venue-lookup-${key}`)
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const [role, setRole] = useState<Role>(() => readStored<Role>('role', 'CUSTOMER'))
  const [venues, setVenues] = useState<Venue[]>(() => readStored('venues', initialVenues))
  const [bookings, setBookings] = useState<Booking[]>(() => readStored('bookings', initialBookings))
  const [saved, setSaved] = useState<string[]>(() => readStored('saved', ['v2', 'v3']))
  const [compared, setCompared] = useState<string[]>(() => readStored('compared', []))
  const [query, setQuery] = useState<SearchForm>(blankSearch)
  const [draft, setDraft] = useState<SearchForm>(blankSearch)
  const [sort, setSort] = useState('recommended')
  const [plannerText, setPlannerText] = useState('')
  const [plannerParsed, setPlannerParsed] = useState(false)
  const [detail, setDetail] = useState<Venue | null>(null)
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [listingOpen, setListingOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [bookingMessage, setBookingMessage] = useState('')

  const persist = <T,>(key: string, value: T, setter: (next: T) => void) => {
    setter(value)
    localStorage.setItem(`venue-lookup-${key}`, JSON.stringify(value))
  }
  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3000)
  }
  const approved = venues.filter((venue) => venue.status === 'APPROVED')
  const visibleVenues = useMemo(() => {
    const filtered = approved.filter((venue) => {
      const cityMatches = !query.city || `${venue.city} ${venue.state}`.toLowerCase().includes(query.city.toLowerCase())
      const guestsMatch = !query.guests || venue.capacity >= Number(query.guests)
      const budgetMatch = !query.budget || (venue.pricing === 'day' ? venue.price <= Number(query.budget) : venue.price * 4 <= Number(query.budget))
      const amenitiesMatch = query.required.every((name) => venue.amenities.includes(name))
      const spaceMatches = !query.space || (query.space === 'indoor' ? venue.indoor : !venue.indoor)
      const eventMatches = !query.event || (
        query.event === 'Wedding' ? venue.capacity >= 40 && venue.amenities.includes('Parking') :
        query.event === 'Corporate Event' ? venue.amenities.includes('Wi-Fi') :
        query.event === 'Workshop' ? venue.amenities.includes('Wi-Fi') :
        query.event === 'Photoshoot' ? /studio|loft|garden|estate|creative/i.test(venue.type) || venue.amenities.includes('Outdoor space') :
        true
      )
      return cityMatches && guestsMatch && budgetMatch && amenitiesMatch && spaceMatches && eventMatches
    })
    if (sort === 'price-low') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'price-high') return [...filtered].sort((a, b) => b.price - a.price)
    if (sort === 'rating') return [...filtered].sort((a, b) => b.rating - a.rating)
    return [...filtered].sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating)
  }, [approved, query, sort])
  const compareVenues = compared.map((id) => venues.find((venue) => venue.id === id)).filter((venue): venue is Venue => Boolean(venue))

  const navigate = (next: Page) => {
    setPage(next)
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const runSearch = (event?: React.FormEvent) => {
    event?.preventDefault()
    setQuery(draft)
    setPage('explore')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const toggleRequired = (name: string) => {
    setDraft((current) => ({ ...current, required: current.required.includes(name) ? current.required.filter((item) => item !== name) : [...current.required, name] }))
  }
  const toggleSaved = (venue: Venue) => {
    const next = saved.includes(venue.id) ? saved.filter((id) => id !== venue.id) : [...saved, venue.id]
    persist('saved', next, setSaved)
    notify(next.includes(venue.id) ? 'Saved to your favorites' : 'Removed from saved venues')
  }
  const toggleCompared = (venue: Venue) => {
    if (compared.includes(venue.id)) {
      persist('compared', compared.filter((id) => id !== venue.id), setCompared)
      notify('Removed from your comparison')
    } else if (compared.length >= 3) {
      notify('Compare up to three venues at a time')
    } else {
      persist('compared', [...compared, venue.id], setCompared)
      notify('Added to your comparison')
    }
  }
  const clearComparison = () => persist('compared', [], setCompared)
  const searchByEvent = (event: string) => {
    const next = { ...blankSearch, event }
    setDraft(next)
    setQuery(next)
    navigate('explore')
  }
  const parsePlanner = () => {
    const text = plannerText.toLowerCase()
    const event = categories.map((item) => item.name).find((item) => text.includes(item.toLowerCase())) ?? ''
    const city = ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Dripping Springs', 'Fredericksburg'].find((item) => text.includes(item.toLowerCase())) ?? ''
    const guestMatch = text.match(/(\d{1,3})\s*(?:guests?|people|attendees|persons?)/)
    const budgetMatch = text.match(/(?:under|below|less than|max(?:imum)?(?: of)?|budget(?: of)?|up to)\s*\$?\s*([\d,]+)/)
    const required = amenities.filter((item) => {
      const aliases: Record<string, string[]> = { 'Tables & chairs': ['tables', 'chairs'], 'Outdoor space': ['outdoor', 'outside'], 'Wheelchair access': ['wheelchair', 'accessible'] }
      return (aliases[item] ?? [item.toLowerCase()]).some((term) => text.includes(term.toLowerCase()))
    })
    const space: SearchForm['space'] = text.includes('indoor') ? 'indoor' : text.includes('outdoor') ? 'outdoor' : ''
    const next = { ...blankSearch, event, city, guests: guestMatch?.[1] ?? '', budget: budgetMatch?.[1].replaceAll(',', '') ?? '', space, required }
    setDraft(next)
    setQuery(next)
    setPlannerParsed(true)
    if (!event && !city && !guestMatch && !budgetMatch && !required.length) {
      notify('Add a city, event type, guest count, budget, or amenity to get started')
      return
    }
    setPage('planner')
    notify('Preferences extracted. Adjust them below or view your matches.')
  }
  const estimate = (venue: Venue, start: string, end: string) => {
    const hours = Math.max(1, (Number(end.split(':')[0]) - Number(start.split(':')[0])) + (Number(end.split(':')[1]) - Number(start.split(':')[1])) / 60)
    const base = venue.pricing === 'day' ? venue.price : Math.round(venue.price * hours)
    const cleaning = 85
    const service = Math.round(base * 0.08)
    const discount = venue.discount ? Math.round(base * venue.discount / 100) : 0
    return { base, cleaning, service, discount, total: base + cleaning + service - discount }
  }
  const submitBooking = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!bookingVenue) return
    const form = new FormData(event.currentTarget)
    const date = String(form.get('date'))
    const start = String(form.get('start'))
    const end = String(form.get('end'))
    const guests = Number(form.get('guests'))
    const eventName = String(form.get('event'))
    if (!date || date < new Date().toISOString().slice(0, 10)) { notify('Choose a date that is today or later'); return }
    if (end <= start) { notify('End time must be after start time'); return }
    if (!Number.isInteger(guests) || guests < 1 || guests > bookingVenue.capacity) { notify(`Guest count must be between 1 and ${bookingVenue.capacity}`); return }
    const pricing = estimate(bookingVenue, start, end)
    const booking: Booking = {
      id: `VL-${Math.floor(1000 + Math.random() * 9000)}`, venueId: bookingVenue.id, venueName: bookingVenue.name,
      date, start, end, guests, event: eventName, customer: role === 'CUSTOMER' ? 'Alex Morgan' : 'Demo Customer',
      customerEmail: 'alex@demo.com', ownerId: bookingVenue.ownerId, status: 'PENDING', total: pricing.total,
      deposit: Math.round(pricing.total * 0.25), createdAt: new Date().toISOString().slice(0, 10), message: bookingMessage,
    }
    persist('bookings', [booking, ...bookings], setBookings)
    setBookingVenue(null)
    setBookingMessage('')
    setDetail(null)
    notify(`Booking request ${booking.id} sent to the venue owner`)
    navigate('customer')
  }
  const updateBooking = (id: string, status: Booking['status']) => {
    persist('bookings', bookings.map((booking) => booking.id === id ? { ...booking, status } : booking), setBookings)
    notify(`Booking ${status.toLowerCase()}`)
  }
  const updateListing = (id: string, status: Venue['status']) => {
    persist('venues', venues.map((venue) => venue.id === id ? { ...venue, status } : venue), setVenues)
    notify(status === 'APPROVED' ? 'Listing approved and now visible in search' : 'Listing status updated')
  }
  const simulatePayment = (id: string, successful: boolean) => {
    const payment: Booking['payment'] = successful ? 'SUCCEEDED' : 'FAILED'
    persist('bookings', bookings.map((booking) => booking.id === id ? { ...booking, payment } : booking), setBookings)
    notify(successful ? 'Demo deposit paid — no real money was charged' : 'Demo payment failed. You can try again.')
  }
  const createListing = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const next: Venue = {
      id: `v${Date.now()}`, name: String(form.get('name')), city: String(form.get('city')), state: String(form.get('state')).toUpperCase(),
      address: String(form.get('address')), type: String(form.get('type')), price: Number(form.get('price')), pricing: 'hour',
      capacity: Number(form.get('capacity')), rating: 0, reviews: 0, image: `https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85`,
      amenities: ['Parking', 'Wi-Fi'], description: String(form.get('description')), verified: false, indoor: true, ownerId: 'owner-1', status: 'PENDING',
    }
    persist('venues', [next, ...venues], setVenues)
    setListingOpen(false)
    notify('Listing submitted for administrator approval')
  }
  const setRoleAndClose = (next: Role) => {
    setRole(next)
    localStorage.setItem('venue-lookup-role', JSON.stringify(next))
    setLoginOpen(false)
    notify(`Demo account switched to ${next.toLowerCase()}`)
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => navigate('home')} aria-label="VenueLookup home"><span className="brand-mark"><House size={19} strokeWidth={2.5} /></span><span>venue<span className="brand-light">lookup</span></span></button>
        <nav className={mobileMenu ? 'main-nav is-open' : 'main-nav'}>
          <button className={page === 'explore' ? 'nav-active' : ''} onClick={() => navigate('explore')}>Explore</button>
          <button className={page === 'planner' ? 'nav-active' : ''} onClick={() => navigate('planner')}><Sparkles size={15} /> AI planner</button>
          <button className={page === 'saved' ? 'nav-active' : ''} onClick={() => navigate('saved')}>Saved</button>
          <button className={page === 'compare' ? 'nav-active' : ''} onClick={() => navigate('compare')}>Compare {compared.length > 0 && <span className="nav-count">{compared.length}</span>}</button>
          <button className={['customer', 'owner', 'admin'].includes(page) ? 'nav-active' : ''} onClick={() => navigate(role === 'ADMIN' ? 'admin' : role === 'OWNER' ? 'owner' : 'customer')}>Dashboard</button>
        </nav>
        <div className="header-actions">
          <button className="list-link" onClick={() => role === 'OWNER' ? navigate('owner') : setLoginOpen(true)}>List your space</button>
          <button className="account-button" onClick={() => setLoginOpen(true)}><span className="avatar">{role === 'ADMIN' ? 'A' : role === 'OWNER' ? 'J' : 'M'}</span><span className="account-role">{role === 'ADMIN' ? 'Admin' : role === 'OWNER' ? 'Jordan' : 'Alex'}</span><ChevronDown size={15} /></button>
          <button className="mobile-menu" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        {page === 'home' && <HomePage draft={draft} setDraft={setDraft} runSearch={runSearch} searchByEvent={searchByEvent} venues={approved} openDetail={setDetail} toggleSaved={toggleSaved} saved={saved} navigate={navigate} plannerText={plannerText} setPlannerText={setPlannerText} parsePlanner={parsePlanner} />}
        {page === 'explore' && <ExplorePage query={query} setQuery={setQuery} visibleVenues={visibleVenues} count={approved.length} sort={sort} setSort={setSort} openDetail={setDetail} toggleSaved={toggleSaved} saved={saved} compared={compared} toggleRequired={toggleRequired} clear={() => { setQuery(blankSearch); setDraft(blankSearch) }} />}
        {page === 'planner' && <PlannerPage text={plannerText} setText={setPlannerText} parsed={plannerParsed} parse={parsePlanner} query={query} setQuery={setQuery} matches={visibleVenues} openDetail={setDetail} toggleSaved={toggleSaved} saved={saved} />}
        {page === 'saved' && <SavedPage venues={venues.filter((venue) => saved.includes(venue.id))} openDetail={setDetail} toggleSaved={toggleSaved} />}
        {page === 'compare' && <ComparePage venues={compareVenues} toggleCompared={toggleCompared} clearComparison={clearComparison} openDetail={setDetail} />}
        {page === 'customer' && <CustomerPage bookings={bookings} updateBooking={updateBooking} simulatePayment={simulatePayment} openDetail={(id) => setDetail(venues.find((venue) => venue.id === id) ?? null)} savedCount={saved.length} />}
        {page === 'owner' && <OwnerPage bookings={bookings} venues={venues} updateBooking={updateBooking} openListing={() => setListingOpen(true)} role={role} switchRole={() => setLoginOpen(true)} />}
        {page === 'admin' && <AdminPage venues={venues} bookings={bookings} updateListing={updateListing} />}
      </main>
      <Footer navigate={navigate} />

      {detail && <VenueDetail venue={detail} close={() => setDetail(null)} saved={saved.includes(detail.id)} toggleSaved={() => toggleSaved(detail)} compared={compared.includes(detail.id)} toggleCompared={() => toggleCompared(detail)} book={() => { setDetail(null); setBookingVenue(detail) }} contact={() => notify('Messaging is not included in this offline prototype.')} estimate={estimate} />}
      {bookingVenue && <Modal title="Request to book" close={() => setBookingVenue(null)} wide><BookingForm venue={bookingVenue} submit={submitBooking} message={bookingMessage} setMessage={setBookingMessage} estimate={estimate} /></Modal>}
      {loginOpen && <Modal title="Choose a demo role" close={() => setLoginOpen(false)}><p className="modal-intro">Switch between sample accounts to explore the customer, venue owner, and admin experiences.</p><div className="role-options">{([
        ['CUSTOMER', 'Event planner', 'alex@demo.com', 'Find and book venues'],
        ['OWNER', 'Venue owner', 'jordan@demo.com', 'Manage your space and requests'],
        ['ADMIN', 'Platform admin', 'admin@demo.com', 'Review listings and activity'],
      ] as const).map(([key, title, email, description]) => <button key={key} className={`role-option ${role === key ? 'selected' : ''}`} onClick={() => setRoleAndClose(key)}><span className="role-avatar">{title[0]}</span><span><b>{title}</b><small>{email} · {description}</small></span>{role === key && <Check size={18} />}</button>)}</div><div className="demo-note"><ShieldCheck size={16} /> Demo mode only — no password or real account required.</div></Modal>}
      {listingOpen && <Modal title="Create a venue listing" close={() => setListingOpen(false)} wide><form className="form-grid" onSubmit={createListing}><label>Venue name<input name="name" required placeholder="e.g. Cedar House Studio" /></label><label>Venue type<input name="type" required placeholder="Garden, loft, studio…" /></label><label>City<input name="city" required placeholder="Austin" /></label><label>State<input name="state" required maxLength={2} placeholder="TX" /></label><label>Street address<input name="address" required placeholder="123 Main Street" /></label><label>Hourly price<input name="price" type="number" min="1" required placeholder="125" /></label><label>Guest capacity<input name="capacity" type="number" min="1" required placeholder="60" /></label><label className="field-wide">Description<textarea name="description" rows={3} required placeholder="Tell guests what makes your venue special…" /></label><div className="field-wide form-note">New listings are submitted as pending and stay hidden until approved by an administrator.</div><button className="button-primary field-wide" type="submit">Submit for approval <ArrowRight size={16} /></button></form></Modal>}
      {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  )
}

function HomePage({ draft, setDraft, runSearch, searchByEvent, venues, openDetail, toggleSaved, saved, navigate, plannerText, setPlannerText, parsePlanner }: {
  draft: SearchForm; setDraft: React.Dispatch<React.SetStateAction<SearchForm>>; runSearch: (event?: React.FormEvent) => void;
  searchByEvent: (event: string) => void; venues: Venue[]; openDetail: (venue: Venue) => void; toggleSaved: (venue: Venue) => void;
  saved: string[]; navigate: (page: Page) => void; plannerText: string; setPlannerText: (value: string) => void; parsePlanner: () => void
}) {
  return <div>
    <section className="hero-section">
      <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> A better kind of gathering starts here</div><h1>Make room for<br /><em>something special.</em></h1><p>Thoughtful spaces for the moments that bring us together. Find your place to celebrate.</p>
        <form className="hero-search" onSubmit={runSearch}><label className="search-field location-field"><MapPin size={19} /><span><small>LOCATION</small><input aria-label="Location" placeholder="City or neighborhood" value={draft.city} onChange={(event) => setDraft((value) => ({ ...value, city: event.target.value }))} /></span></label><span className="search-divider" /><label className="search-field"><CalendarDays size={19} /><span><small>OCCASION</small><select aria-label="Event type" value={draft.event} onChange={(event) => setDraft((value) => ({ ...value, event: event.target.value }))}><option value="">Any occasion</option>{categories.map((category) => <option key={category.name}>{category.name}</option>)}</select></span></label><button className="search-submit" type="submit"><Search size={19} /><span>Find a space</span></button></form>
        <div className="hero-ai"><Sparkles size={17} /><input value={plannerText} onChange={(event) => setPlannerText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); parsePlanner() } }} placeholder="Or describe your event and let us find the fit…" /><button onClick={parsePlanner} aria-label="Plan with AI"><ArrowRight size={18} /></button></div>
        <button className="ai-text-link" onClick={() => navigate('planner')}>Try the AI event planner <ArrowRight size={14} /></button>
      </div>
      <div className="hero-visual"><img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=90" alt="Elegant sunlit event venue set for a celebration" /><div className="hero-caption"><span className="caption-stars"><Star size={15} fill="currentColor" /> 4.9</span><span><b>The Glasshouse on 5th</b><small>Austin, Texas · from $180/hr</small></span><span className="caption-heart"><Heart size={17} /></span></div><div className="floating-note"><span className="floating-check"><Check size={15} /></span><span><b>Your kind of place</b><small>Matched to your moment</small></span></div><span className="visual-count">Curated spaces <b>01 — 14</b></span></div>
    </section>
    <section className="section-wrap category-section"><div className="section-heading"><div><div className="eyebrow">A PLACE FOR EVERY OCCASION</div><h2>What are we celebrating?</h2></div><button className="text-button" onClick={() => navigate('explore')}>Explore all spaces <ArrowRight size={16} /></button></div><div className="category-grid">{categories.map((category) => <button key={category.name} className="category-tile" onClick={() => searchByEvent(category.name)}><span className={`category-icon ${category.color}`}>{category.icon}</span><span>{category.name}</span><ArrowRight size={15} className="category-arrow" /></button>)}</div></section>
    <section className="featured-section"><div className="section-wrap"><div className="section-heading"><div><div className="eyebrow">THE GOOD PLACES</div><h2>Spaces worth gathering for</h2><p className="section-subtitle">A few local favorites, chosen with care.</p></div><button className="text-button" onClick={() => navigate('explore')}>See all venues <ArrowRight size={16} /></button></div><VenueGrid venues={venues.slice(0, 4)} openDetail={openDetail} toggleSaved={toggleSaved} saved={saved} /></div></section>
    <section className="story-section section-wrap"><div className="story-image"><img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1100&q=85" alt="Friends celebrating around a beautifully styled dinner table" /></div><div className="story-copy"><div className="eyebrow">GOOD GATHERINGS, MADE SIMPLE</div><h2>Less searching.<br /><em>More celebrating.</em></h2><p>Finding the right place shouldn’t be the hard part. We bring beautiful local venues, clear pricing and the details that matter into one easy search.</p><div className="story-points"><span><CheckCircle2 size={17} /> Real spaces, thoughtfully selected</span><span><CheckCircle2 size={17} /> Clear pricing before you enquire</span><span><CheckCircle2 size={17} /> A real person behind every place</span></div><button className="button-dark" onClick={() => navigate('explore')}>Find your space <ArrowRight size={16} /></button></div></section>
    <section className="owner-banner"><div><div className="eyebrow">FOR THE PEOPLE WHO HOST</div><h2>Have a space people<br />would love to gather in?</h2><p>Meet your next guests. List your venue for free.</p></div><button className="button-light" onClick={() => navigate('owner')}>Become a host <ArrowRight size={16} /></button><div className="banner-decoration">gather<br />well</div></section>
    <section className="section-wrap quote-section"><div className="quote-mark">“</div><blockquote>We found a space that felt like <em>us</em> within an afternoon. The whole experience was thoughtful from the first click to the last toast.</blockquote><div className="quote-credit"><span className="mini-avatar">JM</span><span><b>Jamie M.</b><small>Austin, Texas · booked The Glasshouse</small></span></div><div className="quote-demo">Illustrative demo testimonial</div></section>
  </div>
}

function VenueGrid({ venues, openDetail, toggleSaved, saved, compact = false }: { venues: Venue[]; openDetail: (venue: Venue) => void; toggleSaved: (venue: Venue) => void; saved: string[]; compact?: boolean }) {
  if (!venues.length) return <div className="empty-state"><div className="empty-icon"><Search /></div><h3>No spaces found</h3><p>Try widening your search or removing a filter.</p></div>
  return <div className={`venue-grid ${compact ? 'compact-grid' : ''}`}>{venues.map((venue) => <article className="venue-card" key={venue.id}><button className="venue-image" onClick={() => openDetail(venue)} aria-label={`View ${venue.name}`}><img src={venue.image} alt={venue.name} loading="lazy" />{venue.discount && <span className="discount-tag">{venue.discount}% off</span>}<span className="image-count">↗ View space</span></button><button className={`save-button ${saved.includes(venue.id) ? 'is-saved' : ''}`} onClick={() => toggleSaved(venue)} aria-label={saved.includes(venue.id) ? 'Remove saved venue' : 'Save venue'}><Heart size={17} fill={saved.includes(venue.id) ? 'currentColor' : 'none'} /></button><button className="venue-info" onClick={() => openDetail(venue)}><span className="venue-title-row"><b>{venue.name}</b><span><Star size={14} fill="currentColor" /> {venue.rating.toFixed(1)}</span></span><span className="venue-location">{venue.city}, {venue.state} <span>·</span> {venue.type}</span><span className="venue-meta"><span><Users size={14} /> Up to {venue.capacity}</span><span>{venue.verified && <><BadgeCheck size={14} /> Verified</>}</span></span><span className="venue-price"><b>{money(venue.price)}</b> / {venue.pricing}{venue.discount && <span className="price-discount"> · {venue.discount}% off</span>}</span></button></article>)}</div>
}

function ExplorePage({ query, setQuery, visibleVenues, count, sort, setSort, openDetail, toggleSaved, saved, compared, toggleRequired, clear }: {
  query: SearchForm; setQuery: React.Dispatch<React.SetStateAction<SearchForm>>; visibleVenues: Venue[]; count: number;
  sort: string; setSort: (value: string) => void; openDetail: (venue: Venue) => void; toggleSaved: (venue: Venue) => void;
  saved: string[]; compared: string[]; toggleRequired: (name: string) => void; clear: () => void
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  return <section className="page-wrap"><div className="page-eyebrow"><Compass size={15} /> YOUR NEXT GOOD PLACE</div><div className="page-heading-row"><div><h1>Find your kind of space.</h1><p>Spaces for the moments you’ll remember.</p></div><button className="button-outline mobile-filter" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16} /> Filters</button></div><form className="discovery-search" onSubmit={(event) => event.preventDefault()}><label><MapPin size={17} /><span><small>WHERE</small><input placeholder="City or neighborhood" value={query.city} onChange={(event) => setQuery((value) => ({ ...value, city: event.target.value }))} /></span></label><label><CalendarDays size={17} /><span><small>OCCASION</small><select value={query.event} onChange={(event) => setQuery((value) => ({ ...value, event: event.target.value }))}><option value="">Any occasion</option>{categories.map((category) => <option key={category.name}>{category.name}</option>)}</select></span></label><label><Users size={17} /><span><small>GUESTS</small><input type="number" min="1" placeholder="Any size" value={query.guests} onChange={(event) => setQuery((value) => ({ ...value, guests: event.target.value }))} /></span></label><label><span className="dollar-icon">$</span><span><small>MAX BUDGET</small><input type="number" min="1" placeholder="No limit" value={query.budget} onChange={(event) => setQuery((value) => ({ ...value, budget: event.target.value }))} /></span></label><button type="button" className="search-submit" onClick={() => setQuery((value) => ({ ...value }))}><Search size={17} /> Search</button></form>
    <div className={`explore-layout ${filtersOpen ? 'filters-open' : ''}`}><aside className="filter-panel"><div className="filter-heading"><b>Refine your search</b><button onClick={clear}>Clear all</button></div><div className="filter-group"><b>Guest capacity</b><div className="select-shell"><Users size={15} /><input type="number" min="1" placeholder="Minimum guests" value={query.guests} onChange={(event) => setQuery((value) => ({ ...value, guests: event.target.value }))} /></div></div><div className="filter-group"><b>Budget per booking</b><div className="select-shell"><span>$</span><input type="number" min="1" placeholder="Maximum budget" value={query.budget} onChange={(event) => setQuery((value) => ({ ...value, budget: event.target.value }))} /></div></div><div className="filter-group"><b>Must-have amenities</b><div className="check-list">{amenities.slice(0, 8).map((name) => <label key={name}><input type="checkbox" checked={query.required.includes(name)} onChange={() => toggleRequired(name)} /><span className="check-custom" />{name}</label>)}</div></div><div className="map-preview"><div className="map-grid"><span className="map-road road-a" /><span className="map-road road-b" /><span className="map-road road-c" /><span className="map-pin pin-a"><MapPin size={17} fill="currentColor" /></span><span className="map-pin pin-b"><MapPin size={17} fill="currentColor" /></span><span className="map-pin pin-c"><MapPin size={17} fill="currentColor" /></span></div><span className="map-caption"><MapPin size={12} /> Austin area · demo map</span></div></aside>
      <div className="results-panel"><div className="results-toolbar"><div><b>{visibleVenues.length} spaces</b><span> {visibleVenues.length !== count ? 'matching your search' : 'to make it memorable'}</span></div><label className="sort-control"><ArrowDownUp size={14} /><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select></label></div>{(query.city || query.event || query.guests || query.budget || query.required.length > 0) && <div className="active-filters">{query.city && <button onClick={() => setQuery((value) => ({ ...value, city: '' }))}>{query.city}<X size={12} /></button>}{query.event && <button onClick={() => setQuery((value) => ({ ...value, event: '' }))}>{query.event}<X size={12} /></button>}{query.required.map((item) => <button key={item} onClick={() => toggleRequired(item)}>{item}<X size={12} /></button>)}</div>}<VenueGrid venues={visibleVenues} openDetail={openDetail} toggleSaved={toggleSaved} saved={saved} compact /><div className="results-footer">Showing {visibleVenues.length} of {count} handpicked spaces <span>•</span> <button onClick={clear}>Reset search</button></div>{visibleVenues.length > 0 && <div className="compare-bar">Compare spaces ({compared.length}/3) <span>Select the scales on venue details to add to your comparison.</span></div>}</div></div>
  </section>
}

function PlannerPage({ text, setText, parsed, parse, query, setQuery, matches, openDetail, toggleSaved, saved }: {
  text: string; setText: (value: string) => void; parsed: boolean; parse: () => void; query: SearchForm;
  setQuery: React.Dispatch<React.SetStateAction<SearchForm>>; matches: Venue[]; openDetail: (venue: Venue) => void;
  toggleSaved: (venue: Venue) => void; saved: string[]
}) {
  const matchScore = (venue: Venue) => {
    let score = 55
    if (!query.city || `${venue.city} ${venue.state}`.toLowerCase().includes(query.city.toLowerCase())) score += 12
    if (!query.guests || venue.capacity >= Number(query.guests)) score += 12
    if (!query.budget || (venue.pricing === 'day' ? venue.price <= Number(query.budget) : venue.price * 4 <= Number(query.budget))) score += 10
    score += Math.min(11, query.required.filter((item) => venue.amenities.includes(item)).length * 4)
    return Math.min(99, score)
  }
  return (
    <section className="planner-page">
      <div className="planner-intro">
        <div className="eyebrow"><Sparkles size={15} /> YOUR VERY OWN EVENT CO-PILOT</div>
        <h1>Tell us what you’re<br /><em>dreaming up.</em></h1>
        <p>A few details are all we need to find spaces that feel just right.</p>
      </div>
      <div className="planner-box">
        <div className="planner-box-header"><span className="planner-icon"><Sparkles size={18} /></span><span><b>Describe your gathering</b><small>Our offline demo planner finds the details you mention.</small></span><span className="demo-pill">DEMO PLANNER</span></div>
        <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="I’m hosting a baby shower for 60 guests in Austin. I need an indoor venue with parking and a kitchen, under $900." rows={4} />
        <div className="planner-box-footer"><span>Try: “Birthday for 40 in Austin, under $700, with parking”</span><button className="button-primary" onClick={parse}><Sparkles size={16} /> Find my space <ArrowRight size={15} /></button></div>
      </div>
      {parsed && <>
        <div className="preferences-panel">
          <div><div className="eyebrow">WHAT WE PICKED UP</div><h2>Your event, in a nutshell.</h2><p>Edit any detail before exploring recommendations.</p></div>
          <div className="preferences-grid">
            <label>City<input value={query.city} onChange={(event) => setQuery((value) => ({ ...value, city: event.target.value }))} placeholder="Any city" /></label>
            <label>Occasion<select value={query.event} onChange={(event) => setQuery((value) => ({ ...value, event: event.target.value }))}><option value="">Choose one</option>{categories.map((category) => <option key={category.name}>{category.name}</option>)}</select></label>
            <label>Guests<input type="number" value={query.guests} onChange={(event) => setQuery((value) => ({ ...value, guests: event.target.value }))} placeholder="Any number" /></label>
            <label>Maximum budget<input type="number" value={query.budget} onChange={(event) => setQuery((value) => ({ ...value, budget: event.target.value }))} placeholder="No limit" /></label>
            <label>Space<select value={query.space} onChange={(event) => setQuery((value) => ({ ...value, space: event.target.value as SearchForm['space'] }))}><option value="">Indoor or outdoor</option><option value="indoor">Indoor only</option><option value="outdoor">Outdoor only</option></select></label>
          </div>
          <div className="planner-amenities"><b>Must-haves</b>{amenities.slice(0, 8).map((name) => <label key={name}><input type="checkbox" checked={query.required.includes(name)} onChange={() => setQuery((value) => ({ ...value, required: value.required.includes(name) ? value.required.filter((item) => item !== name) : [...value.required, name] }))} />{name}</label>)}</div>
        </div>
        <div className="recommendations-heading"><div><div className="eyebrow">THOUGHTFUL MATCHES</div><h2>Your spaces to consider</h2></div><span>Ranked from real venue details · {matches.length} matches</span></div>
        {matches.length ? <div className="recommendations-list">{matches.map((venue) => <article className="recommendation-card" key={venue.id}>
          <button className="recommendation-image" onClick={() => openDetail(venue)}><img src={venue.image} alt={venue.name} /></button>
          <div className="recommendation-info"><span className="match-label"><Sparkles size={13} /> {matchScore(venue)}% match</span><h3>{venue.name}</h3><p><MapPin size={13} /> {venue.city}, {venue.state} · {venue.type}</p>
            <div className="match-reasons">{[query.city && `${venue.city} location`, venue.capacity >= Number(query.guests || 0) && 'Guest capacity fits', query.space && `${query.space} space`, ...query.required.filter((item) => venue.amenities.includes(item))].filter(Boolean).slice(0, 3).map((reason) => <span key={String(reason)}><Check size={12} /> {reason}</span>)}</div>
          </div>
          <div className="recommendation-price"><span><Star size={14} fill="currentColor" /> {venue.rating}</span><b>{money(venue.price)}<small> / {venue.pricing}</small></b><button className="button-outline" onClick={() => openDetail(venue)}>View space</button></div>
          <button className={`recommendation-save ${saved.includes(venue.id) ? 'is-saved' : ''}`} onClick={() => toggleSaved(venue)} aria-label={saved.includes(venue.id) ? 'Remove saved space' : 'Save space'}><Heart size={16} fill={saved.includes(venue.id) ? 'currentColor' : 'none'} /></button>
        </article>)}</div> : <div className="empty-state"><div className="empty-icon"><Search /></div><h3>No exact matches, just yet</h3><p>Try removing a must-have or increasing your budget to see more venues.</p></div>}
      </>}
      <div className="planner-disclaimer"><CircleHelp size={15} /> This offline prototype uses a deterministic keyword simulator — no AI model is connected. Match explanations reflect seeded venue details.</div>
    </section>
  )
}

function SavedPage({ venues, openDetail, toggleSaved }: { venues: Venue[]; openDetail: (venue: Venue) => void; toggleSaved: (venue: Venue) => void }) {
  return <section className="page-wrap"><div className="page-eyebrow"><Heart size={15} /> YOUR LITTLE SHORTLIST</div><div className="page-heading-row"><div><h1>Spaces you’ve saved.</h1><p>All the possibilities you’d like to come back to.</p></div><span className="saved-count">{venues.length} saved {venues.length === 1 ? 'space' : 'spaces'}</span></div><VenueGrid venues={venues} openDetail={openDetail} toggleSaved={toggleSaved} saved={venues.map((venue) => venue.id)} /></section>
}

function ComparePage({ venues, toggleCompared, clearComparison, openDetail }: { venues: Venue[]; toggleCompared: (venue: Venue) => void; clearComparison: () => void; openDetail: (venue: Venue) => void }) {
  if (!venues.length) return <section className="page-wrap"><div className="page-eyebrow"><SlidersHorizontal size={15} /> SIDE BY SIDE</div><div className="page-heading-row"><div><h1>Find the one that fits.</h1><p>Compare the details that matter to your gathering.</p></div></div><div className="empty-state compare-empty"><div className="empty-icon"><SlidersHorizontal /></div><h3>Your comparison is ready when you are</h3><p>Open any venue and choose “Add to compare” to compare up to three spaces side by side.</p></div></section>
  return <section className="page-wrap"><div className="page-eyebrow"><SlidersHorizontal size={15} /> SIDE BY SIDE</div><div className="page-heading-row"><div><h1>Find the one that fits.</h1><p>Compare the details that matter to your gathering.</p></div><button className="text-button" onClick={clearComparison}>Clear comparison <X size={15} /></button></div><div className="comparison-grid" style={{ gridTemplateColumns: `repeat(${venues.length}, minmax(0, 1fr))` }}>{venues.map((venue) => <article className="compare-column" key={venue.id}><button className="compare-image" onClick={() => openDetail(venue)}><img src={venue.image} alt={venue.name} /></button><div className="compare-name"><span>{venue.type}</span><h3>{venue.name}</h3><p><MapPin size={13} /> {venue.city}, {venue.state}</p></div><div className="compare-row"><span>Starting price</span><b>{money(venue.price)} / {venue.pricing}</b></div><div className="compare-row"><span>Guest capacity</span><b>Up to {venue.capacity}</b></div><div className="compare-row"><span>Guest rating</span><b><Star size={14} fill="currentColor" /> {venue.rating.toFixed(1)} ({venue.reviews})</b></div><div className="compare-row"><span>Owner verification</span><b>{venue.verified ? <><BadgeCheck size={14} /> Verified</> : 'Not verified'}</b></div><div className="compare-amenities"><span>Amenities</span><div>{venue.amenities.map((item) => <small key={item} className={item === 'Parking' || item === 'Kitchen' ? 'amenity-highlight' : ''}>{item}</small>)}</div></div><button className="button-outline compare-view" onClick={() => openDetail(venue)}>View space <ArrowRight size={15} /></button><button className="remove-compare" onClick={() => toggleCompared(venue)}>Remove</button></article>)}</div></section>
}

function CustomerPage({ bookings, updateBooking, simulatePayment, openDetail, savedCount }: { bookings: Booking[]; updateBooking: (id: string, status: Booking['status']) => void; simulatePayment: (id: string, successful: boolean) => void; openDetail: (id: string) => void; savedCount: number }) {
  const myBookings = bookings.filter((booking) => booking.customerEmail === 'alex@demo.com')
  return <section className="dashboard-wrap"><div className="dashboard-welcome"><div className="eyebrow">YOUR GATHERINGS, ALL IN ONE PLACE</div><h1>Good to see you, Alex.</h1><p>Here’s what’s happening with your plans.</p><span className="dashboard-avatar">AM</span></div><div className="stat-grid"><div className="stat-card"><span>Upcoming bookings</span><b>{myBookings.filter((booking) => ['ACCEPTED', 'PENDING'].includes(booking.status)).length}</b><small>In the making</small></div><div className="stat-card"><span>Waiting for a reply</span><b>{myBookings.filter((booking) => booking.status === 'PENDING').length}</b><small>We’ll keep you posted</small></div><div className="stat-card"><span>Saved spaces</span><b>{savedCount}</b><small>Your shortlist</small></div></div><div className="dashboard-section-heading"><div><div className="eyebrow">YOUR PLANS</div><h2>Booking requests</h2></div><span className="demo-pill">DEMO ACTIVITY</span></div>{myBookings.length ? <div className="booking-list">{myBookings.map((booking) => <BookingCard key={booking.id} booking={booking} updateBooking={updateBooking} simulatePayment={simulatePayment} openDetail={openDetail} />)}</div> : <div className="empty-state"><div className="empty-icon"><CalendarDays /></div><h3>Your next celebration starts here</h3><p>When you request a booking, you’ll find it here.</p></div>}<div className="message-callout"><span className="message-icon"><MessageCircle size={19} /></span><span><b>Have a question about a venue?</b><small>Send a note from a venue’s detail page. Messaging is represented as a demo contact flow.</small></span><ChevronRight size={17} /></div></section>
}

function BookingCard({ booking, updateBooking, simulatePayment, openDetail }: { booking: Booking; updateBooking: (id: string, status: Booking['status']) => void; simulatePayment: (id: string, successful: boolean) => void; openDetail: (id: string) => void }) {
  const date = new Date(`${booking.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return <article className="booking-card"><div className="booking-card-top"><div><span className={`status-pill status-${booking.status.toLowerCase()}`}>{booking.status}</span><span className="booking-reference">Ref. {booking.id}</span></div><button className="text-button" onClick={() => openDetail(booking.venueId)}>View venue <ArrowRight size={14} /></button></div><h3>{booking.venueName}</h3><div className="booking-details"><span><CalendarDays size={14} /> {date}</span><span><Clock3 size={14} /> {booking.start}–{booking.end}</span><span><Users size={14} /> {booking.guests} guests</span></div><div className="booking-card-bottom"><span>Estimate <b>{money(booking.total)}</b><small> · Deposit {money(booking.deposit)}</small></span><div>{booking.payment && <span className={`payment-status ${booking.payment.toLowerCase()}`}>{booking.payment === 'SUCCEEDED' ? 'Deposit paid' : 'Payment failed'}</span>}{booking.status === 'ACCEPTED' && !booking.payment && <><button className="button-primary small-button" onClick={() => simulatePayment(booking.id, true)}>Pay demo deposit</button><button className="failure-link" onClick={() => simulatePayment(booking.id, false)}>Test failed payment</button></>}{booking.status === 'PENDING' && <button className="button-outline small-button" onClick={() => updateBooking(booking.id, 'CANCELLED')}>Cancel request</button>}</div></div></article>
}

function OwnerPage({ bookings, venues, updateBooking, openListing, role, switchRole }: { bookings: Booking[]; venues: Venue[]; updateBooking: (id: string, status: Booking['status']) => void; openListing: () => void; role: Role; switchRole: () => void }) {
  if (role !== 'OWNER') return <section className="access-panel"><div className="access-icon"><House /></div><div className="eyebrow">THE HOST’S TABLE</div><h1>Your space has a story.</h1><p>See how VenueLookup looks from the host side: manage your space, meet your next guests and keep the details in one place.</p><button className="button-primary" onClick={switchRole}>Explore owner demo <ArrowRight size={16} /></button></section>
  const mine = venues.filter((venue) => venue.ownerId === 'owner-1')
  const incoming = bookings.filter((booking) => booking.ownerId === 'owner-1')
  const pending = incoming.filter((booking) => booking.status === 'PENDING')
  return <section className="dashboard-wrap"><div className="dashboard-welcome owner-welcome"><div className="eyebrow">YOUR LITTLE CORNER OF VENUELOOKUP</div><h1>Welcome back, Jordan.</h1><p>Your spaces, bookings and next great gatherings.</p><button className="button-primary" onClick={openListing}><Plus size={16} /> Add a space</button><span className="dashboard-avatar">JR</span></div><div className="stat-grid"><div className="stat-card"><span>Your listings</span><b>{mine.length}</b><small>{mine.filter((venue) => venue.status === 'APPROVED').length} visible to guests</small></div><div className="stat-card"><span>Booking requests</span><b>{pending.length}</b><small>Worth a look</small></div><div className="stat-card"><span>Accepted bookings</span><b>{incoming.filter((booking) => booking.status === 'ACCEPTED').length}</b><small>On the calendar</small></div></div><div className="dashboard-section-heading"><div><div className="eyebrow">A NOTE FROM A GUEST</div><h2>Booking requests</h2></div><span className="demo-pill">DEMO ACTIVITY</span></div>{incoming.length ? <div className="booking-list">{incoming.map((booking) => <article className="booking-card" key={booking.id}><div className="booking-card-top"><span className={`status-pill status-${booking.status.toLowerCase()}`}>{booking.status}</span><span className="booking-reference">Ref. {booking.id}</span></div><h3>{booking.venueName}</h3><div className="booking-details"><span><CalendarDays size={14} /> {booking.date}</span><span><Users size={14} /> {booking.guests} guests · {booking.event}</span></div><p className="guest-message">“{booking.message || 'Looking forward to gathering at your venue.'}”</p>{booking.status === 'PENDING' && <div className="owner-actions"><button className="button-primary small-button" onClick={() => updateBooking(booking.id, 'ACCEPTED')}><Check size={15} /> Accept request</button><button className="button-outline small-button" onClick={() => updateBooking(booking.id, 'REJECTED')}>Decline</button></div>}</article>)}</div> : <div className="empty-state"><h3>No requests just yet</h3><p>New booking enquiries will appear here.</p></div>}<div className="dashboard-section-heading listing-heading"><div><div className="eyebrow">YOUR SPACES</div><h2>Listing health</h2></div></div><div className="owner-listings">{mine.map((venue) => <div className="owner-listing" key={venue.id}><img src={venue.image} alt={venue.name} /><span><b>{venue.name}</b><small>{venue.city}, {venue.state} · {money(venue.price)}/{venue.pricing}</small></span><span className={`status-pill status-${venue.status.toLowerCase()}`}>{venue.status}</span></div>)}</div></section>
}

function AdminPage({ venues, bookings, updateListing }: { venues: Venue[]; bookings: Booking[]; updateListing: (id: string, status: Venue['status']) => void }) {
  const pending = venues.filter((venue) => venue.status === 'PENDING')
  return <section className="dashboard-wrap"><div className="dashboard-welcome admin-welcome"><div className="eyebrow">THE CARE BEHIND THE CURATION</div><h1>Good morning, Admin.</h1><p>A considered view of what’s happening across the marketplace.</p><span className="dashboard-avatar">AD</span></div><div className="stat-grid stat-grid-four"><div className="stat-card"><span>People in the community</span><b>128</b><small>Demo accounts</small></div><div className="stat-card"><span>Spaces listed</span><b>{venues.length}</b><small>{venues.filter((venue) => venue.status === 'APPROVED').length} published</small></div><div className="stat-card"><span>Need your review</span><b>{pending.length}</b><small>Listings to look at</small></div><div className="stat-card"><span>Booking requests</span><b>{bookings.length}</b><small>All statuses</small></div></div><div className="dashboard-section-heading"><div><div className="eyebrow">A HOST IS WAITING</div><h2>Spaces for your review</h2></div><span className="demo-pill">DEMO MODERATION</span></div>{pending.length ? <div className="moderation-list">{pending.map((venue) => <article className="moderation-card" key={venue.id}><img src={venue.image} alt={venue.name} /><div className="moderation-info"><span className="status-pill status-pending">PENDING REVIEW</span><h3>{venue.name}</h3><p><MapPin size={14} /> {venue.city}, {venue.state} · {venue.type}</p><p>{venue.description}</p><small>Up to {venue.capacity} guests · {money(venue.price)} / {venue.pricing} · submitted by {venue.ownerId}</small></div><div className="moderation-actions"><button className="button-primary small-button" onClick={() => updateListing(venue.id, 'APPROVED')}><Check size={14} /> Approve</button><button className="button-outline small-button" onClick={() => updateListing(venue.id, 'REJECTED')}>Decline</button></div></article>)}</div> : <div className="empty-state"><h3>All caught up</h3><p>There are no listings waiting for review.</p></div>}<div className="dashboard-section-heading listing-heading"><div><div className="eyebrow">MARKETPLACE ACTIVITY</div><h2>Booking overview</h2></div></div><div className="admin-booking-list">{bookings.map((booking) => <div className="admin-booking-row" key={booking.id}><span>{booking.id}</span><b>{booking.venueName}</b><span>{booking.customer}</span><span className={`status-pill status-${booking.status.toLowerCase()}`}>{booking.status}</span><b>{money(booking.total)}</b></div>)}</div><p className="demo-disclaimer">Demo analytics are derived from sample marketplace records. No real user accounts, charges, or host revenue are present.</p></section>
}

function VenueDetail({ venue, close, saved, toggleSaved, compared, toggleCompared, book, contact, estimate }: { venue: Venue; close: () => void; saved: boolean; toggleSaved: () => void; compared: boolean; toggleCompared: () => void; book: () => void; contact: () => void; estimate: (venue: Venue, start: string, end: string) => { base: number; cleaning: number; service: number; discount: number; total: number } }) {
  const [start, setStart] = useState('16:00')
  const [end, setEnd] = useState('20:00')
  const pricing = estimate(venue, start, end)
  const durationHours = Math.max(1, (Number(end.split(':')[0]) - Number(start.split(':')[0])) + (Number(end.split(':')[1]) - Number(start.split(':')[1])) / 60)
  return (
    <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
      <section className="detail-modal">
        <button className="modal-close" onClick={close} aria-label="Close"><X /></button>
        <div className="detail-gallery"><img src={venue.image} alt={venue.name} /><span className="gallery-label">A CLOSER LOOK</span></div>
        <div className="detail-body">
          <div className="detail-title-row">
            <div><span className="eyebrow">{venue.type.toUpperCase()} · {venue.city.toUpperCase()}, {venue.state}</span><h2>{venue.name}</h2><p><MapPin size={14} /> {venue.address} <span>·</span> <Star size={14} fill="currentColor" /> {venue.rating.toFixed(1)} ({venue.reviews} reviews)</p></div>
            <button className={`round-action ${saved ? 'is-saved' : ''}`} onClick={toggleSaved} aria-label="Save venue"><Heart fill={saved ? 'currentColor' : 'none'} /></button>
          </div>
          <p className="detail-description">{venue.description}</p>
          <div className="detail-facts">
            <span><Users size={18} /><b>Up to {venue.capacity}</b><small>guest capacity</small></span>
            <span><BadgeCheck size={18} /><b>{venue.verified ? 'Verified host' : 'New host'}</b><small>owner status</small></span>
            <span><House size={18} /><b>{venue.indoor ? 'Indoor space' : 'Outdoor space'}</b><small>venue style</small></span>
          </div>
          <div className="detail-amenities"><h3>Thoughtful details</h3><div>{venue.amenities.map((item) => <span key={item}><Check size={14} />{item}</span>)}</div></div>
          <div className="detail-owner"><span className="owner-avatar">{venue.ownerId.slice(-1).toUpperCase()}</span><span><b>A note from your host</b><small>A local host, happy to help make your gathering feel like yours.</small></span><span className="verified-note"><BadgeCheck size={14} /> {venue.verified ? 'Verified' : 'New listing'}</span></div>
          <div className="estimate-box">
            <div className="estimate-heading"><span><b>Make a quick estimate</b><small>Just an idea — not a final charge.</small></span><span>{money(venue.price)} / {venue.pricing}</span></div>
            <div className="estimate-times"><label>From<input type="time" value={start} onChange={(event) => setStart(event.target.value)} /></label><label>Until<input type="time" value={end} onChange={(event) => setEnd(event.target.value)} /></label></div>
            <div className="estimate-line"><span>Space {venue.pricing === 'hour' ? `· ${durationHours} hours` : '· day rate'}</span><b>{money(pricing.base)}</b></div>
            {pricing.discount > 0 && <div className="estimate-line discount-line"><span>Space offer · {venue.discount}% off</span><b>−{money(pricing.discount)}</b></div>}
            <div className="estimate-line"><span>Cleaning fee</span><b>{money(pricing.cleaning)}</b></div>
            <div className="estimate-line"><span>Service fee · 8%</span><b>{money(pricing.service)}</b></div>
            <div className="estimate-total"><b>Estimated total</b><b>{money(pricing.total)}</b></div>
            <small className="estimate-caveat">Booking requests are not confirmed until the host accepts. No payment is collected here.</small>
          </div>
          <div className="detail-actions"><button className="button-primary" onClick={book}>Request to book <ArrowRight size={16} /></button><button className={`button-outline ${compared ? 'compare-selected' : ''}`} onClick={toggleCompared}>{compared ? <Check size={15} /> : <Plus size={15} />} {compared ? 'Added to compare' : 'Add to compare'}</button><button className="button-text" onClick={contact}>Contact host</button></div>
        </div>
      </section>
    </div>
  )
}

function BookingForm({ venue, submit, message, setMessage, estimate }: { venue: Venue; submit: (event: React.FormEvent<HTMLFormElement>) => void; message: string; setMessage: (value: string) => void; estimate: (venue: Venue, start: string, end: string) => { base: number; cleaning: number; service: number; discount: number; total: number } }) {
  const [start, setStart] = useState('16:00')
  const [end, setEnd] = useState('20:00')
  const pricing = estimate(venue, start, end)
  return <form className="booking-form" onSubmit={submit}><div className="booking-venue-summary"><img src={venue.image} alt={venue.name} /><span><b>{venue.name}</b><small>{venue.city}, {venue.state} · Up to {venue.capacity} guests</small></span><span className="booking-rate">{money(venue.price)}<small> / {venue.pricing}</small></span></div><div className="form-grid"><label>Event date<input name="date" type="date" required min={DEMO_TODAY} defaultValue="2026-12-12" /></label><label>Occasion<select name="event" required defaultValue="Birthday">{categories.map((category) => <option key={category.name}>{category.name}</option>)}</select></label><label>Start time<input name="start" type="time" value={start} onChange={(event) => setStart(event.target.value)} required /></label><label>End time<input name="end" type="time" value={end} onChange={(event) => setEnd(event.target.value)} required /></label><label>Guest count<input name="guests" type="number" min="1" max={venue.capacity} defaultValue={Math.min(40, venue.capacity)} required /><small>Venue capacity: {venue.capacity}</small></label><label className="field-wide">A note for your host<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} placeholder="Tell the host a little about your event…" /></label></div><div className="booking-estimate"><span>Estimated total <b>{money(pricing.total)}</b></span><small>Includes {money(pricing.cleaning)} cleaning and {money(pricing.service)} service fee{pricing.discount ? ` · ${money(pricing.discount)} offer applied` : ''}</small><span className="deposit-row">Demo deposit estimate <b>{money(Math.round(pricing.total * 0.25))}</b></span></div><p className="demo-note-inline"><ShieldCheck size={15} /> Request only — no real money or payment details are collected.</p><button className="button-primary submit-booking" type="submit">Send booking request <ArrowRight size={16} /></button></form>
}

function Modal({ title, close, children, wide = false }: { title: string; close: () => void; children: React.ReactNode; wide?: boolean }) {
  return <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}><section className={`generic-modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}><div className="generic-modal-heading"><h2>{title}</h2><button className="modal-close" onClick={close} aria-label="Close"><X /></button></div>{children}</section></div>
}

function Footer({ navigate }: { navigate: (page: Page) => void }) {
  return <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><button className="brand" onClick={() => navigate('home')}><span className="brand-mark"><House size={18} strokeWidth={2.5} /></span><span>venue<span className="brand-light">lookup</span></span></button><p>A more thoughtful way to<br />find a place to gather.</p></div><div className="footer-links"><div><b>Find a space</b><button onClick={() => navigate('explore')}>Explore venues</button><button onClick={() => navigate('planner')}>AI event planner</button><button onClick={() => navigate('saved')}>Saved spaces</button></div><div><b>Make it happen</b><button onClick={() => navigate('customer')}>Your bookings</button><button onClick={() => navigate('compare')}>Compare venues</button><button onClick={() => navigate('owner')}>List your space</button></div><div><b>A little more</b><a href="mailto:hello@venuelookup.demo">Get in touch</a><a href="#how-it-works">How it works</a><a href="#privacy">Privacy, in plain English</a></div></div></div><div className="footer-bottom"><span>© 2026 VenueLookup · Made for good gatherings</span><span className="footer-demo"><span /> Offline demo · sample data</span></div></footer>
}

export default App
