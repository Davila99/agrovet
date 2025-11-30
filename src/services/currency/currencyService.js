/**
 * Currency Service - Detecta y maneja monedas basándose en la ubicación del usuario
 */

// Mapeo de códigos de país ISO a monedas
export const COUNTRY_CURRENCY_MAP = {
  // América del Sur
  BO: { code: 'BOB', symbol: 'Bs', name: 'Boliviano', locale: 'es-BO' },
  AR: { code: 'ARS', symbol: '$', name: 'Peso Argentino', locale: 'es-AR' },
  BR: { code: 'BRL', symbol: 'R$', name: 'Real Brasileño', locale: 'pt-BR' },
  CL: { code: 'CLP', symbol: '$', name: 'Peso Chileno', locale: 'es-CL' },
  CO: { code: 'COP', symbol: '$', name: 'Peso Colombiano', locale: 'es-CO' },
  EC: { code: 'USD', symbol: '$', name: 'Dólar', locale: 'es-EC' },
  GY: { code: 'GYD', symbol: '$', name: 'Dólar Guyanés', locale: 'en-GY' },
  PY: { code: 'PYG', symbol: '₲', name: 'Guaraní', locale: 'es-PY' },
  PE: { code: 'PEN', symbol: 'S/', name: 'Sol', locale: 'es-PE' },
  SR: { code: 'SRD', symbol: '$', name: 'Dólar Surinamés', locale: 'nl-SR' },
  UY: { code: 'UYU', symbol: '$U', name: 'Peso Uruguayo', locale: 'es-UY' },
  VE: { code: 'VES', symbol: 'Bs.S', name: 'Bolívar', locale: 'es-VE' },
  
  // América Central y Caribe
  BZ: { code: 'BZD', symbol: 'BZ$', name: 'Dólar Beliceño', locale: 'en-BZ' },
  CR: { code: 'CRC', symbol: '₡', name: 'Colón', locale: 'es-CR' },
  SV: { code: 'USD', symbol: '$', name: 'Dólar', locale: 'es-SV' },
  GT: { code: 'GTQ', symbol: 'Q', name: 'Quetzal', locale: 'es-GT' },
  HN: { code: 'HNL', symbol: 'L', name: 'Lempira', locale: 'es-HN' },
  NI: { code: 'NIO', symbol: 'C$', name: 'Córdoba', locale: 'es-NI' },
  PA: { code: 'PAB', symbol: 'B/.', name: 'Balboa', locale: 'es-PA' },
  CU: { code: 'CUP', symbol: '₱', name: 'Peso Cubano', locale: 'es-CU' },
  DO: { code: 'DOP', symbol: 'RD$', name: 'Peso Dominicano', locale: 'es-DO' },
  HT: { code: 'HTG', symbol: 'G', name: 'Gourde', locale: 'fr-HT' },
  JM: { code: 'JMD', symbol: 'J$', name: 'Dólar Jamaiquino', locale: 'en-JM' },
  PR: { code: 'USD', symbol: '$', name: 'Dólar', locale: 'es-PR' },
  TT: { code: 'TTD', symbol: 'TT$', name: 'Dólar de Trinidad', locale: 'en-TT' },
  
  // América del Norte
  MX: { code: 'MXN', symbol: '$', name: 'Peso Mexicano', locale: 'es-MX' },
  US: { code: 'USD', symbol: '$', name: 'Dólar', locale: 'en-US' },
  CA: { code: 'CAD', symbol: 'C$', name: 'Dólar Canadiense', locale: 'en-CA' },
  
  // Europa
  ES: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'es-ES' },
  FR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'fr-FR' },
  DE: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  IT: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'it-IT' },
  PT: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'pt-PT' },
  GB: { code: 'GBP', symbol: '£', name: 'Libra', locale: 'en-GB' },
  CH: { code: 'CHF', symbol: 'CHF', name: 'Franco Suizo', locale: 'de-CH' },
  
  // Asia
  CN: { code: 'CNY', symbol: '¥', name: 'Yuan', locale: 'zh-CN' },
  JP: { code: 'JPY', symbol: '¥', name: 'Yen', locale: 'ja-JP' },
  KR: { code: 'KRW', symbol: '₩', name: 'Won', locale: 'ko-KR' },
  IN: { code: 'INR', symbol: '₹', name: 'Rupia', locale: 'hi-IN' },
  
  // Oceanía
  AU: { code: 'AUD', symbol: 'A$', name: 'Dólar Australiano', locale: 'en-AU' },
  NZ: { code: 'NZD', symbol: 'NZ$', name: 'Dólar Neozelandés', locale: 'en-NZ' },
};

// Moneda por defecto (Bolivia como fallback para la app)
export const DEFAULT_CURRENCY = { code: 'BOB', symbol: 'Bs', name: 'Boliviano', locale: 'es-BO', country: 'BO' };

// Cache para evitar múltiples llamadas a la API
let cachedCurrency = null;
let cacheTimestamp = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

/**
 * Detecta el país del usuario usando la API de ipapi.co
 * @returns {Promise<{country: string, currency: object}>}
 */
export const detectUserLocation = async () => {
  // Verificar cache
  if (cachedCurrency && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return cachedCurrency;
  }

  try {
    // Usar ipapi.co - gratis, sin API key, hasta 1000 requests/día
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.country_code) {
      const countryCode = data.country_code.toUpperCase();
      const currencyInfo = COUNTRY_CURRENCY_MAP[countryCode] || DEFAULT_CURRENCY;
      
      const result = {
        country: countryCode,
        countryName: data.country_name || '',
        city: data.city || '',
        region: data.region || '',
        currency: {
          ...currencyInfo,
          country: countryCode,
        },
      };

      // Guardar en cache
      cachedCurrency = result;
      cacheTimestamp = Date.now();

      // También guardar en localStorage para persistencia
      try {
        localStorage.setItem('userCurrency', JSON.stringify(result));
        localStorage.setItem('userCurrencyTimestamp', String(Date.now()));
      } catch (e) {
        // Ignorar errores de localStorage
      }

      return result;
    }

    throw new Error('No country data');
  } catch (error) {
    console.warn('Error detecting location, using fallback:', error.message);
    
    // Intentar recuperar de localStorage
    try {
      const stored = localStorage.getItem('userCurrency');
      const storedTimestamp = localStorage.getItem('userCurrencyTimestamp');
      
      if (stored && storedTimestamp) {
        const parsed = JSON.parse(stored);
        // Usar cache de localStorage si es de las últimas 24 horas
        if (Date.now() - Number(storedTimestamp) < 1000 * 60 * 60 * 24) {
          cachedCurrency = parsed;
          cacheTimestamp = Number(storedTimestamp);
          return parsed;
        }
      }
    } catch (e) {
      // Ignorar errores
    }

    // Fallback basado en el idioma del navegador
    return detectFromBrowserLocale();
  }
};

/**
 * Detecta la moneda basándose en el idioma del navegador (fallback)
 */
export const detectFromBrowserLocale = () => {
  try {
    const lang = (navigator.language || navigator.userLanguage || 'es-BO').toLowerCase();
    
    // Mapeo de locales a países
    const localeToCountry = {
      'es-bo': 'BO', 'es-ar': 'AR', 'es-cl': 'CL', 'es-co': 'CO',
      'es-pe': 'PE', 'es-uy': 'UY', 'es-py': 'PY', 'es-ve': 'VE',
      'es-ec': 'EC', 'es-mx': 'MX', 'es-es': 'ES', 'es-cr': 'CR',
      'es-gt': 'GT', 'es-hn': 'HN', 'es-ni': 'NI', 'es-pa': 'PA',
      'es-do': 'DO', 'es-cu': 'CU', 'es-sv': 'SV', 'es-pr': 'PR',
      'en-us': 'US', 'en-gb': 'GB', 'en-au': 'AU', 'en-ca': 'CA',
      'pt-br': 'BR', 'pt-pt': 'PT', 'fr-fr': 'FR', 'de-de': 'DE',
      'it-it': 'IT', 'ja-jp': 'JP', 'zh-cn': 'CN', 'ko-kr': 'KR',
    };

    // Buscar coincidencia exacta
    let countryCode = localeToCountry[lang];
    
    // Si no hay coincidencia exacta, buscar por prefijo de idioma
    if (!countryCode) {
      const prefix = lang.split('-')[0];
      const defaultByLang = {
        'es': 'BO', // Español -> Bolivia (default de la app)
        'en': 'US',
        'pt': 'BR',
        'fr': 'FR',
        'de': 'DE',
        'it': 'IT',
        'ja': 'JP',
        'zh': 'CN',
        'ko': 'KR',
      };
      countryCode = defaultByLang[prefix] || 'BO';
    }

    const currencyInfo = COUNTRY_CURRENCY_MAP[countryCode] || DEFAULT_CURRENCY;
    
    return {
      country: countryCode,
      countryName: '',
      city: '',
      region: '',
      currency: {
        ...currencyInfo,
        country: countryCode,
      },
    };
  } catch (e) {
    return {
      country: 'BO',
      countryName: 'Bolivia',
      city: '',
      region: '',
      currency: DEFAULT_CURRENCY,
    };
  }
};

/**
 * Formatea un valor monetario según la moneda detectada
 * @param {number} amount - Cantidad a formatear
 * @param {object} currency - Objeto de moneda (opcional, usa la detectada si no se provee)
 * @returns {string} Valor formateado
 */
export const formatCurrency = (amount, currency = null) => {
  const curr = currency || cachedCurrency?.currency || DEFAULT_CURRENCY;
  
  try {
    return new Intl.NumberFormat(curr.locale || 'es-BO', {
      style: 'currency',
      currency: curr.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    // Fallback simple
    return `${curr.symbol} ${Number(amount).toFixed(2)}`;
  }
};

/**
 * Obtiene la moneda actualmente cacheada o detectada
 * @returns {object} Información de moneda
 */
export const getCurrentCurrency = () => {
  if (cachedCurrency?.currency) {
    return cachedCurrency.currency;
  }
  
  // Intentar recuperar de localStorage
  try {
    const stored = localStorage.getItem('userCurrency');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.currency || DEFAULT_CURRENCY;
    }
  } catch (e) {
    // Ignorar
  }
  
  return DEFAULT_CURRENCY;
};

/**
 * Obtiene todas las monedas disponibles
 * @returns {Array} Lista de monedas
 */
export const getAllCurrencies = () => {
  const unique = new Map();
  
  Object.entries(COUNTRY_CURRENCY_MAP).forEach(([country, currency]) => {
    if (!unique.has(currency.code)) {
      unique.set(currency.code, { ...currency, country });
    }
  });
  
  return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Establece manualmente una moneda (por si el usuario quiere cambiarla)
 * @param {string} countryCode - Código de país ISO
 */
export const setCurrency = (countryCode) => {
  const currencyInfo = COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()];
  
  if (currencyInfo) {
    const result = {
      country: countryCode.toUpperCase(),
      countryName: '',
      city: '',
      region: '',
      currency: {
        ...currencyInfo,
        country: countryCode.toUpperCase(),
      },
    };
    
    cachedCurrency = result;
    cacheTimestamp = Date.now();
    
    try {
      localStorage.setItem('userCurrency', JSON.stringify(result));
      localStorage.setItem('userCurrencyTimestamp', String(Date.now()));
    } catch (e) {
      // Ignorar
    }
    
    return result.currency;
  }
  
  return null;
};

export default {
  detectUserLocation,
  detectFromBrowserLocale,
  formatCurrency,
  getCurrentCurrency,
  getAllCurrencies,
  setCurrency,
  DEFAULT_CURRENCY,
  COUNTRY_CURRENCY_MAP,
};

