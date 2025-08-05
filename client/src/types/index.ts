export interface Destination {
  id: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  outbound: {
    departureTime: string;
    arrivalTime: string;
    duration: string;
  };
  return: {
    departureTime: string;
    arrivalTime: string;
    duration: string;
  };
  stayDuration: string;
  weather: WeatherData | null;
  demographics: DemographicData | null;
  image: string | null;
}

export interface Train {
  id: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  trainNumber: string;
  platform?: string;
}

export interface TGVmaxDestination {
  id: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  outboundTrains: Train[];
  returnTrains: Train[];
  totalTrains: number;
  availableTrains: number;
}

export interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  precipitation?: number;
}

export interface DemographicData {
  population: number;
  area: number;
  density: number;
}

export interface Station {
  code: string;
  name: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  region: string;
}

export interface SearchParams {
  departureStation: string;
  date: string;
  minDuration: number;
}

export interface CityInfo {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  demographics: DemographicData;
  description: string;
  image: string;
} 