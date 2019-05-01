import {swapperoo} from '../../src/swapperoo';
import axios from 'axios';

let elements = document.querySelectorAll('');
let callback = () => {

};

swapperoo({
    getXML: function(url) {
        return axios.get(url, {
            method: 'get'
            , responseType: 'document'
        });
    }
}).run(elements, callback);