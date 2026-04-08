# Reference Animation Analysis

## How revealTextScramble works:
1. Takes an element, a "from" text, and a "final" text
2. Runs at 16fps
3. Progress advances at revealSpeed * textLength per frame
4. Characters before `progress` index show the final character
5. Characters after `progress` show random scramble chars (0123456789!█▒░ABCDEF)
6. Block chars (█) appear with 35-40% chance
7. During scramble, beep sounds play randomly per frame

## Audio in reference:
- Uses Howler.js
- "beepstart.mp3" plays once on click (this = PrescriptRandomizer.mp3 equivalent)
- "beep.mp3" plays randomly during the scramble animation (small beeps per frame)
- No separate "message" audio in the reference — it uses beep sounds

## For our implementation:
- On click "Break the Seal": play PrescriptRandomizer.mp3
- Show scramble animation (random chars resolving left-to-right into task name)
- When scramble completes: play PrescriptMessage.mp3 while typing out the task description
- If task text is longer than PrescriptMessage.mp3 duration, loop the audio
- After full reveal: show the Begin Compliance button

## Timer bug fix:
- The timer should use exact duration * 60 * 1000 from the prescript
- Not Date.now() + duration which can have timing drift
- Need to check PrescriptContext for how timerEndTime is set
