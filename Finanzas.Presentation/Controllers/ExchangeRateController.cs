using Finanzas.Application.DTOs.Request.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRates;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Models;
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

        // Historial de cotizaciones guardadas (tabla de AdminCotizacionesPage). Filtros opcionales.
        [Authorize(Policy = Policies.AllUsers)]
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<ExchangeRateResponseDTO>>> GetAll(
            [FromQuery] Guid? baseCurrencyId,
            [FromQuery] Guid? targetCurrencyId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            CancellationToken cancellationToken)
        {
            try
            {
                var rates = await exchangeRateService.GetAllAsync(
                    baseCurrencyId, targetCurrencyId, startDate, endDate, cancellationToken);
                return Ok(rates);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Última cotización guardada del dólar oficial (para mostrarla en el resumen del usuario común).
        [Authorize(Policy = Policies.AllUsers)]
        [HttpGet("latest-dollar")]
        public async Task<ActionResult<ExchangeRateResponseDTO>> GetLatestDollar(CancellationToken cancellationToken)
        {
            var rate = await exchangeRateService.GetLatestDollarAsync(cancellationToken);

            if (rate is null)
                return NotFound("Todavía no hay una cotización del dólar guardada.");

            return Ok(rate);
        }

        // CU19: Exclusivo para administradores - Consultar disponibilidad de una cotización (solo lectura)
        [Authorize(Policy = Policies.AdminsOnly)]
        [HttpGet("availability")]
        public async Task<ActionResult<ExchangeRateAvailabilityResponseDTO>> GetAvailability(
            [FromQuery] Guid baseCurrencyId,
            [FromQuery] Guid targetCurrencyId,
            [FromQuery] DateTime date,
            CancellationToken cancellationToken)
        {
            try
            {
                var availability = await exchangeRateService.CheckAvailabilityAsync(
                    baseCurrencyId, targetCurrencyId, date, cancellationToken);
                return Ok(availability);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Policy = Policies.AdminsOnly)]
        [HttpPost("import-latest-dollar")]
        public async Task<ActionResult<ImportedDollarQuoteResponseDTO>> ImportLatestDollar(CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await exchangeRateService.ImportLatestDollarAsync(cancellationToken));
            }
            catch (QuoteProviderException ex)
            {
                return Problem(statusCode: StatusCodes.Status502BadGateway, title: "No se pudo importar la cotización", detail: ex.Message);
            }
        }

        // Exclusivo para administradores - Registrar o corregir una cotización manualmente
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