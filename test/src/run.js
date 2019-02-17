import switcheroo from '../../src/switcheroo';
import axios from 'axios';

let elements = document.querySelectorAll('');
let callback = () => {

};

switcheroo({
    getXML: function(url) {
        return axios.get(url, {
            method: 'get'
            , responseType: 'document'
        });
    }
}).run(elements, callback);