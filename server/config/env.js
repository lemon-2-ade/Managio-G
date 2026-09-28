import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config({ path: "../.env" });

// Node removed the long-deprecated `Buffer.SlowBuffer` alias. firebase-admin's
// JWT dependencies (jwa/jws) still reference it at import time, so polyfill it
// before anything else in the app requires firebase-admin.
const bufferModule = createRequire(import.meta.url)("buffer");
if (!bufferModule.SlowBuffer) {
  bufferModule.SlowBuffer = Buffer;
}
