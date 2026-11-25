using Finanzas.Application.DTOs.Response.Admin;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Api.Controllers
{
    // Módulo de Administración: Exclusivo para administradores
    [Authorize(Policy = Policies.AdminsOnly)]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminAnalyticsService adminAnalyticsService;

        public AdminController(IAdminAnalyticsService adminAnalyticsService)
        {
            this.adminAnalyticsService = adminAnalyticsService;
        }

        // Datos agregados de movimientos para los gráficos del panel de administración.
        // Filtros opcionales: ?year=2026&month=11&userId=<guid>  (month requiere year)
        [HttpGet("analytics/movements")]
        public async Task<ActionResult<AdminMovementsAnalyticsResponseDTO>> GetMovementsAnalytics(
            [FromQuery] int? year,
            [FromQuery] int? month,
            [FromQuery] Guid? userId,
            CancellationToken cancellationToken)
        {
            try
            {
                var analytics = await adminAnalyticsService.GetMovementsAnalyticsAsync(
                    year, month, userId, cancellationToken);
                return Ok(analytics);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}