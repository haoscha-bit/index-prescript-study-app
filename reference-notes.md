# Reference Site Observations: nyos.dev/prescript

## Initial State
- Pure black background
- Index logo (glowing blue, same image user provided) centered
- Below logo: "- Click to Receive -" in pixel/monospace font (cyan/light blue)
- Very minimal, clean layout

## After Click (Prescript Reveal)
- Logo stays at top, centered
- Text appears below the logo
- The text goes through a "randomizer" phase where characters scramble/shuffle rapidly
- During randomizer phase: PrescriptRandomizer.mp3 plays
- After randomizer resolves: the actual prescript message types out character by character
- During typing phase: PrescriptMessage.mp3 plays
- If text is longer than the audio, audio loops
- Final result: "While handling a hammer, listen for distant sounds." displayed in pixel font
- Text is cyan/light blue colored
- No buttons, no cards, no document borders — just logo + text on black
- Very clean, very simple

## Key Animation Sequence
1. User clicks "Click to Receive"
2. Text area shows scrambled random characters (same length as final message)
3. PrescriptRandomizer.mp3 plays during scramble
4. Characters resolve one by one from left to right into the actual message
5. PrescriptMessage.mp3 plays during the character-by-character reveal
6. Once fully revealed, audio stops, text stays displayed
