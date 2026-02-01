exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('phone', 20);
    table.enum('role', ['host', 'guest', 'both']).defaultTo('guest');
    table.string('avatar_url', 500);
    table.text('bio');
    table.boolean('verified').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('email', 'idx_email');
    table.index('role', 'idx_role');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
