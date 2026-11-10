/**
 * Cryptographic Authentication & Role-Based Access Control (RBAC) Service
 * Roles: 'Owner' | 'Staff'
 * Algorithm: PBKDF2 with HMAC-SHA-256 (100,000 rounds) + 16-byte salt.
 */

const USERS_STORAGE_KEY = 'dokanpos_users';
const SESSION_STORAGE_KEY = 'dokanpos_session';
const PBKDF2_ITERATIONS = 100000;

function buf2hex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2)).join('');
}

function hex2buf(hexString) {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function generateSalt() {
  const salt = new Uint8Array(16);
  window.crypto.getRandomValues(salt);
  return buf2hex(salt.buffer);
}

export async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  const saltBuffer = hex2buf(saltHex);

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  return buf2hex(derivedBits);
}

export async function verifyPassword(candidatePassword, saltHex, storedHashHex) {
  const computedHashHex = await hashPassword(candidatePassword, saltHex);
  return computedHashHex === storedHashHex;
}

export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

/**
 * Seeds default Owner and Staff demo accounts if database is fresh.
 * Owner: owner@dokanpos.com / owner123
 * Staff: staff@dokanpos.com / staff123
 */
export async function initializeDefaultUsers() {
  const existing = getRegisteredUsers();
  if (existing.length === 0) {
    const ownerSalt = generateSalt();
    const ownerHash = await hashPassword('owner123', ownerSalt);

    const staffSalt = generateSalt();
    const staffHash = await hashPassword('staff123', staffSalt);

    const defaultUsers = [
      {
        id: 'usr-owner-1',
        email: 'owner@dokanpos.com',
        fullName: 'Shop Owner',
        role: 'Owner',
        salt: ownerSalt,
        passwordHash: ownerHash,
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-staff-1',
        email: 'staff@dokanpos.com',
        fullName: 'Sales Associate',
        role: 'Staff',
        salt: staffSalt,
        passwordHash: staffHash,
        createdAt: new Date().toISOString()
      }
    ];

    saveUsers(defaultUsers);
    return defaultUsers;
  }
  return existing;
}

export async function registerUser({ email, fullName, password, role = 'Staff' }) {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email address already exists!');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const newUser = {
    id: `usr-${Date.now()}`,
    email: normalizedEmail,
    fullName: fullName.trim(),
    role: role === 'Owner' ? 'Owner' : 'Staff',
    salt,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  return {
    id: newUser.id,
    email: newUser.email,
    fullName: newUser.fullName,
    role: newUser.role
  };
}

export async function authenticateUser(email, password) {
  await initializeDefaultUsers();
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    throw new Error('No user found with this email address.');
  }

  const isMatch = await verifyPassword(password, user.salt, user.passwordHash);
  if (!isMatch) {
    throw new Error('Incorrect password. Please try again.');
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role
  };

  setCurrentSession(sessionUser);
  return sessionUser;
}

/**
 * Staff management helpers (Owner only)
 */
export function getAllStaffAccounts() {
  const users = getRegisteredUsers();
  return users.map(u => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    createdAt: u.createdAt
  }));
}

export function deleteStaffAccount(targetUserId, currentUserId) {
  if (targetUserId === currentUserId) {
    throw new Error('Cannot delete your own active account!');
  }
  const users = getRegisteredUsers();
  const updated = users.filter(u => u.id !== targetUserId);
  saveUsers(updated);
  return getAllStaffAccounts();
}

/**
 * Role Permission Check Helpers
 */
export function isOwner(user) {
  return user?.role === 'Owner';
}

export function canViewReports(user) {
  return user?.role === 'Owner';
}

export function canDeleteProducts(user) {
  return user?.role === 'Owner';
}

export function canManageStaff(user) {
  return user?.role === 'Owner';
}

export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function setCurrentSession(user) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

export function clearCurrentSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
