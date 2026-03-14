import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import { useTheme } from '../contexts/ThemeContext';
import type { SeguimientoListarResult } from '../lib/seguimiento';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function formatName(r: SeguimientoListarResult): string {
  const n = r.aprendiz?.aprendiz?.nombres;
  const a = r.aprendiz?.aprendiz?.apellidos;
  const parts: string[] = [];
  if (n?.primerNombre) parts.push(n.primerNombre);
  if (n?.segundoNombre) parts.push(n.segundoNombre);
  if (a?.primerApellido) parts.push(a.primerApellido);
  if (a?.segundoApellido) parts.push(a.segundoApellido);
  return parts.filter(Boolean).join(' ') || '—';
}

function getStatusBadgeClass(estado: string, isDark: boolean): string {
  const e = (estado || '').toLowerCase();
  if (e.includes('estable')) return isDark ? 'bg-green-900/50 text-green-300 border-green-600/50' : 'bg-green-100 text-green-700 border-green-200';
  if (e.includes('observ') || e.includes('observacion')) return isDark ? 'bg-yellow-900/50 text-yellow-300 border-yellow-600/50' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
  if (e.includes('critic')) return isDark ? 'bg-red-900/50 text-red-300 border-red-600/50' : 'bg-red-100 text-red-700 border-red-200';
  return isDark ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-100 text-slate-700 border-slate-200';
}

interface FollowupsTableProps {
  data: SeguimientoListarResult[];
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  tamanoPagina: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
  onRowClick?: (item: SeguimientoListarResult) => void;
}

const columnHelper = createColumnHelper<SeguimientoListarResult>();

export function FollowupsTable({
  data,
  paginaActual,
  totalPaginas,
  totalRegistros,
  tamanoPagina,
  onPageChange,
  onPageSizeChange,
  isLoading,
  onRowClick,
}: FollowupsTableProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const columns: ColumnDef<SeguimientoListarResult, string>[] = [
    columnHelper.accessor((r) => formatName(r), { id: 'nombre', header: 'Nombre' }),
    columnHelper.accessor((r) => String(r.aprendiz?.ficha?.ficCodigo ?? '—'), { id: 'ficha', header: 'Ficha' }),
    columnHelper.accessor((r) => r.aprendiz?.aprendiz?.contacto?.correoInstitucional ?? '—', { id: 'email', header: 'Correo' }),
    columnHelper.accessor((r) => r.aprendiz?.ficha?.programaFormacion?.progNombre ?? '—', { id: 'programa', header: 'Programa' }),
    columnHelper.accessor((r) => r.estadoSeguimiento ?? '—', {
      id: 'estado',
      header: 'Estado',
      cell: ({ getValue }) => {
        const v = String(getValue());
        return (
          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusBadgeClass(v, isDark)}`}>
            {v}
          </span>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const pageSizes = [10, 20, 50, 100];

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden" style={{ background: 'transparent' }}>
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className={isDark ? 'bg-slate-700/80' : 'bg-slate-200/80'}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className={`px-4 py-3 text-left text-sm font-medium ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  No hay registros
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`border-b transition-colors cursor-pointer ${
                    isDark
                      ? 'border-slate-600/50 hover:bg-slate-800/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  } ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`flex flex-wrap items-center justify-between gap-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm">Registros por página:</span>
          <select
            value={tamanoPagina}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={`rounded-lg border px-2 py-1 text-sm ${
              isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-800'
            }`}
          >
            {pageSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {totalRegistros} registros · Página {paginaActual} de {totalPaginas || 1}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onPageChange(paginaActual - 1)}
              disabled={paginaActual <= 1}
              className={`p-2 rounded-lg disabled:opacity-40 ${
                isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(paginaActual + 1)}
              disabled={paginaActual >= totalPaginas}
              className={`p-2 rounded-lg disabled:opacity-40 ${
                isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
