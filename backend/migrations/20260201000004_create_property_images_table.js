exports.up = function(knex) {
  return knex.schema.createTable('property_images', function(table) {
    table.increments('id').primary();
    table.integer('property_id').unsigned().notNullable();
    table.string('file_name', 255).notNullable();
    table.string('file_path', 500).notNullable().comment('Path relative to /data/uploads/');
    table.string('thumbnail_path', 500).comment('Small thumbnail (300x200)');
    table.string('medium_path', 500).comment('Medium size (800x600)');
    table.integer('file_size').notNullable().comment('File size in bytes');
    table.string('mime_type', 50).notNullable();
    table.integer('width');
    table.integer('height');
    table.integer('display_order').defaultTo(0);
    table.boolean('is_primary').defaultTo(false);
    table.string('alt_text', 255);
    table.timestamp('uploaded_at').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('property_id').references('properties.id').onDelete('CASCADE');
    
    // Indexes
    table.index(['property_id', 'display_order'], 'idx_property_order');
    table.index(['property_id', 'is_primary'], 'idx_property_primary');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('property_images');
};
