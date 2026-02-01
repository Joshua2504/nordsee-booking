exports.up = function(knex) {
  return knex.schema.createTable('properties', function(table) {
    table.increments('id').primary();
    table.integer('host_id').unsigned().notNullable();
    table.string('title', 255).notNullable().comment('Primary language title');
    table.text('description').notNullable().comment('Primary language description');
    table.enum('property_type', ['house', 'apartment', 'cottage', 'villa', 'room', 'other']).notNullable();
    table.string('address', 255).notNullable();
    table.string('city', 100).notNullable();
    table.string('postal_code', 20).notNullable();
    table.string('country', 100).defaultTo('Germany');
    table.decimal('latitude', 10, 8);
    table.decimal('longitude', 11, 8);
    table.integer('guest_capacity').notNullable();
    table.integer('bedrooms').notNullable();
    table.integer('beds').notNullable();
    table.decimal('bathrooms', 3, 1).notNullable();
    table.decimal('base_price', 10, 2).notNullable().comment('Default daily price');
    table.decimal('cleaning_fee', 10, 2).defaultTo(0);
    table.enum('status', ['draft', 'published', 'unpublished', 'archived']).defaultTo('draft');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('host_id').references('users.id').onDelete('CASCADE');
    
    // Indexes
    table.index('host_id', 'idx_host');
    table.index('city', 'idx_city');
    table.index('status', 'idx_status');
    table.index(['latitude', 'longitude'], 'idx_location');
    table.index('guest_capacity', 'idx_guest_capacity');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('properties');
};
