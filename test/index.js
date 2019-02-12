import switcheroo from '../src/switcheroo';
import axios from 'axios';

switcheroo({
    getXML: function(url) {
        return axios.get(url, {
            method: 'get'
            , responseType: 'document'
        });
    }
}).autoStart();