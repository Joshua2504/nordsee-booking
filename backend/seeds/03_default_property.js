exports.seed = async function(knex) {
  // Check if properties already exist
  const existingProperties = await knex('properties').count('id as count').first();
  
  if (existingProperties.count > 0) {
    console.log('Properties already exist, skipping seed');
    return;
  }
  
  // Insert default property for host user (id: 1)
  const [propertyId] = await knex('properties').insert([
    {
      id: 1,
      host_id: 1, // host@nordsee.com
      title: 'Gemütliches Strandhaus auf Sylt',
      description: 'Wunderschönes Ferienhaus direkt am Strand mit atemberaubendem Meerblick. Perfekt für Familien und Paare, die die Ruhe und Schönheit der Nordsee genießen möchten. Das Haus verfügt über eine voll ausgestattete Küche, gemütliches Wohnzimmer mit Kamin und eine große Terrasse mit Strandblick.',
      property_type: 'house',
      address: 'Strandweg 42',
      city: 'Sylt',
      postal_code: '25980',
      latitude: 54.9079,
      longitude: 8.3416,
      guest_capacity: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 2,
      base_price: 180.00,
      cleaning_fee: 75.00,
      status: 'published'
    }
  ]);
  
  console.log(`Default property created with ID: ${propertyId}`);
  
  // Add some popular amenities to the property
  const amenityNames = [
    'WiFi',
    'Küche',
    'Kostenloser Parkplatz',
    'Meerblick',
    'Strandzugang',
    'Heizung',
    'Waschmaschine',
    'Terrasse oder Balkon',
    'Garten',
    'Grill'
  ];
  
  // Get amenity IDs by name
  const amenities = await knex('amenities')
    .whereIn('name', amenityNames)
    .select('id');
  
  if (amenities.length > 0) {
    const propertyAmenities = amenities.map(amenity => ({
      property_id: propertyId,
      amenity_id: amenity.id
    }));
    
    await knex('property_amenities').insert(propertyAmenities);
    console.log(`Added ${amenities.length} amenities to property`);
  }
  
  // Generate availability calendar for next 12 months
  const today = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 12);
  
  const availabilityRecords = [];
  const currentDate = new Date(today);
  
  while (currentDate <= endDate) {
    // Add some variation in pricing (higher on weekends)
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const price = isWeekend ? 220.00 : 180.00;
    
    availabilityRecords.push({
      property_id: propertyId,
      date: currentDate.toISOString().split('T')[0],
      is_available: true,
      price: price,
      requires_approval: false,
      status: 'available'
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < availabilityRecords.length; i += batchSize) {
    const batch = availabilityRecords.slice(i, i + batchSize);
    await knex('availability_calendar').insert(batch);
  }
  
  console.log(`Generated ${availabilityRecords.length} days of availability calendar`);
  console.log('Default property setup complete!');
};
