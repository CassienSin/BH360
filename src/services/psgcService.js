/**
 * Philippine Standard Geographic Code (PSGC) API Service
 * Provides cascading location data: Province → City/Municipality → Barangay
 * API source: https://psgc.gitlab.io/api/
 */

const BASE_URL = 'https://psgc.gitlab.io/api';

/**
 * Fetch all provinces, sorted alphabetically.
 * @returns {Promise<Array<{ code: string, name: string }>>}
 */
export const fetchProvinces = async () => {
  const res = await fetch(`${BASE_URL}/provinces/`);
  if (!res.ok) throw new Error('Failed to fetch provinces');
  const data = await res.json();
  return data
    .map(({ code, name }) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Fetch cities / municipalities for a given province code, sorted alphabetically.
 * @param {string} provinceCode
 * @returns {Promise<Array<{ code: string, name: string, zipCode: string }>>}
 */
export const fetchCitiesByProvince = async (provinceCode) => {
  const res = await fetch(`${BASE_URL}/provinces/${provinceCode}/cities-municipalities/`);
  if (!res.ok) throw new Error('Failed to fetch cities');
  const data = await res.json();
  return data
    .map(({ code, name, zipCode }) => ({ code, name, zipCode }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Fetch barangays for a given city/municipality code, sorted alphabetically.
 * @param {string} cityCode
 * @returns {Promise<Array<{ code: string, name: string }>>}
 */
export const fetchBarangaysByCity = async (cityCode) => {
  const res = await fetch(`${BASE_URL}/cities-municipalities/${cityCode}/barangays/`);
  if (!res.ok) throw new Error('Failed to fetch barangays');
  const data = await res.json();
  return data
    .map(({ code, name }) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
