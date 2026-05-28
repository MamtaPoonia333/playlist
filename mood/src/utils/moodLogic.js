export function detectMood(blendshapes) {
  if (!blendshapes) return "No Face";

  const scores = {};

  blendshapes.forEach((shape) => {
    scores[shape.categoryName] = shape.score;
  });

  const smileLeft = scores.mouthSmileLeft || 0;
  const smileRight = scores.mouthSmileRight || 0;

  const jawOpen = scores.jawOpen || 0;

  const eyeBlinkLeft = scores.eyeBlinkLeft || 0;
  const eyeBlinkRight = scores.eyeBlinkRight || 0;

  const browDownLeft = scores.browDownLeft || 0;
  const browDownRight = scores.browDownRight || 0;


  if (smileLeft > 0.5 && smileRight > 0.5) {
    return "😊 Happy";
  }


  if (jawOpen > 0.6) {
    return "😲 Surprised";
  }


  if (
    eyeBlinkLeft > 0.7 &&
    eyeBlinkRight > 0.7
  ) {
    return "😴 Sleepy";
  }


  if (
    browDownLeft > 0.5 &&
    browDownRight > 0.5
  ) {
    return "😠 Angry";
  }

  return "😐 Neutral";
}