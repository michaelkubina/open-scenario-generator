// This is acutally part of scenarium.js

$(document).ready(async function () {
    let df = new rtng('https://raw.githubusercontent.com/michaelkubina/playground/main/scenarium/games/dwarf_fortress.json');
    let cdda = new rtng('https://raw.githubusercontent.com/michaelkubina/playground/main/scenarium/games/cdda.json');

    let current = df;

    // test for object
    /*
    console.log(await current.isObject('rules')); // true
    console.log(await current.isObject('rules.title')); // false
    console.log(await current.isObject('rules.description')); // false
    console.log(await current.isObject('rules.hermit_fort')); // true
    console.log(await current.isObject('rules.hermit_fort.sequence')); // true
    */

    // test for getElement
    /*
    console.log(await current.getElement('rules')); // object
    console.log(await current.getElement('rules.title')); // string
    console.log(await current.getElement('rules.description')); // string
    console.log(await current.getElement('rules.hermit_fort')); // object
    console.log(await current.getElement('rules.hermit_fort.sequence')); // array
    */

    /*
     *
     * Game Title
     * 
     * */

    $("#title").text(await current.getElement('title'));
    $("#description").text(await current.getElement('description'));

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
        //console.log(element);
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
                //console.log(sub_element);
                if (current.isElement(sub_element, 'title')) {
                    $("#rules").append('<h1 class="display-6"></h1>').find('h1:last-child').text(await current.getElement(sub_element, 'title'));
                }
                else if (current.isElement(sub_element, 'description')) {
                    $("#rules").append('<p class="lead"></p>').find('p:last-child').text(await current.getElement(sub_element, 'description'));
                }
                /*else if (await current.isObject(sub_element)) {
                    $("#rules").append('<p></p>').find('p:last-child').text(await current.getElement(sub_element + '.title', 'title'));
                }*/
                else if (await current.isSequence(sub_element)) {
                    $("#rules").append('<p></p>').find('p:last-child').text(await current.parseSequence(sub_element));
                }
            }
        }
    }
});