/**
 * ML Service — Transformers.js powered NLP
 * Provides real ML-based sentiment analysis and zero-shot incident classification.
 * Models are downloaded once and cached in the browser's Cache Storage.
 *
 * Models used:
 *  - Sentiment:       Xenova/distilbert-base-uncased-finetuned-sst-2-english (~68 MB, cached)
 *  - Classification:  Xenova/nli-deberta-v3-small (~170 MB, cached, zero-shot)
 */

import { pipeline, env } from '@xenova/transformers';

// Always fetch models from Hugging Face CDN — never look for local copies
env.allowLocalModels = false;

// ─── Incident category labels used for zero-shot classification ──────────────
export const INCIDENT_LABELS = [
  'crime or theft or robbery',
  'fire or explosion or burning',
  'medical emergency or health issue',
  'hazard or flood or infrastructure damage',
  'noise disturbance or loud music',
  'neighbor dispute or conflict',
  'utility outage or no electricity or no water',
];

/** Map zero-shot label back to our internal category keys */
const LABEL_TO_CATEGORY = {
  'crime or theft or robbery': 'crime',
  'fire or explosion or burning': 'fire',
  'medical emergency or health issue': 'health',
  'hazard or flood or infrastructure damage': 'hazard',
  'noise disturbance or loud music': 'noise',
  'neighbor dispute or conflict': 'dispute',
  'utility outage or no electricity or no water': 'utility',
};

// ─── Singleton state ──────────────────────────────────────────────────────────
let _sentimentPipeline = null;
let _classifierPipeline = null;

let _sentimentLoading = false;
let _classifierLoading = false;

// Progress callbacks registered by consumers
const _sentimentCallbacks = new Set();
const _classifierCallbacks = new Set();

// ─── Pipeline getters (lazy + singleton) ─────────────────────────────────────

/**
 * Returns (initialising if needed) the sentiment-analysis pipeline.
 * @param {Function} [onProgress] - Optional progress callback: (info) => void
 */
export const getSentimentPipeline = async (onProgress) => {
  if (onProgress) _sentimentCallbacks.add(onProgress);

  if (_sentimentPipeline) {
    onProgress?.({ status: 'ready' });
    return _sentimentPipeline;
  }

  if (_sentimentLoading) {
    // Wait until existing load finishes
    return new Promise((resolve, reject) => {
      const check = setInterval(() => {
        if (_sentimentPipeline) {
          clearInterval(check);
          resolve(_sentimentPipeline);
        }
      }, 200);
      setTimeout(() => {
        clearInterval(check);
        reject(new Error('Sentiment pipeline load timeout'));
      }, 120_000);
    });
  }

  _sentimentLoading = true;

  const notify = (info) => _sentimentCallbacks.forEach((cb) => cb(info));

  try {
    notify({ status: 'loading', model: 'sentiment' });
    _sentimentPipeline = await pipeline(
      'sentiment-analysis',
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
      {
        progress_callback: (progressInfo) => {
          notify({ status: 'progress', model: 'sentiment', ...progressInfo });
        },
      }
    );
    notify({ status: 'ready', model: 'sentiment' });
    return _sentimentPipeline;
  } catch (err) {
    notify({ status: 'error', model: 'sentiment', error: err.message });
    throw err;
  } finally {
    _sentimentLoading = false;
  }
};

/**
 * Returns (initialising if needed) the zero-shot-classification pipeline.
 * @param {Function} [onProgress] - Optional progress callback: (info) => void
 */
export const getClassifierPipeline = async (onProgress) => {
  if (onProgress) _classifierCallbacks.add(onProgress);

  if (_classifierPipeline) {
    onProgress?.({ status: 'ready' });
    return _classifierPipeline;
  }

  if (_classifierLoading) {
    return new Promise((resolve, reject) => {
      const check = setInterval(() => {
        if (_classifierPipeline) {
          clearInterval(check);
          resolve(_classifierPipeline);
        }
      }, 200);
      setTimeout(() => {
        clearInterval(check);
        reject(new Error('Classifier pipeline load timeout'));
      }, 180_000);
    });
  }

  _classifierLoading = true;

  const notify = (info) => _classifierCallbacks.forEach((cb) => cb(info));

  try {
    notify({ status: 'loading', model: 'classifier' });
    _classifierPipeline = await pipeline(
      'zero-shot-classification',
      'Xenova/nli-deberta-v3-small',
      {
        progress_callback: (progressInfo) => {
          notify({ status: 'progress', model: 'classifier', ...progressInfo });
        },
      }
    );
    notify({ status: 'ready', model: 'classifier' });
    return _classifierPipeline;
  } catch (err) {
    notify({ status: 'error', model: 'classifier', error: err.message });
    throw err;
  } finally {
    _classifierLoading = false;
  }
};

// ─── Public ML functions ──────────────────────────────────────────────────────

/**
 * ML-based sentiment analysis.
 * Returns the same shape as the rule-based `analyzeSentiment()` in aiService.js.
 *
 * @param {string} text
 * @param {Function} [onProgress]
 * @returns {Promise<{score: number, sentiment: string, confidence: number, mlPowered: boolean}>}
 */
export const mlAnalyzeSentiment = async (text, onProgress) => {
  if (!text?.trim()) {
    return { score: 0, sentiment: 'neutral', confidence: 0, mlPowered: true };
  }

  const pipe = await getSentimentPipeline(onProgress);
  // Truncate to 512 tokens (model limit)
  const truncated = text.slice(0, 512);
  const [result] = await pipe(truncated);

  // DistilBERT SST-2 returns POSITIVE / NEGATIVE
  const isPositive = result.label === 'POSITIVE';
  const rawScore = isPositive ? result.score : -result.score;
  const confidence = Math.round(result.score * 100);
  const sentiment =
    result.score > 0.65
      ? isPositive
        ? 'positive'
        : 'negative'
      : 'neutral';

  return {
    score: parseFloat(rawScore.toFixed(3)),
    sentiment,
    confidence,
    positiveScore: isPositive ? result.score : 1 - result.score,
    negativeScore: isPositive ? 1 - result.score : result.score,
    mlPowered: true,
    rawLabel: result.label,
  };
};

/**
 * ML-based zero-shot incident classification.
 * Returns the same shape as the rule-based `classifyIncident()`.
 *
 * @param {string} title
 * @param {string} description
 * @param {Function} [onProgress]
 * @returns {Promise<{category: string, confidence: number, mlPowered: boolean}>}
 */
export const mlClassifyIncident = async (title, description, onProgress) => {
  const text = `${title} ${description}`.trim();
  if (!text) {
    return { category: 'other', confidence: 0, alternativeCategories: [], mlPowered: true };
  }

  const pipe = await getClassifierPipeline(onProgress);
  const truncated = text.slice(0, 512);

  const result = await pipe(truncated, INCIDENT_LABELS, { multi_label: false });

  // result.labels is sorted by score descending
  const topLabel = result.labels[0];
  const topScore = result.scores[0];
  const confidence = Math.round(topScore * 100);
  const category = LABEL_TO_CATEGORY[topLabel] ?? 'other';

  const alternativeCategories = result.labels.slice(1, 4).map((lbl, i) => ({
    category: LABEL_TO_CATEGORY[lbl] ?? 'other',
    confidence: Math.round(result.scores[i + 1] * 100),
  }));

  return {
    category,
    confidence,
    alternativeCategories,
    mlPowered: true,
    rawScores: Object.fromEntries(
      result.labels.map((lbl, i) => [LABEL_TO_CATEGORY[lbl] ?? 'other', result.scores[i]])
    ),
  };
};

// ─── Warmup helper ────────────────────────────────────────────────────────────

/**
 * Pre-warm both pipelines in the background (call this at app startup).
 * Loading failures are silently swallowed — the app falls back to rule-based.
 *
 * @param {Function} [onProgress] - (info) => void  unified progress callback
 */
export const warmupMLModels = (onProgress) => {
  getSentimentPipeline(onProgress).catch(() => {});
  getClassifierPipeline(onProgress).catch(() => {});
};

export default {
  mlAnalyzeSentiment,
  mlClassifyIncident,
  warmupMLModels,
  getSentimentPipeline,
  getClassifierPipeline,
};
