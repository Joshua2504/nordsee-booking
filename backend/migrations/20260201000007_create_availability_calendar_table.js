exports.up = function(knex) {
  return knex.schema.createTable('availability_calendar', function(table) {
    table.bigIncrements('id').primary();
    table.integer('property_id').unsigned().notNullable();
    table.date('date').notNullable();
    table.boolean('is_available').defaultTo(true);
    table.decimal('price', 10, 2).notNullable().comment('Daily price for this date');
    table.boolean('requires_approval').defaultTo(false).comment('Host approval required for this date');
    table.enum('status', ['available', 'booked', 'blocked', 'pending']).defaultTo('available');
    table.string('notes', 500).comment('Internal notes for host');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('property_id').references('properties.id').onDelete('CASCADE');
    
    // Indexes
    table.unique(['property_id', 'date'], 'unique_property_date');
    table.index(['property_id', 'date'], 'idx_property_date');
    table.index(['date', 'status'], 'idx_date_status');
    table.index(['date', 'is_available', 'status'], 'idx_date_available');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('availability_calendar');
};
