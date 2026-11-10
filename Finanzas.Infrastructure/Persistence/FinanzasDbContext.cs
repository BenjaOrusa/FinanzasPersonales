using Finanzas.Domain.Models;
using Microsoft.EntityFrameworkCore;


namespace Finanzas.Infrastructure.Persistence;

// Representa una sesión de trabajo de Entity Framework Core con la base FinanzasPersonales.
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


    public DbSet<Currency> Currencies => Set<Currency>();
    public DbSet<ExchangeRate> ExchangeRates => Set<ExchangeRate>();



    // Describe explícitamente cómo se relacionan las clases C# con el esquema SQL existente.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureCategory(modelBuilder);
        ConfigureAccount(modelBuilder);
        ConfigureMovement(modelBuilder);
        ConfigureTypeOfUser(modelBuilder); 
        ConfigureUser(modelBuilder);
        ConfigureCurrency(modelBuilder);
        ConfigureExchangeRate(modelBuilder);
    }

    private static void ConfigureCategory(ModelBuilder modelBuilder)
    {
        var category = modelBuilder.Entity<Category>();

        category.ToTable("Categories", tabla =>
        {
            tabla.HasCheckConstraint("CK_Categories_Description", "LEN(LTRIM(RTRIM(Description))) > 0");
            tabla.HasCheckConstraint("CK_Categories_CategoryType", "CategoryType IN ('Ingreso', 'Gasto')");
        });

        category.HasKey(item => item.CategoryId)
            .HasName("PK_Categories");

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

        // Relación con User
        category.HasOne(item => item.User)
            .WithMany(user => user.Categories)
            .HasForeignKey(item => item.UserId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Categories_Users");

        // Índice único por usuario, nombre y tipo de categoría
        category.HasIndex(item => new { item.UserId, item.Description, item.CategoryType })
            .IsUnique()
            .HasDatabaseName("UQ_Categories_User_Description_Type");
    }

    private static void ConfigureAccount(ModelBuilder modelBuilder)
    {
        var account = modelBuilder.Entity<Account>();

        account.ToTable("Accounts", tabla =>
        {
            tabla.HasCheckConstraint("CK_Accounts_Description", "LEN(LTRIM(RTRIM(Description))) > 0");
            tabla.HasCheckConstraint("CK_Accounts_AccountType", "AccountType IN ('Efectivo', 'CuentaBancaria', 'BilleteraVirtual')");
        });

        account.HasKey(item => item.AccountId)
            .HasName("PK_Accounts");

        account.Property(item => item.AccountId)
            .ValueGeneratedOnAdd();

        account.Property(item => item.Description)
            .HasMaxLength(100)
            .IsRequired();

        account.Property(item => item.AccountType)
            .HasMaxLength(20)
            .IsUnicode(false)
            .IsRequired();

        account.Property(item => item.Balance)
            .HasPrecision(18, 2)
            .IsRequired()
            .HasDefaultValue(0);

        account.Property(item => item.Active)
            .HasDefaultValue(true)
            .IsRequired();

        // Relación con User
        account.HasOne(item => item.User)
            .WithMany(user => user.Accounts)
            .HasForeignKey(item => item.UserId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Accounts_Users");

        // Relación con Currency
        account.HasOne(item => item.Currency)
            .WithMany(currency => currency.Accounts)
            .HasForeignKey(item => item.CurrencyId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Accounts_Currencies");

        // Índice único por usuario y nombre de cuenta
        account.HasIndex(item => new { item.UserId, item.Description })
            .IsUnique()
            .HasDatabaseName("UQ_Accounts_User_Description");
    }

    private static void ConfigureMovement(ModelBuilder modelBuilder)
    {
        var movement = modelBuilder.Entity<Movement>();

        movement.ToTable("Movements", tabla =>
        {
            tabla.HasCheckConstraint("CK_Movements_Description", "LEN(LTRIM(RTRIM(Description))) > 0");
            tabla.HasCheckConstraint("CK_Movements_Amount", "Amount > 0");
            tabla.HasCheckConstraint("CK_Movements_MovementType", "MovementType IN ('Ingreso', 'Gasto')");
        });

        movement.HasKey(item => item.MovementId)
            .HasName("PK_Movements");

        movement.Property(item => item.MovementId)
            .ValueGeneratedOnAdd();

        movement.Property(item => item.Description)
            .HasMaxLength(255)
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

        movement.Property(item => item.Note)
            .HasMaxLength(255);

        movement.Property(item => item.CreationDate)
            .HasColumnType("datetime2(0)")
            .HasDefaultValueSql("SYSDATETIME()")
            .ValueGeneratedOnAdd();

        // Relaciones: 

        //User
        movement.HasOne(item => item.User)
            .WithMany(user => user.Movements)
            .HasForeignKey(item => item.UserId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Movements_Users");

        //Account
        movement.HasOne(item => item.Account)
            .WithMany(account => account.Movements)
            .HasForeignKey(item => item.AccountId)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Movements_Accounts");

        //Category
        movement.HasOne(item => item.Category)
            .WithMany(category => category.Movements)
            .HasForeignKey(item => item.CategoryId)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Movements_Categories");
        //Currency
        movement.HasOne(item => item.Currency)
            .WithMany(currency => currency.Movements)
            .HasForeignKey(item => item.CurrencyId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Movements_Currencies");

        // Índices de rendimiento
        movement.HasIndex(item => item.Date)
            .HasDatabaseName("IX_Movements_Date");

        movement.HasIndex(item => item.UserId)
            .HasDatabaseName("IX_Movements_UserId");

        movement.HasIndex(item => item.AccountId)
            .HasDatabaseName("IX_Movements_AccountId");

        movement.HasIndex(item => item.CategoryId)
            .HasDatabaseName("IX_Movements_CategoryId");
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
            tabla.HasCheckConstraint("CK_Users_Email", "LEN(LTRIM(RTRIM(Email))) > 0");
            tabla.HasCheckConstraint("CK_Users_Status", "Status IN ('Activo', 'Inactivo', 'Bloqueado')");
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

        user.Property(item => item.Status)
                        .HasMaxLength(20)
                        .IsRequired()
                        .HasDefaultValue("Activo");

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

    private static void ConfigureCurrency(ModelBuilder modelBuilder)
    {
        var currency = modelBuilder.Entity<Currency>();

        currency.ToTable("Currencies", tabla =>
        {
            tabla.HasCheckConstraint("CK_Currencies_Description", "LEN(LTRIM(RTRIM(Description))) > 0");
        });

        currency.HasKey(item => item.Id)
            .HasName("PK_Currencies");

        currency.Property(item => item.Id)
            .ValueGeneratedOnAdd();

        currency.Property(item => item.Description)
            .HasMaxLength(50)
            .IsRequired();

        currency.HasIndex(item => item.Description)
            .IsUnique()
            .HasDatabaseName("UQ_Currencies_Description");
    }

    private static void ConfigureExchangeRate(ModelBuilder modelBuilder)
    {
        var exchangeRate = modelBuilder.Entity<ExchangeRate>();

        exchangeRate.ToTable("ExchangeRates", tabla =>
        {
            tabla.HasCheckConstraint("CK_ExchangeRates_Value", "Value > 0");
        });

        // Clave Primaria Compuesta 
        exchangeRate.HasKey(item => new { item.BaseCurrencyId, item.TargetCurrencyId, item.Date })
            .HasName("PK_ExchangeRates");

        exchangeRate.Property(item => item.Date)
            .HasColumnType("date")
            .IsRequired();

        exchangeRate.Property(item => item.Value)
            .HasPrecision(18, 6)
            .IsRequired();

        exchangeRate.HasOne(item => item.BaseCurrency)
            .WithMany()
            .HasForeignKey(item => item.BaseCurrencyId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_ExchangeRates_BaseCurrency");

        exchangeRate.HasOne(item => item.TargetCurrency)
            .WithMany()
            .HasForeignKey(item => item.TargetCurrencyId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_ExchangeRates_TargetCurrency");
    }
}
