const Sequelize = require('sequelize');
 const sequelize = new Sequelize('mysql://root:root@localhost:3306/wt202st');
 var connection= require('mysql2');
 var konekcija = connection.createConnection({
	host: 'localhost',
	user: "root",
	password: "root",
	database: 'wt202st'
  });


const Predmet = konekcija.define('Predmet', {
	naziv: {
		type: Sequelize.DataTypes.STRING,
		allowNull: false
	}
});

const Grupa = konekcija.define('Grupa', {
	naziv: {
		type: Sequelize.DataTypes.STRING,
		allowNull: false
	}
});

const Aktivnost = konekcija.define('Aktivnost', {
	naziv: {
		type: Sequelize.DataTypes.STRING,
		allowNull: false
	},
	pocetak: {
		type: Sequelize.DataTypes.FLOAT,
		allowNull: false
	},
	kraj: {
		type: Sequelize.DataTypes.FLOAT,
		allowNull: false
	}
});
const Dan = konekcija.define('Dan', {
	naziv: {
		type: Sequelize.DataTypes.STRING,
		allowNull: false
	}
});

const Tip = konekcija.define('Tip', {
	naziv: {
		type: Sequelize.DataTypes.STRING,
		allowNull: false
	}
});
const Student = konekcija.define('Student', {
	ime: {
		type: Sequelize.DataTypes.STRING,
		allowNull: false
	},
	indeks: {
		type: Sequelize.DataTypes.STRING,
		allowNull: false
	}
});

Grupa.hasMany(Aktivnost, {
	foreignKey: {
		name: 'grupa_id'
	}
});
Predmet.hasMany(Grupa, {
	foreignKey: {
		name: 'predmet_id',
		allowNull: false
	}
});
Predmet.hasMany(Aktivnost, {
	foreignKey: {
		name: 'predmet_id',
		allowNull: false
	}
});
Dan.hasMany(Aktivnost, {
	foreignKey: {
		name: 'dan_id',
		allowNull: false
	}
});
Tip.hasMany(Aktivnost, {
	foreignKey: {
		name: 'tip_id',
		allowNull: false
	}
});

Student.belongsToMany(Grupa, { through: 'StudentGrupa' });
Grupa.belongsToMany(Student, { through: 'StudentGrupa' });

const kreirajAktivnost = async (naziv) => {
	await Aktivnost.create({ naziv: naziv, pocetak: 10, kraj: 20 });
	console.log('HELLO!');
};
const kreirajPredmet = async (naziv) => {
	await Predmet.create({ naziv: naziv });
	console.log('HELLO!');
};

const db = {
	Predmet,
	Grupa,
	Aktivnost,
	Dan,
	Tip,
	Student
};

db.Sequelize = Sequelize;
db.konekcija = konekcija;
module.exports = db;
