/**
 * Forecast Service — TensorFlow.js powered time-series forecasting
 * Replaces the simple moving-average in predictIncidentTrends() with a
 * proper polynomial regression trained on actual historical data.
 *
 * No pre-trained model is needed: TF.js fits coefficients on-the-fly from
 * the incident dataset using gradient descent.
 */

import * as tf from '@tensorflow/tfjs';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise an array of numbers to the [0, 1] range.
 * Returns the normalised array plus the original min/max for denormalisation.
 */
const normalise = (arr) => {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min || 1;
  return {
    values: arr.map((v) => (v - min) / range),
    min,
    max,
    range,
  };
};

/** Reverse the normalisation */
const denormalise = (value, min, range) => value * range + min;

// ─── Core forecast ────────────────────────────────────────────────────────────

/**
 * Train a simple dense neural-net (two layers) on historical daily counts and
 * return N-day forward predictions with per-day confidence intervals.
 *
 * Falls back gracefully when there is not enough data.
 *
 * @param {Array<{date: string, count: number}>} dailySeries - Sorted ASC daily aggregates
 * @param {number} forecastDays - How many future days to predict (default 7)
 * @returns {Promise<{
 *   predictions: Array<{date: string, predictedCount: number, low: number, high: number, confidence: number}>,
 *   trend: string,
 *   trendPercentage: number,
 *   currentAverage: number,
 *   confidence: number,
 *   insights: Array,
 *   mlPowered: boolean
 * }>}
 */
export const predictWithTF = async (dailySeries, forecastDays = 7) => {
  if (!dailySeries || dailySeries.length < 7) {
    return {
      predictions: [],
      trend: 'insufficient_data',
      trendPercentage: 0,
      currentAverage: 0,
      confidence: 0,
      insights: [],
      mlPowered: true,
    };
  }

  const counts = dailySeries.map((d) => d.count);
  const indices = counts.map((_, i) => i);

  // Normalise inputs & outputs
  const xNorm = normalise(indices);
  const yNorm = normalise(counts);

  const xsTensor = tf.tensor2d(xNorm.values, [xNorm.values.length, 1]);
  const ysTensor = tf.tensor2d(yNorm.values, [yNorm.values.length, 1]);

  // ── Build model ────────────────────────────────────────────────────────────
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [1], units: 16, activation: 'relu' }),
      tf.layers.dense({ units: 8, activation: 'relu' }),
      tf.layers.dense({ units: 1 }),
    ],
  });

  model.compile({ optimizer: tf.train.adam(0.01), loss: 'meanSquaredError' });

  // Train silently
  await model.fit(xsTensor, ysTensor, {
    epochs: 200,
    batchSize: Math.min(32, counts.length),
    verbose: 0,
    shuffle: true,
  });

  // ── Generate predictions ───────────────────────────────────────────────────
  const n = counts.length;
  const futureIndices = Array.from({ length: forecastDays }, (_, i) => n + i);
  const futureNorm = futureIndices.map((idx) => (idx - xNorm.min) / xNorm.range);

  const futureXs = tf.tensor2d(futureNorm, [forecastDays, 1]);
  const rawPreds = model.predict(futureXs);
  const predsArray = await rawPreds.data();

  // ── Monte-Carlo dropout for confidence intervals (simple ±σ via 20 passes) -
  // (Not using MC-dropout here; use std of recent residuals instead)
  const trainPreds = model.predict(xsTensor);
  const trainPredsArray = await trainPreds.data();
  const residuals = trainPredsArray.map(
    (p, i) => Math.abs(denormalise(p, yNorm.min, yNorm.range) - counts[i])
  );
  const sigma = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / residuals.length);

  // ── Build output ───────────────────────────────────────────────────────────
  const predictions = predsArray.map((rawVal, i) => {
    const rawCount = denormalise(rawVal, yNorm.min, yNorm.range);
    const predictedCount = Math.max(0, Math.round(rawCount));
    const low = Math.max(0, Math.round(rawCount - sigma));
    const high = Math.max(predictedCount, Math.round(rawCount + sigma));
    const confDecay = Math.max(20, 90 - i * 8); // confidence drops with horizon

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + i + 1);

    return {
      date: tomorrow.toISOString().split('T')[0],
      predictedCount,
      low,
      high,
      confidence: confDecay,
    };
  });

  // ── Compute trend from recent vs earlier period ────────────────────────────
  const halfWindow = Math.floor(Math.min(counts.length, 14) / 2);
  const firstHalf = counts.slice(0, halfWindow);
  const secondHalf = counts.slice(-halfWindow);
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const trendPct = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  let trend;
  if (trendPct > 15) trend = 'increasing_significantly';
  else if (trendPct > 5) trend = 'increasing';
  else if (trendPct < -15) trend = 'decreasing_significantly';
  else if (trendPct < -5) trend = 'decreasing';
  else trend = 'stable';

  const currentAverage = Math.round(
    counts.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, counts.length)
  );
  const modelConfidence = Math.min(85, Math.round(50 + counts.length * 1.5));

  // ── Clean up tensors ───────────────────────────────────────────────────────
  tf.dispose([xsTensor, ysTensor, futureXs, rawPreds, trainPreds]);
  model.dispose();

  return {
    predictions,
    trend,
    trendPercentage: Math.round(trendPct),
    currentAverage,
    confidence: modelConfidence,
    insights: generateForecastInsights(trend, trendPct, currentAverage),
    mlPowered: true,
  };
};

// ─── Anomaly detection ────────────────────────────────────────────────────────

/**
 * Detect anomalous spikes in daily incident counts using a rolling z-score.
 * Days with |z| > threshold are flagged as anomalies.
 *
 * @param {Array<{date: string, count: number}>} dailySeries
 * @param {number} [zThreshold=2] - Standard deviation threshold
 * @returns {{anomalies: Array<{date: string, count: number, zScore: number}>, mean: number, std: number}}
 */
export const detectAnomalies = (dailySeries, zThreshold = 2) => {
  if (!dailySeries || dailySeries.length < 5) return { anomalies: [], mean: 0, std: 0 };

  const counts = dailySeries.map((d) => d.count);
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((s, c) => s + Math.pow(c - mean, 2), 0) / counts.length;
  const std = Math.sqrt(variance) || 1;

  const anomalies = dailySeries
    .map((d) => ({ ...d, zScore: (d.count - mean) / std }))
    .filter((d) => Math.abs(d.zScore) > zThreshold);

  return { anomalies, mean: Math.round(mean * 10) / 10, std: Math.round(std * 10) / 10 };
};

// ─── Weekly pattern analysis ──────────────────────────────────────────────────

/**
 * Aggregate incidents by day-of-week to surface weekly patterns.
 *
 * @param {Array<{date: string, count: number}>} dailySeries
 * @returns {Array<{day: string, avgCount: number, percentage: number}>}
 */
export const analyseWeeklyPattern = (dailySeries) => {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const totals = Array(7).fill(0);
  const occurrences = Array(7).fill(0);

  dailySeries.forEach(({ date, count }) => {
    const dow = new Date(date).getDay();
    totals[dow] += count;
    occurrences[dow]++;
  });

  const avgCounts = totals.map((t, i) => (occurrences[i] > 0 ? t / occurrences[i] : 0));
  const maxAvg = Math.max(...avgCounts) || 1;

  return DAYS.map((day, i) => ({
    day,
    avgCount: Math.round(avgCounts[i] * 10) / 10,
    percentage: Math.round((avgCounts[i] / maxAvg) * 100),
  }));
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

const generateForecastInsights = (trend, percentage, average) => {
  const insights = [];
  const abs = Math.abs(percentage).toFixed(1);

  if (trend === 'increasing_significantly') {
    insights.push({
      type: 'warning',
      message: `Incident rate rising rapidly (+${abs}%) — TF.js model`,
      recommendation: 'Increase patrol frequency and prepare additional resources',
    });
  } else if (trend === 'increasing') {
    insights.push({
      type: 'info',
      message: `Moderate increase detected (+${abs}%) — TF.js model`,
      recommendation: 'Monitor closely and adjust response capacity if needed',
    });
  } else if (trend === 'decreasing_significantly') {
    insights.push({
      type: 'positive',
      message: `Incident rate dropping significantly (-${abs}%) — TF.js model`,
      recommendation: 'Current strategies are effective — maintain current approach',
    });
  } else if (trend === 'decreasing') {
    insights.push({
      type: 'positive',
      message: `Incident rate improving (-${abs}%) — TF.js model`,
      recommendation: 'Positive trend — continue monitoring',
    });
  } else {
    insights.push({
      type: 'neutral',
      message: 'Incident rate is stable — TF.js model',
      recommendation: 'Maintain current patrol and response strategies',
    });
  }

  if (average > 10) {
    insights.push({
      type: 'info',
      message: `High activity: averaging ${average} incidents/day`,
      recommendation: 'Consider expanding team capacity during peak periods',
    });
  }

  return insights;
};

/**
 * Utility: aggregate raw incidents into a sorted daily time-series.
 * Use this before passing incidents to predictWithTF().
 *
 * @param {Array} incidents - Raw incident objects with `createdAt`
 * @returns {Array<{date: string, count: number}>}
 */
export const buildDailySeries = (incidents) => {
  const map = {};
  incidents.forEach((inc) => {
    const date = new Date(inc.createdAt).toISOString().split('T')[0];
    map[date] = (map[date] || 0) + 1;
  });
  return Object.entries(map)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export default {
  predictWithTF,
  detectAnomalies,
  analyseWeeklyPattern,
  buildDailySeries,
};
