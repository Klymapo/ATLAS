window.ATLAS_DEMO = {
  "version": "0.4.0",
  "status": "DEMO_ONLY_UNVERIFIED",
  "lang_ui": "es",
  "lang_pivot": "en",
  "storyline": {
    "series": "El Archivo de las Cuatro Voces",
    "case_id": "demo-001",
    "title": "La llave equivocada",
    "location": "Oficina del Archivo",
    "opening": "Nora Vale te espera en la sede central. Ha aparecido una carta con dos números contradictorios. Examina la habitación para descubrir qué cambió.",
    "twist": "Alguien cambió la etiqueta de la llave para dirigir la investigación a otra habitación.",
    "outro": "Caso cerrado. El Archivo sigue abierto: otro expediente acaba de llegar.",
    "next_case": "El reloj detenido · Berlín"
  },
  "clues": [
    {
      "id": "shelf",
      "name": "La estantería",
      "icon": "book",
      "label": "Estantería",
      "text": "Dentro de un libro aparece una anotación: «ROOM 12».",
      "evidence": "Nota: habitación 12",
      "english": "book",
      "term": "book",
      "position": {
        "left": "17%",
        "top": "32%"
      },
      "require": true,
      "exhibit": {
        "kind": "note",
        "category": "DOCUMENTO HALLADO · BIBLIOTECA",
        "title": "Hoja entre páginas",
        "mark": "ROOM 12",
        "detail": "Anotación original: HABITACIÓN 12"
      }
    },
    {
      "id": "board",
      "name": "El tablero",
      "icon": "file",
      "label": "Tablero",
      "text": "En el tablón alguien escribió: «The key is in the book.»",
      "evidence": "Mensaje en inglés",
      "english": "letter",
      "term": "letter",
      "position": {
        "left": "50%",
        "top": "27%"
      },
      "require": true,
      "exhibit": {
        "kind": "message",
        "category": "TABLÓN DE EVIDENCIAS",
        "title": "Mensaje fijado con una chincheta",
        "mark": "THE KEY IS IN THE BOOK.",
        "detail": "«La llave está en el libro». El mensaje conduce a la estantería."
      }
    },
    {
      "id": "desk",
      "name": "El escritorio",
      "icon": "key",
      "label": "Escritorio",
      "text": "Debajo de una hoja encuentras una llave con una etiqueta: «21».",
      "evidence": "Llave marcada 21",
      "english": "key",
      "term": "key",
      "position": {
        "left": "52%",
        "top": "73%"
      },
      "require": true,
      "exhibit": {
        "kind": "tag",
        "category": "OBJETO RECUPERADO · ESCRITORIO",
        "title": "Etiqueta atada a una llave",
        "mark": "21",
        "detail": "Número de la etiqueta: 21 · No coincide con la nota del libro."
      }
    },
    {
      "id": "window",
      "name": "La ventana",
      "icon": "moon",
      "label": "Ventana",
      "text": "Ves las luces de la ciudad. No parece haber huellas junto a la ventana.",
      "evidence": "Ventana sin señales",
      "english": "map",
      "term": "map",
      "position": {
        "left": "81%",
        "top": "35%"
      },
      "require": false,
      "exhibit": {
        "kind": "report",
        "category": "OBSERVACIÓN · VENTANA",
        "title": "Registro de inspección",
        "mark": "SIN HUELLAS",
        "detail": "No hay indicios de entrada o salida por la ventana."
      }
    }
  ],
  "concepts": [
    {
      "id": "key",
      "en": "key",
      "es": "llave",
      "fr": {
        "w": "clé",
        "hint": "la clé"
      },
      "de": {
        "w": "Schlüssel",
        "hint": "der Schlüssel"
      },
      "ru": {
        "w": "ключ",
        "reading": "klyuch"
      },
      "ja": {
        "w": "鍵",
        "reading": "かぎ · kagi"
      },
      "icon": "key-round"
    },
    {
      "id": "book",
      "en": "book",
      "es": "libro",
      "fr": {
        "w": "livre",
        "hint": "le livre"
      },
      "de": {
        "w": "Buch",
        "hint": "das Buch"
      },
      "ru": {
        "w": "книга",
        "reading": "kniga"
      },
      "ja": {
        "w": "本",
        "reading": "ほん · hon"
      },
      "icon": "book"
    },
    {
      "id": "letter",
      "en": "letter",
      "es": "carta",
      "fr": {
        "w": "lettre",
        "hint": "la lettre"
      },
      "de": {
        "w": "Brief",
        "hint": "der Brief"
      },
      "ru": {
        "w": "письмо",
        "reading": "pis'mo"
      },
      "ja": {
        "w": "手紙",
        "reading": "てがみ · tegami"
      },
      "icon": "mail"
    },
    {
      "id": "map",
      "en": "map",
      "es": "mapa",
      "fr": {
        "w": "carte",
        "hint": "la carte"
      },
      "de": {
        "w": "Karte",
        "hint": "die Karte"
      },
      "ru": {
        "w": "карта",
        "reading": "karta"
      },
      "ja": {
        "w": "地図",
        "reading": "ちず · chizu"
      },
      "icon": "map"
    }
  ],
  "memoryPairs": [
    {
      "id": "p1",
      "concept": "key",
      "lang": "fr"
    },
    {
      "id": "p2",
      "concept": "book",
      "lang": "de"
    },
    {
      "id": "p3",
      "concept": "letter",
      "lang": "ru"
    },
    {
      "id": "p4",
      "concept": "map",
      "lang": "ja"
    }
  ],
  "deduction": {
    "question": "¿Cuál es la contradicción que explica el misterio?",
    "options": [
      {
        "id": "a",
        "text": "Alguien sustituyó la etiqueta de la llave: el libro indica 12, pero la llave señala 21.",
        "correct": true,
        "why": "Exacto. Has contrastado dos documentos y detectado una alteración."
      },
      {
        "id": "b",
        "text": "El libro desapareció antes de que Nora llegara.",
        "correct": false,
        "why": "El libro sigue en la estantería. Comprueba lo que dice su nota."
      },
      {
        "id": "c",
        "text": "La ventana abierta permitió que alguien se llevara el expediente.",
        "correct": false,
        "why": "No hay pistas de entrada por la ventana. Revisa los números."
      }
    ]
  },
  "disclaimer": "Demostración educativa: traducciones, ejemplos y audios aún NO certificados por ATLAS. Las voces disponibles son síntesis del navegador, no grabaciones verificadas.",
  "introduction": [
    {
      "title": "¿Dónde estamos?",
      "dialogue": "Bienvenido al Archivo de las Cuatro Voces. Soy Nora Vale, la archivista. Esta es nuestra sede central: aquí reunimos cartas y documentos que no encajan.",
      "context": "Son las 22:40. Acabas de entrar en una biblioteca convertida en oficina de investigación internacional."
    },
    {
      "title": "Tu primer expediente",
      "dialogue": "Alguien modificó una pista de nuestro caso. Hay un libro, una llave y una carta. No necesitas saber idiomas todavía: primero te voy a enseñar cuatro palabras.",
      "context": "Tus notas estarán siempre disponibles. Estudiaremos inglés como referencia para francés, alemán, ruso y japonés."
    },
    {
      "title": "Una regla del Archivo",
      "dialogue": "Aquí no te examinaré antes de enseñarte. Observa las palabras, escucha si quieres y luego pondremos a prueba tu memoria. Si te equivocas, seguimos investigando.",
      "context": "Cuando hayas estudiado las cuatro fichas, iremos a la escena y podrás inspeccionar las evidencias reales."
    }
  ],
  "objectSymbols": {
    "key": "⚿",
    "book": "▣",
    "letter": "✉",
    "map": "◇"
  }
};
