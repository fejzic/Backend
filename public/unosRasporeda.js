var predmeti = [];
var aktivnosti = [];

function ucitajPredmete() {
	let ajax = new XMLHttpRequest();
	ajax.onreadystatechange = function() {
		// Anonimna funkcija
		if (ajax.readyState == 4 && ajax.status === 200) {
			predmeti = JSON.parse(ajax.responseText);
			console.log(predmeti);
		}
	};
	ajax.open('GET', `http://localhost:8080/predmeti`, true);
	ajax.send();
}

function ucitajAktivnosti() {
	let ajax = new XMLHttpRequest();
	ajax.onreadystatechange = function() {
		if (ajax.readyState == 4 && ajax.status === 200) {
			aktivnosti = JSON.parse(ajax.responseText);
			console.log(aktivnosti);
		}
	};
	ajax.open('GET', `http://localhost:8080/raspored`, true);
	ajax.send();
}

ucitajPredmete();
ucitajAktivnosti();

function dodajAktivnost() {
	let nazivPredmeta = document.getElementById('naziv').value;
	let aktivnost = document.querySelector('input[name="aktivnost"]:checked').value;
	let dan = document.getElementById('dan').value;
	let pocetak = document.getElementById('vrijeme_pocetka').value;
	let kraj = document.getElementById('vrijeme_kraja').value;
	let poruka = document.getElementById('message');

	if (predmeti.indexOf(nazivPredmeta) == -1) {
		let ajax = new XMLHttpRequest();
		ajax.open('POST', `http://localhost:8080/predmet`, true);
		ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

		ajax.onreadystatechange = function() {
			if (ajax.readyState == 4 && ajax.status === 200) {
				ajax.open('POST', `http://localhost:8080/raspored`, true);
				ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

				ajax.onreadystatechange = function() {
					if (ajax.readyState == 4 && ajax.status === 200) {
						console.log(ajax.responseText);
						poruka.innerHTML = 'Uspjesno dodana nova aktivnost!';
					}
					if (ajax.readyState == 4 && ajax.status >= 400 && ajax.status <= 599) {
                        poruka.innerHTML += '<br>'+ajax.responseText;
						let xhr = new XMLHttpRequest();
						xhr.open('DELETE', `http://localhost:8080/predmet`, true);
						xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
						xhr.onreadystatechange = function() {
							if (xhr.readyState == 4 && xhr.status === 200) {
                                console.log(xhr.responseText);
                                poruka.innerHTML += '<br>Uspjesno izbrisan predmet!';
							}
						};
						xhr.send(`naziv_predmeta=${nazivPredmeta}`);
					}
				};
				ajax.send(
					`naziv_predmeta=${nazivPredmeta}&aktivnost=${aktivnost}&dan=${dan}&vrijeme_pocetka=${pocetak}&vrijeme_kraja=${kraj}`
				);
			}
		};
		ajax.send(`naziv_predmeta=${nazivPredmeta}`);
	} else {
		let ajax = new XMLHttpRequest();
		ajax.open('POST', `http://localhost:8080/raspored`, true);
		ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

		ajax.onreadystatechange = function() {
			if (ajax.readyState == 4 && ajax.status === 200) {
				console.log(ajax.responseText);
				poruka.innerHTML = 'Uspjesno dodana nova aktivnost!';
			}
		};
		ajax.send(
			`naziv_predmeta=${nazivPredmeta}&aktivnost=${aktivnost}&dan=${dan}&vrijeme_pocetka=${pocetak}&vrijeme_kraja=${kraj}`
		);
	}
	return false;
}
