using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.DTOs.Request.Movements
{
    public class MovementFilterDTO
    {
        public string? MovementType { get; set; } // 'Ingreso' o 'Gasto'
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? AccountId { get; set; }
        public Guid? CategoryId { get; set; }
    }
}
