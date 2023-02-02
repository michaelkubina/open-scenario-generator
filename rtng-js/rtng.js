/**
 * 
 * RTNG.js is a "Random Text and Number Generator"
 * written by Michael Kubina
 * 
 * https://github.com/michaelkubina/open-scenario-generator
 * 
 * 2023-02-02
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
        let debug = false;

        // check wether it is new hierarchy
        if (typeof this.getValue(path, await this.promise) === 'object' && Array.isArray(this.getValue(path, await this.promise)) == false) {
            console.log(path + " is object");
            return true;
        }
        if (debug) console.log(path + " is NOT object");

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
        let debug = false;
        if (debug) console.log(this.getValue(path, await this.promise));
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
     * add punctuation and conjunction to list
     * @param {any} list
     * @param {any} punctuation
     * @param {any} conjunction
     */
    applyPunctuation(list, punctuation, conjunction) {
        // abort on empty list or list with only one item
        if (list.length < 2) {
            return list;
        }

        // add puncuation
        if (punctuation) {
            // add punctuation to all elements in array except the two last
            for (let i = 0; i < list.length - 2; i++) {
                list[i] = list[i] + punctuation;
            }
            if (conjunction) {
                // add conjunction before the last
                list.splice(list.length - 1, 0, conjunction);
            } else {
                // if there is no conjunction add punctuation instead 
                list[list.length - 2] = list[list.length - 2] + punctuation;
            }
            return list;
        }
    }

    /**
     * Returns a sorted list of values (lexicographically or numerical)
     * @param {any} list
     * @param {any} sort
     */
    applySort(list, sort) {
        // abort on empty list or list with only one item and when no sorting direction
        if (list.length < 2 || sort == "none") {
            return list;
        }

        // sort string lexicographically and numbers numerically
        if (typeof(list[0]) == "number" && sort == "asc") {
            return list.sort(function (a, b) { return a - b });
        }
        if (typeof (list[0]) == "number" && sort == "desc") {
            return list.sort(function (a, b) { return b - a });
        }
        if (typeof (list[0]) == "string" && sort == "asc") {
            return list.sort();
        }
        if (typeof (list[0]) == "string" && sort == "desc") {
            return list.sort().reverse();
        }
    }

    /**
     * parse a raw object within a @sequence
     * @param {raw} object
     */
    async parseRaw(object) {
        return object.raw + " ";
    }

    /**
     * parse a string object within a @sequence
     * @param {any} object
     */
    async parseString(object) {

        let debug = true;

        if (debug) console.log(">>> BEGIN PARSING STRING");

        let output = [];
        let current_picks = [];

        // get list length
        let number_of_items = await object.string.list.length;
        if (debug) console.log("items: " + number_of_items);
        if (debug) console.log(await object.string.list);

        // min_picks (optional)
        let min_picks = 1; // default
        if (await object.string.min_picks >= 0) {
            min_picks = await object.string.min_picks;
        }
        if (debug) console.log("min_picks: " + min_picks);

        // max_picks (optional)
        let max_picks = 1; // default
        if (await object.string.max_picks >= 0) {
            max_picks = await object.string.max_picks;
        }
        if (debug) console.log("max_picks: " + max_picks);

        // get unique
        let unique = false; // default
        if (await object.string.unique) {
            unique = await object.string.unique;
        }
        if (debug) console.log("unique: " + unique);

        // get sort
        let sort = "none"; // default
        if (await object.string.sort) {
            sort = await object.string.sort;
        }
        if (debug) console.log("sort: " + sort);

        // punctuation
        let punctuation = '' // default
        if (await object.string.punctuation) {
            punctuation = await object.string.punctuation;
        }
        if (debug) console.log("punctuation: " + punctuation);

        // conjunction
        let conjunction = '' // default
        if (await object.string.conjunction) {
            conjunction = await object.string.conjunction;
        }
        if (debug) console.log("conjunction: " + conjunction);

        // random pick (unique or repeatable)
        for (let i = 1; i <= min_picks; i++) {
            // add random list item
            let random_index;

            // not unique picks allowed
            if (!unique) {
                random_index = Math.floor(Math.random() * number_of_items); // random pick
            }

            // unique picks expected
            if (await unique) {
                let is_unique_pick = false;
                while (!is_unique_pick) {
                    random_index = Math.floor(Math.random() * number_of_items); // random pick
                    if (current_picks.includes(random_index)) {
                        // just pick again
                    } else {
                        current_picks.push(random_index);
                        is_unique_pick = true;
                    };
                }
            }

            // add to string array and make sure the type is converted to string
            output.push(await object.string.list[random_index].toString());
        }

        output = this.applySort(output, sort);

        // add puncuation
        output = this.applyPunctuation(output, punctuation, conjunction);

        if (debug) console.log("<<< END PARSING STRING");
        return output.join(' ');
    }

    /**
     * parse a number object within a @sequence
     * @param {any} object
     */
    async parseNumber(object) {
        let debug = false;

        if (debug) console.log(">>> BEGIN PARSING NUMBER");

        /*
            "number": {
              "min": 0,
              "max": 100,
              "steps": 1,
              "min_picks": 0,
              "max_picks": 2,
              "unique": true,
              "return_list": false,
              "sort": "none",
              "punctuation": ",",
              "conjunction": "and"
            }
        */

        let output = [];
        let current_picks = [];

        // min (required)
        let min = await object.number.min;
        if (debug) console.log("min: " + min);

        // max (required)
        let max = await object.number.max;
        if (debug) console.log("max: " + max);

        // steps (optional)
        let steps = 1; // default
        if (await object.number.steps > 0) {
            steps = await object.number.steps;
        }
        if (debug) console.log("steps: " + steps);

        // min_picks (optional)
        let min_picks = 1; // default
        if (await object.number.min_picks >= 0) {
            min_picks = await object.number.min_picks;
        }
        if (debug) console.log("min_picks: " + min_picks);

        // max_picks (optional)
        let max_picks = 1; // default
        if (await object.number.max_picks >= 0) {
            max_picks = await object.number.max_picks;
        }
        if (debug) console.log("max_picks: " + max_picks);

        // unique
        let unique = true; // default
        if (typeof(await object.number.unique) == "boolean") {
            unique = await object.number.unique;
        }
        if (debug) console.log("unique: " + unique);

        // return_list
        let return_list = false;
        if (await object.number.return_list) {
            return_list = await object.number.return_list;
        }
        if (debug) console.log("return_list: " + return_list);

        // sort
        let sort = "none" // default
        if (await object.number.sort) {
            sort = await object.number.sort;
        }
        if (debug) console.log("sort: " + sort);

        // punctuation
        let punctuation = '' // default
        if (await object.number.punctuation) {
            punctuation = await object.number.punctuation;
        }
        if (debug) console.log("punctuation: " + punctuation);

        // conjunction
        let conjunction = '' // default
        if (await object.number.conjunction) {
            conjunction = await object.number.conjunction;
        }
        if (debug) console.log("conjunction: " + conjunction);

        // roll the numbers
        for (let i = 1; i <= min_picks; i++) {
            // add random list item
            let random_number;
            if (unique) {
                let unique_pick = false;
                while (!unique_pick) {
                    random_number = Math.floor(Math.random() * ((max - min) / steps)); // random pick
                    random_number = random_number * steps + min;
                    if (current_picks.includes(random_number)) {
                        unique_pick = false; // not necessary
                    } else {
                        current_picks.push(random_number);
                        unique_pick = true;
                    };
                }
            } else {
                random_number = Math.floor(Math.random() * ((max - min) / steps)); // random pick
                random_number = random_number * steps + min;
            }
            output.push(random_number);
        }

        if (debug) console.log(output);

        // sort
        output = this.applySort(output, sort);

        // add punctuation
        output = this.applyPunctuation(await output, await punctuation, await conjunction);

        if (debug) console.log("<<< END PARSING NUMBER");

        return output.join(' ');
    }

    /**
     * parse a @sequence
     * @param {any} path
     */
    async parseSequence(path) { // e.g. rules.hermit_fort.@sequence
        let debug = false;

        let sequence = [];

        if (debug) console.log('Begin parsing @sequence');

        let parsables = await this.listElements(path);
        if (debug) console.log('All parsables:');
        if (debug) console.log(parsables);

        for await (const parsable_item of parsables) {
            if (debug) console.log('Current parsable item:');

            let parsable_element = this.getValue(parsable_item, await this.promise);
            if (debug) console.log(parsable_element);

            //console.log(Object.keys(parsable_element));
            if (Object.keys(parsable_element) == 'raw') {
                if (debug) console.log(parsable_element + ' is a raw');
                sequence.push(await this.parseRaw(parsable_element));
            }
            else if (Object.keys(parsable_element) == 'string') {
                if (debug) console.log(parsable_element + ' is a string');
                sequence.push(await this.parseString(parsable_element));
            }
            else if (Object.keys(parsable_element) == 'number') {
                if (debug) console.log(parsable_element + ' is a number');
                sequence.push(await this.parseNumber(parsable_element));
            }
            else if (Object.keys(parsable_element) == 'template') {
                if (debug) console.log(parsable_element + ' is a template');
                if (debug) console.log(parsable_element.template);
                // TODO: make sure not to fall into infinite loop!!!
                sequence.push(await this.parseSequence(parsable_element.template + '.@sequence'));
            }
        }
        if (debug) console.log('End Parsing @sequence');
        return sequence.join(' ');
    }

    /**
     * checks if a element is a template (= has a @sequence)
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
     * Parse a template from a path, returns the parsed text
     * @param {any} path
     */
    async parseTemplate(path) {
        let debug = false;

        if (debug) console.log('>>> parseTemplate(' + path + ')');

        // parse sequence if path to template
        if (await this.isTemplate(path)) {
            return await this.parseSequence(path + '.@sequence');
        }
        
        if (debug) console.log('<<< parseTemplate(' + path + ')');
    }
}