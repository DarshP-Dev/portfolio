# Third-party notices

The navigation bubble/pill presentation and GSAP stagger, featured gallery's
flex expansion, and profile card's light frame, tilt and foil treatment are
adapted from the user-supplied React Bits BubbleMenu, AccordionGallery and
ProfileCard references, copyright (c) 2026 David Haz.
The upstream MIT + Commons Clause license is preserved in
`public/third-party/react-bits-license.txt`. This adaptation forms part of this
portfolio application; it is not a standalone component distribution.

The supplied ScrollStack informs the homepage's section-stacking concept. The
implementation uses native CSS sticky positioning and natural section heights;
it does not copy the demo's smooth-scroll engine or intercept wheel/touch input.
The profile adaptation omits sample images, online status, orientation listeners
and the icon-library dependency; the small mail icon is an inline SVG.

Geist, Inter and JetBrains Mono font licenses are preserved under
`public/font-licenses`. The name outline in `src/components/intro/name-path.json`
is derived from Geist 500. Its generator uses build-only Fontsource/fontkit
dependencies; it adds no font parser to the browser bundle.

GSAP and MorphSVGPlugin retain the license included with the installed `gsap`
package. Other dependencies retain the license notices in their packages.
