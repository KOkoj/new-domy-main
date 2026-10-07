'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import Lenis from 'lenis'
import { MapPin, ChevronRight, Check, Globe, Lock, Banknote, AlertTriangle, HelpCircle, Search, User, Menu, X } from 'lucide-react'
import BackgroundImageTransition from '@/components/BackgroundImageTransition'
import ProtectedContentLink from '@/components/ProtectedContentLink'

const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false })
const KlubInfoModal = dynamic(() => import('@/components/KlubInfoModal'), { ssr: false })
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import FormPrivacyNotice from '@/components/legal/FormPrivacyNotice'
import Navigation from '../components/Navigation'
import { LanguageMenu, SiteNavMenu } from '../components/SiteNavControls'
import { supabase } from '../lib/supabase'
import { t } from '../lib/translations'
import { readLanguageFromBrowser, readCurrencyFromBrowser, persistLanguage, persistCurrency, DEFAULT_LANGUAGE, DEFAULT_CURRENCY, getInitialLanguage, getInitialCurrency } from '../lib/userPreferences'

const WEBINAR_REGION_VALUES = [
  'abruzzo', 'basilicata', 'calabria', 'campania', 'emilia-romagna',
  'friuli-venezia-giulia', 'lazio', 'liguria', 'lombardia', 'marche',
  'molise', 'piemonte', 'puglia', 'sardegna', 'sicilia', 'toscana',
  'trentino-alto-adige', 'umbria', 'valle-daosta', 'veneto'
]

const EMPTY_PROPERTIES = []

function propertyListsMatch(current, next) {
  if (current.length !== next.length) return false
  for (let index = 0; index < current.length; index += 1) {
    if (current[index] !== next[index]) return false
  }
  return true
}

export default function HomePageClient({ initialProperties = EMPTY_PROPERTIES, sliderProperties }) {
  const SHOW_HOME_ARCHIVED_SECTIONS = false
  const properties = initialProperties
  
  const heroBackgroundImages = [
    {
      src: '/hero-mlha.webp',
      avifSrc: '/hero-mlha.avif',
      webpSrc: '/hero-mlha.webp',
      alt: 'Mlha a dům v toskánské krajině',
      transform: 'translate(-22%, 8%) scale(1.5) scaleX(-1)',
    },
  ]
  const [favorites, setFavorites] = useState(new Set())
  const [filters, setFilters] = useState({})
  const [user, setUser] = useState(null)
  const [isHeroMenuOpen, setIsHeroMenuOpen] = useState(false)
  const [language, setLanguage] = useState(getInitialLanguage)
  const [currency, setCurrency] = useState(getInitialCurrency)

  // Dynamic content data
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedPropertyType, setSelectedPropertyType] = useState(null)
  const [regionProperties, setRegionProperties] = useState([])
  const [propertyTypeProperties, setPropertyTypeProperties] = useState([])
  
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState(null)
  
  // Animations begin as soon as the component is mounted in the browser.
  // We no longer gate the entire page behind an artificial loading overlay
  // because it hurts perceived performance and prevents Googlebot from
  // seeing meaningful content on first paint.
  const [startAnimations, setStartAnimations] = useState(false)
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isKlubModalOpen, setIsKlubModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState('signup')
  const [postAuthRedirect, setPostAuthRedirect] = useState('')

  useEffect(() => {
    const savedLanguage = readLanguageFromBrowser()
    setLanguage(savedLanguage)
    document.documentElement.lang = savedLanguage

    setCurrency(readCurrencyFromBrowser())

    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    // Make Lenis available globally for scroll indicator
    window.lenis = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Cleanup
    return () => {
      lenis.destroy()
      delete window.lenis
    }
  }, [])

  // Keep the hero photo locked to the viewport while the copy scrolls away.
  // position:fixed is trapped by overflow-x:hidden on html, body, and this page.
  const heroRef = useRef(null)
  const heroBgRef = useRef(null)
  useEffect(() => {
    const bg = heroBgRef.current
    const hero = heroRef.current
    if (!bg || !hero) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const apply = (scrollY) => {
      const y = Math.max(0, Math.min(scrollY, hero.offsetHeight))
      bg.style.transform = `translate3d(0, ${y}px, 0)`
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => apply(window.scrollY))
    }
    const onLenis = (instance) => apply(instance.scroll)

    apply(window.scrollY || 0)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.lenis?.on('scroll', onLenis)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.lenis?.off('scroll', onLenis)
      bg.style.transform = ''
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.querySelector('[data-testid="homepage-container"]')
    if (!root) return
    const nodes = root.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
        const release = (event) => {
          if (event.target !== entry.target) return
          entry.target.removeAttribute('data-reveal')
          entry.target.classList.remove('is-in')
        }
        entry.target.addEventListener('animationend', release, { once: true })
      })
    }, { threshold: 0.18, rootMargin: '0px 0px -4% 0px' })
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setStartAnimations(true)
  }, [])

  // Scroll-triggered animations using Intersection Observer
  useEffect(() => {
    if (!startAnimations) return

    // Keep track of animated elements
    const animatedElements = new Set()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target
          
          // Only animate if: intersecting, not already animated, and not in the set
          if (entry.isIntersecting && !animatedElements.has(element)) {
            // Mark as animated immediately to prevent double-triggering
            animatedElements.add(element)
            
            // Use RAF for smooth rendering
            requestAnimationFrame(() => {
              element.classList.add('animate-in')
            })
            
            // Stop observing this element
            observer.unobserve(element)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px',
        // Add root for better performance
        root: null
      }
    )

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const animateElements = document.querySelectorAll('.animate-on-scroll')
      animateElements.forEach((el) => {
        // Skip if already has animate-in class
        if (!el.classList.contains('animate-in')) {
          observer.observe(el)
        }
      })
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
      animatedElements.clear()
    }
  }, [startAnimations])

  useEffect(() => {
    if (!supabase) return
    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Load user's favorites
        loadFavorites()
      }
    }
    checkUser()
  }, [])

  // Dynamic content data
  const regionData = [
    {
      name: 'Abruzzo',
      title: {
        en: 'Complete Guide to Buying in Abruzzo',
        cs: 'Kompletní průvodce nákupem v Abruzzu',
        it: 'Guida completa all\'acquisto in Abruzzo'
      },
      description: {
        en: 'Discover the mountains, coastlines, and medieval villages of Abruzzo. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte hory, pobřeží a středověké vesnice Abruzza. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri le montagne, le coste e i villaggi medievali dell\'Abruzzo. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Basilicata',
      title: {
        en: 'Complete Guide to Buying in Basilicata',
        cs: 'Kompletní průvodce nákupem v Basilicatě',
        it: 'Guida completa all\'acquisto in Basilicata'
      },
      description: {
        en: 'Explore the ancient landscapes and historic towns of Basilicata. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte starobylé krajiny a historická města Basilicaty. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora i paesaggi antichi e le città storiche della Basilicata. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Calabria',
      title: {
        en: 'Complete Guide to Buying in Calabria',
        cs: 'Kompletní průvodce nákupem v Kalábrii',
        it: 'Guida completa all\'acquisto in Calabria'
      },
      description: {
        en: 'Discover the pristine beaches and mountain villages of Calabria. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte nedotčené pláže a horské vesnice Kalábrie. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri le spiagge incontaminate e i villaggi montani della Calabria. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Campania',
      title: {
        en: 'Complete Guide to Buying in Campania',
        cs: 'Kompletní průvodce nákupem v Kampánii',
        it: 'Guida completa all\'acquisto in Campania'
      },
      description: {
        en: 'Explore the Amalfi Coast, Naples, and historic sites of Campania. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte pobřeží Amalfi, Neapol a historická místa Kampánie. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la Costiera Amalfitana, Napoli e i siti storici della Campania. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Emilia-Romagna',
      title: {
        en: 'Complete Guide to Buying in Emilia-Romagna',
        cs: 'Kompletní průvodce nákupem v Emilia-Romagna',
        it: 'Guida completa all\'acquisto in Emilia-Romagna'
      },
      description: {
        en: 'Discover the culinary capital, historic cities, and rolling hills of Emilia-Romagna. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte kulinářské hlavní město, historická města a zvlněné kopce Emilia-Romagna. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri la capitale culinaria, le città storiche e le dolci colline dell\'Emilia-Romagna. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Friuli-Venezia Giulia',
      title: {
        en: 'Complete Guide to Buying in Friuli-Venezia Giulia',
        cs: 'Kompletní průvodce nákupem v Friuli-Venezia Giulia',
        it: 'Guida completa all\'acquisto in Friuli-Venezia Giulia'
      },
      description: {
        en: 'Explore the crossroads of cultures, mountains, and coastline in Friuli-Venezia Giulia. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte křižovatku kultur, hor a pobřeží ve Friuli-Venezia Giulia. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora il crocevia di culture, montagne e costa nel Friuli-Venezia Giulia. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Lazio',
      title: {
        en: 'Complete Guide to Buying in Lazio',
        cs: 'Kompletní průvodce nákupem v Laziu',
        it: 'Guida completa all\'acquisto nel Lazio'
      },
      description: {
        en: 'Discover Rome, ancient history, and beautiful countryside in Lazio. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte Řím, starověkou historii a krásný venkov v Laziu. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri Roma, la storia antica e la bellissima campagna nel Lazio. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Liguria',
      title: {
        en: 'Complete Guide to Buying in Liguria',
        cs: 'Kompletní průvodce nákupem v Ligurii',
        it: 'Guida completa all\'acquisto in Liguria'
      },
      description: {
        en: 'Explore the Italian Riviera, colorful villages, and Mediterranean coastline in Liguria. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte italskou riviéru, barevné vesnice a středomořské pobřeží v Ligurii. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la Riviera Italiana, i villaggi colorati e la costa mediterranea in Liguria. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Lombardia',
      title: {
        en: 'Complete Guide to Buying in Lombardy',
        cs: 'Kompletní průvodce nákupem v Lombardii',
        it: 'Guida completa all\'acquisto in Lombardia'
      },
      description: {
        en: 'Discover Milan, Lake Como, and the economic heart of Italy in Lombardy. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte Milán, Lago di Como a ekonomické srdce Itálie v Lombardii. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri Milano, il Lago di Como e il cuore economico dell\'Italia in Lombardia. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Marche',
      title: {
        en: 'Complete Guide to Buying in Marche',
        cs: 'Kompletní průvodce nákupem v Marche',
        it: 'Guida completa all\'acquisto nelle Marche'
      },
      description: {
        en: 'Explore the hidden gem with Adriatic coast and medieval towns in Marche. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte skrytý klenot s pobřežím Jaderského moře a středověkými městy v Marche. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la gemma nascosta con costa adriatica e città medievali nelle Marche. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Molise',
      title: {
        en: 'Complete Guide to Buying in Molise',
        cs: 'Kompletní průvodce nákupem v Molise',
        it: 'Guida completa all\'acquisto in Molise'
      },
      description: {
        en: 'Discover the smallest region with authentic Italian charm in Molise. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte nejmenší region s autentickým italským kouzlem v Molise. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri la regione più piccola con il fascino italiano autentico in Molise. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Piemonte',
      title: {
        en: 'Complete Guide to Buying in Piedmont',
        cs: 'Kompletní průvodce nákupem v Piemontu',
        it: 'Guida completa all\'acquisto in Piemonte'
      },
      description: {
        en: 'Explore the wine country, Alps, and elegant Turin in Piedmont. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte vinařskou oblast, Alpy a elegantní Turín v Piemontu. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la terra del vino, le Alpi e l\'elegante Torino in Piemonte. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Puglia',
      title: {
        en: 'Complete Guide to Buying in Puglia',
        cs: 'Kompletní průvodce nákupem v Puglii',
        it: 'Guida completa all\'acquisto in Puglia'
      },
      description: {
        en: 'Discover the heel of Italy with trulli houses and stunning coastline in Puglia. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte patu Itálie s domy trulli a úžasným pobřežím v Puglii. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri il tallone d\'Italia con le case trulli e la costa mozzafiato in Puglia. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Sardegna',
      title: {
        en: 'Complete Guide to Buying in Sardinia',
        cs: 'Kompletní průvodce nákupem na Sardinii',
        it: 'Guida completa all\'acquisto in Sardegna'
      },
      description: {
        en: 'Explore the Mediterranean island with pristine beaches and unique culture in Sardinia. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte středomořský ostrov s nedotčenými plážemi a jedinečnou kulturou na Sardinii. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora l\'isola mediterranea con spiagge incontaminate e cultura unica in Sardegna. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Sicilia',
      title: {
        en: 'Complete Guide to Buying in Sicily',
        cs: 'Kompletní průvodce nákupem na Sicílii',
        it: 'Guida completa all\'acquisto in Sicilia'
      },
      description: {
        en: 'Discover the largest Mediterranean island with Mount Etna and ancient history in Sicily. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte největší středomořský ostrov s Etnou a starověkou historií na Sicílii. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri la più grande isola mediterranea con l\'Etna e la storia antica in Sicilia. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Toscana',
      title: {
        en: 'Complete Guide to Buying in Tuscany',
        cs: 'Kompletní průvodce nákupem v Toskánsku',
        it: 'Guida completa all\'acquisto in Toscana'
      },
      description: {
        en: 'Discover the rolling hills, vineyards, and historic cities of Tuscany. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte zvlněné kopce, vinice a historická města Toskánska. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri le dolci colline, i vigneti e le città storiche della Toscana. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Trentino-Alto Adige',
      title: {
        en: 'Complete Guide to Buying in Trentino-Alto Adige',
        cs: 'Kompletní průvodce nákupem v Trentino-Alto Adige',
        it: 'Guida completa all\'acquisto in Trentino-Alto Adige'
      },
      description: {
        en: 'Explore the Dolomites, alpine lakes, and unique dual culture in Trentino-Alto Adige. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte Dolomity, alpská jezera a jedinečnou dvojí kulturu v Trentino-Alto Adige. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora le Dolomiti, i laghi alpini e la cultura duale unica in Trentino-Alto Adige. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Umbria',
      title: {
        en: 'Complete Guide to Buying in Umbria',
        cs: 'Kompletní průvodce nákupem v Umbrii',
        it: 'Guida completa all\'acquisto in Umbria'
      },
      description: {
        en: 'Discover the green heart of Italy with medieval hill towns in Umbria. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte zelené srdce Itálie se středověkými městy na kopcích v Umbrii. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri il cuore verde d\'Italia con le città medievali sui colli in Umbria. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Valle d\'Aosta',
      title: {
        en: 'Complete Guide to Buying in Valle d\'Aosta',
        cs: 'Kompletní průvodce nákupem v Valle d\'Aosta',
        it: 'Guida completa all\'acquisto in Valle d\'Aosta'
      },
      description: {
        en: 'Explore the smallest region with highest peaks and alpine charm in Valle d\'Aosta. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte nejmenší region s nejvyššími vrcholy a alpským kouzlem v Valle d\'Aosta. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la regione più piccola con le vette più alte e il fascino alpino in Valle d\'Aosta. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Veneto',
      title: {
        en: 'Complete Guide to Buying in Veneto',
        cs: 'Kompletní průvodce nákupem v Benátsku',
        it: 'Guida completa all\'acquisto in Veneto'
      },
      description: {
        en: 'Discover Venice, Verona, and the diverse landscapes of Veneto. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte Benátky, Veronu a rozmanité krajiny Benátska. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri Venezia, Verona e i paesaggi diversi del Veneto. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }
  ]

  const propertyTypeData = [
    {
      name: 'Villa',
      title: {
        en: 'Villa vs House: Which is Right for You?',
        cs: 'Vila vs dům: Co je pro vás to pravé?',
        it: 'Villa vs casa: quale è giusto per te?'
      },
      description: {
        en: 'Learn the key differences between Italian villas and houses. From architectural styles to investment potential, make an informed decision.',
        cs: 'Poznejte klíčové rozdíly mezi italskými vilami a domy. Od architektonických stylů po investiční potenciál udělejte informované rozhodnutí.',
        it: 'Impara le principali differenze tra ville e case italiane. Dagli stili architettonici al potenziale di investimento, prendi una decisione informata.'
      },
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Farmhouse',
      title: {
        en: 'Restoring Italian Farmhouses: A Complete Guide',
        cs: 'Obnova italských statků: Kompletní průvodce',
        it: 'Ristrutturare le masserie italiane: una guida completa'
      },
      description: {
        en: 'Transform a traditional farmhouse into your dream home. Learn about restoration costs, permits, and the charm of rural Italian living.',
        cs: 'Proměňte tradiční statek ve svůj vysněný domov. Zjistěte více o nákladech na rekonstrukci, povoleních a kouzlu venkovského italského života.',
        it: 'Trasforma una masseria tradizionale nella casa dei tuoi sogni. Impara sui costi di ristrutturazione, permessi e il fascino della vita rurale italiana.'
      },
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Apartment',
      title: {
        en: 'Apartment Living in Italian Cities',
        cs: 'Bydlení v bytech v italských městech',
        it: 'Vita in appartamento nelle città italiane'
      },
      description: {
        en: 'Discover the benefits of city living in Italy. From Milan to Florence, explore modern apartments and historic palazzos.',
        cs: 'Objevte výhody městského života v Itálii. Od Milána po Florencii prozkoumejte moderní byty a historické paláce.',
        it: 'Scopri i benefici della vita in città in Italia. Da Milano a Firenze, esplora appartamenti moderni e palazzi storici.'
      },
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Commercial',
      title: {
        en: 'Commercial Property in Italy: Investment Guide',
        cs: 'Komerční nemovitostí v Itálii: Investiční průvodce',
        it: 'Immobili commerciali in Italia: guida agli investimenti'
      },
      description: {
        en: 'Explore commercial real estate opportunities. From restaurants to retail spaces, learn about Italy\'s business property market.',
        cs: 'Prozkoumejte příležitosti komerčních nemovitostí. Od restaurací po maloobchodní prostory, zjistěte více o italském trhu s obchodními nemovitostmi.',
        it: 'Esplora le opportunità immobiliari commerciali. Dai ristoranti agli spazi retail, impara sul mercato immobiliare commerciale italiano.'
      },
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }
  ]

  // Initialize dynamic content on component mount
  useEffect(() => {
    // Select random region
    const randomRegion = regionData[Math.floor(Math.random() * regionData.length)]
    setSelectedRegion(randomRegion)
    
    // Select random property type
    const randomPropertyType = propertyTypeData[Math.floor(Math.random() * propertyTypeData.length)]
    setSelectedPropertyType(randomPropertyType)
  }, [])

  // Derived lists for the archived homepage blocks. Keep the previous array
  // when the filter result is unchanged so a new `properties` reference cannot
  // schedule another render from this effect.
  useEffect(() => {
    if (!selectedRegion) return

    const regionProps = properties.filter(property => {
      const regionName = property.location?.city?.region?.name
      const nameToCheck = typeof regionName === 'object' ? regionName?.en : regionName
      return nameToCheck === selectedRegion.name
    })
    const minProperties = 3
    const nextProperties = regionProps.length < minProperties
      ? [...regionProps, ...properties.filter(property => !regionProps.includes(property))].slice(0, minProperties)
      : regionProps

    setRegionProperties(current => (
      propertyListsMatch(current, nextProperties) ? current : nextProperties
    ))
  }, [selectedRegion, properties])

  useEffect(() => {
    if (!selectedPropertyType) return

    const typeProps = properties.filter(property =>
      property.propertyType?.toLowerCase() === selectedPropertyType.name.toLowerCase()
    )
    const minProperties = 3
    const nextProperties = typeProps.length < minProperties
      ? [...typeProps, ...properties.filter(property => !typeProps.includes(property))].slice(0, minProperties)
      : typeProps

    setPropertyTypeProperties(current => (
      propertyListsMatch(current, nextProperties) ? current : nextProperties
    ))
  }, [selectedPropertyType, properties])

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const userFavorites = await response.json()
        setFavorites(new Set(userFavorites.map(f => f.listingId)))
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const handleFavorite = async (propertyId) => {
    if (!user) {
      setIsKlubModalOpen(true)
      return
    }

    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: propertyId })
      })
      
      if (response.ok) {
        const result = await response.json()
        const newFavorites = new Set(favorites)
        
        if (result.favorited) {
          newFavorites.add(propertyId)
        } else {
          newFavorites.delete(propertyId)
        }
        
        setFavorites(newFavorites)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    document.documentElement.lang = newLanguage
    persistLanguage(newLanguage)
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLanguage }))
  }

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency)
    persistCurrency(newCurrency)
  }

  const handleLogout = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setFavorites(new Set())
    }
  }

  const handleAuthSuccess = (authUser) => {
    setUser(authUser)
    setIsAuthModalOpen(false)
    loadFavorites()

    if (postAuthRedirect) {
      const nextPath = postAuthRedirect
      setPostAuthRedirect('')
      window.location.href = nextPath
    }
  }

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false)
    setPostAuthRedirect('')
  }

  const handleStartFinder = () => {
    const targetPath = '/dashboard/intake-form'
    if (user) {
      window.location.href = targetPath
      return
    }
    setPostAuthRedirect(targetPath)
    setIsKlubModalOpen(true)
  }

  const handleBookCall = () => {
    window.location.href = '/book-call'
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] home-page-custom-border overflow-x-hidden" data-testid="homepage-container">
      {/* Navigation — the bar appears once the hero has scrolled away */}
      <Navigation appearAfterHero />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
        style={{ minHeight: '100vh' }}
        data-testid="hero-section"
      >
        {/* Photo stays locked to the viewport; the section clips it as it scrolls away. */}
        <div ref={heroBgRef} className="pointer-events-none absolute inset-x-0 top-0 h-screen" data-testid="hero-background">
          <BackgroundImageTransition
            images={heroBackgroundImages}
            transitionDuration={6000}
            fadeDuration={1500}
            className="z-0"
          />

          <div
            className="absolute inset-0 z-10"
            style={{
              background: [
                'radial-gradient(ellipse 78% 58% at 50% 54%, rgba(14,21,46,0.58) 0%, rgba(14,21,46,0.12) 72%)',
                'linear-gradient(180deg, rgba(14,21,46,0.84) 0%, rgba(14,21,46,0.58) 18%, rgba(14,21,46,0.46) 38%, rgba(14,21,46,0.52) 62%, rgba(14,21,46,0.68) 100%)',
              ].join(', '),
            }}
          />
        </div>

        <div className="relative z-20 flex min-h-screen flex-col text-white">
          <header className="hero-enter relative z-30 mx-auto flex w-full max-w-[1800px] items-center gap-3 overflow-visible px-5 pt-5 sm:px-8 sm:pt-6 xl:px-12">
            <Link href="/" className="relative z-10 shrink-0" data-testid="hero-logo-link">
              <Image
                src="/solo logo.svg"
                alt="Domy v Itálii"
                width={124}
                height={96}
                priority
                className="absolute top-0 left-0 z-30 h-20 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.22)] sm:h-24"
                data-testid="hero-logo"
              />
              <span className="block h-12 w-[6.5rem] sm:w-[7.75rem]" />
            </Link>

            <SiteNavMenu
              language={language}
              isActive={(href) => href === '/'}
              tone="hero"
              testIdPrefix="hero-nav-"
              className="absolute left-1/2 top-5 z-20 hidden h-12 -translate-x-[calc(50%+4.5rem)] items-center sm:top-6 min-[1400px]:flex"
            />

            <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
              <LanguageMenu
                language={language}
                onChange={handleLanguageChange}
                testIdPrefix="hero-language-"
              />

              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-4 py-2 text-base font-medium text-white backdrop-blur-sm"
                >
                  {language === 'cs' ? 'Nástěnka' : language === 'it' ? 'Cruscotto' : 'Dashboard'}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true) }}
                  className="inline-flex items-center gap-2 rounded-full border-0 bg-[#1b2642] px-6 py-3 text-base font-medium leading-none text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)] transition-colors duration-200 hover:bg-[#243056]"
                  data-testid="hero-login-button"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {language === 'cs' ? 'Přihlásit / Registrovat' : language === 'it' ? 'Accedi / Registrati' : 'Login / Register'}
                  </span>
                </button>
              )}

              <button
                type="button"
                className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 min-[1400px]:hidden"
                onClick={() => setIsHeroMenuOpen((open) => !open)}
                aria-label={language === 'cs' ? 'Menu' : language === 'it' ? 'Menu' : 'Menu'}
                data-testid="hero-menu-button"
              >
                {isHeroMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </header>

          {isHeroMenuOpen && (
            <div className="container relative z-10 mx-auto px-4 pt-3 min-[1400px]:hidden">
              <div className="flex flex-col rounded-xl border border-white/20 bg-[rgba(14,21,46,0.88)] p-2">
                {[
                  { href: '/', label: language === 'cs' ? 'Domů' : language === 'it' ? 'Casa' : 'Home' },
                  { href: '/properties', label: language === 'cs' ? 'Nemovitosti' : language === 'it' ? 'Proprietà' : 'Properties' },
                  { href: '/regions', label: language === 'cs' ? 'Regiony' : language === 'it' ? 'Regioni' : 'Regions' },
                  { href: '/process', label: language === 'cs' ? 'Náš proces' : language === 'it' ? 'Il nostro processo' : 'Our Process' },
                  { href: '/blog', label: language === 'cs' ? 'Články' : language === 'it' ? 'Articoli' : 'Articles' },
                  { href: '/faq', label: 'FAQ' },
                  { href: '/about', label: language === 'cs' ? 'O nás' : language === 'it' ? 'Chi siamo' : 'About' },
                  { href: '/reference', label: language === 'cs' ? 'Reference' : language === 'it' ? 'Referenze' : 'References' },
                  { href: '/contact', label: language === 'cs' ? 'Kontakt' : language === 'it' ? 'Contatto' : 'Contact' },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsHeroMenuOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-base transition-colors ${
                      href === '/'
                        ? 'bg-white/10 text-white shadow-[inset_3px_0_0_0_#c48759]'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-current={href === '/' ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="container relative z-10 mx-auto flex w-full flex-1 flex-col items-center justify-center px-4 pb-16 text-center" data-testid="hero-copy">
            <h1
              className="hero-enter max-w-4xl font-bold text-white text-hero"
              style={{
                textShadow: '0 2px 16px rgba(0,0,0,0.35)',
                textWrap: 'balance',
                '--d': '140ms',
              }}
              data-testid="hero-title"
            >
              {language === 'cs' ? 'Pomáháme Čechům koupit dům v Itálii.' :
               language === 'it' ? 'Aiutiamo i cechi a comprare casa in Italia.' :
               'We help Czechs buy a home in Italy.'}
            </h1>

            <p className="hero-enter mt-5 text-xl font-normal leading-snug text-white/90 sm:text-2xl" style={{ '--d': '300ms' }}>
              {language === 'cs' ? <>Právní, technická i praktická podpora<br />během celého procesu.</> :
               language === 'it' ? <>Supporto legale, tecnico e pratico<br />durante tutto il processo.</> :
               <>Legal, technical, and practical support<br />throughout the entire process.</>}
            </p>

            <div className="hero-enter-line mt-6 flex items-center justify-center" style={{ '--d': '460ms' }} aria-hidden="true" data-testid="hero-tricolor">
              <span className="h-[3px] w-14 rounded-l-full bg-[#009246] sm:w-16" />
              <span className="h-[3px] w-14 bg-white sm:w-16" />
              <span className="h-[3px] w-14 rounded-r-full bg-[#CE2B37] sm:w-16" />
            </div>

            <div className="hero-enter mt-6 grid w-full max-w-md grid-cols-2 gap-5 sm:inline-grid sm:w-auto sm:max-w-none" style={{ '--d': '560ms' }}>
              <Link
                href="/properties"
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-[99px] border-0 bg-white/10 px-6 py-3 text-lg font-semibold text-white shadow-[inset_0_0_0_1px_#fff] transition-colors duration-200 hover:bg-white/20"
                data-testid="hero-properties-link"
              >
                <Search className="h-5 w-5" />
                <span>
                  {language === 'cs' ? 'Prohledat vybrané nemovitosti' :
                   language === 'it' ? 'Sfoglia gli immobili disponibili' :
                   'Browse available properties'}
                </span>
              </Link>
              <Link
                href="/contact"
                data-testid="hero-consultation-link"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#c7895b] to-[#996945] px-6 py-3 text-lg font-semibold text-white shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-1 hover:from-[#e8bc8a] hover:to-[#c48759] hover:shadow-[0_16px_30px_rgba(0,0,0,0.35)]"
              >
                {language === 'cs' ? 'Konzultace zdarma' : language === 'it' ? 'Consulenza gratuita' : 'Free consultation'}
              </Link>
              <Link
                href="/process"
                data-testid="hero-process-link"
                className="inline-flex items-center justify-center rounded-lg border-0 bg-white px-6 py-3 text-lg font-semibold text-[#0e152e] shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-1 hover:bg-[#1b2642] hover:text-white hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7),0_16px_30px_rgba(0,0,0,0.35)]"
              >
                {language === 'cs' ? 'Náš proces' : language === 'it' ? 'Il nostro processo' : 'Our process'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#f7f4ed] py-12 sm:py-16">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-24 px-5 sm:gap-36 sm:px-8 xl:px-[10rem]">
      {/* How It Works Section */}
      <section data-testid="how-it-works-section">
          <div className="grid items-stretch gap-3 lg:grid-cols-[42rem_minmax(0,1fr)]">
            <div className="flex flex-col justify-center lg:py-4 lg:pr-8">
              <h2 data-reveal="rise" className="text-pretty text-[2.05rem] font-bold leading-[1.15] text-gray-900">
                {language === 'cs' ? 'Čtyři kroky od prvního hovoru k předání klíčů.' :
                 language === 'it' ? 'Quattro passi dalla prima chiamata alla consegna delle chiavi.' :
                 'Four steps from the first call to handing over the keys.'}
              </h2>
              <Link href="/process" data-reveal="rise" style={{ '--d': '80ms' }} className="mt-5 inline-flex w-fit items-center gap-1.5 self-start rounded-full bg-gradient-to-r from-[#c7895b] to-[#996945] px-5 py-2.5 text-base font-semibold text-white transition duration-200 hover:from-[#e8bc8a] hover:to-[#c48759]">
                {language === 'cs' ? 'Celý proces' : language === 'it' ? 'Processo completo' : 'Full process'}
                <ChevronRight className="h-4 w-4" />
              </Link>

              <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-8">
                {[
                  {
                    n: '01', href: '/process#step-1',
                    label: language === 'cs' ? 'Zadání & nabídka' : language === 'it' ? 'Esigenze & proposta' : 'Brief & Proposal',
                    sub: language === 'cs' ? 'Sepíšeme, co hledáte, a řekneme, jestli to v Itálii dává smysl.' : language === 'it' ? 'Mettiamo per iscritto cosa cercate e vi diciamo se ha senso in Italia.' : 'We write down what you want and tell you whether it makes sense in Italy.',
                  },
                  {
                    n: '02', href: '/process#step-2',
                    label: language === 'cs' ? 'Výběr nemovitostí' : language === 'it' ? "Scelta dell'immobile" : 'Property Selection',
                    sub: language === 'cs' ? 'Nabídky prověříme a komunikaci s italskou stranou vedeme my.' : language === 'it' ? 'Verifichiamo le offerte e seguiamo noi i contatti con la parte italiana.' : 'We check the listings and handle all contact with the Italian side.',
                  },
                  {
                    n: '03', href: '/process#step-3',
                    label: language === 'cs' ? 'Podpis & převod' : language === 'it' ? 'Firma & trasferimento' : 'Signing & Transfer',
                    sub: language === 'cs' ? 'Smlouvu, daně i formality zkontrolujeme dřív, než podepíšete.' : language === 'it' ? 'Controlliamo contratto, tasse e formalità prima della firma.' : 'We review the contract, taxes, and formalities before you sign.',
                  },
                  {
                    n: '04', href: '/process#step-4',
                    label: language === 'cs' ? 'Péče po koupí' : language === 'it' ? 'Assistenza post-acquisto' : 'Post-Purchase Support',
                    sub: language === 'cs' ? 'Po předání klíčů pomůžeme s účty, správou i prvním provozem.' : language === 'it' ? 'Dopo le chiavi vi aiutiamo con utenze, gestione e i primi mesi.' : 'After the keys, we help with utilities, management, and the first months.',
                  },
                ].map(({ n, href, label, sub }, index) => (
                  <Link key={n} href={href} data-reveal="step" style={{ '--d': `${140 + index * 90}ms` }} className="group flex flex-col gap-2 bg-transparent">
                    <span className="text-3xl font-black leading-none text-copper-700">{n}</span>
                    <p className="text-pretty text-base font-bold leading-snug text-gray-900">{label}</p>
                    <p className="text-pretty text-base leading-snug text-gray-700">{sub}</p>
                  </Link>
                ))}
              </div>
            </div>

            <figure data-reveal="photo" style={{ '--d': '180ms' }} className="relative h-72 overflow-hidden rounded-2xl sm:h-80 lg:h-full lg:min-h-[440px]" data-testid="process-photo">
                <Image
                  src="/Toscana.png"
                  alt={language === 'cs' ? 'Kamenný dům mezi cypřiši v toskánské krajině' : language === 'it' ? 'Casa in pietra tra i cipressi nella campagna toscana' : 'A stone house among cypresses in the Tuscan countryside'}
                  fill
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover object-[center_58%]"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(14,21,46,0.72) 0%, rgba(14,21,46,0.28) 34%, rgba(14,21,46,0) 58%)' }}
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-copper-200">
                    {language === 'cs' ? 'Toskánsko' : language === 'it' ? 'Toscana' : 'Tuscany'}
                  </p>
                  <Link
                    href="/properties?region=toscana"
                    className="mt-2 inline-flex items-center gap-1.5 text-base font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors hover:text-copper-200 hover:decoration-copper-200"
                  >
                    {language === 'cs' ? 'Zobrazit nemovitosti v Toskánsku' : language === 'it' ? 'Vedi gli immobili in Toscana' : 'View properties in Tuscany'}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </figcaption>
              </figure>
          </div>
      </section>

      {/* Testimonials Section */}
      <section data-testid="testimonials-section">
        <div className="rounded-[1.75rem] bg-gradient-to-br from-[#243056] to-[#0e152e] p-10 sm:p-16">
          <div data-reveal="rise" className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#c78b5a' }}>
                {language === 'cs' ? 'Reference' : language === 'it' ? 'Referenze' : 'References'}
              </p>
              <h2 className="text-pretty text-[2.05rem] font-bold leading-[1.15] text-white">
                {language === 'cs' ? 'Co říkají naši klienti.' :
                 language === 'it' ? 'Cosa dicono i nostri clienti.' :
                 'What our clients say.'}
              </h2>
            </div>
            <Link href="/reference" className="home-pill inline-flex w-fit shrink-0 items-center gap-1.5 self-start rounded-full bg-white px-5 py-2.5 text-base font-semibold text-[#0e152e] sm:self-end">
              {language === 'cs' ? 'Všechny reference' : language === 'it' ? 'Tutte le referenze' : 'All references'}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-y-8 md:grid-cols-3 md:gap-x-10">
            {[
              {
                name: 'Adéla Babišová',
                place: language === 'cs' ? 'Umbrie' : 'Umbria',
                quote: language === 'it' ? 'La mia decisione migliore è stata unire le forze con Domy v Itálii e affidarmi a un partner competente ed esperto, che ha scoperto degli errori nel contratto di compravendita preparato dall’agenzia immobiliare italiana. Un servizio davvero da dieci e lode.' : language === 'en' ? 'My best decision was joining forces with Domy v Itálii and relying on an experienced partner who understood the process and uncovered errors in the purchase contract prepared by the Italian estate agency. Truly first-class service.' : 'Moje nejlepší rozhodnutí bylo spojit síly s Domy v Itálii a nechat si krýt záda od parťáka, který tomu rozumí, má zkušenosti a odhalil chyby v kupní smlouvě, které chystala italská realitka. Servis vážně na jedničku s hvězdičkou.',
              },
              {
                name: 'Lenka Kluková',
                place: language === 'cs' ? 'Slovensko' : language === 'it' ? 'Slovacchia' : 'Slovakia',
                quote: language === 'it' ? 'Domy v Itálii è stata la scelta giusta: un approccio disponibile e rapido, la volontà di consigliare, una comunicazione tempestiva con le agenzie immobiliari e la verifica delle informazioni essenziali sugli immobili. Da parte nostra, soddisfazione assoluta.' : language === 'en' ? 'Domy v Itálii was the right choice: a helpful and fast approach, a willingness to advise us, prompt communication with estate agencies, and verification of essential property information. We are completely satisfied.' : 'Domy v Itálii byla ta správná volba — vstřícný a rychlý přístup, ochota poradit, promptná komunikace s realitními agenturami a prověření zásadních informací o nemovitostech. Za nás absolutní spokojenost.',
              },
              {
                name: 'Marcela Dejlová',
                place: language === 'cs' ? 'Itálie' : language === 'it' ? 'Italia' : 'Italy',
                quote: language === 'it' ? 'Grazie per il servizio perfetto, per l’aiuto nell’acquisto della casa, comprese tutte le necessarie procedure amministrative, per l’assistenza personale e per l’atteggiamento incredibilmente disponibile, gentile e amichevole. Un saluto dall’Italia.' : language === 'en' ? 'Thank you for the perfect service, the help with buying my house—including all the necessary administrative procedures—the personal assistance, and the incredibly helpful, kind, and friendly approach. Greetings from Italy.' : 'Děkuji za perfektní servis, pomoc při koupi domu včetně všech nezbytných úředních procedur, osobní asistenci a neuvěřitelně vstřícné, milé a přátelské jednání. Zdravím z Itálie.',
              },
            ].map(({ name, place, quote }, index) => (
              <div key={name} data-reveal="quote" style={{ '--d': `${index * 110}ms` }} className="flex flex-col gap-5">
                <p className="text-pretty line-clamp-4 text-lg leading-snug text-white/90">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
                    <span className="text-sm font-semibold text-white">{name.charAt(0)}</span>
                  </div>
                  <div className="leading-tight">
                    <p className="text-base font-semibold text-white">{name}</p>
                    <p className="text-sm font-medium text-copper-200">{place}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you need to know Section */}
      <section data-testid="main-content-container" className="-mx-5 bg-white px-5 py-16 sm:-mx-8 sm:px-8 sm:py-24 xl:-mx-[10rem] xl:px-[10rem]">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-x-16">

            <div data-reveal="fade" className="lg:sticky lg:top-28 lg:w-[36rem] lg:max-w-[36rem] lg:self-start">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#c78b5a' }}>
                {language === 'cs' ? 'Než začnete' : language === 'it' ? 'Prima di iniziare' : 'Before you start'}
              </p>
              <h2 className="text-pretty text-[2.05rem] font-bold leading-[1.15] text-gray-900" data-testid="section-description">
                {language === 'cs' ? 'Koupě domů v Itálii není jen o ceně.' :
                 language === 'it' ? "L'acquisto di una casa in Italia non riguarda solo il prezzo." :
                 "Buying a home in Italy isn't just about price."}
              </h2>
              <p className="text-pretty mt-3 text-base leading-snug text-gray-700">
                {language === 'cs' ? 'Rozhodnutí bez správných informací může stát čas, peníze i klid. Proto je důležité rozumět systému ještě před prvním krokem.' :
                 language === 'it' ? 'Una decisione senza le giuste informazioni può costare tempo, denaro e serenità. Per questo è importante capire il sistema prima del primo passo.' :
                 "Decisions without the right information can cost time, money, and peace of mind. That's why it's important to understand the system before the first step."}
              </p>
              <Link href="/guides" className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-[#c7895b] to-[#996945] px-5 py-2.5 text-base font-semibold text-white transition duration-200 hover:from-[#e8bc8a] hover:to-[#c48759]">
                {language === 'cs' ? 'Prozkoumat průvodce' : language === 'it' ? 'Esplora le guide' : 'Explore the guides'}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-col gap-7 lg:min-w-0 lg:flex-1" data-testid="why-italy-different-grid">

              {[
                { icon: <Globe className="h-4 w-4 text-white" />, href: '/guides/real-estate-purchase-system-italy', protected: true,
                  label: language === 'cs' ? 'Italský systém je jiný' : language === 'it' ? 'Il sistema italiano funziona diversamente' : 'The Italian system is different',
                  detail: language === 'cs' ? 'Jak probíhá rezervace, smlouva a převod a v čem se to liší od koupě v Česku.' : language === 'it' ? 'Come funzionano prenotazione, contratto e trasferimento, e in cosa differiscono da casa vostra.' : 'How a reservation, contract, and transfer work, and how that differs from buying at home.' },
                { icon: <Banknote className="h-4 w-4 text-white" />, href: '/guides/costs', protected: true,
                  label: language === 'cs' ? 'Cena není všechno' : language === 'it' ? 'Il prezzo non è tutto' : 'Price is not everything',
                  detail: language === 'cs' ? 'Daně, notář a poplatky, které v inzerátu neuvidíte.' : language === 'it' ? 'Tasse, notaio e costi che nell’annuncio non compaiono.' : 'Taxes, the notary, and fees that never appear in the listing.' },
                { icon: <AlertTriangle className="h-4 w-4 text-white" />, href: '/guides/mistakes', protected: true,
                  label: language === 'cs' ? 'Nejčastější chyby Čechů' : language === 'it' ? 'Errori più comuni dei cechi' : 'Most common mistakes by Czechs',
                  detail: language === 'cs' ? 'Na co si dát pozor dřív, než pošlete zálohu.' : language === 'it' ? 'Cosa controllare prima di versare un acconto.' : 'What to check before you send a deposit.' },
                { icon: <MapPin className="h-4 w-4 text-white" />, href: '/regions', protected: false,
                  label: language === 'cs' ? 'Region rozhoduje' : language === 'it' ? 'La regione fa la differenza' : 'Region matters',
                  detail: language === 'cs' ? 'Čím se liší Toskánsko, pobřeží a hory v ceně i v běžném provozu.' : language === 'it' ? 'Come cambiano Toscana, costa e montagna nel prezzo e nella vita di tutti i giorni.' : 'How Tuscany, the coast, and the mountains differ in price and day-to-day life.' },
                { icon: <HelpCircle className="h-4 w-4 text-white" />, href: '/faq', protected: false,
                  label: language === 'cs' ? 'Časté otázky' : language === 'it' ? 'Domande frequenti' : 'Frequently asked questions',
                  detail: language === 'cs' ? 'Krátké odpovědi na to, co se nás klienti ptají nejdřív.' : language === 'it' ? 'Risposte brevi alle domande che i clienti ci fanno per prime.' : 'Short answers to the questions clients ask us first.' },
              ].map(({ icon, href, protected: isProtected, label, detail }, index) => {
                const inner = (
                  <div key={href} className="group flex cursor-pointer items-start gap-4">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1b2642]">{icon}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-pretty text-base font-semibold leading-snug text-gray-900 group-hover:text-[#1b2642]">{label}</p>
                      <p className="text-pretty mt-1 text-base leading-snug text-gray-700">{detail}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-copper-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                )
                return isProtected
                  ? <ProtectedContentLink key={href} href={href} language={language} data-reveal="row" style={{ '--d': `${index * 80}ms` }}>{inner}</ProtectedContentLink>
                  : <Link key={href} href={href} data-reveal="row" style={{ '--d': `${index * 80}ms` }}>{inner}</Link>
              })}

            </div>
          </div>
      </section>
      <section data-testid="regions-section">
        <div>
          <div data-reveal="rise">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#c78b5a' }}>
            {language === 'cs' ? 'Regiony' : language === 'it' ? 'Regioni' : 'Regions'}
          </p>
          <h2 className="text-pretty text-[2.05rem] font-bold leading-[1.15] text-gray-900">
            {language === 'cs' ? 'Prozkoumejte nejžádanější regiony Itálie.' :
             language === 'it' ? 'Esplora le regioni più ricercate d\'Italia.' :
             'Explore Italy\'s most wanted regions.'}
          </h2>
          <p className="text-pretty mt-3 max-w-3xl text-base leading-snug text-gray-700">
            {language === 'cs' ? 'Ne celá Itálie je stejná. Vyberte si region, který vyhovuje vašemu rozpočtu, životnímu stylu a investičním cílům.' :
             language === 'it' ? 'Non tutta l\'Italia è uguale. Scegli una regione adatta al budget, allo stile di vita e agli obiettivi.' :
             'Not all of Italy is the same. Choose a region that fits your budget, lifestyle, and investment goals.'}
          </p>
          <Link href="/regions" className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-[#c7895b] to-[#996945] px-5 py-2.5 text-base font-semibold text-white transition duration-200 hover:from-[#e8bc8a] hover:to-[#c48759]">
            {language === 'cs' ? 'Prozkoumat regiony' : language === 'it' ? 'Visita le regioni' : 'Explore the regions'}
            <ChevronRight className="h-4 w-4" />
          </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                href: '/properties?region=sardegna', src: '/Sardegna.jpg', price: '€3,500-8,000/m2', yield: '5-8%',
                name: { cs: 'Sardinie', it: 'Sardegna', en: 'Sardinia' },
                blurb: {
                  cs: 'Křišťálové vody, panenské pláže, luxusní resorty',
                  it: 'Acque cristalline, spiagge incontaminate, resort di lusso',
                  en: 'Crystal waters, pristine beaches, luxury resorts',
                },
              },
              {
                href: '/properties?region=toscana', src: '/Toscana.png', price: '€2,500-6,000/m2', yield: '4-7%',
                name: { cs: 'Toskánsko', it: 'Toscana', en: 'Tuscany' },
                blurb: {
                  cs: 'Kamenné statky, vinice, stabilní poptávka po pronájmu',
                  it: 'Case coloniche in pietra, viste sui vigneti, domanda di affitto stabile',
                  en: 'Stone farmhouses, vineyard views, stable rental demand',
                },
              },
              {
                href: '/properties?region=emilia-romagna', src: '/Emilia-Romagna.jpg', price: '€2,000-5,000/m2', yield: '4-7%',
                name: { cs: 'Emilia-Romagna', it: 'Emilia-Romagna', en: 'Emilia-Romagna' },
                blurb: {
                  cs: 'Kulinářské hlavní město, historická města, zvlněné kopce',
                  it: 'Capitale culinaria, città storiche, dolci colline',
                  en: 'Culinary capital, historic cities, rolling hills',
                },
              },
              {
                href: '/properties?region=sicilia', src: '/Sicilia.jpg', price: '€1,500-4,000/m2', yield: '6-10%',
                name: { cs: 'Sicílie', it: 'Sicilia', en: 'Sicily' },
                blurb: {
                  cs: 'Historické paláce, barokní města, rostoucí trh',
                  it: 'Palazzi storici, città barocche, mercato emergente',
                  en: 'Historic palazzi, Baroque towns, emerging market',
                },
              },
              {
                href: '/properties?region=trentino-alto-adige', src: '/Trentino-Alto Adige.jpg', price: '€4,500-12,000/m2', yield: '3-6%',
                name: { cs: 'Trentino-Alto Adige', it: 'Trentino-Alto Adige', en: 'Trentino-Alto Adige' },
                blurb: {
                  cs: 'Dolomity, alpská jezera, jedinečná dvojí kultura',
                  it: 'Dolomiti, laghi alpini, cultura duale unica',
                  en: 'Dolomites, alpine lakes, unique dual culture',
                },
              },
              {
                href: '/properties?region=lazio', src: '/Lazio.webp', price: '€3,000-12,000/m2', yield: '4-6%',
                name: { cs: 'Lazio (Řím)', it: 'Lazio (Roma)', en: 'Lazio (Rome)' },
                blurb: {
                  cs: 'Historické centrum, moderní čtvrti, silný trh s pronájmem',
                  it: 'Centro storico, quartieri moderni, forte mercato degli affitti',
                  en: 'Historic center, modern districts, strong rental market',
                },
              },
            ].map((region, index) => (
              <Link key={region.href} href={region.href} data-reveal="card" style={{ '--d': `${index * 70}ms` }} className="group block overflow-hidden rounded-2xl bg-white shadow-[0_10px_32px_rgba(14,21,46,0.06)]">
                <span className="relative block aspect-[3/2] overflow-hidden">
                <Image
                  src={region.src}
                  alt={region.name[language] || region.name.en}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                </span>
                <span className="block p-5">
                  <span className="text-sm font-semibold text-copper-700">
                    {region.price}
                    {' · '}
                    {region.yield}
                    {' '}
                    {language === 'cs' ? 'výnos' : language === 'it' ? 'rendita' : 'yield'}
                  </span>
                  <span className="mt-1 block text-pretty text-xl font-semibold leading-snug text-gray-900">
                    {region.name[language] || region.name.en}
                  </span>
                  <span className="mt-1 block text-pretty text-base leading-snug text-gray-700">
                    {region.blurb[language] || region.blurb.en}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {SHOW_HOME_ARCHIVED_SECTIONS && (
      <>
      {/* Recent Success Stories Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-6" style={{maxWidth:"1200px"}}>
          <div className="text-center mb-8 sm:mb-12 animate-on-scroll" style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <h2 className="font-bold text-gray-900 mb-4">
              {language === 'cs' ? 'Od vyhledávání po klíče v ruce' :
               language === 'it' ? 'Dalla Ricerca alle Chiavi in Mano' :
               'From Search to Keys in Hand'}
            </h2>
            <p className="text-base text-gray-500">
              {language === 'cs' ? 'Skutečné výsledky od kupujících jako jste vy.' :
               language === 'it' ? 'Risultati reali da acquirenti come te.' :
               'Real results from buyers like you.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Success Story 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100 flex flex-col">
              <div className="aspect-video relative overflow-hidden flex-shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Tuscan farmhouse renovation"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded">SOLD</span>
                    <span className="text-white/90 text-xs">€280,000</span>
                  </div>
                </div>
              </div>
              <div className="p-8 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {language === 'cs' ? 'Obnovený toskánský statek' :
                     language === 'it' ? 'Fattoria Toscana Restaurata' :
                     'Restored Tuscan Farmhouse'}
                  </h3>
                  <p className="text-gray-600 text-base mb-4">
                    {language === 'cs' ? '"Tým se postaral o všechno: od počátečního hledání po povolení k rekonstrukci. Za 6 měsíců jsme měli náš dokonalý domov v Toskánsku."' :
                     language === 'it' ? '"Il team ha gestito tutto: dalla ricerca iniziale ai permessi di ristrutturazione. In 6 mesi abbiamo la nostra casa perfetta in Toscana."' :
                     '"The team handled everything: from initial search to renovation permits. In 6 months we had our perfect home in Tuscany."'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">Sarah & Marco</span><br/>
                      {language === 'cs' ? '6 měsíců • Toskánsko' :
                       language === 'it' ? '6 mesi • Toscana' :
                       '6 months • Tuscany'}
                    </div>
                    <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {language === 'cs' ? 'Dokončeno' :
                       language === 'it' ? 'Completato' :
                       'Completed'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-semibold">
                        {language === 'cs' ? 'Co jsme vyřešili:' :
                         language === 'it' ? 'Cosa abbiamo risolto:' :
                         'What we solved:'}
                      </span>
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• {language === 'cs' ? 'Katastrální kontrola' :
                          language === 'it' ? 'Controllo catastale' :
                          'Cadastral check'}</li>
                      <li>• {language === 'cs' ? 'Povolení k rekonstrukci' :
                          language === 'it' ? 'Permessi di ristrutturazione' :
                          'Renovation permits'}</li>
                    </ul>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 px-6 rounded-lg text-base transition-colors duration-200 mt-auto">
                  {language === 'cs' ? 'Zobrazit podobné nemovitosti' :
                   language === 'it' ? 'Vedi proprietà simili' :
                   'See similar properties'}
                </button>
              </div>
            </div>

            {/* Success Story 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100 flex flex-col">
              <div className="aspect-video relative overflow-hidden flex-shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1520637836862-4d197d17c93a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Sicilian palazzo"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded">SOLD</span>
                    <span className="text-white/90 text-xs">€450,000</span>
                  </div>
                </div>
              </div>
              <div className="p-8 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {language === 'cs' ? 'Sicilský barokní palác' :
                     language === 'it' ? 'Palazzo Barocco Siciliano' :
                     'Sicilian Baroque Palazzo'}
                  </h3>
                  <p className="text-gray-600 text-base mb-4">
                    {language === 'cs' ? '"Perfektní investice. Právní a daňové poradenství bylo klíčové pro dokončení nákupu bez překvapení."' :
                     language === 'it' ? '"Un investimento perfetto. La consulenza legale e fiscale è stata fondamentale per completare l\'acquisto senza sorprese."' :
                     '"Perfect investment. The legal and tax consultation was crucial to complete the purchase without surprises."'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">James & Elena</span><br/>
                      {language === 'cs' ? '4 měsíce • Sicílie' :
                       language === 'it' ? '4 mesi • Sicilia' :
                       '4 months • Sicily'}
                    </div>
                    <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {language === 'cs' ? 'Dokončeno' :
                       language === 'it' ? 'Completato' :
                       'Completed'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-semibold">
                        {language === 'cs' ? 'Co jsme vyřešili:' :
                         language === 'it' ? 'Cosa abbiamo risolto:' :
                         'What we solved:'}
                      </span>
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• {language === 'cs' ? 'Kompletní daňová analýza' :
                          language === 'it' ? 'Analisi fiscale completa' :
                          'Complete tax analysis'}</li>
                      <li>• {language === 'cs' ? 'Mezinárodní právní podpora' :
                          language === 'it' ? 'Supporto legale internazionale' :
                          'International legal support'}</li>
                    </ul>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2 px-4 rounded-lg text-base transition-all duration-300 mt-auto">
                  {language === 'cs' ? 'Zobrazit podobné nemovitosti' :
                   language === 'it' ? 'Vedi proprietà simili' :
                   'See similar properties'}
                </button>
              </div>
            </div>

            {/* Success Story 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100 flex flex-col">
              <div className="aspect-video relative overflow-hidden flex-shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Ligurian coastal apartment"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded">SOLD</span>
                    <span className="text-white/90 text-xs">€320,000</span>
                  </div>
                </div>
              </div>
              <div className="p-8 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {language === 'cs' ? 'Pobřežní apartmán v Ligurii' :
                     language === 'it' ? 'Appartamento Costiero Liguria' :
                     'Ligurian Coastal Apartment'}
                  </h3>
                  <p className="text-gray-600 text-base mb-4">
                    {language === 'cs' ? '"Od prvního kontaktu po klíče v ruce za 3 měsíce. Služba správy pronájmů je výjimečná."' :
                     language === 'it' ? '"Dal primo contatto alle chiavi in mano in 3 mesi. Il servizio di gestione degli affitti è eccezionale."' :
                     '"From first contact to keys in hand in 3 months. The rental management service is exceptional."'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">Anna & David</span><br/>
                      {language === 'cs' ? '3 měsíce • Ligurie' :
                       language === 'it' ? '3 mesi • Liguria' :
                       '3 months • Liguria'}
                    </div>
                    <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {language === 'cs' ? 'Dokončeno' :
                       language === 'it' ? 'Completato' :
                       'Completed'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-semibold">
                        {language === 'cs' ? 'Co jsme vyřešili:' :
                         language === 'it' ? 'Cosa abbiamo risolto:' :
                         'What we solved:'}
                      </span>
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• {language === 'cs' ? 'Správa pronájmů' :
                          language === 'it' ? 'Gestione affitti' :
                          'Rental management'}</li>
                      <li>• {language === 'cs' ? 'Turistická povolení' :
                          language === 'it' ? 'Permessi turistici' :
                          'Tourist permits'}</li>
                    </ul>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2 px-4 rounded-lg text-base transition-all duration-300 mt-auto">
                  {language === 'cs' ? 'Zobrazit podobné nemovitosti' :
                   language === 'it' ? 'Vedi proprietà simili' :
                   'See similar properties'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Webinar Section */}
      <section className="py-16 sm:py-24 bg-[#f7f6f3]">
        <div className="container mx-auto px-6" style={{maxWidth:"1200px"}}>
          <div className="text-center mb-10 sm:mb-16 animate-on-scroll">
            <h2 className="font-bold text-gray-900 mb-8">
              {language === 'cs' ? 'Kupování v Itálii: proces, úskalí a čísla' :
               language === 'it' ? 'Acquistare in Italia: Il Processo, le Insidie e i Numeri' :
               'Buying in Italy: The Process, the Pitfalls, and the Numbers'}
            </h2>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              {language === 'cs' ? 'Kupování v Itálii: proces, úskalí a čísla — živě, každý týden.' :
               language === 'it' ? 'Acquistare in Italia: il processo, le insidie e i numeri — dal vivo, ogni settimana.' :
               'Buying in Italy: the process, the pitfalls, and the numbers—live, every week.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Next Date + Agenda */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {language === 'cs' ? 'Příští webinář' :
                   language === 'it' ? 'Prossimo Webinar' :
                   'Next Webinar'}
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  {language === 'cs' ? 'Středa 15. ledna 2025' :
                   language === 'it' ? 'Mercoledì 15 Gennaio 2025' :
                   'Wednesday, January 15, 2025'}
                </p>
                <p className="text-lg font-semibold text-slate-700">
                  {language === 'cs' ? '19:00 - 20:30 CET' :
                   language === 'it' ? '19:00 - 20:30 CET' :
                   '7:00 - 8:30 PM CET'}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'cs' ? 'Program' :
                   language === 'it' ? 'Agenda' :
                   'Agenda'}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                    <p className="text-gray-700">
                      {language === 'cs' ? 'Přehled procesu nákupu' :
                       language === 'it' ? 'Panoramica del processo di acquisto' :
                       'Process overview'}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                    <p className="text-gray-700">
                      {language === 'cs' ? 'Daně a poplatky' :
                       language === 'it' ? 'Tasse e commissioni' :
                       'Taxes & fees'}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                    <p className="text-gray-700">
                      {language === 'cs' ? 'Běžná úskalí' :
                       language === 'it' ? 'Insidie comuni' :
                       'Common pitfalls'}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                    <p className="text-gray-700">
                      {language === 'cs' ? 'Živé Q&A' :
                       language === 'it' ? 'Q&A dal vivo' :
                       'Live Q&A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-base text-slate-800 font-medium">
                  {language === 'cs' ? 'Zdarma pro členy Klubu pro klienty. Omezený počet míst.' :
                   language === 'it' ? 'Gratuito per i membri del Klub pro klienty. Posti limitati.' :
                   'Free for Klub pro klienty members. Limited seats.'}
                </p>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('forms.webinar.title', language)}
                </h3>
                <p className="text-gray-600">
                  {t('forms.webinar.subtitle', language)}
                </p>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    {t('forms.webinar.fullName', language)}
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder={t('forms.webinar.fullNamePlaceholder', language)}
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    {t('forms.webinar.email', language)}
                  </label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder={t('forms.webinar.emailPlaceholder', language)}
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    {t('forms.webinar.region', language)}
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                    <option value="">
                      {t('forms.webinar.selectRegion', language)}
                    </option>
                    {WEBINAR_REGION_VALUES.map((value, index) => (
                      <option key={value} value={value}>
                        {t('forms.webinar.regions', language)[index] || value}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-all duration-200 hover:shadow-lg shadow-lg"
                >
                  {t('forms.webinar.submit', language)}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  {t('forms.webinar.consent', language)}
                </p>

                <FormPrivacyNotice language={language} purpose="webinar" className="text-left" />
              </form>
            </div>
          </div>
        </div>
      </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-6" style={{maxWidth:"1200px"}}>
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-bold text-gray-900 mb-8">
              {language === 'cs' ? 'Často kladené otázky' :
               language === 'it' ? 'Domande Frequenti' :
               'Frequently Asked Questions'}
            </h2>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              {language === 'cs' ? 'Odpovědi, které potřebujete před rozhodnutím.' :
               language === 'it' ? 'Le risposte di cui hai bisogno prima di decidere.' :
               'The answers you need before you decide.'}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: {
                  cs: 'Jaké daně a poplatky mohu očekávat při koupi v Itálii?',
                  en: 'What taxes and fees should I expect when buying in Italy?',
                  it: 'Quali tasse e commissioni devo aspettarmi quando acquisto in Italia?'
                },
                answer: {
                  cs: 'Daně zahrnují registrační daň (2-9% v závislosti na kategorii), DPH (4-10% pro novostavby), notářské poplatky (1-2%), právní poplatky (1-2%) a katastrální poplatky. Celkem se může pohybovat od 10% do 15% z kupní ceny.',
                  en: 'Taxes include registration tax (2-9% depending on category), VAT (4-10% for new builds), notary fees (1-2%), legal fees (1-2%), and cadastral fees. Total can range from 10% to 15% of the purchase price.',
                  it: 'Le tasse includono l\'imposta di registro (2-9% a seconda della categoria), l\'IVA (4-10% per nuove costruzioni), le spese notarili (1-2%), le spese legali (1-2%) e le spese catastali. Il totale può variare dal 10% al 15% del prezzo di acquisto.'
                }
              },
              {
                question: {
                  cs: 'Mohou cizinci kupovat nemovitosti v Itálii?',
                  en: 'Can foreigners buy property in Italy?',
                  it: 'Gli stranieri possono acquistare proprietà in Italia?'
                },
                answer: {
                  cs: 'Ano, cizinci mohou kupovat nemovitosti v Itálii bez omezení. Budete potřebovat Codice Fiscale (daňové identifikační číslo) a italský bankovní účet. Občané mimo EU mohou potřebovat dodatečnou dokumentaci.',
                  en: 'Yes, foreigners can buy property in Italy without restrictions. You\'ll need a Codice Fiscale (tax ID number) and an Italian bank account. Non-EU citizens may need additional documentation.',
                  it: 'Sì, gli stranieri possono acquistare proprietà in Italia senza restrizioni. Avrai bisogno di un Codice Fiscale (numero di identificazione fiscale) e di un conto bancario italiano. I cittadini non UE potrebbero aver bisogno di documentazione aggiuntiva.'
                }
              },
              {
                question: {
                  cs: 'Potřebuji Codice Fiscale?',
                  en: 'Do I need a Codice Fiscale?',
                  it: 'Ho bisogno di un Codice Fiscale?'
                },
                answer: {
                  cs: 'Ano, Codice Fiscale je povinné pro jakoukoliv transakci s nemovitostmi v Itálii. Je zdarma a lze jej získat na kterémkoliv italském konzulátu nebo místním daňovém úřadě v Itálii. Můžeme vám pomoci s procesem.',
                  en: 'Yes, a Codice Fiscale is mandatory for any property transaction in Italy. It\'s free and can be obtained from any Italian consulate or local tax office in Italy. We can help you with the process.',
                  it: 'Sì, un Codice Fiscale è obbligatorio per qualsiasi transazione immobiliare in Italia. È gratuito e può essere ottenuto presso qualsiasi consolato italiano o ufficio delle entrate locale in Italia. Possiamo aiutarti nel processo.'
                }
              },
              {
                question: {
                  cs: 'Jak dlouho trvá proces od nabídky po klíče?',
                  en: 'How long does the process take from offer to keys?',
                  it: 'Quanto tempo ci vuole dall\'offerta alle chiavi?'
                },
                answer: {
                  cs: 'Typicky 3-6 měsíců. Po přijetí nabídky podepíšete předběžnou smlouvu (compromesso), poté finální kupní smlouvu (rogito) u notáře. Načasování závisí na právních kontrolách, hypotékách a dostupnosti stran.',
                  en: 'Typically 3-6 months. After accepted offer, you sign the preliminary contract (compromesso), then the final deed (rogito) with a notary. Timing depends on legal checks, mortgages, and party availability.',
                  it: 'Tipicamente 3-6 mesi. Dopo l\'offerta accettata, firmi il contratto preliminare (compromesso), poi il rogito finale (atto di compravendita) davanti al notaio. I tempi dipendono dai controlli legali, dai mutui e dalla disponibilità delle parti.'
                }
              },
              {
                question: {
                  cs: 'Možnosti hypotéky pro nerezidenty?',
                  en: 'Mortgage options for non-residents?',
                  it: 'Opzioni di mutuo per non residenti?'
                },
                answer: {
                  cs: 'Italské banky poskytují hypotéky nerezidentům, typicky až 50-60% hodnoty nemovitosti. Budete potřebovat doklad o příjmech, bankovní výpisy a dobré kreditní skóre. Úrokové sazby jsou konkurenceschopné pro občany EU.',
                  en: 'Italian banks offer mortgages to non-residents, typically up to 50-60% of property value. You\'ll need proof of income, bank statements, and good credit score. Interest rates are competitive for EU citizens.',
                  it: 'Le banche italiane offrono mutui ai non residenti, tipicamente fino al 50-60% del valore della proprietà. Avrai bisogno di prova di reddito, estratti conto bancari e un buon punteggio di credito. I tassi di interesse sono competitivi per i cittadini UE.'
                }
              },
              {
                question: {
                  cs: 'Rozdíl mezi předběžnou smlouvou a rogito?',
                  en: 'Difference between preliminary contract and rogito?',
                  it: 'Differenza tra contratto preliminare e rogito?'
                },
                answer: {
                  cs: 'Předběžná smlouva (compromesso) je počáteční dohoda se zálohou (10-20%). Rogito je finální kupní smlouva u notáře, kde dochází k převodu vlastnictví a zaplatíte zbytek. Obě jsou právně závazné.',
                  en: 'The preliminary contract (compromesso) is the initial agreement with a deposit (10-20%). The rogito is the final deed of sale with a notary where ownership transfers and you pay the balance. Both are legally binding.',
                  it: 'Il contratto preliminare (compromesso) è l\'accordo iniziale con un deposito (10-20%). Il rogito è l\'atto di vendita finale davanti al notaio dove avviene il trasferimento di proprietà e paghi il saldo. Entrambi sono legalmente vincolanti.'
                }
              },
              {
                question: {
                  cs: 'Průběžné náklady (IMU, TARI, poplatky za bytové družstvo)?',
                  en: 'Ongoing costs (IMU, TARI, condo fees)?',
                  it: 'Costi correnti (IMU, TARI, spese condominiali)?'
                },
                answer: {
                  cs: 'Roční náklady zahrnují: IMU (obecní daň z nemovitostí, 0,4-1,06 % katastrální hodnoty), TARI (daň z odpadu, €200-600/rok), poplatky za bytové družstvo (pokud se vztahují, €50-200/měsíc), energie a pojištění. Počítejte s 1-2 % hodnoty nemovitosti ročně.',
                  en: 'Annual costs include: IMU (municipal property tax, 0.4-1.06% of cadastral value), TARI (waste tax, €200-600/year), condo fees (if applicable, €50-200/month), utilities, and insurance. Budget 1-2% of property value per year.',
                  it: 'I costi annuali includono: IMU (imposta municipale, 0,4-1,06% del valore catastale), TARI (tassa rifiuti, €200-600/anno), spese condominiali (se applicabili, €50-200/mese), utenze e assicurazione. Budget 1-2% del valore della proprietà all\'anno.'
                }
              },
              {
                question: {
                  cs: 'Jak fungují pronájmy a povolení pro krátkodobé pobyty?',
                  en: 'How do rentals and permits work for short-term stays?',
                  it: 'Come funzionano gli affitti e i permessi per soggiorni brevi?'
                },
                answer: {
                  cs: 'Krátkodobé pronájmy vyžadují registraci u místní obce a regionální identifikační kód (CIR/CIN). Musíte platit turistickou daň a dodržovat místní předpisy. Některé oblasti mají omezení. Provázíme vás procesem dodržování předpisů.',
                  en: 'Short-term rentals require registration with local municipality and regional ID code (CIR/CIN). You must pay tourist tax and comply with local regulations. Some areas have restrictions. We guide you through compliance.',
                  it: 'Gli affitti brevi richiedono registrazione con il comune locale e codice identificativo regionale (CIR/CIN). Devi pagare l\'imposta di soggiorno (tassa turistica) e rispettare le normative locali. Alcune zone hanno restrizioni. Ti guidiamo attraverso la conformità.'
                }
              },
              {
                question: {
                  cs: 'Potřebuji právníka nebo notáře—jaký je rozdíl?',
                  en: 'Do I need a lawyer or notary—what\'s the difference?',
                  it: 'Ho bisogno di un avvocato o notaio—qual è la differenza?'
                },
                answer: {
                  cs: 'Notář je povinný (jmenován prodávajícím nebo kupujícím) a řídí právní převod. Právník je volitelný, ale doporučuje se pro prověrky due diligence, přezkoumání smluv a ochranu vašich zájmů. Vždy doporučujeme oba.',
                  en: 'A notary is mandatory (appointed by seller or buyer) and handles the legal transfer. A lawyer is optional but recommended for due diligence checks, contract review, and protecting your interests. We always recommend both.',
                  it: 'Il notaio è obbligatorio (nominato dal venditore o acquirente) e gestisce il trasferimento legale. Un avvocato è facoltativo ma consigliato per i controlli di due diligence, la revisione dei contratti e la tutela dei tuoi interessi. Noi raccomandiamo sempre entrambi.'
                }
              },
              {
                question: {
                  cs: 'Můžete pomoci s rekonstrukcemi a povoleními?',
                  en: 'Can you help with renovations and permits?',
                  it: 'Potete aiutarmi con ristrutturazioni e permessi?'
                },
                answer: {
                  cs: 'Ano, spolupracujeme s důvěryhodnými místními architekty a dodavateli. Pomáháme vám získat potřebná povolení (CILA, SCIA, stavební povolení), řídit nabídky a dohlížet na práce. Rekonstrukce se mohou kvalifikovat pro daňové pobídky až do 110% (Superbonus).',
                  en: 'Yes, we work with trusted local architects and contractors. We help you obtain necessary permits (CILA, SCIA, building permit), manage quotes, and oversee work. Renovations may qualify for tax incentives up to 110% (Superbonus).',
                  it: 'Sì, lavoriamo con architetti e appaltatori locali fidati. Ti aiutiamo a ottenere i permessi necessari (CILA, SCIA, permesso di costruire), gestire preventivi e supervisionare i lavori. Le ristrutturazioni possono qualificarsi per incentivi fiscali fino al 110% (Superbonus).'
                }
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden hover:shadow-lg hover:border-blue-200/50 transition-all duration-300 group">
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-300 group-hover:border-blue-200/30"
                >
                  <span className="text-lg font-semibold text-gray-900">
                    {faq.question[language] || faq.question.en}
                  </span>
                  <svg 
                    className={`w-6 h-6 text-blue-600 flex-shrink-0 ml-4 transition-all duration-300 ${openFaqIndex === index ? 'rotate-180 text-blue-800' : 'group-hover:text-blue-700'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaqIndex === index && (
                  <div className="px-8 py-6 bg-gradient-to-r from-blue-50/30 to-indigo-50/20 border-t border-blue-200/30">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer[language] || faq.answer.en}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA at end */}
          <div className="text-center mt-16">
            <p className="text-xl text-gray-700 mb-6">
              {language === 'cs' ? 'Máte ještě otázku?' :
               language === 'it' ? 'Hai ancora una domanda?' :
               'Still have a question?'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white hover:bg-gray-100 text-slate-700 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg">
                {language === 'cs' ? 'Připojte se k webináři' :
                 language === 'it' ? 'Partecipa al Webinar' :
                 'Join the Webinar'}
              </button>
              <button
                className="text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg"
                style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}
                onClick={handleBookCall}
              >
                {language === 'cs' ? 'Rezervovat hovor' :
                 language === 'it' ? 'Prenota una Chiamata' :
                 'Book a Call'}
              </button>
            </div>
          </div>
        </div>
      </section>
      </>
      )}


      <PropertySlider variant="home" language={language} initialProperties={initialProperties} preparedProperties={sliderProperties} />

      <section data-testid="start-journey-section">
        <div>
          <div data-reveal="rise">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#c78b5a' }}>
            {language === 'cs' ? 'Další krok' : language === 'it' ? 'Prossimo passo' : 'Next step'}
          </p>
          <h2 className="text-pretty text-[2.05rem] font-bold leading-[1.15] text-gray-900">
            {language === 'cs' ? 'Začněte svou cestu.' :
             language === 'it' ? 'Inizia il tuo viaggio.' :
             'Start your journey.'}
          </h2>
          <p className="text-pretty mt-3 max-w-3xl text-base leading-snug text-gray-700">
            {language === 'cs' ? 'Vyberte si, jak chcete pokračovat. Jsme tu, abychom vás provedli každým krokem procesu.' :
             language === 'it' ? 'Scegli come vuoi procedere. Siamo qui per guidarti in ogni fase del processo.' :
             'Choose how you want to proceed. We\'re here to guide you through every step of the process.'}
          </p>
          </div>

          <div className="mt-10 flex flex-col gap-4">
            <div data-reveal="card" className="flex flex-col gap-8 rounded-[1.75rem] bg-white p-8 shadow-[0_18px_50px_rgba(14,21,46,0.07)] sm:p-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
              <div className="max-w-2xl">
                <h3 className="text-pretty text-2xl font-bold leading-snug text-gray-900">
                  {language === 'cs' ? 'Rezervujte si bezplatnou konzultaci' :
                   language === 'it' ? 'Prenota una consulenza gratuita' :
                   'Book a free consultation'}
                </h3>
                <p className="text-pretty mt-3 text-base leading-relaxed text-gray-700">
                  {language === 'cs'
                    ? 'Promluvte si s jedním z našich expertů na 15–20 minut. Prodiskutujte své potřeby, rozpočet a získejte osobní rady ohledně regionů a typů nemovitostí.'
                    : language === 'it'
                    ? 'Parla con uno dei nostri esperti per 15–20 minuti. Discuti esigenze, budget e ricevi consigli su regioni e tipi di proprietà.'
                    : 'Speak with one of our experts for 15–20 minutes. Discuss your needs, budget, and get advice on regions and property types.'}
                </p>
                <ul className="mt-5 flex flex-col gap-2">
                  {[
                    language === 'cs' ? 'Žádné náklady, žádný závazek' : language === 'it' ? 'Nessun costo, nessun impegno' : 'No cost, no commitment',
                    language === 'cs' ? 'Experti, kteří mluví česky, anglicky a italsky' : language === 'it' ? 'Esperti che parlano ceco, inglese e italiano' : 'Experts who speak Czech, English, and Italian',
                    language === 'cs' ? 'Osobní rady na základě vašeho profilu' : language === 'it' ? 'Consigli personalizzati in base al tuo profilo' : 'Personalized advice based on your profile',
                  ].map((item) => (
                    <li key={item} className="flex items-baseline gap-2 text-pretty text-sm font-medium leading-snug tracking-wide text-gray-800">
                      <span className="font-semibold text-copper-700" aria-hidden="true">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0">
                <Link href="/book-call" className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-[#c7895b] to-[#996945] px-5 py-2.5 text-base font-semibold text-white transition duration-200 hover:from-[#e8bc8a] hover:to-[#c48759]">
                  {language === 'cs' ? 'Rezervovat hovor' : language === 'it' ? 'Prenota una chiamata' : 'Book a call'}
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-sm text-gray-500">
                  {language === 'cs' ? 'Pondělí–pátek, 9:00–18:00' :
                   language === 'it' ? 'Lunedì–venerdì, 9:00–18:00' :
                   'Monday–Friday, 9:00–18:00'}
                </p>
              </div>
            </div>

            <div data-reveal="card" style={{ '--d': '120ms' }} className="flex flex-col gap-8 rounded-[1.75rem] bg-gradient-to-br from-[#243056] to-[#0e152e] p-8 sm:p-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
              <div className="max-w-2xl">
                <h3 className="text-pretty text-2xl font-bold leading-snug text-white">
                  {language === 'cs' ? 'Spustit osobní vyhledávač nemovitostí' :
                   language === 'it' ? 'Avvia il personal property finder' :
                   'Start the personal property finder'}
                </h3>
                <p className="text-pretty mt-3 text-base leading-relaxed text-white/80">
                  {language === 'cs'
                    ? 'Vyplňte náš 60sekundový formulář a získejte kurátorované nabídky přímo do schránky, přizpůsobené rozpočtu, regionu a účelu.'
                    : language === 'it'
                    ? 'Completa il modulo di 60 secondi e ricevi annunci curati nella posta, adattati a budget, regione e scopo.'
                    : 'Complete our 60-second form and get curated listings in your inbox, tailored to your budget, region, and purpose.'}
                </p>
                <ul className="mt-5 flex flex-col gap-2">
                  {[
                    language === 'cs' ? 'Ručně vybrané nabídky jen pro vás' : language === 'it' ? 'Annunci selezionati manualmente per te' : 'Hand-picked listings just for you',
                    language === 'cs' ? 'Vyberte si frekvenci doručování' : language === 'it' ? 'Scegli la frequenza di invio' : 'Choose your delivery frequency',
                    language === 'cs' ? 'Bezplatný přístup do Klubu pro klienty' : language === 'it' ? 'Accesso gratuito al Klub pro klienty' : 'Free client-club access included',
                  ].map((item) => (
                    <li key={item} className="flex items-baseline gap-2 text-pretty text-sm font-medium leading-snug tracking-wide text-white/90">
                      <span className="font-semibold text-copper-200" aria-hidden="true">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={handleStartFinder}
                  className="home-pill inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-base font-semibold text-[#0e152e]"
                >
                  {language === 'cs' ? 'Spustit vyhledávač' : language === 'it' ? 'Avvia il finder' : 'Start the finder'}
                  <ChevronRight className="h-4 w-4" />
                </button>
                <p className="mt-3 text-sm text-white/60">
                  {language === 'cs' ? 'Není vyžadována kreditní karta.' :
                   language === 'it' ? 'Nessuna carta di credito richiesta.' :
                   'No credit card required.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-testid="premium-club-section">
        <div className="rounded-[1.75rem] bg-gradient-to-br from-[#243056] to-[#0e152e] p-10 sm:p-16">
          <div data-reveal="rise">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#c78b5a' }}>
            {language === 'cs' ? 'Klub pro klienty' : language === 'it' ? 'Club clienti' : 'Client club'}
          </p>
          <h2 className="text-pretty text-[2.05rem] font-bold leading-[1.15] text-white">
            {language === 'cs' ? 'Jste si jisti koupí domů v Itálii?' :
             language === 'it' ? 'Sei sicuro di comprare casa in Italia?' :
             'Are you sure about buying a home in Italy?'}
          </h2>
          <p className="text-pretty mt-3 max-w-3xl text-base leading-snug text-white/80">
            {language === 'cs' ? 'Pak potřebujete víc než obecné informace.' :
             language === 'it' ? 'Allora ti serve di più che delle info generiche.' :
             'Then you need more than generic information.'}
          </p>
          <button
            type="button"
            onClick={() => setIsKlubModalOpen(true)}
            className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-[#c7895b] to-[#996945] px-5 py-2.5 text-base font-semibold text-white transition duration-200 hover:from-[#e8bc8a] hover:to-[#c48759]"
          >
            {language === 'cs' ? 'Připojit se zdarma' :
             language === 'it' ? 'Unisciti gratuitamente' :
             'Join for free'}
            <ChevronRight className="h-4 w-4" />
          </button>

          <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
              {[
                language === 'cs' ? 'Personalizované vyhledávání' : language === 'it' ? 'Ricerca personalizzata' : 'Personalized search',
                language === 'cs' ? 'Privátní dashboard' : language === 'it' ? 'Dashboard privata' : 'Private dashboard',
                language === 'cs' ? 'Prioritní komunikace' : language === 'it' ? 'Comunicazione prioritaria' : 'Priority communication',
                language === 'cs' ? 'Prémiový obsah' : language === 'it' ? 'Contenuti premium' : 'Premium content',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-pretty text-base font-semibold leading-snug text-white">
                  <Check className="h-4 w-4 flex-shrink-0 text-copper-200" />
                  {item}
                </li>
              ))}
              <li className="text-pretty text-base leading-snug text-white/80">
                <span className="font-semibold text-copper-200">
                  {language === 'cs' ? 'Zdarma.' : language === 'it' ? 'Gratis.' : 'Free.'}
                </span>
                {' '}
                {language === 'cs' ? 'Bez skrytých poplatků.' :
                 language === 'it' ? 'Nessuna commissione nascosta.' :
                 'No hidden fees.'}
              </li>
            </ul>
          </div>

            <div data-reveal="rise" style={{ '--d': '80ms' }} className="mt-10">
              <h3 className="text-pretty text-base font-bold leading-snug text-white">
                {language === 'cs' ? 'Exkluzivní obsah' :
                 language === 'it' ? 'Contenuti esclusivi' :
                 'Exclusive contents'}
              </h3>
              <p className="text-pretty mt-1 max-w-2xl text-base leading-snug text-white/75">
                  {user
                    ? (language === 'cs' ? 'Vaše prémiové články a průvodci.' :
                       language === 'it' ? 'I tuoi articoli e guide premium.' :
                       'Your premium articles and guides.')
                    : (language === 'cs' ? 'Zaregistrujte se zdarma a získejte přístup k prémiovým článkům.' :
                       language === 'it' ? 'Registrati gratis per accedere ai contenuti premium.' :
                       'Register for free to unlock premium articles and guides.')}
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
              {[
                {
                  title: {
                    en: 'How to Buy a House in Italy: Complete Guide',
                    cs: 'Jak koupit dům v Itálii: Kompletní průvodce',
                    it: 'Come acquistare una casa in Italia: guida completa',
                  },
                  excerpt: {
                    en: 'Everything you need to know about documents, taxes, and procedures for buying property in Italy.',
                    cs: 'Vše, co potřebujete vědět o dokumentech, daních a postupech při koupi nemovitostí v Itálii.',
                    it: 'Tutto quello che devi sapere sui documenti, tasse e procedure per acquistare immobili in Italia.',
                  },
                  image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop',
                  link: '/guides/costs',
                },
                {
                  title: {
                    en: 'Most Common Czech Mistakes When Buying in Italy',
                    cs: 'Nejčastější chyby Čechů při koupi domů v Itálii',
                    it: 'Errori più comuni dei cechi nell\'acquisto in Italia',
                  },
                  excerpt: {
                    en: 'What to watch out for to avoid losing time and money. Problems arise from unfamiliarity, not carelessness.',
                    cs: 'Na co si dát pozor, abyste neztratili čas a peníze. Problémy vznikají z neznalosti, ne z nepozornosti.',
                    it: 'A cosa fare attenzione per non perdere tempo e denaro. I problemi nascono dalla scarsa conoscenza, non dalla disattenzione.',
                  },
                  image: '/articles/common-mistakes-laptop-stress.jpg',
                  link: '/guides/mistakes',
                },
                {
                  title: {
                    en: 'Investing in Italian Real Estate: Opportunities and Risks',
                    cs: 'Investice do italských nemovitostí: Příležitosti a rizika',
                    it: 'Investire in immobili italiani: opportunità e rischi',
                  },
                  excerpt: {
                    en: 'In-depth analysis of the Italian real estate market and investment strategies.',
                    cs: 'Podrobná analýza italského realitního trhu a investičních strategií.',
                    it: 'Analisi approfondita del mercato immobiliare italiano e strategie di investimento.',
                  },
                  image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=800&auto=format&fit=crop',
                  link: '/blog',
                },
              ].map((article, index) => (
                <button
                  key={article.link}
                  type="button"
                  data-reveal="card"
                  style={{ '--d': `${index * 90}ms` }}
                  onClick={() => {
                    if (user) window.location.href = article.link
                    else setIsKlubModalOpen(true)
                  }}
                  className="group flex flex-col bg-transparent text-left"
                >
                  <span className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
                    <Image src={article.image} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                  </span>
                  <span className="mt-4 text-pretty text-lg font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-copper-200">{article.title[language]}</span>
                  <span className="text-pretty mt-1 text-base leading-snug text-white/75 line-clamp-2">{article.excerpt[language]}</span>
                  {!user && (
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-copper-200">
                      <Lock className="h-3.5 w-3.5" />
                      {language === 'cs' ? 'Zaregistrujte se pro čtení' :
                       language === 'it' ? 'Registrati per leggere' :
                       'Register to read'}
                    </span>
                  )}
                </button>
              ))}
              </div>
        </div>
      </section>


        </div>
      </div>

      {/* Footer */}
      <Footer language={language} />
      
      {/* Klub pro klienty info modal (middle step before auth) */}
      <KlubInfoModal
        isOpen={isKlubModalOpen}
        language={language}
        onClose={() => setIsKlubModalOpen(false)}
        onRegister={() => {
          setIsKlubModalOpen(false)
          setAuthModalTab('signup')
          setIsAuthModalOpen(true)
        }}
        onLogin={() => {
          setIsKlubModalOpen(false)
          setAuthModalTab('login')
          setIsAuthModalOpen(true)
        }}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        onAuthSuccess={handleAuthSuccess}
        defaultTab={authModalTab}
        language={language}
        title={t('auth.loginRequired', language)}
        message={t('auth.favoriteLoginMessage', language)}
      />
    </div>
  )
}
