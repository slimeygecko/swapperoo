import {swapperoo} from '../../src/swapperoo';
import axios from 'axios';

swapperoo({
    getXML: function(url) {
        return axios.get(url, {
            method: 'get'
            , responseType: 'document'
        });
    }
}).autoStart();