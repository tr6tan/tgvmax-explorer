const axios = require('axios');

/**
 * Script pour analyser les vraies données SNCF
 */
async function analyzeSNCFData() {
  console.log('🔍 Analyse des données SNCF\n');

  try {
    // Récupérer les données SNCF
    const response = await axios.get('https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records', {
      params: {
        where: "od_happy_card='OUI'",
        limit: 100, // Plus de données pour l'analyse
        select: 'date,origine,destination,heure_depart,heure_arrivee,od_happy_card'
      }
    });

    if (response.status === 200) {
      const trains = response.data.results;
      console.log(`✅ ${trains.length} trains récupérés`);
      
      // Analyser les destinations
      const destinations = new Set();
      const departures = new Set();
      
      trains.forEach(train => {
        destinations.add(train.destination);
        departures.add(train.origine);
      });
      
      console.log('\n📊 Statistiques:');
      console.log(`🏙️ Destinations uniques: ${destinations.size}`);
      console.log(`🚉 Départs uniques: ${departures.size}`);
      
      console.log('\n🏙️ Toutes les destinations:');
      Array.from(destinations).sort().forEach(dest => {
        console.log(`   - "${dest}"`);
      });
      
      console.log('\n🚉 Tous les départs:');
      Array.from(departures).sort().forEach(dep => {
        console.log(`   - "${dep}"`);
      });
      
      // Analyser les patterns
      console.log('\n🔍 Analyse des patterns:');
      
      const parisTrains = trains.filter(train => 
        train.origine.toLowerCase().includes('paris')
      );
      
      console.log(`🚅 Trains depuis Paris: ${parisTrains.length}`);
      
      parisTrains.slice(0, 10).forEach((train, index) => {
        console.log(`   ${index + 1}. ${train.origine} → ${train.destination} (${train.heure_depart} - ${train.heure_arrivee})`);
      });
      
      // Créer un mapping suggéré
      console.log('\n🗺️ Mapping suggéré:');
      const cityMapping = {};
      
      Array.from(destinations).forEach(dest => {
        const upperDest = dest.toUpperCase();
        let mappedCity = null;
        
        // Patterns de mapping
        if (upperDest.includes('LYON')) mappedCity = 'Lyon';
        else if (upperDest.includes('MARSEILLE')) mappedCity = 'Marseille';
        else if (upperDest.includes('BORDEAUX')) mappedCity = 'Bordeaux';
        else if (upperDest.includes('NANTES')) mappedCity = 'Nantes';
        else if (upperDest.includes('TOULOUSE')) mappedCity = 'Toulouse';
        else if (upperDest.includes('LILLE')) mappedCity = 'Lille';
        else if (upperDest.includes('STRASBOURG')) mappedCity = 'Strasbourg';
        else if (upperDest.includes('NICE')) mappedCity = 'Nice';
        else if (upperDest.includes('MONTPELLIER')) mappedCity = 'Montpellier';
        else if (upperDest.includes('RENNES')) mappedCity = 'Rennes';
        else if (upperDest.includes('REIMS')) mappedCity = 'Reims';
        else if (upperDest.includes('DIJON')) mappedCity = 'Dijon';
        else if (upperDest.includes('ANGERS')) mappedCity = 'Angers';
        else if (upperDest.includes('LE MANS')) mappedCity = 'Le Mans';
        else if (upperDest.includes('POITIERS')) mappedCity = 'Poitiers';
        else if (upperDest.includes('TOURS')) mappedCity = 'Tours';
        else if (upperDest.includes('ORLEANS')) mappedCity = 'Orléans';
        else if (upperDest.includes('BESANCON')) mappedCity = 'Besançon';
        else if (upperDest.includes('MULHOUSE')) mappedCity = 'Mulhouse';
        else if (upperDest.includes('METZ')) mappedCity = 'Metz';
        else if (upperDest.includes('NANCY')) mappedCity = 'Nancy';
        else if (upperDest.includes('CLERMONT FERRAND')) mappedCity = 'Clermont-Ferrand';
        else if (upperDest.includes('SAINT ETIENNE')) mappedCity = 'Saint-Étienne';
        else if (upperDest.includes('GRENOBLE')) mappedCity = 'Grenoble';
        else if (upperDest.includes('AVIGNON')) mappedCity = 'Avignon';
        else if (upperDest.includes('AIX EN PROVENCE')) mappedCity = 'Aix-en-Provence';
        else if (upperDest.includes('CANNES')) mappedCity = 'Cannes';
        else if (upperDest.includes('ANTIBES')) mappedCity = 'Antibes';
        else if (upperDest.includes('SAINT RAPHAEL')) mappedCity = 'Saint-Raphaël';
        else if (upperDest.includes('FREJUS')) mappedCity = 'Fréjus';
        else if (upperDest.includes('SAINT TROPEZ')) mappedCity = 'Saint-Tropez';
        else if (upperDest.includes('HYERES')) mappedCity = 'Hyères';
        else if (upperDest.includes('TOULON')) mappedCity = 'Toulon';
        else if (upperDest.includes('PERPIGNAN')) mappedCity = 'Perpignan';
        else if (upperDest.includes('NARBONNE')) mappedCity = 'Narbonne';
        else if (upperDest.includes('BEZIERS')) mappedCity = 'Béziers';
        else if (upperDest.includes('AGDE')) mappedCity = 'Agde';
        else if (upperDest.includes('SETE')) mappedCity = 'Sète';
        else if (upperDest.includes('NIMES')) mappedCity = 'Nîmes';
        else if (upperDest.includes('ARLES')) mappedCity = 'Arles';
        else if (upperDest.includes('TARASCON')) mappedCity = 'Tarascon';
        else if (upperDest.includes('ORANGE')) mappedCity = 'Orange';
        else if (upperDest.includes('VALENCE')) mappedCity = 'Valence';
        else if (upperDest.includes('VIENNE')) mappedCity = 'Vienne';
        else if (upperDest.includes('MACON')) mappedCity = 'Mâcon';
        else if (upperDest.includes('CHALON SUR SAONE')) mappedCity = 'Chalon-sur-Saône';
        else if (upperDest.includes('BEAUNE')) mappedCity = 'Beaune';
        else if (upperDest.includes('MONTBARD')) mappedCity = 'Montbard';
        else if (upperDest.includes('TROYES')) mappedCity = 'Troyes';
        else if (upperDest.includes('BRUXELLES')) mappedCity = 'Bruxelles';
        else if (upperDest.includes('BIARRITZ')) mappedCity = 'Biarritz';
        else if (upperDest.includes('BAYONNE')) mappedCity = 'Bayonne';
        else if (upperDest.includes('HENDAYE')) mappedCity = 'Hendaye';
        else if (upperDest.includes('ST JEAN DE LUZ')) mappedCity = 'Saint-Jean-de-Luz';
        else if (upperDest.includes('DAX')) mappedCity = 'Dax';
        else if (upperDest.includes('FRASNE')) mappedCity = 'Frasne';
        else if (upperDest.includes('DOLE')) mappedCity = 'Dole';
        else if (upperDest.includes('TGV HAUTE PICARDIE')) mappedCity = 'TGV Haute-Picardie';
        else if (upperDest.includes('MARNE LA VALLEE')) mappedCity = 'Marne-la-Vallée';
        else if (upperDest.includes('DISNEYLAND')) mappedCity = 'Disneyland';
        else if (upperDest.includes('CHARLES DE GAULLE')) mappedCity = 'Charles de Gaulle';
        else if (upperDest.includes('ORLY')) mappedCity = 'Orly';
        else if (upperDest.includes('ROISSY')) mappedCity = 'Roissy';
        else if (upperDest.includes('AEROPORT')) mappedCity = 'Aéroport';
        
        if (mappedCity) {
          cityMapping[dest] = mappedCity;
          console.log(`   "${dest}" → "${mappedCity}"`);
        } else {
          console.log(`   "${dest}" → NON MAPPÉ`);
        }
      });
      
      console.log(`\n✅ ${Object.keys(cityMapping).length} destinations mappées sur ${destinations.size} total`);
      
    } else {
      console.log('❌ Erreur API SNCF:', response.status);
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
  }
}

// Lancer l'analyse
analyzeSNCFData(); 