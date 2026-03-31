import contentModel from "../models/content.model.js";
import { enrichContentAsync } from "./content.service.js";

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 2000;

const pendingJobs = [];
let isProcessing = false;
const queuedContentIds = new Set();

const getBackoffDelay = (attempt) =>
  BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);

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
    setTimeout(() => processQueue(), 0);
  }

  return true;
};

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
        queuedContentIds.delete(job.contentId);
        continue;
      }

      const success = await enrichContentAsync(content);
      if (!success) {
        throw new Error(
          `enrichContentAsync returned false for ${job.contentId}`,
        );
      }

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
