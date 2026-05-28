import { useEffect, useRef, useState } from "react";

import Webcam from "react-webcam";

import { createFaceLandmarker }
  from "../utils/faceLandmarkers.js";

import { detectMood }
  from "../utils/moodLogic";

import Recommandations from './Recommandations.jsx';

export default function WebcamFeed() {

  const webcamRef = useRef(null);

  const [mood, setMood] =
    useState("Loading...");

  const landmarkerRef = useRef(null);

  function startDetection() {

    const detect = async () => {

      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {

        const video =
          webcamRef.current.video;

        const results =
          landmarkerRef.current.detectForVideo(
            video,
            performance.now()
          );

        if (
          results.faceBlendshapes &&
          results.faceBlendshapes.length > 0
        ) {

          const blendshapes =
            results.faceBlendshapes[0].categories;

          const detectedMood =
            detectMood(blendshapes);

          setMood(detectedMood);
        }
      }

      requestAnimationFrame(detect);
    };

    detect();
  }

  useEffect(() => {

    async function setup() {

      landmarkerRef.current =
        await createFaceLandmarker();

      startDetection();
    }

    setup();

  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <Webcam
        ref={webcamRef}
        mirrored={true}
        style={{
          width: "500px",
          borderRadius: "20px",
        }}
      />

      <h1>{mood}</h1>

      <Recommandations mood={mood} />
    </div>
  );
}