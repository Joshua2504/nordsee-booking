exports.seed = async function(knex) {
  // Check if properties already exist
  const existingProperties = await knex('properties').count('id as count').first();
  
  if (existingProperties.count > 0) {
    console.log('Properties already exist, skipping seed');
    return;
  }
  
  // Insert multiple default properties for host user (id: 1)
  const properties = [
    {
      id: 1,
      host_id: 1,
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
    },
    {
      id: 2,
      host_id: 1,
      title: 'Moderne Ferienwohnung in St. Peter-Ording',
      description: 'Stilvoll eingerichtete Wohnung nur 200m vom endlosen Sandstrand entfernt. Mit Balkon, Meerblick und Zugang zur Wellness-Area. Ideal für Strandurlaub und Entspannung.',
      property_type: 'apartment',
      address: 'Dünenstraße 15',
      city: 'St. Peter-Ording',
      postal_code: '25826',
      latitude: 54.3167,
      longitude: 8.6333,
      guest_capacity: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1,
      base_price: 120.00,
      cleaning_fee: 50.00,
      status: 'published'
    },
    {
      id: 3,
      host_id: 1,
      title: 'Reetdachhaus auf Föhr',
      description: 'Authentisches friesisches Reetdachhaus auf der grünen Insel Föhr. Traditioneller Charme trifft auf modernen Komfort. Großer Garten mit Grillplatz und Fahrräder inklusive.',
      property_type: 'house',
      address: 'Dorpstraat 8',
      city: 'Föhr',
      postal_code: '25938',
      latitude: 54.6833,
      longitude: 8.5167,
      guest_capacity: 5,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2,
      base_price: 150.00,
      cleaning_fee: 65.00,
      status: 'published'
    },
    {
      id: 4,
      host_id: 1,
      title: 'Luxus-Villa mit Meerblick in Kampen',
      description: 'Exklusive Designer-Villa in bester Lage von Kampen/Sylt. Panorama-Meerblick, Sauna, Whirlpool und gehobene Ausstattung. Perfekt für anspruchsvolle Gäste.',
      property_type: 'villa',
      address: 'Kampener Berg 23',
      city: 'Sylt',
      postal_code: '25999',
      latitude: 54.9667,
      longitude: 8.3500,
      guest_capacity: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 3,
      base_price: 350.00,
      cleaning_fee: 120.00,
      status: 'published'
    },
    {
      id: 5,
      host_id: 1,
      title: 'Strandnahe Wohnung in Büsum',
      description: 'Gemütliche Wohnung im Herzen von Büsum. Nur 5 Minuten zum Strand und zur Fußgängerzone. Perfekt für Paare und kleine Familien.',
      property_type: 'apartment',
      address: 'Hafenstraße 34',
      city: 'Büsum',
      postal_code: '25761',
      latitude: 54.1214,
      longitude: 8.8594,
      guest_capacity: 3,
      bedrooms: 1,
      beds: 2,
      bathrooms: 1,
      base_price: 85.00,
      cleaning_fee: 40.00,
      status: 'published'
    },
    {
      id: 6,
      host_id: 1,
      title: 'Ferienhaus mit Garten in Husum',
      description: 'Charmantes Ferienhaus mit großem Garten in der Theodor-Storm-Stadt Husum. Ruhige Lage, trotzdem zentral. Haustiere willkommen!',
      property_type: 'house',
      address: 'Gartenweg 12',
      city: 'Husum',
      postal_code: '25813',
      latitude: 54.4786,
      longitude: 9.0517,
      guest_capacity: 4,
      bedrooms: 2,
      beds: 3,
      bathrooms: 1,
      base_price: 95.00,
      cleaning_fee: 45.00,
      status: 'published'
    },
    {
      id: 7,
      host_id: 1,
      title: 'Penthouse-Wohnung in Cuxhaven',
      description: 'Moderne Penthouse-Wohnung mit Dachterrasse und Meerblick. Top-Lage direkt an der Promenade. Lift vorhanden.',
      property_type: 'apartment',
      address: 'Strandpromenade 88',
      city: 'Cuxhaven',
      postal_code: '27472',
      latitude: 53.8694,
      longitude: 8.6981,
      guest_capacity: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      base_price: 140.00,
      cleaning_fee: 55.00,
      status: 'published'
    },
    {
      id: 8,
      host_id: 1,
      title: 'Naturnahes Cottage auf Amrum',
      description: 'Kleines, gemütliches Cottage inmitten der Dünenlandschaft von Amrum. Perfekt für Naturliebhaber und Ruhesuchende. Kniepsand zu Fuß erreichbar.',
      property_type: 'cottage',
      address: 'Dünenweg 5',
      city: 'Amrum',
      postal_code: '25946',
      latitude: 54.6333,
      longitude: 8.3500,
      guest_capacity: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      base_price: 75.00,
      cleaning_fee: 35.00,
      status: 'published'
    }
  ];
  
  await knex('properties').insert(properties);
  console.log(`Created ${properties.length} default properties`);
  
  // Define amenity sets for different property types
  const amenitySets = {
    luxury: ['WiFi', 'Küche', 'Kostenloser Parkplatz', 'Meerblick', 'Strandzugang', 'Heizung', 'Waschmaschine', 'Terrasse oder Balkon', 'Garten', 'Grill'],
    standard: ['WiFi', 'Küche', 'Heizung', 'Waschmaschine', 'Terrasse oder Balkon'],
    basic: ['WiFi', 'Küche', 'Heizung']
  };
  
  // Property to amenity set mapping
  const propertyAmenityConfig = [
    { propertyId: 1, set: 'luxury' },
    { propertyId: 2, set: 'standard' },
    { propertyId: 3, set: 'luxury' },
    { propertyId: 4, set: 'luxury' },
    { propertyId: 5, set: 'basic' },
    { propertyId: 6, set: 'standard' },
    { propertyId: 7, set: 'standard' },
    { propertyId: 8, set: 'basic' }
  ];
  
  // Add amenities to properties
  for (const config of propertyAmenityConfig) {
    const amenityNames = amenitySets[config.set];
    const amenities = await knex('amenities')
      .whereIn('name', amenityNames)
      .select('id');
    
    if (amenities.length > 0) {
      const propertyAmenities = amenities.map(amenity => ({
        property_id: config.propertyId,
        amenity_id: amenity.id
      }));
      
      await knex('property_amenities').insert(propertyAmenities);
    }
  }
  
  console.log('Added amenities to all properties');
  
  // Generate availability calendar for next 12 months for each property
  const today = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 12);
  
  for (const property of properties) {
    const availabilityRecords = [];
    const currentDate = new Date(today);
    
    while (currentDate <= endDate) {
      // Add some variation in pricing (higher on weekends)
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendMultiplier = isWeekend ? 1.25 : 1.0;
      const price = Math.round(property.base_price * weekendMultiplier * 100) / 100;
      
      availabilityRecords.push({
        property_id: property.id,
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
    
    console.log(`Generated ${availabilityRecords.length} days of availability for property ${property.id}`);
  }
  
  console.log('All properties and availability calendars created successfully!');
};
