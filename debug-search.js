const { getTrainData } = require('./server/services/trainDataService');
const { searchDestinations } = require('./server/services/searchService');

async function debugSearch() {
  console.log('🔍 Debug de la recherche TGVmax...\n');
  
  try {
    // 1. Récupérer toutes les données
    console.log('1. Récupération des données TGVmax...');
    const allTrains = await getTrainData();
    console.log(`   ✅ ${allTrains.length} trains récupérés`);
    
    // 2. Filtrer pour la date
    const date = '2025-08-07';
    const trainsForDate = allTrains.filter(train => train.date === date);
    console.log(`   📅 ${trainsForDate.length} trains pour le ${date}`);
    
    // 3. Afficher quelques exemples
    console.log('\n2. Exemples de trains:');
    trainsForDate.slice(0, 5).forEach((train, index) => {
      console.log(`   ${index + 1}. ${train.departure} → ${train.arrival} (${train.departureTime}-${train.arrivalTime}) [TGVmax: ${train.isTGVmax}]`);
    });
    
    // 4. Tester la recherche
    console.log('\n3. Test de recherche...');
    const departureStation = 'MONTPELLIER';
    const outboundTrains = trainsForDate.filter(train => 
      (train.departure.toLowerCase().includes(departureStation.toLowerCase()) ||
       train.origineIata.toLowerCase().includes(departureStation.toLowerCase())) &&
      train.isTGVmax
    );
    
    console.log(`   🚄 ${outboundTrains.length} trains TGVmax depuis ${departureStation}`);
    
    if (outboundTrains.length > 0) {
      console.log('   Exemples de trains aller:');
      outboundTrains.slice(0, 3).forEach((train, index) => {
        console.log(`     ${index + 1}. ${train.departure} → ${train.arrival} (${train.departureTime}-${train.arrivalTime})`);
      });
    }
    
    // 5. Test complet de recherche
    console.log('\n4. Test complet de recherche...');
    const results = await searchDestinations(departureStation, date, 2);
    console.log(`   🎯 ${results.length} destinations trouvées`);
    
    if (results.length > 0) {
      console.log('   Première destination:');
      const first = results[0];
      console.log(`     Ville: ${first.city}`);
      console.log(`     Aller: ${first.outbound.departureTime} → ${first.outbound.arrivalTime}`);
      console.log(`     Retour: ${first.return.departureTime} → ${first.return.arrivalTime}`);
      console.log(`     Séjour: ${first.stayDuration}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  }
}

debugSearch(); 