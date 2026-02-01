exports.seed = async function(knex) {
  // Clear existing amenities
  await knex('amenities').del();
  
  // Insert amenities
  await knex('amenities').insert([
    // Essentials
    { name: 'amenity.wifi', icon: '📶', category: 'essentials' },
    { name: 'amenity.heating', icon: '🔥', category: 'essentials' },
    { name: 'amenity.air_conditioning', icon: '❄️', category: 'essentials' },
    { name: 'amenity.hot_water', icon: '💧', category: 'essentials' },
    { name: 'amenity.kitchen', icon: '🍳', category: 'essentials' },
    { name: 'amenity.towels', icon: '🧻', category: 'essentials' },
    { name: 'amenity.bed_linens', icon: '🛏️', category: 'essentials' },
    { name: 'amenity.soap', icon: '🧼', category: 'essentials' },
    { name: 'amenity.toilet_paper', icon: '🧻', category: 'essentials' },
    
    // Features
    { name: 'amenity.tv', icon: '📺', category: 'features' },
    { name: 'amenity.washing_machine', icon: '🧺', category: 'features' },
    { name: 'amenity.dryer', icon: '👕', category: 'features' },
    { name: 'amenity.dishwasher', icon: '🍽️', category: 'features' },
    { name: 'amenity.coffee_maker', icon: '☕', category: 'features' },
    { name: 'amenity.microwave', icon: '📻', category: 'features' },
    { name: 'amenity.refrigerator', icon: '🧊', category: 'features' },
    { name: 'amenity.oven', icon: '🔥', category: 'features' },
    { name: 'amenity.iron', icon: '👔', category: 'features' },
    { name: 'amenity.hair_dryer', icon: '💨', category: 'features' },
    { name: 'amenity.desk_workspace', icon: '💼', category: 'features' },
    { name: 'amenity.bbq_grill', icon: '🍖', category: 'features' },
    { name: 'amenity.fireplace', icon: '🔥', category: 'features' },
    { name: 'amenity.piano', icon: '🎹', category: 'features' },
    { name: 'amenity.pool_table', icon: '🎱', category: 'features' },
    
    // Location Features
    { name: 'amenity.free_parking', icon: '🅿️', category: 'location' },
    { name: 'amenity.paid_parking', icon: '🅿️', category: 'location' },
    { name: 'amenity.gym', icon: '🏋️', category: 'location' },
    { name: 'amenity.pool', icon: '🏊', category: 'location' },
    { name: 'amenity.hot_tub', icon: '🛁', category: 'location' },
    { name: 'amenity.sauna', icon: '🧖', category: 'location' },
    { name: 'amenity.beach_access', icon: '🏖️', category: 'location' },
    { name: 'amenity.waterfront', icon: '🌊', category: 'location' },
    { name: 'amenity.garden', icon: '🌳', category: 'location' },
    { name: 'amenity.patio_balcony', icon: '🏡', category: 'location' },
    { name: 'amenity.sea_view', icon: '🌅', category: 'location' },
    
    // Safety
    { name: 'amenity.smoke_detector', icon: '🔔', category: 'safety' },
    { name: 'amenity.carbon_monoxide_detector', icon: '⚠️', category: 'safety' },
    { name: 'amenity.fire_extinguisher', icon: '🧯', category: 'safety' },
    { name: 'amenity.first_aid_kit', icon: '🏥', category: 'safety' },
    { name: 'amenity.security_cameras', icon: '📹', category: 'safety' },
    { name: 'amenity.lock_on_bedroom_door', icon: '🔐', category: 'safety' },
    
    // Accessibility
    { name: 'amenity.wheelchair_accessible', icon: '♿', category: 'accessibility' },
    { name: 'amenity.elevator', icon: '🛗', category: 'accessibility' },
    { name: 'amenity.ground_floor_access', icon: '🏠', category: 'accessibility' },
    { name: 'amenity.wide_doorways', icon: '🚪', category: 'accessibility' },
    { name: 'amenity.accessible_bathroom', icon: '🚽', category: 'accessibility' },
    
    // Pet Friendly
    { name: 'amenity.pets_allowed', icon: '🐕', category: 'features' },
    { name: 'amenity.pet_bowls', icon: '🥣', category: 'features' },
    
    // Family Friendly
    { name: 'amenity.baby_cot', icon: '👶', category: 'features' },
    { name: 'amenity.high_chair', icon: '🪑', category: 'features' },
    { name: 'amenity.children_books_toys', icon: '🧸', category: 'features' },
    { name: 'amenity.board_games', icon: '🎲', category: 'features' },
    
    // Outdoor
    { name: 'amenity.outdoor_furniture', icon: '🪑', category: 'location' },
    { name: 'amenity.outdoor_dining', icon: '🍽️', category: 'location' },
    { name: 'amenity.sun_loungers', icon: '🏖️', category: 'location' },
    { name: 'amenity.hammock', icon: '🌴', category: 'location' },
    
    // Entertainment
    { name: 'amenity.netflix', icon: '📺', category: 'features' },
    { name: 'amenity.sound_system', icon: '🔊', category: 'features' },
    { name: 'amenity.books', icon: '📚', category: 'features' },
    { name: 'amenity.bicycle', icon: '🚲', category: 'features' },
    { name: 'amenity.kayak', icon: '🚣', category: 'features' },
    { name: 'amenity.surfboard', icon: '🏄', category: 'features' }
  ]);
};
