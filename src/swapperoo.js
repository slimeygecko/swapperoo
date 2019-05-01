import { queryAll, replace, toArray, append } from './domHelpers';

let getXML;
let cache = {};

const msgPrefix = 'Swapperoo:';
const prefix = 'data-swapperoo';
const selectors = {
    target: `${prefix}-target`,
    content: '#_content_', //should only be set to value after item is fetched.
    url: `${prefix}-url`,
    toggleClass: `${prefix}-toggle-class`,
    errorClass: `${prefix}-error-class`,
    append: `${prefix}-append`,
    accordion: `${prefix}-accordion`,
    id: `${prefix}-id`
};

let getDocument = (element) => element.contentDocument || element.contentWindow.document;

let getElementOptions = (element) => {
    let objects = Object.keys(selectors).map(key => {
        return {
            [key]: element.getAttribute(selectors[key])
        };
    });

    return Object.assign.apply({}, objects);
};

let doesNotHaveId = (el) => !el.getAttribute(selectors.id);

let makeSwapperoo = function (element, callback) {
    let options = getElementOptions(element);
    let target = queryAll(`${options.target}`)[0];
    let swapperoo = { 
        callback
        , element
        , options
        , target
        , isLoading: false
    };

    if (!swapperoo.target && !swapperoo.options.accordion) {
        console.error(`${msgPrefix} Cannot find target node from selector: ${target} on element:`, element);
        return;
    }
    return swapperoo;
};

let toggleClassNames = (element, classNames) =>
    classNames.split(' ')
        .forEach(className => element.classList.toggle(className));

let render = (swapperoo, content) => {
    let isIframe = swapperoo.element.nodeName === 'IFRAME';

    if (swapperoo.options.accordion) {
        swapperoo.element.appendChild(content);
    } else {
        if (swapperoo.options.append === 'append') {
            append(content, swapperoo.target);
        } else {
            replace(content, swapperoo.target);
        }
    }

    if (swapperoo.callback)
        swapperoo.callback(swapperoo);

    if (isIframe || (swapperoo.options.accordion && cache[swapperoo.options.url])) {
        let scope = swapperoo.target && swapperoo.target.isConnected ? swapperoo.target : (content.isConnected ? content : undefined);
        let elements = queryAll(`[${selectors.target}]`, scope);
        let accordions = queryAll(`[${selectors.accordion}]`, scope);
        let everything = elements.concat(accordions)
            .filter(doesNotHaveId);

        initialize(everything);
    }
};

let fetchAndRender = (swapperoo, url) => {
    swapperoo.element.classList.toggle('swapperoo-loading');
    getXML(url)
        .then((fragment) => {
            let options = swapperoo.options;
            let f = fragment.body.children[0];
            
            if (f && !fragment.title.includes('Error')) {
                cache[url] = f;
                swapperoo.content = f;
                render(swapperoo, f);

                swapperoo.element.classList.remove('swapperoo-loading');

                if (options.errorClass) {
                    swapperoo.element.classList.remove(options.errorClass);
                }

                if (options.accordion) {
                    toggleClassNames(swapperoo.element, options.toggleClass);
                }
            } else {
                console.error(`${msgPrefix} Empty fragment or error retrieved from: ${url}`);
                if (options.errorClass && !swapperoo.element.classList.contains(options.errorClass)) {
                    swapperoo.element.classList.add(options.errorClass);
                }
            }
        });
};

let onLoad = (swapperoo) => {
    const container = document.createElement("div");
    const doc = getDocument(swapperoo.element);

    if (!doc.title.includes('Error')) {
        append(doc.body.children, container);
        swapperoo.target = queryAll(swapperoo.options.target)[0];
        container.id = swapperoo.target.id;
        swapperoo.content = container;
        render(swapperoo, container);
    } else {
        loading.failed(swapperoo.target);
        swapperoo.element.remove();
    }
};

let onClick = (swapperoo, e) => {
    //TODO: push/pop navigation history
    e.preventDefault();
    e.stopPropagation();

    let options = swapperoo.options;
    let url = options.url || e.currentTarget.href;

    swapperoo.target = queryAll(options.target)[0];

    if ((!url && !options.accordion) || !url) {
        console.error(`${msgPrefix} url is not defined and/or accordion option is not enabled.`);
        return;
    }

    if (options.accordion && url && cache[url]) {
        swapperoo.content.classList.toggle('d-none');
        options.toggleClass
            .split(' ')
            .forEach(className => swapperoo.element.classList.toggle(className));
    } else if (!swapperoo.isLoading) {
        if (cache[url])
            render(swapperoo, cache[url]);
        else
            fetchAndRender(swapperoo, url);
    }
};

let initialize = (elements, callback) => {
    elements.forEach(function (element) {
        let swapperoo = makeSwapperoo(element, callback);

        if (element.nodeName === "IFRAME") {
            element.classList.add('hidden');
            
            let doc = getDocument(element);
            if (doc.body && doc.body.children.length) {
                onLoad(swapperoo);
            } else {
                element.onload = onLoad.bind(this, swapperoo);
            }
        } else {
            element.addEventListener('click', onClick.bind(this, swapperoo));
        }
    });
};

export function swapperoo(config) {
    getXML = config.getXML;

    if (!getXML || typeof getXML !== 'function') {
        console.error(`${msgPrefix} the required getXml() function is undefined. See documentation for usage.`);
        return;
    }

    return {
        run: (elements, callback) => {
            if (arguments.length < 2) {
                console.error(`${msgPrefix} Missing parameter. swapperoo.run() should be called with parameters (elements, callback).`);
                return;
            }
    
            if (elements && NodeList.prototype.isPrototypeOf(elements)) {
                elements = toArray(elements);
            }
    
            if (elements.filter(doesNotHaveId).length !== elements.length) {
                console.warn(`${msgPrefix} Missing 'data-swapperoo-id' on some elements. Consider adding 'data-swapperoo-id' to prevent duplicate initialization when using swapperoo.autoStart().`);
            }

            initialize(elements, callback);
        },
    
        autoStart: () => {
            //cannot pass a callback to auto-initialized elements
            let elements = queryAll('[data-swapperoo-target]')
                .filter(doesNotHaveId);
            
            initialize(elements);
        }, 
        selectors
    };
}