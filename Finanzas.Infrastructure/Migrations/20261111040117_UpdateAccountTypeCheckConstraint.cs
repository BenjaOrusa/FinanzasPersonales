using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finanzas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAccountTypeCheckConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts",
                sql: "AccountType IN ('Efectivo', 'Cuenta Bancaria', 'Billetera Virtual')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts",
                sql: "AccountType IN ('Efectivo', 'CuentaBancaria', 'BilleteraVirtual')");
        }
    }
}
