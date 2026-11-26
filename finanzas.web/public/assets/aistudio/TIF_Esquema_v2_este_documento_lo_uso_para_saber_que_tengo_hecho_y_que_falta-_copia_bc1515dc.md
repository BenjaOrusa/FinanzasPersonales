![][image1]

Trabajo Integrador Final

Tecnicatura  
Universitaria en Programación

Proyecto: Sistema de Finanzas Personales

Integrantes: Benjamín Orusa , Matías Soria

Tutor: Leonor González

Año: 2026

| Presentación Propuesta |  |
| :---- | :---: |
| Ajustes Propuesta |  |
| Análisis de Viabilidad 1 |  |
| Presentación Esquema |  |
| Ajustes Esquema |  |
| Análisis de Viabilidad 2 | X |
| Entrega Final |  |

*Etapa*

**✓  Esquema de la Base de Datos**

Presentación del modelo del diseño de la base de datos.

El modelo se compone de 7 tablas. Las relaciones de uno a muchos (Usuario–Cuenta, Usuario–Categoría, Usuario–Movimiento, Cuenta–Movimiento, Categoría–Movimiento, TipoUsuario–Usuario, Moneda–Cuenta, Moneda–Movimiento) se resuelven agregando la clave foránea correspondiente en la tabla del lado "muchos". La tabla Cotizacion resuelve el par de monedas (base y cotizada) mediante dos claves foráneas hacia Moneda, combinadas con la fecha en una clave primaria compuesta.

**Diccionario de datos**

***Tabla: TipoUsuario***

| Campo | Tipo de dato | Restricciones | Descripción |
| :---- | :---- | :---- | :---- |
| id\_tipo\_usuario | INT | PK | Identificador del tipo de usuario. |
| descripcion | VARCHAR(50) | NOT NULL | Nombre del tipo (ej.: Común, Administrador). |

***Tabla: Usuario***

| Campo | Tipo de dato | Restricciones | Descripción |
| :---- | :---- | :---- | :---- |
| id\_usuario | INT | PK | Identificador del usuario. |
| nombre | VARCHAR(100) | NOT NULL | Nombre del usuario. |
| apellido | VARCHAR(100) | NOT NULL | Apellido del usuario. |
| correo\_electronico | VARCHAR(150) | NOT NULL, UNIQUE | Correo utilizado para iniciar sesión. |
| contrasenia | VARCHAR(255) | NOT NULL | Contraseña almacenada de forma segura (hash). |
| estado | VARCHAR(20) | NOT NULL | Activo, inactivo o bloqueado. |
| id\_tipo\_usuario | INT | FK → TipoUsuario | Tipo de usuario que determina sus permisos. |

***Tabla: Moneda***

| Campo | Tipo de dato | Restricciones | Descripción |
| :---- | :---- | :---- | :---- |
| id\_moneda | INT | PK | Identificador de la moneda. |
| descripcion | VARCHAR(50) | NOT NULL | Nombre de la moneda (ej.: Peso Argentino, Dólar Blue). |

***Tabla: Cuenta***

| Campo | Tipo de dato | Restricciones | Descripción |
| :---- | :---- | :---- | :---- |
| id\_cuenta | INT | PK | Identificador de la cuenta. |
| nombre | VARCHAR(100) | NOT NULL | Nombre descriptivo de la cuenta. |
| tipo | VARCHAR(30) | NOT NULL | Efectivo, cuenta bancaria o billetera virtual. |
| saldo | DECIMAL(12,2) | NOT NULL | Saldo actual calculado de la cuenta. |
| activa | BOOLEAN | NOT NULL | Indica si la cuenta está habilitada. |
| id\_usuario | INT | FK → Usuario | Usuario propietario de la cuenta. |
| id\_moneda | INT | FK → Moneda | Moneda en la que opera la cuenta. |

***Tabla: Categoria***

| Campo | Tipo de dato | Restricciones | Descripción |
| :---- | :---- | :---- | :---- |
| id\_categoria | INT | PK | Identificador de la categoría. |
| nombre | VARCHAR(100) | NOT NULL | Nombre de la categoría. |
| tipo | VARCHAR(20) | NOT NULL | Ingreso o gasto. |
| activa | BOOLEAN | NOT NULL | Indica si la categoría está habilitada. |
| id\_usuario | INT | FK → Usuario | Usuario que definió la categoría. |

***Tabla: Movimiento***

| Campo | Tipo de dato | Restricciones | Descripción |
| :---- | :---- | :---- | :---- |
| id\_movimiento | INT | PK | Identificador del movimiento. |
| descripcion | VARCHAR(255) | NOT NULL | Descripción del movimiento. |
| importe\_original | DECIMAL(12,2) | NOT NULL | Importe en la moneda original del movimiento. |
| fecha | DATE | NOT NULL | Fecha en que se realizó el movimiento. |
| tipo | VARCHAR(20) | NOT NULL | Ingreso o gasto. |
| nota | VARCHAR(255) | NULL | Nota opcional del usuario. |
| id\_usuario | INT | FK → Usuario | Usuario que realizó el movimiento. |
| id\_cuenta | INT | FK → Cuenta | Cuenta en la que se registra el movimiento. |
| id\_categoria | INT | FK → Categoria | Categoría que clasifica el movimiento. |
| id\_moneda | INT | FK → Moneda | Moneda en la que está expresado el importe original. |

***Tabla: Cotizacion***

| Campo | Tipo de dato | Restricciones | Descripción |
| :---- | :---- | :---- | :---- |
| id\_moneda\_base | INT | PK compuesta, FK → Moneda | Moneda tomada como base de la cotización. |
| id\_moneda\_cotizada | INT | PK compuesta, FK → Moneda | Moneda cuyo valor se cotiza. |
| fecha | DATE | PK compuesta | Fecha a la que corresponde la cotización. |
| valor | DECIMAL(12,6) | NOT NULL | Valor de la cotización para ese par de monedas y fecha. |

**✓  Diagrama de clases**

Presentación del diagrama de clases.

![][image2]

**✓  Casos de uso**

Los siguientes casos describen las interacciones de los actores con el sistema. Cada caso se identifica mediante un código; las alternativas se vinculan al paso del camino básico en el que se originan. Alcance: sistema. Interacción: semántica. Visión: caja negra.

Los movimientos se registran en la moneda de su cuenta. La conversión a dólares se utiliza para consultar equivalencias y no modifica los importes originales ni los saldos.

**CU01  Registrarse en el sistema**

Actor: Visitante

Meta: Obtener una cuenta de usuario para utilizar el sistema.

Precondiciones: El visitante no tiene una sesión iniciada.

Disparador: El visitante solicita registrarse en el sistema.

**Camino básico**

1\. El visitante solicita registrarse en el sistema.

2\. El sistema solicita nombre, apellido, correo electrónico y contraseña.

3\. El visitante proporciona los datos solicitados.

4\. El sistema valida los datos y verifica que el correo electrónico no esté registrado.

5\. El sistema registra al usuario con estado activo y tipo común, conserva la contraseña de forma segura e informa que el registro se completó.

**Caminos alternativos**

**4.a  Datos incompletos o inválidos**

4.a.1. El sistema identifica los datos que deben corregirse.

4.a.2. El visitante corrige los datos. Continúa en el paso 4\.

**4.b  Correo electrónico ya registrado**

4.b.1. El sistema informa que el correo ya está registrado.

4.b.2. El visitante proporciona otro correo y continúa en el paso 4, o abandona el registro y finaliza sin crear un usuario.

**3.a  El visitante cancela el registro**

3.a.1. El sistema finaliza la operación sin crear un usuario.

**Poscondiciones**

Éxito: Usuario común registrado con correo único y contraseña protegida.

Sin éxito: No se crea un nuevo usuario.

**CU02  Iniciar sesión**

Actor: Usuario registrado

Meta: Acceder al sistema con los permisos correspondientes.

Precondiciones: El usuario no tiene una sesión iniciada.

Disparador: El usuario solicita iniciar sesión.

**Camino básico**

1\. El usuario solicita iniciar sesión.

2\. El sistema solicita correo electrónico y contraseña.

3\. El usuario proporciona sus credenciales.

4\. El sistema verifica las credenciales y comprueba que el usuario esté activo.

5\. El sistema inicia la sesión y habilita las funciones correspondientes al tipo de usuario.

**Caminos alternativos**

**4.a  Credenciales inválidas**

4.a.1. El sistema informa que no se pudo iniciar sesión.

4.a.2. El usuario ingresa nuevamente las credenciales. Continúa en el paso 4\.

**4.b  Usuario inactivo o bloqueado**

4.b.1. El sistema informa que el acceso no está habilitado.

4.b.2. Finaliza el caso de uso sin iniciar sesión.

**3.a  El usuario cancela**

3.a.1. Finaliza el caso de uso sin iniciar sesión.

**Poscondiciones**

Éxito: Sesión iniciada con los permisos del usuario.

Sin éxito: No se inicia una sesión.

**CU03  Cerrar sesión**

Actor: Usuario autenticado

Meta: Finalizar el acceso autenticado al sistema.

Precondiciones: El usuario tiene una sesión iniciada.

Disparador: El usuario solicita cerrar sesión.

**Camino básico**

1\. El usuario solicita cerrar sesión.

2\. El sistema invalida la sesión actual.

3\. El sistema informa que la sesión finalizó y deja de habilitar las funciones que requieren autenticación.

**Caminos alternativos**

**2.a  La sesión expiró después de iniciar el caso**

2.a.1. El sistema informa que la sesión ya no está vigente.

2.a.2. Continúa en el paso 3\.

**Poscondiciones**

Éxito: Sesión finalizada; el acceso posterior a funciones protegidas requiere autenticación.

Sin éxito: No se alteran los datos financieros del usuario.

**CU04  Crear una cuenta financiera**

Actor: Usuario común

Meta: Disponer de una cuenta para registrar ingresos y gastos.

Precondiciones: El usuario tiene una sesión iniciada y permisos de usuario común. Existen monedas configuradas.

Disparador: El usuario solicita crear una cuenta financiera.

**Camino básico**

1\. El usuario solicita crear una cuenta financiera.

2\. El sistema solicita nombre, tipo de cuenta y moneda.

3\. El usuario proporciona los datos.

4\. El sistema verifica que los datos estén completos y que el tipo y la moneda sean válidos.

5\. El sistema registra la cuenta activa a nombre del usuario, sin movimientos, e informa el resultado.

**Caminos alternativos**

**4.a  Datos incompletos o inválidos**

4.a.1. El sistema informa qué datos deben corregirse.

4.a.2. El usuario corrige los datos. Continúa en el paso 4\.

**3.a  El usuario cancela**

3.a.1. Finaliza el caso de uso sin crear una cuenta.

**Poscondiciones**

Éxito: Cuenta activa registrada y asociada al usuario.

Sin éxito: No se crea una cuenta financiera.

**CU05  Editar una cuenta financiera**

Actor: Usuario común

Meta: Actualizar los datos de una cuenta propia.

Precondiciones: El usuario tiene una sesión iniciada y permisos de usuario común.

Disparador: El usuario solicita editar una cuenta financiera.

**Camino básico**

1\. El usuario solicita editar una cuenta financiera.

2\. El sistema presenta las cuentas del usuario.

3\. El usuario selecciona una cuenta e informa los cambios solicitados.

4\. El sistema valida los cambios y su coherencia con los movimientos asociados.

5\. El sistema guarda los cambios e informa que la cuenta fue actualizada.

**Caminos alternativos**

**2.a  El usuario no tiene cuentas**

2.a.1. El sistema informa que no existen cuentas para editar.

2.a.2. Finaliza sin modificaciones.

**4.a  Datos inválidos o cambios incompatibles con los movimientos existentes**

4.a.1. El sistema informa el motivo y conserva los datos anteriores.

4.a.2. El usuario corrige la propuesta. Continúa en el paso 4\.

**3.a  El usuario cancela**

3.a.1. Finaliza sin modificar la cuenta.

**Poscondiciones**

Éxito: Datos de la cuenta actualizados sin alterar la consistencia de su historial.

Sin éxito: No se modifican los datos del sistema.

**CU06  Desactivar una cuenta financiera**

Actor: Usuario común

Meta: Dejar de utilizar una cuenta sin perder su historial.

Precondiciones: El usuario tiene una sesión iniciada y permisos de usuario común.

Disparador: El usuario solicita desactivar una cuenta financiera.

**Camino básico**

1\. El usuario solicita desactivar una cuenta financiera.

2\. El sistema presenta las cuentas activas del usuario.

3\. El usuario selecciona una cuenta.

4\. El sistema informa que se conservará el historial y solicita confirmación.

5\. El usuario confirma la desactivación.

6\. El sistema marca la cuenta como inactiva e informa el resultado.

**Caminos alternativos**

**2.a  No existen cuentas activas**

2.a.1. El sistema informa la situación.

2.a.2. Finaliza sin modificaciones.

**5.a  El usuario no confirma**

5.a.1. El sistema cancela la operación.

5.a.2. Finaliza y conserva el estado de la cuenta.

**Poscondiciones**

Éxito: Cuenta inactiva; sus movimientos históricos se conservan.

Sin éxito: No se modifican los datos del sistema.

**CU07  Consultar el saldo de una cuenta**

Actor: Usuario común

Meta: Conocer el saldo de una cuenta financiera propia.

Precondiciones: El usuario tiene una sesión iniciada y permisos de usuario común.

Disparador: El usuario solicita consultar el saldo de una cuenta.

**Camino básico**

1\. El usuario solicita consultar el saldo de una cuenta.

2\. El sistema presenta las cuentas del usuario.

3\. El usuario selecciona una cuenta.

4\. El sistema obtiene el saldo y lo presenta identificado con la moneda de la cuenta.

**Caminos alternativos**

**2.a  El usuario no tiene cuentas**

2.a.1. El sistema informa que no existen cuentas para consultar.

2.a.2. Finaliza sin presentar un saldo.

**4.a  La cuenta está inactiva**

4.a.1. El sistema presenta el saldo e indica que la cuenta está inactiva.

4.a.2. Finaliza con la consulta realizada.

**Poscondiciones**

Éxito: Saldo de la cuenta consultado, con su moneda identificada.

Sin éxito: No se modifican los datos del sistema.

**CU08  Crear una categoría**

Actor: Usuario común

Meta: Disponer de una categoría para clasificar ingresos o gastos.

Precondiciones: El usuario tiene una sesión iniciada y permisos de usuario común.

Disparador: El usuario solicita crear una categoría.

**Camino básico**

1\. El usuario solicita crear una categoría.

2\. El sistema solicita el nombre y el tipo de categoría, ingreso o gasto.

3\. El usuario proporciona los datos.

4\. El sistema verifica que el nombre esté completo y que el tipo sea válido.

5\. El sistema registra la categoría activa a nombre del usuario e informa el resultado.

**Caminos alternativos**

**4.a  Datos incompletos o tipo inválido**

4.a.1. El sistema informa los datos que deben corregirse.

4.a.2. El usuario corrige los datos. Continúa en el paso 4\.

**3.a  El usuario cancela**

3.a.1. Finaliza sin registrar una categoría.

**Poscondiciones**

Éxito: Categoría activa registrada y asociada al usuario.

Sin éxito: No se registra una categoría.

**CU09  Editar una categoría**

Actor: Usuario común

Meta: Actualizar una categoría propia.

Precondiciones: El usuario tiene una sesión iniciada y permisos de usuario común.

Disparador: El usuario solicita editar una categoría.

**Camino básico**

1\. El usuario solicita editar una categoría.

2\. El sistema presenta las categorías del usuario.

3\. El usuario selecciona una categoría e informa los cambios.

4\. El sistema valida los datos y verifica la compatibilidad del tipo con los movimientos asociados.

5\. El sistema guarda los cambios e informa el resultado.

**Caminos alternativos**

**2.a  No existen categorías**

2.a.1. El sistema informa que no existen categorías para editar.

2.a.2. Finaliza sin modificaciones.

**4.a  Datos incompletos o inválidos**

4.a.1. El sistema informa los datos que deben corregirse.

4.a.2. El usuario corrige los datos. Continúa en el paso 4\.

**4.b  El nuevo tipo es incompatible con movimientos existentes**

4.b.1. El sistema informa que el cambio dejaría movimientos con una categoría incompatible.

4.b.2. El usuario conserva el tipo anterior y continúa en el paso 4, o cancela y finaliza sin modificaciones.

**3.a  El usuario cancela**

3.a.1. Finaliza sin modificar la categoría.

**Poscondiciones**

Éxito: Categoría actualizada y compatible con sus movimientos.

Sin éxito: No se modifican los datos del sistema.

**CU10  Desactivar una categoría**

Actor: Usuario común

Meta: Dejar de utilizar una categoría sin eliminar su historial.

Precondiciones: El usuario tiene una sesión iniciada y permisos de usuario común.

Disparador: El usuario solicita desactivar una categoría.

**Camino básico**

1\. El usuario solicita desactivar una categoría.

2\. El sistema presenta las categorías activas del usuario.

3\. El usuario selecciona una categoría.

4\. El sistema informa que se conservarán sus movimientos históricos y solicita confirmación.

5\. El usuario confirma la desactivación.

6\. El sistema marca la categoría como inactiva e informa el resultado.

**Caminos alternativos**

**2.a  No existen categorías activas**

2.a.1. El sistema informa la situación.

2.a.2. Finaliza sin modificaciones.

**5.a  El usuario no confirma**

5.a.1. El sistema cancela la operación.

5.a.2. Finaliza y conserva el estado anterior de la categoría.

**Poscondiciones**

Éxito: Categoría inactiva; los movimientos históricos conservan su clasificación.

Sin éxito: No se modifican los datos del sistema.

**CU11  Registrar un movimiento**

Actor: Usuario común

Meta: Registrar un ingreso o gasto y reflejarlo en el saldo de una cuenta.

Precondiciones: El usuario tiene una sesión iniciada y permisos de usuario común.

Disparador: El usuario solicita registrar un ingreso o gasto.

**Camino básico**

1\. El usuario solicita registrar un ingreso o gasto.

2\. El sistema solicita los datos y presenta las cuentas y categorías activas del usuario.

3\. El usuario informa descripción, importe, fecha, tipo, cuenta y categoría, y opcionalmente una nota. El sistema toma la moneda de la cuenta seleccionada.

4\. El sistema verifica los datos obligatorios, el importe positivo, la pertenencia de cuenta y categoría al usuario y la compatibilidad entre el tipo del movimiento y la categoría.

5\. El sistema registra el movimiento, actualiza el saldo de la cuenta e informa el resultado.

**Caminos alternativos**

**2.a  Falta una cuenta o categoría activa para la operación**

2.a.1. El sistema informa qué dato previo falta.

2.a.2. Finaliza sin registrar el movimiento. El usuario podrá crear la cuenta o categoría mediante el caso correspondiente y luego iniciar nuevamente este caso.

**4.a  Datos incompletos, importe inválido o categoría incompatible**

4.a.1. El sistema identifica los datos que deben corregirse.

4.a.2. El usuario corrige los datos. Continúa en el paso 4\.

**4.b  Cuenta o categoría ajena al usuario**

4.b.1. El sistema rechaza la operación.

4.b.2. Finaliza sin registrar el movimiento ni modificar saldos.

**3.a  El usuario cancela**

3.a.1. Finaliza sin registrar el movimiento ni modificar saldos.

**Poscondiciones**

Éxito: Movimiento registrado en la moneda de la cuenta; saldo actualizado.

Sin éxito: No se registra el movimiento ni se modifican saldos.

**CU12  Editar un movimiento**

Actor: Usuario común

Meta: Corregir un ingreso o gasto previamente registrado.

Precondiciones: El usuario tiene una sesión iniciada y permisos de usuario común.

Disparador: El usuario solicita editar un movimiento.

**Camino básico**

1\. El usuario solicita editar un movimiento.

2\. El sistema presenta los movimientos del usuario.

3\. El usuario selecciona un movimiento. El sistema presenta sus datos.

4\. El usuario informa los cambios y mantiene el importe expresado en la moneda de la cuenta seleccionada.

5\. El sistema valida los datos, la pertenencia de cuenta y categoría al usuario y la compatibilidad del tipo de categoría.

6\. El sistema actualiza el movimiento, ajusta los saldos de las cuentas afectadas e informa el resultado.

**Caminos alternativos**

**2.a  No existen movimientos**

2.a.1. El sistema informa que no existen movimientos para editar.

2.a.2. Finaliza sin modificaciones.

**5.a  Datos inválidos o categoría incompatible**

5.a.1. El sistema informa los datos que deben corregirse.

5.a.2. El usuario corrige los cambios. Continúa en el paso 5\.

**5.b  Cuenta o categoría ajena al usuario**

5.b.1. El sistema rechaza los cambios.

5.b.2. Finaliza y conserva el movimiento y los saldos anteriores.

**4.a  El usuario cancela**

4.a.1. Finaliza y conserva el movimiento y los saldos anteriores.

**Poscondiciones**

Éxito: Movimiento actualizado; saldos coherentes con los nuevos datos.

Sin éxito: Se conservan el movimiento y los saldos anteriores.

**CU13  Eliminar un movimiento**

Actor: Usuario común

Meta: Eliminar un ingreso o gasto registrado por error.

Precondiciones: El usuario tiene una sesión iniciada y permisos de usuario común.

Disparador: El usuario solicita eliminar un movimiento.

**Camino básico**

1\. El usuario solicita eliminar un movimiento.

2\. El sistema presenta los movimientos del usuario.

3\. El usuario selecciona un movimiento.

4\. El sistema presenta sus datos y solicita confirmar la eliminación.

5\. El usuario confirma la eliminación.

6\. El sistema elimina el movimiento, revierte su efecto en el saldo de la cuenta e informa el resultado.

**Caminos alternativos**

**2.a  No existen movimientos**

2.a.1. El sistema informa que no existen movimientos para eliminar.

2.a.2. Finaliza sin modificaciones.

**5.a  El usuario no confirma**

5.a.1. El sistema cancela la eliminación.

5.a.2. Finaliza y conserva el movimiento y el saldo.

**Poscondiciones**

Éxito: Movimiento eliminado; saldo de la cuenta ajustado.

Sin éxito: Se conservan el movimiento y el saldo anteriores.

**CU14  Consultar movimientos con filtros**

Actor: Usuario común

Meta: Encontrar movimientos propios según criterios de búsqueda.

Precondiciones: El usuario tiene una sesión iniciada y permisos de usuario común.

Disparador: El usuario solicita consultar sus movimientos.

**Camino básico**

1\. El usuario solicita consultar sus movimientos.

2\. El sistema permite indicar filtros por tipo, fecha, cuenta o categoría.

3\. El usuario informa los criterios de consulta.

4\. El sistema valida los criterios y obtiene los movimientos propios que los cumplen.

5\. El sistema presenta los movimientos encontrados, con sus importes y monedas.

**Caminos alternativos**

**3.a  El usuario no indica filtros**

3.a.1. El sistema toma la consulta sin restricciones adicionales sobre los movimientos propios.

3.a.2. Continúa en el paso 4\.

**4.a  Criterios inválidos**

4.a.1. El sistema informa el criterio que debe corregirse.

4.a.2. El usuario corrige los filtros. Continúa en el paso 4\.

**5.a  No existen movimientos coincidentes**

5.a.1. El sistema informa que la consulta no tiene resultados.

5.a.2. Finaliza con la consulta realizada, sin modificar datos.

**Poscondiciones**

Éxito: Resultado de la consulta presentado, incluso si no hay coincidencias.

Sin éxito: No se modifican los datos del sistema.

**CU15  Consultar el resumen financiero**

Actor: Usuario común

Meta: Conocer los totales de ingresos y gastos y el balance.

Precondiciones: El usuario tiene una sesión iniciada y permisos de usuario común.

Disparador: El usuario solicita consultar el resumen financiero.

**Camino básico**

1\. El usuario solicita consultar el resumen financiero.

2\. El sistema obtiene los movimientos del usuario.

3\. El sistema calcula los totales de ingresos y gastos y obtiene el balance restando gastos a ingresos, separando los importes por moneda.

4\. El sistema presenta los totales y el balance con la moneda de cada resultado.

**Caminos alternativos**

**2.a  El usuario no tiene movimientos**

2.a.1. El sistema informa que todavía no hay movimientos registrados.

2.a.2. Finaliza con la consulta realizada, sin modificar datos.

**3.a  Solo existen ingresos o solo existen gastos en una moneda**

3.a.1. El sistema toma como cero el total del tipo de movimiento ausente y calcula el balance.

3.a.2. Continúa en el paso 4\.

**Poscondiciones**

Éxito: Resumen presentado sin sumar directamente importes de monedas diferentes.

Sin éxito: No se modifican los datos del sistema.

**CU16  Consultar la equivalencia de movimientos en dólares**

Actor: Usuario común

Meta: Conocer el equivalente en dólares de los movimientos propios.

Precondiciones: El usuario tiene una sesión iniciada y permisos de usuario común. Las monedas se encuentran configuradas.

Disparador: El usuario solicita consultar la equivalencia en dólares de sus movimientos.

**Camino básico**

1\. El usuario solicita consultar la equivalencia en dólares de sus movimientos.

2\. El sistema obtiene los movimientos del usuario y sus importes, monedas y fechas.

3\. Para cada movimiento que requiere conversión, el sistema obtiene la cotización del par de monedas correspondiente a la fecha del movimiento.

4\. El sistema calcula la equivalencia y presenta el importe original, el equivalente en dólares y la fecha de la cotización utilizada.

**Caminos alternativos**

**2.a  No existen movimientos**

2.a.1. El sistema informa que no hay movimientos para convertir.

2.a.2. Finaliza sin modificar datos.

**3.a  El movimiento ya está expresado en la moneda dólar de destino**

3.a.1. El sistema toma el importe original como equivalente.

3.a.2. Continúa en el paso 4 para ese movimiento.

**3.b  No existe cotización para la fecha del movimiento**

3.b.1. El sistema busca la última cotización anterior disponible del mismo par de monedas.

3.b.2. Si la encuentra, continúa en el paso 4 con esa cotización. Si tampoco existe una anterior, aplica la alternativa 3.c.

**3.c  No existe cotización aplicable**

3.c.1. El sistema informa que no puede calcular la equivalencia de ese movimiento y conserva visible su importe original.

3.c.2. Continúa en el paso 3 para los restantes movimientos; al terminar, presenta los resultados disponibles en el paso 4\.

**Poscondiciones**

Éxito: Equivalencias disponibles presentadas con la fecha de cotización; importes originales y saldos sin cambios.

Sin éxito: Los movimientos sin cotización quedan identificados sin equivalencia; no se modifican importes ni saldos.

**CU17  Consultar el listado de usuarios del sistema**

Actor: Administrador

Meta: Conocer los usuarios registrados y su estado.

Precondiciones: El administrador tiene una sesión iniciada y permisos de administración.

Disparador: El administrador solicita consultar los usuarios del sistema.

**Camino básico**

1\. El administrador solicita consultar los usuarios del sistema.

2\. El sistema obtiene el listado de usuarios registrados.

3\. El sistema presenta la identificación, el tipo y el estado de cada usuario, sin exponer contraseñas.

**Caminos alternativos**

**2.a  No hay usuarios para mostrar**

2.a.1. El sistema informa que la consulta no tiene resultados.

2.a.2. Finaliza sin modificar usuarios.

**Poscondiciones**

Éxito: Listado de usuarios presentado sin exponer contraseñas.

Sin éxito: No se modifican los datos del sistema.

**CU18  Activar desactivar o bloquear un usuario**

Actor: Administrador

Meta: Cambiar el estado de acceso de un usuario.

Precondiciones: El administrador tiene una sesión iniciada y permisos de administración.

Disparador: El administrador solicita cambiar el estado de un usuario.

**Camino básico**

1\. El administrador solicita cambiar el estado de un usuario.

2\. El sistema presenta el listado de usuarios con sus estados.

3\. El administrador selecciona un usuario e indica la activación.

4\. El sistema verifica que el cambio sea válido y solicita confirmación.

5\. El administrador confirma la operación.

6\. El sistema cambia el estado del usuario a activo e informa el resultado.

**Caminos alternativos**

**3.a  El administrador solicita desactivar al usuario**

3.a.1. El administrador indica la desactivación.

3.a.2. Continúa en el paso 4\. En el paso 6 el sistema establece el estado inactivo, que impide posteriores inicios de sesión.

**3.b  El administrador solicita bloquear al usuario**

3.b.1. El administrador indica el bloqueo.

3.b.2. Continúa en el paso 4\. En el paso 6 el sistema establece el estado bloqueado, que impide posteriores inicios de sesión.

**4.a  El usuario ya tiene el estado solicitado**

4.a.1. El sistema informa que no es necesario realizar el cambio.

4.a.2. Finaliza conservando el estado actual.

**5.a  El administrador no confirma**

5.a.1. El sistema cancela la operación.

5.a.2. Finaliza conservando el estado anterior.

**Poscondiciones**

Éxito: Estado del usuario actualizado según la operación confirmada; sus datos financieros se conservan.

Sin éxito: Se conserva el estado anterior del usuario.

**CU19  Supervisar la disponibilidad de las cotizaciones**

Actor: Administrador

Meta: Comprobar qué cotizaciones están disponibles para las consultas de equivalencia.

Precondiciones: El administrador tiene una sesión iniciada y permisos de administración. Existen monedas configuradas.

Disparador: El administrador solicita consultar la disponibilidad de cotizaciones.

**Camino básico**

1\. El administrador solicita consultar la disponibilidad de cotizaciones.

2\. El sistema solicita el par de monedas y la fecha de referencia.

3\. El administrador proporciona los criterios.

4\. El sistema valida los criterios y busca la cotización correspondiente.

5\. El sistema presenta el valor y la fecha de la cotización disponible.

**Caminos alternativos**

**4.a  Criterios inválidos**

4.a.1. El sistema informa los datos que deben corregirse.

4.a.2. El administrador corrige los criterios. Continúa en el paso 4\.

**4.b  No existe cotización en la fecha indicada**

4.b.1. El sistema busca la última cotización anterior del mismo par.

4.b.2. Si existe, continúa en el paso 5 indicando que corresponde a una fecha anterior. Si no existe, aplica la alternativa 4.c.

**4.c  No existe cotización aplicable**

4.c.1. El sistema informa la falta de cotización para los criterios solicitados.

4.c.2. Finaliza con la consulta realizada, sin crear ni modificar cotizaciones.

**Poscondiciones**

Éxito: Disponibilidad o ausencia de cotizaciones informada. Esta consulta no modifica cotizaciones.

Sin éxito: No se modifican los datos del sistema.

**✓  Reglas de negocio**

Enumerar las reglas de negocio alcanzadas en el proyecto.

* El correo electrónico de cada usuario debe ser único.

* La contraseña nunca debe almacenarse como texto legible; se conservará mediante una representación segura.

* Un usuario no puede consultar ni modificar información perteneciente a otro usuario.

* La cuenta y la categoría de un movimiento deben pertenecer al mismo usuario que realiza el movimiento.

* Todo movimiento debe tener una descripción, un importe positivo, una fecha y un tipo.

* Todo movimiento debe estar relacionado con una cuenta y una categoría.

* La moneda de cada movimiento coincide con la moneda de su cuenta. La conversión a dólares se utiliza únicamente para consultar equivalencias.

* El tipo de la categoría debe ser compatible con el tipo del movimiento.

* Una cuenta o categoría puede desactivarse sin eliminar los movimientos históricos.

* El balance se calcula restando el total de gastos al total de ingresos.

* Si no existe una cotización para la fecha del movimiento, se utilizará la última cotización disponible anterior para el mismo par de monedas.

* Los permisos del usuario se determinan mediante el tipo de usuario asociado.

**✓  Módulos a desarrollar**

Enunciar los diferentes módulos que formarán parte del sistema.

* **Módulo de Autenticación y Usuarios**

  Registro, inicio y cierre de sesión, y administración de tipos de usuario.

* **Módulo de Cuentas Financieras**

  Alta, edición, baja lógica y consulta de saldo de cuentas.

* **Módulo de Categorías**

  Alta, edición y baja lógica de categorías de ingreso y gasto.

* **Módulo de Movimientos**

  Registro, edición, eliminación y filtrado de ingresos y gastos.

* **Módulo de Monedas y Cotizaciones**

  Gestión de monedas y de las cotizaciones históricas utilizadas para la conversión.

* **Módulo de Resumen Financiero**

  Cálculo de totales, balance y equivalencias en dólares.

* **Módulo de Administración**

  Gestión de usuarios y supervisión general del sistema, exclusivo del administrador.

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>