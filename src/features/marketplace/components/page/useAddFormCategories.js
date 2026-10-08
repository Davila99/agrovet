import { useState, useEffect } from 'react';
import { addService } from '../../../../services/endpoints';

const FALLBACK_CATEGORIES = [
  'Veterinaria', 'Medicamentos veterinarios', 'Antiparasitarios', 'Vacunas', 'Suplementos', 'Alimentos balanceados',
  'Productos para ganado', 'Reproductores', 'Hormonas', 'Insumos agrícolas', 'Semillas', 'Fertilizantes', 'Pesticidas',
  'Maquinaria agrícola', 'Tractores', 'Implementos', 'Herramientas', 'Servicios veterinarios', 'Consultoría', 'Capacitación',
  'Transporte de animales', 'Alojamiento de ganado', 'Productos de higiene', 'Instrumental quirúrgico', 'Laboratorio', 'Otros'
].map((n, i) => ({ id: String(i + 1), name: n }));

export function useAddFormCategories(setSnack) {
  const [categories, setCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await addService.getCategories();
        if (mounted) {
          const list = Array.isArray(res) ? res : (res.results || []);
          const CORE_NAMES = ['Medicamentos y salud animal', 'Alimentos y suplementos', 'Productos para ganado', 'Semillas y plantas', 'Fertilizantes y agroquímicos', 'Maquinaria e implementos', 'Herramientas e insumos', 'Servicios agropecuarios'];
          const coreFound = list.filter(c => CORE_NAMES.includes((c.name || '').toString()));
          if (coreFound.length) {
            setCategories(coreFound);
            setCategoriesLoaded(true);
          } else if (Array.isArray(list) && list.length) {
            setCategories(list);
            setCategoriesLoaded(true);
          } else {
            setCategories(FALLBACK_CATEGORIES);
            setCategoriesLoaded(false);
          }
        }
      } catch (e) {
        if (mounted) {
          setCategories(FALLBACK_CATEGORIES);
          setCategoriesLoaded(false);
          if (setSnack) setSnack({ open: true, message: 'No se pudieron cargar categorías; usando lista local', severity: 'warning' });
        }
      }
    })();
    return () => { mounted = false; };
  }, [setSnack]);

  return { categories, categoriesLoaded };
}
