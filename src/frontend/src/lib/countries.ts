// src/frontend/src/lib/countries.ts
// Kept so every page that imports from "@/lib/countries" automatically gets the full list.
// The single source of truth is countryProfiles.ts (250 countries and territories).
import { ALL_COUNTRIES } from "./countryProfiles";

export interface CountryOption { name: string; code: string; flag?: string }

export const COUNTRIES: CountryOption[] = ALL_COUNTRIES.map(({ name, code }) => ({ name, code }));

export const COUNTRY_NAMES = COUNTRIES.map((country) => country.name);
