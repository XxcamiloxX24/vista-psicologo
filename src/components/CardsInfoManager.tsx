import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Image as ImageIcon, ExternalLink, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from './ui/input';
import {
  listarCardsPaginado,
  buscarCardsDinamico,
  cambiarEstadoCard,
  type CardInfo,
} from '../lib/cardsInfo';

interface CardsInfoManagerProps {
  onViewCard: (card: CardInfo) => void;
  onOpenCreate: () => void;
  listRefreshKey?: number;
}

export function CardsInfoManager({ onViewCard, onOpenCreate, listRefreshKey = 0 }: CardsInfoManagerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPaginado = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listarCardsPaginado(page, pageSize);
      setCards(res.resultados ?? []);
      setTotalPages(res.totalPaginas ?? 0);
      setTotalRegistros(res.totalRegistros ?? 0);
    } catch {
      setCards([]);
      setTotalPages(0);
      setTotalRegistros(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const loadSearch = useCallback(async (text: string) => {
    if (!text || text.trim().length < 3) {
      setSearchMode(false);
      loadPaginado();
      return;
    }
    setSearching(true);
    setSearchMode(true);
    try {
      const results = await buscarCardsDinamico(text.trim());
      setCards(results);
      setTotalPages(1);
      setTotalRegistros(results.length);
    } catch {
      setCards([]);
      setTotalPages(0);
      setTotalRegistros(0);
    } finally {
      setSearching(false);
    }
  }, [loadPaginado]);

  useEffect(() => {
    if (searchMode) return;
    loadPaginado();
  }, [page, pageSize, listRefreshKey, searchMode, loadPaginado]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchTerm.trim()) {
      setSearchMode(false);
      loadPaginado();
      return;
    }
    if (searchTerm.trim().length < 3) {
      setSearchMode(false);
      loadPaginado();
      return;
    }
    debounceRef.current = setTimeout(() => {
      loadSearch(searchTerm);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, loadSearch, loadPaginado]);

  const handleToggleEstado = async (card: CardInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    const id = card.carCodigo;
    if (id == null) return;
    setTogglingId(id);
    try {
      const updated = await cambiarEstadoCard(id);
      setCards((prev) =>
        prev.map((c) => (c.carCodigo === id ? { ...c, carEstadoRegistro: updated.carEstadoRegistro } : c))
      );
    } catch {
      // Revert on error
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Tarjetas informativas
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Gestiona las tarjetas de información psicológica que verán los aprendices. Activa o desactiva según convenga.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCreate}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 shrink-0" />
          Nueva tarjeta
        </button>
      </div>

      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-purple-100/50 dark:border-slate-600/50 shadow-sm p-6">
        <div className="relative mb-4">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título o descripción (mín. 3 caracteres)..."
            className={`pl-12 h-10 rounded-xl ${
              isDark
                ? 'border-slate-600 bg-slate-800 text-white placeholder:text-slate-400'
                : 'border-purple-200/50 bg-slate-50 text-slate-800'
            }`}
          />
        </div>

        {loading || searching ? (
          <div className={`flex flex-col items-center justify-center py-16 text-slate-500 ${isDark ? 'text-slate-400' : ''}`}>
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-purple-600" />
            <p>Cargando tarjetas…</p>
          </div>
        ) : cards.length === 0 ? (
          <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay tarjetas</p>
            <p className="text-sm mt-1">
              {searchMode
                ? 'No se encontraron resultados para tu búsqueda.'
                : 'Crea tu primera tarjeta informativa para los aprendices.'}
            </p>
            {!searchMode && (
              <button
                type="button"
                onClick={onOpenCreate}
                className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-md transition-all"
              >
                Crear tarjeta
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => {
                const id = card.carCodigo ?? 0;
                const isActive = (card.carEstadoRegistro ?? 'activo').toLowerCase() === 'activo';
                const imgUrl = card.carImagenUrl ?? card.carLink;
                return (
                  <div
                    key={id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onViewCard(card)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onViewCard(card);
                      }
                    }}
                    className={`rounded-2xl border overflow-hidden transition-all cursor-pointer group ${
                      isDark
                        ? 'bg-slate-800/95 border-slate-600/80 hover:border-slate-500/80 hover:shadow-lg'
                        : 'bg-white/95 border-purple-100/50 hover:border-purple-200 hover:shadow-lg'
                    }`}
                  >
                    <div className="aspect-video relative bg-gradient-to-br from-slate-100 to-purple-100/30 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <ImageIcon className={`w-16 h-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className={`font-semibold mb-1 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}>
                        {card.carTitulo || 'Sin título'}
                      </h3>
                      <p className={`text-sm line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {card.carDescripcion || 'Sin descripción'}
                      </p>
                      {card.carLink && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                          <ExternalLink className="w-3.5 h-3.5" />
                          Enlace externo
                        </div>
                      )}
                      <div
                        className={`flex items-center justify-between gap-3 mt-3 pt-3 border-t ${isDark ? 'border-slate-600/50' : 'border-purple-100/50'}`}
                      >
                        <span className={`text-xs font-medium ${isActive ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                          {isActive ? 'Activa' : 'Inactiva'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleEstado(card, e);
                          }}
                          disabled={togglingId === id}
                          className={`
                            relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full
                            border-2 p-0.5 overflow-hidden
                            transition-colors duration-200
                            focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2
                            disabled:cursor-not-allowed disabled:opacity-60
                            ${isActive
                              ? 'border-green-500 bg-green-500 dark:border-emerald-400 dark:bg-emerald-500'
                              : 'border-slate-300 bg-slate-200 dark:border-slate-500 dark:bg-slate-600'
                            }
                          `}
                          style={{ minWidth: 48, minHeight: 28 }}
                        >
                          {togglingId === id ? (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                            </span>
                          ) : (
                            <span
                              className="absolute left-0.5 top-1/2 w-5 h-5 rounded-full bg-white shadow-sm ring-1 ring-slate-900/10 dark:ring-white/20 transition-transform duration-200"
                              style={{
                                transform: `translate(${isActive ? -17 : 0}px, -50%)`,
                              }}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!searchMode && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-purple-100/50 dark:border-slate-600/50">
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalRegistros)} de {totalRegistros}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
                      isDark
                        ? 'text-slate-300 hover:bg-slate-700 disabled:hover:bg-transparent'
                        : 'text-slate-600 hover:bg-slate-100 disabled:hover:bg-transparent'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Página {page} de {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
                      isDark
                        ? 'text-slate-300 hover:bg-slate-700 disabled:hover:bg-transparent'
                        : 'text-slate-600 hover:bg-slate-100 disabled:hover:bg-transparent'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
