/**
 * Manual Word: Tarjetas informativas + Emociones (mismo formato que otros manuales).
 * Cada ejecución crea un .docx nuevo en docs/ con marca de tiempo.
 * Ejecutar: npm run docs:manual-tarjetas-emociones
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
  return join(docsDir, `manual_usuario_psicologo - tarjetas y emociones - ${stamp}.docx`);
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
        text: "Manual de usuario (Tarjetas informativas y Emociones)",
        bold: true,
        size: 28,
      }),
    ],
    spacing: { after: 200 },
  }),
  body(
    "Este documento describe el módulo Tarjetas informativas (contenido que ven los aprendices) y el módulo Emociones (catálogo para el diario emocional). Las zonas grises son espacio reservado para capturas de pantalla en Word (Insertar > Imágenes).",
  ),

  h1("1. Tarjetas informativas"),
  body(
    "Desde el menú lateral, Tarjetas informativas permite crear, buscar, activar o desactivar y editar tarjetas de información psicológica. Los aprendices las ven en su aplicación según el estado Activa/Inactiva.",
  ),

  h2("1.1 Listado, búsqueda y nueva tarjeta"),
  ...imagePlaceholder(
    "Espacio para imagen: cabecera Tarjetas informativas, botón Nueva tarjeta y campo Buscar por título o descripción (mín. 3 caracteres).",
  ),
  body(
    "El subtítulo indica que gestiona las tarjetas que verán los aprendices y que puede activarlas o desactivarlas. Nueva tarjeta abre la pantalla de alta. El buscador, tras al menos 3 caracteres y una breve espera, consulta al servidor en modo búsqueda; con menos de 3 caracteres o campo vacío vuelve al listado paginado normal.",
  ),

  h2("1.2 Cuadrícula de tarjetas, estado e interruptor"),
  ...imagePlaceholder(
    "Espacio para imagen: tarjetas con imagen o icono, título, descripción, enlace externo, etiqueta Activa/Inactiva e interruptor tipo switch.",
  ),
  body(
    "Cada tarjeta muestra imagen (o icono si falla la URL), título, descripción breve y, si hay URL, la leyenda Enlace externo. En el pie: texto Activa o Inactiva y un interruptor que llama a la API para cambiar el estado sin abrir el detalle (el clic en la tarjeta no debe confundirse con el del interruptor). Pulse el cuerpo de la tarjeta para abrir el detalle.",
  ),
  body(
    "Si no hay tarjetas: mensaje No hay tarjetas, con texto distinto si está en modo búsqueda, y botón Crear tarjeta cuando la lista general está vacía.",
  ),

  h2("1.3 Paginación del listado"),
  ...imagePlaceholder("Espacio para imagen: pie de lista con texto Mostrando X–Y de Z y flechas de página."),
  body(
    "Con búsqueda activa no se muestra este pie (los resultados son la lista devuelta por la búsqueda). Sin búsqueda y con más de una página, aparece el rango Mostrando … de … total y botones anterior/siguiente con texto Página N de M. El tamaño de página por defecto en listado es 12 tarjetas.",
  ),

  h2("1.4 Nueva tarjeta informativa"),
  ...imagePlaceholder(
    "Espacio para imagen: formulario Nueva tarjeta informativa (título, descripción, carga de imagen, enlace, switch visible para aprendices).",
  ),
  body(
    "Pantalla con Volver, título Nueva tarjeta informativa y formulario: Título (obligatorio), Descripción, bloque para imagen (subida o URL según componente CardImageUpload), Enlace externo opcional (tipo URL), interruptor Visible para aprendices (activa). Cancelar vuelve atrás; Crear tarjeta envía a la API. El título vacío muestra error antes de guardar.",
  ),

  h2("1.5 Detalle, edición y eliminación"),
  ...imagePlaceholder(
    "Espacio para imagen: vista detalle con botones Editar y Eliminar, o modo edición con Guardar y Cancelar; modal de confirmación al eliminar.",
  ),
  body(
    "Al abrir una tarjeta: Volver, botones Editar y Eliminar. En vista lectura se muestra imagen grande, título, descripción y enlace Ver enlace externo si aplica. Editar muestra los mismos campos que el alta más el switch de estado. Guardar persiste cambios; Cancelar cierra el modo edición sin guardar desde la barra superior.",
  ),
  body(
    "Eliminar abre un modal ¿Eliminar esta tarjeta? advirtiendo que la acción no se puede deshacer y que dejará de mostrarse a los aprendices. Cancelar cierra el modal; Eliminar confirma y borra en servidor.",
  ),

  h1("2. Emociones"),
  body(
    "En el menú lateral, Emociones abre la pantalla Gestión de Emociones: catálogo que los aprendices usan al registrar emociones en el diario. Puede crear, editar y eliminar entradas con nombre, emoji, escala 1–10 (define categoría Positiva, Neutral, Negativa o Crítica según reglas del sistema), color de fondo y descripción opcional.",
  ),

  h2("2.1 Cabecera y listado"),
  ...imagePlaceholder(
    "Espacio para imagen: título Gestión de Emociones, subtítulo sobre el diario de aprendices, botón Nueva emoción y tabla o estado vacío.",
  ),
  body(
    "Título Gestión de Emociones y texto Administra el catálogo de emociones que los aprendices usan en su diario. Nueva emoción despliega el formulario de alta en la misma página. Si no hay registros, aparece un mensaje invitando a crear la primera emoción.",
  ),

  h2("2.2 Formulario crear o editar emoción"),
  ...imagePlaceholder(
    "Espacio para imagen: panel Crear emoción o Editar emoción con nombre, selector de emoji, escala deslizante 1–10, categoría en badge, color, descripción y vista previa.",
  ),
  body(
    "Campos: Nombre (obligatorio), Emoji (popover con cuadrícula de accesos rápidos y campo para pegar o escribir; se guarda el primer emoji del texto), Escala de 1 a 10 con deslizador y número visible junto a una insignia de categoría previa (Positiva, Neutral, Negativa, Crítica según la escala), Color de fondo (selector de color y código hexadecimal), Descripción opcional. Abajo hay Vista previa de cómo se verá la emoción.",
  ),
  body(
    "Validaciones: nombre no vacío; escala entre 1 y 10. Botones Cancelar (cierra el formulario) y Crear emoción o Guardar cambios según esté en alta o edición. Errores del servidor se muestran bajo el formulario.",
  ),

  h2("2.3 Tabla de emociones registradas"),
  ...imagePlaceholder("Espacio para imagen: tabla con columnas Emoji, Nombre, Escala, Categoría, Descripción y acciones Editar / Eliminar."),
  body(
    "La tabla lista emoji con fondo según color configurado, nombre, barra visual de escala con valor numérico, categoría con color distintivo, descripción truncada y botones de lápiz (editar) y papelera (eliminar). Al eliminar, la fila puede mostrar un indicador de carga mientras se procesa.",
  ),

  h3("Nota final"),
  body(
    "Textos y flujos corresponden a la vista psicólogo de HealthyMind. Actualice el manual si cambian permisos, límites de archivos en tarjetas o reglas de categoría por escala.",
  ),
];

const doc = new Document({
  creator: "HealthyMind / documentación vista-psicólogo",
  description: "Manual usuario: Tarjetas informativas y Emociones",
  title: "Manual usuario — Tarjetas y Emociones",
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
  outPath = join(docsDir, `manual_usuario_psicologo - tarjetas y emociones - ${Date.now()}-reintento.docx`);
  writeFileSync(outPath, buffer);
  console.warn("\n(Aviso) El primer nombre estaba bloqueado; se usó un nombre alternativo.\n");
}

console.log("Nuevo Word generado:\n", outPath);
