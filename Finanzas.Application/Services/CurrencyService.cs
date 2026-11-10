using Finanzas.Application.DTOs.Response.Currencies;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Services
{
    public class CurrencyService : ICurrencyService
    {
        private readonly ICurrencyRepository currencyRepository;

        public CurrencyService(ICurrencyRepository currencyRepository)
        {
            this.currencyRepository = currencyRepository;
        }

        public async Task<IReadOnlyList<CurrencyResponseDTO>> GetAllAsync(CancellationToken cancellationToken)
        {
            var currencies = await currencyRepository.GetAllAsync(cancellationToken);

            return currencies.Select(c => new CurrencyResponseDTO
            {
                Id = c.Id,
                Description = c.Description
            }).ToList();
        }
    }
}