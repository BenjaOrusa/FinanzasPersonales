using Finanzas.Domain.Models;
using Microsoft.EntityFrameworkCore;


namespace Finanzas.Infrastructure.Persistence;

/// <summary>
/// Representa una sesión de trabajo de Entity Framework Core con la base FinanzasPersonales.
/// </summary>
public class FinanzasDbContext(DbContextOptions<FinanzasDbContext> options)
    : DbContext(options)
{




    // Conjunto consultable asociado a la tabla Categorias.
    public DbSet<Category> Categories => Set<Category>();


    // Conjunto consultable asociado a la tabla Cuentas.
    public DbSet<Account> Accounts => Set<Account>();

    
    // Conjunto consultable asociado a la tabla Movimientos.
    public DbSet<Movement> Movements => Set<Movement>();


    
    // Conjunto consultable asociado a la tabla Usuarios.
    public DbSet<User> Users => Set<User>();

   
    // Conjunto consultable asociado a la tabla Tipos de Usuario.
    public DbSet<TypeOfUser> TypeOfUsers => Set<TypeOfUser>();




    // Describe explícitamente cómo se relacionan las clases C# con el esquema SQL existente.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureCategory(modelBuilder);
        ConfigureAccount(modelBuilder);
        ConfigureMovement(modelBuilder);
        ConfigureTypeOfUser(modelBuilder); 
        ConfigureUser(modelBuilder);       
    }

    private static void ConfigureCategory(ModelBuilder modelBuilder)
    {
        var category = modelBuilder.Entity<Category>();

        category.ToTable("Categories", tabla =>
        {
            
            tabla.HasCheckConstraint(
                "CK_Categorias_Descripcion",
                "LEN(LTRIM(RTRIM(Description))) > 0");
            tabla.HasCheckConstraint(
                "CK_Categorias_TipoCategoria",
                "CategoryType IN ('Ingreso', 'Gasto')");
        });

        category.HasKey(item => item.CategoryId)
            .HasName("PK_Categorias");

        category.Property(item => item.CategoryId)
            .ValueGeneratedOnAdd();

        category.Property(item => item.Description)
            .HasMaxLength(100)
            .IsRequired();

        category.Property(item => item.CategoryType)
            .HasMaxLength(10)
            .IsUnicode(false)
            .IsRequired();

        category.Property(item => item.Active)
            .HasDefaultValue(true)
            .IsRequired();

        category.HasIndex(item => new { item.Description, item.CategoryType })
            .IsUnique()
            .HasDatabaseName("UQ_Categorias_Descripcion_TipoCategoria");
    }

    private static void ConfigureAccount(ModelBuilder modelBuilder)
    {
        var account = modelBuilder.Entity<Account>();

        account.ToTable("Accounts", tabla =>
        {
           
            tabla.HasCheckConstraint(
                "CK_Cuentas_Descripcion",
                "LEN(LTRIM(RTRIM(Description))) > 0");
            tabla.HasCheckConstraint(
                "CK_Cuentas_TipoCuenta",
                "AccountType IN ('Efectivo', 'CuentaBancaria', 'BilleteraVirtual')");
        });

        account.HasKey(item => item.AccountId)
            .HasName("PK_Cuentas");

        account.Property(item => item.AccountId)
            .ValueGeneratedOnAdd();

        account.Property(item => item.Description)
            .HasMaxLength(100)
            .IsRequired();

        account.Property(item => item.AccountType)
            .HasMaxLength(20)
            .IsUnicode(false)
            .IsRequired();

        account.Property(item => item.Active)
            .HasDefaultValue(true)
            .IsRequired();

        account.HasIndex(item => item.Description)
            .IsUnique()
            .HasDatabaseName("UQ_Cuentas_Descripcion");
    }

    private static void ConfigureMovement(ModelBuilder modelBuilder)
    {
        var movement = modelBuilder.Entity<Movement>();

        movement.ToTable("Movements", tabla =>
        {
            
            tabla.HasCheckConstraint(
                "CK_Movimientos_Descripcion",
                "LEN(LTRIM(RTRIM(Description))) > 0");
            tabla.HasCheckConstraint(
                "CK_Movimientos_Importe",
                "Amount > 0");
            tabla.HasCheckConstraint(
                "CK_Movimientos_TipoMovimiento",
                "MovementType IN ('Ingreso', 'Gasto')");
        });

        movement.HasKey(item => item.MovementId)
            .HasName("PK_Movimientos");

        movement.Property(item => item.MovementId)
            .ValueGeneratedOnAdd();

        movement.Property(item => item.Description)
            .HasMaxLength(200)
            .IsRequired();

        movement.Property(item => item.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        movement.Property(item => item.Date)
            .HasColumnType("date")
            .IsRequired();

        movement.Property(item => item.MovementType)
            .HasMaxLength(10)
            .IsUnicode(false)
            .IsRequired();

        movement.Property(item => item.AdditionalInformation)
            .HasMaxLength(500);

        movement.Property(item => item.CreationDate)
            .HasColumnType("datetime2(0)")
            .HasDefaultValueSql("SYSDATETIME()")
            .ValueGeneratedOnAdd();

        movement.HasOne(item => item.Category)
            .WithMany(category => category.Movements)
            .HasForeignKey(item => item.CategoryId)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Movimientos_Categorias");

        movement.HasOne(item => item.Account)
            .WithMany(account => account.Movements)
            .HasForeignKey(item => item.AccountId)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Movimientos_Cuentas");

        movement.HasIndex(item => item.Date)
            .HasDatabaseName("IX_Movimientos_Fecha");

        movement.HasIndex(item => item.CategoryId)
            .HasDatabaseName("IX_Movimientos_ID_Categoria");

        movement.HasIndex(item => item.AccountId)
            .HasDatabaseName("IX_Movimientos_ID_Cuenta");

        movement.HasIndex(item => new { item.MovementType, item.Date })
            .HasDatabaseName("IX_Movimientos_TipoMovimiento_Fecha");
    }

    private static void ConfigureTypeOfUser(ModelBuilder modelBuilder)
    {
        var typeOfUser = modelBuilder.Entity<TypeOfUser>();

        typeOfUser.ToTable("TypeOfUsers");

        typeOfUser.HasKey(item => item.Id)
            .HasName("PK_TypeOfUsers");

        typeOfUser.Property(item => item.Id)
            .ValueGeneratedOnAdd();

        typeOfUser.Property(item => item.Description)
            .HasMaxLength(50)
            .IsRequired();

        typeOfUser.HasIndex(item => item.Description)
            .IsUnique()
            .HasDatabaseName("UQ_TypeOfUsers_Description");
    }

    private static void ConfigureUser(ModelBuilder modelBuilder)
    {
        var user = modelBuilder.Entity<User>();

        user.ToTable("Users", tabla =>
        {
            tabla.HasCheckConstraint(
                "CK_Users_Email",
                "LEN(LTRIM(RTRIM(Email))) > 0");
        });

        user.HasKey(item => item.Id)
            .HasName("PK_Users");

        user.Property(item => item.Id)
            .ValueGeneratedOnAdd();

        user.Property(item => item.Email)
            .HasMaxLength(150)
            .IsUnicode(false)
            .IsRequired();

        user.Property(item => item.PasswordHash)
            .HasMaxLength(255)
            .IsRequired();

        user.Property(item => item.Name)
            .HasMaxLength(100)
            .IsRequired();

        user.Property(item => item.Surname)
            .HasMaxLength(100)
            .IsRequired();

        user.Property(item => item.Active)
            .HasDefaultValue(true)
            .IsRequired();

        // Relación con TypeOfUser
        user.HasOne(item => item.TypeOfUser)
            .WithMany(type => type.Users)
            .HasForeignKey(item => item.TypeOfUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Users_TypeOfUsers");

        user.HasIndex(item => item.Email)
            .IsUnique()
            .HasDatabaseName("UQ_Users_Email");
    }
}
