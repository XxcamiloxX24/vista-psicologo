/**
 * Manual Word: Plantillas de Test + Configuración (mismo formato que otros manuales).
 * Cada ejecución crea un .docx nuevo en docs/ con marca de tiempo.
 * Ejecutar: npm run docs:manual-plantillas-config
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
  return join(docsDir, `manual_usuario_psicologo - plantillas test y configuracion - ${stamp}.docx`);
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
        text: "Manual de usuario (Plantillas de Test y Configuración)",
        bold: true,
        size: 28,
      }),
    ],
    spacing: { after: 200 },
  }),
  body(
    "Este documento describe el módulo Plantillas de Test (evaluaciones reutilizables para asignar a aprendices) y la pantalla Configuración (perfil, seguridad, apariencia, firmas, reportes, etc.). Las zonas grises son espacio para capturas de pantalla.",
  ),

  h1("1. Plantillas de Test"),
  body(
    "En el menú lateral, Plantillas de Test abre la gestión de evaluaciones: puede crear plantillas con preguntas y opciones, editarlas, previsualizarlas y eliminarlas. Esas plantillas se usan al asignar tests a aprendices desde el perfil de seguimiento.",
  ),

  h2("1.1 Cabecera, nueva plantilla y listado"),
  ...imagePlaceholder(
    "Espacio para imagen: título Plantillas de Test, subtítulo sobre evaluaciones para aprendices, botón Nueva plantilla y lista o estado vacío/cargando.",
  ),
  body(
    "El subtítulo indica: Crea y administra las evaluaciones que puedes asignar a los aprendices. Nueva plantilla abre el formulario en la misma página. Si aún no hay datos, aparece un mensaje tipo No hay plantillas de test creadas aún con icono de lista.",
  ),

  h2("1.2 Formulario Crear o Editar plantilla"),
  ...imagePlaceholder(
    "Espacio para imagen: panel con Nombre, Descripción, bloque Preguntas numeradas, tipo de pregunta, opciones A/B/C…, botones subir/bajar/eliminar pregunta y pie Guardar.",
  ),
  body(
    "Campos generales: Nombre (obligatorio) y Descripción (opcional). Sección Preguntas: enlace + Agregar pregunta. Cada pregunta tiene número, texto, desplegable de tipo (Sí/No, Verdadero/Falso, Opción múltiple, Escala 1-5) y botones para mover arriba/abajo o eliminar la pregunta. Al cambiar el tipo, las opciones se reinician según valores por defecto del sistema.",
  ),
  body(
    "Opciones de respuesta: al menos dos textos por pregunta; en Opción múltiple puede agregar más opciones con + Agregar opción; puede quitar opciones si hay más de dos. Validaciones al guardar: nombre no vacío, al menos una pregunta, cada pregunta con texto y mínimo dos opciones. Botones Cancelar (cierra y limpia) y Crear plantilla o Guardar cambios. Los errores de API se muestran en rojo bajo el formulario.",
  ),

  h2("1.3 Lista de plantillas: vista previa, editar y eliminar"),
  ...imagePlaceholder(
    "Espacio para imagen: filas con nombre, conteo de preguntas y fecha, iconos ojo (preview), lápiz y papelera.",
  ),
  body(
    "Cada fila muestra el nombre de la plantilla, cuántas preguntas tiene y la fecha de creación. El icono de ojo expande o contrae una vista previa con el texto de cada pregunta, el tipo legible y las opciones en chips. Lápiz abre el mismo formulario en modo edición. Papelera elimina la plantilla en el servidor (durante la eliminación puede verse un spinner en el botón).",
  ),

  h1("2. Configuración"),
  body(
    "En el menú lateral, Configuración agrupa preferencias en acordeones desplegables: Perfil, Seguridad, Políticas de Seguridad, Notificaciones, Apariencia, Idioma y Región, Firma profesional y Reportar un problema. Pulse el título de una sección para abrirla o cerrarla.",
  ),

  h2("2.1 Perfil"),
  ...imagePlaceholder("Espacio para imagen: acordeón Perfil con datos de solo lectura y botón para editar perfil."),
  body(
    "Muestra documento, nombre completo, correos institucional y personal, teléfono, especialidad, fecha de nacimiento y dirección según los datos del psicólogo en el sistema. Suele haber un botón para ir a la pantalla de edición de perfil (donde puede actualizar información permitida).",
  ),

  h2("2.2 Seguridad"),
  ...imagePlaceholder("Espacio para imagen: acordeón Seguridad con contraseña actual, nueva y confirmación."),
  body(
    "Permite cambiar la contraseña de la cuenta: Contraseña actual, Nueva contraseña y Confirmar contraseña, con iconos para mostrar u ocultar cada campo. Tras guardar, la aplicación puede mostrar un mensaje de éxito o error según la respuesta del servidor.",
  ),

  h2("2.3 Políticas de seguridad, notificaciones y apariencia"),
  ...imagePlaceholder(
    "Espacio para imagen: acordeones Políticas de Seguridad (interruptores), Notificaciones (preferencias por tipo) y Apariencia (selector de tema).",
  ),
  body(
    "Políticas de Seguridad: interruptores como Compartir datos con el sistema y Permitir análisis de uso (según versión). Notificaciones: lista de tipos de aviso con interruptor individual. Apariencia: selector de Tema con opciones Claro, Oscuro y Automático (sigue al sistema).",
  ),

  h2("2.4 Idioma y región"),
  ...imagePlaceholder("Espacio para imagen: acordeón Idioma y Región con idioma y zona horaria."),
  body(
    "Idioma: por ejemplo Español o English. Zona horaria: opciones como America/Bogota (GMT-5). Sirve para mostrar fechas y horas coherentes con su ubicación.",
  ),

  h2("2.5 Firma profesional"),
  ...imagePlaceholder("Espacio para imagen: acordeón Firma con miniaturas guardadas, dibujar en lienzo o subir imagen."),
  body(
    "Texto orientador: guarda firmas reutilizables al finalizar seguimientos. Lista Tus firmas guardadas con miniatura y botón para eliminar. Puede dibujar en un lienzo y guardar como PNG, o subir un archivo de imagen. Al guardar o eliminar, la interfaz puede mostrar confirmación o mensaje de error.",
  ),

  h2("2.6 Reportar un problema"),
  ...imagePlaceholder("Espacio para imagen: formulario de reporte con título, categoría, prioridad, descripción y enviar."),
  body(
    "Formulario para enviar incidencias: Título, Categoría (por ejemplo Error de la plataforma, Datos incorrectos, Sugerencia o mejora, Otro), Prioridad (Baja, Media, Alta, Crítica), Descripción detallada y botón para enviar el reporte a través de la API. Útil para escalamiento a soporte o al equipo técnico.",
  ),

  h3("Nota final"),
  body(
    "Los textos corresponden a la vista psicólogo de HealthyMind. Actualice el manual si cambian nombres de secciones, tipos de pregunta o flujos de guardado.",
  ),
];

const doc = new Document({
  creator: "HealthyMind / documentación vista-psicólogo",
  description: "Manual usuario: Plantillas de Test y Configuración",
  title: "Manual usuario — Plantillas de Test y Configuración",
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
  outPath = join(docsDir, `manual_usuario_psicologo - plantillas test y configuracion - ${Date.now()}-reintento.docx`);
  writeFileSync(outPath, buffer);
  console.warn("\n(Aviso) El primer nombre estaba bloqueado; se usó un nombre alternativo.\n");
}

console.log("Nuevo Word generado:\n", outPath);
