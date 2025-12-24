export const BRANDING = {
  // Panchayat Details
  PANCHAYAT_NAME: 'लोनी ग्राम पंचायत',
  PANCHAYAT_NAME_EN: 'Loni Gram Panchayat',
  
  // Location
  DISTRICT: 'बुरहानपुर',
  DISTRICT_EN: 'Burhanpur',
  STATE: 'मध्य प्रदेश',
  STATE_EN: 'Madhya Pradesh',
  
  // System Name
  SYSTEM_NAME: 'कर संग्रहण प्रणाली',
  SYSTEM_NAME_EN: 'Tax Collection System',
  
  // Full Title
  FULL_TITLE: 'लोनी ग्राम पंचायत - ऑनलाइन कर प्रबंधन एवं संग्रहण प्रणाली',
  FULL_TITLE_EN: 'Loni Gram Panchayat - Online Tax Management & Collection System',
  
  // Office Address
  OFFICE_ADDRESS: {
    hi: 'ग्राम पंचायत कार्यालय, लोनी, जिला बुरहानपुर (म.प.)',
    en: 'Gram Panchayat Office, Loni, District Burhanpur (M.P.)'
  },
  
  // Contact
  PHONE: '07325-XXXXXX', // Burhanpur STD Code
  MOBILE: '+91-XXXXXXXXXX',
  EMAIL: 'lonipanchayat.burhanpur@mp.gov.in',
  
  // Government References
  DEPARTMENT: 'पंचायत एवं ग्रामीण विकास विभाग',
  DEPARTMENT_EN: 'Panchayat and Rural Development Department',
  
  // Legal
  COPYRIGHT: '© 2024 लोनी ग्राम पंचायत, बुरहानपुर. सर्वाधिकार सुरक्षित',
  COPYRIGHT_EN: '© 2024 Loni Gram Panchayat, Burhanpur. All Rights Reserved',
  
  // Logos
  LOGOS: {
    STATE_EMBLEM: '/images/mp-emblem.png',
    PANCHAYAT_LOGO: '/images/loni-panchayat-logo.png',
    DIGITAL_INDIA: '/images/digital-india.png',
  },
  
  // Tax Act Reference
  ACT_REFERENCE: 'मध्यप्रदेश पंचायत राज अधिनियम 1993',
  ACT_REFERENCE_EN: 'Madhya Pradesh Panchayat Raj Act 1993',
} as const;

export const TAX_TYPES = {
  HOUSE_TAX: {
    hi: 'गृह कर',
    en: 'House Tax',
    code: 'HOUSE',
  },
  WATER_TAX: {
    hi: 'जल कर',
    en: 'Water Tax',
    code: 'WATER',
  },
  LIGHTING_TAX: {
    hi: 'प्रकाश कर',
    en: 'Lighting Tax',
    code: 'LIGHTING',
  },
  HEALTH_TAX: {
    hi: 'स्वास्थ्य कर',
    en: 'Health Tax',
    code: 'HEALTH',
  },
  EDUCATION_TAX: {
    hi: 'शिक्षा कर',
    en: 'Education Tax',
    code: 'EDUCATION',
  },
} as const;
