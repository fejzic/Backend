class Raspored {
	constructor(rasporedCSV) {
		this.raspored = [];
		var redovi = rasporedCSV.split('\n');

		for (let red of redovi) {
			if (red == '') continue;
			let [ naziv, aktivnost, dan, start, end ] = red.split(',');
			let objekat = { naziv, aktivnost, dan, start, end };
			this.raspored.push(objekat);
		}
		console.log(this.raspored);
	}

	dajTrenutnuAktivnost(datum, nazivGrupe) {
		let date = moment(datum, 'DD-MM-YYYYThh:mm:ss');
		const days = [ 'nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'cetvrtak', 'petak', 'subota' ];
		let danUSedmici = days[date.day()];

		for (let termin of this.raspored) {
			if (
				termin['dan'] == danUSedmici &&
				(termin['aktivnost'] == 'predavanje' || termin['naziv'].split('-')[1] == nazivGrupe)
			) {
				let [ pocetakSati, pocetakMinute ] = termin['start'].split(':');
				let pocetak = date.clone();
				pocetak.hours(parseInt(pocetakSati));
				pocetak.minutes(parseInt(pocetakMinute));

				let [ krajSati, krajMinute ] = termin['end'].split(':');
				let kraj = date.clone();
				kraj.hours(parseInt(krajSati));
				kraj.minutes(parseInt(krajMinute));

				if (date.isBetween(pocetak, kraj)) {
					return `${termin['naziv']} ${moment.duration(kraj.diff(date)).as('minutes')}`;
				}
			}
		}

		return 'Trenutno nema aktivnosti';
	}

	dajSljedecuAktivnost(datum, nazivGrupe) {
		let date = moment(datum, 'DD-MM-YYYYThh:mm:ss');
		const days = [ 'nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'cetvrtak', 'petak', 'subota' ];
		let danUSedmici = days[date.day()];
		let najbliziTermin = null;
		let udaljenostUMinutama = null;
		for (let termin of this.raspored) {
			if (
				termin['dan'] == danUSedmici &&
				(termin['aktivnost'] == 'predavanje' || termin['naziv'].split('-')[1] == nazivGrupe)
			) {
				let [ pocetakSati, pocetakMinute ] = termin['start'].split(':');
				let pocetak = date.clone();
				pocetak.hours(parseInt(pocetakSati));
				pocetak.minutes(parseInt(pocetakMinute));

				let [ krajSati, krajMinute ] = termin['end'].split(':');
				let kraj = date.clone();
				kraj.hours(parseInt(krajSati));
				kraj.minutes(parseInt(krajMinute));

				if (date.isBefore(pocetak)) {
					if (najbliziTermin == null) {
						najbliziTermin = termin['naziv'];
						udaljenostUMinutama = moment.duration(pocetak.diff(date)).as('minutes');
					} else if (moment.duration(pocetak.diff(date)).as('minutes') < udaljenostUMinutama) {
						najbliziTermin = termin['naziv'];
						udaljenostUMinutama = moment.duration(pocetak.diff(date)).as('minutes');
					}
				}
			}
		}

		if (najbliziTermin != null) {
			return `${najbliziTermin} ${udaljenostUMinutama}`;
		} else {
			return 'Nastava je gotova za danas';
		}
	}

	dajPrethodnuAktivnost(datum, nazivGrupe) {
		let date = moment(datum, 'DD-MM-YYYYThh:mm:ss');
		const days = [ 'nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'cetvrtak', 'petak', 'subota' ];
		let danUSedmici = days[date.day()];
		let najbliziTermin = null;
		let udaljenostUMinutama = null;
		for (let termin of this.raspored) {
			if (
				termin['dan'] == danUSedmici &&
				(termin['aktivnost'] == 'predavanje' || termin['naziv'].split('-')[1] == nazivGrupe)
			) {
				let [ pocetakSati, pocetakMinute ] = termin['start'].split(':');
				let pocetak = date.clone();
				pocetak.hours(parseInt(pocetakSati));
				pocetak.minutes(parseInt(pocetakMinute));

				let [ krajSati, krajMinute ] = termin['end'].split(':');
				let kraj = date.clone();
				kraj.hours(parseInt(krajSati));
				kraj.minutes(parseInt(krajMinute));

				if (kraj.isBefore(date)) {
					if (najbliziTermin == null) {
						najbliziTermin = termin['naziv'];
						udaljenostUMinutama = moment.duration(date.diff(kraj)).as('minutes');
					} else if (moment.duration(date.diff(kraj)).as('minutes') < udaljenostUMinutama) {
						najbliziTermin = termin['naziv'];
						udaljenostUMinutama = moment.duration(pocetak.diff(date)).as('minutes');
					}
				}
			}
		}

		if (najbliziTermin != null) {
			return `${najbliziTermin} ${udaljenostUMinutama}`;
		} else {
			return 'Nema prethodnih termina.';
		}
    }
    
}

let r = new Raspored(raspored);
let rez1 = r.dajTrenutnuAktivnost('14-10-2020T22:15:00', 'grupa2');
console.log(rez1);
let rez2 = r.dajSljedecuAktivnost('14-10-2020T08:45:00', 'grupa2');
console.log(rez2);
let rez3 = r.dajPrethodnuAktivnost('12-10-2020T13:45:00', 'grupa2');
console.log(rez3);

let selectPrimjeri = document.getElementById('raspored');


function OnClickTrenutno() {
    alert(r.dajTrenutnuAktivnost('14-10-2020T12:15:00', 'grupa2'));
}

function OnClickSljedece() {
	alert(r.dajSljedecuAktivnost('14-10-2020T12:15:00', 'grupa2'));
}
function OnClickPrethodno() {
	alert(r.dajPrethodnuAktivnost('14-10-2020T12:15:00', 'grupa2'));
}