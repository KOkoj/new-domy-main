import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03'

// Create clients with fallback values to prevent build-time errors
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
})

// Write client for mutations (requires API token)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const builder = projectId !== 'placeholder' ? imageUrlBuilder(client) : null

export function urlForImage(source) {
  if (!builder) return null
  return builder.image(source)
}

// Helper function to get localized field
export function getLocalizedField(field, locale, fallbackLocale = 'en') {
  if (!field) return ''
  return field[locale] || field[fallbackLocale] || Object.values(field)[0] || ''
}

// GROQ queries for property data
export const FEATURED_PROPERTIES_QUERY = `
  *[_type == "listing" && featured == true && !(_id in path("drafts.**"))] | order(_createdAt desc) [0...6] {
    _id,
    title,
    slug,
    propertyType,
    price,
    "location": {
      "city": city->{
        name,
        slug,
        "region": region->{
          name,
          country
        }
      },
      address,
      coordinates
    },
    specifications,
    "images": images[]{
      ...,
      "url": coalesce(url, asset->url)
    },
    mainImage,
    status
  }
`

export const ALL_PROPERTIES_QUERY = `
  *[_type == "listing" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
    _id,
    title,
    slug,
    propertyType,
    price,
    description,
    specifications,
    "location": {
      "city": city->{
        name,
        slug,
        "region": region->{
          name,
          country
        }
      },
      address,
      coordinates
    },
    amenities[]->{
      _id,
      name,
      category
    },
    developer->{
      _id,
      name,
      logo
    },
    "images": images[]{
      ...,
      "url": coalesce(url, asset->url)
    },
    mainImage,
    status,
    featured,
    _createdAt
  }
`

export const PROPERTY_BY_SLUG_QUERY = `
  *[_type == "listing" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    propertyType,
    price,
    description,
    specifications,
    "location": {
      "city": city->{
        name,
        slug,
        "region": region->{
          name,
          country
        }
      },
      address,
      coordinates
    },
    amenities[]->{
      _id,
      name,
      description,
      category
    },
    developer->{
      _id,
      name,
      description,
      logo,
      contact
    },
    "images": images[]{
      ...,
      "url": coalesce(url, asset->url)
    },
    mainImage,
    floorplans,
    videoUrl,
    status,
    featured,
    seo->{
      metaTitle,
      metaDescription,
      keywords
    },
    seoTitle,
    seoDescription,
    keywords,
    publishAt,
    scheduledPublish,
    _createdAt,
    _updatedAt
  }
`

export const CITIES_QUERY = `
  *[_type == "city"] | order(name.en asc) {
    _id,
    name,
    slug,
    "region": region->{
      name,
      country
    },
    description,
    coordinates,
    image,
    "propertyCount": count(*[_type == "listing" && references(^._id)])
  }
`

export const REGIONS_QUERY = `
  *[_type == "region"] | order(name.en asc) {
    _id,
    name,
    slug,
    country,
    description,
    coordinates,
    "propertyCount": count(*[_type == "listing" && references(^.cities[]._ref)])
  }
`

export const AMENITIES_QUERY = `
  *[_type == "amenity"] | order(name.en asc) {
    _id,
    name,
    description,
    category
  }
`