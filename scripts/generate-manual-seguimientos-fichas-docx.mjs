/**
 * Genera manual de usuario Word (Seguimientos + Fichas), mismo formato que Citas/Mensajes:
 * título, subtítulo, intro, secciones con "Espacio para imagen" + celda gris + texto.
 * Cada ejecución crea un archivo NUEVO en docs/ con fecha y hora en el nombre.
 * Ejecutar: npm run docs:manual-seguimientos-fichas
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeightRule,
  BorderStyle,
  ShadingType,
} from "docx";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = join(__dirname, "..", "docs");

function buildNewDocxPath() {
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  const d = new Date();
  const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}_${pad(d.getMilliseconds(), 3)}`;
  return join(docsDir, `manual_usuario_psicologo - seguimientos y fichas - ${stamp}.docx`);
}

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 160 },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 120 },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 100 },
  });
}

function body(text) {
  return new Paragraph({
    children: [new TextRun(text)],
    spacing: { after: 160 },
  });
}

function imagePlaceholder(caption) {
  const border = { style: BorderStyle.SINGLE, size: 6, color: "BBBBBB" };
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: caption,
          italics: true,
          color: "555555",
          size: 20,
        }),
      ],
      spacing: { before: 120, after: 100 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: border,
        bottom: border,
        left: border,
        right: border,
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
      rows: [
        new TableRow({
          height: { value: 3200, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              shading: { fill: "F0F0F0", type: ShadingType.CLEAR },
              margins: { top: 120, bottom: 120, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "\u00a0", size: 2 })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { after: 240 } }),
  ];
}

const children = [
  new Paragraph({
    text: "HealthyMind — Vista psicólogo",
    heading: HeadingLevel.TITLE,
    spacing: { after: 120 },
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: "Manual de usuario (Seguimientos y Fichas)",
        bold: true,
        size: 28,
      }),
    ],
    spacing: { after: 200 },
  }),
  body(
    "Este documento describe el uso del módulo Seguimientos y del módulo Fichas en la aplicación web para profesionales. Las zonas sombreadas en gris están reservadas para que pegues capturas de pantalla en Word (Insertar > Imágenes) o las dejes como referencia visual del espacio.",
  ),

  h1("1. Seguimientos"),
  body(
    "Desde el menú lateral, Seguimientos concentra a los aprendices con seguimiento psicológico activo. Puede listarlos en tarjetas o en tabla, filtrar, abrir el perfil de un caso, crear un seguimiento nuevo o actualizar datos según la versión de la aplicación.",
  ),

  h2("1.1 Cabecera, vista Cards / Tabla y leyenda de estados"),
  ...imagePlaceholder(
    "Espacio para imagen: cabecera Seguimientos, conmutador Cards / Tabla, botón Nuevo Seguimiento y leyendas Estable, Observación, Crítico.",
  ),
  body(
    "Título Seguimientos y subtítulo sobre listado de aprendices con seguimiento activo. Use Cards para ver tarjetas paginadas o Tabla para columnas con paginación del servidor. El botón Nuevo Seguimiento abre el formulario de alta manual. Las tres leyendas de color ayudan a interpretar el estado de cada registro.",
  ),

  h2("1.2 Búsqueda y filtro del listado"),
  ...imagePlaceholder("Espacio para imagen: campo Buscar por nombre, ficha, correo… y desplegable de filtro (Todos los campos, Nombre, etc.)."),
  body(
    "El buscador acota la lista mostrada. En vista Cards el filtro se aplica a los registros ya cargados en la página actual; si no ve resultados, pruebe otra página con las flechas inferiores. En Tabla la paginación la resuelve la API.",
  ),

  h2("1.3 Tarjetas (Cards) y paginación"),
  ...imagePlaceholder("Espacio para imagen: cuadrícula de tarjetas con nombre, ficha, correo, programa, estado y pie con página anterior/siguiente."),
  body(
    "Cada tarjeta muestra datos resumidos y un indicador de estado (Estable, En Observación o Crítico según la API). Pulse la tarjeta para abrir el perfil del seguimiento. El pie indica total de registros y página actual; use los chevrones para cambiar de página.",
  ),
  body(
    "Mensajes posibles: Cargando seguimientos…, No tienes seguimientos activos, o que la búsqueda no coincide en esta página.",
  ),

  h2("1.4 Vista Tabla"),
  ...imagePlaceholder("Espacio para imagen: tabla con columnas Nombre, Ficha, Correo, Programa, Estado y selector de registros por página."),
  body(
    "La vista Tabla muestra las mismas filas con columnas fijas. Puede cambiar registros por página (10, 20, 50, 100). Pulse una fila para abrir el mismo perfil detallado que desde Cards.",
  ),

  h2("1.5 Perfil del seguimiento (detalle del caso)"),
  ...imagePlaceholder(
    "Espacio para imagen: pantalla de detalle con botón volver y pestañas Información, Calendario, Gráficos, Diario, Test, Recomendaciones, Alertas.",
  ),
  body(
    "Tras elegir un seguimiento, ve la ficha ampliada del aprendiz y pestañas: Información (datos y estado del seguimiento), Calendario y Gráficos (contexto emocional), Diario, Test, Recomendaciones y Alertas. Use el control de retroceso para volver al listado. Si el seguimiento no existe, verá No se encontró ese seguimiento y enlace para volver al listado.",
  ),

  h2("1.6 Crear nuevo seguimiento"),
  ...imagePlaceholder(
    "Espacio para imagen: formulario Crear nuevo seguimiento (buscador de aprendiz o datos ya bloqueados si viene desde Fichas).",
  ),
  body(
    "Desde Nuevo Seguimiento debe buscar al aprendiz (mínimo 3 caracteres en el buscador), elegir resultado y, si hay varias fichas, seleccionar una. Desde Fichas el aprendiz puede llegar ya bloqueado.",
  ),
  body(
    "Complete: ¿Fue remitido desde alguna área? (No/Sí y texto si aplica), Trimestre actual (obligatorio, número mínimo 1), Motivo (obligatorio), Descripción u observación (opcional), Estado inicial (Estable, En Observación o Crítico). Cancelar vuelve al listado; Crear seguimiento envía a la API. Validaciones habituales: seleccionar aprendiz, trimestre válido, motivo no vacío, sesión de psicólogo válida.",
  ),

  h1("2. Fichas"),
  body(
    "En el menú lateral, Fichas muestra las fichas de formación asociadas al área del psicólogo. Al elegir una ficha ve a los aprendices vinculados y puede abrir un resumen o iniciar seguimiento si aún no lo tienen.",
  ),

  h2("2.1 Listado de fichas del área"),
  ...imagePlaceholder("Espacio para imagen: grid de tarjetas de ficha (número, jornada, programa, área, Ver aprendices)."),
  body(
    "Título Fichas y texto Fichas asociadas a tu área. Da click para ver sus aprendices. Cada tarjeta muestra Ficha, Jornada, Programa, Área y opcionalmente Centro/Regional, con enlace Ver aprendices. Estados: carga, error de API o mensaje si no hay fichas asignadas.",
  ),

  h2("2.2 Aprendices de la ficha seleccionada"),
  ...imagePlaceholder(
    "Espacio para imagen: barra con flecha atrás y título Aprendices de la ficha X; tarjetas de aprendices con Iniciar seguimiento o Con seguimiento activo.",
  ),
  body(
    "Pulse la flecha para volver al listado de fichas. Cada aprendiz muestra nombre, ID, correo, programa, área formativa y ficha. Si ya tiene seguimiento activo, la tarjeta se remarca y muestra Con seguimiento activo. Si no, aparece el botón Iniciar seguimiento. Pulse el área del perfil o Ver perfil para abrir el modal de resumen.",
  ),

  h2("2.3 Modal Perfil del Aprendiz"),
  ...imagePlaceholder("Espacio para imagen: modal Perfil del Aprendiz con datos y botones Ver Seguimiento o Crear seguimiento."),
  body(
    "Modal con cabecera Perfil del Aprendiz, resumen de nombre y programa, y cuadros con ID, Facultad, Correo, Teléfono, Ficha y Fecha de inscripción. Con seguimiento activo: botón Ver Seguimiento. Sin seguimiento: mensaje y botón Crear seguimiento.",
  ),

  h2("2.4 Confirmar e ir a Nuevo seguimiento"),
  ...imagePlaceholder("Espacio para imagen: modal Confirmar seguimiento con Cancelar y Sí, continuar."),
  body(
    "Al pulsar Iniciar seguimiento o Crear seguimiento desde el perfil, aparece Confirmar seguimiento explicando que será llevado a Seguimientos para completar el formulario. Sí, continuar navega al alta con el vínculo aprendiz-ficha resuelto. Si falta el código de vínculo (AprFicCodigo), el sistema puede mostrar un aviso para recargar o contactar soporte.",
  ),

  h3("Nota final"),
  body(
    "Los textos siguen la interfaz en español de HealthyMind (vista psicólogo). Actualice este manual cuando cambien flujos o la API.",
  ),
];

const doc = new Document({
  creator: "HealthyMind / documentación vista-psicólogo",
  description: "Manual usuario: Seguimientos y Fichas",
  title: "Manual usuario — Seguimientos y Fichas",
  sections: [
    {
      properties: {},
      children,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);

let outPath = buildNewDocxPath();
try {
  writeFileSync(outPath, buffer);
} catch (err) {
  const code = err && typeof err === "object" && "code" in err ? err.code : "";
  if (code !== "EBUSY" && code !== "EPERM") throw err;
  outPath = join(docsDir, `manual_usuario_psicologo - seguimientos y fichas - ${Date.now()}-reintento.docx`);
  writeFileSync(outPath, buffer);
  console.warn("\n(Aviso) El primer nombre estaba bloqueado; se usó un nombre alternativo.\n");
}

console.log("Nuevo Word generado:\n", outPath);
