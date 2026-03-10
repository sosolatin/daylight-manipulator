const TIME_DESCRIPTIONS = {
  dawn: {
    label: 'Pre-dawn / Dawn',
    prompt: `Transform this photograph to pre-dawn / dawn — approximately 5:30am to 7:00am Tasmanian time in winter or shoulder season.

The scene should feel like the very early morning before full daylight arrives. The sky through any windows should be a deep cool blue-grey to pale indigo, with the faintest suggestion of lighter blue near the horizon — not warm orange or pink. There is no direct sunlight falling on any surface.

Interior lamps and light fittings that are visible in the source image should appear switched on and glowing with a warm amber light, as they would be in a room not yet illuminated by daylight. The warmth of these lamps should contrast gently with the cool blue light entering from outside.

Shadows in the room should be soft and ambient. The overall mood should feel quiet, still, and intimate — the world not yet awake. Preserve every object, surface, texture, and architectural detail exactly as in the source.`,
  },

  dusk: {
    label: 'Dusk',
    prompt: `Transform this photograph to dusk — approximately 30 to 60 minutes after sunset in Tasmania. This is the blue hour.

The sky outside any windows should be a rich deep blue, transitioning from mid-blue near the horizon to a darker blue-grey or near-indigo overhead. There is no remaining orange or pink light on the horizon — the sun has fully set. No sunlight falls on any exterior or interior surface.

Interior lamps visible in the source image are switched on and emit a warm, low amber glow. The contrast between the cool exterior blue and the warm interior lamp light is the defining quality of this scene. The room should feel cosy and inhabited.

Shadow edges should be soft and ambient. The mood is transitional — day has ended, the interior is beginning to glow. Preserve every object, surface, texture, and architectural detail exactly as in the source.`,
  },

  night: {
    label: 'Night',
    prompt: `Transform this photograph to full night — approximately 9pm to 11pm in Tasmania, winter season.

Outside any windows, the sky should be a deep dark blue-black to near-black. Stars may be subtly suggested if windows are visible, but no dramatic star trails or Milky Way — keep it realistic and measured. There is no exterior ambient light.

Interior lamps visible in the source image are the primary light source. They glow with a warm, amber-toned light — intimate and residential in quality, not bright or clinical. The room should feel fully lit by these lamps, with warm pools of light falling on nearby surfaces and softer, dimmer light in shadowed areas.

The overall mood is deeply intimate and private. The contrast between the dark exterior and the warm glowing interior is strong. Preserve every object, surface, texture, and architectural detail exactly as in the source.`,
  },

  overcast: {
    label: 'Overcast Day',
    prompt: `Transform this photograph to a typical overcast Tasmanian daytime — fully clouded over, flat diffuse natural light.

Outside any windows, the sky should be a uniform cool light grey — the kind of solid cloud cover that is characteristic of southern Tasmania. No blue sky, no sun breaks, no dramatic cloud formations. Just flat, soft, grey daylight.

Interior light is entirely ambient and natural, coming from the windows. There are no harsh shadows or directional light. All surfaces receive an even, cool, slightly grey-toned illumination. Interior lamps are off.

The mood is calm, contemplative, and minimalist — the light is not dramatic but beautifully even. Colour saturation is slightly muted compared to sunny conditions. Preserve every object, surface, texture, and architectural detail exactly as in the source.`,
  },
}

export function buildUserPrompt(targetTime) {
  const entry = TIME_DESCRIPTIONS[targetTime]
  if (!entry) throw new Error(`Unknown time of day: ${targetTime}`)

  return `Please analyse this photograph and write a precise image-editing brief to transform it to: ${entry.label.toUpperCase()}.

${entry.prompt}

Your output should be a detailed, technically precise editing brief for Imagen 3, describing exactly how to relight this specific image. Reference specific elements visible in the photograph where possible. Do not include any preamble — output only the brief itself.`
}

/**
 * Returns a direct transformation instruction for the image generation model.
 * Unlike buildUserPrompt, this does NOT ask the model to write a brief —
 * it asks the model to apply the transformation directly and output a new image.
 */
export function buildImagePrompt(targetTime) {
  const entry = TIME_DESCRIPTIONS[targetTime]
  if (!entry) throw new Error(`Unknown time of day: ${targetTime}`)

  return `Apply the following lighting transformation to this photograph, producing the transformed image directly:

${entry.prompt}

Output only the transformed image — do not output any text or description.`
}

export { TIME_DESCRIPTIONS }
