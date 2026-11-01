import data from '../../content/image-variants.json'

interface ImageVariants {
  width: number
  height: number
  variants: { src: string; width: number }[]
}

/** Unlisted/new media retain their original source; only authored derivatives enter srcset. */
export function responsiveImage(src: string, sizes: string) {
  const image = (data as Record<string, ImageVariants>)[src]
  return image
    ? {
        srcSet: image.variants
          .map((variant) => `${variant.src} ${variant.width}w`)
          .join(', '),
        sizes,
      }
    : {}
}
