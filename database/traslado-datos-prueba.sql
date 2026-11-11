-- Traslado local de datos antiguos. Requiere migraciones aplicadas y usuario registrado.
SET XACT_ABORT ON;
BEGIN TRANSACTION;
DECLARE @usuario uniqueidentifier=(SELECT Id FROM dbo.Users WHERE Email='demo.finanzas@example.test');
IF @usuario IS NULL THROW 50001, 'Falta registrar el usuario de prueba.', 1;
IF EXISTS(SELECT 1 FROM dbo.Accounts) OR EXISTS(SELECT 1 FROM dbo.Categories) OR EXISTS(SELECT 1 FROM dbo.Movements)
    THROW 50002, 'El destino debe estar vacio para evitar duplicaciones.', 1;
DECLARE @ars uniqueidentifier=NEWID();
INSERT dbo.Currencies(Id,Description) VALUES(@ars,N'Pesos Argentinos');
DECLARE @cuentas TABLE(Anterior int PRIMARY KEY, Nuevo uniqueidentifier);
DECLARE @categorias TABLE(Anterior int PRIMARY KEY, Nuevo uniqueidentifier);
INSERT @cuentas SELECT ID_Cuenta,NEWID() FROM dbo.Cuentas;
INSERT @categorias SELECT ID_Categoria,NEWID() FROM dbo.Categorias;
INSERT dbo.Accounts(AccountId,Description,AccountType,Active,Balance,CurrencyId,UserId)
SELECT m.Nuevo,c.Descripcion,c.TipoCuenta,c.Activa,0,@ars,@usuario FROM dbo.Cuentas c JOIN @cuentas m ON m.Anterior=c.ID_Cuenta;
INSERT dbo.Categories(CategoryId,Description,CategoryType,Active,UserId)
SELECT m.Nuevo,c.Descripcion,c.TipoCategoria,c.Activa,@usuario FROM dbo.Categorias c JOIN @categorias m ON m.Anterior=c.ID_Categoria;
IF EXISTS(SELECT 1 FROM dbo.Movimientos WHERE LEN(Nota)>255)
    THROW 50003, 'Una nota supera la longitud del modelo nuevo.', 1;
INSERT dbo.Movements(MovementId,Description,Amount,Date,MovementType,CategoryId,AccountId,Note,CreationDate,CurrencyId,UserId)
SELECT NEWID(),m.Descripcion,m.Importe,m.Fecha,m.TipoMovimiento,c.Nuevo,a.Nuevo,m.Nota,m.FechaCreacion,@ars,@usuario
FROM dbo.Movimientos m JOIN @categorias c ON c.Anterior=m.ID_Categoria JOIN @cuentas a ON a.Anterior=m.ID_Cuenta;
IF (SELECT COUNT(*) FROM dbo.Movements)<>(SELECT COUNT(*) FROM dbo.Movimientos)
    THROW 50004, 'No coinciden las cantidades de movimientos.', 1;
UPDATE a SET Balance=COALESCE((SELECT SUM(CASE WHEN m.MovementType='Ingreso' THEN m.Amount ELSE -m.Amount END) FROM dbo.Movements m WHERE m.AccountId=a.AccountId),0)
FROM dbo.Accounts a WHERE a.UserId=@usuario;
IF EXISTS(SELECT 1 FROM dbo.Movements m JOIN dbo.Categories c ON c.CategoryId=m.CategoryId WHERE c.CategoryType<>m.MovementType)
    THROW 50005, 'Hay tipos de movimiento incompatibles con su categoria.', 1;
COMMIT;
