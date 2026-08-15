/*
    Script 001 - Estructura inicial
    Motor: SQL Server

    Crea la base de datos solamente si todavía no existe. Luego crea las tablas
    Categorias, Cuentas y Movimientos con las reglas aprobadas para la versión 1.
*/

USE [master];
GO

IF DB_ID(N'FinanzasPersonales') IS NULL
BEGIN
    CREATE DATABASE [FinanzasPersonales];
END;
GO

USE [FinanzasPersonales];
GO

/*
    Categorias clasifica los movimientos como ingresos o gastos.
    Activa permite dejar de usar una categoría sin eliminar su historial.
*/
IF OBJECT_ID(N'dbo.Categorias', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categorias
    (
        ID_Categoria int IDENTITY(1,1) NOT NULL,
        Descripcion nvarchar(100) NOT NULL,
        TipoCategoria varchar(10) NOT NULL,
        Activa bit NOT NULL
            CONSTRAINT DF_Categorias_Activa DEFAULT (1),

        CONSTRAINT PK_Categorias
            PRIMARY KEY (ID_Categoria),

        CONSTRAINT UQ_Categorias_Descripcion_TipoCategoria
            UNIQUE (Descripcion, TipoCategoria),

        CONSTRAINT CK_Categorias_Descripcion
            CHECK (LEN(LTRIM(RTRIM(Descripcion))) > 0),

        CONSTRAINT CK_Categorias_TipoCategoria
            CHECK (TipoCategoria IN ('Ingreso', 'Gasto'))
    );
END;
GO

/*
    Cuentas representa dónde se encuentra el dinero. No contiene una columna de
    saldo porque ese valor siempre se calcula a partir de sus movimientos.
*/
IF OBJECT_ID(N'dbo.Cuentas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Cuentas
    (
        ID_Cuenta int IDENTITY(1,1) NOT NULL,
        Descripcion nvarchar(100) NOT NULL,
        TipoCuenta varchar(20) NOT NULL,
        Activa bit NOT NULL
            CONSTRAINT DF_Cuentas_Activa DEFAULT (1),

        CONSTRAINT PK_Cuentas
            PRIMARY KEY (ID_Cuenta),

        CONSTRAINT UQ_Cuentas_Descripcion
            UNIQUE (Descripcion),

        CONSTRAINT CK_Cuentas_Descripcion
            CHECK (LEN(LTRIM(RTRIM(Descripcion))) > 0),

        CONSTRAINT CK_Cuentas_TipoCuenta
            CHECK (TipoCuenta IN ('Efectivo', 'CuentaBancaria', 'BilleteraVirtual'))
    );
END;
GO

/*
    Movimientos es la fuente de verdad para ingresos y gastos. El importe siempre
    es positivo; TipoMovimiento determina cómo participa en los cálculos.
*/
IF OBJECT_ID(N'dbo.Movimientos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Movimientos
    (
        ID_Movimiento int IDENTITY(1,1) NOT NULL,
        Descripcion nvarchar(200) NOT NULL,
        Importe decimal(18,2) NOT NULL,
        Fecha date NOT NULL,
        TipoMovimiento varchar(10) NOT NULL,
        ID_Categoria int NOT NULL,
        ID_Cuenta int NOT NULL,
        Nota nvarchar(500) NULL,
        FechaCreacion datetime2(0) NOT NULL
            CONSTRAINT DF_Movimientos_FechaCreacion DEFAULT (SYSDATETIME()),

        CONSTRAINT PK_Movimientos
            PRIMARY KEY (ID_Movimiento),

        CONSTRAINT CK_Movimientos_Descripcion
            CHECK (LEN(LTRIM(RTRIM(Descripcion))) > 0),

        CONSTRAINT CK_Movimientos_Importe
            CHECK (Importe > 0),

        CONSTRAINT CK_Movimientos_TipoMovimiento
            CHECK (TipoMovimiento IN ('Ingreso', 'Gasto')),

        CONSTRAINT FK_Movimientos_Categorias
            FOREIGN KEY (ID_Categoria)
            REFERENCES dbo.Categorias (ID_Categoria),

        CONSTRAINT FK_Movimientos_Cuentas
            FOREIGN KEY (ID_Cuenta)
            REFERENCES dbo.Cuentas (ID_Cuenta)
    );
END;
GO

/* Los índices acompañan los filtros y cálculos que necesita el frontend. */
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Movimientos_Fecha'
      AND object_id = OBJECT_ID(N'dbo.Movimientos')
)
BEGIN
    CREATE INDEX IX_Movimientos_Fecha
        ON dbo.Movimientos (Fecha);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Movimientos_ID_Categoria'
      AND object_id = OBJECT_ID(N'dbo.Movimientos')
)
BEGIN
    CREATE INDEX IX_Movimientos_ID_Categoria
        ON dbo.Movimientos (ID_Categoria);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Movimientos_ID_Cuenta'
      AND object_id = OBJECT_ID(N'dbo.Movimientos')
)
BEGIN
    CREATE INDEX IX_Movimientos_ID_Cuenta
        ON dbo.Movimientos (ID_Cuenta);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Movimientos_TipoMovimiento_Fecha'
      AND object_id = OBJECT_ID(N'dbo.Movimientos')
)
BEGIN
    CREATE INDEX IX_Movimientos_TipoMovimiento_Fecha
        ON dbo.Movimientos (TipoMovimiento, Fecha);
END;
GO
