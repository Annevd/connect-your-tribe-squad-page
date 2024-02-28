// pop-up functie bericht versturen
const personsMessages = document.querySelector('.persons-card-messages');
const persons = document.querySelector('.persons-card');
let personsMessageCheck = false;
// pop-up functie berichten bekijken
const personMessagesCheck = document.querySelector('.persons-card-check-messages');
let messagesCheck = false;




// wanneer er op de knop berichten wordt geklikt
document.getElementById('personsCardMessagesActivate').addEventListener('click', function() {
    if (personsMessageCheck === false) {
messagesActive();
    } else {
        messageNonActive();
    }
});

// wanneer erop sluit wordt geklikt in berichten
document.getElementById('personsCardMessagesDeactivate').addEventListener('click', function() {
    messageNonActive();
});




// laat person message verschijnen op het beeld
function messagesCheckActive() {
    messagesCheck = true;
    personsMessageCheck.classList.add('persons-card-messages-active');
}

// laat person message verwijderen van het beeld
function messageCheckNonActive() {
    messagesCheck = false;
    personsMessageCheck.classList.remove('persons-card-messages-active');
}
 