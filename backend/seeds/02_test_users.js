const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Clear existing users (will cascade to related tables)
  await knex('users').del();
  
  // Hash password
  const password = await bcrypt.hash('password123', 10);
  
  // Insert test users
  await knex('users').insert([
    {
      id: 1,
      email: 'host@nordsee.com',
      password_hash: password,
      first_name: 'Max',
      last_name: 'Mustermann',
      phone: '+49 123 456789',
      role: 'host',
      verified: true
    },
    {
      id: 2,
      email: 'guest@nordsee.com',
      password_hash: password,
      first_name: 'Anna',
      last_name: 'Schmidt',
      phone: '+49 987 654321',
      role: 'guest',
      verified: true
    },
    {
      id: 3,
      email: 'both@nordsee.com',
      password_hash: password,
      first_name: 'Thomas',
      last_name: 'Müller',
      phone: '+49 555 123456',
      role: 'both',
      verified: true
    }
  ]);
};
