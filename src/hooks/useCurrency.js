import { useState, useEffect } from 'react';
import { 
  detectUserLocation, 
  getCurrentCurrency, 
  formatCurrency as formatCurrencyService,
  setCurrency as setCurrencyService,
  getAllCurrencies,
  DEFAULT_CURRENCY,
} from '../services/currency/currencyService';

/**
 * Hook para manejar la moneda del usuario basada en su ubicación
 * 
 * @example
 * const { currency, loading, formatPrice } = useCurrency();
 * 
 * // En un TextField
 * <InputAdornment position="start">{currency.symbol}</InputAdornment>
 * 
 * // Formatear un precio
 * <Typography>{formatPrice(1500)}</Typography> // "Bs 1.500,00" o "$1,500.00" según país
 */
const useCurrency = () => {
  const [currency, setCurrency] = useState(getCurrentCurrency());
  const [locationInfo, setLocationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const detectCurrency = async () => {
      try {
        setLoading(true);
        const result = await detectUserLocation();
        
        if (mounted) {
          setCurrency(result.currency);
          setLocationInfo({
            country: result.country,
            countryName: result.countryName,
            city: result.city,
            region: result.region,
          });
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.warn('Error detecting currency:', err);
          setError(err.message);
          // Usar moneda por defecto
          setCurrency(DEFAULT_CURRENCY);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    detectCurrency();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Formatea un precio con la moneda detectada
   * @param {number} amount - Cantidad a formatear
   * @returns {string} Precio formateado (ej: "Bs 150,00")
   */
  const formatPrice = (amount) => {
    return formatCurrencyService(amount, currency);
  };

  /**
   * Cambia la moneda manualmente
   * @param {string} countryCode - Código de país ISO (ej: 'US', 'BO', 'AR')
   */
  const changeCurrency = (countryCode) => {
    const newCurrency = setCurrencyService(countryCode);
    if (newCurrency) {
      setCurrency(newCurrency);
    }
  };

  /**
   * Obtiene todas las monedas disponibles para un selector
   * @returns {Array} Lista de monedas
   */
  const availableCurrencies = getAllCurrencies();

  return {
    // Información de la moneda actual
    currency,
    symbol: currency?.symbol || 'Bs',
    code: currency?.code || 'BOB',
    name: currency?.name || 'Boliviano',
    
    // Información de ubicación
    locationInfo,
    country: locationInfo?.country || currency?.country || 'BO',
    
    // Estados
    loading,
    error,
    
    // Funciones
    formatPrice,
    changeCurrency,
    availableCurrencies,
  };
};

export default useCurrency;

