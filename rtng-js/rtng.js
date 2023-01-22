/*
 *
 * this is part of rtng.js
 * 
 * */

class rtng {

    /*
     * 
     * Constructor
     * 
     * */

    // create object and load JSON as promise
    constructor(url) {
        this.promise = fetch(url)
            .then((response) => response.json())
            .then((data) => {
                //console.log(data);
                //console.log(Object.keys(data));
                return data;
            });
    }

    /*
     * 
     * Path Interpretor
     * 
     * */

    // https://stackoverflow.com/questions/38640072/how-to-get-nested-objects-in-javascript-by-an-string-as-a-bracket-notation
    // get the value of an object trough dot.notation and bracket[notation]
    getValue(path, obj) {
        let value = path.replace(/\[([^\]]+)]/g, '.$1').split('.').reduce(function (o, p) {
            return o[p];
        }, obj);
        //console.log('Object: ' + obj);
        //console.log(typeof value);
        return value;
    }

    /*
     *
     * Boolean Checks
     * 
     * */

    // checks if element has specific name
    isElement(path, name) {
        // check wether it is .title, .description, .anything etc.
        if (path.endsWith('.' + name)) {
            return true;
        }
        return false;
    }

    // checks if element is object-element or a value/literal
    async isObject(path) {
        // check wether it is new hierarchy
        if (typeof this.getValue(path, await this.promise) === 'object' && Array.isArray(this.getValue(path, await this.promise)) == false) {
            console.log(path + " is object");
            return true;
        }
        console.log(path + " is NOT object");
        return false;
    }

    // checks if element has a sequence-list
    isSequence(path) {
        return this.isElement(path, 'sequence');
    }

    /*
     * 
     * Value and Object Retrieval
     * 
     * */

    // get the value of a element from a path
    async getElement(path) {
        //console.log(this.getValue(path, await this.promise));
        return (this.getValue(path, await this.promise));
    }

    // returns a path to all elements at the given hierarchy
    async listElements(path) {
        // if empty path, then return keys from highest hierarchy
        if (path === '') {
            return Object.keys(await this.promise);
        }
        let target = this.getValue(path, await this.promise);
        // prevent to list string as indexed array
        if (typeof target === 'string' || target instanceof String) {
            return;
        } else {
            // get all keys from path
            let allElements = Object.keys(target);
            // add key to path in dot-notation
            allElements.forEach((item, index) => allElements[index] = path + "." + item);
            //console.log(allElements);
            return allElements;
        }
    }

    /*
     * 
     * PARSING
     * 
     * */

    async parseRaw(object) {
        console.log(">>> BEGIN PARSING RAW");

        let raw = object.raw + " "

        console.log("<<< END PARSING RAW");
        return raw;
    }

    async parseString(object) {
        console.log(">>> BEGIN PARSING STRING");

        //let picks = this.getValue(path + '.string.picks', await this.promise);
        let picks = await object.string.picks;
        console.log("picks: = " + picks);

        let number_of_items = await object.string.items.length;
        console.log("number_of_items = " + number_of_items);

        let random_index = Math.floor(Math.random() * number_of_items);

        let string = object.string.items[random_index];

        console.log("<<< END PARSING STRING");
        return string;
    }

    async parseNumber(object) {
        console.log(">>> BEGIN PARSING NUMBER");

        let min = await object.number.min;
        let max = await object.number.max;
        let width = await object.number.width; // not implemented yet

        let result = Math.floor(Math.random() * max) + min;

        console.log("<<< END PARSING NUMBER");
        return result;
    }

    async parseSequence(path) { // e.g. rules.hermit_fort.sequence
        let output = '';

        console.log('Begin parsing sequence');

        let parsables = await this.listElements(path);
        console.log('All parsables:');
        console.log(parsables);

        for await (const parsable_item of parsables) {
            console.log('Current parsable item:');
            let parsable_element = this.getValue(parsable_item, await this.promise);
            console.log(parsable_element);

            //console.log(Object.keys(parsable_element));
            if (Object.keys(parsable_element) == 'raw') {
                console.log(parsable_element + ' is a raw');
                output += await this.parseRaw(parsable_element);
            }
            else if (Object.keys(parsable_element) == 'string') {
                console.log(parsable_element + ' is a string');
                output += await this.parseString(parsable_element);
            }
            else if (Object.keys(parsable_element) == 'number') {
                console.log(parsable_element + ' is a number');
                output += await this.parseNumber(parsable_element);
            }
            else if (Object.keys(parsable_element) == 'template') {
                console.log(parsable_element + ' is a template');
                console.log(parsable_element.template);
                output += await this.parseSequence(parsable_element.template + '.sequence');
            }


            // https://stackoverflow.com/questions/46953029/can-i-check-for-object-properties-in-a-switch-statement
            /*switch (true) {
                case (Object.keys(parsable_element) == 'raw'):
                    output += await this.parseRaw(parsable_element);
                    break;
                case (Object.keys(parsable_element) == 'string'):
                    // do something
                    break;
            }*/

            /*if (current.isElement(sub_element, 'title')) {
                $("#rules").append('<h1></h1>').find('h1:last-child').text(await current.getElement(sub_element, 'title'));
            } else if (current.isElement(sub_element, 'description')) {
                $("#rules").append('<h6></h6>').find('h6:last-child').text(await current.getElement(sub_element, 'description'));
            } else if (await current.isObject(sub_element)) {
                $("#rules").append('<p></p>').find('p:last-child').text(await current.getElement(sub_element + '.title', 'title'));
            }*/
        }
        // loop through sequence and concat
            // parsed raw OR

            // parsed string OR

            // parsed number OR

            // parse template
            // & make sure not to fall into infinite loop!!!
        console.log('End Parsing sequence');
        return output;
    }
}