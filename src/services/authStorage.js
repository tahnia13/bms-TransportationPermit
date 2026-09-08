const STORAGE_KEY = 'besmindo_admin_accounts';

const INITIAL_ADMINS = [
  {
    username: 'tahnia',
    password: 'tahnia123',
    fullName: 'Tahnia',
    email: 'tahnia@besmindo.co.id',
    role: 'Transportation Admin',
  },
];

export function getAdminAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMINS));
      return INITIAL_ADMINS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMINS));
      return INITIAL_ADMINS;
    }
    return parsed;
  } catch {
    return INITIAL_ADMINS;
  }
}

export function registerAdminAccount(account) {
  const accounts = getAdminAccounts();
  const trimmedUser = (account.username || '').trim();

  const exists = accounts.some(
    (a) => a.username.toLowerCase() === trimmedUser.toLowerCase()
  );

  if (exists) {
    throw new Error(`Username "${trimmedUser}" sudah digunakan. Silakan pilih username lain.`);
  }

  const newAccount = {
    username: trimmedUser,
    password: account.password.trim(),
    fullName: (account.fullName || trimmedUser).trim(),
    email: (account.email || '').trim(),
    phone: (account.phone || '').trim(),
    role: 'Transportation Admin',
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  return newAccount;
}

export function verifyAdminCredentials(username, password) {
  const accounts = getAdminAccounts();
  const trimmedUser = (username || '').trim().toLowerCase();
  const trimmedPass = (password || '').trim();

  return accounts.find(
    (a) =>
      a.username.toLowerCase() === trimmedUser &&
      a.password === trimmedPass
  );
}

export function resetAdminPassword(identifier, newPassword) {
  const accounts = getAdminAccounts();
  const trimmed = (identifier || '').trim().toLowerCase();

  const idx = accounts.findIndex(
    (a) =>
      a.username.toLowerCase() === trimmed ||
      (a.email && a.email.toLowerCase() === trimmed)
  );

  if (idx === -1) {
    throw new Error(`Akun dengan username atau email "${identifier}" tidak ditemukan.`);
  }

  accounts[idx].password = newPassword.trim();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  return accounts[idx];
}
