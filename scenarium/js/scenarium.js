// This is acutally part of scenarium.js

var current;

$(document).ready(async function () {
    let df = new rtng('https://raw.githubusercontent.com/michaelkubina/open-scenario-generator/main/scenarium/games/dwarf_fortress.json');
    let cdda = new rtng('https://raw.githubusercontent.com/michaelkubina/open-scenario-generator/main/scenarium/games/cdda.json');
    let example = new rtng('https://raw.githubusercontent.com/michaelkubina/open-scenario-generator/main/rtng-js/example.json');
    let names = new rtng('https://raw.githubusercontent.com/michaelkubina/open-scenario-generator/main/rtng-js/names.json');

    current = names;


    // test for object
    /*
    console.log(await current.isObject('rules')); // true
    console.log(await current.isObject('rules.title')); // false
    console.log(await current.isObject('rules.description')); // false
    console.log(await current.isObject('rules.hermit_fort')); // true
    console.log(await current.isObject('rules.hermit_fort.@sequence')); // true
    */

    // test for getElement
    /*
    console.log(await current.getElement('rules')); // object
    console.log(await current.getElement('rules.title')); // string
    console.log(await current.getElement('rules.description')); // string
    console.log(await current.getElement('rules.hermit_fort')); // object
    console.log(await current.getElement('rules.hermit_fort.@sequence')); // array
    */

    // test for isTemplate
    /*
    console.log(await current.isTemplate('rules')); // false
    console.log(await current.isTemplate('rules.lazy')); // true
    console.log(await current.isTemplate('rules.title')); // false
    console.log(await current.isTemplate('rules.description')); // false
    console.log(await current.isTemplate('rules.hermit_fort')); // true
    console.log(await current.isTemplate('rules.hermit_fort.@sequence')); // false -> is already @sequence
    */

    // test for listElements
    /*
    console.log(await current.listElements('')); // [ "title", "description", "metadata", "template", "rules" ]
    console.log(await current.listElements('rules')); // [ "rules.title", "rules.description", "rules.favourite_material", "rules.hermit_fort", "rules.lazy", "rules.biome-and-material" ]
    console.log(await current.listElements('rules.lazy')); // [ "rules.lazy.@sequence" ]
    console.log(await current.listElements('rules.title')); // []
    console.log(await current.listElements('rules.description')); // []
    console.log(await current.listElements('rules.hermit_fort')); // [ "rules.hermit_fort.title", "rules.hermit_fort.description", "rules.hermit_fort.@sequence" ]
    console.log(await current.listElements('rules.hermit_fort.@sequence')); // [ "rules.hermit_fort.@sequence.0" ]
    */

    /*
     *
     * Game Matadata Banner
     * 
     * */

    $("#title").text(await current.getElement('title'));
    $("#description").text(await current.getElement('description'));
    $("#homepage").attr("href", await current.getElement('homepage'));
    $("#wiki").attr("href", await current.getElement('wiki'));
    $("#forum").attr("href", await current.getElement('forum'));
    $("#discord").attr("href", await current.getElement('discord'));
    $("#reddit").attr("href", await current.getElement('reddit'));

    /*
     * 
     * Content
     * 
     * */

    listEverything('');
});

async function listEverything(string) {
    // loop through schema

    var elements = await current.listElements(string);

    // async for loop
    // https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    for await (const element of elements) {
        // debugging stuff
        console.log('>>> ELEMENT >>> ' + element);
        console.log(element);
        console.log('isTemplate(' + element + ')');
        console.log(await current.isTemplate(element));
        if (await current.isTemplate(element)) {
            console.log(await current.getElement(element));
        }

        if (current.isElement(element, 'title')) {
            $("#rules").append('<h1></h1>').find('h1:last-child').text(await current.getElement(element, 'title'));
        }
        else if (current.isElement(element, 'description')) {
            $("#rules").append('<p></p>').find('p:last-child').text(await current.getElement(element, 'description'));
        }
        else if (await current.isSequence(element)) {
            $("#rules").append('<p></p>').find('p:last-child').text(await current.parseSequence(element));
        }

        await listEverything(element);

        console.log('<<< ELEMENT <<< ' + element);
    }
}