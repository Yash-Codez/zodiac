import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting - max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

app.use(limiter);
app.use(cors());
app.use(express.json({ limit: '10mb' }));

/**
 * Calculate zodiac sign based on birth date
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} - Zodiac sign name
 */
function calculateZodiacSign(dateString) {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();

  // Zodiac date ranges
  const zodiacSigns = [
    { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
    { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
    { sign: 'Pisces', start: [2, 19], end: [3, 20] },
    { sign: 'Aries', start: [3, 21], end: [4, 19] },
    { sign: 'Taurus', start: [4, 20], end: [5, 20] },
    { sign: 'Gemini', start: [5, 21], end: [6, 20] },
    { sign: 'Cancer', start: [6, 21], end: [7, 22] },
    { sign: 'Leo', start: [7, 23], end: [8, 22] },
    { sign: 'Virgo', start: [8, 23], end: [9, 22] },
    { sign: 'Libra', start: [9, 23], end: [10, 22] },
    { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
    { sign: 'Sagittarius', start: [11, 22], end: [12, 21] }
  ];

  for (const zodiac of zodiacSigns) {
    const [startMonth, startDay] = zodiac.start;
    const [endMonth, endDay] = zodiac.end;

    // Handle signs that span across years (like Capricorn)
    if (startMonth > endMonth) {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return zodiac.sign;
      }
    } else {
      if ((month === startMonth && day >= startDay) || 
          (month === endMonth && day <= endDay) || 
          (month > startMonth && month < endMonth)) {
        return zodiac.sign;
      }
    }
  }
  
  return 'Unknown';
}

/**
 * Validate and sanitize user input
 * @param {string} name - User's name
 * @param {string} dateOfBirth - Date of birth
 * @returns {object} - Validation result
 */
function validateInput(name, dateOfBirth) {
  const errors = [];

  // Validate name
  if (!name || typeof name !== 'string') {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (name.trim().length > 50) {
    errors.push('Name must be less than 50 characters');
  } else if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
  }

  // Validate date of birth
  if (!dateOfBirth || typeof dateOfBirth !== 'string') {
    errors.push('Date of birth is required');
  } else if (!validator.isDate(dateOfBirth)) {
    errors.push('Invalid date format');
  } else {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const hundredYearsAgo = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    
    if (birthDate > today) {
      errors.push('Date of birth cannot be in the future');
    } else if (birthDate < hundredYearsAgo) {
      errors.push('Date of birth cannot be more than 120 years ago');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedName: name ? validator.escape(name.trim()) : '',
    sanitizedDate: dateOfBirth ? dateOfBirth.trim() : ''
  };
}

/**
 * Initialize data file if it doesn't exist
 */
async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    // File doesn't exist, create it with empty array
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Read data from JSON file
 * @returns {Array} - Array of user entries
 */
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return [];
  }
}

/**
 * Write data to JSON file
 * @param {Array} data - Array of user entries
 */
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to data file:', error);
    throw new Error('Failed to save data');
  }
}

// API Routes

/**
 * GET /api/entries - Get recent entries
 */
app.get('/api/entries', async (req, res) => {
  try {
    const data = await readData();
    // Return last 10 entries, most recent first
    const recentEntries = data.slice(-10).reverse();
    res.json({ success: true, entries: recentEntries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

/**
 * POST /api/calculate - Calculate zodiac sign and store entry
 */
app.post('/api/calculate', async (req, res) => {
  try {
    const { name, dateOfBirth } = req.body;

    // Validate input
    const validation = validateInput(name, dateOfBirth);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }

    // Calculate zodiac sign
    const zodiacSign = calculateZodiacSign(validation.sanitizedDate);

    // Create entry object
    const entry = {
      id: Date.now().toString(),
      name: validation.sanitizedName,
      dateOfBirth: validation.sanitizedDate,
      zodiacSign,
      timestamp: new Date().toISOString()
    };

    // Read existing data and add new entry
    const data = await readData();
    data.push(entry);

    // Keep only last 100 entries to prevent file from growing too large
    if (data.length > 100) {
      data.splice(0, data.length - 100);
    }

    // Save updated data
    await writeData(data);

    // Return success response with the calculated zodiac sign
    res.json({
      success: true,
      result: {
        name: validation.sanitizedName,
        dateOfBirth: validation.sanitizedDate,
        zodiacSign
      }
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize and start server
async function startServer() {
  try {
    await initializeDataFile();
    app.listen(PORT, () => {
      console.log(`🌟 Zodiac Calculator Server running on port ${PORT}`);
      console.log(`📊 Data file: ${DATA_FILE}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();