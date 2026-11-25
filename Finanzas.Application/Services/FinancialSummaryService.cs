using Finanzas.Application.DTOs.Request;
using Finanzas.Application.DTOs.Response;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Services
{
    public class FinancialSummaryService : IFinancialSummaryService
    {
        private readonly IMovementRepository movementRepository;
        private readonly IUserService userService;

        public FinancialSummaryService(
            IMovementRepository movementRepository,
            IUserService userService)
        {
            this.movementRepository = movementRepository;
            this.userService = userService;
        }

        public async Task<FinancialSummaryResponseDTO> GetSummaryAsync(string userEmail, DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken)
        {
            if (startDate.HasValue && endDate.HasValue && startDate.Value.Date > endDate.Value.Date)
                throw new ArgumentException("La fecha desde no puede ser posterior a la fecha hasta.");

            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);

            // Obtener los movimientos propios del usuario dentro del período indicado (o todo el historial si no hay fechas)
            var movements = await movementRepository.GetFilteredByUserIdAsync(
                userId: user.Id,
                movementType: null,
                startDate: startDate,
                endDate: endDate,
                accountId: null,
                categoryId: null,
                cancellationToken: cancellationToken);

            if (!movements.Any())
            {
                return new FinancialSummaryResponseDTO
                {
                    SummariesByCurrency = new List<CurrencySummaryDTO>()
                };
            }

            // Agrupar movimientos por moneda
            var summariesByCurrency = movements
                .GroupBy(m => new { m.CurrencyId, CurrencyDescription = m.Currency?.Description ?? "Moneda Desconocida" })
                .Select(group =>
                {
                    decimal totalIncome = group
                        .Where(m => m.MovementType == "Ingreso")
                        .Sum(m => m.Amount);

                    decimal totalExpenses = group
                        .Where(m => m.MovementType == "Gasto")
                        .Sum(m => m.Amount);

                    // Regla de Negocio: El balance se calcula restando el total de gastos al total de ingresos
                    decimal balance = totalIncome - totalExpenses;

                    return new CurrencySummaryDTO
                    {
                        CurrencyId = group.Key.CurrencyId,
                        CurrencyDescription = group.Key.CurrencyDescription,
                        TotalIncome = totalIncome,
                        TotalExpenses = totalExpenses,
                        Balance = balance
                    };
                })
                .OrderBy(s => s.CurrencyDescription)
                .ToList();

            return new FinancialSummaryResponseDTO
            {
                SummariesByCurrency = summariesByCurrency
            };
        }
    }
}