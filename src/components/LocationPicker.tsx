
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
// import L from 'leaflet';
import L from "@/lib/leafletFix";
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { LoaderCircle, MapPin, Search } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Fix for default marker icon issue with Webpack
// const defaultIcon = new L.Icon({
//     iconUrl: require('leaflet/dist/images/marker-icon.png'),
//     iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//     shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41],
// });
// L.Marker.prototype.options.icon = defaultIcon;


const lusakaTownships = [
    "Avondale", "Bauleni", "Brentwood", "Buckley", "Chainama", "Chaisa", "Chakunkula", "Chalala", "Chawama", "Chelston", 
    "Chibolya", "Chilenje", "Chipata Compound", "Chudleigh", "Emmasdale", "Foxdale", "Garden Compound", "George Compound", 
    "Handsworth", "Helen Kaunda", "Ibex Hill", "Jack Compound", "Jesmondine", "John Howard", "Kabanana", "Kabulonga", 
    "Kalikiliki", "Kalingalinga", "Kalundu", "Kamanga", "Kamwala", "Kanyama", "Kaunda Square", "Libala", "Lilanda", "Liyali", 
    "Longacres", "Lusaka CBD", "Makeni", "Mandevu", "Matero", "Meanwood", "Misisi", "Mtendere", "Munali", "Mutendere", 
    "Mwembeshi", "Ng'ombe", "Northmead", "Nyumba Yanga", "Olympia", "PHI", "Rhodes Park", "Roma", "Salama Park", 
    "Thornpark", "Twinpalm", "Woodlands", "ZAF"
].sort();


interface LocationPickerProps {
  form: UseFormReturn<any>;
}

export function LocationPicker({ form }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  const [position, setPosition] = useState<L.LatLng | null>(() => {
      const lat = form.getValues('latitude');
      const lng = form.getValues('longitude');
      return lat && lng ? new L.LatLng(lat, lng) : null;
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleMapClick = useCallback(async (latlng: L.LatLng) => {
    setPosition(latlng);
    mapRef.current?.panTo(latlng);

    if (!markerRef.current) {
        markerRef.current = L.marker(latlng, { draggable: true }).addTo(mapRef.current!);
        markerRef.current.on('dragend', (e) => {
            handleMapClick(e.target.getLatLng());
        });
    } else {
        markerRef.current.setLatLng(latlng);
    }
    
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        form.setValue('address', data.display_name, { shouldValidate: true });
      }
      if (data?.address?.suburb) {
          form.setValue('township', data.address.suburb, { shouldValidate: true });
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    } finally {
      form.setValue('latitude', latlng.lat);
      form.setValue('longitude', latlng.lng);
      setIsGeocoding(false);
    }
  }, [form]);

  useEffect(() => {
    if (isClient && mapContainerRef.current && !mapRef.current) {
        const initialPosition = (() => {
             const lat = form.getValues('latitude');
             const lng = form.getValues('longitude');
             return lat && lng ? new L.LatLng(lat, lng) : new L.LatLng(-15.3875, 28.3228);
        })();

        const map = L.map(mapContainerRef.current!).setView(initialPosition, 13);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        if (position) {
            markerRef.current = L.marker(position, { draggable: true }).addTo(map);
            markerRef.current.on('dragend', (e) => {
              handleMapClick(e.target.getLatLng());
            });
        }
        
        map.on('click', (e) => handleMapClick(e.latlng));
    }
  }, [isClient, position, handleMapClick, form]);
  
  // Debounce effect for search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    setIsFetchingSuggestions(true);
    const handler = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ', Lusaka, Zambia')}&format=json&limit=5&addressdetails=1`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Suggestion fetching failed:", error);
        setSuggestions([]);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 1000); // 1 second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);


  const handleSearch = async (query: string) => {
    if (!query || !mapRef.current) return;

    setIsSearching(true);
    setSuggestions([]);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Lusaka, Zambia')}&format=json&limit=1&viewbox=28.1,-15.6,28.5,-15.2&bounded=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLatLng = new L.LatLng(parseFloat(lat), parseFloat(lon));
        mapRef.current.flyTo(newLatLng, 15); // zoom closer on search
        handleMapClick(newLatLng);
      } else {
        alert("Location not found. Please try a different search term or click on the map.");
      }
    } catch (error) {
      console.error("Geocoding search failed:", error);
       alert("An error occurred while searching. Please check your connection.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
      setSearchQuery(suggestion.display_name);
      const newLatLng = new L.LatLng(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
      mapRef.current?.flyTo(newLatLng, 15);
      handleMapClick(newLatLng);
      setSuggestions([]);
  }

  const MapPlaceholder = () => (
      <div className="h-[400px] w-full bg-muted rounded-lg flex flex-col items-center justify-center">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-semibold">Map is loading...</p>
      </div>
  );

  return (
    <div className="space-y-4">
      <div className="relative">
          <Label>Delivery Location</Label>
          <div className="flex gap-2 my-2">
              <Input
                  placeholder="Search for an area in Lusaka..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch(searchQuery);
                      }
                  }}
              />
              <Button type="button" onClick={() => handleSearch(searchQuery)} disabled={isSearching || !searchQuery}>
                  {isSearching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
          </div>
          {(isFetchingSuggestions || suggestions.length > 0) && (
              <Card className="absolute z-10 w-full mt-1 shadow-lg">
                  <CardContent className="p-2">
                      {isFetchingSuggestions ? (
                          <div className="flex items-center justify-center p-2">
                              <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                      ) : (
                          <ul className="space-y-1">
                              {suggestions.map((suggestion) => (
                                  <li key={suggestion.place_id}>
                                      <button
                                          type="button"
                                          className="w-full text-left p-2 rounded-md hover:bg-muted text-sm"
                                          onClick={() => handleSuggestionClick(suggestion)}
                                      >
                                          {suggestion.display_name}
                                      </button>
                                  </li>
                              ))}
                          </ul>
                      )}
                  </CardContent>
              </Card>
          )}
      </div>

      <Card>
        <CardContent className="p-2">
           {isClient ? (
              <div id="map-container" ref={mapContainerRef} style={{ height: '400px', width: '100%', borderRadius: '0.5rem', zIndex: 1 }} />
            ) : (
                <MapPlaceholder />
            )}
        </CardContent>
      </Card>
      
       <div className="space-y-2">
            <Label htmlFor="street-address">Street Address</Label>
            <div className="relative">
                <Input id="street-address" {...form.register('address')} placeholder="Click map to set your address" readOnly />
                 {isGeocoding && <LoaderCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
            </div>
            <p className="text-sm text-muted-foreground">Click on the map or drag the pin to set your address.</p>
        </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...form.register('city')} defaultValue="Lusaka" readOnly />
        </div>
      </div> */}
      
       <div className="space-y-2">
          <Label htmlFor="landmark">Landmark / Extra Directions (Optional)</Label>
          <Input id="landmark" {...form.register('landmark')} placeholder="e.g., Near the big water tank" />
      </div>

       {position && (
        <Card className="bg-muted/50">
          <CardContent className="p-3 text-sm">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Coordinates:</span> {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

    