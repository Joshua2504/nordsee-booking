exports.up = function(knex) {
  return knex.schema.createTable('amenities', function(table) {
    table.increments('id').primary();
    table.string('name', 100).notNullable().unique().comment('Translation key (e.g., amenity.wifi)');
    table.string('icon', 50).comment('Icon class or emoji');
    table.enum('category', ['essentials', 'features', 'location', 'safety', 'accessibility']).defaultTo('features');
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('amenities');
};
