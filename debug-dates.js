const axios = require('axios');

async function checkAvailableDates() {
  console.log('📅 Vérification des dates disponibles dans l\'API SNCF...\n');
  
  try {
    const response = await axios.get('https://data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records', {
      params: {
        limit: 50,
        where: "od_happy_card='OUI'"
      },
      timeout: 15000
    });

    if (response.data && response.data.results) {
      const trains = response.data.results;
      console.log(`✅ ${trains.length} trains TGVmax récupérés`);
      
      // Extraire les dates uniques
      const dates = [...new Set(trains.map(train => train.date))].sort();
      console.log(`\n📅 ${dates.length} dates disponibles:`);
      dates.forEach(date => {
        const trainsForDate = trains.filter(train => train.date === date);
        console.log(`  - ${date}: ${trainsForDate.length} trains`);
      });
      
      // Afficher quelques exemples de trains
      console.log('\n🚄 Exemples de trains TGVmax:');
      trains.slice(0, 5).forEach((train, index) => {
        console.log(`  ${index + 1}. ${train.date} - ${train.origine} → ${train.destination} (${train.heure_depart}-${train.heure_arrivee})`);
      });
      
      // Tester avec la première date disponible
      if (dates.length > 0) {
        const testDate = dates[0];
        console.log(`\n🧪 Test avec la date ${testDate}:`);
        
        const trainsForTestDate = trains.filter(train => train.date === testDate);
        const montpellierTrains = trainsForTestDate.filter(train => 
          train.origine.toLowerCase().includes('montpellier')
        );
        
        console.log(`  - ${trainsForTestDate.length} trains pour ${testDate}`);
        console.log(`  - ${montpellierTrains.length} trains depuis Montpellier`);
        
        if (montpellierTrains.length > 0) {
          console.log('  Exemples de trains depuis Montpellier:');
          montpellierTrains.slice(0, 3).forEach((train, index) => {
            console.log(`    ${index + 1}. ${train.origine} → ${train.destination} (${train.heure_depart}-${train.heure_arrivee})`);
          });
        }
      }
      
    } else {
      console.log('❌ Aucune donnée récupérée');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des dates:', error.message);
  }
}

checkAvailableDates(); 