# Manual de usuario — Vista psicólogo (parte 1)

Documento orientado al **profesional de psicología** que utiliza la aplicación web **HealthyMind** (SENA Institucional).  
En esta parte se cubren las secciones **Inicio de sesión** e **Inicio** (panel principal tras autenticarse).

> **Sobre las imágenes:** donde aparece el marcador `[imagen]`, sustitúyelo por una captura de pantalla real del entorno (por ejemplo `assets/manual/login-pantalla-completa.png`) cuando armes la versión final con diseño o PDF.

---

## 1. Inicio de sesión

### 1.1 Pantalla completa de acceso

[imagen]

**Qué se ve en esta pantalla**

- Fondo claro u oscuro según la configuración del sistema o del navegador, con una tarjeta central donde se concentra el formulario.
- **Cabecera de la tarjeta:** identidad visual **HealthyMind**, **SENA Institucional**, texto **“Acceso para profesionales”**, y logotipos (SENA e icono de la aplicación).
- **Formulario:** campos para **correo electrónico** y **contraseña**, botón para **mostrar u ocultar** la contraseña, enlace **“¿Olvidaste tu contraseña?”**, botón principal **“Iniciar sesión”**, y texto legal sobre **términos y política de datos**.
- **Pie de página:** enlace a la **política de confidencialidad SOFIA Plus** del SENA (se abre en una pestaña nueva).

**Para qué sirve**

- **Identificar al psicólogo** de forma segura antes de mostrar datos sensibles de aprendices, citas o seguimientos.
- **Cumplir lineamientos institucionales** al recordar que el acceso es para personal autorizado y enlazar políticas de tratamiento de datos.

**Acciones que puede realizar el usuario**

| Elemento | Acción | Resultado |
|----------|--------|------------|
| Campo **Correo electrónico** | Escribir el correo con el que está registrado en el sistema | El valor se usa como usuario para autenticarse |
| Campo **Contraseña** | Escribir la clave | Se envía de forma segura al validar el formulario |
| Icono **ojo** (mostrar/ocultar) | Pulsar para alternar | La contraseña se muestra como texto o se oculta con puntos, según prefiera verificar lo escrito |
| **¿Olvidaste tu contraseña?** | Pulsar | Se muestra un mensaje con la indicación de **contactar al administrador del SENA** y la **línea de atención 018000 910 270** (no se restablece la clave desde esta pantalla) |
| **Iniciar sesión** | Pulsar tras completar correo y contraseña | Si los datos son correctos, entra al panel; si hay error, aparece un mensaje en rojo dentro de la tarjeta |
| **Términos y Condiciones** / **Política de Tratamiento de Datos Personales** | Pulsar cualquiera de los dos enlaces | Se abre la vista de lectura de **términos y privacidad**; desde allí puede volver al login |
| Enlace **portal.senasofiaplus.edu.co** | Pulsar | Abre en nueva pestaña la política de confidencialidad de SOFIA Plus |

**Paso a paso — Entrar al sistema**

1. Abre la URL de la vista psicólogo que te haya indicado la institución (por ejemplo la publicada en el servidor del proyecto).
2. En **Correo electrónico**, escribe tu correo personal registrado (formato de correo válido).
3. En **Contraseña**, escribe tu clave.
4. (Opcional) Pulsa el icono del **ojo** si necesitas comprobar que escribiste bien la contraseña.
5. Pulsa **Iniciar sesión**.
6. Espera a que termine la carga: el botón puede mostrar **“Iniciando sesión…”** con un indicador de espera.
7. Si aparece un mensaje de error en rojo, revisa correo y contraseña, o contacta soporte si persisten los fallos.
8. Si el inicio es correcto, la aplicación te lleva al **Inicio** (panel principal) con el menú lateral y tus datos de perfil cargados.

**Mensajes frecuentes**

- **“Por favor ingresa tu correo y contraseña.”** — Falta uno de los dos campos o solo espacios en blanco.
- **Mensaje genérico de error** — Credenciales incorrectas o problema de conexión con el servidor; puede reintentarse o escalarse a soporte.

---

### 1.2 Vista de términos y condiciones / política de datos (desde el login)

[imagen]

**Qué se ve**

- Pantalla de solo lectura con bloques informativos (introducción, política de tratamiento, marco legal, principios rectores, derechos de los titulares, finalidades del tratamiento, etc.) y un control para **volver**.

**Para qué sirve**

- Informar al profesional sobre el **marco legal** y el **tratamiento de datos personales** antes o después de usar la plataforma, sin obligar a aceptar con un checkbox en esta pantalla (el texto del login indica que al iniciar sesión se entiende la aceptación).

**Acciones**

| Elemento | Acción | Resultado |
|----------|--------|------------|
| **Volver** (o control equivalente con flecha) | Pulsar | Regresa a la pantalla de **login** sin cerrar el navegador |

**Paso a paso**

1. Desde el login, pulsa **Términos y Condiciones** o **Política de Tratamiento de Datos Personales**.
2. Lee el contenido por secciones (puedes desplazarte verticalmente).
3. Cuando termines, pulsa **Volver** para regresar al formulario de acceso.

---

## 2. Inicio (panel principal)

Tras un login exitoso, la sección por defecto suele ser **Inicio**. Es el tablero donde ves un resumen del día, métricas y gráficos. El menú lateral permite cambiar a otras áreas (citas, mensajes, etc.); eso se documentará en partes posteriores del manual.

### 2.1 Cabecera del Inicio (título, bienvenida y fecha)

[imagen]

**Qué se ve**

- Título grande **“Inicio”**.
- Texto de bienvenida: **“Bienvenido de nuevo,”** seguido del **nombre** que el sistema tiene asociado a tu perfil de psicólogo.
- A la derecha, la etiqueta **“Hoy”** y la **fecha larga** en español (por ejemplo día de la semana, número de día, mes y año).

**Para qué sirve**

- **Contextualizar** la sesión: confirma que entraste con el usuario correcto y en qué día calendario estás trabajando.
- **Personalizar** la experiencia con tu nombre visible.

**Acciones**

- No requiere interacción obligatoria; es informativa. La fecha se actualiza según el día del dispositivo.

---

### 2.2 Tarjetas de resumen (indicadores superiores)

[imagen]

**Qué se ve**

- Hasta **cuatro tarjetas** en fila (en pantallas pequeñas se apilan). Cada una tiene icono, **número principal**, **título** y, en varias de ellas, una **franja de tendencia** (porcentaje y texto tipo “vs ayer”, “vs semana pasada”, “vs mes pasado”).
- Etiquetas habituales:
  - **Citas Hoy** — cantidad de citas previstas para el día actual.
  - **Seguimientos Activos** — resumen asociado al seguimiento de casos.
  - **Mensajes Nuevos** — resumen asociado a la mensajería.
  - **Total Aprendices** — total de aprendices vinculados a tu alcance en el sistema (solo muestra el número y la leyenda “Total de aprendices”, sin la franja de tendencia de las otras).

**Para qué sirve**

- Tener un **vistazo rápido** de la carga del día y de volúmenes clave antes de entrar al detalle en otras pantallas.

**Acciones**

- Son **solo lectura** en esta vista: sirven para orientación. Para profundizar (por ejemplo en citas o mensajes) se usarán las entradas del menú lateral (manual futuro).

---

### 2.3 Gráfico “Citas Semanales”

[imagen]

**Qué se ve**

- Gráfico de **barras** con los días de la semana en el eje horizontal.
- Dos series en la leyenda: **Semana actual** y **Semana anterior** (barras de colores distintos).

**Para qué sirve**

- **Comparar** cuántas citas tuvo cada día de la semana en curso frente a la semana previa, para detectar picos o bajas de demanda.

**Acciones**

| Acción | Resultado |
|--------|------------|
| Pasar el **cursor** por las barras | Suele mostrarse un **tooltip** con el valor numérico del día y la serie |
| Leer la **leyenda** | Identifica qué color corresponde a “semana actual” y cuál a “semana anterior” |

**Nota:** si aún no hay datos cargados, el gráfico puede mostrarse con valores en cero como plantilla visual.

---

### 2.4 Gráfico “Tendencia de Seguimientos”

[imagen]

**Qué se ve**

- Gráfico de **áreas apiladas** con meses en el eje horizontal y tres categorías en la leyenda: **Estables**, **En Observación** y **Críticos** (colores verde, amarillo y rojo respectivamente).
- Encima del gráfico, un **selector de modo** de análisis:
  - **Recientes**
  - **Cuatrimestre** (al elegirlo aparecen campo de **año** y selector del **bloque de meses** del cuatrimestre)
  - **Rango personalizado** (al elegirlo aparecen dos campos de **fecha inicio** y **fecha fin**)

**Para qué sirve**

- Visualizar la **evolución mensual** de seguimientos según estado, y **filtrar el periodo** que necesites revisar (últimos datos, un cuatrimestre académico o un intervalo de fechas acotado).

**Acciones**

| Elemento | Acción | Resultado |
|----------|--------|------------|
| Selector **Recientes / Cuatrimestre / Rango personalizado** | Elegir una opción | Cambia el criterio con el que se pide la información al servidor y se actualiza el gráfico |
| **Año** (modo cuatrimestre) | Escribir el año (rango numérico permitido por el campo) | Acota el cuatrimestre al año indicado |
| Selector de **meses del cuatrimestre** | Elegir uno de los tres bloques (ej. enero–abril, etc.) | Define qué cuatrimestre del año se consulta |
| **Fecha desde / hasta** (modo rango) | Elegir fechas en los selectores de calendario | Limita el periodo; el sistema valida que el rango **no supere cuatro meses** entre inicio y fin |
| Mensaje en **rojo** bajo los controles de rango | Aparece si el rango es inválido | Indica que el rango **no puede superar 4 meses**; hay que ajustar las fechas hasta que desaparezca el mensaje para que el gráfico cargue datos correctamente |

**Paso a paso — Ver tendencia por cuatrimestre**

1. En el selector superior del bloque, elige **Cuatrimestre**.
2. Escribe el **año** deseado.
3. Abre el segundo selector y elige el bloque de meses (primer, segundo o tercer cuatrimestre del año).
4. Observa cómo se actualiza el gráfico según los datos disponibles.

**Paso a paso — Ver tendencia por rango personalizado**

1. Elige **Rango personalizado**.
2. Pulsa el primer campo de fecha y selecciona la **fecha inicial**.
3. Pulsa el segundo campo y selecciona la **fecha final** (no puede ser anterior a la inicial ni dejar un intervalo mayor a cuatro meses).
4. Si aparece el aviso de error, acorta el intervalo o corrige las fechas.
5. Revisa el gráfico actualizado.

---

### 2.5 Gráfico “Actividad Mensual”

[imagen]

**Qué se ve**

- Gráfico de **líneas** con el eje horizontal en **meses** y tres líneas: **Citas**, **Seguimientos** y **Mensajes** (leyenda con colores distintos).
- Subtítulo que indica que es una **comparativa de los últimos 6 meses**.
- Mientras carga, puede mostrarse un **indicador de carga** centrado. Si no hay datos, un mensaje tipo **“No hay datos de actividad para mostrar.”**

**Para qué sirve**

- Relacionar en el tiempo tres frentes de trabajo (citas, seguimientos y mensajes) para ver **patrones** (por ejemplo meses con más mensajes o más citas).

**Acciones**

| Acción | Resultado |
|--------|------------|
| Pasar el **cursor** por los puntos o líneas | **Tooltip** con valores por mes y categoría |
| Leer la **leyenda** | Asocia cada color con Citas, Seguimientos o Mensajes |

---

### 2.6 Bloque “Citas de Hoy”

[imagen]

**Qué se ve**

- Lista de las **citas agendadas para el día actual**, cada fila con: **hora**, **nombre del aprendiz**, **número de ficha** y una **etiqueta de estado** (por ejemplo programada, realizada, cancelada, según cómo venga del sistema; los colores ayudan a distinguir estados completados o cancelados).
- Si no hay citas: mensaje **“No hay citas programadas para hoy.”**
- Durante la carga: indicador de espera.

**Para qué sirve**

- Planificar el día sin ir aún al módulo completo de **Citas**: ves **quién**, **a qué hora** y **en qué estado** está cada cita de hoy.

**Acciones**

- En esta pantalla las filas son **informativas** (no se documenta aquí un clic hacia detalle; si en una versión futura enlazan al detalle de cita, se actualizará el manual).

---

### 2.7 Bloque “Casos Prioritarios”

[imagen]

**Qué se ve**

- Lista de hasta varios **casos destacados** (prioritarios) provenientes del módulo de seguimientos, con **nombre del aprendiz**, **ficha**, **etiqueta de nivel** (por ejemplo crítico u observación) y un texto breve de **tiempo** o contexto (según datos que devuelva el sistema).
- Si no hay casos en esos niveles: **“No hay casos en estado crítico u observación.”**
- Icono de alerta en la cabecera del bloque.

**Para qué sirve**

- **Priorizar la atención** del psicólogo hacia aprendices que requieren seguimiento más urgente según el estado registrado en la plataforma.

**Acciones**

- Lectura y priorización; la gestión detallada de seguimientos corresponde a la sección **Seguimientos** del menú (se documentará más adelante).

---

## Próximos apartados (no incluidos en este archivo)

Cuando continúes el manual, puedes añadir capítulos como: **explicación ampliada de gráficos**, **Citas** (funciones de la vista, creación, solicitudes pendientes), etc., reutilizando el mismo esquema `[imagen]` → descripción → tabla de acciones → paso a paso si aplica.

---

*Documento generado para el proyecto **vista-psicologo** / HealthyMind. Sustituir los marcadores `[imagen]` por capturas reales y revisar textos legales o de contacto si la institución actualiza líneas o políticas.*
