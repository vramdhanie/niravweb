import Image from 'next/image'

interface Props {
  src: string
  alt: string
  width: number
  height: number
  caption?: string
  priority?: boolean
  dark?: boolean // images on a black canvas — give them a dark backing
  variant?: 'full' | 'panel'
}

export default function Figure({
  src,
  alt,
  width,
  height,
  caption,
  priority,
  dark,
  variant = 'full',
}: Props) {
  const panel = variant === 'panel'

  return (
    <figure className={panel ? 'mx-auto my-0 w-full max-w-[280px] shrink-0' : 'my-8'}>
      <div
        className="overflow-hidden rounded-lg border border-[color:rgba(0,0,0,0.1)]"
        style={dark ? { background: '#000' } : undefined}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={panel ? '280px' : '(max-width: 820px) 100vw, 760px'}
          className="h-auto w-full"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm leading-snug text-[var(--primary-light)]">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
