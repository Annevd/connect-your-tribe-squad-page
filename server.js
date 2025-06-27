/*** Express setup & start ***/

// 1. Opzetten van de webserver

// Importeer de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from "./helpers/fetch-json.js";

// Importeer het npm pakket express uit de node_modules map
import express from "express";

// Stel het basis endpoint in
const apiUrl = "https://fdnd.directus.app/items";

// Maak een nieuwe express app aan
const app = express();

// Stel ejs in als template engine
// View engine zorgt ervoor dat data die je ophaalt uit de api , waar je in je code dingen mee doet, daar html van maakt
app.set("view engine", "ejs");

// Stel de map met ejs templates in
app.set("views", "./views");

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.static("public"));

// Zorg dat werken met request data makkelijker wordt
app.use(express.urlencoded({ extended: true }));

/*** Routes & data ***/

// 2. Routes die HTTP Request and Responses afhandelen

// Haal alle squads uit de WHOIS API op
const squadData = await fetchJson(apiUrl + "/squad");

// Zet een array klaar, waarin we alle globale berichten voor ons message board op gaan slaan
const messages = [];

// Maak een GET route voor de index
// Stap 1
app.get("/", async function (request, response) {
    const squadId = 4;

    try {
        const squadUrl = `${apiUrl}/squad/${squadId}`;
        const specificSquadData = await fetchJson(squadUrl);

        const personRelationIds = specificSquadData.data.persons;

        let personsData = { data: [] };
        if (personRelationIds && personRelationIds.length > 0) {
            const personFilterUrl = `${apiUrl}/person?filter={"squads":{"_in":[${personRelationIds.join(
                ","
            )}]}}`;
            personsData = await fetchJson(personFilterUrl);
        }

        response.render("index", {
            persons: personsData.data,
            squads: squadData.data,
        });
    } catch (error) {
        console.error("Fout bij het ophalen van data:", error);
        response.render("index", {
            persons: [],
            squads: [],
        });
    }
});

app.post("/", async function (request, response) {
    const squadId = 4; 
    const sortBy = request.body.sort;

    try {
        const squadUrl = `${apiUrl}/squad/${squadId}`;
        const specificSquadData = await fetchJson(squadUrl);

        const personRelationIds = specificSquadData.data.persons;

        let personsData = { data: [] };
        if (personRelationIds && personRelationIds.length > 0) {
            const personFilterUrl = `${apiUrl}/person?filter={"squads":{"_in":[${personRelationIds.join(
                ","
            )}]}}&sort=${sortBy}`;
            personsData = await fetchJson(personFilterUrl);
        }

        response.render("index", {
            persons: personsData.data,
            squads: squadData.data,
        });
    } catch (error) {
        console.error("Fout bij het sorteren van data:", error);
        response.render("index", {
            persons: [],
            squads: squadData.data,
        });
    }
});

app.get("/person/:id", function (request, response) {
    fetchJson(apiUrl + "/person/" + request.params.id)
        .then((apiData) => {
            try {
                if (apiData.data.custom) {
                    apiData.data.custom = JSON.parse(apiData.data.custom);
                } else {
                    apiData.data.custom = {};
                }
            } catch (error) {
                console.error("Kon custom JSON niet parsen:", error);
                apiData.data.custom = {};
            }

            response.render("person", {
                person: apiData.data,
                squads: squadData.data,
                messages: messages,
            });
        })
        .catch((error) => {
            console.error("Fout bij ophalen van persoon:", error);
            response.redirect("/");
        });
});

// Maak een POST route voor de index
// Als we vanuit de browser een POST doen op de detailpagina van een persoon
app.post("/person/:id", function (request, response) {
    fetchJson(apiUrl + "/person/" + request.params.id).then((apiResponse) => {
        // Het custom field is een String, dus die moeten we eerst
        // omzetten (= parsen) naar een Object, zodat we er mee kunnen werken
        try {
            apiResponse.data.custom = JSON.parse(apiResponse.data.custom);
        } catch (error) {
            apiResponse.data.custom = {};
        }

        // Stap 2: Gebruik de data uit het formulier
        // Deze stap zal voor iedereen net even anders zijn, afhankelijk van de functionaliteit

        // Controleer eerst welke actie is uitgevoerd, aan de hand van de submit button
        // Dit kan ook op andere manieren, of in een andere POST route
        if (request.body.actie == "verstuur") {
            // Als het custom object nog geen messages Array als eigenschap heeft, voeg deze dan toe
            if (!apiResponse.data.custom.messages) {
                apiResponse.data.custom.messages = [];
            }

            // Voeg een nieuwe message toe voor deze persoon, aan de hand van het bericht uit het formulier
            apiResponse.data.custom.messages.push(request.body.bericht);
        }

        // Stap 3: Sla de data op in de API

        // Voeg de nieuwe lijst messages toe in de WHOIS API,
        // via een PATCH request
        fetch(apiUrl + "/person/" + request.params.id, {
            method: "PATCH",
            body: JSON.stringify({
                custom: apiResponse.data.custom,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        }).then((patchResponse) => {
            // Redirect naar de persoon pagina
            response.redirect(303, "/person/" + request.params.id);
        });
    });
});

// Maak een GET route voor de find/filter dingen

app.get("/filter/:q", function (request, response) {
    /*
  https://fdnd.directus.app/items/person/?filter={"name":"Koop"}
  https://fdnd.directus.app/items/person/?filter={"name":{"_contains":"oo"}}
  https://fdnd.directus.app/items/person/?filter={"name":{"_eq":"oo"}}
  https://fdnd.directus.app/items/person/?filter={"bio":{"_icontains":"frontend"}}
  */

    fetchJson(apiUrl + "/person/" + request.params.q).then((apiData) => {
        // Render person.ejs uit de views map en geef de opgehaalde data mee als variable, genaamd person
        response.render("filter", {
            persons: apiData.data,
            squads: squadData.data,
        });
    });
});

// Custom routes: Game

app.get("/app", function (req, res) {
    fetchJson(apiUrl + '/person?filter={"avatar":{"_nempty":""}}').then(
        (apiData) => {
            // apiData bevat gegevens van alle personen uit alle squads
            // Je zou dat hier kunnen filteren, sorteren, of zelfs aanpassen, voordat je het doorgeeft aan de view

            // Render index.ejs uit de views map en geef de opgehaalde data mee als variabele, genaamd persons
            res.render("app", {
                persons: apiData.data,
                squads: squadData.data,
            });
        }
    );
});

// 3. Start de webserver

// Stel het poortnummer in waar express op moet gaan luisteren
app.set("port", process.env.PORT || 8000);

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get("port"), function () {
    // Toon een bericht in de console en geef het poortnummer door
    console.log(`Application started on http://localhost:${app.get("port")}`);
});
