import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { City, cityService, Place, placesService } from '@/services';
import { PickerOption } from '@/src/components/OptionPickerModal/OptionPickerModal';
import { getErrorMessage } from '@/utils/apiError';

export type ExploreData = {
  spots: Place[] | null;
  categories: string[];
  loading: boolean;
  error: string;
  reload: () => void;
  search: string;
  selectedCategory: string;
  showFilter: boolean;
  tempCategory: string;
  searched: boolean;
  activeFilters: number;
  setTempCategory: (v: string) => void;
  openFilter: () => void;
  closeFilter: () => void;
  handleSearchChange: (text: string) => void;
  handleApplyFilter: () => void;
  handleClearFilter: () => void;
  handleSpotPress: (spot: Place) => void;
  cityOptions: PickerOption[];
  selectedCity: City | null;
  showCityPicker: boolean;
  openCityPicker: () => void;
  closeCityPicker: () => void;
  handleSelectCity: (slug: string | null) => void;
};

/** Raio da busca em volta do centro da cidade: cobre o maior raio do catalogo (25 km). */
const CITY_RADIUS_METERS = 30000;

export function useExplore(): ExploreData {
  const router = useRouter();
  const { t, i18n } = useTranslation(['explore', 'roteiros']);

  // Comeca em null, e nao em lista vazia: antes da primeira resposta nao se sabe ainda se
  // existe ou nao lugar para mostrar.
  const [spots, setSpots] = useState<Place[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [tempCategory, setTempCategory] = useState('');
  const [searched, setSearched] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSpots = useCallback(async (searchTerm: string, category: string, city: City | null) => {
    setLoading(true);
    setError('');
    try {
      const results = await placesService.getAll({
        search: searchTerm || undefined,
        category: category || undefined,
        ...(city && { lat: city.latitude, lng: city.longitude, maxDistance: CITY_RADIUS_METERS }),
      });
      setSpots(results);
      setSearched(true);
    } catch (e) {
      setSpots([]);
      setError(getErrorMessage(e, t('explore:loadError')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    placesService.getCategories().then(setCategories).catch(() => {});
    cityService.getCities().then(setCities).catch(() => {});
    placesService.getAll({})
      .then((results) => {
        setSpots(results);
        setSearched(true);
      })
      .catch((e) => {
        setSpots([]);
        setError(getErrorMessage(e, t('explore:loadError')));
      })
      .finally(() => setLoading(false));
  }, [t]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSpots(text, selectedCategory, selectedCity);
    }, 400);
  };

  const handleApplyFilter = () => {
    setSelectedCategory(tempCategory);
    setShowFilter(false);
    fetchSpots(search, tempCategory, selectedCity);
  };

  const handleClearFilter = () => {
    setTempCategory('');
    setSelectedCategory('');
    setShowFilter(false);
    fetchSpots(search, '', selectedCity);
  };

  const cityName = (city: City) => t(`roteiros:cities.${city.slug}`, { defaultValue: city.name });
  const cityOptions: PickerOption[] = [
    { value: null, label: t('explore:allCities') },
    ...[...cities]
      .sort((a, b) => cityName(a).localeCompare(cityName(b), i18n.language))
      .map((c) => ({ value: c.slug, label: cityName(c) })),
  ];

  const handleSelectCity = (slug: string | null) => {
    const city = cities.find((c) => c.slug === slug) ?? null;
    setShowCityPicker(false);
    setSelectedCity(city);
    fetchSpots(search, selectedCategory, city);
  };

  const handleSpotPress = (spot: Place) => {
    router.push({ pathname: '/SpotDetailScreen', params: { spot: JSON.stringify(spot), origin: 'explorar' } });
  };

  return {
    spots,
    categories,
    loading,
    error,
    reload: () => fetchSpots(search, selectedCategory, selectedCity),
    search,
    selectedCategory,
    showFilter,
    tempCategory,
    searched,
    activeFilters: [selectedCategory].filter(Boolean).length,
    setTempCategory,
    openFilter: () => {
      setTempCategory(selectedCategory);
      setShowFilter(true);
    },
    closeFilter: () => setShowFilter(false),
    handleSearchChange,
    handleApplyFilter,
    handleClearFilter,
    handleSpotPress,
    cityOptions,
    selectedCity,
    showCityPicker,
    openCityPicker: () => setShowCityPicker(true),
    closeCityPicker: () => setShowCityPicker(false),
    handleSelectCity,
  };
}
