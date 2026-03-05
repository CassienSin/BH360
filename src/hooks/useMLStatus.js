/**
 * useMLStatus — React hook for tracking Transformers.js model load progress.
 *
 * Usage:
 *   const { sentimentReady, classifierReady, loadingModel, progress } = useMLStatus();
 */

import { useState, useEffect, useCallback } from 'react';
import { getSentimentPipeline, getClassifierPipeline } from '../services/mlService';

/**
 * @typedef {Object} MLStatus
 * @property {boolean} sentimentReady     - Sentiment model fully loaded
 * @property {boolean} classifierReady    - Classifier model fully loaded
 * @property {boolean} anyReady           - At least one model ready
 * @property {string|null} loadingModel   - Which model is currently loading ('sentiment'|'classifier'|null)
 * @property {number} sentimentProgress   - 0–100 download progress for sentiment model
 * @property {number} classifierProgress  - 0–100 download progress for classifier model
 * @property {string|null} error          - Error message if a model failed to load
 * @property {Function} warmup            - Call to start loading both models
 */

/**
 * @returns {MLStatus}
 */
const useMLStatus = () => {
  const [sentimentReady, setSentimentReady] = useState(false);
  const [classifierReady, setClassifierReady] = useState(false);
  const [loadingModel, setLoadingModel] = useState(null);
  const [sentimentProgress, setSentimentProgress] = useState(0);
  const [classifierProgress, setClassifierProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleProgress = useCallback((info) => {
    const model = info.model ?? 'sentiment'; // default fallback

    if (info.status === 'loading') {
      setLoadingModel(model);
    }

    if (info.status === 'progress' && typeof info.progress === 'number') {
      // info.progress is 0–100 from Transformers.js
      if (model === 'sentiment') {
        setSentimentProgress(Math.round(info.progress));
      } else {
        setClassifierProgress(Math.round(info.progress));
      }
    }

    if (info.status === 'ready') {
      if (model === 'sentiment') {
        setSentimentReady(true);
        setSentimentProgress(100);
      } else {
        setClassifierReady(true);
        setClassifierProgress(100);
      }
      setLoadingModel((prev) => (prev === model ? null : prev));
    }

    if (info.status === 'error') {
      setError(`${model} model failed: ${info.error}`);
      setLoadingModel(null);
    }
  }, []);

  /** Trigger warm-up of both models */
  const warmup = useCallback(() => {
    setError(null);
    getSentimentPipeline(handleProgress).catch((err) => {
      setError(`Sentiment model error: ${err.message}`);
    });
    getClassifierPipeline(handleProgress).catch((err) => {
      setError(`Classifier model error: ${err.message}`);
    });
  }, [handleProgress]);

  // Auto-warmup on mount
  useEffect(() => {
    warmup();
  }, [warmup]);

  return {
    sentimentReady,
    classifierReady,
    anyReady: sentimentReady || classifierReady,
    loadingModel,
    sentimentProgress,
    classifierProgress,
    error,
    warmup,
  };
};

export default useMLStatus;
