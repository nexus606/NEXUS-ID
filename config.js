/*
  ╔══════════════════════════════════════════════════════════════╗
  ║              NEXUS ID — config.js  v3.1                      ║
  ║       Firebase Realtime Database - Complete Migration        ║
  ╠══════════════════════════════════════════════════════════════╣
  ║  SECURITY NOTE                                               ║
  ║  Firebase anon key is designed to be public.                ║
  ║  Real security lives in:                                     ║
  ║    • Firebase Auth rules (authenticated users only)          ║
  ║    • Firebase Realtime Database rules (per-user access)      ║
  ║  Always configure proper security rules in Firebase Console. ║
  ╚══════════════════════════════════════════════════════════════╝
*/


// ─────────────────────────────────────────────────────────────
// Firebase Config
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyDh5lSX8_T3ZFaiWaDj9Q3EaxCe3shGyYw",
  authDomain:        "school-id-fd71a.firebaseapp.com",
  databaseURL:       "https://school-id-fd71a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "school-id-fd71a",
  storageBucket:     "school-id-fd71a.firebasestorage.app",
  messagingSenderId: "703303375755",
  appId:             "1:703303375755:web:80cec02750fbaca9cd2d8e",
  measurementId:     "G-4EFBT3YXZR"
};

// Global Firebase references (initialized in each HTML file)
let fbApp = null;
let fbDb = null;


// ─────────────────────────────────────────────────────────────
// Admin Credentials  (used by admin login modal)
// ─────────────────────────────────────────────────────────────
// NOTE: Admin password is NOT stored here for security.
// The admin account must be created in Firebase Console first.
// Then the admin UID must be added to /profiles/{uid}/role='admin'.
const ADMIN_EMAIL     = 'nexusadmin@nexusid.com';


// ─────────────────────────────────────────────────────────────
// Support Topics  (customer-service dropdown)
// ─────────────────────────────────────────────────────────────
const SUPPORT_TOPICS = [
  'General Inquiry',
  'Login / Account Issue',
  'ID Card Problem',
  'Attendance Issue',
  'Grades Concern',
  'Technical Bug',
  'Other'
];


// ─────────────────────────────────────────────────────────────
// Role Definitions
// ─────────────────────────────────────────────────────────────
const STAFF_ROLES = ['teacher', 'id_maker', 'vice_principal', 'principal', 'admin'];

const ROLE_LABELS = {
  student:         'Student',
  teacher:         'Teacher',
  id_maker:        'ID Maker',
  vice_principal:  'Vice Principal',
  principal:       'Principal',
  admin:           'Administrator',
  parent:          'Parent'
};

const ROLE_COLORS = {
  student:         '#00f0ff',
  teacher:         '#00ff88',
  id_maker:        '#ffcc00',
  vice_principal:  '#ff8c00',
  principal:       '#b380ff',
  admin:           '#ff006e',
  parent:          '#ffcc00'
};


// ─────────────────────────────────────────────────────────────
// Grade Level Definitions
// ─────────────────────────────────────────────────────────────
const GRADE_LEVELS = {
  'Elementary': [
    'Kinder','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6'
  ],
  'Junior High School': [
    'Grade 7','Grade 8','Grade 9','Grade 10'
  ],
  'Senior High School': [
    'Grade 11','Grade 12'
  ],
  'College': [
    '1st Year College','2nd Year College','3rd Year College','4th Year College','5th Year College'
  ]
};


// ─────────────────────────────────────────────────────────────
// SHS Strand Options
// ─────────────────────────────────────────────────────────────
const SHS_STRANDS = [
  'ABM - Accountancy, Business & Management',
  'STEM - Science, Technology, Engineering & Math',
  'HUMSS - Humanities & Social Sciences',
  'GAS - General Academic Strand',
  'TVL - Technical-Vocational-Livelihood',
  'Sports Track',
  'Arts and Design Track'
];


// ─────────────────────────────────────────────────────────────
// General Constants
// ─────────────────────────────────────────────────────────────
const MAX_PHOTO_SIZE = 3 * 1024 * 1024; // 3 MB
const SCHOOL_YEARS   = ['2024-2025', '2025-2026', '2026-2027', '2027-2028'];

const SUBJECTS_LIST = [
  'Mathematics','English','Science','Filipino','Araling Panlipunan',
  'MAPEH','TLE','Values Education','ESP','AP','Reading','ICT',
  'Physical Education','Health','Research','Practical Arts',
  'Earth and Life Science','General Biology','General Chemistry',
  'General Mathematics','Statistics & Probability','Pre-Calculus',
  'Contemporary Philippine Arts','Media and Information Literacy',
  'Understanding Culture Society & Politics','Introduction to Philosophy',
  'Oral Communication','Reading & Writing','21st Century Literature',
  'Algebra','Geometry','Trigonometry','Calculus','Visual Arts',
  'Music','Philippine History','World History','Economics','Entrepreneurship'
];


// ─────────────────────────────────────────────────────────────
// Firebase Realtime Database Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Initialize Firebase Realtime Database connection
 * Call this after Firebase is loaded and initialized in your HTML
 * @param {object} app - Firebase app instance
 */
function initializeFirebaseDatabase(app) {
  fbApp = app;
  fbDb = window.firebase.database(app);
  console.log('✓ Firebase Realtime Database initialized');
}

/**
 * Push a notification to user's notifications list
 * @param {string} uid        – target user's Firebase UID
 * @param {string} title
 * @param {string} message
 * @param {string} type       – 'info' | 'success' | 'warning' | 'error'
 */
async function pushNotification(uid, title, message, type) {
  type = type || 'info';
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return false;
  }
  try {
    const notifId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await fbDb.ref(`notifications/${uid}/${notifId}`).set({
      title:        title,
      message:      message,
      type:         type,
      read:         false,
      created_at:   new Date().toISOString()
    });
    return true;
  } catch(e) {
    console.warn('pushNotification failed:', e.message);
    return false;
  }
}

/**
 * Write an audit log entry
 * @param {string} uid       – acting user's Firebase UID
 * @param {string} userName  – acting user's display name
 * @param {string} action    – snake_case action label, e.g. 'grade_encoded'
 * @param {string} details   – free-text details (optional)
 */
async function logAudit(uid, userName, action, details) {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return false;
  }
  try {
    const logId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await fbDb.ref(`audit_logs/${logId}`).set({
      user_uid:   uid,
      user_name:  userName  || 'Unknown',
      action:     action,
      details:    details   || '',
      created_at: new Date().toISOString()
    });
    return true;
  } catch(e) {
    console.warn('logAudit failed:', e.message);
    return false;
  }
}

/**
 * Save user profile to database
 * @param {string} uid - user's Firebase UID
 * @param {object} profileData - user profile object
 */
async function saveUserProfile(uid, profileData) {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return false;
  }
  try {
    await fbDb.ref(`profiles/${uid}`).set(profileData);
    return true;
  } catch(e) {
    console.warn('saveUserProfile failed:', e.message);
    return false;
  }
}

/**
 * Get user profile from database
 * @param {string} uid - user's Firebase UID
 */
async function getUserProfile(uid) {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return null;
  }
  try {
    const snapshot = await fbDb.ref(`profiles/${uid}`).once('value');
    return snapshot.val();
  } catch(e) {
    console.warn('getUserProfile failed:', e.message);
    return null;
  }
}

/**
 * Update user profile
 * @param {string} uid - user's Firebase UID
 * @param {object} updates - partial profile updates
 */
async function updateUserProfile(uid, updates) {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return false;
  }
  try {
    await fbDb.ref(`profiles/${uid}`).update(updates);
    return true;
  } catch(e) {
    console.warn('updateUserProfile failed:', e.message);
    return false;
  }
}

/**
 * Get all user profiles (staff/students)
 */
async function getAllProfiles() {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return {};
  }
  try {
    const snapshot = await fbDb.ref('profiles').once('value');
    return snapshot.val() || {};
  } catch(e) {
    console.warn('getAllProfiles failed:', e.message);
    return {};
  }
}

/**
 * Get profiles filtered by role
 * @param {string} role - user role to filter by
 */
async function getProfilesByRole(role) {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return {};
  }
  try {
    const snapshot = await fbDb.ref('profiles').once('value');
    const allProfiles = snapshot.val() || {};
    const filtered = {};
    
    for (const uid in allProfiles) {
      if (allProfiles[uid].role === role) {
        filtered[uid] = allProfiles[uid];
      }
    }
    
    return filtered;
  } catch(e) {
    console.warn('getProfilesByRole failed:', e.message);
    return {};
  }
}

/**
 * Save attendance record
 * @param {object} recordData - attendance record object
 */
async function saveAttendanceRecord(recordData) {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return false;
  }
  try {
    const recordId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await fbDb.ref(`attendance_records/${recordId}`).set({
      ...recordData,
      created_at: new Date().toISOString()
    });
    return true;
  } catch(e) {
    console.warn('saveAttendanceRecord failed:', e.message);
    return false;
  }
}

/**
 * Get attendance records for a student
 * @param {string} studentUid - student's Firebase UID
 */
async function getStudentAttendance(studentUid) {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return {};
  }
  try {
    const snapshot = await fbDb.ref('attendance_records').once('value');
    const allRecords = snapshot.val() || {};
    const studentRecords = {};
    
    for (const recordId in allRecords) {
      if (allRecords[recordId].student_firebase_uid === studentUid) {
        studentRecords[recordId] = allRecords[recordId];
      }
    }
    
    return studentRecords;
  } catch(e) {
    console.warn('getStudentAttendance failed:', e.message);
    return {};
  }
}

/**
 * Save grade record
 * @param {string} studentUid - student's Firebase UID
 * @param {string} subject - subject name
 * @param {number} grade - numeric grade value
 */
async function saveGrade(studentUid, subject, grade) {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return false;
  }
  try {
    const gradeId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await fbDb.ref(`grades/${gradeId}`).set({
      student_uid: studentUid,
      subject: subject,
      grade: grade,
      created_at: new Date().toISOString()
    });
    return true;
  } catch(e) {
    console.warn('saveGrade failed:', e.message);
    return false;
  }
}

/**
 * Get all grades for a student
 * @param {string} studentUid - student's Firebase UID
 */
async function getStudentGrades(studentUid) {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return [];
  }
  try {
    const snapshot = await fbDb.ref('grades').once('value');
    const allGrades = snapshot.val() || {};
    const studentGrades = {};
    
    for (const gradeId in allGrades) {
      if (allGrades[gradeId].student_uid === studentUid) {
        studentGrades[gradeId] = allGrades[gradeId];
      }
    }
    
    return studentGrades;
  } catch(e) {
    console.warn('getStudentGrades failed:', e.message);
    return [];
  }
}

/**
 * Save announcement
 * @param {object} announcementData - announcement object
 */
async function saveAnnouncement(announcementData) {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return false;
  }
  try {
    const announcementId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await fbDb.ref(`announcements/${announcementId}`).set(announcementData);
    return true;
  } catch(e) {
    console.warn('saveAnnouncement failed:', e.message);
    return false;
  }
}

/**
 * Get all announcements
 */
async function getAllAnnouncements() {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return {};
  }
  try {
    const snapshot = await fbDb.ref('announcements').once('value');
    return snapshot.val() || {};
  } catch(e) {
    console.warn('getAllAnnouncements failed:', e.message);
    return {};
  }
}

/**
 * Save parent-child relationship
 * @param {string} parentUid - parent's Firebase UID
 * @param {string} childUid - child's Firebase UID
 */
async function linkParentChild(parentUid, childUid) {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return false;
  }
  try {
    const linkId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await fbDb.ref(`parent_children/${linkId}`).set({
      parent_uid: parentUid,
      child_uid: childUid,
      created_at: new Date().toISOString()
    });
    return true;
  } catch(e) {
    console.warn('linkParentChild failed:', e.message);
    return false;
  }
}

/**
 * Get all children for a parent
 * @param {string} parentUid - parent's Firebase UID
 */
async function getParentChildren(parentUid) {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return {};
  }
  try {
    const snapshot = await fbDb.ref('parent_children').once('value');
    const allLinks = snapshot.val() || {};
    const children = {};
    
    for (const linkId in allLinks) {
      if (allLinks[linkId].parent_uid === parentUid) {
        children[linkId] = allLinks[linkId];
      }
    }
    
    return children;
  } catch(e) {
    console.warn('getParentChildren failed:', e.message);
    return {};
  }
}

/**
 * Save support message
 * @param {object} messageData - support message object
 */
async function saveSupportMessage(messageData) {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return false;
  }
  try {
    const messageId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await fbDb.ref(`support_messages/${messageId}`).set({
      ...messageData,
      created_at: new Date().toISOString()
    });
    return true;
  } catch(e) {
    console.warn('saveSupportMessage failed:', e.message);
    return false;
  }
}

/**
 * Get all support messages
 */
async function getAllSupportMessages() {
  if (!fbDb) {
    console.warn('Firebase not initialized');
    return {};
  }
  try {
    const snapshot = await fbDb.ref('support_messages').once('value');
    return snapshot.val() || {};
  } catch(e) {
    console.warn('getAllSupportMessages failed:', e.message);
    return {};
  }
}


// ─────────────────────────────────────────────────────────────
// Grade Helpers
// ─────────────────────────────────────────────────────────────

/** Returns a hex colour for a numeric grade value. */
function getGradeColor(g) {
  var v = parseFloat(g);
  if (isNaN(v))  return 'rgba(255,255,255,0.3)';
  if (v >= 90)   return '#00ff88';
  if (v >= 85)   return '#00f0ff';
  if (v >= 80)   return '#b380ff';
  if (v >= 75)   return '#ffcc00';
  return '#ff4d94';
}

/** Returns "Passed" / "Failed" / "Outstanding" etc. for a grade. */
function getGradeRemarks(g) {
  var v = parseFloat(g);
  if (isNaN(v))  return '—';
  if (v >= 90)   return 'Outstanding';
  if (v >= 85)   return 'Very Satisfactory';
  if (v >= 80)   return 'Satisfactory';
  if (v >= 75)   return 'Fairly Satisfactory';
  return 'Did Not Meet';
}

/** Compute GPA from an array of numeric grade values. */
function computeGPA(gradesArray) {
  if (!gradesArray || gradesArray.length === 0) return '—';
  var nums = gradesArray.map(g => parseFloat(g)).filter(g => !isNaN(g));
  if (!nums.length) return '—';
  var avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return avg.toFixed(2);
}


// ─────────────────────────────────────────────────────────────
// HTML Option Builder Helpers
// ─────────────────────────────────────────────────────────────

/** Returns <option> tags for all grade levels (grouped). */
function buildGradeLevelOptions(selected) {
  var html = '<option value="">Select Grade Level</option>';
  for (var group in GRADE_LEVELS) {
    html += '<optgroup label="' + group + '">';
    GRADE_LEVELS[group].forEach(function(lvl) {
      html += '<option value="' + lvl + '"' + (lvl === selected ? ' selected' : '') + '>' + lvl + '</option>';
    });
    html += '</optgroup>';
  }
  return html;
}

/** Returns <option> tags for all subjects. */
function buildSubjectOptions(selected) {
  return SUBJECTS_LIST.map(function(s) {
    return '<option value="' + s + '"' + (s === selected ? ' selected' : '') + '>' + s + '</option>';
  }).join('');
}

/** Returns <option> tags for support topics. */
function buildSupportTopicOptions(selected) {
  return SUPPORT_TOPICS.map(function(t) {
    return '<option value="' + t + '"' + (t === selected ? ' selected' : '') + '>' + t + '</option>';
  }).join('');
}


// ─────────────────────────────────────────────────────────────
// QR Code Helper
// ─────────────────────────────────────────────────────────────

/**
 * Returns a QR-code image URL for a given data string.
 * Uses the free QR Server API (no key needed).
 * @param {string} data  – the text/UID to encode
 * @param {number} size  – pixel size (default 200)
 */
function getQRUrl(data, size) {
  size = size || 200;
  return 'https://api.qrserver.com/v1/create-qr-code/?size=' +
         size + 'x' + size + '&data=' + encodeURIComponent(data) +
         '&bgcolor=050510&color=b380ff&qzone=1&format=png';
}


// ─────────────────────────────────────────────────────────────
// Copy-to-Clipboard Helper  (used by admin credentials modal)
// ─────────────────────────────────────────────────────────────

/**
 * Copy `text` to clipboard, then briefly change the button label.
 * @param {string} text
 * @param {HTMLElement} btn  – the button element that was clicked
 */
function copyText(text, btn) {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(text).then(function() {
    var orig = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.color  = '#00ff88';
    setTimeout(function() {
      btn.textContent = orig;
      btn.style.color  = '';
    }, 1600);
  }).catch(function() {});
}


// ─────────────────────────────────────────────────────────────
// String / Validation Utilities
// ─────────────────────────────────────────────────────────────

/** Returns true if `email` looks like a valid email address. */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

/** Returns true if `phone` looks like a PH mobile number. */
function isValidPHPhone(phone) {
  return /^(09|\+639)\d{9}$/.test(String(phone || '').trim());
}

/** Truncates `str` to `max` chars, appending "…" if needed. */
function truncate(str, max) {
  str = String(str || '');
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/** Capitalise the first letter of every word. */
function toTitleCase(str) {
  return String(str || '').replace(/\w/g, function(c) { return c.toUpperCase(); });
}

/** Get label for a role */
function getRoleLabel(role) {
  return ROLE_LABELS[role] || role;
}

/** Get color for a role */
function getRoleColor(role) {
  return ROLE_COLORS[role] || '#b380ff';
}

/** Check if a role is admin */
function isAdmin(role) {
  return role === 'admin';
}

/** Check if a role is staff */
function isStaff(role) {
  return STAFF_ROLES.includes(role);
}
