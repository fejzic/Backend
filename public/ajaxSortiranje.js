function ucitajSortirano(dan, atribut, callback) {
	var ajax = new XMLHttpRequest();
	ajax.onreadystatechange = function() {
		if (ajax.readyState == 4 && ajax.status >= 200 && ajax.status <= 299) callback(ajax.responseText, null);
		if (ajax.readyState == 4 && ajax.status >= 400 && ajax.status <= 599) callback(null, ajax.responseText);
	};
	if (atribut == null) atribut = '';
	if (dan == null) dan = '';
	ajax.open('GET', 'http://localhost:8080/raspored?&sort=' + atribut + '&dan=' + dan, true);
	ajax.send();
}
