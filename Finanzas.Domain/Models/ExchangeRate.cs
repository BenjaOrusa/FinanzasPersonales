using System;

namespace Finanzas.Domain.Models
{

    //Representa la COTIZACION de una moneda base frente a una moneda cotizada en una fecha específica.
    public class ExchangeRate
    {
        public Guid BaseCurrencyId { get; private set; }
        public Currency BaseCurrency { get; private set; } = null!;

        public Guid TargetCurrencyId { get; private set; }
        public Currency TargetCurrency { get; private set; } = null!;

        public DateTime Date { get; private set; }
        public decimal Value { get; private set; }

        protected ExchangeRate() { }

        public ExchangeRate(Guid baseCurrencyId, Guid targetCurrencyId, DateTime date, decimal value)
        {
            if (baseCurrencyId == Guid.Empty)
                throw new ArgumentException("La moneda base es obligatoria.", nameof(baseCurrencyId));
            if (targetCurrencyId == Guid.Empty)
                throw new ArgumentException("La moneda cotizada es obligatoria.", nameof(targetCurrencyId));
            if (value <= 0)
                throw new ArgumentException("El valor de la cotización debe ser mayor a cero.", nameof(value));

            BaseCurrencyId = baseCurrencyId;
            TargetCurrencyId = targetCurrencyId;
            Date = date.Date; // Se guarda solo la fecha sin horas
            Value = value;
        }
    }
}