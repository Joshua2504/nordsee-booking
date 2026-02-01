exports.up = function(knex) {
  return knex.schema.createTable('property_translations', function(table) {
    table.increments('id').primary();
    table.integer('property_id').unsigned().notNullable();
    table.string('language_code', 5).notNullable().comment('ISO 639-1 code: de, en, fr, nl, etc.');
    table.string('title', 255).notNullable();
    table.text('description').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('property_id').references('properties.id').onDelete('CASCADE');
    
    // Indexes
    table.unique(['property_id', 'language_code'], 'unique_property_language');
    table.index('language_code', 'idx_language');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('property_translations');
};
