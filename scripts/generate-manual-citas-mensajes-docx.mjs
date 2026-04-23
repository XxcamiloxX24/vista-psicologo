/**
 * Genera manual de usuario Word (Citas + Mensajes), con celdas vacías como espacio para imágenes.
 * Cada ejecución crea un archivo NUEVO en docs/ con fecha y hora en el nombre (no sobrescribe).
 * Ejecutar: npm run docs:manual-citas-mensajes
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

/** Nombre único por ejecución (válido en Windows). */
function buildNewDocxPath() {
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  const d = new Date();
  const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}_${pad(d.getMilliseconds(), 3)}`;
  return join(docsDir, `manual_usuario_psicologo - citas y mensajes - ${stamp}.docx`);
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

/** Celda gris vacía (~altura para captura de pantalla). */
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
        text: "Manual de usuario (Citas y Mensajes)",
        bold: true,
        size: 28,
      }),
    ],
    spacing: { after: 200 },
  }),
  body(
    "Este documento describe el uso del módulo Citas y del módulo Mensajes en la aplicación web para profesionales. Las zonas sombreadas en gris están reservadas para que pegues capturas de pantalla en Word (Insertar > Imágenes) o las dejes como referencia visual del espacio."
  ),

  h1("1. Citas"),
  body(
    "Desde el menú lateral, elija Citas. Allí puede alternar entre la vista de calendario y las solicitudes pendientes de los estudiantes, crear una nueva cita (formulario), abrir el detalle de una cita existente y, si la API falla, reintentar la carga o ver un aviso de datos de demostración."
  ),

  h2("1.1 Cabecera, pestañas y acciones rápidas"),
  ...imagePlaceholder("Espacio para imagen: cabecera Citas, pestañas Calendario / Solicitudes pendientes, botón Nueva Cita y contador de pendientes."),
  body(
    "Título Citas y subtítulo de gestión. Use Calendario para la agenda semanal y Solicitudes pendientes para la lista de solicitudes. El botón destacado con número muestra cuántas solicitudes hay sin atender. Nueva Cita abre el modal Agendar Nueva Cita."
  ),
  new Paragraph({
    text: "Pasos sugeridos: abrir Citas; si hay pendientes, pulse Solicitudes pendientes o el botón con el contador; para registrar cita propia, pulse Nueva Cita.",
    spacing: { after: 160 },
  }),

  h2("1.2 Leyenda de colores y calendario"),
  ...imagePlaceholder("Espacio para imagen: leyenda de estados y calendario (vista semana)."),
  body(
    "La leyenda indica el color de Programada, Reprogramada, Realizada/Completada, Cancelada y No asistió. En la barra del calendario use Hoy, flechas anterior/siguiente y los botones Semana, Día, Mes y Lista. La rejilla cubre aproximadamente de 06:00 a 22:00. Las citas en estado pendiente no aparecen en el calendario; gestionelas en Solicitudes pendientes."
  ),
  body(
    "Pulse un bloque de cita para abrir la pantalla Detalles de la Cita (estado, bitácora y Guardar cambios contra el servidor)."
  ),

  h2("1.3 Modal Agendar Nueva Cita"),
  ...imagePlaceholder("Espacio para imagen: modal Agendar Nueva Cita (campos y botones)."),
  body(
    "Formulario con nombre del aprendiz, número de ficha, fecha, hora, duración (30/45/60 minutos) y notas opcionales. Cancelar cierra el modal. El botón Agendar puede estar pendiente de conexión con la API de creación; confirme con el administrador si ya guarda en el sistema."
  ),

  h2("1.4 Solicitudes pendientes"),
  ...imagePlaceholder("Espacio para imagen: lista de solicitudes pendientes con botones Programar y Rechazar."),
  body(
    "Cada tarjeta muestra nombre, ficha, correo, tipo de cita, fecha de solicitud y motivo. Programar abre un segundo modal con fecha, hora inicio, hora fin y tipo (Presencial, Videollamada o Chat); al confirmar, la cita queda programada. Rechazar pide confirmación e indica que el estudiante será notificado."
  ),
  body(
    "Si faltan fecha u horas en el modal de programación, verá el mensaje: Complete fecha, hora inicio y hora fin."
  ),

  h2("1.5 Detalles de la Cita"),
  ...imagePlaceholder("Espacio para imagen: pantalla Detalles de la Cita (datos del estudiante, estado, bitácora)."),
  body(
    "Muestra fecha, hora, duración, profesional, motivo y tipo. Puede cambiar el estado (Pendiente, Programada, Reprogramada, Completada, Cancelada, No asistió) y editar la Bitácora de la Sesión. Guardar Cambios envía la actualización a la API; Volver al calendario o Cancelar cierra sin guardar según el botón."
  ),

  h2("1.6 Errores y datos de demostración"),
  ...imagePlaceholder("Espacio para imagen (opcional): mensaje de error y botón Reintentar en Citas."),
  body(
    "Si falla la carga del calendario, aparece un mensaje de error y la opción Reintentar. Si la aplicación muestra datos de demostración, verá un aviso al pie indicando que la API no está disponible o la sesión no es válida."
  ),

  h1("2. Mensajes"),
  body(
    "En Mensajes mantiene conversaciones por texto en tiempo casi real con aprendices, asociadas a citas (appointmentId). Puede buscar conversaciones, crear una nueva a partir de una cita elegible, enviar mensajes con Enter o el botón de enviar, y desde el menú de tres puntos silenciar notificaciones, archivar el chat o eliminar el historial de forma permanente."
  ),

  h2("2.1 Cabecera y Nueva conversación"),
  ...imagePlaceholder("Espacio para imagen: título Mensajes y botón Nueva conversación."),
  body(
    "El subtítulo indica Comunicación con aprendices. Nueva conversación abre un modal para elegir una cita de la lista disponible."
  ),

  h2("2.2 Modal Nueva conversación"),
  ...imagePlaceholder("Espacio para imagen: modal Nueva conversación con selector de cita."),
  body(
    "Debe seleccionar una cita en el desplegable. Solo se listan citas de tipo chat o videollamada que aún no han sido realizadas (según la lógica del sistema). Si no hay ninguna, verá el texto explicativo correspondiente. Crear conversación crea la sala o abre la existente si el aprendiz ya tenía chat con usted. Si la cita seleccionada sigue pendiente, el sistema puede programarla automáticamente como tipo chat con un horario por defecto antes de crear la sala."
  ),
  body(
    "Si intenta crear sin elegir cita, aparecerá un aviso pidiendo seleccionar una cita."
  ),

  h2("2.3 Lista de conversaciones y búsqueda"),
  ...imagePlaceholder("Espacio para imagen: columna izquierda con buscador y lista de chats."),
  body(
    "Campo Buscar conversaciones filtra por nombre o número de ficha. Cada fila muestra nombre, última línea de vista previa, marca de tiempo (Ahora, hora del día o Ayer según antigüedad) y la ficha. Pulse una fila para cargar el historial de esa conversación."
  ),

  h2("2.4 Ventana de chat"),
  ...imagePlaceholder("Espacio para imagen: cabecera del chat, burbujas de mensajes y zona de escritura."),
  body(
    "Los mensajes del psicólogo aparecen alineados a la derecha con degradado; los del estudiante a la izquierda con fondo neutro. Al escribir, el estudiante puede ver la indicación de que está escribiendo. Use el campo Escribe un mensaje… y el botón de enviar (avión de papel) o la tecla Enter para enviar. Los mensajes se envían por Socket.io; si no hay conversación seleccionada, verá el texto para seleccionar o crear una."
  ),
  body(
    "El icono del clip es visible junto al campo de texto; la adjunción de archivos puede no estar activa en todas las versiones."
  ),

  h2("2.5 Menú de opciones del chat (tres puntos)"),
  ...imagePlaceholder("Espacio para imagen: menú desplegable Silenciar, Eliminar el chat, Eliminar la conversación."),
  body(
    "Silenciar notificaciones guarda la preferencia en el navegador para esa conversación. Eliminar el chat quita la conversación de la lista (archivo en servidor). Eliminar la conversación elimina el historial de forma permanente; ambas opciones piden confirmación antes de ejecutarse."
  ),

  h2("2.6 Entrada desde notificaciones"),
  ...imagePlaceholder("Espacio para imagen (opcional): notificación que abre un chat concreto."),
  body(
    "Si abre la aplicación desde una notificación que indica un chat determinado, la interfaz puede seleccionar automáticamente esa conversación al cargar Mensajes."
  ),

  h3("Nota final"),
  body(
    "Los textos de botones y mensajes siguen la interfaz en español de la aplicación HealthyMind (vista psicólogo). Actualice este manual cuando cambien flujos o integraciones con la API."
  ),
];

const doc = new Document({
  creator: "HealthyMind / documentación vista-psicólogo",
  description: "Manual usuario: Citas y Mensajes",
  title: "Manual usuario — Citas y Mensajes",
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
  outPath = join(
    docsDir,
    `manual_usuario_psicologo - citas y mensajes - ${Date.now()}-reintento.docx`,
  );
  writeFileSync(outPath, buffer);
  console.warn("\n(Aviso) El primer nombre estaba bloqueado; se usó un nombre alternativo.\n");
}

console.log("Nuevo Word generado:\n", outPath);
