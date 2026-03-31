import contentModel from "../models/content.model.js";
import { enrichContentAsync } from "./content.service.js";

// Maximum retry count per content job before giving up.
const MAX_RETRIES = 3;

// Base delay for exponential backoff between retries (ms).
const BASE_RETRY_DELAY_MS = 2000;

// In-memory queue storage. Each item: {contentId, attempts, nextRunAt}.
const pendingJobs = [];

// Flag to avoid concurrent queue processors. This code path should be single-threaded.
let isProcessing = false;

// Dedup set: content IDs currently queued or processing.
const queuedContentIds = new Set();

// Calculate exponential backoff delay based on retry attempt number.
// attempt 1 -> 2s, attempt 2 -> 4s, attempt 3 -> 8s.
const getBackoffDelay = (attempt) =>
  BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);

// Queue a content enrichment job. Returns false if job already queued.
export const enqueueContentEnrichment = async (contentId) => {
  if (!contentId) {
    throw new Error("contentId is required for queueing enrichment");
  }

  const key = contentId.toString();
  if (queuedContentIds.has(key)) {
    return false; // already queued
  }

  queuedContentIds.add(key);
  pendingJobs.push({ contentId: key, attempts: 0, nextRunAt: Date.now() });

  if (!isProcessing) {
    // Start processing asynchronously in next tick.
    setTimeout(() => processQueue(), 0);
  }

  return true;
};

// Process the queue in a loop until there are no pending jobs.
// Each job may retry with backoff on failure.
const processQueue = async () => {
  if (isProcessing) return;
  isProcessing = true;

  while (pendingJobs.length > 0) {
    const job = pendingJobs.shift();
    const now = Date.now();

    if (job.nextRunAt > now) {
      pendingJobs.unshift(job);
      await new Promise((resolve) => setTimeout(resolve, job.nextRunAt - now));
      continue;
    }

    try {
      const content = await contentModel.findById(job.contentId);
      if (!content) {
        // skip jobs whose content is deleted after enqueue.
        queuedContentIds.delete(job.contentId);
        continue;
      }

      const success = await enrichContentAsync(content);
      if (!success) {
        // Let this move to catch/retry flow.
        throw new Error(
          `enrichContentAsync returned false for ${job.contentId}`,
        );
      }

      // Done for this content: remove from in-progress set.
      queuedContentIds.delete(job.contentId);
    } catch (err) {
      job.attempts += 1;
      if (job.attempts >= MAX_RETRIES) {
        console.error(
          `Content enrichment failed after ${MAX_RETRIES} attempts for ${job.contentId}`,
          err,
        );
        queuedContentIds.delete(job.contentId);
      } else {
        const delay = getBackoffDelay(job.attempts);
        console.warn(
          `Retrying enrichment for ${job.contentId} attempt ${job.attempts} after ${delay}ms`,
          err,
        );
        job.nextRunAt = Date.now() + delay;
        pendingJobs.push(job);
      }
    }
  }

  isProcessing = false;
};
