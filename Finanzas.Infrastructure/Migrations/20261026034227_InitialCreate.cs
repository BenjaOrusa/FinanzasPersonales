using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finanzas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Movements_Categories",
                table: "Movements");

            migrationBuilder.DropForeignKey(
                name: "FK_Movements_Accounts",
                table: "Movements");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Movements",
                table: "Movements");

            migrationBuilder.DropIndex(
                name: "IX_Movements_MovementType_Date",
                table: "Movements");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movements_Description",
                table: "Movements");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movements_Amount",
                table: "Movements");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movements_MovementType",
                table: "Movements");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Categories",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "UQ_Categories_Description_CategoryType",
                table: "Categories");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Categories_Description",
                table: "Categories");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Categories_CategoryType",
                table: "Categories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Accounts",
                table: "Accounts");

            migrationBuilder.DropIndex(
                name: "UQ_Accounts_Description",
                table: "Accounts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_Description",
                table: "Accounts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "Active",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AdditionalInformation",
                table: "Movements");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Activo");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Movements",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AddColumn<Guid>(
                name: "CurrencyId",
                table: "Movements",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Movements",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Movements",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Categories",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<decimal>(
                name: "Balance",
                table: "Accounts",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "CurrencyId",
                table: "Accounts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Accounts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_Movements",
                table: "Movements",
                column: "MovementId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Categories",
                table: "Categories",
                column: "CategoryId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Accounts",
                table: "Accounts",
                column: "AccountId");

            migrationBuilder.CreateTable(
                name: "Currencies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Currencies", x => x.Id);
                    table.CheckConstraint("CK_Currencies_Description", "LEN(LTRIM(RTRIM(Description))) > 0");
                });

            migrationBuilder.CreateTable(
                name: "ExchangeRates",
                columns: table => new
                {
                    BaseCurrencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetCurrencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    Value = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExchangeRates", x => new { x.BaseCurrencyId, x.TargetCurrencyId, x.Date });
                    table.CheckConstraint("CK_ExchangeRates_Value", "Value > 0");
                    table.ForeignKey(
                        name: "FK_ExchangeRates_BaseCurrency",
                        column: x => x.BaseCurrencyId,
                        principalTable: "Currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExchangeRates_TargetCurrency",
                        column: x => x.TargetCurrencyId,
                        principalTable: "Currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_Users_Status",
                table: "Users",
                sql: "Status IN ('Activo', 'Inactivo', 'Bloqueado')");

            migrationBuilder.CreateIndex(
                name: "IX_Movements_CurrencyId",
                table: "Movements",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Movements_UserId",
                table: "Movements",
                column: "UserId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movements_Amount",
                table: "Movements",
                sql: "Amount > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movements_Description",
                table: "Movements",
                sql: "LEN(LTRIM(RTRIM(Description))) > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movements_MovementType",
                table: "Movements",
                sql: "MovementType IN ('Ingreso', 'Gasto')");

            migrationBuilder.CreateIndex(
                name: "UQ_Categories_User_Description_Type",
                table: "Categories",
                columns: new[] { "UserId", "Description", "CategoryType" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Categories_CategoryType",
                table: "Categories",
                sql: "CategoryType IN ('Ingreso', 'Gasto')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Categories_Description",
                table: "Categories",
                sql: "LEN(LTRIM(RTRIM(Description))) > 0");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_CurrencyId",
                table: "Accounts",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "UQ_Accounts_User_Description",
                table: "Accounts",
                columns: new[] { "UserId", "Description" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts",
                sql: "AccountType IN ('Efectivo', 'CuentaBancaria', 'BilleteraVirtual')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_Description",
                table: "Accounts",
                sql: "LEN(LTRIM(RTRIM(Description))) > 0");

            migrationBuilder.CreateIndex(
                name: "UQ_Currencies_Description",
                table: "Currencies",
                column: "Description",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TargetCurrencyId",
                table: "ExchangeRates",
                column: "TargetCurrencyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_Currencies",
                table: "Accounts",
                column: "CurrencyId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_Users",
                table: "Accounts",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Users",
                table: "Categories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Movements_Accounts",
                table: "Movements",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "AccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_Movements_Categories",
                table: "Movements",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Movements_Currencies",
                table: "Movements",
                column: "CurrencyId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Movements_Users",
                table: "Movements",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_Currencies",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_Users",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Users",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_Movements_Accounts",
                table: "Movements");

            migrationBuilder.DropForeignKey(
                name: "FK_Movements_Categories",
                table: "Movements");

            migrationBuilder.DropForeignKey(
                name: "FK_Movements_Currencies",
                table: "Movements");

            migrationBuilder.DropForeignKey(
                name: "FK_Movements_Users",
                table: "Movements");

            migrationBuilder.DropTable(
                name: "ExchangeRates");

            migrationBuilder.DropTable(
                name: "Currencies");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Users_Status",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Movements",
                table: "Movements");

            migrationBuilder.DropIndex(
                name: "IX_Movements_CurrencyId",
                table: "Movements");

            migrationBuilder.DropIndex(
                name: "IX_Movements_UserId",
                table: "Movements");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movements_Amount",
                table: "Movements");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movements_Description",
                table: "Movements");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movements_MovementType",
                table: "Movements");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Categories",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "UQ_Categories_User_Description_Type",
                table: "Categories");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Categories_CategoryType",
                table: "Categories");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Categories_Description",
                table: "Categories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Accounts",
                table: "Accounts");

            migrationBuilder.DropIndex(
                name: "IX_Accounts_CurrencyId",
                table: "Accounts");

            migrationBuilder.DropIndex(
                name: "UQ_Accounts_User_Description",
                table: "Accounts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_Description",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CurrencyId",
                table: "Movements");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "Movements");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Movements");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "Balance",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "CurrencyId",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Accounts");

            migrationBuilder.AddColumn<bool>(
                name: "Active",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Movements",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AddColumn<string>(
                name: "AdditionalInformation",
                table: "Movements",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Movements",
                table: "Movements",
                column: "MovementId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Categories",
                table: "Categories",
                column: "CategoryId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Accounts",
                table: "Accounts",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Movements_MovementType_Date",
                table: "Movements",
                columns: new[] { "MovementType", "Date" });

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movements_Description",
                table: "Movements",
                sql: "LEN(LTRIM(RTRIM(Description))) > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movements_Amount",
                table: "Movements",
                sql: "Amount > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movements_MovementType",
                table: "Movements",
                sql: "MovementType IN ('Ingreso', 'Gasto')");

            migrationBuilder.CreateIndex(
                name: "UQ_Categories_Description_CategoryType",
                table: "Categories",
                columns: new[] { "Description", "CategoryType" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Categories_Description",
                table: "Categories",
                sql: "LEN(LTRIM(RTRIM(Description))) > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Categories_CategoryType",
                table: "Categories",
                sql: "CategoryType IN ('Ingreso', 'Gasto')");

            migrationBuilder.CreateIndex(
                name: "UQ_Accounts_Description",
                table: "Accounts",
                column: "Description",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_Description",
                table: "Accounts",
                sql: "LEN(LTRIM(RTRIM(Description))) > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts",
                sql: "AccountType IN ('Efectivo', 'CuentaBancaria', 'BilleteraVirtual')");

            migrationBuilder.AddForeignKey(
                name: "FK_Movements_Categories",
                table: "Movements",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Movements_Accounts",
                table: "Movements",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "AccountId");
        }
    }
}
