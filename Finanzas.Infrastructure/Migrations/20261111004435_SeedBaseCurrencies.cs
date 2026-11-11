using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finanzas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedBaseCurrencies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Datos de referencia: conservar los IDs si la moneda ya existe.
            migrationBuilder.Sql("""
                IF NOT EXISTS (
                    SELECT 1 FROM dbo.Currencies WITH (UPDLOCK, HOLDLOCK)
                    WHERE Description = N'Pesos Argentinos')
                BEGIN
                    INSERT INTO dbo.Currencies (Id, Description)
                    VALUES (NEWID(), N'Pesos Argentinos');
                END;

                IF NOT EXISTS (
                    SELECT 1 FROM dbo.Currencies WITH (UPDLOCK, HOLDLOCK)
                    WHERE Description = N'Dólar Estadounidense')
                BEGIN
                    INSERT INTO dbo.Currencies (Id, Description)
                    VALUES (NEWID(), N'Dólar Estadounidense');
                END;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Se conservan: podrían existir antes de la migración o estar usadas
            // por cuentas, movimientos y cotizaciones. No borrar datos de negocio.
        }
    }
}
