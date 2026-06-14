import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-wasm";
import { createCanvas, loadImage } from "canvas";
import path from "path";

let model = null;

/**
 * 1. Loads the model once and keeps it in memory.
 */
async function loadModel() {
  if (model) return model;

  // Use absolute path to ensure Node finds the model regardless of where you start the app
  const modelPath = `file://${path.join(process.cwd(), "ai_model", "model.json")}`;

  try {
    await tf.setBackend("wasm");
    await tf.ready();
    model = await tf.loadLayersModel(modelPath);
    console.log("✅ Signature AI: Model loaded successfully");
    return model;
  } catch (error) {
    console.error("❌ Signature AI: Failed to load model:", error);
    throw error;
  }
}

/**
 * 2. Processes an image into a normalized Tensor for the AI.
 */
async function getTensor(imageSource) {
  // Load image via the 'canvas' library
  const img = await loadImage(imageSource);

  // Match the input size your model expects (220x155)
  const canvas = createCanvas(220, 155);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, 220, 155);

  // Convert canvas pixels to a tensor
  // We use tf.browser.fromPixels because it handles the canvas element correctly
  return tf.browser
    .fromPixels(canvas, 1) // 1 for grayscale
    .div(255.0)
    .expandDims(0);
}

/**
 * 3. Core function to compare exactly TWO signatures.
 */
async function verifyAuthorSignature(storedImagePath, newImagePath) {
  const signatureModel = await loadModel();

  const tensorA = await getTensor(storedImagePath);
  const tensorB = await getTensor(newImagePath);

  // Perform prediction
  const prediction = signatureModel.predict([tensorA, tensorB]);
  const score = prediction.dataSync()[0];

  // CRITICAL: Clean up GPU/System memory
  tf.dispose([tensorA, tensorB, prediction]);

  const threshold = 0.8;
  return { success: score > threshold, score: score };
}

/**
 * 4. Main Exported Function: Compares a new upload against an array of stored signatures.
 */
export async function verifyAgainstMultiple(
  storedSignaturesArray,
  newSignaturePath,
) {
  let matchCount = 0;

  try {
    // Loop through the stored signatures
    for (const storedPath of storedSignaturesArray) {
      const result = await verifyAuthorSignature(storedPath, newSignaturePath);
      if (result.success) {
        matchCount++;
      }
    }

    // Logic: Pass if at least 50% of the samples match
    const passed = matchCount >= Math.ceil(storedSignaturesArray.length / 2);

    return {
      verified: passed,
      matchesFound: matchCount,
      totalChecks: storedSignaturesArray.length,
      message: passed
        ? "Identity Confirmed"
        : "Identity Denied: Patterns do not match",
    };
  } catch (err) {
    console.error("Signature Verification Error:", err);
    throw new Error("Failed to process signature verification");
  }
}
