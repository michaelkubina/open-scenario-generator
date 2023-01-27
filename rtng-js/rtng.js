/**
 * 
 * RTNG.js is a "Random Text and Number Generator"
 * written by Michael Kubina
 * 
 * https://github.com/michaelkubina/open-scenario-generator
 * 
 * 2023-01-23
 * 
 */
class rtng {

    /**
     * create object and load JSON as promise
     * @param {any} url
     */
    constructor(url) {
        this.promise = fetch(url)
            .then((response) => response.json())
            .then((data) => {
                //console.log(data);
                //console.log(Object.keys(data));
                return data;
            });
    }

    /**
     * get the value of an object trough dot.notation and bracket[notation]
     * https://stackoverflow.com/questions/38640072/how-to-get-nested-objects-in-javascript-by-an-string-as-a-bracket-notation
     * @param {any} path
     * @param {any} obj
     */
    getValue(path, obj) {
        let value = path.replace(/\[([^\]]+)]/g, '.$1').split('.').reduce(function (o, p) {
            return o[p];
        }, obj);
        //console.log('Object: ' + obj);
        //console.log(typeof value);
        return value;
    }

    /**
     * checks if element has specific name
     * @param {any} path
     * @param {any} name
     */
    isElement(path, name) {
        // check wether it is .title, .description, .anything etc.
        if (path.endsWith('.' + name)) {
            return true;
        }
        return false;
    }

    /**
     * checks if element is object-element or a value/literal
     * @param {any} path
     */
    async isObject(path) {
        // check wether it is new hierarchy
        if (typeof this.getValue(path, await this.promise) === 'object' && Array.isArray(this.getValue(path, await this.promise)) == false) {
            console.log(path + " is object");
            return true;
        }
        console.log(path + " is NOT object");
        return false;
    }

    /**
     * checks if element has a @sequence
     * @param {any} path
     */
    isSequence(path) {
        return this.isElement(path, '@sequence');
    }

    /**
     * get the value of a element from a path
     * @param {any} path
     */
    async getElement(path) {
        //console.log(this.getValue(path, await this.promise));
        return (this.getValue(path, await this.promise));
    }

    /**
     * returns a path to all elements at the given hierarchy
     * @param {any} path
     */
    async listElements(path) {
        // if empty path, then return keys from highest hierarchy
        if (path === '') {
            return Object.keys(await this.promise);
        }
        let target = this.getValue(path, await this.promise);
        // prevent to list string as indexed array
        if (typeof target === 'string' || target instanceof String) {
            return [];
        } else {
            // get all keys from path
            let allElements = Object.keys(target);
            // add key to path in dot-notation
            allElements.forEach((item, index) => allElements[index] = path + "." + item);
            //console.log(allElements);
            return allElements;
        }
    }

    /**
     * Returns the parsed raw string
     * @param {raw} object
     */
    async parseRaw(object) {
        console.log(">>> BEGIN PARSING RAW");
        console.log(object);

        let raw = object.raw + " "

        console.log("<<< END PARSING RAW");
        return raw;
    }

    /**
     * 
     * @param {any} object
     */
    async parseString(object) {
        let string = [];
        let current_picks = [];
        console.log(">>> BEGIN PARSING STRING");

        // get list length
        let number_of_items = await object.string.list.length;
        console.log("items: " + number_of_items);

        //get number of picks
        let picks = await object.string.picks;
        console.log("picks: " + picks);

        //get unique
        let unique = await object.string.unique;
        console.log("unique: " + unique);

        //get punctuation
        let punctuation = await object.string.punctuation;
        console.log("punctuation: " + punctuation);

        //get conjunction
        let conjunction = await object.string.conjunction;
        console.log("conjunction: " + conjunction);

        for (let i = 1; i <= picks; i++) {
            // add conjunction
            if (i == await picks && await picks > 1) {
                string.push(conjunction);
            }

            // add random list item
            let random_index;
            if (await unique) {
                let unique_pick = false;
                while (!unique_pick) {
                    random_index = Math.floor(Math.random() * await number_of_items); // random pick
                    if (current_picks.includes(random_index)) {
                        unique_pick = false; // not necessary
                    } else {
                        current_picks.push(random_index);
                        unique_pick = true;
                    };
                }
            } else {
                random_index = Math.floor(Math.random() * number_of_items); // random pick
            }

            // add puncuation
            if (i < await picks-1 && picks > 1) {
                string.push(await object.string.list[random_index] + await punctuation);
            } else {
                string.push(await object.string.list[random_index]);
            }
        } 

        console.log("<<< END PARSING STRING");
        return await string.join(' ');
    }

    /**
     * 
     * @param {any} object
     */
    async parseNumber(object) {
        console.log(">>> BEGIN PARSING NUMBER");

        /*
            "min": -273.15, // the smallest possible value
            "max": 3683.00, // the biggest possible value
            "start": 0, // the beginning of the scale

            "min_steps": 25.00, // the smallest increment/decrement for a random pick
            "max_steps": 100.00, // the biggest increment/decrement for a random pick
            "steps_steps": 5.00, // the increment/decrement for the increment/decrement itself???

            "min_range": 25.00, // the smallest width of a range
            "max_range": 100.00, // the largest width of a range
            "steps_range": 25.00, // the increment/decrement for the width of the range
            "bound": false // is it for a range allowed to get out of bound an being thus smaller then the min/max range
        */

        let min = await object.number.min;
        let max = await object.number.max;
        let steps = await object.number.steps;
        let range = await object.number.range;
        let bound = await object.number.bound;

        let result = Math.floor(Math.random() * (max-min) + min);

        console.log("<<< END PARSING NUMBER");
        return result;
    }

    /**
     * 
     * @param {any} path
     */
    async parseSequence(path) { // e.g. rules.hermit_fort.@sequence
        let sequence = [];

        console.log('Begin parsing @sequence');

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
                sequence.push(await this.parseRaw(parsable_element));
            }
            else if (Object.keys(parsable_element) == 'string') {
                console.log(parsable_element + ' is a string');
                sequence.push(await this.parseString(parsable_element));
            }
            else if (Object.keys(parsable_element) == 'number') {
                console.log(parsable_element + ' is a number');
                sequence.push(await this.parseNumber(parsable_element));
            }
            else if (Object.keys(parsable_element) == 'template') {
                console.log(parsable_element + ' is a template');
                console.log(parsable_element.template);
                // TODO: make sure not to fall into infinite loop!!!
                sequence.push(await this.parseSequence(parsable_element.template + '.@sequence'));
            }
        }
        console.log('End Parsing @sequence');
        return sequence.join(' ');
    }

    /**
     * checks if element has a @sequence
     * @param {any} path
     */
    async isTemplate(path) {
        // get a list of paths of all sub-elements for a given path
        let elements = await this.listElements(path);

        // if it's actually a list
        if (Array.isArray(await elements)) {
            // look if it has a @sequenceitem
            for await (const item of elements)
                if (item.endsWith('.@sequence')) {
                    return true;
                }
        }
        return false;
    }

    /**
     * Parse a template from a path, returns the pared text
     * @param {any} path
     */
    async parseTemplate(path) {
        // debug stuff
        console.log('>>> parseTemplate(' + path + ')');

        if (await this.isTemplate(path)) {
            return await this.parseSequence(path + '.@sequence');
        }
        
        console.log('<<< parseTemplate(' + path + ')');
        return output;
    }
}