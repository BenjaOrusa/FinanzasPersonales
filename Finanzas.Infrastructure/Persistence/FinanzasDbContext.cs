using Finanzas.Domain.Models;
using Microsoft.EntityFrameworkCore;


namespace Finanzas.Infrastructure.Persistence;

/// <summary>
/// Representa una sesión de trabajo de Entity Framework Core con la base FinanzasPersonales.
/// </summary>
public class FinanzasDbContext(DbContextOptions<FinanzasDbContext> options)
    : DbContext(options)
{



    /// <summary>
    /// Conjunto consultable asociado a la tabla Categorias.
    /// </summary>
    public DbSet<Categoria> Categorias => Set<Categoria>();

    /// <summary>
    /// Conjunto consultable asociado a la tabla Cuentas.
    /// </summary>
    public DbSet<Cuenta> Cuentas => Set<Cuenta>();

    /// <summary>
    /// Conjunto consultable asociado a la tabla Movimientos.
    /// </summary>
    public DbSet<Movimiento> Movimientos => Set<Movimiento>();





    /// <summary>
    /// Describe explícitamente cómo se relacionan las clases C# con el esquema SQL existente.
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigurarCategoria(modelBuilder);
        ConfigurarCuenta(modelBuilder);
        ConfigurarMovimiento(modelBuilder);
    }

    private static void ConfigurarCategoria(ModelBuilder modelBuilder)
    {
        var categoria = modelBuilder.Entity<Categoria>();

        categoria.ToTable("Categorias", tabla =>
        {
            tabla.HasCheckConstraint(
                "CK_Categorias_Descripcion",
                "LEN(LTRIM(RTRIM(Descripcion))) > 0");
            tabla.HasCheckConstraint(
                "CK_Categorias_TipoCategoria",
                "TipoCategoria IN ('Ingreso', 'Gasto')");
        });

        categoria.HasKey(item => item.ID_Categoria)
            .HasName("PK_Categorias");

        categoria.Property(item => item.ID_Categoria)
            .ValueGeneratedOnAdd();

        categoria.Property(item => item.Descripcion)
            .HasMaxLength(100)
            .IsRequired();

        categoria.Property(item => item.TipoCategoria)
            .HasMaxLength(10)
            .IsUnicode(false)
            .IsRequired();

        categoria.Property(item => item.Activa)
            .HasDefaultValue(true)
            .IsRequired();

        categoria.HasIndex(item => new { item.Descripcion, item.TipoCategoria })
            .IsUnique()
            .HasDatabaseName("UQ_Categorias_Descripcion_TipoCategoria");
    }

    private static void ConfigurarCuenta(ModelBuilder modelBuilder)
    {
        var cuenta = modelBuilder.Entity<Cuenta>();

        cuenta.ToTable("Cuentas", tabla =>
        {
            tabla.HasCheckConstraint(
                "CK_Cuentas_Descripcion",
                "LEN(LTRIM(RTRIM(Descripcion))) > 0");
            tabla.HasCheckConstraint(
                "CK_Cuentas_TipoCuenta",
                "TipoCuenta IN ('Efectivo', 'CuentaBancaria', 'BilleteraVirtual')");
        });

        cuenta.HasKey(item => item.ID_Cuenta)
            .HasName("PK_Cuentas");

        cuenta.Property(item => item.ID_Cuenta)
            .ValueGeneratedOnAdd();

        cuenta.Property(item => item.Descripcion)
            .HasMaxLength(100)
            .IsRequired();

        cuenta.Property(item => item.TipoCuenta)
            .HasMaxLength(20)
            .IsUnicode(false)
            .IsRequired();

        cuenta.Property(item => item.Activa)
            .HasDefaultValue(true)
            .IsRequired();

        cuenta.HasIndex(item => item.Descripcion)
            .IsUnique()
            .HasDatabaseName("UQ_Cuentas_Descripcion");
    }

    private static void ConfigurarMovimiento(ModelBuilder modelBuilder)
    {
        var movimiento = modelBuilder.Entity<Movimiento>();

        movimiento.ToTable("Movimientos", tabla =>
        {
            tabla.HasCheckConstraint(
                "CK_Movimientos_Descripcion",
                "LEN(LTRIM(RTRIM(Descripcion))) > 0");
            tabla.HasCheckConstraint(
                "CK_Movimientos_Importe",
                "Importe > 0");
            tabla.HasCheckConstraint(
                "CK_Movimientos_TipoMovimiento",
                "TipoMovimiento IN ('Ingreso', 'Gasto')");
        });

        movimiento.HasKey(item => item.ID_Movimiento)
            .HasName("PK_Movimientos");

        movimiento.Property(item => item.ID_Movimiento)
            .ValueGeneratedOnAdd();

        movimiento.Property(item => item.Descripcion)
            .HasMaxLength(200)
            .IsRequired();

        movimiento.Property(item => item.Importe)
            .HasPrecision(18, 2)
            .IsRequired();

        movimiento.Property(item => item.Fecha)
            .HasColumnType("date")
            .IsRequired();

        movimiento.Property(item => item.TipoMovimiento)
            .HasMaxLength(10)
            .IsUnicode(false)
            .IsRequired();

        movimiento.Property(item => item.Nota)
            .HasMaxLength(500);

        movimiento.Property(item => item.FechaCreacion)
            .HasColumnType("datetime2(0)")
            .HasDefaultValueSql("SYSDATETIME()")
            .ValueGeneratedOnAdd();

        movimiento.HasOne(item => item.Categoria)
            .WithMany(categoria => categoria.Movimientos)
            .HasForeignKey(item => item.ID_Categoria)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Movimientos_Categorias");

        movimiento.HasOne(item => item.Cuenta)
            .WithMany(cuenta => cuenta.Movimientos)
            .HasForeignKey(item => item.ID_Cuenta)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Movimientos_Cuentas");

        movimiento.HasIndex(item => item.Fecha)
            .HasDatabaseName("IX_Movimientos_Fecha");

        movimiento.HasIndex(item => item.ID_Categoria)
            .HasDatabaseName("IX_Movimientos_ID_Categoria");

        movimiento.HasIndex(item => item.ID_Cuenta)
            .HasDatabaseName("IX_Movimientos_ID_Cuenta");

        movimiento.HasIndex(item => new { item.TipoMovimiento, item.Fecha })
            .HasDatabaseName("IX_Movimientos_TipoMovimiento_Fecha");
    }
}
