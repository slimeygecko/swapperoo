```
/*
 *  
 *                                                     MM MM           ,MMMMMM                               M
 *                                                     MMMM         MMMMMMMMMMMMMM                          M
 *                                                     MMMM       MMMMMMMMMMMMMMMMMMI                     .M$
 *                                                    MMMMM   :MMMMMMMMMMMMMMMMMMMMMMMMM                OMM
 *                                                  DMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM+        MMMM,
 *                                                 MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
 *                                                 MMMMMM MMMMMMMMMMMMMMMMMMMMMMMMM      NMMMMMMMMM
 *                                                         MMMMMMMMMMMMMMMMMMMMMMM
 *                                                          MMMMMMMMMMMMMMMMMM
 *                                                            MMMMMMMMMMMM+
 *  __          _ _       _                                     MMMMMMMMMMM
 *  / _\_      _(_) |_ ___| |__   ___ _ __ ___   ___             MMMM MMMMM
 *  \ \\ \ /\ / / | __/ __| '_ \ / _ \ '__/ _ \ / _ \                 :MMMM
 *  _\ \\ V  V /| | || (__| | | |  __/ | | (_) | (_) |                 MMMM
 *  \__/ \_/\_/ |_|\__\___|_| |_|\___|_|  \___/ \___/                  MMMM
 *                                                                 MMMMMM
 *                                                              ,MMMMMMM~
 *                                                           8MMMMMMMM
 *                                                         MMMMMMMM
 *                                                        MMMMMM
 *                                                         MMMM
 * 
 */
```

The purpose of `Swapperoo` is to overcome some of the challenges that come with a website that needs full html functionality (no javascript) with the ability to load sections of the page asynchronously. 

Iframes give web pages the ability to asynchronously load individual parts of a page. Unfortunately, that comes with a price: the bounding box that is rather difficult to deal with.



# Use Cases
### Iframes
>  Replacing iframes that have been used to load parts of the page that would significantly slow down the page load time, such as a report.

This section is actually an `iframe` that, by nature of an `iframe`, load's after the initial page is rendered. Iframes do not resize or flow with the rest of the page, so `Swapperoo` swaps out the `iframe` for a `div` after the `iframe` has finished loading. This enables the section to flow properly with the rest of the page and eliminates scroll bars that come with overflowed content within an `iframe`.

```html
    <div id="roo">
        <iframe data-swapperoo-target="#roo" src="/some/async/url"></iframe>
    </div>
```
```js
swapperoo.autoStart();
```

### Async view loading
>  Loading part of the page after user interaction, such as the click of a button.

**Form submissions**
When clicking the submit button, `Swapperoo` will submit the form via ajax and prevent a page reload. On a successful request, the `target` will be replaced with the response.

**Click events**
Clicking an element to fetch more data.

```html
<div class="row list-viewer" data-list-viewer>
    <div class="col-md-3 left">
        <table class="table table-hover table-sm">
            <tbody>
                <tr data-swapperoo-id="12345" data-swapperoo-target="#target" data-swapperoo-url="/some/api/call/12345"></tr>
                <tr data-swapperoo-id="12346" data-swapperoo-target="#target" data-swapperoo-url="/some/api/call/12346"></tr>
                <tr data-swapperoo-id="12347" data-swapperoo-target="#target" data-swapperoo-url="/some/api/call/12347"></tr>
            </tbody>
        </table>
    </div>
    <div class="col-md-9 right">
        <div class="card">
            <div class="card-body">
                <div id="target"></div>
            </div>
        </div>
    </div>
</div>
```

# Documentation
>>>
*`run(elements, callback)`*  
@param {NodeList|Array} elements - An array of elements to initialize.  
@param {function} callback - A callback that is called after rendering  
>>>

----

>>>
*`autoStart()`*  
Takes no parameters, but initializes any element on the page that has `data-swapperoo-target` on it *without* a `data-swapperoo-id`.
>>>

---

>>>
*`selectors`*  
{Object} - An object that contains the various data attributes that are valid on an element.

*data-swapperoo-target* - *required*: The `id` of the element `swapperoo` is going to replace.  

*data-swapperoo-content* -  

*data-swapperoo-url* - Url for a `form` submission or url to request data from onClick.   

*data-swapperoo-toggleClass* - space separated list of classes that should be toggled after rendering.  

*data-swapperoo-append* - method used for attaching new content to the dom. Valid values are *append*. Anything else will be ignored and the `target` will be replaced.

*data-swapperoo-accordion* - if this attribute exists, no matter what the value is set to, the element will be treated as an accordion.  

*data-swapperoo-id* - a string that used to identify a swapperoo element. Required if used along with `run` and a callback. This also excludes it from being auto initialized.
>>>
