const axios = require('axios');

/**
 * Script de debug pour les données SNCF
 */
async function debugSNCF() {
  console.log('🔍 Debug des données SNCF\n');

  try {
    // Test 1: API SNCF directe
    console.log('1️⃣ Test API SNCF directe');
    const sncfResponse = await axios.get('https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records', {
      params: {
        where: "od_happy_card='OUI'",
        limit: 10
      }
    });

    if (sncfResponse.status === 200) {
      const trains = sncfResponse.data.results;
      console.log(`✅ ${trains.length} trains récupérés`);
      
      console.log('\n🚅 Exemples de trains:');
      trains.slice(0, 3).forEach((train, index) => {
        console.log(`   ${index + 1}. ${train.origine} → ${train.destination} (${train.heure_depart} - ${train.heure_arrivee})`);
      });
      
      // Test 2: Notre service
      console.log('\n2️⃣ Test de notre service');
      
      // Simuler le traitement de notre service
      const destinations = new Map();
      
      trains.forEach(train => {
        const cityName = extractCityName(train.destination);
        console.log(`   "${train.destination}" → "${cityName}"`);
        
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
      
      // Test 3: Notre API
      console.log('\n3️⃣ Test de notre API');
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
            train.arrivalStation.includes('DIJON') ||
            train.arrivalStation.includes('DOLE')
          )
        );
        
        if (hasRealData) {
          console.log('✅ Notre API utilise les vraies données SNCF !');
        } else {
          console.log('⚠️ Notre API utilise les données de fallback');
          console.log('💡 Le problème vient probablement du mapping des villes');
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
 * Extrait le nom de la ville depuis le nom de la gare
 */
function extractCityName(stationName) {
  const cityMappings = {
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
    'VANNES': 'Vannes'
  };

  const upperStation = stationName.toUpperCase();
  
  for (const [key, value] of Object.entries(cityMappings)) {
    if (upperStation.includes(key)) {
      return value;
    }
  }
  
  return null;
}

// Lancer le debug
debugSNCF(); 