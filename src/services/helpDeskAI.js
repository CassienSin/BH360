/**
 * AI Help Desk Service for Barangay Management System
 * Provides intelligent responses for common inquiries about barangay services
 */

// ==================== BARANGAY SERVICES DATABASE ====================

export const barangayServices = {
  'barangay-clearance': {
    id: 'barangay-clearance',
    name: 'Barangay Clearance',
    category: 'Certificates',
    description: 'Official clearance certificate issued by the barangay for various purposes',
    processingTime: '1-2 days',
    fee: '₱50.00',
    requirements: [
      'Valid ID (original and photocopy)',
      'Proof of Residency (Barangay ID, Cedula, or Utility Bill)',
      '1x1 ID Picture (1 piece)',
      'Community Tax Certificate (Cedula)',
      'Purpose of the clearance',
    ],
    procedures: [
      'Visit the Barangay Hall during office hours (Mon-Fri, 8AM-5PM)',
      'Fill out the application form at the front desk',
      'Submit the complete requirements',
      'Pay the processing fee at the cashier',
      'Wait for processing (1-2 days) or request rush processing (same day, additional fee)',
      'Claim your Barangay Clearance with the claim stub',
    ],
    validFor: '6 months',
    purposes: ['Employment', 'Business Permit', 'Travel', 'Local Employment', 'Police Clearance', 'Other legal purposes'],
  },
  'certificate-of-residency': {
    id: 'certificate-of-residency',
    name: 'Certificate of Residency',
    category: 'Certificates',
    description: 'Certificate proving that you are a resident of the barangay',
    processingTime: '1 day',
    fee: '₱30.00',
    requirements: [
      'Valid ID (original and photocopy)',
      'Proof of Residency (Barangay ID, Utility Bill under your name)',
      '1x1 ID Picture (1 piece)',
      'Rental Contract (if renting) or Deed of Sale (if owned)',
    ],
    procedures: [
      'Visit the Barangay Hall during office hours',
      'Complete the application form',
      'Submit all required documents',
      'Pay the processing fee',
      'Return the next day to claim your certificate',
    ],
    validFor: '3 months',
    purposes: ['School enrollment', 'Employment', 'Loan applications', 'Government transactions'],
  },
  'certificate-of-indigency': {
    id: 'certificate-of-indigency',
    name: 'Certificate of Indigency',
    category: 'Certificates',
    description: 'Certificate for low-income residents to access assistance programs',
    processingTime: '1-2 days',
    fee: 'FREE',
    requirements: [
      'Valid ID (original and photocopy)',
      'Proof of Residency',
      '1x1 ID Picture (2 pieces)',
      'Barangay ID',
      'Purpose of request',
    ],
    procedures: [
      'Visit the Barangay Hall',
      'Undergo interview with the Barangay Social Worker',
      'Fill out the indigency verification form',
      'Submit required documents',
      'Wait for verification (1-2 days)',
      'Claim certificate once approved',
    ],
    validFor: '1 month',
    purposes: ['Medical assistance', 'Educational assistance', 'Legal aid', 'Burial assistance', 'Government aid programs'],
    notes: ['Subject to barangay social worker verification', 'May require home visit for validation'],
  },
  'business-permit': {
    id: 'business-permit',
    name: 'Barangay Business Permit',
    category: 'Permits',
    description: 'Permit required to operate a business within the barangay',
    processingTime: '3-5 days',
    fee: '₱200.00 - ₱1,000.00 (depends on business type)',
    requirements: [
      'DTI/SEC/CDA Registration (original and photocopy)',
      'Barangay Clearance of the owner',
      'Valid ID of the business owner',
      'Lease Contract or Proof of Ownership of business location',
      'Fire Safety Inspection Certificate (for applicable businesses)',
      'Sanitary Permit (for food businesses)',
      'Occupancy Permit',
      '2x2 ID Picture (2 pieces)',
    ],
    procedures: [
      'Secure Barangay Clearance for the business owner',
      'Prepare all documentary requirements',
      'Visit Barangay Hall and fill out application form',
      'Submit complete requirements',
      'Wait for site inspection (if required)',
      'Pay the permit fee based on business classification',
      'Claim the Business Permit',
    ],
    validFor: '1 year (renewable annually)',
    purposes: ['Legal operation of business', 'Compliance with local regulations'],
    notes: [
      'Permit must be displayed in a conspicuous area of the business',
      'Non-compliance may result in penalties or closure',
      'Renewal should be done before expiration',
    ],
  },
  'building-permit': {
    id: 'building-permit',
    name: 'Barangay Building Clearance',
    category: 'Permits',
    description: 'Clearance required for construction, renovation, or demolition projects',
    processingTime: '5-7 days',
    fee: '₱100.00 - ₱500.00 (depends on project)',
    requirements: [
      'Barangay Clearance of the lot owner',
      'Lot Plan and Location Plan',
      'Building Plans and Specifications',
      'Structural Design (for major construction)',
      'Proof of Lot Ownership (Title/Tax Declaration)',
      'Valid ID of the owner',
      'Notarized Affidavit of Undertaking',
    ],
    procedures: [
      'Prepare architectural and engineering plans',
      'Visit Barangay Hall to submit requirements',
      'Wait for site inspection by Barangay Officials',
      'Address any concerns raised during inspection',
      'Pay the clearance fee',
      'Receive Barangay Building Clearance',
      'Proceed to Municipal Engineer\'s Office for Building Permit',
    ],
    validFor: '1 year or until completion of project',
    purposes: ['New construction', 'Renovation', 'Repair', 'Demolition', 'Addition'],
    notes: ['Required before applying for Municipal Building Permit', 'Site inspection is mandatory'],
  },
  'id-issuance': {
    id: 'id-issuance',
    name: 'Barangay ID',
    category: 'IDs',
    description: 'Official identification card issued by the barangay',
    processingTime: '2-3 weeks',
    fee: '₱50.00',
    requirements: [
      'Birth Certificate (original and photocopy)',
      'Proof of Residency (Utility bill, lease contract)',
      '1x1 ID Picture (3 pieces)',
      'Valid government ID (if available)',
    ],
    procedures: [
      'Visit the Barangay Hall during ID processing schedule',
      'Fill out the ID application form',
      'Submit required documents',
      'Have your photo taken (if pictures not provided)',
      'Pay the ID processing fee',
      'Wait for 2-3 weeks for ID printing',
      'Claim ID with claim stub',
    ],
    validFor: '3 years',
    purposes: ['Proof of residency', 'Access to barangay services', 'Discounts at local establishments', 'Primary ID for residents'],
  },
};

// ==================== FREQUENTLY ASKED QUESTIONS ====================

export const faqDatabase = [
  {
    id: 'faq-1',
    question: 'What are your office hours?',
    answer: 'The Barangay Hall is open Monday to Friday, 8:00 AM to 5:00 PM. We are closed on weekends and holidays.',
    category: 'General',
    keywords: ['hours', 'time', 'schedule', 'open', 'office hours', 'available'],
  },
  {
    id: 'faq-2',
    question: 'How do I get a Barangay Clearance?',
    answer:
      'To get a Barangay Clearance, bring a valid ID, proof of residency, 1x1 ID picture, and cedula. Processing takes 1-2 days and costs ₱50. Visit during office hours to apply.',
    category: 'Clearance',
    keywords: ['barangay clearance', 'clearance', 'certificate', 'how to get', 'requirements'],
    relatedService: 'barangay-clearance',
  },
  {
    id: 'faq-3',
    question: 'How much is the Barangay Clearance fee?',
    answer: 'The Barangay Clearance fee is ₱50.00. Rush processing (same day) is available for an additional fee.',
    category: 'Fees',
    keywords: ['fee', 'cost', 'price', 'clearance', 'how much', 'payment'],
    relatedService: 'barangay-clearance',
  },
  {
    id: 'faq-4',
    question: 'How long is the Barangay Clearance valid?',
    answer: 'The Barangay Clearance is valid for 6 months from the date of issuance.',
    category: 'Clearance',
    keywords: ['validity', 'valid', 'expiry', 'expiration', 'how long', 'clearance'],
    relatedService: 'barangay-clearance',
  },
  {
    id: 'faq-5',
    question: 'What documents do I need for a Business Permit?',
    answer:
      'You need: DTI/SEC registration, Barangay Clearance, valid ID, lease contract, Fire Safety Certificate, Sanitary Permit (for food), and 2x2 photos. Processing takes 3-5 days.',
    category: 'Business',
    keywords: ['business permit', 'business', 'requirements', 'documents', 'start business'],
    relatedService: 'business-permit',
  },
  {
    id: 'faq-6',
    question: 'How do I report an incident?',
    answer:
      'You can report incidents through our online system by clicking "Report Incident" in the Incidents page, or visit the Barangay Hall in person. Emergency incidents should be reported immediately.',
    category: 'Incidents',
    keywords: ['report', 'incident', 'complaint', 'emergency', 'problem', 'issue'],
  },
  {
    id: 'faq-7',
    question: 'How do I apply for a Barangay ID?',
    answer:
      'Bring your birth certificate, proof of residency, 3 pieces of 1x1 photos, and ₱50 fee. Processing takes 2-3 weeks. The ID is valid for 3 years.',
    category: 'IDs',
    keywords: ['id', 'identification', 'barangay id', 'apply', 'how to get'],
    relatedService: 'id-issuance',
  },
  {
    id: 'faq-8',
    question: 'What is a Certificate of Indigency used for?',
    answer:
      'Certificate of Indigency is for low-income residents to access medical, educational, legal, and burial assistance programs. It\'s free but requires social worker verification.',
    category: 'Certificates',
    keywords: ['indigency', 'certificate', 'assistance', 'help', 'financial', 'poor'],
    relatedService: 'certificate-of-indigency',
  },
  {
    id: 'faq-9',
    question: 'Can I get same-day processing for clearance?',
    answer: 'Yes, rush processing is available for Barangay Clearance with an additional fee. Inquire at the front desk for rush processing rates.',
    category: 'Processing',
    keywords: ['rush', 'same day', 'fast', 'quick', 'urgent', 'expedite'],
  },
  {
    id: 'faq-10',
    question: 'What should I do if I lost my Barangay Clearance?',
    answer:
      'For lost clearance, visit the Barangay Hall with a valid ID and affidavit of loss. Request for reissuance. A minimal fee may apply.',
    category: 'Clearance',
    keywords: ['lost', 'missing', 'reissue', 'duplicate', 'replacement'],
  },
];

// ==================== AI RESPONSE GENERATION ====================

/**
 * Analyze user query and generate intelligent response
 * @param {string} query - User's question or request
 * @returns {Object} Response with text and suggested actions
 */
export const generateAIResponse = (query) => {
  const lowerQuery = query.toLowerCase();

  // Check for greetings
  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/i.test(lowerQuery)
  ) {
    return {
      text: "Hello! I'm your Barangay AI Assistant. I can help you with information about barangay services, requirements for clearances and permits, and answer frequently asked questions. How can I assist you today?",
      suggestions: ['Get Barangay Clearance', 'Apply for Business Permit', 'View all services', 'Common Questions'],
      type: 'greeting',
    };
  }

  // Check for help or general inquiry
  if (/help|assist|support|what can you do/i.test(lowerQuery)) {
    return {
      text: "I can help you with:\n\n• Information about barangay certificates (Clearance, Residency, Indigency)\n• Requirements for business and building permits\n• Barangay ID application\n• Office hours and contact information\n• Reporting incidents\n• Creating support tickets for complex concerns\n\nWhat would you like to know more about?",
      suggestions: ['Barangay Clearance', 'Business Permit', 'Report Incident', 'Office Hours'],
      type: 'help',
    };
  }

  // Search FAQs for matching answer
  const matchingFAQ = faqDatabase.find((faq) =>
    faq.keywords.some((keyword) => lowerQuery.includes(keyword.toLowerCase()))
  );

  if (matchingFAQ) {
    const response = {
      text: matchingFAQ.answer,
      faq: matchingFAQ,
      type: 'faq',
      suggestions: [],
    };

    // Add related service if available
    if (matchingFAQ.relatedService) {
      const service = barangayServices[matchingFAQ.relatedService];
      if (service) {
        response.relatedService = service;
        response.suggestions.push(`View ${service.name} details`);
      }
    }

    // Add suggestion to create ticket if answer might need follow-up
    response.suggestions.push('Create support ticket', 'Ask another question');

    return response;
  }

  // Search services
  const matchingService = Object.values(barangayServices).find((service) =>
    lowerQuery.includes(service.name.toLowerCase()) ||
    lowerQuery.includes(service.id.replace(/-/g, ' '))
  );

  if (matchingService) {
    return {
      text: `Here's information about ${matchingService.name}:\n\n${matchingService.description}\n\n**Processing Time:** ${matchingService.processingTime}\n**Fee:** ${matchingService.fee}\n\nWould you like to see the detailed requirements and procedures?`,
      service: matchingService,
      type: 'service',
      suggestions: ['View requirements', 'View procedures', 'View all services', 'Create support ticket'],
    };
  }

  // Check for specific keywords
  if (/office|hours|time|schedule|open/i.test(lowerQuery)) {
    return {
      text: 'The Barangay Hall is open:\n\n**Monday to Friday:** 8:00 AM - 5:00 PM\n**Closed:** Weekends and Holidays\n\nYou can also submit requests online through this system 24/7!',
      type: 'info',
      suggestions: ['View services', 'Create support ticket'],
    };
  }

  if (/contact|phone|email|address|location/i.test(lowerQuery)) {
    return {
      text: "**Contact Information:**\n\n📍 Address: [Your Barangay Address]\n📞 Phone: [Contact Number]\n📧 Email: [Email Address]\n\nYou can also reach us through this help desk system, and we'll respond to your inquiries!",
      type: 'info',
      suggestions: ['View services', 'Office hours', 'Create support ticket'],
    };
  }

  if (/report|incident|complaint|problem|emergency/i.test(lowerQuery)) {
    return {
      text: "To report an incident:\n\n1. Go to the Incidents page\n2. Click 'Report New Incident'\n3. Fill in the details with our AI-assisted form\n4. Submit and track the status\n\nFor emergencies, please call emergency hotlines immediately:\n🚨 Emergency: 911\n👮 Police: [Local Police Number]\n\nWould you like me to help you create a support ticket instead?",
      type: 'info',
      suggestions: ['Go to Incidents page', 'Create support ticket', 'View emergency contacts'],
    };
  }

  // Default response for unmatched queries
  return {
    text: "I understand you need help with: \"" +
      query +
      '"\n\nI don\'t have a specific answer for that, but I can:\n\n• Create a support ticket so our team can assist you personally\n• Show you our available services and FAQs\n• Connect you with a staff member\n\nWhat would you like to do?',
    type: 'unknown',
    suggestions: ['Create support ticket', 'View all services', 'View FAQs', 'Talk to staff'],
    needsTicket: true,
  };
};

/**
 * Get service information by ID or name
 * @param {string} identifier - Service ID or name
 * @returns {Object|null} Service information
 */
export const getServiceInfo = (identifier) => {
  const lowerIdentifier = identifier.toLowerCase();
  return (
    barangayServices[lowerIdentifier] ||
    Object.values(barangayServices).find(
      (service) =>
        service.name.toLowerCase() === lowerIdentifier ||
        service.id.toLowerCase() === lowerIdentifier
    ) ||
    null
  );
};

/**
 * Search FAQs by keyword
 * @param {string} keyword - Search keyword
 * @returns {Array} Matching FAQs
 */
export const searchFAQs = (keyword) => {
  const lowerKeyword = keyword.toLowerCase();
  return faqDatabase.filter(
    (faq) =>
      faq.question.toLowerCase().includes(lowerKeyword) ||
      faq.answer.toLowerCase().includes(lowerKeyword) ||
      faq.keywords.some((k) => k.toLowerCase().includes(lowerKeyword))
  );
};

/**
 * Get all services by category
 * @param {string} category - Service category
 * @returns {Array} Services in the category
 */
export const getServicesByCategory = (category) => {
  if (!category || category === 'all') {
    return Object.values(barangayServices);
  }
  return Object.values(barangayServices).filter(
    (service) => service.category.toLowerCase() === category.toLowerCase()
  );
};

/**
 * Get all FAQ categories
 * @returns {Array} Unique categories
 */
export const getFAQCategories = () => {
  return [...new Set(faqDatabase.map((faq) => faq.category))];
};

export default {
  barangayServices,
  faqDatabase,
  generateAIResponse,
  getServiceInfo,
  searchFAQs,
  getServicesByCategory,
  getFAQCategories,
};
