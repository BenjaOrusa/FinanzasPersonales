/*
    Script 002 - Datos iniciales
    Motor: SQL Server

    Codificación del archivo: UTF-8. Con sqlcmd debe utilizarse la opción -f 65001.

    Incorpora los datos demostrativos utilizados por el frontend. El script puede
    ejecutarse nuevamente: cada INSERT comprueba primero que el registro no exista.
*/

USE [FinanzasPersonales];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    /* Categorías necesarias para clasificar los tres movimientos iniciales. */
    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.Categorias
        WHERE Descripcion = N'Alimentación' AND TipoCategoria = 'Gasto'
    )
    BEGIN
        INSERT INTO dbo.Categorias (Descripcion, TipoCategoria)
        VALUES (N'Alimentación', 'Gasto');
    END;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.Categorias
        WHERE Descripcion = N'Transporte' AND TipoCategoria = 'Gasto'
    )
    BEGIN
        INSERT INTO dbo.Categorias (Descripcion, TipoCategoria)
        VALUES (N'Transporte', 'Gasto');
    END;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.Categorias
        WHERE Descripcion = N'Sueldo' AND TipoCategoria = 'Ingreso'
    )
    BEGIN
        INSERT INTO dbo.Categorias (Descripcion, TipoCategoria)
        VALUES (N'Sueldo', 'Ingreso');
    END;

    /* Las cuentas no almacenan saldo; solo identifican dónde ocurrió el movimiento. */
    IF NOT EXISTS (SELECT 1 FROM dbo.Cuentas WHERE Descripcion = N'Efectivo')
    BEGIN
        INSERT INTO dbo.Cuentas (Descripcion, TipoCuenta)
        VALUES (N'Efectivo', 'Efectivo');
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Cuentas WHERE Descripcion = N'Cuenta bancaria')
    BEGIN
        INSERT INTO dbo.Cuentas (Descripcion, TipoCuenta)
        VALUES (N'Cuenta bancaria', 'CuentaBancaria');
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Cuentas WHERE Descripcion = N'Billetera virtual')
    BEGIN
        INSERT INTO dbo.Cuentas (Descripcion, TipoCuenta)
        VALUES (N'Billetera virtual', 'BilleteraVirtual');
    END;

    /* Se obtienen los identificadores generados en vez de suponer valores fijos. */
    DECLARE @ID_CategoriaAlimentacion int =
    (
        SELECT ID_Categoria FROM dbo.Categorias
        WHERE Descripcion = N'Alimentación' AND TipoCategoria = 'Gasto'
    );
    DECLARE @ID_CategoriaTransporte int =
    (
        SELECT ID_Categoria FROM dbo.Categorias
        WHERE Descripcion = N'Transporte' AND TipoCategoria = 'Gasto'
    );
    DECLARE @ID_CategoriaSueldo int =
    (
        SELECT ID_Categoria FROM dbo.Categorias
        WHERE Descripcion = N'Sueldo' AND TipoCategoria = 'Ingreso'
    );
    DECLARE @ID_CuentaEfectivo int =
        (SELECT ID_Cuenta FROM dbo.Cuentas WHERE Descripcion = N'Efectivo');
    DECLARE @ID_CuentaBancaria int =
        (SELECT ID_Cuenta FROM dbo.Cuentas WHERE Descripcion = N'Cuenta bancaria');
    DECLARE @ID_CuentaBilletera int =
        (SELECT ID_Cuenta FROM dbo.Cuentas WHERE Descripcion = N'Billetera virtual');

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.Movimientos
        WHERE Descripcion = N'Supermercado'
          AND Fecha = '2026-08-15'
          AND TipoMovimiento = 'Gasto'
          AND ID_Categoria = @ID_CategoriaAlimentacion
          AND ID_Cuenta = @ID_CuentaEfectivo
    )
    BEGIN
        INSERT INTO dbo.Movimientos
            (Descripcion, Importe, Fecha, TipoMovimiento, ID_Categoria, ID_Cuenta)
        VALUES
            (N'Supermercado', 25000.00, '2026-08-15', 'Gasto',
             @ID_CategoriaAlimentacion, @ID_CuentaEfectivo);
    END;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.Movimientos
        WHERE Descripcion = N'Sueldo'
          AND Fecha = '2026-08-10'
          AND TipoMovimiento = 'Ingreso'
          AND ID_Categoria = @ID_CategoriaSueldo
          AND ID_Cuenta = @ID_CuentaBancaria
    )
    BEGIN
        INSERT INTO dbo.Movimientos
            (Descripcion, Importe, Fecha, TipoMovimiento, ID_Categoria, ID_Cuenta)
        VALUES
            (N'Sueldo', 400000.00, '2026-08-10', 'Ingreso',
             @ID_CategoriaSueldo, @ID_CuentaBancaria);
    END;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.Movimientos
        WHERE Descripcion = N'Transporte'
          AND Fecha = '2026-08-08'
          AND TipoMovimiento = 'Gasto'
          AND ID_Categoria = @ID_CategoriaTransporte
          AND ID_Cuenta = @ID_CuentaBilletera
    )
    BEGIN
        INSERT INTO dbo.Movimientos
            (Descripcion, Importe, Fecha, TipoMovimiento, ID_Categoria, ID_Cuenta)
        VALUES
            (N'Transporte', 5000.00, '2026-08-08', 'Gasto',
             @ID_CategoriaTransporte, @ID_CuentaBilletera);
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO

/* Resultado visible para comprobar qué datos quedaron almacenados. */
SELECT ID_Categoria, Descripcion, TipoCategoria, Activa
FROM dbo.Categorias
ORDER BY ID_Categoria;

SELECT ID_Cuenta, Descripcion, TipoCuenta, Activa
FROM dbo.Cuentas
ORDER BY ID_Cuenta;

SELECT
    m.ID_Movimiento,
    m.Descripcion,
    m.Importe,
    m.Fecha,
    m.TipoMovimiento,
    c.Descripcion AS Categoria,
    cu.Descripcion AS Cuenta
FROM dbo.Movimientos AS m
INNER JOIN dbo.Categorias AS c ON c.ID_Categoria = m.ID_Categoria
INNER JOIN dbo.Cuentas AS cu ON cu.ID_Cuenta = m.ID_Cuenta
ORDER BY m.Fecha DESC, m.ID_Movimiento DESC;
GO
