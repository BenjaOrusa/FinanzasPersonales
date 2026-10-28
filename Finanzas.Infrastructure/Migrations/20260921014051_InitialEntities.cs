using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finanzas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AccountType = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cuentas", x => x.AccountId);
                    table.CheckConstraint("CK_Cuentas_Descripcion", "LEN(LTRIM(RTRIM(Description))) > 0");
                    table.CheckConstraint("CK_Cuentas_TipoCuenta", "AccountType IN ('Efectivo', 'CuentaBancaria', 'BilleteraVirtual')");
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CategoryType = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categorias", x => x.CategoryId);
                    table.CheckConstraint("CK_Categorias_Descripcion", "LEN(LTRIM(RTRIM(Description))) > 0");
                    table.CheckConstraint("CK_Categorias_TipoCategoria", "CategoryType IN ('Ingreso', 'Gasto')");
                });

            migrationBuilder.CreateTable(
                name: "Movements",
                columns: table => new
                {
                    MovementId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    MovementType = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AdditionalInformation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreationDate = table.Column<DateTime>(type: "datetime2(0)", nullable: false, defaultValueSql: "SYSDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Movimientos", x => x.MovementId);
                    table.CheckConstraint("CK_Movimientos_Descripcion", "LEN(LTRIM(RTRIM(Description))) > 0");
                    table.CheckConstraint("CK_Movimientos_Importe", "Amount > 0");
                    table.CheckConstraint("CK_Movimientos_TipoMovimiento", "MovementType IN ('Ingreso', 'Gasto')");
                    table.ForeignKey(
                        name: "FK_Movimientos_Categorias",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "CategoryId");
                    table.ForeignKey(
                        name: "FK_Movimientos_Cuentas",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "AccountId");
                });

            migrationBuilder.CreateIndex(
                name: "UQ_Cuentas_Descripcion",
                table: "Accounts",
                column: "Description",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ_Categorias_Descripcion_TipoCategoria",
                table: "Categories",
                columns: new[] { "Description", "CategoryType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_Fecha",
                table: "Movements",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_ID_Categoria",
                table: "Movements",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_ID_Cuenta",
                table: "Movements",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_TipoMovimiento_Fecha",
                table: "Movements",
                columns: new[] { "MovementType", "Date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Movements");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Accounts");
        }
    }
}
