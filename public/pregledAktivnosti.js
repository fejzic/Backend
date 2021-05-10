function popuniTabelu(data, error) {
	if (!!data) {
		var table = document.getElementById('raspored');
		while (table.rows.length > 1) {
			table.deleteRow(table.rows.length - 1);
		}

		var aktivnosti = JSON.parse(data);
		console.log('AKTIVNOSTI', aktivnosti);
		for (let i = 0; i < aktivnosti.length; i++) {
			let noviRed = table.insertRow(-1);

			var cell = noviRed.insertCell(-1);
			cell.innerHTML = aktivnosti[i]['naziv'];

			cell = noviRed.insertCell(-1);
			cell.innerHTML = aktivnosti[i]['aktivnost'];

			cell = noviRed.insertCell(-1);
			cell.innerHTML = aktivnosti[i]['dan'];

			cell = noviRed.insertCell(-1);
			cell.innerHTML = aktivnosti[i]['pocetak'];

			cell = noviRed.insertCell(-1);
			cell.innerHTML = aktivnosti[i]['kraj'];
		}
	}
}

let sortNaziv = -1; //-1 nije soritrano, 1 sortiraj rastuce, 0 sortiraj opadajuce
let sortAktivnost = -1;
let sortDan = -1;
let sortPocetak = -1;
let sorteKraj = -1;

ucitajSortirano(null, null, popuniTabelu);

function sortirajNaziv() {
	let nazivElement = document.getElementById('naziv');

	if (sortNaziv == -1 || sortNaziv == 0) {
		ucitajSortirano(null, 'Anaziv', popuniTabelu);
		sortNaziv = 1;
		nazivElement.innerHTML = 'Naziv↓';
	} else {
		ucitajSortirano(null, 'Dnaziv', popuniTabelu);
		sortNaziv = 0;
		nazivElement.innerHTML = 'Naziv↑';
	}
}
function sortirajAktivnost() {
	let aktivnostElement = document.getElementById('aktivnost');

	if (sortAktivnost == -1 || sortAktivnost == 0) {
		ucitajSortirano(null, 'Aaktivnost', popuniTabelu);
		sortAktivnost = 1;
		aktivnostElement.innerHTML = 'Aktivnost↓';
	} else {
		ucitajSortirano(null, 'Daktivnost', popuniTabelu);
		sortAktivnost = 0;
		aktivnostElement.innerHTML = 'Aktivnost↑';
	}
}
