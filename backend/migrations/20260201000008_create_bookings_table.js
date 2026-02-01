exports.up = function(knex) {
  return knex.schema.createTable('bookings', function(table) {
    table.increments('id').primary();
    table.integer('property_id').unsigned().notNullable();
    table.integer('guest_id').unsigned().notNullable();
    table.integer('host_id').unsigned().notNullable();
    table.date('check_in').notNullable();
    table.date('check_out').notNullable();
    table.integer('guests').notNullable();
    table.integer('nights').notNullable();
    table.decimal('base_amount', 10, 2).notNullable();
    table.decimal('cleaning_fee', 10, 2).defaultTo(0);
    table.decimal('service_fee', 10, 2).defaultTo(0).comment('Platform fee');
    table.decimal('total_amount', 10, 2).notNullable();
    table.enum('status', ['pending', 'confirmed', 'cancelled', 'completed', 'rejected']).defaultTo('pending');
    table.enum('payment_status', ['unpaid', 'paid', 'refunded']).defaultTo('unpaid');
    table.string('payment_method', 50).comment('Mock payment: credit_card, paypal, etc.');
    table.text('special_requests');
    table.text('cancellation_reason');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('property_id').references('properties.id').onDelete('RESTRICT');
    table.foreign('guest_id').references('users.id').onDelete('RESTRICT');
    table.foreign('host_id').references('users.id').onDelete('RESTRICT');
    
    // Indexes
    table.index('property_id', 'idx_property');
    table.index('guest_id', 'idx_guest');
    table.index('host_id', 'idx_host');
    table.index('check_in', 'idx_check_in');
    table.index('status', 'idx_status');
    table.index(['check_in', 'check_out'], 'idx_dates');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('bookings');
};
