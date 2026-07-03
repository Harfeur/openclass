CREATE TABLE IF NOT EXISTS "Cours" (
	"id" INTEGER NOT NULL,
	"id_matiere" INTEGER NOT NULL,
	"id_groupe" INTEGER NOT NULL,
	"semaine_a" BOOLEAN NOT NULL,
	"semaine_b" BOOLEAN NOT NULL,
	"date" DATE NOT NULL,
	"debut" TIME NOT NULL,
	"fin" TIME NOT NULL,
	"prof" TEXT NOT NULL,
	"courriel" TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("id_groupe") REFERENCES "Groupes"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("id_matiere") REFERENCES "Matieres"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "Matieres" (
	"id" INTEGER NOT NULL,
	"matiere" TEXT NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "Groupes" (
	"id" INTEGER NOT NULL,
	"groupe" TEXT NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "Newsletter" (
	"courriel" TEXT NOT NULL,
	"nom" TEXT NOT NULL,
	PRIMARY KEY("courriel")
);

INSERT INTO Matieres VALUES
(1, "NSI"),
(2, "Mathématiques"),
(3, "Philosophie")
(4, "Enseignement Scientifique"),
(5, "Histoire-Géographie"),
(6, "Espagnol"),
(7, "Italien"),
(8, "SNT"),
(9, "Allemand"),
(10, "Physique-Chimie"),
(11, "EPS"),
(12, "HGGSP"),
(13, "HLP"),
(14, "SVT"),
(15, "SES")
(16, "Latin"),
(17, "LLCE"),
(18, "Grec");
