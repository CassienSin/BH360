/**
 * AI Service for Barangay Management System
 * Provides intelligent features for incident management and Tanod performance
 */

// ==================== INCIDENT CLASSIFICATION ====================

/**
 * Keyword patterns for automatic incident classification
 */
const categoryKeywords = {
  crime: [
    'theft', 'robbery', 'steal', 'burglar', 'assault', 'attack', 'fight', 'violence',
    'weapon', 'knife', 'gun', 'suspicious', 'trespassing', 'vandal', 'damage',
    'drug', 'illegal', 'harassment', 'threat', 'criminal', 'gang', 'mugging'
  ],
  noise: [
    'noise', 'loud', 'music', 'sound', 'party', 'karaoke', 'shouting', 'yelling',
    'disturbance', 'barking', 'dog', 'speaker', 'volume', 'construction',
    'drilling', 'hammering', 'disco', 'videoke', 'singing'
  ],
  dispute: [
    'dispute', 'argument', 'conflict', 'disagreement', 'fight', 'quarrel',
    'neighbor', 'boundary', 'property', 'land', 'fence', 'parking', 'confrontation',
    'complaint', 'issue', 'problem', 'tension', 'disagreeing', 'debate'
  ],
  hazard: [
    'hazard', 'danger', 'unsafe', 'broken', 'damage', 'pothole', 'flood',
    'fire', 'leak', 'electrical', 'wire', 'streetlight', 'tree', 'fallen',
    'crack', 'slippery', 'blocked', 'obstruction', 'trash', 'garbage',
    'stray', 'animal', 'road', 'accident', 'structure'
  ],
  health: [
    'health', 'medical', 'sick', 'injury', 'injured', 'ambulance', 'hospital',
    'emergency', 'bleeding', 'unconscious', 'fever', 'covid', 'disease',
    'sanitation', 'hygiene', 'contamination', 'poison', 'outbreak'
  ],
  utility: [
    'water', 'electricity', 'power', 'outage', 'blackout', 'internet',
    'cable', 'plumbing', 'drainage', 'sewage', 'maintenance', 'repair',
    'meter', 'bill', 'service', 'utility', 'line'
  ]
};

/**
 * Classify incident based on title and description
 * @param {string} title - Incident title
 * @param {string} description - Incident description
 * @returns {Object} Classification result with category and confidence
 */
export const classifyIncident = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  const scores = {};

  // Calculate score for each category
  Object.keys(categoryKeywords).forEach(category => {
    const keywords = categoryKeywords[category];
    let score = 0;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    });

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

  return {
    category: topCategory[1] > 0 ? topCategory[0] : 'other',
    confidence,
    suggestedCategories: sortedCategories
      .filter(([, score]) => score > 0)
      .slice(0, 3)
      .map(([category]) => category)
  };
};

// ==================== PRIORITY SCORING ====================

/**
 * Calculate priority score for an incident (0-100)
 * Higher score = Higher priority
 */
export const calculatePriorityScore = (incident) => {
  let score = 0;

  // Base score by category
  const categoryScores = {
    crime: 40,
    health: 35,
    hazard: 30,
    dispute: 20,
    noise: 15,
    utility: 10,
    other: 5
  };

  score += categoryScores[incident.category] || 5;

  // Urgency keywords in title/description
  const urgencyKeywords = [
    'emergency', 'urgent', 'immediate', 'critical', 'severe', 'serious',
    'danger', 'threatening', 'violence', 'weapon', 'injured', 'bleeding',
    'fire', 'flood', 'help', 'asap', 'now', 'quickly', 'ambulance'
  ];

  const text = `${incident.title} ${incident.description}`.toLowerCase();
  urgencyKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 5;
    }
  });

  // Time of day factor (night incidents get higher priority)
  const hour = new Date(incident.createdAt || Date.now()).getHours();
  if (hour >= 22 || hour <= 5) {
    score += 10; // Night time (10pm - 5am)
  }

  // Location factor (certain areas might be higher priority)
  const highPriorityLocations = ['school', 'hospital', 'market', 'plaza', 'main'];
  const location = (incident.location || '').toLowerCase();
  if (highPriorityLocations.some(loc => location.includes(loc))) {
    score += 8;
  }

  // Cap at 100
  score = Math.min(100, score);

  // Determine priority level
  let priority;
  if (score >= 70) {
    priority = 'emergency';
  } else if (score >= 40) {
    priority = 'urgent';
  } else {
    priority = 'minor';
  }

  return {
    score,
    priority,
    factors: {
      category: categoryScores[incident.category] || 5,
      urgency: score - (categoryScores[incident.category] || 5),
      timeOfDay: hour >= 22 || hour <= 5 ? 10 : 0,
      location: highPriorityLocations.some(loc => location.includes(loc)) ? 8 : 0
    }
  };
};

// ==================== TREND ANALYSIS ====================

/**
 * Analyze incident trends and hotspots
 * @param {Array} incidents - Array of incidents
 * @returns {Object} Trend analysis results
 */
export const analyzeTrends = (incidents) => {
  if (!incidents || incidents.length === 0) {
    return {
      frequentAreas: [],
      categoryTrends: [],
      timePatterns: [],
      insights: []
    };
  }

  // Analyze frequent areas
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

  // Category trends
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

  // Time patterns (hour of day)
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

  // Generate insights
  const insights = [];

  if (frequentAreas.length > 0 && frequentAreas[0].count >= 3) {
    insights.push({
      type: 'hotspot',
      severity: 'high',
      message: `${frequentAreas[0].area} is the most incident-prone area with ${frequentAreas[0].count} incidents (${frequentAreas[0].percentage}% of total)`,
      recommendation: 'Consider increasing patrol frequency in this area'
    });
  }

  if (categoryTrends.length > 0 && categoryTrends[0].percentage > 30) {
    insights.push({
      type: 'category',
      severity: 'medium',
      message: `${categoryTrends[0].category.toUpperCase()} incidents are dominant (${categoryTrends[0].percentage}% of total)`,
      recommendation: `Implement targeted prevention strategies for ${categoryTrends[0].category} incidents`
    });
  }

  if (peakHours.length > 0) {
    const peakHour = peakHours[0].hour;
    const timeRange = `${peakHour}:00 - ${peakHour + 1}:00`;
    insights.push({
      type: 'time',
      severity: 'medium',
      message: `Peak incident time is ${timeRange} with ${peakHours[0].count} incidents`,
      recommendation: 'Schedule more Tanod members during peak hours'
    });
  }

  // Monthly trend (if data spans multiple months)
  const monthCount = {};
  incidents.forEach(incident => {
    const month = new Date(incident.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
    monthCount[month] = (monthCount[month] || 0) + 1;
  });

  const monthlyTrend = Object.entries(monthCount)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => new Date(a.month) - new Date(b.month));

  return {
    frequentAreas,
    categoryTrends,
    timePatterns: peakHours,
    monthlyTrend,
    insights,
    totalIncidents: incidents.length
  };
};

// ==================== RESPONSE SUGGESTIONS ====================

/**
 * Suggest response actions based on incident type
 * @param {Object} incident - Incident object
 * @returns {Array} Array of suggested actions
 */
export const suggestResponseActions = (incident) => {
  const actions = [];
  const category = incident.category || 'other';
  const priority = incident.priority || 'minor';

  // Common actions
  if (priority === 'emergency') {
    actions.push({
      priority: 1,
      action: 'Dispatch nearest available Tanod immediately',
      icon: 'alert',
      urgent: true
    });
  }

  // Category-specific actions
  const categoryActions = {
    crime: [
      { priority: 2, action: 'Contact local police station', icon: 'phone', urgent: true },
      { priority: 3, action: 'Secure the area and prevent entry', icon: 'shield', urgent: true },
      { priority: 4, action: 'Collect witness statements', icon: 'file-text', urgent: false },
      { priority: 5, action: 'Document evidence (photos/videos)', icon: 'camera', urgent: false },
      { priority: 6, action: 'File incident report with authorities', icon: 'clipboard', urgent: false }
    ],
    health: [
      { priority: 2, action: 'Call emergency medical services (911)', icon: 'phone', urgent: true },
      { priority: 3, action: 'Provide first aid if trained', icon: 'heart', urgent: true },
      { priority: 4, action: 'Keep patient calm and comfortable', icon: 'users', urgent: true },
      { priority: 5, action: 'Contact family members', icon: 'phone', urgent: false },
      { priority: 6, action: 'Document medical incident details', icon: 'clipboard', urgent: false }
    ],
    noise: [
      { priority: 2, action: 'Send Tanod to investigate', icon: 'shield', urgent: false },
      { priority: 3, action: 'Issue verbal warning to responsible party', icon: 'message-square', urgent: false },
      { priority: 4, action: 'Explain barangay noise ordinance', icon: 'book', urgent: false },
      { priority: 5, action: 'Document violation for records', icon: 'clipboard', urgent: false },
      { priority: 6, action: 'Issue citation if repeated violation', icon: 'alert-triangle', urgent: false }
    ],
    dispute: [
      { priority: 2, action: 'Send mediator/Tanod to location', icon: 'users', urgent: false },
      { priority: 3, action: 'Separate parties involved', icon: 'shield', urgent: true },
      { priority: 4, action: 'Listen to both sides of the dispute', icon: 'message-square', urgent: false },
      { priority: 5, action: 'Schedule mediation hearing', icon: 'calendar', urgent: false },
      { priority: 6, action: 'Document statements and agreements', icon: 'file-text', urgent: false }
    ],
    hazard: [
      { priority: 2, action: 'Dispatch Tanod to assess situation', icon: 'shield', urgent: true },
      { priority: 3, action: 'Cordon off dangerous area', icon: 'alert-triangle', urgent: true },
      { priority: 4, action: 'Contact relevant municipal department', icon: 'phone', urgent: true },
      { priority: 5, action: 'Inform nearby residents of hazard', icon: 'megaphone', urgent: false },
      { priority: 6, action: 'Monitor until hazard is resolved', icon: 'eye', urgent: false }
    ],
    utility: [
      { priority: 2, action: 'Contact utility service provider', icon: 'phone', urgent: false },
      { priority: 3, action: 'Report to municipal engineering office', icon: 'tool', urgent: false },
      { priority: 4, action: 'Document affected area/residents', icon: 'clipboard', urgent: false },
      { priority: 5, action: 'Provide updates to affected residents', icon: 'megaphone', urgent: false },
      { priority: 6, action: 'Follow up on repair schedule', icon: 'calendar', urgent: false }
    ]
  };

  // Add category-specific actions
  const specificActions = categoryActions[category] || [];
  actions.push(...specificActions);

  // General closing actions
  actions.push(
    { priority: 10, action: 'Update incident status regularly', icon: 'refresh-cw', urgent: false },
    { priority: 11, action: 'Mark as resolved when completed', icon: 'check-circle', urgent: false }
  );

  return actions.sort((a, b) => a.priority - b.priority);
};

// ==================== TANOD PERFORMANCE INSIGHTS ====================

/**
 * Calculate performance metrics for Tanod members
 * @param {Object} tanod - Tanod member object
 * @param {Array} incidentResponses - Array of incident responses
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Object} Performance insights
 */
export const calculateTanodPerformance = (tanod, incidentResponses, attendanceRecords) => {
  // Filter data for this Tanod
  const tanodResponses = incidentResponses.filter(r => r.tanodId === tanod.id);
  const tanodAttendance = attendanceRecords.filter(a => a.tanodId === tanod.id);

  // Response metrics
  const totalResponses = tanodResponses.length;
  const resolvedIncidents = tanodResponses.filter(r => r.status === 'resolved').length;
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

  // Attendance metrics
  const totalShifts = tanodAttendance.length;
  const completedShifts = tanodAttendance.filter(a => a.status === 'completed').length;
  const attendanceRate = totalShifts > 0
    ? Math.round((completedShifts / totalShifts) * 100)
    : 0;

  // Late/absent tracking
  const lateCount = tanodAttendance.filter(a => a.status === 'late').length;
  const absentCount = tanodAttendance.filter(a => a.status === 'absent').length;

  // Performance score (0-100)
  let performanceScore = 0;
  performanceScore += Math.min(40, resolutionRate * 0.4); // 40% weight
  performanceScore += Math.min(30, attendanceRate * 0.3); // 30% weight
  performanceScore += Math.min(20, Math.max(0, 20 - (avgResponseTime / 5))); // 20% weight
  performanceScore += Math.min(10, Math.max(0, 10 - lateCount)); // 10% weight

  // Performance rating (1-5 stars)
  let rating;
  if (performanceScore >= 90) rating = 5;
  else if (performanceScore >= 75) rating = 4;
  else if (performanceScore >= 60) rating = 3;
  else if (performanceScore >= 40) rating = 2;
  else rating = 1;

  // Strengths and areas for improvement
  const strengths = [];
  const improvements = [];

  if (resolutionRate >= 80) {
    strengths.push('High incident resolution rate');
  } else if (resolutionRate < 60) {
    improvements.push('Improve incident resolution rate');
  }

  if (attendanceRate >= 90) {
    strengths.push('Excellent attendance record');
  } else if (attendanceRate < 75) {
    improvements.push('Improve attendance consistency');
  }

  if (avgResponseTime <= 15) {
    strengths.push('Fast response time');
  } else if (avgResponseTime > 30) {
    improvements.push('Reduce incident response time');
  }

  if (lateCount === 0 && totalShifts > 5) {
    strengths.push('Always on time');
  } else if (lateCount > 3) {
    improvements.push('Improve punctuality');
  }

  if (totalResponses > 20) {
    strengths.push('Highly active responder');
  }

  // Generate insights
  const insights = [];

  if (performanceScore >= 90) {
    insights.push({
      type: 'excellent',
      message: 'Outstanding performance! One of the top-performing Tanod members.',
      recommendation: 'Consider for leadership or mentoring roles'
    });
  } else if (performanceScore < 50) {
    insights.push({
      type: 'needs-improvement',
      message: 'Performance below expectations. Additional support needed.',
      recommendation: 'Schedule one-on-one coaching and set improvement goals'
    });
  }

  if (lateCount > 5) {
    insights.push({
      type: 'warning',
      message: 'Frequent tardiness detected',
      recommendation: 'Address punctuality issues and review schedule preferences'
    });
  }

  if (totalResponses === 0 && totalShifts > 3) {
    insights.push({
      type: 'inactive',
      message: 'No incident responses recorded',
      recommendation: 'Verify active duty assignments and patrol routes'
    });
  }

  return {
    performanceScore: Math.round(performanceScore),
    rating,
    metrics: {
      totalResponses,
      resolvedIncidents,
      resolutionRate,
      avgResponseTime,
      totalShifts,
      completedShifts,
      attendanceRate,
      lateCount,
      absentCount
    },
    strengths,
    improvements,
    insights
  };
};

/**
 * Calculate overall team performance metrics
 * @param {Array} tanodMembers - Array of Tanod members
 * @param {Array} incidentResponses - Array of incident responses
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Object} Team performance insights
 */
export const calculateTeamPerformance = (tanodMembers, incidentResponses, attendanceRecords) => {
  const activeTanod = tanodMembers.filter(t => t.status === 'active');
  
  // Calculate individual performances
  const performances = activeTanod.map(tanod => ({
    tanod,
    performance: calculateTanodPerformance(tanod, incidentResponses, attendanceRecords)
  }));

  // Team averages
  const avgPerformanceScore = performances.length > 0
    ? Math.round(performances.reduce((sum, p) => sum + p.performance.performanceScore, 0) / performances.length)
    : 0;

  const avgResolutionRate = performances.length > 0
    ? Math.round(performances.reduce((sum, p) => sum + p.performance.metrics.resolutionRate, 0) / performances.length)
    : 0;

  const avgAttendanceRate = performances.length > 0
    ? Math.round(performances.reduce((sum, p) => sum + p.performance.metrics.attendanceRate, 0) / performances.length)
    : 0;

  // Top performers (top 3)
  const topPerformers = performances
    .sort((a, b) => b.performance.performanceScore - a.performance.performanceScore)
    .slice(0, 3)
    .map(p => ({
      name: p.tanod.fullName,
      score: p.performance.performanceScore,
      rating: p.performance.rating
    }));

  // Members needing attention
  const needsAttention = performances
    .filter(p => p.performance.performanceScore < 50 || p.performance.insights.some(i => i.type === 'warning'))
    .map(p => ({
      name: p.tanod.fullName,
      score: p.performance.performanceScore,
      issues: p.performance.improvements
    }));

  return {
    teamSize: activeTanod.length,
    avgPerformanceScore,
    avgResolutionRate,
    avgAttendanceRate,
    topPerformers,
    needsAttention,
    totalIncidentsHandled: incidentResponses.length,
    totalShiftsCompleted: attendanceRecords.filter(a => a.status === 'completed').length
  };
};

export default {
  classifyIncident,
  calculatePriorityScore,
  analyzeTrends,
  suggestResponseActions,
  calculateTanodPerformance,
  calculateTeamPerformance
};
