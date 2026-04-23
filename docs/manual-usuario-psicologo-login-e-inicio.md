## 3. Los gráficos del Inicio (lectura e interpretación)

Esta sección **amplía** lo ya descrito en el apartado 2.3 a 2.5 del mismo documento. Sirve para que el psicólogo sepa **qué pregunta responde cada gráfico**, **cómo leer ejes y series**, y **cómo usar los filtros** sin confundir indicadores.

### 3.1 Citas semanales (barras)

[imagen]

**Pregunta que responde el gráfico**

- “¿Cómo se distribuyeron mis **citas por día** esta semana comparada con la semana pasada?”

**Ejes y series**

- **Eje horizontal (X):** días de la semana (Lun … Dom).
- **Eje vertical (Y):** cantidad de citas (número entero).
- **Barras con degradado azul–morado:** **Semana actual** (la semana en curso según el dato que envía el servidor).
- **Barras grises:** **Semana anterior** (misma estructura de días, periodo previo).

**Cómo interpretarlo**

- Si un día de la semana actual **supera** claramente al mismo día de la semana anterior, ese día hubo **más demanda** de citas.
- Si varias barras de la semana actual están en **cero**, puede ser un día sin agenda, feriado, o simplemente **sin citas registradas** en el sistema para ese intervalo.

**Interacción**

| Acción | Para qué sirve |
|--------|----------------|
| Pasar el cursor sobre una barra | Ver el **valor exacto** en el tooltip |
| Leer la leyenda inferior | Saber qué color es “actual” vs “anterior” |

**Nota:** Si el servicio aún no devuelve datos, el gráfico puede mostrarse con valores en cero como referencia visual.

---

### 3.2 Tendencia de seguimientos (áreas apiladas)

[imagen]

**Pregunta que responde el gráfico**

- “¿Cómo evolucionó el **volumen de seguimientos** clasificados por estado (**estables**, **en observación**, **críticos**) mes a mes?”

**Qué significa “apilado”**

- En cada mes, la **altura total** de la columna de color es la **suma** de los tres estados.
- Cada franja de color aporta su parte a esa suma: puedes ver si crecieron más los **críticos** (rojo) o los **estables** (verde), por ejemplo.

**Ejes y series**

- **Eje X:** meses (etiquetas que devuelve el sistema para el periodo elegido).
- **Eje Y:** cantidad de registros de seguimiento (según agregación del backend).
- **Verde — Estables:** casos con evolución favorable o bajo riesgo inmediato (según criterios del sistema).
- **Amarillo — En observación:** requieren atención pero no necesariamente intervención urgente máxima.
- **Rojo — Críticos:** prioridad alta para revisión por parte del psicólogo.

**Filtros del periodo (encima del gráfico)**

| Modo | Qué hace | Cuándo usarlo |
|------|-----------|----------------|
| **Recientes** | Muestra la tendencia con los **datos recientes** que define el servidor | Vista rápida “lo último” sin elegir fechas |
| **Cuatrimestre** | Acota por **año** y por uno de los **tres bloques** de cuatro meses del año (Ene–Abr, May–Ago, Sep–Dic) | Alineado a periodos académicos o reportes trimestrales/cuatrimestrales |
| **Rango personalizado** | Dos fechas **desde / hasta** | Cuando necesitas un intervalo específico; el sistema **no permite** más de **4 meses** entre inicio y fin |

**Mensaje de error en rango**

- Si eliges fechas inválidas (por ejemplo, fin anterior al inicio, o intervalo mayor a cuatro meses), verás un aviso en rojo: **“El rango no puede superar 4 meses.”** Ajusta las fechas hasta que desaparezca; entonces el gráfico podrá cargar datos correctamente.

**Paso a paso — Comparar un cuatrimestre concreto**

1. Abre el desplegable del modo y elige **Cuatrimestre**.
2. Escribe el **año** (por ejemplo el año lectivo que te interesa).
3. En el segundo desplegable, elige el bloque de meses (primer, segundo o tercer cuatrimestre).
4. Observa cómo cambian las proporciones de verde, amarillo y rojo mes a mes.

---

### 3.3 Actividad mensual (líneas)

[imagen]

**Pregunta que responde el gráfico**

- “¿Cómo se relacionan en el tiempo mis **citas**, los **seguimientos** y los **mensajes**?”

**Series (líneas)**

- **Azul — Citas:** actividad de agenda/consultas.
- **Morado — Seguimientos:** registros o acciones de seguimiento psicológico.
- **Verde — Mensajes:** intercambio por el canal de mensajería de la plataforma.

**Periodo**

- El subtítulo indica **últimos 6 meses**: es una ventana fija hacia atrás desde “hoy” para comparar tendencias recientes.

**Cómo interpretarlo**

- Si **citas** y **seguimientos** suben a la vez, puede reflejar una cohorte con más acompañamiento formal.
- Si **mensajes** sube mucho más que citas, el canal escrito está absorbiendo parte de la comunicación (útil para dimensionar tiempo de respuesta).

**Estados de la vista**

| Estado en pantalla | Significado |
|--------------------|-------------|
| Indicador de carga (spinner) | Los datos de actividad mensual se están solicitando al servidor |
| **“No hay datos de actividad para mostrar.”** | No hubo registros agregables en ese periodo o hubo un vacío en la respuesta |

**Interacción**

- Pasa el cursor por los **puntos** de cada línea para ver el valor numérico por mes en el tooltip.

---

### 3.4 Relación con las tarjetas superiores del Inicio

[imagen]

Las **tarjetas** (Citas hoy, Seguimientos activos, Mensajes nuevos, Total aprendices) son **números de resumen** pensados para un vistazo rápido; los **gráficos** responden preguntas de **tendencia y comparación en el tiempo**. Úsalos en conjunto: la tarjeta te alerta del “hoy” o del volumen; el gráfico te muestra el **patrón** en semanas o meses.

---

## 4. Citas (vista principal del módulo)

Accede desde el **menú lateral** eligiendo **Citas**. Ahí gestionas la **agenda en calendario**, creas citas nuevas (formulario), revisas **solicitudes pendientes** de estudiantes y, al pulsar una cita del calendario, abres el **detalle** para actualizar estado y bitácora.

### 4.1 Cabecera, pestañas y acciones rápidas

[imagen]

**Qué se ve**

- Título **“Citas”** y texto de ayuda: **“Gestión de citas y agendamientos”** (en la vista de calendario añade que es **vista semanal con duración**).
- Pestañas o botones de modo: **Calendario** y **Solicitudes pendientes** (en “pendientes” puede aparecer un contador con el número de solicitudes).
- En vista **Calendario**, si hay solicitudes sin atender, un botón destacado **“Solicitudes pendientes”** con **badge numérico** (color ámbar).
- Botón **“+ Nueva Cita”** (degradado azul–morado) que abre el modal de agendamiento.

**Para qué sirve**

- Cambiar entre **planificación visual** (calendario) y **bandeja de trabajo** (solicitudes que requieren programar o rechazar).
- Ir rápido a lo urgente (contador de pendientes) o registrar una cita **proactiva** (nueva cita).

| Elemento | Acción | Resultado |
|----------|--------|------------|
| **Calendario** | Pulsar | Muestra la grilla semanal (por defecto) con eventos cargados del servidor |
| **Solicitudes pendientes** | Pulsar | Muestra la lista de estudiantes que solicitaron cita y esperan decisión |
| **Solicitudes pendientes** (botón con número, solo si hay pendientes) | Pulsar | Igual que la pestaña de pendientes: lleva a la lista |
| **+ Nueva Cita** | Pulsar | Abre el modal **“Agendar Nueva Cita”** |

**Paso a paso — Ir a solicitudes desde el calendario**

1. En **Citas**, confirma que estás en **Calendario**.
2. Si ves el botón **Solicitudes pendientes** con un número, pulsa sobre él (o usa la pestaña **Solicitudes pendientes**).
3. Revisa la lista y atiende cada tarjeta (programar o rechazar), como se describe en el apartado 4.4.

---

### 4.2 Leyenda de colores y calendario (vista semanal)

[imagen]

**Leyenda (debajo de las pestañas)**

- Cuadrados de color alineados con el texto: **Programada**, **Reprogramada**, **Realizada / Completada**, **Cancelada**, **No asistió**.
- Los mismos colores se aplican a los **bloques de evento** en el calendario para reconocer el **estado** de un vistazo.

**Barra de herramientas del calendario (FullCalendar)**

| Control | Acción | Resultado |
|---------|--------|------------|
| **Hoy** | Pulsar | Centra la vista en la fecha actual |
| **‹ ›** (anterior / siguiente) | Pulsar | Desplaza la semana, el día o el mes según la vista activa |
| **Título central** | Solo lectura | Muestra el rango de fechas visible (ej. semana del …) |
| **Semana / Día / Mes / Lista** | Pulsar | Cambia la vista: **Semana** (reja horaria), **Día**, **Mes** o **Lista** de la semana |

**Comportamiento útil**

- **Franja horaria:** el calendario muestra desde aproximadamente **06:00** hasta **22:00** (no hay franja “todo el día” en la vista horaria).
- **Indicador de “ahora”:** línea o marca de **hora actual** en la vista de día/semana (`nowIndicator`).
- **Duración:** la altura del evento refleja el intervalo entre hora de inicio y fin registrado en la cita.
- **Clic en un evento:** abre la pantalla **Detalles de la Cita** (ver apartado 4.5) para consultar datos del estudiante y **guardar** estado y bitácora en el servidor.

**Estados que no aparecen en el calendario**

- Las citas en estado **pendiente** (solicitud sin programar) **no** se dibujan en el calendario; se gestionan solo en **Solicitudes pendientes**.

**Carga y errores**

- Mientras se consultan las citas del rango visible, puede superponerse un **indicador de carga** sobre el calendario.
- Si falla la conexión con la API, aparece un **mensaje de error** y un botón **Reintentar**. Si la aplicación entra en modo demostración, puede mostrarse el aviso: *“Mostrando datos de demostración…”* y datos de ejemplo hasta que el servicio responda de nuevo.

---

### 4.3 Modal “Agendar Nueva Cita”

[imagen]

**Qué se ve**

- Título **“Agendar Nueva Cita”** y formulario con: **Nombre del aprendiz**, **Número de ficha**, **Fecha**, **Hora**, **Duración** (30 / 45 / 60 minutos), **Notas (opcional)**.
- Botones **Cancelar** y **Agendar**.

**Para qué sirve**

- Recoger en un solo lugar los datos mínimos para **proponer** una nueva cita desde el rol psicólogo.

**Acciones**

| Botón / campo | Acción | Resultado esperado en la interfaz |
|---------------|--------|-----------------------------------|
| **Cancelar** o **X** | Cerrar | El modal se cierra sin confirmación adicional |
| Campos del formulario | Escribir o elegir fechas/horas | Preparan la información que se enviaría al guardar |
| **Agendar** | Pulsar | En la versión actual del componente, el botón **no** ejecuta por sí solo el guardado contra el servidor; sirve como **cierre del flujo de maquetación**. Cuando el equipo conecte la API de creación de citas, este botón debería **crear la cita** y refrescar el calendario. **Revisa con tu administrador** si ya está habilitado el envío real. |

**Paso a paso (cuando el guardado esté conectado a la API)**

1. Pulsa **+ Nueva Cita**.
2. Completa nombre, ficha, fecha, hora y duración.
3. (Opcional) Añade notas.
4. Pulsa **Agendar** y espera confirmación o mensaje de error del sistema.
5. Vuelve al calendario y comprueba que el bloque aparece en el día y hora correctos.

---

### 4.4 Solicitudes pendientes (lista y modal “Programar”)

[imagen]

**Qué se ve**

- Título **“Solicitudes pendientes”** y texto explicativo: los estudiantes **solicitaron cita** y esperan que las **programes o rechaces**.
- Cada solicitud en tarjeta muestra: **nombre**, **ficha**, **correo** (o “Sin correo”), **tipo de cita**, **fecha/hora de solicitud**, **motivo**, y botones **Programar** y **Rechazar**.
- Si no hay solicitudes: mensaje **“No hay solicitudes pendientes”** con indicación de que aparecerán cuando un estudiante solicite.
- Si hay error de red: mensaje en rojo y **Reintentar**.

**Para qué sirve**

- Convertir una **solicitud** en una cita **programada** (con fecha, hora inicio/fin y tipo) o **rechazarla** con aviso al estudiante.

| Acción | Resultado |
|--------|------------|
| **Programar** | Abre el modal **“Programar cita — [nombre]”** con **Fecha**, **Hora inicio**, **Hora fin** y **Tipo de cita** (Presencial, Videollamada, Chat) |
| **Programar** (dentro del modal) | Envía la programación al servidor; la cita pasa a estado **programada** y la lista se actualiza |
| **Cancelar** (modal) | Cierra el modal sin guardar |
| **Rechazar** | Pide confirmación: *“¿Rechazar esta solicitud? El estudiante será notificado.”* Si confirmas, se rechaza en servidor y se actualiza la lista |

**Paso a paso — Aceptar y fijar fecha a una solicitud**

1. Entra a **Citas** → **Solicitudes pendientes**.
2. Localiza la tarjeta del estudiante y revisa **motivo** y **tipo**.
3. Pulsa **Programar**.
4. Elige **Fecha** con el selector de calendario.
5. Ajusta **Hora inicio** y **Hora fin** (deben ser coherentes con tu disponibilidad).
6. Confirma el **Tipo de cita** en el desplegable (Presencial, Videollamada o Chat).
7. Pulsa **Programar** en el pie del modal y espera a que cierre; la tarjeta debería desaparecer de pendientes y la cita quedará disponible en el **calendario** (como cita programada).

**Validación**

- Si faltan fecha u horas, el modal muestra: **“Completa fecha, hora inicio y hora fin.”**

**Nota (notificaciones):** si abres la app desde una **notificación** que apunta a una solicitud concreta, la interfaz puede cambiar automáticamente a **Solicitudes pendientes** y abrir el modal de **Programar** para esa cita, cuando el identificador coincide con una solicitud en la lista.

---

### 4.5 Detalles de la Cita (pantalla completa desde el calendario)

[imagen]

**Qué se ve**

- Botón **“Volver al calendario”** (flecha hacia atrás).
- Bloque con **nombre del estudiante**, **ficha** y **correo** (si existe).
- Cuadros con **fecha**, **hora**, **duración** (calculada), **profesional**, **motivo**, **tipo de cita**.
- Selector **Estado** (Pendiente, Programada, Reprogramada, Completada, Cancelada, No asistió).
- Área **Bitácora de la Sesión** (texto ampliable) para observaciones.
- **Cancelar** (vuelve sin guardar) y **Guardar Cambios** (envía actualización a la API).

**Para qué sirve**

- **Registrar el desenlace** de la sesión (estado y notas clínicas/administrativas permitidas por la política del SENA) y mantener la agenda **alineada con la realidad** (completada, cancelada, no asistió, etc.).

**Paso a paso — Cerrar una sesión y dejar bitácora**

1. En el **calendario**, haz clic en el bloque de la cita.
2. En **Detalles de la Cita**, revisa datos del estudiante y el horario.
3. Abre el selector **Estado** y elige el estado final apropiado (por ejemplo **Completada** o **No asistió**).
4. Escribe en **Bitácora de la Sesión** las observaciones permitidas por normativa (sin datos innecesarios ni fuera de finalidad).
5. Pulsa **Guardar Cambios** y espera; si hay error, lee el mensaje en pantalla.
6. Tras un guardado correcto, vuelves al **calendario** con la información actualizada.

---

## 5. Seguimientos

En el menú lateral, **Seguimientos** concentra a los aprendices con **seguimiento psicológico activo** registrado en el sistema. Desde aquí puede **listarlos** (tarjetas o tabla), **filtrarlos**, **abrir el perfil** de un caso concreto, **crear un seguimiento nuevo** o **actualizar / eliminar** uno existente según los permisos de la aplicación.

### 5.1 Cabecera, vista Cards / Tabla y leyenda de estados

[imagen]

**Qué se ve**

- Título **Seguimientos** y texto: **Listado de aprendices con seguimiento activo**.
- Conmutador **Cards** | **Tabla** para cambiar la forma de visualizar los mismos datos del servidor.
- Botón **+ Nuevo Seguimiento** (si está habilitado en su versión), que abre el flujo de **alta manual** de seguimiento.
- Tres leyendas de color: **Estable**, **Observación**, **Crítico** (coinciden con los estados que se muestran en cada registro).

**Para qué sirve**

- Tener un **panel operativo** del acompañamiento: localizar rápido a quién seguir y con qué nivel de alerta visual.

| Elemento | Acción | Resultado |
|----------|--------|------------|
| **Cards** | Pulsar | Muestra tarjetas paginadas (12 por página por defecto) |
| **Tabla** | Pulsar | Muestra columnas Nombre, Ficha, Correo, Programa, Estado con paginación configurable |
| **Nuevo Seguimiento** | Pulsar | Navega al formulario **Crear nuevo seguimiento** (búsqueda de aprendiz y datos del caso) |
| Leyenda de colores | Solo lectura | Ayuda a interpretar borde / insignia de cada tarjeta o fila |

---

### 5.2 Búsqueda y filtro del listado

[imagen]

**Qué se ve**

- Campo de texto con icono de lupa: placeholder **Buscar por nombre, ficha, correo…**
- Desplegable de filtro con icono: **Todos los campos**, **Nombre**, **Correo**, **ID**, **Programa**, **Ficha**.

**Para qué sirve**

- **Acotar** la lista actual (sobre todo en vista **Cards**, donde el filtro se aplica a los registros **ya cargados en la página**). En **Tabla**, la paginación la resuelve el servidor; el filtro de tarjetas no sustituye a la paginación de la API en modo tabla.

**Paso a paso — Buscar un aprendiz en Cards**

1. Deje activa la vista **Cards**.
2. Escriba en el buscador parte del **nombre**, **ficha**, **correo**, etc.
3. Si no ve resultados, compruebe si el texto coincide con algún registro **de la página actual**; si hace falta, cambie de página con las flechas inferiores.

---

### 5.3 Tarjetas (Cards) y paginación

[imagen]

**Qué se ve**

- Cuadrícula de **tarjetas** con nombre, **ficha**, correo, programa, **badge de estado** (texto que viene de la API o la etiqueta Estable / En Observación / Crítico) y texto **Ver perfil →**.
- Pie de bloque: texto **X registros · Página N de M** y botones **anterior / siguiente** (chevrones).
- Estados vacíos posibles: **Cargando seguimientos…**, **No tienes seguimientos activos**, **No hay registros en esta página**, o mensaje si la búsqueda no coincide en esa página.

**Para qué sirve**

- Escanear muchos casos de un vistazo y **entrar al detalle** con un clic en la tarjeta.

| Acción | Resultado |
|--------|------------|
| Clic en una **tarjeta** | Abre el **perfil del seguimiento** (pantalla detallada del aprendiz y pestañas de análisis) |
| **Página anterior / siguiente** | Solicita otra página de resultados al servidor (sin perder el modo Cards) |

---

### 5.4 Vista Tabla

[imagen]

**Qué se ve**

- Tabla con columnas: **Nombre**, **Ficha**, **Correo**, **Programa**, **Estado** (insignia coloreada).
- Pie: selector **Registros por página** (10, 20, 50, 100), texto de totales y flechas de paginación.

**Para qué sirve**

- Trabajar con **muchos registros** ordenados en columnas y ajustar el tamaño de página según su pantalla o informe.

| Acción | Resultado |
|--------|------------|
| Clic en una **fila** | Abre el mismo **perfil del seguimiento** que en Cards |
| Cambiar **registros por página** | Recarga la tabla desde la página 1 con el nuevo tamaño |

---

### 5.5 Perfil del seguimiento (detalle del caso)

[imagen]

**Qué se ve**

- Pantalla completa tras elegir un seguimiento: botón para **volver al listado**, datos del aprendiz y del seguimiento, y una **barra de pestañas** típica con: **Información**, **Calendario**, **Gráficos**, **Diario**, **Test**, **Recomendaciones**, **Alertas** (la pestaña Diario puede mostrar un indicador si hay actividad reciente en el diario emocional).

**Para qué sirve**

- **Centralizar** en un solo lugar la ficha formativa del aprendiz, la evolución emocional, citas, pruebas asignadas, recomendaciones, alertas (por ejemplo rachas emocionales) y acciones de **edición o baja** del seguimiento según lo que permita la interfaz (estado del seguimiento, firmas, etc.).

**Acciones habituales** (resumen; los textos exactos de botones pueden variar ligeramente según versión)

| Área | Uso |
|------|-----|
| **Información** | Datos personales y formativos, estado del seguimiento editable, firmas, etc. |
| **Calendario / Gráficos** | Contexto temporal y visualización de tendencias emocionales |
| **Diario** | Consulta del diario emocional del aprendiz cuando exista `aprendizId` en datos |
| **Test** | Plantillas y tests asignados |
| **Recomendaciones** | Listado y alta/edición/baja de recomendaciones ligadas al seguimiento |
| **Alertas** | Alertas del aprendiz; marcar como leída o resuelta cuando aplique |

**Paso a paso — Volver al listado**

1. Pulse el control de **retroceso** o **Volver** (según diseño) en la parte superior.
2. Vuelve a la vista **Seguimientos** con Cards o Tabla según la dejara activa.

Si el seguimiento **ya no existe** o hubo error de carga, puede ver **No se encontró ese seguimiento** y un enlace para **Volver al listado**.

---

### 5.6 Crear nuevo seguimiento

[imagen]

**Dos entradas al mismo formulario**

1. **Manual:** desde **Nuevo Seguimiento** en el listado de Seguimientos. Debe **buscar y seleccionar** al aprendiz.
2. **Desde Fichas:** cuando en **Fichas** confirma iniciar seguimiento para un aprendiz, el sistema le lleva aquí con el **aprendiz ya bloqueado** (no hace falta buscar de nuevo).

**Paso A — Seleccionar aprendiz (solo modo manual)**

1. En **Buscar aprendiz**, escriba al menos **3 caracteres** (nombre, documento o correo). Tras una breve espera aparecen sugerencias.
2. Elija una fila del desplegable. Si el sistema encuentra **varias fichas** para ese documento, se muestra la lista **Selecciona una**; pulse la ficha correcta.
3. Si no hay vínculo con ficha activa, verá un mensaje de error acorde (por ejemplo que no hay ficha activa).

**Paso B — Datos del seguimiento (manual y desde ficha)**

- **¿Fue remitido desde alguna área?** **No** / **Sí**; si elige **Sí**, complete el campo de texto del área (ej. Bienestar al aprendiz).
- **Trimestre actual** (obligatorio, número mínimo 1).
- **Motivo** (obligatorio): motivo de apertura del seguimiento.
- **Descripción / observación** (opcional).
- **Estado inicial del seguimiento:** **Estable**, **En Observación** o **Crítico** (se envía a la API en el formato institucional).

**Pie del formulario**

| Botón | Resultado |
|-------|-------------|
| **Cancelar** | Vuelve al listado de Seguimientos sin crear |
| **Crear seguimiento** | Valida y llama a la API; si todo es correcto, regresa al listado y el nuevo caso debería aparecer al refrescar |

**Validaciones frecuentes (mensajes de error en pantalla)**

- Debe **seleccionar un aprendiz** con el buscador (código de vínculo aprendiz–ficha).
- **Trimestre** numérico válido (mínimo 1).
- **Motivo** no vacío.
- Sesión de psicólogo no válida (debe **volver a iniciar sesión**).

En modo manual, un icono **X** sobre el resumen del aprendiz permite **cambiar de aprendiz** y limpiar la selección.

---

## 6. Fichas

En el menú lateral, **Fichas** muestra las **fichas de formación asociadas al área** del psicólogo. No es el listado genérico de “todos los aprendices del país”, sino las fichas donde usted tiene contexto institucional para trabajar. Al elegir una ficha, ve a los **aprendices activos** vinculados y puede abrir un **resumen** o **iniciar un seguimiento** si aún no lo tienen.

### 6.1 Listado de fichas del área

[imagen]

**Qué se ve**

- Título **Fichas** y subtítulo: **Fichas asociadas a tu área. Da click para ver sus aprendices.**
- Tarjetas con: **Ficha: [número]**, **Jornada**, **Programa**, **Área**, opcionalmente **Centro/Regional**, y en el pie **Ver aprendices →**.
- Estados: **Cargando fichas…**, mensaje de **error** si falla la API, o **No hay fichas asignadas a tu área** si la lista viene vacía.

**Para qué sirve**

- Saber **en qué grupos de formación** está asignado y **descender** al detalle de aprendices por ficha.

| Acción | Resultado |
|--------|------------|
| Clic en una **tarjeta de ficha** | Muestra la pantalla **Aprendices de la ficha [código]** |

---

### 6.2 Aprendices de la ficha seleccionada

[imagen]

**Qué se ve**

- Barra superior con botón **←** (volver al listado de fichas) y título **Aprendices de la ficha X**.
- Cuadrícula de tarjetas por aprendiz (nombre, ID, correo, programa, “facultad”/área formativa, ficha, **Ver perfil →**).
- Si el sistema detecta que el aprendiz **ya tiene seguimiento activo**, la tarjeta lleva remarcado visual (borde ámbar) y el texto **Con seguimiento activo**.
- Si **no** tiene seguimiento: botón **Iniciar seguimiento** en la parte inferior de la tarjeta.

**Para qué sirve**

- Identificar **quién pertenece** a esa ficha y si ya está **bajo seguimiento psicológico** en HealthyMind.

| Acción | Resultado |
|--------|------------|
| **←** | Vuelve al listado de fichas |
| Clic en el área principal de la tarjeta (nombre / Ver perfil) | Abre el **modal Perfil del Aprendiz** |
| **Iniciar seguimiento** | Abre el modal **Confirmar seguimiento** (solo si no hay seguimiento activo) |

---

### 6.3 Modal “Perfil del Aprendiz”

[imagen]

**Qué se ve**

- Cabecera **Perfil del Aprendiz** y botón cerrar (**X**).
- Bloque resumen con nombre y programa.
- Cuadros con **ID**, **Facultad** (área formativa del programa), **Correo**, **Teléfono**, **Ficha**, **Fecha de inscripción**.
- Si **hay seguimiento activo**: botón **Ver Seguimiento** (le lleva al detalle de seguimiento usando el código correspondiente).
- Si **no hay seguimiento**: mensaje informativo y botón **Crear seguimiento** (abre el mismo flujo de confirmación que **Iniciar seguimiento** en la tarjeta).

**Para qué sirve**

- **Consultar datos básicos** sin salir de Fichas y decidir si abre el **seguimiento** existente o **crea uno nuevo**.

---

### 6.4 Confirmar e ir a “Nuevo seguimiento”

[imagen]

**Qué se ve**

- Modal **Confirmar seguimiento** con texto del tipo: ¿Desea iniciar un seguimiento para **[nombre]**? Será llevado a la página de Seguimientos para completar el formulario.
- Botones **Cancelar** y **Sí, continuar**.

**Para qué sirve**

- Evitar altas accidentales y **transportar** al formulario de **Crear nuevo seguimiento** (sección 5.6) con el **vínculo aprendiz–ficha** ya resuelto.

**Paso a paso**

1. En **Fichas**, elija ficha → aprendiz sin seguimiento.
2. Pulse **Iniciar seguimiento** o abra el perfil y **Crear seguimiento**.
3. En el modal, pulse **Sí, continuar**.
4. Complete el formulario en **Seguimientos** (trimestre, motivo, estado inicial, etc.) y pulse **Crear seguimiento**.

Si el sistema no puede obtener el código de vínculo (**AprFicCodigo**), mostrará un aviso para recargar o contactar soporte.

---

## Próximos apartados

Temas sugeridos: **Tarjetas informativas**, **Emociones**, **Plantillas de Test**, **Sobre nosotros**, **Configuración / Perfil**, etc.

---

*Documento para el proyecto **vista-psicologo** / HealthyMind. Sustituir los marcadores `[imagen]` por capturas reales. Revisar textos de validación y botones si la interfaz evoluciona.*
