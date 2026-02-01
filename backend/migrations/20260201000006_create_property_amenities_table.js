exports.up = function(knex) {
  return knex.schema.createTable('property_amenities', function(table) {
    table.integer('property_id').unsigned().notNullable();
    table.integer('amenity_id').unsigned().notNullable();
    
    // Primary key
    table.primary(['property_id', 'amenity_id']);
    
    // Foreign keys
    table.foreign('property_id').references('properties.id').onDelete('CASCADE');
    table.foreign('amenity_id').references('amenities.id').onDelete('CASCADE');
    
    // Indexes
    table.index('amenity_id', 'idx_amenity');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('property_amenities');
};
