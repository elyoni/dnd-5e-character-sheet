# Character art

Drop one image per race/class/background here, named after the content
file's id (the markdown filename minus `.md`):

- `content/images/races/<id>.jpg` e.g. content/images/races/elf.jpg
- `content/images/classes/<id>.jpg` e.g. content/images/classes/barbarian.jpg
- `content/images/backgrounds/<id>.jpg` e.g. content/images/backgrounds/soldier.jpg

Then add an `img:` line to that entry's frontmatter in
`content/{races,classes,backgrounds}/<id>.md`, pointing at the file with a
path relative to the repo root, e.g.:

```yaml
img: content/images/races/elf.jpg
```

Run `node build.js` afterwards to pick it up. One full-body image serves
both the small circular portrait (CSS crops it to the face) and the
full-size lightbox view — no need for two separate files.

Any image size/aspect works; a tall portrait (as in the prompt template)
crops best for the circular face view.

## All the prmopt:

Template:
Full-body vertical character portrait of a Human [CLASS], [POSE / ACTION / EXPRESSION], [WEAPON/ITEM]. Wearing [CLOTHING/ARMOR]. Surrounded by a glowing [COLOR] [ENERGY TYPE] aura outlining the figure. Clean stylized 2D digital illustration, bold linework, flat cel-shaded coloring, modern adventure-cartoon illustration style, exaggerated dynamic proportions, vibrant but grounded color palette, graphic-novel energy. [SIMPLE BACKGROUND — sky + terrain, no clutter]. Character centered with headroom above the head, no text, no watermark.

Artificer
Full-body vertical character portrait of a Human Artificer, crouched and grinning as a floating mechanical construct hovers beside them, one hand raised mid-tinkering. Holding a glowing wrench-staff crackling with arcane circuitry. Wearing a leather apron over goggles, brass gauntlets, and pouches of gears. Surrounded by a glowing cyan-blue arcane-energy aura with faint circuit-line sparks outlining the figure. Clean stylized 2D digital illustration, bold linework, flat cel-shaded coloring, modern adventure-cartoon illustration style, exaggerated dynamic proportions, vibrant but grounded color palette, graphic-novel energy. Workshop rooftop background with a soft sunset sky. Character centered with headroom above the head, no text, no watermark.

Bard
Full-body vertical character portrait of a Human Bard, mid-stride with a confident smirk, one hand strumming a glowing lute. Wearing a flamboyant embroidered coat, feathered hat, and a rapier at the hip. Surrounded by a glowing magenta-and-gold musical-note aura outlining the figure. Clean stylized 2D digital illustration, bold linework, flat cel-shaded coloring, modern adventure-cartoon illustration style, exaggerated dynamic proportions, vibrant but grounded color palette, graphic-novel energy. Cobblestone tavern-square background under warm evening light. Character centered with headroom above the head, no text, no watermark.

Cleric
Full-body vertical character portrait of a Human Cleric, standing firm with one arm raised, radiant holy light pouring from an upheld symbol. Holding a warhammer resting against one shoulder. Wearing polished silver plate with a white-and-gold tabard. Surrounded by a glowing white-gold holy-light aura outlining the figure. Clean stylized 2D digital illustration, bold linework, flat cel-shaded coloring, modern adventure-cartoon illustration style, exaggerated dynamic proportions, vibrant but grounded color palette, graphic-novel energy. Sunlit stone temple courtyard background. Character centered with headroom above the head, no text, no watermark.

Druid
Full-body vertical character portrait of a Human Druid, calm and rooted in a wide stance, vines curling up one arm, a hawk perched on the other. Holding a gnarled wooden staff topped with a glowing seed pod. Wearing leaf-and-bark armor over simple woven cloth. Surrounded by a glowing green nature-energy aura with drifting leaves outlining the figure. Clean stylized 2D digital illustration, bold linework, flat cel-shaded coloring, modern adventure-cartoon illustration style, exaggerated dynamic proportions, vibrant but grounded color palette, graphic-novel energy. Misty forest-clearing background. Character centered with headroom above the head, no text, no watermark.

Fighter
Full-body vertical character portrait of a Human Fighter, mid-charge with a fierce battle-ready grin, sword and shield raised. Wearing scarred steel plate armor with a torn cape. Surrounded by a glowing crimson-orange kinetic-energy aura outlining the figure. Clean stylized 2D digital illustration, bold linework, flat cel-shaded coloring, modern adventure-cartoon illustration style, exaggerated dynamic proportions, vibrant but grounded color palette, graphic-novel energy. Windswept battlefield ridge background under a stormy sky. Character centered with headroom above the head, no text, no watermark.

Monk
Full-body vertical character portrait of a Human Monk, frozen mid-kick with a focused calm expression, fists wrapped in cloth. Wearing simple saffron-and-grey robes tied at the waist. Surrounded by a glowing pale-blue chi-energy aura with concentric ripples outlining the figure. Clean stylized 2D digital illustration, bold linework, flat cel-shaded coloring, modern adventure-cartoon illustration style, exaggerated dynamic proportions, vibrant but grounded color palette, graphic-novel energy. Mountaintop monastery-courtyard background with distant peaks. Character centered with headroom above the head, no text, no watermark.

Paladin
Full-body vertical character portrait of a Human Paladin, standing tall with a longsword planted point-down and a radiant shield raised, resolute expression. Wearing gleaming gold-trimmed plate armor with a flowing white cape. Surrounded by a glowing golden-white radiant aura outlining the figure. Clean stylized 2D digital illustration, bold linework, flat cel-shaded coloring, modern adventure-cartoon illustration style, exaggerated dynamic proportions, vibrant but grounded color palette, graphic-novel energy. Sunrise over a hilltop battlefield background. Character centered with headroom above the head, no text, no watermark.

Ranger
Full-body vertical character portrait of a Human Ranger, crouched low with a longbow drawn and an arrow nocked, a wolf companion at their side. Wearing hooded forest-green leather armor with a quiver on the back. Surrounded by a glowing emerald-green tracking-energy aura outlining the figure. Clean stylized 2D digital illustration, bold linework, flat cel-shaded coloring, modern adventure-cartoon illustration style, exaggerated dynamic proportions, vibrant but grounded color palette, graphic-novel energy. Dense pine-forest background with dappled light. Character centered with headroom above the head, no text, no watermark.

Rogue
Full-body vertical character portrait of a Human Rogue, crouched on a ledge with a sly grin, twin daggers reversed in each hand. Wearing a fitted dark leather outfit with a hood pulled back and a scarf. Surrounded by a glowing violet-shadow aura with faint smoke wisps outlining the figure. Clean stylized 2D digital illustration, bold linework, flat cel-shaded coloring, modern adventure-cartoon illustration style, exaggerated dynamic proportions, vibrant but grounded color palette, graphic-novel energy. Moonlit rooftop-city background. Character centered with headroom above the head, no text, no watermark.

Sorcerer
Full-body vertical character portrait of a Human Sorcerer, arms outstretched with raw magic swirling between open palms, wild confident expression. Wearing a flowing draped robe with glowing runic tattoos on bare arms. Surrounded by a glowing prismatic-purple wild-magic aura with crackling arcs outlining the figure. Clean stylized 2D digital illustration, bold linework, flat cel-shaded coloring, modern adventure-cartoon illustration style, exaggerated dynamic proportions, vibrant but grounded color palette, graphic-novel energy. Cracked-earth arcane-ruin background under a swirling sky. Character centered with headroom above the head, no text, no watermark.

Warlock
Full-body vertical character portrait of a Human Warlock, calm and unsettling half-smile, one hand summoning a spectral eye, the other gripping a bone-inlaid pact-blade. Wearing a dark tattered coat with an eldritch amulet. Surrounded by a glowing sickly-green eldritch aura with wisping tendrils outlining the figure. Clean stylized 2D digital illustration, bold linework, flat cel-shaded coloring, modern adventure-cartoon illustration style, exaggerated dynamic proportions, vibrant but grounded color palette, graphic-novel energy. Foggy graveyard-at-dusk background. Character centered with headroom above the head, no text, no watermark.

Wizard
Full-body vertical character portrait of a Human Wizard, mid-cast with a raised hand crackling with arcane sigils, intense focused expression. Holding a tall carved staff topped with a glowing crystal. Wearing deep-blue star-patterned robes with a wide-brimmed hat. Surrounded by a glowing sapphire-blue arcane aura with floating rune symbols outlining the figure. Clean stylized 2D digital illustration, bold linework, flat cel-shaded coloring, modern adventure-cartoon illustration style, exaggerated dynamic proportions, vibrant but grounded color palette, graphic-novel energy. Ancient library-tower background with tall bookshelves. Character centered with headroom above the head, no text, no watermark.
