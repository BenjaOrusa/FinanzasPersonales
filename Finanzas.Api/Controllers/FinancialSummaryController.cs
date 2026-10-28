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

        // CU15: Consultar el resumen financiero (totales de ingresos, gastos y balance por moneda)
        [HttpGet]
        public async Task<ActionResult<FinancialSummaryResponseDTO>> GetSummary(CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var summary = await financialSummaryService.GetSummaryAsync(userEmail, cancellationToken);
                return Ok(summary);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}