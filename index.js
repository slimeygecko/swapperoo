import request from './request';
import loading from './loading';
import u from 'umbrellajs';

const msgPrefix = 'Switcheroo:';
const prefix = 'data-switcheroo';

let cache = {};
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
    let target = u(`${options.target}`).first();
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
            switcheroo.target.appendChild(content);
        } else {
            u(switcheroo.target).replace(content);
        }
    }

    if (switcheroo.callback)
        switcheroo.callback(switcheroo);

    if (isIframe || (switcheroo.options.accordion && cache[switcheroo.options.url])) {
        let scope = switcheroo.target && switcheroo.target.isConnected ? switcheroo.target : (content.isConnected ? content : undefined);
        let elements = u(`[${selectors.target}]`, scope).nodes;
        let accordions = u(`[${selectors.accordion}]`, scope).nodes;
        let everything = elements.concat(accordions)
            .filter(doesNotHaveId);

        initialize(everything);
    }
};

let fetchAndRender = (switcheroo, url) => {
    switcheroo.element.classList.toggle('switcheroo-loading');
    switcheroo.isLoading = true;
    request.getXML(url)
        .then((fragment) => {
            switcheroo.isLoading = false;

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
                    switcheroo.element.addClass(options.errorClass);
                }
            }
        });
};

let onLoad = (switcheroo) => {
    const container = document.createElement("div");
    const doc = getDocument(switcheroo.element);

    if (!doc.title.includes('Error')) {
        u(container).append(u(doc.body.children))
        switcheroo.target = u(switcheroo.options.target).first();
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

    switcheroo.target = u(options.target).first();

    if ((!url && !options.accordion) || !url) {
        console.error(`${msgPrefix} url is not defined and/or accordion option is not enabled.`);
        return;
    }

    if (options.accordion && url && cache[url]) {
        switcheroo.content.classList.toggle('d-none');
        options.toggleClass.split(' ')
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
            u(element).addClass('hidden');
            
            let doc = getDocument(element);
            if (doc.body && doc.body.children.length) {
                onLoad(switcheroo);
            } else {
                element.onload = onLoad.bind(this, switcheroo);
            }
        } else {
            u(element).on('click', onClick.bind(this, switcheroo));
        }
    });
};



export default {
    run: (elements, callback) => {
        if (arguments.length < 2) {
            console.error(`${msgPrefix} Missing parameter. switcheroo.run() should be called with parameters (element, callback).`);
            return;
        }

        if (elements && NodeList.prototype.isPrototypeOf(elements)) {
            elements = u(elements).nodes;
        }

        let count = elements.filter(doesNotHaveId);
        if (count !== elements.length) {
            console.warn(`${msgPrefix} Missing 'data-switcheroo-id' on some elements. Consider adding 'data-switcheroo-id' to prevent duplicate initialization when using switcheroo.autoStart().`);
        }

        initialize(elements, callback);
    },

    autoStart: () => {
        //cannot pass a callback to auto-initialized elements
        let elements = u(`[${selectors.target}]`)
            .filter(doesNotHaveId)
            .nodes;
        
        initialize(elements);
    }, 
    selectors
};
