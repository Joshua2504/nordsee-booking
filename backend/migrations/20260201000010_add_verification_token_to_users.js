exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.string('verification_token', 64);
    table.timestamp('verification_token_expires');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('verification_token');
    table.dropColumn('verification_token_expires');
  });
};
