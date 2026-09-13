interface TitleProps {
  title: string
  subtitle: string
}

export default function Title({ title, subtitle }: TitleProps) {
  return (
    <div className="mb-8">
      <h4 className="text-center text-4xl uppercase tracking-[6px] text-[var(--secondary)]">
        <span className="mr-1.5 text-[var(--primary-dark)]">{title}</span>
        <span>{subtitle}</span>
      </h4>
    </div>
  )
}
