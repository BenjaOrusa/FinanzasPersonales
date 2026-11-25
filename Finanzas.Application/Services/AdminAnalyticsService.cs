using Finanzas.Application.DTOs.Response.Admin;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Services
{
    public class AdminAnalyticsService : IAdminAnalyticsService
    {
        private const string UnknownCurrency = "Moneda Desconocida";

        private readonly IMovementRepository movementRepository;
        private readonly IUserRepository userRepository;

        public AdminAnalyticsService(IMovementRepository movementRepository, IUserRepository userRepository)
        {
            this.movementRepository = movementRepository;
            this.userRepository = userRepository;
        }

        public async Task<AdminMovementsAnalyticsResponseDTO> GetMovementsAnalyticsAsync(
            int? year, int? month, Guid? userId, CancellationToken cancellationToken)
        {
            // Validación de filtros
            if (month.HasValue && !year.HasValue)
                throw new ArgumentException("Para filtrar por mes debe indicar también el año.");

            if (year.HasValue && (year.Value < 2000 || year.Value > 2100))
                throw new ArgumentException("El año indicado no es válido.");

            if (month.HasValue && (month.Value < 1 || month.Value > 12))
                throw new ArgumentException("El mes debe estar entre 1 y 12.");

            Guid? filterUserId = userId.HasValue && userId.Value != Guid.Empty ? userId : null;

            if (filterUserId.HasValue)
            {
                var user = await userRepository.GetByIdAsync(filterUserId.Value, cancellationToken);
                if (user is null)
                    throw new KeyNotFoundException("El usuario especificado no existe.");
            }

            // Rango de fechas a partir de año y/o mes
            DateTime? startDate = null;
            DateTime? endDate = null;

            if (year.HasValue && month.HasValue)
            {
                startDate = new DateTime(year.Value, month.Value, 1);
                endDate = startDate.Value.AddMonths(1).AddDays(-1);
            }
            else if (year.HasValue)
            {
                startDate = new DateTime(year.Value, 1, 1);
                endDate = new DateTime(year.Value, 12, 31);
            }

            var movements = await movementRepository.GetForAnalyticsAsync(
                startDate, endDate, filterUserId, cancellationToken);

            return new AdminMovementsAnalyticsResponseDTO
            {
                Year = year,
                Month = month,
                UserId = filterUserId,
                TotalsByCurrency = BuildTotalsByCurrency(movements),
                Monthly = BuildMonthly(movements),
                Daily = month.HasValue ? BuildDaily(movements) : new List<AnalyticsDailyItemDTO>(),
                ByCategory = BuildByCategory(movements),
                ByUser = BuildByUser(movements)
            };
        }

        private static decimal Income(IEnumerable<Movement> movements) =>
            movements.Where(m => m.MovementType == "Ingreso").Sum(m => m.Amount);

        private static decimal Expenses(IEnumerable<Movement> movements) =>
            movements.Where(m => m.MovementType == "Gasto").Sum(m => m.Amount);

        private static string CurrencyName(Movement movement) =>
            movement.Currency?.Description ?? UnknownCurrency;

        private static List<AnalyticsCurrencyTotalDTO> BuildTotalsByCurrency(IReadOnlyList<Movement> movements) =>
            movements
                .GroupBy(m => new { m.CurrencyId, CurrencyDescription = CurrencyName(m) })
                .Select(g =>
                {
                    var income = Income(g);
                    var expenses = Expenses(g);

                    return new AnalyticsCurrencyTotalDTO
                    {
                        CurrencyId = g.Key.CurrencyId,
                        CurrencyDescription = g.Key.CurrencyDescription,
                        TotalIncome = income,
                        TotalExpenses = expenses,
                        Balance = income - expenses,
                        MovementCount = g.Count()
                    };
                })
                .OrderBy(x => x.CurrencyDescription)
                .ToList();

        private static List<AnalyticsMonthlyItemDTO> BuildMonthly(IReadOnlyList<Movement> movements) =>
            movements
                .GroupBy(m => new { m.Date.Year, m.Date.Month, m.CurrencyId, CurrencyDescription = CurrencyName(m) })
                .Select(g => new AnalyticsMonthlyItemDTO
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    CurrencyId = g.Key.CurrencyId,
                    CurrencyDescription = g.Key.CurrencyDescription,
                    TotalIncome = Income(g),
                    TotalExpenses = Expenses(g),
                    MovementCount = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ThenBy(x => x.CurrencyDescription)
                .ToList();

        private static List<AnalyticsDailyItemDTO> BuildDaily(IReadOnlyList<Movement> movements) =>
            movements
                .GroupBy(m => new { Date = m.Date.Date, m.CurrencyId, CurrencyDescription = CurrencyName(m) })
                .Select(g => new AnalyticsDailyItemDTO
                {
                    Date = g.Key.Date,
                    CurrencyId = g.Key.CurrencyId,
                    CurrencyDescription = g.Key.CurrencyDescription,
                    TotalIncome = Income(g),
                    TotalExpenses = Expenses(g),
                    MovementCount = g.Count()
                })
                .OrderBy(x => x.Date)
                .ThenBy(x => x.CurrencyDescription)
                .ToList();

        // Las categorías son propias de cada usuario, por eso se agrupan por nombre y tipo (no por Id).
        private static List<AnalyticsCategoryItemDTO> BuildByCategory(IReadOnlyList<Movement> movements) =>
            movements
                .GroupBy(m => new
                {
                    CategoryDescription = m.Category?.Description ?? string.Empty,
                    m.MovementType,
                    m.CurrencyId,
                    CurrencyDescription = CurrencyName(m)
                })
                .Select(g => new AnalyticsCategoryItemDTO
                {
                    CategoryDescription = g.Key.CategoryDescription,
                    CategoryType = g.Key.MovementType,
                    CurrencyId = g.Key.CurrencyId,
                    CurrencyDescription = g.Key.CurrencyDescription,
                    TotalAmount = g.Sum(m => m.Amount),
                    MovementCount = g.Count()
                })
                .OrderBy(x => x.CategoryDescription)
                .ThenBy(x => x.CategoryType)
                .ThenBy(x => x.CurrencyDescription)
                .ToList();

        private static List<AnalyticsUserItemDTO> BuildByUser(IReadOnlyList<Movement> movements) =>
            movements
                .GroupBy(m => new { m.UserId, m.CurrencyId, CurrencyDescription = CurrencyName(m) })
                .Select(g =>
                {
                    var user = g.First().User;

                    return new AnalyticsUserItemDTO
                    {
                        UserId = g.Key.UserId,
                        UserFullName = user is null ? string.Empty : $"{user.Name} {user.Surname}".Trim(),
                        Email = user?.Email ?? string.Empty,
                        CurrencyId = g.Key.CurrencyId,
                        CurrencyDescription = g.Key.CurrencyDescription,
                        TotalIncome = Income(g),
                        TotalExpenses = Expenses(g),
                        MovementCount = g.Count()
                    };
                })
                .OrderBy(x => x.UserFullName)
                .ThenBy(x => x.CurrencyDescription)
                .ToList();
    }
}