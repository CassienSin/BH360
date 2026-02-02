/**
 * Enhanced AI Service for Barangay Management System
 * Provides advanced intelligent features for incident management and Tanod performance
 * Version 2.0 - Comprehensive AI Improvements
 */

// ==================== SENTIMENT ANALYSIS ====================

/**
 * Analyze sentiment of incident description
 * @param {string} text - Text to analyze
 * @returns {Object} Sentiment score and classification
 */
export const analyzeSentiment = (text) => {
  if (!text) return { score: 0, sentiment: 'neutral', confidence: 0 };

  const lowerText = text.toLowerCase();

  // Positive sentiment words
  const positiveWords = [
    'thank', 'thanks', 'appreciate', 'grateful', 'good', 'great', 'excellent',
    'wonderful', 'helpful', 'resolved', 'fixed', 'better', 'improvement',
    'satisfied', 'happy', 'pleased', 'safe', 'secure', 'peaceful'
  ];

  // Negative sentiment words
  const negativeWords = [
    'urgent', 'emergency', 'critical', 'severe', 'serious', 'danger', 'threat',
    'violence', 'attack', 'assault', 'robbery', 'theft', 'crime', 'scared',
    'afraid', 'terrified', 'angry', 'frustrated', 'upset', 'worried', 'concern',
    'problem', 'issue', 'complaint', 'terrible', 'horrible', 'worst', 'bad',
    'injured', 'hurt', 'pain', 'blood', 'weapon', 'fight', 'aggressive',
    'loud', 'disturb', 'annoy', 'harass', 'intimidate', 'bully'
  ];

  // Intensifiers
  const intensifiers = [
    'very', 'extremely', 'highly', 'severely', 'critically', 'urgently',
    'immediately', 'desperately', 'really', 'absolutely', 'totally'
  ];

  let positiveScore = 0;
  let negativeScore = 0;
  let intensifierMultiplier = 1;

  // Split text into words
  const words = lowerText.split(/\s+/);

  words.forEach((word, index) => {
    // Check for intensifiers
    if (intensifiers.includes(word)) {
      intensifierMultiplier = 1.5;
      return;
    }

    // Check positive words
    if (positiveWords.includes(word)) {
      positiveScore += (1 * intensifierMultiplier);
    }

    // Check negative words
    if (negativeWords.includes(word)) {
      negativeScore += (1 * intensifierMultiplier);
    }

    // Reset multiplier after next word
    if (intensifierMultiplier > 1) {
      intensifierMultiplier = 1;
    }
  });

  // Calculate overall sentiment score (-1 to 1)
  const totalScore = positiveScore + negativeScore;
  const sentimentScore = totalScore > 0 
    ? (positiveScore - negativeScore) / totalScore
    : 0;

  // Determine sentiment classification
  let sentiment;
  if (sentimentScore > 0.2) sentiment = 'positive';
  else if (sentimentScore < -0.2) sentiment = 'negative';
  else sentiment = 'neutral';

  // Calculate confidence (0-100%)
  const confidence = Math.min(100, Math.round(Math.abs(sentimentScore) * 100));

  return {
    score: sentimentScore,
    sentiment,
    confidence,
    positiveScore,
    negativeScore
  };
};

// ==================== ENHANCED INCIDENT CLASSIFICATION ====================

/**
 * Enhanced keyword patterns with weighted scoring
 */
const enhancedCategoryKeywords = {
  crime: {
    primary: ['theft', 'robbery', 'steal', 'burglar', 'assault', 'attack', 'violence', 'weapon', 'gun', 'knife', 'drug', 'illegal'],
    secondary: ['suspicious', 'trespassing', 'vandal', 'damage', 'harassment', 'threat', 'criminal', 'gang', 'mugging', 'break-in'],
    weight: 2.0
  },
  fire: {
    primary: ['fire', 'burning', 'smoke', 'flame', 'blaze', 'inferno', 'combustion', 'explosion'],
    secondary: ['heat', 'ash', 'ember', 'wildfire', 'arson', 'burn', 'charred', 'evacuate', 'firefighter'],
    weight: 2.0
  },
  health: {
    primary: ['medical', 'emergency', 'ambulance', 'injured', 'bleeding', 'unconscious', 'fever', 'covid', 'disease'],
    secondary: ['sick', 'injury', 'hospital', 'health', 'sanitation', 'hygiene', 'contamination', 'poison', 'outbreak'],
    weight: 1.8
  },
  hazard: {
    primary: ['flood', 'electrical', 'danger', 'unsafe', 'collapse', 'gas leak', 'landslide'],
    secondary: ['hazard', 'broken', 'damage', 'pothole', 'leak', 'wire', 'tree', 'fallen', 'crack', 'slippery', 'blocked', 'stray animal'],
    weight: 1.6
  },
  dispute: {
    primary: ['fight', 'argument', 'conflict', 'confrontation', 'violence', 'assault'],
    secondary: ['dispute', 'disagreement', 'quarrel', 'neighbor', 'boundary', 'property', 'land', 'parking', 'complaint', 'tension'],
    weight: 1.4
  },
  noise: {
    primary: ['loud', 'noise', 'shouting', 'yelling', 'screaming', 'karaoke', 'videoke'],
    secondary: ['music', 'sound', 'party', 'disturbance', 'barking', 'dog', 'speaker', 'volume', 'construction', 'drilling'],
    weight: 1.2
  },
  utility: {
    primary: ['outage', 'blackout', 'no water', 'no electricity', 'power cut', 'sewage'],
    secondary: ['water', 'electricity', 'power', 'internet', 'cable', 'plumbing', 'drainage', 'maintenance', 'repair'],
    weight: 1.0
  }
};

/**
 * Enhanced incident classification with multi-factor analysis
 * @param {string} title - Incident title
 * @param {string} description - Incident description
 * @param {Object} metadata - Additional metadata (location, time, etc.)
 * @returns {Object} Enhanced classification result
 */
export const classifyIncident = (title, description, metadata = {}) => {
  const text = `${title} ${description}`.toLowerCase();
  const scores = {};

  // Sentiment analysis
  const sentiment = analyzeSentiment(text);

  // Calculate weighted scores for each category
  Object.entries(enhancedCategoryKeywords).forEach(([category, data]) => {
    let score = 0;
    
    // Primary keywords (higher weight)
    data.primary.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length * 2 * data.weight;
      }
    });

    // Secondary keywords (standard weight)
    data.secondary.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length * data.weight;
      }
    });

    // Boost score based on negative sentiment for serious categories
    if (['crime', 'fire', 'health', 'hazard'].includes(category) && sentiment.sentiment === 'negative') {
      score *= (1 + sentiment.confidence / 200); // 0-50% boost
    }

    scores[category] = score;
  });

  // Find category with highest score
  const sortedCategories = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);

  const topCategory = sortedCategories[0];
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  
  // Calculate confidence (0-100%)
  const confidence = totalScore > 0 
    ? Math.min(100, Math.round((topCategory[1] / totalScore) * 100))
    : 0;

  // Get alternative categories
  const alternativeCategories = sortedCategories
    .filter(([, score]) => score > 0)
    .slice(1, 4)
    .map(([category, score]) => ({
      category,
      confidence: Math.round((score / totalScore) * 100)
    }));

  return {
    category: topCategory[1] > 0 ? topCategory[0] : 'other',
    confidence,
    sentiment,
    alternativeCategories,
    scores,
    metadata: {
      hasUrgentKeywords: /urgent|emergency|critical|asap|immediate/i.test(text),
      hasLocationMention: /street|road|avenue|corner|near|beside/i.test(text),
      wordCount: text.split(/\s+/).length
    }
  };
};

// ==================== ADVANCED PRIORITY SCORING ====================

/**
 * Calculate comprehensive priority score with multiple factors
 * @param {Object} incident - Incident object
 * @param {Object} context - Contextual data (location history, time patterns, etc.)
 * @returns {Object} Priority analysis with detailed breakdown
 */
export const calculatePriorityScore = (incident, context = {}) => {
  let score = 0;
  const factors = {};

  // 1. Base score by category (0-30 points)
  const categoryScores = {
    crime: 30,
    fire: 30,
    health: 28,
    hazard: 25,
    dispute: 18,
    noise: 12,
    utility: 10,
    other: 5
  };
  const categoryScore = categoryScores[incident.category] || 5;
  score += categoryScore;
  factors.category = categoryScore;

  // 2. Sentiment-based urgency (0-20 points)
  const text = `${incident.title} ${incident.description}`.toLowerCase();
  const sentiment = analyzeSentiment(text);
  const sentimentScore = sentiment.sentiment === 'negative' 
    ? Math.round(sentiment.confidence / 5) // 0-20 points
    : 0;
  score += sentimentScore;
  factors.sentiment = sentimentScore;

  // 3. Urgency keywords (0-15 points)
  const urgencyKeywords = [
    { keyword: 'emergency', weight: 15 },
    { keyword: 'critical', weight: 12 },
    { keyword: 'urgent', weight: 10 },
    { keyword: 'immediate', weight: 10 },
    { keyword: 'asap', weight: 8 },
    { keyword: 'severe', weight: 8 },
    { keyword: 'serious', weight: 7 },
    { keyword: 'danger', weight: 10 },
    { keyword: 'threatening', weight: 9 },
    { keyword: 'violence', weight: 12 },
    { keyword: 'weapon', weight: 13 },
    { keyword: 'injured', weight: 11 },
    { keyword: 'bleeding', weight: 12 },
    { keyword: 'fire', weight: 14 },
    { keyword: 'flood', weight: 11 },
    { keyword: 'help', weight: 6 },
    { keyword: 'ambulance', weight: 13 }
  ];

  let urgencyScore = 0;
  urgencyKeywords.forEach(({ keyword, weight }) => {
    if (text.includes(keyword)) {
      urgencyScore += weight;
    }
  });
  urgencyScore = Math.min(15, urgencyScore); // Cap at 15
  score += urgencyScore;
  factors.urgency = urgencyScore;

  // 4. Time of day factor (0-12 points)
  const hour = new Date(incident.createdAt || Date.now()).getHours();
  let timeScore = 0;
  if (hour >= 22 || hour <= 5) {
    timeScore = 12; // Late night (10pm - 5am)
  } else if (hour >= 18 || hour <= 7) {
    timeScore = 8; // Early morning/Evening
  } else if (hour >= 12 && hour <= 14) {
    timeScore = 5; // Lunch time
  } else {
    timeScore = 3; // Regular hours
  }
  score += timeScore;
  factors.timeOfDay = timeScore;

  // 5. Location risk factor (0-15 points)
  const location = (incident.location || '').toLowerCase();
  const highRiskLocations = {
    school: 15,
    hospital: 15,
    market: 12,
    plaza: 10,
    main: 10,
    center: 8,
    terminal: 10,
    park: 8,
    church: 8
  };
  
  let locationScore = 0;
  Object.entries(highRiskLocations).forEach(([place, points]) => {
    if (location.includes(place)) {
      locationScore = Math.max(locationScore, points);
    }
  });

  // Add context-based location scoring if available
  if (context.locationHistory && context.locationHistory[incident.location]) {
    const history = context.locationHistory[incident.location];
    if (history.incidentCount > 5) {
      locationScore += 3; // Hotspot bonus
    }
  }

  score += locationScore;
  factors.location = locationScore;

  // 6. Historical pattern factor (0-8 points)
  let patternScore = 0;
  if (context.recentIncidents) {
    const similarRecent = context.recentIncidents.filter(inc => 
      inc.category === incident.category && 
      inc.location === incident.location
    ).length;
    
    if (similarRecent >= 3) {
      patternScore = 8; // Pattern detected
    } else if (similarRecent >= 2) {
      patternScore = 5;
    } else if (similarRecent >= 1) {
      patternScore = 3;
    }
  }
  score += patternScore;
  factors.pattern = patternScore;

  // Cap at 100
  score = Math.min(100, Math.round(score));

  // Determine priority level
  let priority;
  let priorityLabel;
  if (score >= 75) {
    priority = 'emergency';
    priorityLabel = 'Critical Emergency';
  } else if (score >= 50) {
    priority = 'urgent';
    priorityLabel = 'High Priority';
  } else if (score >= 30) {
    priority = 'minor';
    priorityLabel = 'Medium Priority';
  } else {
    priority = 'minor';
    priorityLabel = 'Low Priority';
  }

  return {
    score,
    priority,
    priorityLabel,
    factors,
    recommendations: generatePriorityRecommendations(score, factors, incident),
    estimatedResponseTime: calculateEstimatedResponseTime(score, incident.category)
  };
};

/**
 * Generate priority-based recommendations
 */
const generatePriorityRecommendations = (score, factors, incident) => {
  const recommendations = [];

  if (score >= 75) {
    recommendations.push('Immediate dispatch required - Highest priority');
    recommendations.push('Notify all available Tanod members');
    if (['crime', 'health'].includes(incident.category)) {
      recommendations.push('Alert emergency services (Police/Medical)');
    }
    if (incident.category === 'fire') {
      recommendations.push('🔥 ALERT: Call Bureau of Fire Protection (BFP) and evacuate immediately');
    }
  } else if (score >= 50) {
    recommendations.push('Dispatch within 10 minutes');
    recommendations.push('Assign experienced Tanod member');
  } else if (score >= 30) {
    recommendations.push('Address within 30 minutes');
    recommendations.push('Monitor for escalation');
  } else {
    recommendations.push('Can be scheduled for next patrol');
    recommendations.push('No immediate action required');
  }

  if (factors.pattern >= 5) {
    recommendations.push('⚠️ Pattern detected - Consider preventive measures');
  }

  if (factors.location >= 10) {
    recommendations.push('🎯 High-risk location - Extra caution advised');
  }

  return recommendations;
};

/**
 * Calculate estimated response time based on priority
 */
const calculateEstimatedResponseTime = (score, category) => {
  if (score >= 75) {
    return { minutes: 5, label: '5 minutes', urgency: 'immediate' };
  } else if (score >= 50) {
    return { minutes: 15, label: '10-15 minutes', urgency: 'urgent' };
  } else if (score >= 30) {
    return { minutes: 30, label: '20-30 minutes', urgency: 'moderate' };
  } else {
    return { minutes: 60, label: '30-60 minutes', urgency: 'routine' };
  }
};

// ==================== PREDICTIVE ANALYTICS ====================

/**
 * Predict future incident trends based on historical data
 * @param {Array} incidents - Historical incidents
 * @param {Object} options - Prediction options
 * @returns {Object} Prediction results
 */
export const predictIncidentTrends = (incidents, options = {}) => {
  const { forecastDays = 7 } = options;

  if (!incidents || incidents.length < 7) {
    return {
      predictions: [],
      confidence: 0,
      trend: 'insufficient_data'
    };
  }

  // Group incidents by date
  const incidentsByDate = {};
  incidents.forEach(incident => {
    const date = new Date(incident.createdAt).toISOString().split('T')[0];
    incidentsByDate[date] = (incidentsByDate[date] || 0) + 1;
  });

  // Calculate moving average
  const dates = Object.keys(incidentsByDate).sort();
  const counts = dates.map(date => incidentsByDate[date]);
  
  // Simple moving average (last 7 days)
  const windowSize = Math.min(7, counts.length);
  const recentCounts = counts.slice(-windowSize);
  const average = recentCounts.reduce((a, b) => a + b, 0) / recentCounts.length;

  // Calculate trend
  const firstHalf = recentCounts.slice(0, Math.floor(windowSize / 2));
  const secondHalf = recentCounts.slice(Math.floor(windowSize / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const trendValue = secondAvg - firstAvg;
  const trendPercentage = firstAvg > 0 ? (trendValue / firstAvg) * 100 : 0;

  let trend;
  if (trendPercentage > 15) trend = 'increasing_significantly';
  else if (trendPercentage > 5) trend = 'increasing';
  else if (trendPercentage < -15) trend = 'decreasing_significantly';
  else if (trendPercentage < -5) trend = 'decreasing';
  else trend = 'stable';

  // Generate predictions for next N days
  const predictions = [];
  let predictedValue = average;
  const dailyChange = trendValue / windowSize; // Average daily change

  for (let i = 1; i <= forecastDays; i++) {
    predictedValue += dailyChange;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + i);
    
    predictions.push({
      date: tomorrow.toISOString().split('T')[0],
      predictedCount: Math.max(0, Math.round(predictedValue)),
      confidence: Math.max(20, 90 - (i * 8)) // Confidence decreases over time
    });
  }

  return {
    predictions,
    currentAverage: Math.round(average),
    trend,
    trendPercentage: Math.round(trendPercentage),
    confidence: Math.min(85, windowSize * 10), // More data = higher confidence
    insights: generateTrendInsights(trend, trendPercentage, average)
  };
};

/**
 * Generate insights from trend analysis
 */
const generateTrendInsights = (trend, percentage, average) => {
  const insights = [];

  if (trend === 'increasing_significantly') {
    insights.push({
      type: 'warning',
      message: `Incident rate is rising rapidly (+${Math.abs(percentage).toFixed(1)}%)`,
      recommendation: 'Increase patrol frequency and prepare additional resources'
    });
  } else if (trend === 'increasing') {
    insights.push({
      type: 'info',
      message: `Moderate increase in incidents detected (+${Math.abs(percentage).toFixed(1)}%)`,
      recommendation: 'Monitor closely and adjust response capacity if needed'
    });
  } else if (trend === 'decreasing_significantly') {
    insights.push({
      type: 'positive',
      message: `Incident rate dropping significantly (-${Math.abs(percentage).toFixed(1)}%)`,
      recommendation: 'Current strategies are effective - maintain current approach'
    });
  } else if (trend === 'decreasing') {
    insights.push({
      type: 'positive',
      message: `Incident rate showing improvement (-${Math.abs(percentage).toFixed(1)}%)`,
      recommendation: 'Positive trend - continue monitoring'
    });
  } else {
    insights.push({
      type: 'neutral',
      message: 'Incident rate is stable',
      recommendation: 'Maintain current patrol and response strategies'
    });
  }

  if (average > 10) {
    insights.push({
      type: 'info',
      message: `High activity level: averaging ${average.toFixed(1)} incidents per day`,
      recommendation: 'Consider expanding team capacity during peak periods'
    });
  }

  return insights;
};

/**
 * Predict hotspot locations based on patterns
 * @param {Array} incidents - Historical incidents
 * @returns {Object} Hotspot predictions
 */
export const predictHotspots = (incidents) => {
  if (!incidents || incidents.length === 0) {
    return { hotspots: [], riskMap: {} };
  }

  // Calculate location incident frequency
  const locationData = {};
  incidents.forEach(incident => {
    const location = incident.location || 'Unknown';
    if (!locationData[location]) {
      locationData[location] = {
        count: 0,
        categories: {},
        hours: Array(24).fill(0),
        recentIncidents: []
      };
    }
    
    locationData[location].count++;
    locationData[location].categories[incident.category] = 
      (locationData[location].categories[incident.category] || 0) + 1;
    
    const hour = new Date(incident.createdAt).getHours();
    locationData[location].hours[hour]++;
    
    // Track recent incidents (last 30 days)
    const daysSince = (Date.now() - new Date(incident.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSince <= 30) {
      locationData[location].recentIncidents.push(incident);
    }
  });

  // Calculate risk scores for each location
  const hotspots = Object.entries(locationData)
    .map(([location, data]) => {
      // Base score from incident count
      let riskScore = Math.min(50, data.count * 2);

      // Recent activity multiplier
      const recentMultiplier = data.recentIncidents.length / data.count;
      riskScore *= (0.5 + recentMultiplier); // 50% base + up to 100% from recent activity

  // Serious incident category boost
      const seriousCategories = ['crime', 'fire', 'health', 'hazard'];
      const seriousCount = seriousCategories.reduce((sum, cat) => 
        sum + (data.categories[cat] || 0), 0
      );
      const seriousRatio = seriousCount / data.count;
      riskScore += seriousRatio * 20; // Up to 20 points for serious incidents

      // Peak hour concentration
      const maxHourCount = Math.max(...data.hours);
      const hourConcentration = maxHourCount / data.count;
      if (hourConcentration > 0.3) {
        riskScore += 10; // Bonus for concentrated timing
      }

      // Determine risk level
      let riskLevel;
      if (riskScore >= 70) riskLevel = 'critical';
      else if (riskScore >= 50) riskLevel = 'high';
      else if (riskScore >= 30) riskLevel = 'medium';
      else riskLevel = 'low';

      // Find peak hour
      const peakHour = data.hours.indexOf(Math.max(...data.hours));
      const peakCategory = Object.entries(data.categories)
        .sort(([, a], [, b]) => b - a)[0][0];

      return {
        location,
        riskScore: Math.round(riskScore),
        riskLevel,
        totalIncidents: data.count,
        recentIncidents: data.recentIncidents.length,
        trendingUp: recentMultiplier > 0.5,
        peakHour,
        peakCategory,
        categories: data.categories,
        recommendations: generateHotspotRecommendations(riskLevel, peakCategory, peakHour)
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);

  return {
    hotspots,
    criticalCount: hotspots.filter(h => h.riskLevel === 'critical').length,
    highRiskCount: hotspots.filter(h => h.riskLevel === 'high').length,
    insights: generateHotspotInsights(hotspots)
  };
};

/**
 * Generate hotspot-specific recommendations
 */
const generateHotspotRecommendations = (riskLevel, category, peakHour) => {
  const recommendations = [];

  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('Increase patrol frequency in this area');
    recommendations.push(`Deploy Tanod especially around ${peakHour}:00`);
  }

  if (category === 'crime') {
    recommendations.push('Install additional security measures (lighting, cameras)');
    recommendations.push('Coordinate with local police');
  } else if (category === 'fire') {
    recommendations.push('Conduct fire safety inspection and awareness campaign');
    recommendations.push('Ensure fire extinguishers and emergency exits are accessible');
    recommendations.push('Coordinate with Bureau of Fire Protection (BFP)');
  } else if (category === 'noise') {
    recommendations.push('Conduct community awareness campaign');
    recommendations.push('Issue warnings to repeat offenders');
  } else if (category === 'hazard') {
    recommendations.push('Conduct infrastructure inspection');
    recommendations.push('Report to municipal engineering office');
  }

  return recommendations;
};

/**
 * Generate overall hotspot insights
 */
const generateHotspotInsights = (hotspots) => {
  const insights = [];

  if (hotspots.length === 0) {
    return [{
      type: 'neutral',
      message: 'No significant hotspots detected',
      recommendation: 'Continue regular monitoring'
    }];
  }

  const critical = hotspots.filter(h => h.riskLevel === 'critical');
  if (critical.length > 0) {
    insights.push({
      type: 'critical',
      message: `${critical.length} critical risk location(s) identified`,
      recommendation: 'Immediate action required - prioritize resource allocation'
    });
  }

  const trending = hotspots.filter(h => h.trendingUp && h.riskScore >= 50);
  if (trending.length > 0) {
    insights.push({
      type: 'warning',
      message: `${trending.length} location(s) showing increasing incident rates`,
      recommendation: 'Deploy preventive measures before situations escalate'
    });
  }

  return insights;
};

// ==================== SMART TANOD ASSIGNMENT ====================

/**
 * Suggest best Tanod member for an incident using AI matching
 * @param {Object} incident - Incident to assign
 * @param {Array} tanodMembers - Available Tanod members
 * @param {Object} context - Performance data and current assignments
 * @returns {Object} Assignment recommendations
 */
export const suggestTanodAssignment = (incident, tanodMembers, context = {}) => {
  if (!tanodMembers || tanodMembers.length === 0) {
    return {
      recommendations: [],
      noAvailableMembers: true
    };
  }

  const availableMembers = tanodMembers.filter(t => 
    t.status === 'active' && 
    t.currentShift !== 'off'
  );

  if (availableMembers.length === 0) {
    return {
      recommendations: [],
      noAvailableMembers: true,
      offDutyCount: tanodMembers.filter(t => t.currentShift === 'off').length
    };
  }

  // Score each Tanod member
  const scoredMembers = availableMembers.map(tanod => {
    let score = 0;
    const factors = {};

    // 1. Location proximity (0-30 points)
    const assignedAreas = tanod.assignedAreas || [];
    const incidentLocation = incident.location || '';
    const locationMatch = assignedAreas.some(area => 
      incidentLocation.toLowerCase().includes(area.toLowerCase())
    );
    const locationScore = locationMatch ? 30 : 5;
    score += locationScore;
    factors.location = locationScore;

    // 2. Category expertise (0-25 points)
    const qualifications = tanod.qualifications || [];
    const categoryMap = {
      crime: ['security', 'patrol', 'law enforcement'],
      fire: ['emergency response', 'fire safety', 'rescue', 'first aid'],
      health: ['first aid', 'medical', 'health'],
      hazard: ['emergency response', 'rescue'],
      dispute: ['mediation', 'conflict resolution'],
      noise: ['patrol', 'community'],
      utility: ['maintenance', 'technical']
    };
    
    const relevantQuals = categoryMap[incident.category] || [];
    const expertiseScore = relevantQuals.some(qual => 
      qualifications.some(q => q.toLowerCase().includes(qual))
    ) ? 25 : 10;
    score += expertiseScore;
    factors.expertise = expertiseScore;

    // 3. Performance rating (0-20 points)
    const rating = tanod.rating || 3;
    const ratingScore = (rating / 5) * 20;
    score += ratingScore;
    factors.performance = ratingScore;

    // 4. Current workload (0-15 points)
    const currentAssignments = context.currentAssignments || [];
    const tanodAssignments = currentAssignments.filter(a => a.tanodId === tanod.id);
    const workloadScore = Math.max(0, 15 - (tanodAssignments.length * 5));
    score += workloadScore;
    factors.workload = workloadScore;

    // 5. Recent response time (0-10 points)
    const performance = context.performanceData?.[tanod.id];
    if (performance) {
      const avgResponseTime = performance.avgResponseTime || 30;
      const responseScore = Math.max(0, 10 - (avgResponseTime / 6)); // Faster = better
      score += responseScore;
      factors.responseTime = responseScore;
    }

    return {
      tanod,
      score: Math.round(score),
      factors,
      matchReason: generateMatchReason(factors, tanod, incident)
    };
  });

  // Sort by score (highest first)
  const recommendations = scoredMembers
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Top 5 recommendations
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      confidence: Math.min(100, item.score)
    }));

  return {
    recommendations,
    topChoice: recommendations[0],
    insights: generateAssignmentInsights(recommendations, incident)
  };
};

/**
 * Generate match reason for assignment
 */
const generateMatchReason = (factors, tanod, incident) => {
  const reasons = [];

  if (factors.location >= 25) {
    reasons.push('Assigned to this area');
  }

  if (factors.expertise >= 20) {
    reasons.push(`Qualified for ${incident.category} incidents`);
  }

  if (factors.performance >= 16) {
    reasons.push('High performance rating');
  }

  if (factors.workload >= 12) {
    reasons.push('Currently available');
  }

  if (factors.responseTime >= 8) {
    reasons.push('Fast response time');
  }

  return reasons.length > 0 ? reasons.join(' • ') : 'Available for assignment';
};

/**
 * Generate assignment insights
 */
const generateAssignmentInsights = (recommendations, incident) => {
  const insights = [];

  if (recommendations.length === 0) {
    insights.push({
      type: 'warning',
      message: 'No suitable Tanod members available',
      recommendation: 'Consider calling in off-duty personnel'
    });
    return insights;
  }

  const topScore = recommendations[0].score;
  if (topScore >= 80) {
    insights.push({
      type: 'success',
      message: 'Excellent match found for this incident',
      recommendation: `Assign to ${recommendations[0].tanod.fullName} immediately`
    });
  } else if (topScore >= 60) {
    insights.push({
      type: 'info',
      message: 'Good match available',
      recommendation: `${recommendations[0].tanod.fullName} is suitable for this assignment`
    });
  } else {
    insights.push({
      type: 'warning',
      message: 'No ideal match found',
      recommendation: 'Any available Tanod can respond, but monitor closely'
    });
  }

  if (recommendations.length >= 3) {
    insights.push({
      type: 'info',
      message: `${recommendations.length} members available`,
      recommendation: 'Multiple response options available'
    });
  }

  return insights;
};

// ==================== ENHANCED TREND ANALYSIS ====================

/**
 * Comprehensive trend analysis with predictions
 * @param {Array} incidents - Array of incidents
 * @returns {Object} Enhanced trend analysis results
 */
export const analyzeTrends = (incidents) => {
  if (!incidents || incidents.length === 0) {
    return {
      frequentAreas: [],
      categoryTrends: [],
      timePatterns: [],
      insights: [],
      predictions: null,
      hotspots: null
    };
  }

  // Basic trend analysis (existing)
  const areaCount = {};
  incidents.forEach(incident => {
    const area = incident.location || 'Unknown';
    areaCount[area] = (areaCount[area] || 0) + 1;
  });

  const frequentAreas = Object.entries(areaCount)
    .map(([area, count]) => ({
      area,
      count,
      percentage: Math.round((count / incidents.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const categoryCount = {};
  incidents.forEach(incident => {
    const category = incident.category || 'other';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  const categoryTrends = Object.entries(categoryCount)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / incidents.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const hourCount = Array(24).fill(0);
  incidents.forEach(incident => {
    const hour = new Date(incident.createdAt).getHours();
    hourCount[hour]++;
  });

  const peakHours = hourCount
    .map((count, hour) => ({ hour, count }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const monthCount = {};
  incidents.forEach(incident => {
    const month = new Date(incident.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
    monthCount[month] = (monthCount[month] || 0) + 1;
  });

  const monthlyTrend = Object.entries(monthCount)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => new Date(a.month) - new Date(b.month));

  // Enhanced features
  const predictions = predictIncidentTrends(incidents);
  const hotspotAnalysis = predictHotspots(incidents);

  // Generate comprehensive insights
  const insights = [];

  // Hotspot insights
  if (frequentAreas.length > 0 && frequentAreas[0].count >= 3) {
    insights.push({
      type: 'hotspot',
      severity: 'high',
      message: `${frequentAreas[0].area} is the most incident-prone area with ${frequentAreas[0].count} incidents (${frequentAreas[0].percentage}% of total)`,
      recommendation: 'Consider increasing patrol frequency in this area',
      priority: 1
    });
  }

  // Category insights
  if (categoryTrends.length > 0 && categoryTrends[0].percentage > 30 && categoryTrends[0].category) {
    insights.push({
      type: 'category',
      severity: 'medium',
      message: `${categoryTrends[0].category.toUpperCase()} incidents are dominant (${categoryTrends[0].percentage}% of total)`,
      recommendation: `Implement targeted prevention strategies for ${categoryTrends[0].category} incidents`,
      priority: 2
    });
  }

  // Time pattern insights
  if (peakHours.length > 0) {
    const peakHour = peakHours[0].hour;
    const timeRange = `${peakHour}:00 - ${peakHour + 1}:00`;
    insights.push({
      type: 'time',
      severity: 'medium',
      message: `Peak incident time is ${timeRange} with ${peakHours[0].count} incidents`,
      recommendation: 'Schedule more Tanod members during peak hours',
      priority: 3
    });
  }

  // Prediction insights
  if (predictions.trend !== 'insufficient_data') {
    insights.push(...predictions.insights.map(insight => ({
      ...insight,
      severity: insight.type === 'warning' ? 'high' : insight.type === 'positive' ? 'low' : 'medium',
      priority: insight.type === 'warning' ? 1 : 4
    })));
  }

  // Hotspot analysis insights
  if (hotspotAnalysis.insights.length > 0) {
    insights.push(...hotspotAnalysis.insights.map(insight => ({
      ...insight,
      severity: insight.type === 'critical' ? 'high' : insight.type === 'warning' ? 'medium' : 'low',
      priority: insight.type === 'critical' ? 1 : insight.type === 'warning' ? 2 : 5
    })));
  }

  // Sort insights by priority
  insights.sort((a, b) => a.priority - b.priority);

  return {
    frequentAreas,
    categoryTrends,
    timePatterns: peakHours,
    monthlyTrend,
    insights,
    totalIncidents: incidents.length,
    predictions,
    hotspots: hotspotAnalysis,
    averageDaily: (incidents.length / 30).toFixed(1),
    resolutionRate: Math.round(
      (incidents.filter(i => i.status === 'resolved').length / incidents.length) * 100
    )
  };
};

// ==================== RESPONSE SUGGESTIONS ====================

/**
 * Enhanced response action suggestions with AI prioritization
 * @param {Object} incident - Incident object
 * @param {Object} context - Additional context (available resources, etc.)
 * @returns {Array} Prioritized array of suggested actions
 */
export const suggestResponseActions = (incident, context = {}) => {
  const actions = [];
  const category = incident.category || 'other';
  const priority = incident.priority || 'minor';

  // Analyze urgency
  const priorityAnalysis = calculatePriorityScore(incident, context);

  // Critical actions for emergency priority
  if (priorityAnalysis.score >= 75 || priority === 'emergency') {
    actions.push({
      priority: 1,
      action: 'IMMEDIATE: Dispatch all available Tanod to location',
      icon: 'alert',
      urgent: true,
      eta: '< 5 minutes',
      category: 'dispatch'
    });
  }

  // Category-specific actions with enhanced details
  const categoryActions = {
    fire: [
      { priority: 1, action: '🔥 CALL FIRE DEPARTMENT (911 or local BFP) IMMEDIATELY', icon: 'phone', urgent: true, eta: '0 min', category: 'emergency_call' },
      { priority: 2, action: 'Evacuate everyone from the building/area - DO NOT DELAY', icon: 'users', urgent: true, eta: '2 min', category: 'evacuation' },
      { priority: 3, action: 'Alert neighbors and surrounding residents to evacuate', icon: 'megaphone', urgent: true, eta: '3 min', category: 'notification' },
      { priority: 4, action: 'Close all doors and windows to contain fire spread', icon: 'door-closed', urgent: true, eta: '5 min', category: 'containment' },
      { priority: 5, action: 'If safe: Use fire extinguisher ONLY on small, contained fires', icon: 'shield', urgent: true, eta: '5 min', category: 'suppression' },
      { priority: 6, action: 'Establish perimeter - Keep bystanders at safe distance (50m+)', icon: 'alert-triangle', urgent: true, eta: '7 min', category: 'crowd_control' },
      { priority: 7, action: 'Turn off main electrical and gas supply if accessible', icon: 'power', urgent: true, eta: '10 min', category: 'utilities' },
      { priority: 8, action: 'Account for all occupants - conduct headcount', icon: 'users', urgent: true, eta: '10 min', category: 'safety' },
      { priority: 9, action: 'Guide fire trucks to exact location upon arrival', icon: 'map-pin', urgent: true, eta: '15 min', category: 'coordination' },
      { priority: 10, action: 'Provide first aid to anyone with burns or smoke inhalation', icon: 'heart', urgent: true, eta: '15 min', category: 'medical' },
      { priority: 11, action: 'Document scene with photos/video from safe distance', icon: 'camera', urgent: false, eta: '20 min', category: 'documentation' },
      { priority: 12, action: 'Coordinate with fire marshal for investigation', icon: 'clipboard', urgent: false, eta: '1 hour', category: 'investigation' },
      { priority: 13, action: 'Assist displaced families with temporary shelter', icon: 'home', urgent: false, eta: '2 hours', category: 'relief' },
      { priority: 14, action: 'File incident report with complete details', icon: 'file-text', urgent: false, eta: '3 hours', category: 'reporting' },
      { priority: 15, action: '⚠️ SAFETY REMINDER: Never re-enter burning building', icon: 'alert', urgent: true, eta: 'always', category: 'safety_protocol' }
    ],
    crime: [
      { priority: 2, action: 'Contact local police station immediately', icon: 'phone', urgent: true, eta: '5 min', category: 'emergency_call' },
      { priority: 3, action: 'Secure and cordon off the area', icon: 'shield', urgent: true, eta: '10 min', category: 'containment' },
      { priority: 4, action: 'Prevent unauthorized entry and preserve evidence', icon: 'lock', urgent: true, eta: '15 min', category: 'security' },
      { priority: 5, action: 'Interview witnesses and collect statements', icon: 'file-text', urgent: false, eta: '30 min', category: 'investigation' },
      { priority: 6, action: 'Document scene with photos and videos', icon: 'camera', urgent: false, eta: '20 min', category: 'documentation' },
      { priority: 7, action: 'File formal incident report with authorities', icon: 'clipboard', urgent: false, eta: '1 hour', category: 'reporting' },
      { priority: 8, action: 'Follow up with affected residents', icon: 'users', urgent: false, eta: '2 hours', category: 'community' }
    ],
    health: [
      { priority: 2, action: 'Call emergency medical services (911) NOW', icon: 'phone', urgent: true, eta: '2 min', category: 'emergency_call' },
      { priority: 3, action: 'Provide first aid if qualified (CPR, stop bleeding)', icon: 'heart', urgent: true, eta: '5 min', category: 'medical' },
      { priority: 4, action: 'Keep patient calm, comfortable, and still', icon: 'users', urgent: true, eta: '5 min', category: 'patient_care' },
      { priority: 5, action: 'Clear area and maintain crowd control', icon: 'shield', urgent: true, eta: '10 min', category: 'crowd_control' },
      { priority: 6, action: 'Contact patient family members', icon: 'phone', urgent: false, eta: '15 min', category: 'notification' },
      { priority: 7, action: 'Document medical incident and actions taken', icon: 'clipboard', urgent: false, eta: '30 min', category: 'documentation' },
      { priority: 8, action: 'Coordinate with barangay health center', icon: 'building', urgent: false, eta: '1 hour', category: 'coordination' }
    ],
    noise: [
      { priority: 2, action: 'Send Tanod to verify and investigate noise source', icon: 'shield', urgent: false, eta: '15 min', category: 'investigation' },
      { priority: 3, action: 'Approach and identify responsible party politely', icon: 'users', urgent: false, eta: '20 min', category: 'contact' },
      { priority: 4, action: 'Issue verbal warning citing barangay ordinance', icon: 'message-square', urgent: false, eta: '25 min', category: 'warning' },
      { priority: 5, action: 'Explain acceptable noise levels and quiet hours', icon: 'book', urgent: false, eta: '30 min', category: 'education' },
      { priority: 6, action: 'Document violation details and time', icon: 'clipboard', urgent: false, eta: '35 min', category: 'documentation' },
      { priority: 7, action: 'If repeated: Issue written citation', icon: 'alert-triangle', urgent: false, eta: '40 min', category: 'escalation' },
      { priority: 8, action: 'Schedule follow-up check within 24 hours', icon: 'calendar', urgent: false, eta: '1 hour', category: 'follow_up' }
    ],
    dispute: [
      { priority: 2, action: 'Dispatch experienced mediator/Tanod immediately', icon: 'users', urgent: true, eta: '10 min', category: 'dispatch' },
      { priority: 3, action: 'Separate parties to prevent escalation', icon: 'shield', urgent: true, eta: '15 min', category: 'de_escalation' },
      { priority: 4, action: 'Listen to each party separately and calmly', icon: 'message-square', urgent: false, eta: '30 min', category: 'mediation' },
      { priority: 5, action: 'Facilitate dialogue between parties if safe', icon: 'users', urgent: false, eta: '45 min', category: 'mediation' },
      { priority: 6, action: 'Schedule formal mediation hearing at barangay hall', icon: 'calendar', urgent: false, eta: '1 hour', category: 'scheduling' },
      { priority: 7, action: 'Document all statements and agreements', icon: 'file-text', urgent: false, eta: '1.5 hours', category: 'documentation' },
      { priority: 8, action: 'Monitor situation for 72 hours', icon: 'eye', urgent: false, eta: '3 days', category: 'monitoring' }
    ],
    hazard: [
      { priority: 2, action: 'Dispatch Tanod to assess danger level', icon: 'shield', urgent: true, eta: '10 min', category: 'assessment' },
      { priority: 3, action: 'Immediately cordon off dangerous area', icon: 'alert-triangle', urgent: true, eta: '15 min', category: 'containment' },
      { priority: 4, action: 'Evacuate nearby residents if necessary', icon: 'users', urgent: true, eta: '20 min', category: 'evacuation' },
      { priority: 5, action: 'Contact relevant municipal department (Engineering/MDRRMO)', icon: 'phone', urgent: true, eta: '15 min', category: 'notification' },
      { priority: 6, action: 'Post warning signs and barriers', icon: 'alert', urgent: false, eta: '30 min', category: 'signage' },
      { priority: 7, action: 'Notify and inform nearby residents', icon: 'megaphone', urgent: false, eta: '45 min', category: 'community' },
      { priority: 8, action: 'Monitor continuously until resolved', icon: 'eye', urgent: false, eta: 'ongoing', category: 'monitoring' },
      { priority: 9, action: 'Document hazard with photos and reports', icon: 'camera', urgent: false, eta: '1 hour', category: 'documentation' }
    ],
    utility: [
      { priority: 2, action: 'Contact utility service provider hotline', icon: 'phone', urgent: false, eta: '10 min', category: 'notification' },
      { priority: 3, action: 'Report to municipal engineering office', icon: 'tool', urgent: false, eta: '20 min', category: 'reporting' },
      { priority: 4, action: 'Document affected area and residents', icon: 'clipboard', urgent: false, eta: '30 min', category: 'assessment' },
      { priority: 5, action: 'Post announcement about service interruption', icon: 'megaphone', urgent: false, eta: '45 min', category: 'communication' },
      { priority: 6, action: 'Provide updates to affected residents', icon: 'message', urgent: false, eta: '1 hour', category: 'updates' },
      { priority: 7, action: 'Coordinate repair schedule with utility company', icon: 'calendar', urgent: false, eta: '2 hours', category: 'coordination' },
      { priority: 8, action: 'Follow up on repair completion', icon: 'check', urgent: false, eta: 'ongoing', category: 'follow_up' }
    ]
  };

  // Add category-specific actions
  const specificActions = categoryActions[category] || [];
  actions.push(...specificActions);

  // Add general workflow actions
  actions.push(
    { priority: 20, action: 'Update incident status to "In Progress"', icon: 'refresh-cw', urgent: false, eta: 'immediate', category: 'workflow' },
    { priority: 21, action: 'Send status updates every 30 minutes', icon: 'clock', urgent: false, eta: 'ongoing', category: 'communication' },
    { priority: 22, action: 'Take before/after photos of resolution', icon: 'camera', urgent: false, eta: 'before close', category: 'documentation' },
    { priority: 23, action: 'Request feedback from reporter', icon: 'message-square', urgent: false, eta: 'after resolution', category: 'feedback' },
    { priority: 24, action: 'Mark incident as resolved with notes', icon: 'check-circle', urgent: false, eta: 'final step', category: 'closure' }
  );

  // Sort by priority
  const sortedActions = actions.sort((a, b) => a.priority - b.priority);

  // Add AI-generated additional actions based on context
  if (priorityAnalysis.factors.pattern >= 5) {
    sortedActions.splice(3, 0, {
      priority: 3.5,
      action: '⚠️ AI ALERT: Pattern detected - Implement preventive measures',
      icon: 'brain',
      urgent: true,
      eta: 'ongoing',
      category: 'ai_recommendation'
    });
  }

  if (priorityAnalysis.factors.location >= 10) {
    sortedActions.splice(4, 0, {
      priority: 4.5,
      action: '🎯 AI ALERT: High-risk location - Deploy backup support',
      icon: 'brain',
      urgent: false,
      eta: '20 min',
      category: 'ai_recommendation'
    });
  }

  return sortedActions;
};

// ==================== ENHANCED TANOD PERFORMANCE ====================

/**
 * Calculate comprehensive performance metrics for Tanod members
 * @param {Object} tanod - Tanod member object
 * @param {Array} incidentResponses - Array of incident responses
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Object} Enhanced performance insights
 */
export const calculateTanodPerformance = (tanod, incidentResponses, attendanceRecords) => {
  // Filter data for this Tanod
  const tanodResponses = incidentResponses.filter(r => r.tanodId === tanod.id);
  const tanodAttendance = attendanceRecords.filter(a => a.tanodId === tanod.id);

  // Response metrics
  const totalResponses = tanodResponses.length;
  const resolvedIncidents = tanodResponses.filter(r => r.status === 'resolved').length;
  const inProgressIncidents = tanodResponses.filter(r => r.status === 'in-progress').length;
  const resolutionRate = totalResponses > 0 
    ? Math.round((resolvedIncidents / totalResponses) * 100)
    : 0;

  // Calculate average response time (in minutes)
  const responseTimes = tanodResponses
    .filter(r => r.respondedAt && r.createdAt)
    .map(r => {
      const responded = new Date(r.respondedAt);
      const created = new Date(r.createdAt);
      return (responded - created) / (1000 * 60); // minutes
    });

  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
    : 0;

  // Response time consistency
  const responseTimeVariance = responseTimes.length > 1
    ? Math.round(
        responseTimes.reduce((sum, time) => sum + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length
      )
    : 0;

  // Attendance metrics
  const totalShifts = tanodAttendance.length;
  const completedShifts = tanodAttendance.filter(a => a.status === 'completed' || a.status === 'present').length;
  const attendanceRate = totalShifts > 0
    ? Math.round((completedShifts / totalShifts) * 100)
    : 0;

  // Late/absent tracking
  const lateCount = tanodAttendance.filter(a => a.status === 'late').length;
  const absentCount = tanodAttendance.filter(a => a.status === 'absent').length;
  const punctualityRate = totalShifts > 0
    ? Math.round(((totalShifts - lateCount - absentCount) / totalShifts) * 100)
    : 0;

  // Calculate duty hours
  const totalDutyHours = tanodAttendance.reduce((sum, record) => {
    return sum + (record.duration || 0);
  }, 0) / 60; // Convert minutes to hours

  // Category expertise analysis
  const categoryExpertise = {};
  tanodResponses.forEach(response => {
    const category = response.category || 'other';
    if (!categoryExpertise[category]) {
      categoryExpertise[category] = { count: 0, resolved: 0 };
    }
    categoryExpertise[category].count++;
    if (response.status === 'resolved') {
      categoryExpertise[category].resolved++;
    }
  });

  const bestCategory = Object.entries(categoryExpertise)
    .map(([cat, data]) => ({
      category: cat,
      count: data.count,
      rate: data.count > 0 ? Math.round((data.resolved / data.count) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)[0];

  // Enhanced performance score (0-100) with weighted factors
  let performanceScore = 0;
  
  // Resolution rate (35% weight)
  performanceScore += Math.min(35, resolutionRate * 0.35);
  
  // Attendance rate (25% weight)
  performanceScore += Math.min(25, attendanceRate * 0.25);
  
  // Response time (20% weight) - Inverse relationship
  const responseTimeScore = avgResponseTime > 0 
    ? Math.max(0, 20 - (avgResponseTime / 3))
    : 0;
  performanceScore += Math.min(20, responseTimeScore);
  
  // Punctuality (10% weight)
  performanceScore += Math.min(10, punctualityRate * 0.1);
  
  // Consistency bonus (5% weight)
  const consistencyScore = responseTimeVariance < 100 ? 5 : responseTimeVariance < 300 ? 3 : 0;
  performanceScore += consistencyScore;
  
  // Activity level bonus (5% weight)
  const activityScore = totalResponses > 20 ? 5 : totalResponses > 10 ? 3 : totalResponses > 5 ? 1 : 0;
  performanceScore += activityScore;

  // Performance rating (1-5 stars)
  let rating;
  if (performanceScore >= 90) rating = 5.0;
  else if (performanceScore >= 80) rating = 4.5;
  else if (performanceScore >= 70) rating = 4.0;
  else if (performanceScore >= 60) rating = 3.5;
  else if (performanceScore >= 50) rating = 3.0;
  else if (performanceScore >= 40) rating = 2.5;
  else if (performanceScore >= 30) rating = 2.0;
  else rating = 1.5;

  // Strengths identification
  const strengths = [];
  
  if (resolutionRate >= 85) {
    strengths.push('Exceptional incident resolution rate');
  } else if (resolutionRate >= 70) {
    strengths.push('High incident resolution rate');
  }

  if (attendanceRate >= 95) {
    strengths.push('Perfect attendance record');
  } else if (attendanceRate >= 85) {
    strengths.push('Excellent attendance consistency');
  }

  if (avgResponseTime > 0 && avgResponseTime <= 10) {
    strengths.push('Outstanding response time');
  } else if (avgResponseTime <= 20) {
    strengths.push('Fast response time');
  }

  if (lateCount === 0 && totalShifts > 5) {
    strengths.push('Always punctual');
  }

  if (totalResponses > 30) {
    strengths.push('Highly active and engaged');
  } else if (totalResponses > 15) {
    strengths.push('Consistent responder');
  }

  if (responseTimeVariance < 100) {
    strengths.push('Reliable and consistent performance');
  }

  if (bestCategory && bestCategory.rate >= 90) {
    strengths.push(`Expert in ${bestCategory.category} incidents`);
  }

  // Areas for improvement
  const improvements = [];

  if (resolutionRate < 60) {
    improvements.push('Focus on improving incident resolution rate');
  } else if (resolutionRate < 75) {
    improvements.push('Work towards higher resolution rate');
  }

  if (attendanceRate < 75) {
    improvements.push('Improve attendance consistency');
  } else if (attendanceRate < 85) {
    improvements.push('Maintain better attendance record');
  }

  if (avgResponseTime > 30) {
    improvements.push('Reduce incident response time significantly');
  } else if (avgResponseTime > 20) {
    improvements.push('Work on faster incident response');
  }

  if (lateCount > 5) {
    improvements.push('Improve punctuality');
  } else if (lateCount > 2) {
    improvements.push('Be more punctual for shifts');
  }

  if (totalResponses < 5 && totalShifts > 5) {
    improvements.push('Increase active incident response participation');
  }

  if (responseTimeVariance > 500) {
    improvements.push('Maintain consistent performance levels');
  }

  if (inProgressIncidents > 5) {
    improvements.push('Focus on closing pending incidents');
  }

  // Generate AI-powered insights
  const insights = [];

  if (performanceScore >= 90) {
    insights.push({
      type: 'excellent',
      message: 'Outstanding performance! Top-tier Tanod member.',
      recommendation: 'Consider for leadership role, team lead position, or mentoring new members'
    });
  } else if (performanceScore >= 75) {
    insights.push({
      type: 'good',
      message: 'Strong performance across multiple areas.',
      recommendation: 'Continue current approach and consider skill development in new areas'
    });
  } else if (performanceScore >= 50) {
    insights.push({
      type: 'average',
      message: 'Satisfactory performance with room for improvement.',
      recommendation: 'Focus on identified areas for improvement and seek additional training'
    });
  } else {
    insights.push({
      type: 'needs-improvement',
      message: 'Performance below expectations. Immediate action needed.',
      recommendation: 'Schedule one-on-one coaching, set specific improvement goals, and provide additional support'
    });
  }

  if (lateCount > 5 || absentCount > 3) {
    insights.push({
      type: 'warning',
      message: `Attendance issues detected: ${lateCount} late, ${absentCount} absent`,
      recommendation: 'Address attendance and punctuality concerns immediately. Review schedule preferences and personal circumstances.'
    });
  }

  if (totalResponses === 0 && totalShifts > 3) {
    insights.push({
      type: 'inactive',
      message: 'No incident responses recorded despite active duty',
      recommendation: 'Verify patrol routes, review assignment procedures, and ensure proper incident reporting'
    });
  }

  if (inProgressIncidents > 5) {
    insights.push({
      type: 'workload',
      message: `${inProgressIncidents} incidents still in progress`,
      recommendation: 'Review workload distribution and provide support to close pending cases'
    });
  }

  if (avgResponseTime > 0 && responseTimeVariance > 500) {
    insights.push({
      type: 'consistency',
      message: 'Response time varies significantly',
      recommendation: 'Investigate factors causing inconsistent response times and provide targeted support'
    });
  }

  // Predictive insights
  const trendDirection = (() => {
    if (tanodResponses.length < 5) return 'insufficient_data';
    
    const recent = tanodResponses.slice(-5);
    const recentResolved = recent.filter(r => r.status === 'resolved').length;
    const recentRate = (recentResolved / 5) * 100;
    
    if (recentRate > resolutionRate + 10) return 'improving';
    if (recentRate < resolutionRate - 10) return 'declining';
    return 'stable';
  })();

  if (trendDirection === 'improving') {
    insights.push({
      type: 'trend',
      message: '📈 Performance trending upward',
      recommendation: 'Recognize improvement and encourage continued progress'
    });
  } else if (trendDirection === 'declining') {
    insights.push({
      type: 'trend',
      message: '📉 Performance trending downward',
      recommendation: 'Investigate recent challenges and provide immediate support'
    });
  }

  return {
    performanceScore: Math.round(performanceScore),
    overallScore: Math.round(performanceScore), // Alias for compatibility
    rating,
    metrics: {
      totalResponses,
      resolvedIncidents,
      inProgressIncidents,
      resolutionRate,
      avgResponseTime,
      responseTimeVariance,
      totalShifts,
      completedShifts,
      attendanceRate,
      punctualityRate,
      lateCount,
      absentCount,
      totalDutyHours: Math.round(totalDutyHours)
    },
    categoryExpertise,
    bestCategory,
    strengths,
    improvements,
    insights,
    trendDirection,
    consistency: responseTimeVariance < 100 ? 'excellent' : responseTimeVariance < 300 ? 'good' : 'needs_improvement'
  };
};

/**
 * Calculate enhanced team performance metrics
 * @param {Array} tanodMembers - Array of Tanod members
 * @param {Array} incidentResponses - Array of incident responses
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Object} Enhanced team performance insights
 */
export const calculateTeamPerformance = (tanodMembers, incidentResponses, attendanceRecords) => {
  const activeTanod = tanodMembers.filter(t => t.status === 'active');
  
  if (activeTanod.length === 0) {
    return {
      teamSize: 0,
      overallScore: 0,
      avgResponseTime: 0,
      attendanceRate: 0,
      resolutionRate: 0,
      topPerformers: [],
      needsAttention: [],
      insights: [],
      recommendations: []
    };
  }

  // Calculate individual performances
  const performances = activeTanod.map(tanod => ({
    tanod,
    performance: calculateTanodPerformance(tanod, incidentResponses, attendanceRecords)
  }));

  // Team averages
  const avgPerformanceScore = Math.round(
    performances.reduce((sum, p) => sum + p.performance.performanceScore, 0) / performances.length
  );

  const avgResolutionRate = Math.round(
    performances.reduce((sum, p) => sum + p.performance.metrics.resolutionRate, 0) / performances.length
  );

  const avgAttendanceRate = Math.round(
    performances.reduce((sum, p) => sum + p.performance.metrics.attendanceRate, 0) / performances.length
  );

  const avgResponseTime = Math.round(
    performances.reduce((sum, p) => sum + p.performance.metrics.avgResponseTime, 0) / performances.length
  );

  // Top performers (top 3)
  const topPerformers = performances
    .sort((a, b) => b.performance.performanceScore - a.performance.performanceScore)
    .slice(0, 3)
    .map(p => ({
      id: p.tanod.id,
      name: p.tanod.fullName || p.tanod.displayName,
      score: p.performance.performanceScore,
      rating: p.performance.rating,
      strengths: p.performance.strengths
    }));

  // Members needing attention
  const needsAttention = performances
    .filter(p => 
      p.performance.performanceScore < 50 || 
      p.performance.insights.some(i => ['warning', 'needs-improvement', 'inactive'].includes(i.type))
    )
    .map(p => ({
      id: p.tanod.id,
      name: p.tanod.fullName || p.tanod.displayName,
      score: p.performance.performanceScore,
      issues: p.performance.improvements,
      criticalIssues: p.performance.insights
        .filter(i => ['warning', 'needs-improvement', 'inactive'].includes(i.type))
        .map(i => i.message)
    }));

  // Team capacity analysis
  const totalCapacity = activeTanod.length * 8; // 8 hours per member
  const actualDutyHours = performances.reduce((sum, p) => 
    sum + p.performance.metrics.totalDutyHours, 0
  );
  const capacityUtilization = Math.round((actualDutyHours / totalCapacity) * 100);

  // Generate team insights
  const insights = [];

  if (avgPerformanceScore >= 80) {
    insights.push('Exceptional team performance across all metrics');
  } else if (avgPerformanceScore >= 70) {
    insights.push('Strong team performance with consistent results');
  } else if (avgPerformanceScore >= 60) {
    insights.push('Moderate team performance - some areas need improvement');
  } else {
    insights.push('Team performance below expectations - immediate action required');
  }

  if (needsAttention.length > performances.length * 0.3) {
    insights.push(`⚠️ ${needsAttention.length} members (${Math.round((needsAttention.length/performances.length)*100)}%) need immediate attention`);
  }

  if (avgResponseTime <= 15) {
    insights.push('✓ Excellent team response time');
  } else if (avgResponseTime > 30) {
    insights.push('⚠️ Team response time needs improvement');
  }

  if (avgResolutionRate >= 85) {
    insights.push('✓ High incident resolution rate');
  } else if (avgResolutionRate < 70) {
    insights.push('⚠️ Low incident resolution rate - review procedures');
  }

  if (capacityUtilization < 50) {
    insights.push('💡 Team capacity underutilized - consider workload optimization');
  } else if (capacityUtilization > 90) {
    insights.push('⚠️ Team operating near maximum capacity - consider expansion');
  }

  // Generate recommendations
  const recommendations = [];

  if (avgPerformanceScore < 70) {
    recommendations.push('Implement comprehensive training program for team');
    recommendations.push('Review and optimize incident response procedures');
  }

  if (needsAttention.length > 0) {
    recommendations.push(`Provide individual coaching for ${needsAttention.length} members`);
    recommendations.push('Create mentorship program pairing top performers with those needing support');
  }

  if (avgResponseTime > 25) {
    recommendations.push('Optimize patrol routes and response protocols');
    recommendations.push('Consider additional training on rapid response techniques');
  }

  if (topPerformers.length >= 3) {
    recommendations.push(`Recognize top performers: ${topPerformers.map(p => p.name).join(', ')}`);
    recommendations.push('Leverage top performers as team leads and trainers');
  }

  if (capacityUtilization > 85) {
    recommendations.push('Consider recruiting additional Tanod members');
  } else if (capacityUtilization < 60) {
    recommendations.push('Increase patrol frequency and proactive community engagement');
  }

  return {
    teamSize: activeTanod.length,
    overallScore: avgPerformanceScore,
    avgPerformanceScore,
    avgResolutionRate,
    avgAttendanceRate,
    avgResponseTime,
    capacityUtilization,
    topPerformers,
    needsAttention,
    totalIncidents: incidentResponses.length,
    totalIncidentsHandled: incidentResponses.length,
    totalShiftsCompleted: attendanceRecords.filter(a => 
      a.status === 'completed' || a.status === 'present'
    ).length,
    insights,
    recommendations,
    performanceDistribution: {
      excellent: performances.filter(p => p.performance.performanceScore >= 90).length,
      good: performances.filter(p => p.performance.performanceScore >= 70 && p.performance.performanceScore < 90).length,
      average: performances.filter(p => p.performance.performanceScore >= 50 && p.performance.performanceScore < 70).length,
      poor: performances.filter(p => p.performance.performanceScore < 50).length
    }
  };
};

// Export all enhanced AI functions
export default {
  // Sentiment & Classification
  analyzeSentiment,
  classifyIncident,
  
  // Priority & Scoring
  calculatePriorityScore,
  
  // Predictive Analytics
  predictIncidentTrends,
  predictHotspots,
  
  // Smart Assignment
  suggestTanodAssignment,
  
  // Trend Analysis
  analyzeTrends,
  
  // Response Suggestions
  suggestResponseActions,
  
  // Performance Analytics
  calculateTanodPerformance,
  calculateTeamPerformance
};
