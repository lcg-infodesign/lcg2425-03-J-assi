let datiFiumi;
let nomiFiumi = [];
let lunghezze = [];
let aree = [];
let portate = [];
let temperature = [];
let altezzaCella = 300;
let portataMassima;
let tempMassima; 
// Variabile per regolare distanza fiumi
let distanzaMinima = 150; 
// Posizioni glifi
let posizioniBassa = [];
let posizioniMedia = [];
let posizioniAlta = [];
// Indici per le temperature
let fiumiTemperaturaBassa = [];
let fiumiTemperaturaMedia = [];
let fiumiTemperaturaAlta = [];

// Caricamento del dataset e del font
function preload() {
  // Carica i dati del file CSV
  datiFiumi = loadTable("assets/Rivers in the world - Data.csv", "csv", "header");
  font = loadFont('assets/NeueHaasDisplayLight.ttf'); // Font personalizzato
}

function setup() {
  createCanvas(windowWidth, 5000); 
  textAlign(CENTER, CENTER); 
  textFont(font); 

  // Gestione dei dati
  for (let r = 0; r < datiFiumi.getRowCount(); r++) {
    // Aggiungi i dati a vari array
    nomiFiumi.push(datiFiumi.getString(r, 1)); 
    lunghezze.push(Number(datiFiumi.getString(r, 3))); 
    aree.push(Number(datiFiumi.getString(r, 4))); 
    portate.push(Number(datiFiumi.getString(r, 5))); 
    temperature.push(Number(datiFiumi.getString(r, 11))); 
  }

  // Trova i valori massimi per scalare le grfiche
  portataMassima = Math.max(...portate); 
  tempMassima = Math.max(...temperature); 

  // Suddividi i fiumi in base alla temperatura in tre fasce
  let limiteBasso = tempMassima / 4; 
  let limiteMedio = tempMassima / 2; 

  for (let i = 0; i < temperature.length; i++) {
    if (temperature[i] <= limiteBasso) {
      fiumiTemperaturaBassa.push(i);
    } else if (temperature[i] <= limiteMedio) {
      fiumiTemperaturaMedia.push(i);
} else {
      fiumiTemperaturaAlta.push(i);
    }
  }

  noLoop(); // Disegna solo una volta
}

function draw() {
  background(255);
// Titolo principale
  textSize(86);
  fill(0);
  text("I fiumi del mondo", width / 2, 150);

  // Gradient text per il sottotitolo
  drawGradientText("TEMPERATURE", width / 2, 220, 32, 
    color("#A7C9F7"), color("#FFD455"), color("#DE5F6A"));

  textSize(16);
  fill(0);
  text("Puoi gestire la distanza tra i fiumi con", (width / 2) -30, 260); 
  textFont("Helvetica");
  text("'▲', '▼' ;" , (width / 2) + 120, 262);
  textFont(font);

  // Info sulla distanza minima
  noStroke();
  fill(0);
  textSize(16);
  text(`distanza minima corrente: ${distanzaMinima}px`, width / 2, 277);

  // Calcolo della larghezza e altezza delle aree per i glifi
  let areaWidth = windowWidth / 3;
  let areaHeight = height;

  // Genera i glifi per i tre insiemi
  posizioniBassa = [];
  posizioniMedia = [];
  posizioniAlta = [];
  distribuisciGlifi(5, areaWidth, areaHeight, posizioniBassa, fiumiTemperaturaBassa);
  distribuisciGlifi(areaWidth, areaWidth * 2, areaHeight, posizioniMedia, fiumiTemperaturaMedia);
  distribuisciGlifi(areaWidth * 2, windowWidth, areaHeight, posizioniAlta, fiumiTemperaturaAlta);

  // Visualizza i glifi
  disegnaInsieme(posizioniBassa);
  disegnaInsieme(posizioniMedia);
  disegnaInsieme(posizioniAlta);
}

// Funzione del testo sfumato
function drawGradientText(txt, x, y, size, color1, color2, color3) {
  push();
  textSize(size);
  
  // Se no colori specificati, usa nero
  if (!color1) {
    color1 = color(0);
    color2 = color(100);
    color3 = color(200);
  }
  
  // Crea sfumatura
for (let i = 0; i < txt.length; i++) {
   let inter = map(i, 0, txt.length - 1, 0, 1);
  let c;
   if (inter < 0.6) {
     c = lerpColor(color1, color2, inter * 2);
    } else {
  c = lerpColor(color2, color3, (inter - 0.5) * 3);
   }
    
    fill(c);
    text(txt.charAt(i), x - textWidth(txt)/2 + textWidth(txt.substring(0, i)), y);
  }
  pop();
}

// Distribuisce i glifi in posizioni casuali all'interno delle aree
function distribuisciGlifi(xStart, xEnd, yEnd, posizioni, insiemeFiumi) {
  for (let i of insiemeFiumi) {
    let maxTentativi = 200;
    let tentativi = 0;
    let valido = false;
    let x, y;

  while (!valido && tentativi < maxTentativi) {
      x = random(xStart + distanzaMinima, xEnd - distanzaMinima);
      y = random(distanzaMinima + 250, yEnd - distanzaMinima);
      valido = true;

      // Controlla che i glifi non si sovrappongano
      for (let p of posizioni) {
        let distanza = dist(x, y, p.x, p.y);
        if (distanza < distanzaMinima) {
          valido = false;
          break;
        }
      }

      tentativi++;
    }
// salva la posizione valida
    if (valido) {
      posizioni.push({ x, y, index: i });
    }
  }
}

// Disegna tutti i glifi di un insieme
function disegnaInsieme(posizioni) {
  for (let p of posizioni) {
    let i = p.index;

    // Disegna una forma casuale con colore dinamico basato sulla temperatura
    let dimensioneArea = map(portate[i], 0, portataMassima, 250, 1700);
    fill(coloreTraccia(temperature[i]));
    noStroke();
    disegnaFormaCasuale(p.x, p.y, dimensioneArea);

  // Contorno verde tratteggiato per indicare l'area
    noFill();
    stroke("#636363");
    strokeWeight(2);
    drawingContext.setLineDash([7, 5]);
    disegnaFormaCasuale(p.x, p.y, map(aree[i], 0, Math.max(...aree), 650, 1700));
    drawingContext.setLineDash([]);

    // Linea spezzata casuale con lunghezza del fiume
  stroke(100, 150, 255, 150);
   strokeWeight(2);
  disegnaLineaCasuale(p.x - 50, p.y, lunghezze[i], Math.max(...lunghezze), portate[i], temperature[i]);
  noStroke();

    // Nomi del fiume
    fill(0);
    textSize(16);
    text(nomiFiumi[i], p.x, p.y + 70);
  }
}

function keyPressed() {
  let altezzaIncremento = 500; // Incremento/decremento altezza canvas
  let distanzaMinimaPrecedente = distanzaMinima;

  // Tasti freccia SU e GIÙ per regolare la distanza minima
  if (keyCode === UP_ARROW) {
    distanzaMinima = min(distanzaMinima + 5, 180); // Massimo 180px
  } else if (keyCode === DOWN_ARROW) {
    distanzaMinima = max(distanzaMinima - 5, 120); // Minimo 120px
  }

  // Se la distanza minima è aumentata o diminuita, cambia l'altezza de canvas
  if (distanzaMinima > distanzaMinimaPrecedente) {
    resizeCanvas(windowWidth, height + altezzaIncremento, 36000); // Aumenta altezza max infinito
  } else if (distanzaMinima < distanzaMinimaPrecedente) {
    resizeCanvas(windowWidth, max(height - altezzaIncremento, 2000)); // Diminuisci altezza, minimo 2000px
  }

  redraw(); // Ridisegna tutto con la nuova distanza minima e altezza canvas
}
function disegnaFormaCasuale(x, y, areaObiettivo) {
  let vertici = floor(random(6, 10)); // Numero casuale di lati tra 4 e 10
  let raggio = sqrt(areaObiettivo / PI); // Scala (grandezza) forma

  beginShape();
  for (let i = 0; i < vertici; i++) {
    let angolo = map(i, 0, vertici, 0, 2 * PI);
    let r = raggio * random(1.3, 2.5); // Variazione casuale del raggio
    let xVertice = x + cos(angolo) * r;
    let yVertice = y + sin(angolo) * r;
    curveVertex(xVertice, yVertice);
  }
  endShape(CLOSE);
}

function coloreArea(portata) {
  let limiteBasso = (portataMassima - 150000) / 4;
  let limiteMedio = (portataMassima - 150000) / 2;

  if (portata <= limiteBasso) {
    return color("#96DCFF"); // Azzurro chiaro
  } else if (portata <= limiteMedio) {
    return color("#3FA0D1"); // Turchese
  } else {
    return color("#275C77"); // Blu scuro
  }
}

function strokeSpessore(portata) {
  let limiteBasso = (portataMassima - 150000) / 4;
  let limiteMedio = (portataMassima - 150000) / 2;

  if (portata <= limiteBasso) {
    return 2.5; // Restituisce azzurro chiaro
  } else if (portata <= limiteMedio) {
    return 3.5; // Res turchese
  } else {
    return 5; // Res blu scuro
  }
}

function coloreTraccia(temperatura) {
  let limiteBasso = tempMassima / 4;
  let limiteMedio = tempMassima / 2;

  if (temperatura <= limiteBasso) {
    return color("#A7C9F7"); // Azzurro chiaro
  } else if (temperatura <= limiteMedio) {
    return color("#FFD455"); // Giallo
  } else {
    return color("#DE5F6A"); // rosso
  }
}

// Calcola la lunghezza della linea in base alla lunghezza del fiume
function disegnaLineaCasuale(x, y, lunghezzaFiume, lunghezzaMassima, portata, temperatura) {
  // Mappatura per scalare la lunghezza del segmento tra 20 e 200 pixel
  let lunghezzaSegmento = map(lunghezzaFiume, 0, lunghezzaMassima, 20, 200);
  let numSegmenti = 4;
  stroke(coloreArea(portata));
  strokeWeight(strokeSpessore(portata));
  noFill();
  // Inizia a disegnare una curva
  beginShape();
     // Primo pjnto di controllo
  curveVertex(x, y);

  for (let i = 0; i <= numSegmenti; i++) {
    let lunghezzaStep = lunghezzaSegmento / numSegmenti;
    let yOffset = random(-10, 10);
    x += lunghezzaStep;
    y += yOffset;
    curveVertex(x, y);
  }

  // Aggiunge l'ultimo punto di controllo della curva spostato a destra
  curveVertex(x + lunghezzaSegmento / 2, y);
  endShape();
}

function windowResized() {
  console.log("Finestra ridimensionata!");
  resizeCanvas(windowWidth, height);
// La distanza varia tra 120px (per finestre strette) e 180px (per finestre larghe)
  distanzaMinima = map(windowWidth, 800, 2000, 120, 180);
  
  console.log(`Nuova distanza minima: ${distanzaMinima}`);

  // Ridisegna il contenuto 
  redraw();
}
