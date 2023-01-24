// This is acutally part of scenarium.js

$(document).ready(async function () {
    let df = new rtng('https://raw.githubusercontent.com/michaelkubina/open-scenario-generator/main/scenarium/games/dwarf_fortress.json');
    let cdda = new rtng('https://raw.githubusercontent.com/michaelkubina/open-scenario-generator/main/scenarium/games/cdda.json');

    let current = df;

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
    $("#discord").attr("href", await current.getElement('discord'));
    $("#reddit").attr("href", await current.getElement('reddit'));

    /*
     * 
     * Content
     * 
     * */

    // loop through schema

    var elements = await current.listElements('rules');

    // async for loop
    // https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    for await (const element of elements) {
        // debugging stuff
        console.log('>>> ELEMENT >>>');
        console.log(element);
        console.log('isTemplate(' + element + ')');
        console.log(await current.isTemplate(element));
        if (await current.isTemplate(element)) {
            console.log(await current.getElement(element));
        }

        if (current.isElement(element, 'title')) {
            $("#rules").append('<h1 class="display-5"></h1>').find('h1:last-child').text(await current.getElement(element, 'title'));
        }
        else if (current.isElement(element, 'description')) {
            $("#rules").append('<p class="lead"></p>').find('p:last-child').text(await current.getElement(element, 'description'));
        } /*else if (await current.isObject(element)) {
            $("#rules").append('<p></p>').find('p:last-child').text(await current.getElement(element + '.title', 'title'));
        }*/

        let sub_elements = await current.listElements(element);

        if (sub_elements) {
            for await (const sub_element of sub_elements) {
                console.log('SUBELEMENT');
                console.log(sub_element);
                if (current.isElement(sub_element, 'title')) {
                    $("#rules").append('<h1 class="display-6"></h1>').find('h1:last-child').text(await current.getElement(sub_element, 'title'));
                }
                else if (current.isElement(sub_element, 'description')) {
                    $("#rules").append('<p class="lead"></p>').find('p:last-child').text(await current.getElement(sub_element, 'description'));
                }
                else if (await current.isSequence(sub_element)) {
                    $("#rules").append('<p></p>').find('p:last-child').text(await current.parseSequence(sub_element));
                }
                /*else if (await current.isTemplate(sub_element)) {
                    $("#rules").append('<p></p>').find('p:last-child').text(await current.parseSequence(sub_element));
                }*/
            }
        }
        console.log('<<< ELEMENT <<<');
    }
});