const axios = require('axios');

/**
 * Test d'intégration avec les vraies données SNCF
 */
async function testRealSNCFIntegration() {
  console.log('🚅 Test d\'intégration avec les vraies données SNCF\n');

  try {
    // Test 1: Récupérer les vraies données SNCF
    console.log('1️⃣ Récupération des données SNCF...');
    const sncfResponse = await axios.get('https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records', {
      params: {
        where: "od_happy_card='OUI'",
        limit: 50
      }
    });

    if (sncfResponse.status === 200) {
      const trains = sncfResponse.data.results;
      console.log(`✅ ${trains.length} trains SNCF récupérés`);
      
      // Analyser les destinations
      const destinations = new Map();
      
      trains.forEach(train => {
        const cityName = extractCityName(train.destination);
        if (cityName) {
          if (!destinations.has(cityName)) {
            destinations.set(cityName, {
              city: cityName,
              trains: []
            });
          }
          destinations.get(cityName).trains.push(train);
        }
      });
      
      console.log(`\n🏙️ Destinations trouvées: ${destinations.size}`);
      destinations.forEach((dest, city) => {
        console.log(`   - ${city}: ${dest.trains.length} trains`);
      });
      
      // Test 2: Vérifier notre service
      console.log('\n2️⃣ Test de notre service...');
      
      // Simuler le traitement de notre service
      const processedData = processTrainData(trains, '2025-08-06');
      console.log(`📊 ${processedData.length} destinations traitées`);
      
      processedData.forEach(dest => {
        console.log(`   - ${dest.city}: ${dest.totalTrains} trains`);
      });
      
      // Test 3: Vérifier notre API
      console.log('\n3️⃣ Test de notre API...');
      const apiResponse = await axios.get('http://localhost:9090/api/all-trains?refresh=true');
      
      if (apiResponse.status === 200) {
        const data = apiResponse.data.data;
        console.log(`📊 ${data.length} destinations dans notre API`);
        
        data.forEach(dest => {
          console.log(`   - ${dest.city}: ${dest.totalTrains} trains`);
        });
        
        // Vérifier si nous utilisons les vraies données
        const hasRealData = data.some(dest => 
          dest.outboundTrains.some(train => 
            train.departureStation.includes('PARIS') || 
            train.arrivalStation.includes('LILLE') ||
            train.arrivalStation.includes('POITIERS')
          )
        );
        
        if (hasRealData) {
          console.log('✅ Notre API utilise les vraies données SNCF !');
        } else {
          console.log('⚠️ Notre API utilise les données de fallback');
          console.log('💡 Le problème vient du traitement des données');
        }
      }
      
    } else {
      console.log('❌ Erreur API SNCF:', sncfResponse.status);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

/**
 * Traite les données brutes des trains (simulation de notre service)
 */
function processTrainData(trains, date) {
  const destinations = new Map();
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  console.log(`Traitement de ${trains.length} trains...`);

  trains.forEach(train => {
    // Extraire les informations de la ville
    const cityName = extractCityName(train.destination);
    if (!cityName) {
      console.log(`Ville non reconnue: ${train.destination}`);
      return;
    }

    // Créer l'objet train
    const trainObj = {
      id: `${train.origine}-${train.destination}-${train.heure_depart}`,
      departureStation: train.origine,
      arrivalStation: train.destination,
      departureTime: `${date}T${train.heure_depart}`,
      arrivalTime: `${date}T${train.heure_arrivee}`,
      duration: calculateDuration(train.heure_depart, train.heure_arrivee),
      trainNumber: `TGV${Math.floor(Math.random() * 1000)}`,
      platform: Math.floor(Math.random() * 20) + 1
    };

    // Déterminer si c'est un train aller ou retour
    const isOutbound = train.origine.toLowerCase().includes('paris');
    
    if (!destinations.has(cityName)) {
      destinations.set(cityName, {
        id: cityName.toLowerCase().replace(/\s+/g, '-'),
        city: cityName,
        coordinates: { lat: 0, lng: 0 }, // Coordonnées temporaires
        outboundTrains: [],
        returnTrains: [],
        totalTrains: 0,
        availableTrains: 0
      });
    }

    const destination = destinations.get(cityName);
    
    if (isOutbound) {
      destination.outboundTrains.push(trainObj);
    } else {
      destination.returnTrains.push(trainObj);
    }

    // Calculer les statistiques
    const departureTime = new Date(trainObj.departureTime);
    const departureHour = departureTime.getHours();
    const departureMinute = departureTime.getMinutes();
    const departureTimeMinutes = departureHour * 60 + departureMinute;
    
    if (departureTimeMinutes >= currentTimeMinutes) {
      destination.availableTrains++;
    }
    
    destination.totalTrains++;
  });

  const result = Array.from(destinations.values());
  console.log(`✅ ${result.length} destinations traitées avec succès`);
  
  return result;
}

/**
 * Calcule la durée entre deux heures
 */
function calculateDuration(departureTime, arrivalTime) {
  const [depHour, depMin] = departureTime.split(':').map(Number);
  const [arrHour, arrMin] = arrivalTime.split(':').map(Number);
  
  let durationMinutes = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
  
  // Gérer le cas où le train arrive le lendemain
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}

/**
 * Extrait le nom de la ville depuis le nom de la gare
 */
function extractCityName(stationName) {
  const cityMappings = {
    'PARIS': 'Paris',
    'LYON': 'Lyon',
    'MARSEILLE': 'Marseille',
    'BORDEAUX': 'Bordeaux',
    'NANTES': 'Nantes',
    'TOULOUSE': 'Toulouse',
    'LILLE': 'Lille',
    'STRASBOURG': 'Strasbourg',
    'NICE': 'Nice',
    'MONTPELLIER': 'Montpellier',
    'RENNES': 'Rennes',
    'REIMS': 'Reims',
    'DIJON': 'Dijon',
    'ANGERS': 'Angers',
    'LE MANS': 'Le Mans',
    'POITIERS': 'Poitiers',
    'TOURS': 'Tours',
    'ORLEANS': 'Orléans',
    'BESANCON': 'Besançon',
    'MULHOUSE': 'Mulhouse',
    'METZ': 'Metz',
    'NANCY': 'Nancy',
    'CLERMONT FERRAND': 'Clermont-Ferrand',
    'SAINT ETIENNE': 'Saint-Étienne',
    'GRENOBLE': 'Grenoble',
    'AVIGNON': 'Avignon',
    'AIX EN PROVENCE': 'Aix-en-Provence',
    'CANNES': 'Cannes',
    'ANTIBES': 'Antibes',
    'SAINT RAPHAEL': 'Saint-Raphaël',
    'FREJUS': 'Fréjus',
    'SAINT TROPEZ': 'Saint-Tropez',
    'HYERES': 'Hyères',
    'TOULON': 'Toulon',
    'PERPIGNAN': 'Perpignan',
    'NARBONNE': 'Narbonne',
    'BEZIERS': 'Béziers',
    'AGDE': 'Agde',
    'SETE': 'Sète',
    'NIMES': 'Nîmes',
    'ARLES': 'Arles',
    'TARASCON': 'Tarascon',
    'ORANGE': 'Orange',
    'VALENCE': 'Valence',
    'VIENNE': 'Vienne',
    'MACON': 'Mâcon',
    'CHALON SUR SAONE': 'Chalon-sur-Saône',
    'BEAUNE': 'Beaune',
    'MONTBARD': 'Montbard',
    'TROYES': 'Troyes',
    'BRUXELLES': 'Bruxelles',
    'BIARRITZ': 'Biarritz',
    'BAYONNE': 'Bayonne',
    'HENDAYE': 'Hendaye',
    'ST JEAN DE LUZ': 'Saint-Jean-de-Luz',
    'DAX': 'Dax',
    'FRASNE': 'Frasne',
    'DOLE': 'Dole',
    'TGV HAUTE PICARDIE': 'TGV Haute-Picardie',
    'LA BAULE': 'La Baule',
    'LA ROCHELLE': 'La Rochelle',
    'LAVAL': 'Laval',
    'LE CROISIC': 'Le Croisic',
    'LOURDES': 'Lourdes',
    'MOULINS': 'Moulins',
    'NEVERS': 'Nevers',
    'NIORT': 'Niort',
    'OFFENBURG': 'Offenbourg',
    'PORNICHET': 'Pornichet',
    'REMIREMONT': 'Remiremont',
    'RIOM': 'Riom',
    'SURGERES': 'Surgeres',
    'VENDOME': 'Vendôme',
    'VICHY': 'Vichy',
    'CHAMBERY': 'Chambéry',
    'ALBERTVILLE': 'Albertville',
    'ANNECY': 'Annecy',
    'CHARLEVILLE': 'Charleville',
    'COLMAR': 'Colmar',
    'FREIBURG': 'Fribourg',
    'LE CREUSOT': 'Le Creusot',
    'MEUSE': 'Meuse',
    'ST NAZAIRE': 'Saint-Nazaire',
    'TOULON': 'Toulon',
    'VANNES': 'Vannes',
    'ANGOULEME': 'Angoulême',
    'LIBOURNE': 'Libourne',
    'VALENCIENNES': 'Valenciennes',
    'CHAMPAGNE ARDENNE': 'Champagne-Ardenne',
    'ARRAS': 'Arras',
    'BETHUNE': 'Béthune',
    'BELFORT': 'Belfort',
    'CHATEAUROUX': 'Châteauroux',
    'ROUBAIX': 'Roubaix'
  };

  const upperStation = stationName.toUpperCase();
  
  for (const [key, value] of Object.entries(cityMappings)) {
    if (upperStation.includes(key)) {
      return value;
    }
  }
  
  return null;
}

// Lancer le test
testRealSNCFIntegration(); 