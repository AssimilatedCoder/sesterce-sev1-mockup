/**
 * Star Wars inspired password generator
 * Generates secure passwords using Star Wars characters, planets, and themes
 */

const starWarsWords = {
  characters: [
    'Luke', 'Leia', 'Han', 'Chewbacca', 'Yoda', 'Obi', 'Anakin', 'Padme', 'Mace', 'Qui',
    'Vader', 'Palpatine', 'Maul', 'Dooku', 'Grievous', 'Kylo', 'Rey', 'Finn', 'Poe', 'BB8',
    'R2D2', 'C3PO', 'Boba', 'Jango', 'Ahsoka', 'Ezra', 'Kanan', 'Sabine', 'Zeb', 'Hera',
    'Thrawn', 'Tarkin', 'Krennic', 'Jyn', 'Cassian', 'K2SO', 'Chirrut', 'Baze', 'Bodhi'
  ],
  planets: [
    'Tatooine', 'Alderaan', 'Yavin', 'Hoth', 'Dagobah', 'Bespin', 'Endor', 'Naboo', 'Coruscant',
    'Kamino', 'Geonosis', 'Mustafar', 'Kashyyyk', 'Utapau', 'Mygeeto', 'Felucia', 'Cato',
    'Jakku', 'Takodana', 'Starkiller', 'Ahch', 'Crait', 'Cantonica', 'Exegol', 'Pasaana',
    'Kijimi', 'Mandalore', 'Lothal', 'Atollon', 'Scarif', 'Jedha', 'Eadu', 'Ryloth'
  ],
  ships: [
    'Falcon', 'Destroyer', 'Fighter', 'Bomber', 'Cruiser', 'Corvette', 'Frigate', 'Dreadnought',
    'Interceptor', 'Shuttle', 'Transport', 'Gunship', 'Speeder', 'Walker', 'Tank', 'Starfighter'
  ],
  forces: [
    'Jedi', 'Sith', 'Force', 'Lightsaber', 'Crystal', 'Temple', 'Council', 'Order', 'Academy',
    'Padawan', 'Knight', 'Master', 'Lord', 'Emperor', 'Apprentice', 'Guardian', 'Sentinel'
  ]
};

const specialChars = ['!', '@', '#', '$', '%', '&', '*', '+', '=', '?'];
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Get a random element from an array
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get a random number between min and max (inclusive)
 */
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate a Star Wars inspired password
 * Format: [Character/Planet][Number][SpecialChar][Ship/Force][Number]
 * Example: Luke42@Falcon7, Vader88#Sith3, Rey25!Jedi9
 */
export function generateStarWarsPassword(): string {
  const allWords = [
    ...starWarsWords.characters,
    ...starWarsWords.planets
  ];
  
  const allSuffixes = [
    ...starWarsWords.ships,
    ...starWarsWords.forces
  ];
  
  // Pick main word (character or planet)
  const mainWord = capitalize(getRandomElement(allWords));
  
  // Pick suffix word (ship or force term)
  const suffixWord = capitalize(getRandomElement(allSuffixes));
  
  // Generate numbers
  const firstNumber = getRandomNumber(10, 99);
  const secondNumber = getRandomNumber(1, 9);
  
  // Pick special character
  const specialChar = getRandomElement(specialChars);
  
  // Construct password
  const password = `${mainWord}${firstNumber}${specialChar}${suffixWord}${secondNumber}`;
  
  return password;
}

/**
 * Generate multiple Star Wars passwords and return the best one
 * (ensures good length and character distribution)
 */
export function generateSecureStarWarsPassword(): string {
  const candidates: string[] = [];
  
  // Generate 5 candidates
  for (let i = 0; i < 5; i++) {
    candidates.push(generateStarWarsPassword());
  }
  
  // Pick the one with best length (12-16 characters is ideal)
  const idealLength = 14;
  let bestPassword = candidates[0];
  let bestScore = Math.abs(bestPassword.length - idealLength);
  
  for (const candidate of candidates) {
    const score = Math.abs(candidate.length - idealLength);
    if (score < bestScore) {
      bestScore = score;
      bestPassword = candidate;
    }
  }
  
  return bestPassword;
}

/**
 * Generate a temporary password for new users
 * Shorter format for easier initial login: [Character][Number][Special]
 */
export function generateTempStarWarsPassword(): string {
  const character = capitalize(getRandomElement(starWarsWords.characters));
  const number = getRandomNumber(10, 99);
  const special = getRandomElement(specialChars);
  
  return `${character}${number}${special}`;
}

/**
 * Validate if a password meets security requirements
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 50) {
    errors.push('Password must be less than 50 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%&*+=?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%&*+=?)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a username suggestion based on first and last name
 */
export function generateUsername(firstName: string, lastName: string): string {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  
  // Various username formats
  const formats = [
    `${cleanFirst}.${cleanLast}`,
    `${cleanFirst}${cleanLast}`,
    `${cleanFirst.charAt(0)}${cleanLast}`,
    `${cleanFirst}${cleanLast.charAt(0)}`,
    `${cleanFirst}${getRandomNumber(10, 99)}`
  ];
  
  return getRandomElement(formats);
}
