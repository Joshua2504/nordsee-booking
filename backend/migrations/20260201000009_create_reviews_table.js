exports.up = function(knex) {
  return knex.schema.createTable('reviews', function(table) {
    table.increments('id').primary();
    table.integer('booking_id').unsigned().notNullable().unique();
    table.integer('property_id').unsigned().notNullable();
    table.integer('guest_id').unsigned().notNullable();
    table.integer('host_id').unsigned().notNullable();
    table.integer('rating').notNullable().comment('1-5 stars');
    table.integer('cleanliness_rating');
    table.integer('communication_rating');
    table.integer('checkin_rating');
    table.integer('accuracy_rating');
    table.integer('location_rating');
    table.integer('value_rating');
    table.text('comment');
    table.text('host_response');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('booking_id').references('bookings.id').onDelete('CASCADE');
    table.foreign('property_id').references('properties.id').onDelete('CASCADE');
    table.foreign('guest_id').references('users.id').onDelete('CASCADE');
    table.foreign('host_id').references('users.id').onDelete('CASCADE');
    
    // Indexes
    table.index('property_id', 'idx_property');
    table.index('rating', 'idx_rating');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('reviews');
};
