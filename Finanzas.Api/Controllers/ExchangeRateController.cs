using Finanzas.Application.DTOs.Request.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRates;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExchangeRateController : ControllerBase
    {
        private readonly IExchangeRateService exchangeRateService;

        public ExchangeRateController(IExchangeRateService exchangeRateService)
        {
            this.exchangeRateService = exchangeRateService;
        }

        // CU19: Exclusivo para administradores - Supervisar / Registrar cotizaciones
        [Authorize(Policy = Policies.AdminsOnly)]
        [HttpPost]
        public async Task<ActionResult<ExchangeRateResponseDTO>> Upsert([FromBody] ExchangeRateRequestDTO request, CancellationToken cancellationToken)
        {
            try
            {
                var response = await exchangeRateService.UpsertAsync(request, cancellationToken);
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // CU16: Usuario común - Consultar equivalencia de movimientos en dólares con regla de fallback
        [Authorize(Policy = Policies.StandardUsers)]
        [HttpGet("movements-dollar-equivalent")]
        public async Task<ActionResult<IReadOnlyList<MovementDollarEquivalentResponseDTO>>> GetMovementsDollarEquivalents(CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var result = await exchangeRateService.GetMovementsDollarEquivalentsAsync(userEmail, cancellationToken);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}