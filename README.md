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

The purpose of `Switcheroo` is to overcome some of the challenges that come with a website that needs full html support and async views or partial views.

Iframes give web pages the ability to asynchronously load individual parts of a page. Unfortunately, that comes with a price: the bounding box that is rather difficult to deal with although [not](https://blog.theodo.fr/2018/01/responsive-iframes-css-trick/) [impossible.](https://davidwalsh.name/responsive-iframes)



# Use Cases
### Iframes
>  Replacing iframes that have been used to load parts of the page that would significantly slow down the page load time, such as a report.

A good example of this is the volume section of the [distributor's profile page](http://servervm-web:8080/distributors/21005640#Volumes). This section is actually an `iframe` that, by nature of an `iframe`, load's after the initial page is rendered. Iframes do not resize or flow with the rest of the page, so `Switcheroo` swaps out the `iframe` for a `div` after the `iframe` has finished loading. This enables the section to flow properly with the rest of the page and eliminates scroll bars that come with overflowed content within an `iframe`.

```html
    <div id="roo">
        <iframe data-switcheroo-target="#roo" src="url"></iframe>
    </div>
```
```js
switcheroo.autoStart();
```


**Full Example:** (Include the loading partial for a nice set of loading dots.)
```html
    <div id="downline" class="embed-responsive embed-responsive-16by9">
        @await Html.PartialAsync("_Loading")
        <iframe data-switcheroo-target="#downline" class="embed-responsive-item" src="@Url.Action("Downline", "Distributors", new {Model.DistributorId, Model.DownlineDate, Model.OnlyIncludeOperational})"></iframe>
    </div>
```
### Async view loading
>  Loading part of the page after user interaction, such as the click of a button.

**Form submissions**
When clicking the submit button, `Switcheroo` will submit the form via ajax and prevent a page reload. On a successful request, the `target` will be replaced with the response. 
[Volume filters form and report](http://servervm-web:8080/distributors/21005640#Volumes)

**Click events**
Clicking an element to fetch more data. The [list viewer](http://code.conklin.com/portal/aggregate/wikis/code/list-viewer) is one example of this, found on the [Orders page](http://servervm-web:8080/orders) with the abbreviated example below.

```html
<div class="row list-viewer" data-list-viewer>
    <div class="col-md-3 left">
        <table class="table table-hover table-sm">
            <tbody>
                <tr data-switcheroo-id="A214744" data-switcheroo-target="#orderInfo" data-switcheroo-url="/api/orders/A214744" data-switcheroo-toggle-class="alert-info"></tr>
                <tr data-switcheroo-id="A214743" data-switcheroo-target="#orderInfo" data-switcheroo-url="/api/orders/A214743" data-switcheroo-toggle-class="alert-info"></tr>
                <tr data-switcheroo-id="A214741" data-switcheroo-target="#orderInfo" data-switcheroo-url="/api/orders/A214741" data-switcheroo-toggle-class="alert-info"></tr>
            </tbody>
        </table>
    </div>
    <div class="col-md-9 right">
        <div class="card">
            <div class="card-body">
                <div id="orderInfo"></div>
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
Takes no parameters, but initializes any element on the page that has `data-switcheroo-target` on it *without* a `data-switcheroo-id`.
>>>

---

>>>
*`selectors`*  
{Object} - An object that contains the various data attributes that are valid on an element.

*data-switcheroo-target* - *required*: The `id` of the element `switcheroo` is going to replace.  

*data-switcheroo-content* -  

*data-switcheroo-url* - Url for a `form` submission or url to request data from onClick.   

*data-switcheroo-toggleClass* - space separated list of classes that should be toggled after rendering.  

*data-switcheroo-append* - method used for attaching new content to the dom. Valid values are *append*. Anything else will be ignored and the `target` will be replaced.

*data-switcheroo-accordion* - if this attribute exists, no matter what the value is set to, the element will be treated as an accordion.  

*data-switcheroo-id* - a string that used to identify a switcheroo element. Required if used along with `run` and a callback. This also excludes it from being auto initialized.
>>>
