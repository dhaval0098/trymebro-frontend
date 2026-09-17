import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  Search,
  X,
  RotateCcw,
  Check,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Star,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ArrowUpDown,
  Crown,
  Rocket,
  Layers
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';

const SORT_OPTIONS = [
  { id: 'all', label: 'All Fragrances', icon: Layers, desc: 'Complete luxury boutique collection' },
  { id: 'newest', label: 'New Arrivals', icon: Rocket, desc: 'Only fresh releases selected in admin' },
  { id: 'popular', label: 'Most Coveted', icon: Crown, desc: 'Bestselling master-crafted bottles' },
  { id: 'rating', label: 'Highest Rated', icon: Star, desc: 'Top reviewed fragrances (4.8★+)' },
  { id: 'price_asc', label: 'Price: Low to High', icon: ArrowDownWideNarrow, desc: 'Accessible luxury first' },
  { id: 'price_desc', label: 'Price: High to Low', icon: ArrowUpNarrowWide, desc: 'Exclusive prestige first' }
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  // Close sort dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [concentration, setConcentration] = useState(searchParams.get('concentration') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStock, setInStock] = useState(searchParams.get('in_stock') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || (searchParams.get('is_new_arrival') === 'true' ? 'newest' : 'all'));

  // Debounced states for search and price inputs to eliminate typing lag
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(minPrice);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(maxPrice);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 280);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
    }, 320);
    return () => clearTimeout(timer);
  }, [minPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMaxPrice(maxPrice);
    }, 320);
    return () => clearTimeout(timer);
  }, [maxPrice]);

  // Dynamic Store Filter Config from Admin
  const [filterConfig, setFilterConfig] = useState({
    genders: [
      { id: 'Men', label: 'Men', sub: 'Pour Homme', active: true },
      { id: 'Women', label: 'Women', sub: 'Pour Femme', active: true },
      { id: 'Unisex', label: 'Unisex', sub: 'Shared', active: true }
    ],
    pricePresets: [
      { label: 'All', min: '', max: '', active: true },
      { label: 'Under ₹5K', min: '', max: '5000', active: true },
      { label: '₹5K – ₹15K', min: '5000', max: '15000', active: true },
      { label: '₹15K – ₹30K', min: '15000', max: '30000', active: true },
      { label: '₹30K+', min: '30000', max: '', active: true }
    ],
    sections: {
      showSearch: true,
      showGender: true,
      showCategories: true,
      showBrands: true,
      showPrice: true,
      showInStock: true
    },
    searchPlaceholder: 'e.g. Amber, Vanilla, Oud, Sauvage...',
    bannerSubtitle: 'HAUTE PARFUMERIE COLLECTION',
    bannerTitle: 'Explore Our Fragrance Sanctuary',
    bannerDescription: 'Discover artisanal elixirs, rare oud accords, and signature luxury perfumes curated for distinction.'
  });

  // Fetch filter metadata & admin configs
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes, configRes] = await Promise.all([
          api.get('/categories').catch(() => ({ data: { categories: [] } })),
          api.get('/brands').catch(() => ({ data: { brands: [] } })),
          api.get('/filters/config').catch(() => ({ data: { config: null } }))
        ]);
        if (catRes.data.categories) setCategories(catRes.data.categories);
        if (brandRes.data.brands) setBrands(brandRes.data.brands);
        if (configRes.data?.config) setFilterConfig(configRes.data.config);
      } catch (err) {
        console.error('Error fetching filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products with AbortController to prevent race conditions and lag
  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setIsFiltering(true);
        const params = new URLSearchParams();

        if (debouncedSearch) params.append('search', debouncedSearch);
        if (category) params.append('category', category);
        if (brand) params.append('brand', brand);
        if (gender) params.append('gender', gender);
        if (concentration) params.append('concentration', concentration);
        if (debouncedMinPrice) params.append('minPrice', debouncedMinPrice);
        if (debouncedMaxPrice) params.append('maxPrice', debouncedMaxPrice);
        if (inStock) params.append('in_stock', 'true');
        if (sort) params.append('sort', sort);
        params.append('page', page);
        params.append('limit', 12);

        const res = await api.get(`/products?${params.toString()}`, {
          signal: controller.signal
        });
        if (res.data.success) {
          setProducts(res.data.products);
          setTotalProducts(res.data.total);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          console.error('Error fetching shop products:', err);
        }
      } finally {
        setIsInitialLoading(false);
        setIsFiltering(false);
      }
    };

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [debouncedSearch, category, brand, gender, concentration, debouncedMinPrice, debouncedMaxPrice, inStock, sort, page]);

  const applyFilter = (key, val) => {
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set(key, val);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setGender('');
    setConcentration('');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
    setSort('all');
    setPage(1);
    setSearchParams({}, { replace: true });
    setMobileFilterOpen(false);
  };

  const activeFilterCount = [
    Boolean(search),
    Boolean(category),
    Boolean(brand),
    Boolean(gender),
    Boolean(concentration),
    Boolean(minPrice || maxPrice),
    Boolean(inStock),
  ].filter(Boolean).length;

  const activeGenders = (filterConfig.genders || []).filter(g => g.active !== false);
  const activePricePresets = (filterConfig.pricePresets || []).filter(p => p.active !== false);
  const sections = filterConfig.sections || {
    showSearch: true,
    showGender: true,
    showCategories: true,
    showBrands: true,
    showPrice: true,
    showInStock: true
  };

  const renderFilterSections = (isMobile = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Search within catalog */}
      {sections.showSearch && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Search size={14} color="#d4af37" />
            <label style={{ fontSize: '0.76rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Search Notes or Name
            </label>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder={filterConfig.searchPlaceholder || "e.g. Amber, Vanilla, Oud, Sauvage..."}
              value={search}
              onChange={(e) => { setSearch(e.target.value); applyFilter('search', e.target.value); }}
              className="form-input-luxury"
              style={{
                padding: '10px 14px',
                fontSize: '0.84rem',
                borderRadius: '10px',
                background: 'rgba(10, 14, 22, 0.7)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); applyFilter('search', ''); }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Gender Accord */}
      {sections.showGender && activeGenders.length > 0 && (
        <div>
          <label style={{ fontSize: '0.76rem', color: '#f5df93', fontWeight: 700, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Gender Accord
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(activeGenders.length, 3)}, 1fr)`,
            gap: '8px'
          }}>
            {activeGenders.map(g => {
              const isSelected = gender === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  className="filter-btn-interactive"
                  onClick={() => {
                    const newG = isSelected ? '' : g.id;
                    setGender(newG);
                    applyFilter('gender', newG);
                  }}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.08) 100%)'
                      : 'rgba(15, 20, 30, 0.6)',
                    border: isSelected ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '10px 4px',
                    color: isSelected ? '#f5df93' : '#cbd5e1',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: isSelected ? '0 0 12px rgba(212, 175, 55, 0.25)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{g.label}</span>
                  {g.sub && (
                    <span style={{ fontSize: '0.66rem', color: isSelected ? '#d4af37' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {g.sub}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fragrance Families */}
      {sections.showCategories && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '0.76rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Fragrance Family
            </label>
            {category && (
              <button
                type="button"
                onClick={() => { setCategory(''); applyFilter('category', ''); }}
                style={{ background: 'transparent', border: 'none', color: '#d4af37', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: isMobile ? '160px' : '200px', overflowY: 'auto', paddingRight: '4px' }}>
            {categories.map(cat => {
              const isSelected = category === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className="filter-btn-interactive"
                  onClick={() => {
                    const newC = isSelected ? '' : cat.slug;
                    setCategory(newC);
                    applyFilter('category', newC);
                  }}
                  style={{
                    background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(20, 25, 38, 0.5)',
                    border: isSelected ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    color: isSelected ? '#f5df93' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 10px rgba(212, 175, 55, 0.2)' : 'none'
                  }}
                >
                  {isSelected && <Check size={12} color="#d4af37" />}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Brands */}
      {sections.showBrands && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '0.76rem', color: '#f5df93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Brand & Perfumer
            </label>
            {brand && (
              <button
                type="button"
                onClick={() => { setBrand(''); applyFilter('brand', ''); }}
                style={{ background: 'transparent', border: 'none', color: '#d4af37', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: isMobile ? '160px' : '190px', overflowY: 'auto', paddingRight: '4px' }}>
            {brands.map(b => {
              const isSelected = brand === b.slug;
              return (
                <button
                  key={b.id}
                  type="button"
                  className="filter-btn-interactive"
                  onClick={() => {
                    const newB = isSelected ? '' : b.slug;
                    setBrand(newB);
                    applyFilter('brand', newB);
                  }}
                  style={{
                    background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(20, 25, 38, 0.5)',
                    border: isSelected ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    color: isSelected ? '#f5df93' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 10px rgba(212, 175, 55, 0.2)' : 'none'
                  }}
                >
                  {isSelected && <Check size={12} color="#d4af37" />}
                  <span>{b.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range */}
      {sections.showPrice && (
        <div>
          <label style={{ fontSize: '0.76rem', color: '#f5df93', fontWeight: 700, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Price Range (₹)
          </label>
          
          {/* Quick presets */}
          {activePricePresets.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {activePricePresets.map((preset, idx) => {
                const isActive = minPrice === preset.min && maxPrice === preset.max;
                return (
                  <button
                    key={idx}
                    type="button"
                    className="filter-btn-interactive"
                    onClick={() => {
                      setMinPrice(preset.min);
                      setMaxPrice(preset.max);
                      setPage(1);
                      const newParams = new URLSearchParams(searchParams);
                      if (preset.min) newParams.set('minPrice', preset.min); else newParams.delete('minPrice');
                      if (preset.max) newParams.set('maxPrice', preset.max); else newParams.delete('maxPrice');
                      setSearchParams(newParams);
                    }}
                    style={{
                      background: isActive ? 'rgba(212, 175, 55, 0.22)' : 'rgba(15, 20, 30, 0.5)',
                      border: isActive ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      color: isActive ? '#f5df93' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Custom Min / Max inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); applyFilter('minPrice', e.target.value); }}
              className="form-input-luxury"
              style={{ padding: '8px 10px', fontSize: '0.8rem', borderRadius: '8px', background: 'rgba(10, 14, 22, 0.7)' }}
            />
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>to</span>
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); applyFilter('maxPrice', e.target.value); }}
              className="form-input-luxury"
              style={{ padding: '8px 10px', fontSize: '0.8rem', borderRadius: '8px', background: 'rgba(10, 14, 22, 0.7)' }}
            />
          </div>
        </div>
      )}

      {/* In Stock & Sort */}
      {sections.showInStock && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          background: 'rgba(15, 20, 30, 0.6)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <label htmlFor={isMobile ? "stockCheckMobile" : "stockCheckDesktop"} style={{ fontSize: '0.82rem', color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, margin: 0 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: inStock ? '#10b981' : '#64748b', display: 'inline-block' }}></span>
            In Stock Only
          </label>
          <input
            type="checkbox"
            id={isMobile ? "stockCheckMobile" : "stockCheckDesktop"}
            checked={inStock}
            onChange={(e) => { setInStock(e.target.checked); applyFilter('in_stock', e.target.checked ? 'true' : ''); }}
            style={{ width: '18px', height: '18px', accentColor: '#d4af37', cursor: 'pointer' }}
          />
        </div>
      )}

    </div>
  );

  return (
    <div className="shop-page-container" style={{ maxWidth: '1360px', margin: '30px auto', padding: '0 16px' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 26, 38, 0.9) 0%, rgba(8, 10, 15, 0.95) 100%)',
        border: '1px solid var(--border-gold)',
        borderRadius: '16px',
        padding: '30px 20px',
        textAlign: 'center',
        marginBottom: '30px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}>
        <div style={{ fontSize: '0.75rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: '6px' }}>
          {filterConfig.bannerSubtitle || 'HAUTE PARFUMERIE COLLECTION'}
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', color: '#ffffff', marginBottom: '8px', letterSpacing: '0.02em' }}>
          {filterConfig.bannerTitle || 'Explore Our Fragrance Sanctuary'}
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '580px', margin: '0 auto' }}>
          {filterConfig.bannerDescription || 'Discover artisanal elixirs, rare oud accords, and signature luxury perfumes curated for distinction.'}
        </p>
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px' }} className="shop-layout">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="d-none d-lg-block">
          <div className="glass-panel" style={{
            borderRadius: '18px',
            padding: '24px 20px',
            position: 'sticky',
            top: '90px',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
            background: 'linear-gradient(180deg, rgba(16, 21, 31, 0.85) 0%, rgba(10, 13, 20, 0.95) 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem' }}>
                <Filter size={18} color="#d4af37" /> Refine Fragrances
                {activeFilterCount > 0 && (
                  <span style={{
                    background: 'var(--gold-gradient)',
                    color: '#080a0f',
                    borderRadius: '12px',
                    padding: '2px 7px',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}>
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button 
                  type="button"
                  onClick={handleResetFilters}
                  style={{ background: 'transparent', border: 'none', color: '#d4af37', fontSize: '0.76rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </div>

            {renderFilterSections(false)}
          </div>
        </aside>

        {/* MAIN PRODUCTS VIEW */}
        <main>
          {/* Controls Bar */}
          <div className="shop-controls-bar" style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            background: 'rgba(15, 19, 28, 0.75)',
            padding: '12px 18px',
            borderRadius: '14px',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            zIndex: 50
          }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Showing <strong style={{ color: '#f8fafc' }}>{products.length}</strong> of <strong style={{ color: '#d4af37' }}>{totalProducts}</strong> Fragrances
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Mobile Filters Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="d-lg-none"
                style={{
                  background: activeFilterCount > 0 ? 'var(--gold-gradient)' : 'rgba(212, 175, 55, 0.12)',
                  color: activeFilterCount > 0 ? '#080a0f' : '#f5df93',
                  border: '1px solid #d4af37',
                  borderRadius: '10px',
                  padding: '7px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: activeFilterCount > 0 ? '0 0 15px rgba(212, 175, 55, 0.4)' : 'none'
                }}
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span style={{
                    background: '#080a0f',
                    color: '#d4af37',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.68rem',
                    fontWeight: 800
                  }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Luxury Custom Sort Dropdown */}
              <div className="luxury-sort-dropdown" ref={sortDropdownRef}>
                <button
                  type="button"
                  className={`luxury-sort-trigger ${sortDropdownOpen ? 'is-open' : ''}`}
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  aria-expanded={sortDropdownOpen}
                >
                  {(() => {
                    const currentSort = SORT_OPTIONS.find(s => s.id === sort) || SORT_OPTIONS[0];
                    const CurrentIcon = currentSort.icon;
                    return (
                      <>
                        <CurrentIcon size={14} color="#d4af37" />
                        <span>{currentSort.label}</span>
                        <ChevronDown size={14} className="chevron-icon" />
                      </>
                    );
                  })()}
                </button>

                {sortDropdownOpen && (
                  <div className="luxury-sort-menu">
                    <div style={{ padding: '6px 10px 4px', fontSize: '0.68rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                      Sort Collection By
                    </div>
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sort === opt.id;
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          className={`luxury-sort-option ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => {
                            setSort(opt.id);
                            applyFilter('sort', opt.id);
                            setSortDropdownOpen(false);
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              background: isSelected ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <Icon size={14} color={isSelected ? '#d4af37' : '#94a3b8'} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ color: isSelected ? '#f5df93' : '#f1f5f9', fontWeight: isSelected ? 600 : 500, fontSize: '0.82rem' }}>
                                {opt.label}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: isSelected ? '#d4af37' : '#64748b' }}>
                                {opt.desc}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check size={14} color="#d4af37" style={{ marginLeft: '8px', flexShrink: 0 }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active filter pills indicator bar (Mobile + Desktop) */}
          {activeFilterCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '18px',
              padding: '10px 14px',
              background: 'rgba(212, 175, 55, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(212, 175, 55, 0.15)'
            }}>
              <span style={{ fontSize: '0.74rem', color: '#d4af37', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Active Filters:
              </span>
              {search && (
                <span className="filter-pill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '14px', padding: '3px 10px', fontSize: '0.74rem', color: '#f5df93' }}>
                  Keyword: "{search}" <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setSearch(''); applyFilter('search', ''); }} />
                </span>
              )}
              {gender && (
                <span className="filter-pill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '14px', padding: '3px 10px', fontSize: '0.74rem', color: '#f5df93' }}>
                  Gender: {gender} <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setGender(''); applyFilter('gender', ''); }} />
                </span>
              )}
              {category && (
                <span className="filter-pill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '14px', padding: '3px 10px', fontSize: '0.74rem', color: '#f5df93' }}>
                  Family: {categories.find(c => c.slug === category)?.name || category} <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setCategory(''); applyFilter('category', ''); }} />
                </span>
              )}
              {brand && (
                <span className="filter-pill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '14px', padding: '3px 10px', fontSize: '0.74rem', color: '#f5df93' }}>
                  Brand: {brands.find(b => b.slug === brand)?.name || brand} <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setBrand(''); applyFilter('brand', ''); }} />
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="filter-pill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '14px', padding: '3px 10px', fontSize: '0.74rem', color: '#f5df93' }}>
                  Price: ₹{minPrice || '0'} - ₹{maxPrice || 'Any'} <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setMinPrice(''); setMaxPrice(''); applyFilter('minPrice', ''); applyFilter('maxPrice', ''); }} />
                </span>
              )}
              {inStock && (
                <span className="filter-pill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '14px', padding: '3px 10px', fontSize: '0.74rem', color: '#f5df93' }}>
                  In Stock <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setInStock(false); applyFilter('in_stock', ''); }} />
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  textDecoration: 'underline'
                }}
              >
                Clear All
              </button>
            </div>
          )}

          {/* Products Grid & Seamless Filter Transitions */}
          <div className="shop-products-container">
            {/* Glowing Golden Micro Progress Bar during filtering */}
            {isFiltering && (
              <div className="shop-filter-progress-bar">
                <div className="shop-filter-progress-bar-inner" />
              </div>
            )}

            {isInitialLoading ? (
              /* Initial Skeleton Grid with matching aspect ratio - Zero Layout Shift */
              <div className="shop-products-grid">
                {[...Array(8)].map((_, idx) => (
                  <div key={idx} className="skeleton-card">
                    <div className="skeleton-shimmer" style={{ width: '100%', paddingTop: '100%', marginBottom: '14px', borderRadius: '12px' }} />
                    <div className="skeleton-shimmer" style={{ width: '45%', height: '12px', marginBottom: '8px' }} />
                    <div className="skeleton-shimmer" style={{ width: '80%', height: '18px', marginBottom: '12px' }} />
                    <div className="skeleton-shimmer" style={{ width: '35%', height: '14px', marginTop: 'auto' }} />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="glass-card shop-product-card-anim" style={{ textAlign: 'center', padding: '50px 16px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '6px' }}>No Fragrances Found</h3>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: '16px' }}>
                  Try adjusting your filter selection or clear all active filters.
                </p>
                <button onClick={handleResetFilters} className="btn-luxury-gold" style={{ padding: '9px 20px' }}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={`shop-products-grid ${isFiltering ? 'is-filtering' : ''}`}>
                {products.map((product, pIdx) => (
                  <div
                    key={product.id}
                    className="shop-product-card-anim"
                    style={{ animationDelay: `${Math.min(pIdx * 0.03, 0.24)}s` }}
                  >
                    <ProductCard product={product} onQuickView={setQuickViewProduct} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '36px' }}>
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => { setPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: page === pageNum ? 'var(--gold-gradient)' : 'rgba(15, 19, 28, 0.8)',
                      color: page === pageNum ? '#080a0f' : '#f8fafc',
                      fontWeight: 600,
                      border: page === pageNum ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          )}

        </main>
      </div>

      {/* CENTERED RESPONSIVE LUXURY FILTER MODAL */}
      {mobileFilterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setMobileFilterOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(5, 7, 11, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              background: 'linear-gradient(165deg, #121824 0%, #080b11 100%)',
              border: '1px solid var(--border-gold)',
              borderRadius: '22px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(212, 175, 55, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              margin: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
              background: 'rgba(18, 24, 36, 0.85)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SlidersHorizontal size={16} color="#d4af37" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontFamily: 'var(--font-serif)', letterSpacing: '0.02em' }}>
                    Refine Fragrances
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {totalProducts} artisanal creations available
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  aria-label="Close Filter Modal"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div style={{
              padding: '20px 20px',
              overflowY: 'auto',
              flex: 1,
              maxHeight: 'calc(90vh - 140px)'
            }}>
              {renderFilterSections(true)}
            </div>

            {/* Modal Footer (Sticky Action) */}
            <div style={{
              display: 'flex',
              gap: '10px',
              padding: '14px 20px',
              borderTop: '1px solid rgba(212, 175, 55, 0.2)',
              background: 'rgba(10, 14, 22, 0.95)'
            }}>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-luxury-outline"
                style={{
                  flex: 1,
                  padding: '11px',
                  fontSize: '0.82rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={14} /> Clear
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="btn-luxury-gold"
                style={{
                  flex: 2,
                  padding: '11px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)'
                }}
              >
                Show {totalProducts} Fragrances
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default Shop;
