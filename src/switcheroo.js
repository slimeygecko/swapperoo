import { queryAll, replace, toArray, append } from './domHelpers';

let getXML;
let cache = {};

const msgPrefix = 'Switcheroo:';
const prefix = 'data-switcheroo';
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

let makeSwitcheroo = function (element, callback) {
    let options = getElementOptions(element);
    let target = queryAll(`${options.target}`)[0];
    let switcheroo = { 
        callback
        , element
        , options
        , target
        , isLoading: false
    };

    if (!switcheroo.target && !switcheroo.options.accordion) {
        console.error(`${msgPrefix} Cannot find target node from selector: ${target} on element:`, element);
        return;
    }
    return switcheroo;
};

let toggleClassNames = (element, classNames) =>
    classNames.split(' ')
        .forEach(className => element.classList.toggle(className));

let render = (switcheroo, content) => {
    let isIframe = switcheroo.element.nodeName === 'IFRAME';

    if (switcheroo.options.accordion) {
        switcheroo.element.appendChild(content);
    } else {
        if (switcheroo.options.append === 'append') {
            append(content, switcheroo.target);
        } else {
            replace(content, switcheroo.target);
        }
    }

    if (switcheroo.callback)
        switcheroo.callback(switcheroo);

    if (isIframe || (switcheroo.options.accordion && cache[switcheroo.options.url])) {
        let scope = switcheroo.target && switcheroo.target.isConnected ? switcheroo.target : (content.isConnected ? content : undefined);
        let elements = queryAll(`[${selectors.target}]`, scope);
        let accordions = queryAll(`[${selectors.accordion}]`, scope);
        let everything = elements.concat(accordions)
            .filter(doesNotHaveId);

        initialize(everything);
    }
};

let fetchAndRender = (switcheroo, url) => {
    switcheroo.element.classList.toggle('switcheroo-loading');
    getXML(url)
        .then((fragment) => {
            let options = switcheroo.options;
            let f = fragment.body.children[0];
            
            if (f && !fragment.title.includes('Error')) {
                cache[url] = f;
                switcheroo.content = f;
                render(switcheroo, f);

                switcheroo.element.classList.remove('switcheroo-loading');

                if (options.errorClass) {
                    switcheroo.element.classList.remove(options.errorClass);
                }

                if (options.accordion) {
                    toggleClassNames(switcheroo.element, options.toggleClass);
                }
            } else {
                console.error(`${msgPrefix} Empty fragment or error retrieved from: ${url}`);
                if (options.errorClass && !switcheroo.element.classList.contains(options.errorClass)) {
                    switcheroo.element.classList.add(options.errorClass);
                }
            }
        });
};

let onLoad = (switcheroo) => {
    const container = document.createElement("div");
    const doc = getDocument(switcheroo.element);

    if (!doc.title.includes('Error')) {
        append(doc.body.children, container);
        switcheroo.target = queryAll(switcheroo.options.target)[0];
        container.id = switcheroo.target.id;
        switcheroo.content = container;
        render(switcheroo, container);
    } else {
        loading.failed(switcheroo.target);
        switcheroo.element.remove();
    }
};

let onClick = (switcheroo, e) => {
    //TODO: push/pop navigation history
    e.preventDefault();
    e.stopPropagation();

    let options = switcheroo.options;
    let url = options.url || e.currentTarget.href;

    switcheroo.target = queryAll(options.target)[0];

    if ((!url && !options.accordion) || !url) {
        console.error(`${msgPrefix} url is not defined and/or accordion option is not enabled.`);
        return;
    }

    if (options.accordion && url && cache[url]) {
        switcheroo.content.classList.toggle('d-none');
        options.toggleClass
            .split(' ')
            .forEach(className => switcheroo.element.classList.toggle(className));
    } else if (!switcheroo.isLoading) {
        if (cache[url])
            render(switcheroo, cache[url]);
        else
            fetchAndRender(switcheroo, url);
    }
};

let initialize = (elements, callback) => {
    elements.forEach(function (element) {
        let switcheroo = makeSwitcheroo(element, callback);

        if (element.nodeName === "IFRAME") {
            element.classList.add('hidden');
            
            let doc = getDocument(element);
            if (doc.body && doc.body.children.length) {
                onLoad(switcheroo);
            } else {
                element.onload = onLoad.bind(this, switcheroo);
            }
        } else {
            element.addEventListener('click', onClick.bind(this, switcheroo));
        }
    });
};

function switcheroo(config) {
    getXML = config.getXML;

    if (!getXML || typeof getXML !== 'function') {
        console.error(`${msgPrefix} the required getXml() function is undefined. See documentation for usage.`);
        return;
    }

    return {
        run: (elements, callback) => {
            if (arguments.length < 2) {
                console.error(`${msgPrefix} Missing parameter. switcheroo.run() should be called with parameters (elements, callback).`);
                return;
            }
    
            if (elements && NodeList.prototype.isPrototypeOf(elements)) {
                elements = toArray(elements);
            }
    
            if (elements.filter(doesNotHaveId).length !== elements.length) {
                console.warn(`${msgPrefix} Missing 'data-switcheroo-id' on some elements. Consider adding 'data-switcheroo-id' to prevent duplicate initialization when using switcheroo.autoStart().`);
            }

            initialize(elements, callback);
        },
    
        autoStart: () => {
            //cannot pass a callback to auto-initialized elements
            let elements = queryAll('[data-switcheroo-target]')
                .filter(doesNotHaveId);
            
            initialize(elements);
        }, 
        selectors
    };
}

export default switcheroo;