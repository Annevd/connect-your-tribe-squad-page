const grid = document.querySelector('.grid');
let results = 0;
const width = 15;
const aliensRemoved = [];
let currentShooterIndex = 202;
let alienInvadersID;
let isGoingRight = true;
let direction = 1;
const resultDisplay = document.querySelector('.results');

var personsData = JSON.parse(document.getElementById('personsData').value);

// voegt een eventlistener toe aan het document en wacht tot alle elementen etc zijn ingeladen
document.addEventListener('DOMContentLoaded', function() {
    // pakt de data uit het inputveld van html en zet deze om in een js object onder de variabele personData
    var personsData = JSON.parse(document.getElementById('personsData').value);
});



// zolang i kleiner is dan width * width (250) doe i + 1
for (let i = 0; i < width * width; i++) {
    // maak een div aan
    const square = document.createElement('div');

    // koppelt square met de klasse grid
    grid.appendChild(square);

}
// alle items in grid div worden omgezet in een array (alle divs gaan in een array)
const squares = Array.from(document.querySelectorAll('.grid div'));

console.log(squares);

// geef aan waar de space invaders moeten komen
const alienInvaders = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39
];

function draw() {
    // doe 1 + i zolang i kleiner is dan de lengte van alienInvaders array
    for (let i = 0; i < alienInvaders.length; i++) {
        // als het niet in de array aliensremoved zit kan de class invader worden toegevoegd
        if (!aliensRemoved.includes(i)) {
            // waar squares van toepassing is geeft hij een html img mee waarin de waarde wordt geloopt uit de database
            squares[alienInvaders[i]].innerHTML= "<img src='" + personsData[i].avatar + "'>";
            // stopt alle waardes van alienInvaders in squares en geeft de divs class invader
            squares[alienInvaders[i]].classList.add('invader');

        }

    }
}
console.log(personsData)
draw()

// geef square met waarde van currenShooterIndex de class shooter
squares[currentShooterIndex].classList.add('shooter');


// verwijdert de invaders
function remove() {
    // loopt zolang als alienInvaders array lang is
    for (let i = 0; i < alienInvaders.length; i++) {
        // kijkt naar de waarde van squares en maakt daar de html weer leeg waar squares niet is
        squares[alienInvaders[i]].innerHTML= "";
        // kijkt in squeres op de waardes van alienInvaders en verwijdert daar class invader
        squares[alienInvaders[i]].classList.remove('invader');
    }
}


// functie voor het verwijderen van de shooter
function moveShooter(e) {
    // kijk in squares waar de shooter is en haal de class shooter er vanaf
    squares[currentShooterIndex].classList.remove('shooter');
    switch (e.key) {
        // als er pijl links wordt gedrukt
        case 'ArrowLeft':
            // als de index niet 0 is kan je niet meer naar links en ga je 1 terug
            if (currentShooterIndex % width !== 0) currentShooterIndex -= 1
            // pauze
            break
        case 'ArrowRight':
            // als de index niet 0 is kan je niet meer naar links en ga je 1 terug
            if (currentShooterIndex % width < width - 1) currentShooterIndex += 1
            // pauze
            break
    }
    // verander de class van een andere square in shooter zodat het lijkt of deze beweegt
    squares[currentShooterIndex].classList.add('shooter');

}

// activeer move shooter wanneer je op een toets drukt
document.addEventListener('keydown', moveShooter);

// functie om de invaders te verplaatsen
function moveInvaders() {
    // check wat de randen zijn
    const leftEdge = alienInvaders[0] % width === 0;
    const rightEdge = alienInvaders[alienInvaders.length - 1] % width === width - 1;
    // voer emove uit
    remove();

    // als rightEdge en is going right true zijn
    if (rightEdge && isGoingRight) {
        // zolang de i kleiner is als lengte van alieninvaders
        for (let i = 0; i < alienInvaders.length; i++) {
            // verander de width direction en boolean
            alienInvaders[i] += width;
            direction = -1;
            isGoingRight = false;
        }
    }
    //als left edge waar is en is goingright false doe dan
    if (leftEdge && !isGoingRight) {
        for (let i = 0; i < alienInvaders.length; i++) {
            // de variabelen aanpassen
            alienInvaders[i] += width -1;
            direction = 1;
            isGoingRight = true;
        }
    }
// als i kleiner is dan alieninvaders length
    for (let i = 0; i < alienInvaders.length; i++) {
        // tel dan direction op bij alieninvader array
        alienInvaders[i] += direction;
    }
    //voer draw uit
    draw();
    // als squares class invader bevat en traceer waar de shooter is
    if (squares[currentShooterIndex].classList.contains("invader")) {
        // verander de tekst in result display
        resultDisplay.innerHTML = 'GAME OVER';
        // reset invadersId
        clearInterval(invadersId);
    }
    // als alienRemoved lengte (0) gelijk is aan de lengte van alienInvaders
    if (aliensRemoved.length === alienInvaders.length) {
        resultDisplay.innerHTML = 'YOU WIN!';
        // reset de invadersid
        clearInterval(invadersId);
    }
}
// maak een interval van 600 seconden en voeg die toe aan de functie moveInvaders
invadersId = setInterval(moveInvaders, 600);

function shoot(e) {
    let laserID;
    let currentLaserIndex = currentShooterIndex;

    // functie om te schieten
    function moveLaser() {
        squares[currentLaserIndex].classList.remove('laser');
        // positioneert de laser negatief
        currentLaserIndex -= width;
        squares[currentLaserIndex].classList.add('laser');

        // als de square class invader heeft
        if (squares[currentLaserIndex].classList.contains('invader')) {
            // verwijder deze classes
            squares[currentLaserIndex].classList.remove('laser');
            squares[currentLaserIndex].classList.remove('invader');
            // voeg de class boom toe
            squares[currentLaserIndex].classList.add('boom');
            squares[currentLaserIndex].innerHTML=("<img src='images/Explosie.png'>")

            // verwijder boom class na 300ms
            setTimeout(()=> squares[currentLaserIndex].classList.remove('boom'), 300);
            // reset laserID
            clearInterval(laserID);

            // kijkt welke aliens er vallen onder cuttenlaserindex en slaat deze op in alienRemoved
            const alienRemoved = alienInvaders.indexOf(currentLaserIndex);
            // voegt alienremoved toe aan de array
            aliensRemoved.push(alienRemoved);
            // voegt 1 toe aan results
            results ++;
            // laat de score zien van results en veranderd resultsdisplay class
            resultDisplay.innerHTML = results;
        }

    }
    // wanneer arrow up ingedrukt is wordt de movelaser uitgevoerd

        if (e.key === 'ArrowUp') { // 'ArrowUp' in plaats van 'arrowUp'
            // set een timeout van 100ms op de laserID
             laserID = setInterval(moveLaser, 100);
    }
}

// als er op een knop gedrukt wordt activeer shoot
document.addEventListener('keydown', shoot);