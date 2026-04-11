import { useState, useEffect, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  Stack,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { MapPin } from 'lucide-react';
import {
  fetchProvinces,
  fetchCitiesByProvince,
  fetchBarangaysByCity,
} from '../../services/psgcService';

/**
 * Cascading Philippine address selector: Province → City/Municipality → Barangay.
 *
 * @param {{ onChange: (address: { province: string, city: string, barangay: string, formatted: string } | null) => void }} props
 */
const AddressSelector = ({ onChange }) => {
  // Option lists
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // Selected values
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);

  // Loading states - initialize as true for initial fetch
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // ── Load provinces on mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    fetchProvinces()
      .then((data) => {
        if (!cancelled) setProvinces(data);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoadingProvinces(false);
      });
    return () => { cancelled = true; };
  }, []);

  // ── Load cities when province changes ────────────────────────────────
  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      setLoadingCities(false);
      return;
    }
    let cancelled = false;
    setLoadingCities(true);
    fetchCitiesByProvince(selectedProvince.code)
      .then((data) => {
        if (!cancelled) setCities(data);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });
    return () => { cancelled = true; };
  }, [selectedProvince]);

  // ── Load barangays when city changes ─────────────────────────────────
  useEffect(() => {
    if (!selectedCity) {
      setBarangays([]);
      setLoadingBarangays(false);
      return;
    }
    let cancelled = false;
    setLoadingBarangays(true);
    fetchBarangaysByCity(selectedCity.code)
      .then((data) => {
        if (!cancelled) setBarangays(data);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoadingBarangays(false);
      });
    return () => { cancelled = true; };
  }, [selectedCity]);

  // ── Notify parent of complete/partial address ────────────────────────
  const emitChange = useCallback(
    (province, city, barangay) => {
      if (province && city) {
        onChange?.({
          province: province.name,
          provinceCode: province.code,
          city: city.name,
          cityCode: city.code,
          barangay: barangay?.name || '',
          barangayCode: barangay?.code || '',
          zipCode: city.zipCode || '',
          formatted: barangay
            ? `${barangay.name}, ${city.name}, ${province.name}`
            : `${city.name}, ${province.name}`,
        });
      } else {
        onChange?.(null);
      }
    },
    [onChange],
  );

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleProvinceChange = (_e, value) => {
    setSelectedProvince(value);
    setSelectedCity(null);
    setSelectedBarangay(null);
    setCities([]);
    setBarangays([]);
    emitChange(value, null, null);
  };

  const handleCityChange = (_e, value) => {
    setSelectedCity(value);
    setSelectedBarangay(null);
    setBarangays([]);
    emitChange(selectedProvince, value, null);
  };

  const handleBarangayChange = (_e, value) => {
    setSelectedBarangay(value);
    emitChange(selectedProvince, selectedCity, value);
  };

  // ── Shared props helper ──────────────────────────────────────────────
  const loaderAdornment = (
    <InputAdornment position="end">
      <CircularProgress size={18} />
    </InputAdornment>
  );

  return (
    <Stack spacing={2}>
      {/* Province */}
      <Autocomplete
        options={provinces}
        getOptionLabel={(o) => o.name}
        value={selectedProvince}
        onChange={handleProvinceChange}
        loading={loadingProvinces}
        isOptionEqualToValue={(opt, val) => opt.code === val.code}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Province"
            required
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <MapPin size={20} />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loadingProvinces ? loaderAdornment : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* City / Municipality */}
      <Autocomplete
        options={cities}
        getOptionLabel={(o) => o.name}
        value={selectedCity}
        onChange={handleCityChange}
        loading={loadingCities}
        disabled={!selectedProvince}
        isOptionEqualToValue={(opt, val) => opt.code === val.code}
        noOptionsText={selectedProvince ? 'No cities found' : 'Select province first'}
        renderInput={(params) => (
          <TextField
            {...params}
            label="City / Municipality"
            required
            placeholder={!selectedProvince ? 'Select province first' : ''}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <MapPin size={20} />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loadingCities ? loaderAdornment : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Barangay */}
      <Autocomplete
        options={barangays}
        getOptionLabel={(o) => o.name}
        value={selectedBarangay}
        onChange={handleBarangayChange}
        loading={loadingBarangays}
        disabled={!selectedCity}
        isOptionEqualToValue={(opt, val) => opt.code === val.code}
        noOptionsText={selectedCity ? 'No barangays found' : 'Select city first'}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Barangay"
            required
            placeholder={!selectedCity ? 'Select city first' : ''}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <MapPin size={20} />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loadingBarangays ? loaderAdornment : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </Stack>
  );
};

export default AddressSelector;
