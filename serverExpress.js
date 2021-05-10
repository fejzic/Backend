var express = require('express');
var bodyParser = require('body-parser');
const fs = require('fs');
const db = require('./baza');
db.konekcija
	// .sync({ force: true })
	.sync()
	.then(async () => {
		console.log('New tables created');
	});

var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// routes will go here

app.use(express.static('public'));

function dajUkupnoMinuta(vrijeme) {
	let [ sati, minuta ] = vrijeme.split(':');

	return sati * 60 + minuta * 1;
}

function sortirajTermine(raspored, atribut) {
	if (!atribut) return;

	let nacin = atribut[0];
	let kriterij = atribut.slice(1);

	if (kriterij == 'naziv') {
		if (nacin == 'A') {
			raspored.sort(function(a, b) {
				if (a.naziv < b.naziv) {
					return -1;
				}
				if (a.naziv > b.naziv) {
					return 1;
				}
				return 0;
			});
		} else {
			raspored.sort(function(a, b) {
				if (a.naziv < b.naziv) {
					return 1;
				}
				if (a.naziv > b.naziv) {
					return -1;
				}
				return 0;
			});
		}
	}
	if (kriterij == 'aktivnost') {
		if (nacin == 'A') {
			raspored.sort(function(a, b) {
				if (a.aktivnost < b.aktivnost) {
					return -1;
				}
				if (a.aktivnost > b.aktivnost) {
					return 1;
				}
				return 0;
			});
		} else {
			raspored.sort(function(a, b) {
				if (a.aktivnost < b.aktivnost) {
					return 1;
				}
				if (a.aktivnost > b.aktivnost) {
					return -1;
				}
				return 0;
			});
		}
	}
	if (kriterij == 'dan') {
		if (nacin == 'A') {
			raspored.sort(function(a, b) {
				if (a.dan < b.dan) {
					return -1;
				}
				if (a.dan > b.dan) {
					return 1;
				}
				return 0;
			});
		} else {
			raspored.sort(function(a, b) {
				if (a.dan < b.dan) {
					return 1;
				}
				if (a.dan > b.dan) {
					return -1;
				}
				return 0;
			});
		}
	}
	if (kriterij == 'pocetak') {
		if (nacin == 'A') {
			raspored.sort(function(a, b) {
				if (a.pocetak < b.pocetak) {
					return -1;
				}
				if (a.pocetak > b.pocetak) {
					return 1;
				}
				return 0;
			});
		} else {
			raspored.sort(function(a, b) {
				if (a.pocetak < b.pocetak) {
					return 1;
				}
				if (a.pocetak > b.pocetak) {
					return -1;
				}
				return 0;
			});
		}
	}
	if (kriterij == 'kraj') {
		if (nacin == 'A') {
			raspored.sort(function(a, b) {
				if (a.kraj < b.kraj) {
					return -1;
				}
				if (a.kraj > b.kraj) {
					return 1;
				}
				return 0;
			});
		} else {
			raspored.sort(function(a, b) {
				if (a.kraj < b.kraj) {
					return 1;
				}
				if (a.kraj > b.kraj) {
					return -1;
				}
				return 0;
			});
		}
	}
}
app.get('/v1/raspored', function(req, res) {
	//
	let danPretraga = req.query.dan;
	let sortKriterij = req.query.sort;

	if (!danPretraga) {
		console.log('Accept header:', req.headers['accept']);
		fs.readFile('./raspored.csv', 'utf8', function(err, data) {
			if (data) {
				if (req.headers['accept'] === 'text/csv') {
					return res.send(data);
				}
				var dataArray = data.split(/\r?\n/); //Be careful if you are in a \r\n world...
				let raspored = [];

				for (let data of dataArray) {
					if (!data) continue;
					let [ naziv, aktivnost, dan, pocetak, kraj ] = data.split(',');
					raspored.push({ naziv, aktivnost, dan, pocetak, kraj });
				}
				sortirajTermine(raspored, sortKriterij);
				return res.json(raspored);
			} else {
				return res.json({ greska: 'Datoteka raspored.csv nije kreirana!' });
			}
		});
	} else {
		fs.readFile('./raspored.csv', 'utf8', function(err, data) {
			if (data) {
				var dataArray = data.split(/\r?\n/);
				let raspored = [];
				let csvSadrzaj = '';
				for (let data of dataArray) {
					if (!data) continue;
					let [ naziv, aktivnost, dan, pocetak, kraj ] = data.split(',');

					if (dan.toLocaleLowerCase() == danPretraga.toLowerCase()) {
						if (req.headers['accept'] === 'text/csv') {
							csvSadrzaj += data + '\n';
						} else {
							raspored.push({ naziv, aktivnost, dan, pocetak, kraj });
						}
					}
				}

				if (req.headers['accept'] === 'text/csv') {
					return res.send(csvSadrzaj);
				} else {
					sortirajTermine(raspored, sortKriterij);
					return res.json(raspored);
				}
			} else {
				return res.json({ greska: 'Datoteka raspored.csv nije kreirana!' });
			}
		});
	}
});

app.post('/v1/raspored', function(req, res) {
	let { naziv_predmeta, aktivnost, dan, vrijeme_pocetka, vrijeme_kraja } = req.body;
	console.log(req.body);
	if (!naziv_predmeta || !aktivnost || !dan || !vrijeme_pocetka || !vrijeme_kraja) {
		return res.status(404).send('Pogresni ulazni podaci!');
	} else if (![ 'predavanje', 'vjezba' ].includes(aktivnost.toLowerCase())) {
		return res.status(400).send('Aktivnost mora biti predavanje ili vjezba!');
	} else if (![ 'ponedjeljak', 'utorak', 'srijeda', 'cetvrtak', 'petak' ].includes(dan.toLowerCase())) {
		return res.status(400).send('Dan nije ispravan!');
	} else {
		fs.readFile('./raspored.csv', 'utf8', function(err, data) {
			if (data) {
				var dataArray = data.split(/\r?\n/); //Be careful if you are in a \r\n world...
				let raspored = [];

				for (let data of dataArray) {
					if (!data) continue;
					let [ naziv_predmeta, aktivnost, dan, vrijeme_pocetka, vrijeme_kraja ] = data.split(',');
					raspored.push({ naziv_predmeta: naziv_predmeta, aktivnost, dan, vrijeme_pocetka, vrijeme_kraja });
				}
				console.log(raspored);
				let noviTerminPocetakUkupnoMinuta = dajUkupnoMinuta(vrijeme_pocetka);
				let noviTerminKrajUkupnoMinuta = dajUkupnoMinuta(vrijeme_kraja);
				for (let termin of raspored) {
					if (
						dan.toLowerCase() === termin['dan'].toLowerCase() &&
						aktivnost.toLowerCase() === termin['aktivnost'].toLocaleLowerCase()
					) {
						let terminPocetakUkupnoMinuta = dajUkupnoMinuta(termin['vrijeme_pocetka']);
						let terminKrajUkupnoMinuta = dajUkupnoMinuta(termin['vrijeme_kraja']);

						if (
							(noviTerminPocetakUkupnoMinuta >= terminPocetakUkupnoMinuta &&
								noviTerminPocetakUkupnoMinuta < terminKrajUkupnoMinuta) ||
							(noviTerminKrajUkupnoMinuta > terminPocetakUkupnoMinuta &&
								noviTerminKrajUkupnoMinuta <= terminKrajUkupnoMinuta)
						) {
							return res.status(400).send('Postoji preklapanje termina!');
						}
					}
				}
			}
			fs.appendFile(
				'raspored.csv',
				`${naziv_predmeta},${aktivnost},${dan},${vrijeme_pocetka},${vrijeme_kraja}\n`,
				function(err) {
					if (err) {
						return res.status(500).send('Desila se greska prilikom upisa u datoteku!');
					} else {
						return res.send('Novi red uspješno dodan!');
					}
				}
			);
		});
	}
});

app.post('/v1/predmet', function(req, res) {
	let { naziv_predmeta } = req.body;
	if (!naziv_predmeta) {
		return res.status(404).send('Pogresni ulazni podaci!');
	}
	fs.readFile('./predmeti.csv', 'utf8', function(err, data) {
		if (data) {
			var predmeti = data.split(/\r?\n/); //Be careful if you are in a \r\n world...
			if (predmeti.includes(naziv_predmeta)) {
				return res.status(400).send('Postoji predmet!');
			}
		}

		fs.appendFile('predmeti.csv', `${naziv_predmeta}\n`, function(err) {
			if (err) {
				return res.status(500).send('Desila se greska prilikom upisa u datoteku!');
			} else {
				return res.send('Novi red uspješno dodan!');
			}
		});
	});
});

app.get('/v1/predmeti', function(req, res) {
	fs.readFile('./predmeti.csv', 'utf8', function(err, data) {
		if (data) {
			var predmeti = data.split(/\r?\n/); //Be careful if you are in a \r\n world...
			if (predmeti[predmeti.length - 1] == '') {
				//ako je zadnji prazan izbaci ga
				predmeti.pop();
			}
			return res.json(predmeti);
		} else {
			return res.json({ greska: 'Datoteka predmeti.csv nije kreirana!' });
		}
	});
});
app.delete('/v1/predmet', function(req, res) {
	let { naziv_predmeta } = req.body;
	fs.readFile('./predmeti.csv', 'utf8', function(err, data) {
		if (data) {
			var predmeti = data.split(/\r?\n/); //Be careful if you are in a \r\n world...
			var index = predmeti.indexOf(naziv_predmeta);
			if (index !== -1) {
				predmeti.splice(index, 1);
			} else {
				return res.status(403).send('Ne postoji predmet');
			}
			let sadrzaj = predmeti.join('\n');
			fs.writeFile('predmeti.csv', sadrzaj, (err) => {
				// this code runs after the file is written
				if (err) {
					return res.status(500).send('Desila se greska prilikom upisa u datoteku!');
				} else {
					return res.json({ poruka: 'Uspjesno izbrisan predmet' });
				}
			});
		}
	});
});

app.get('/v2/predmet', function(req, res) {
	db.Predmet
		.findAll({
			attributes: [ 'id', 'naziv' ]
		})
		.then((data) => {
			return res.send(data);
		})
		.catch((err) => {
			return res.status(500).send({
				message: err.message || 'Desila se greska.'
			});
		});
});

app.get('/v2/predmet/:predmetId', function(req, res) {
	id = req.params.predmetId;
	console.log(id);
	db.Predmet
		.findOne({
			where: {
				id: id
			}
		})
		.then((data) => {
			if (!data) return res.send({ message: 'Predmet sa id-jem ' + id + ' ne postoji!' });
			else return res.send(data);
		})
		.catch((err) => {
			return res.status(500).send({
				message: 'Greska prilikom vracanja Predmeta sa id-jem ' + id
			});
		});
});

app.post('/v2/predmet', function(req, res) {
	const predmet = {
		naziv: req.body.naziv
	};
	db.Predmet.create(predmet).then((data) => res.send(data)).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Desila se greska.'
		});
	});
});

app.put('/v2/predmet/:predmetId', function(req, res) {
	var id = req.params.predmetId;
	db.Predmet
		.update(req.body, {
			where: { id: id }
		})
		.then((num) => {
			console.log(num);
			if (num == 1) {
				return res.send({
					message: 'Predmet je azuriran.'
				});
			} else {
				return res.send({
					message: `Predmet sa id=${id} ne moze biti azuriran. Mozda je req.body prazan!`
				});
			}
		})
		.catch((err) => {
			return res.status(500).send({
				message: `Predmet sa id=${id} ne moze biti azuriran. Mozda je req.body prazan!`
			});
		});
});
app.delete('/v2/predmet/:predmetId', function(req, res) {
	var id = req.params.predmetId;
	db.Predmet
		.destroy({
			where: { id: id }
		})
		.then((num) => {
			if (num == 1) {
				res.send({
					message: 'Predmet je uspjesno obrisan iz baze!'
				});
			} else {
				res.send({
					message: `Predmet sa id=${id} ne moze biti obrisan ili ne postoji!`
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: `Predmet sa id=${id} ne moze biti obrisan ili ne postoji!`
			});
		});
});

app.get('/v2/dan', function(req, res) {
	db.Dan
		.findAll({
			attributes: [ 'id', 'naziv' ]
		})
		.then((data) => {
			return res.send(data);
		})
		.catch((err) => {
			return res.status(500).send({
				message: err.message || 'Desila se greska.'
			});
		});
});

app.get('/v2/dan/:danId', function(req, res) {
	id = req.params.danId;
	db.Dan
		.findOne({
			where: {
				id: id
			}
		})
		.then((data) => {
			if (!data) return res.send({ message: 'Dan sa id-jem ' + id + ' ne postoji!' });
			else return res.send(data);
		})
		.catch((err) => {
			return res.status(500).send({
				message: 'Greska prilikom vracanja Dan sa id-jem ' + id
			});
		});
});

app.post('/v2/dan', function(req, res) {
	const dan = {
		naziv: req.body.naziv
	};
	db.Dan.create(dan).then((data) => res.send(data)).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Desila se greska.'
		});
	});
});

app.put('/v2/dan/:danId', function(req, res) {
	var id = req.params.predmetId;
	db.Dan
		.update(req.body, {
			where: { id: id }
		})
		.then((num) => {
			console.log(num);
			if (num == 1) {
				return res.send({
					message: 'Dan je azuriran.'
				});
			} else {
				return res.send({
					message: `Dan sa id=${id} ne moze biti azuriran. Mozda je req.body prazan!`
				});
			}
		})``.catch((err) => {
		return res.status(500).send({
			message: `Dan sa id=${id} ne moze biti azuriran. Mozda je req.body prazan!`
		});
	});
});
app.delete('/v2/dan/:danId', function(req, res) {
	var id = req.params.danId;
	db.Dan
		.destroy({
			where: { id: id }
		})
		.then((num) => {
			if (num == 1) {
				res.send({
					message: 'Dan je uspjesno obrisan iz baze!'
				});
			} else {
				res.send({
					message: `Dan sa id=${id} ne moze biti obrisan ili ne postoji!`
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: `Dan sa id=${id} ne moze biti obrisan ili ne postoji!`
			});
		});
});



app.get('/v2/grupa', function(req, res) {
	db.Grupa
		.findAll({
			attributes: [ 'id', 'naziv','predmetId' ]
		})
		.then((data) => {
			return res.send(data);
		})
		.catch((err) => {
			return res.status(500).send({
				message: err.message || 'Desila se greska.'
			});
		});
});

app.get('/v2/grupa/:grupaId', function(req, res) {
	id = req.params.grupaId;
	db.Grupa
		.findOne({
			where: {
				id: id
			}
		})
		.then((data) => {
			if (!data) return res.send({ message: 'Grupa sa id-jem ' + id + ' ne postoji!' });
			else return res.send(data);
		})
		.catch((err) => {
			return res.status(500).send({
				message: 'Greska prilikom vracanja Grupe sa id-jem ' + id
			});
		});
});

app.post('/v2/grupa', function(req, res) {
	const grupa = {
		naziv: req.body.naziv,
		prredmetId : req.body.predmetId
	};
	db.Grupa.create(grupa).then((data) => res.send(data)).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Desila se greska.'
		});
	});
});

app.put('/v2/grupa/:grupaId', function(req, res) {
	var id = req.params.grupaId;
	db.Grupa
		.update(req.body, {
			where: { id: id }
		})
		.then((num) => {
			console.log(num);
			if (num == 1) {
				return res.send({
					message: 'Grupa je azuriran.'
				});
			} else {
				return res.send({
					message: `Grupa sa id=${id} ne moze biti azuriran. Mozda je req.body prazan!`
				});
			}
		})``.catch((err) => {
		return res.status(500).send({
			message: `Grupa sa id=${id} ne moze biti azuriran. Mozda je req.body prazan!`
		});
	});
});
app.delete('/v2/grupa/:grupaId', function(req, res) {
	var id = req.params.grupaId;
	db.Grupa
		.destroy({
			where: { id: id }
		})
		.then((num) => {
			if (num == 1) {
				res.send({
					message: 'Grupa je uspjesno obrisana iz baze!'
				});
			} else {
				res.send({
					message: `Grupa sa id=${id} ne moze biti obrisan ili ne postoji!`
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: `Grupa sa id=${id} ne moze biti obrisan ili ne postoji!`
			});
		});
});

app.get('/v2/tip', function(req, res) {
	db.Tip
		.findAll({
			attributes: [ 'id', 'naziv' ]
		})
		.then((data) => {
			return res.send(data);
		})
		.catch((err) => {
			return res.status(500).send({
				message: err.message || 'Desila se greska.'
			});
		});
});

app.get('/v2/tip/:tipId', function(req, res) {
	id = req.params.tipId;
	db.Tip
		.findOne({
			where: {
				id: id
			}
		})
		.then((data) => {
			if (!data) return res.send({ message: 'Tip sa id-jem ' + id + ' ne postoji!' });
			else return res.send(data);
		})
		.catch((err) => {
			return res.status(500).send({
				message: 'Greska prilikom vracanja Tipa sa id-jem ' + id
			});
		});
});

app.post('/v2/tip', function(req, res) {
	const tip= {
		naziv: req.body.naziv
	};
	db.Tip.create(tip).then((data) => res.send(data)).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Desila se greska.'
		});
	});
});

app.put('/v2/tip/:tipId', function(req, res) {
	var id = req.params.tipId;
	db.Tip
		.update(req.body, {
			where: { id: id }
		})
		.then((num) => {
			console.log(num);
			if (num == 1) {
				return res.send({
					message: 'Tip je azuriran.'
				});
			} else {
				return res.send({
					message: `Tip sa id=${id} ne moze biti azuriran. Mozda je req.body prazan!`
				});
			}
		})``.catch((err) => {
		return res.status(500).send({
			message: `Tip sa id=${id} ne moze biti azuriran. Mozda je req.body prazan!`
		});
	});
});
app.delete('/v2/tip/:tipId', function(req, res) {
	var id = req.params.tipId;
	db.Tip
		.destroy({
			where: { id: id }
		})
		.then((num) => {
			if (num == 1) {
				res.send({
					message: 'Tip je uspjesno obrisana iz baze!'
				});
			} else {
				res.send({
					message: `Tip sa id=${id} ne moze biti obrisan ili ne postoji!`
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: `Tip sa id=${id} ne moze biti obrisan ili ne postoji!`
			});
		});
});

app.get('/v2/student', function(req, res) {
	db.Tip
		.findAll({
			attributes: [ 'id', 'ime','indeks' ]
		})
		.then((data) => {
			return res.send(data);
		})
		.catch((err) => {
			return res.status(500).send({
				message: err.message || 'Desila se greska.'
			});
		});
});

app.get('/v2/student/:studentId', function(req, res) {
	id = req.params.studentId;
	db.Student
		.findOne({
			where: {
				id: id
			}
		})
		.then((data) => {
			if (!data) return res.send({ message: 'Student sa id-jem ' + id + ' ne postoji!' });
			else return res.send(data);
		})
		.catch((err) => {
			return res.status(500).send({
				message: 'Greska prilikom vracanja Studenta sa id-jem ' + id
			});
		});
});

app.post('/v2/student', function(req, res) {
	const student= {
		ime: req.body.ime,
		indeks: req.body.indeks

	};
	db.Student.create(student).then((data) => res.send(data)).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Desila se greska.'
		});
	});
});

app.put('/v2/student/:studentId', function(req, res) {
	var id = req.params.studentId;
	db.Student
		.update(req.body, {
			where: { id: id }
		})
		.then((num) => {
			console.log(num);
			if (num == 1) {
				return res.send({
					message: 'Student je azuriran.'
				});
			} else {
				return res.send({
					message: `Student sa id=${id} ne moze biti azuriran. Mozda je req.body prazan!`
				});
			}
		})``.catch((err) => {
		return res.status(500).send({
			message: `Student sa id=${id} ne moze biti azuriran. Mozda je req.body prazan!`
		});
	});
});
app.delete('/v2/student/:studentId', function(req, res) {
	var id = req.params.studentId;
	db.Student
		.destroy({
			where: { id: id }
		})
		.then((num) => {
			if (num == 1) {
				res.send({
					message: 'Student je uspjesno obrisana iz baze!'
				});
			} else {
				res.send({
					message: `Student sa id=${id} ne moze biti obrisan ili ne postoji!`
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: `Student sa id=${id} ne moze biti obrisan ili ne postoji!`
			});
		});
});

app.get('/v2/aktivnost', function(req, res) {
	db.Grupa
		.findAll({
			attributes: [ 'id', 'naziv','pocetak','kraj','grupaId','predmetId','danId','tipId']
		})
		.then((data) => {
			return res.send(data);
		})
		.catch((err) => {
			return res.status(500).send({
				message: err.message || 'Desila se greska.'
			});
		});
});

app.get('/v2/aktivnost/:aktivnostId', function(req, res) {
	id = req.params.aktivnostId;
	db.Aktivnost
		.findOne({
			where: {
				id: id
			}
		})
		.then((data) => {
			if (!data) return res.send({ message: 'Aktivnost sa id-jem ' + id + ' ne postoji!' });
			else return res.send(data);
		})
		.catch((err) => {
			return res.status(500).send({
				message: 'Greska prilikom vracanja Aktivnosti sa id-jem ' + id
			});
		});
});

app.post('/v2/aktivnost', function(req, res) {
	const aktivnost = {
		naziv: req.body.naziv,
		pocetak: req.body.pocetak,
		kraj: req.body.kraj,
		grupaId : req.body.grupaId,
		predmetId : req.body.predmetId,
		danId : req.body.danId,
		tipId : req.body.tipId,

	};
	db.Aktivnost.create(aktivnost).then((data) => res.send(data)).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Desila se greska.'
		});
	});
});

app.put('/v2/aktivnost/:sktivnostId', function(req, res) {
	var id = req.params.aktivnostId;
	db.Aktivnost
		.update(req.body, {
			where: { id: id }
		})
		.then((num) => {
			console.log(num);
			if (num == 1) {
				return res.send({
					message: 'Aktivnost je azuriran.'
				});
			} else {
				return res.send({
					message: `Aktivnost sa id=${id} ne moze biti azuriran. Mozda je req.body prazan!`
				});
			}
		})``.catch((err) => {
		return res.status(500).send({
			message: `Aktivnost sa id=${id} ne moze biti azuriran. Mozda je req.body prazan!`
		});
	});
});
app.delete('/v2/aktivnost/:aktivnostId', function(req, res) {
	var id = req.params.aktivnostId;
	db.Aktivnost
		.destroy({
			where: { id: id }
		})
		.then((num) => {
			if (num == 1) {
				res.send({
					message: 'Aktivnost je uspjesno obrisana iz baze!'
				});
			} else {
				res.send({
					message: `Aktivnost sa id=${id} ne moze biti obrisan ili ne postoji!`
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: `Aktivnost sa id=${id} ne moze biti obrisan ili ne postoji!`
			});
		});
});







app.listen(8080);
console.log('Server started! At http://localhost:8080');
