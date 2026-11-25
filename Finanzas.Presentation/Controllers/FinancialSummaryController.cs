using Finanzas.Application.DTOs.Response;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Api.Controllers
{
    [Authorize(Policy = Policies.StandardUsers)]
    [ApiController]
    [Route("api/[controller]")]
    public class FinancialSummaryController : ControllerBase
    {
        private readonly IFinancialSummaryService financialSummaryService;

        public FinancialSummaryController(IFinancialSummaryService financialSummaryService)
        {
            this.financialSummaryService = financialSummaryService;
        }

        // CU15: Consultar el resumen financiero (totales de ingresos, gastos y balance por moneda).
        // Filtro opcional por período: ?startDate=2026-11-01&endDate=2026-11-30 (sin parámetros = todo el historial).
        [HttpGet]
        public async Task<ActionResult<FinancialSummaryResponseDTO>> GetSummary(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var summary = await financialSummaryService.GetSummaryAsync(userEmail, startDate, endDate, cancellationToken);
                return Ok(summary);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}