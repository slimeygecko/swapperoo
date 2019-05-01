let q = document.querySelectorAll.bind(document);
let toArray = (nodeList) => Array.prototype.slice.call(nodeList);
let queryAll = (selector, context) => toArray((context || document).querySelectorAll(selector));
let replace = (fragment, node) => node.parentNode.replaceChild(fragment, node);
let append = (children, node) => 
    children.length == undefined 
        ? node.appendChild(children)
        : toArray(children)
            .forEach((c) => node.appendChild(c));

export { queryAll, toArray, replace, append };