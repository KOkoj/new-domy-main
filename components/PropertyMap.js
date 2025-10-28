'use client';

import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

const PropertyMap = ({ 
  properties = [], 
  selectedProperty = null, 
  onPropertyClick = () => {},
  center = [42.8333, 12.8333],
  zoom = 6 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    let L;
    
    const initMap = async () => {
      try {
        // Dynamically import Leaflet
        L = await import('leaflet');
        
        // Import Leaflet CSS
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);

        // Fix for default markers in Leaflet
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        if (mapRef.current && !mapInstanceRef.current) {
          // Initialize the map
          mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapInstanceRef.current);

          // Add property markers
          updateMarkers();
        }
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    const updateMarkers = () => {
      if (!mapInstanceRef.current || !L) return;

      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      // Add new markers
      properties.forEach(property => {
        const isSelected = selectedProperty?.id === property.id;
        
        // Create custom icon for selected/unselected state
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background: ${isSelected ? '#ef4444' : '#3E6343'};
              width: ${isSelected ? '20px' : '16px'};
              height: ${isSelected ? '20px' : '16px'};
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: bold;
            ">
              €${Math.round(property.price / 1000)}k
            </div>
          `,
          iconSize: [isSelected ? 24 : 20, isSelected ? 24 : 20],
          iconAnchor: [isSelected ? 12 : 10, isSelected ? 12 : 10]
        });

        const marker = L.marker(property.location, { icon })
          .addTo(mapInstanceRef.current);

        // Add popup
        const popupContent = `
          <div style="min-width: 200px;">
            <img src="${property.image}" alt="${property.title}" 
                 style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${property.title}</h4>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; line-height: 1.3;">${property.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #059669; font-size: 14px;">€${property.price.toLocaleString()}</span>
              <span style="color: #666; font-size: 12px;">${property.area}m²</span>
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent);

        // Handle marker click
        marker.on('click', () => {
          onPropertyClick(property);
        });

        markersRef.current.push(marker);
      });
    };

    // Initialize map
    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, []);

  // Update markers when properties or selectedProperty changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const updateMarkers = async () => {
        const L = await import('leaflet');
        
        // Clear existing markers
        markersRef.current.forEach(marker => {
          mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = [];

        // Add new markers
        properties.forEach(property => {
          const isSelected = selectedProperty?.id === property.id;
          
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background: ${isSelected ? '#ef4444' : '#3E6343'};
                width: ${isSelected ? '20px' : '16px'};
                height: ${isSelected ? '20px' : '16px'};
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
                font-weight: bold;
              ">
                €${Math.round(property.price / 1000)}k
              </div>
            `,
            iconSize: [isSelected ? 24 : 20, isSelected ? 24 : 20],
            iconAnchor: [isSelected ? 12 : 10, isSelected ? 12 : 10]
          });

          const marker = L.marker(property.location, { icon })
            .addTo(mapInstanceRef.current);

          const popupContent = `
            <div style="min-width: 200px;">
              <img src="${property.image}" alt="${property.title}" 
                   style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
              <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${property.title}</h4>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; line-height: 1.3;">${property.description}</p>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold; color: #059669; font-size: 14px;">€${property.price.toLocaleString()}</span>
                <span style="color: #666; font-size: 12px;">${property.area}m²</span>
              </div>
            </div>
          `;
          
          marker.bindPopup(popupContent);
          marker.on('click', () => {
            onPropertyClick(property);
          });

          markersRef.current.push(marker);
        });
      };

      updateMarkers();
    }
  }, [properties, selectedProperty, onPropertyClick]);

  // Update map center when selectedProperty changes
  useEffect(() => {
    if (mapInstanceRef.current && selectedProperty) {
      mapInstanceRef.current.setView(selectedProperty.location, 10);
    }
  }, [selectedProperty]);

  return (
    <div className="h-full w-full relative">
      <div 
        ref={mapRef} 
        className="h-full w-full z-0"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};

export default PropertyMap;