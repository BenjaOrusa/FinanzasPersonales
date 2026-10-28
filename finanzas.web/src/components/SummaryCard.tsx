type SummaryCardVariant = 'balance' | 'income' | 'expense'

interface SummaryCardProps {
  title: string
  amount: number
  variant: SummaryCardVariant
  description: string
  prominent?: boolean
}

// Intl.NumberFormat evita construir importes manualmente y respeta el formato argentino.
const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

function SummaryCard({
  title,
  amount,
  variant,
  description,
  prominent = false,
}: SummaryCardProps) {
  const formattedAmount = currencyFormatter.format(amount)

  // El signo acompaña al color para que el significado no dependa solo de lo visual.
  const displayedAmount =
    variant === 'income'
      ? `+ ${formattedAmount}`
      : variant === 'expense'
        ? `- ${formattedAmount}`
        : formattedAmount

  const classNames = [
    'summary-card',
    `summary-card--${variant}`,
    prominent ? 'summary-card--prominent' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={classNames}>
      <p className="summary-card__title">{title}</p>
      <p className="summary-card__amount">{displayedAmount}</p>
      <p className="summary-card__description">{description}</p>
    </article>
  )
}

export default SummaryCard
