# Remove the 3-tier AI trust system

Sheet Additions previously gated skill-expertise and spell-slot edits behind
a 3-tier `aiTrustLevel` setting (guided/trusted/fullyTrusted), on the theory
that some AI-proposed edits were risky enough to require the user to
explicitly opt in per field. Designing Character Draft (a second Ask AI flow
with a different risk profile — nothing exists yet to overwrite) forced the
question of whether that gating concept should extend to it too, and on
reflection it wasn't earning its complexity even for the original flow: the
one-at-a-time review step already requires an explicit accept for every
change, tiered or not, so the trust level added a second layer of friction
without a matching increase in safety. Removed entirely — expertise and
spell-slot edits are now always available for review like everything else
in Sheet Additions, and Character Draft was never gated in the first place.
