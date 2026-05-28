import {
  FilesetResolver,
  FaceLandmarker,
} from "@mediapipe/tasks-vision";

let faceLandmarker;

export async function createFaceLandmarker() {
  const vision =
    await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

  faceLandmarker =
    await FaceLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        },

        outputFaceBlendshapes: true,

        runningMode: "VIDEO",

        numFaces: 1,
      }
    );

  return faceLandmarker;
}