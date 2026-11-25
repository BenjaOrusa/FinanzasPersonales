using Finanzas.Application.DTOs.Response.Currencies;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Api.Controllers
{
    // Catálogo de monedas: lo consultan tanto el usuario común (crear cuentas) como el administrador (cargar cotizaciones)
    [Authorize(Policy = Policies.AllUsers)]
    [ApiController]
    [Route("api/[controller]")]
    public class CurrencyController : ControllerBase
    {
        private readonly ICurrencyService currencyService;

        public CurrencyController(ICurrencyService currencyService)
        {
            this.currencyService = currencyService;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<CurrencyResponseDTO>>> GetAll(CancellationToken cancellationToken)
        {
            var currencies = await currencyService.GetAllAsync(cancellationToken);
            return Ok(currencies);
        }
    }
}