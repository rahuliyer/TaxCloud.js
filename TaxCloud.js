/*

Copyright: (c) 2009-2013 The Federal Tax Authority, LLC (FedTax). TaxCloud is a registered trademark of FedTax.
This file contains Original Code and/or Modifications of Original Code as defined in, and that are subject to, the FedTax Public Source License (reference http://dev.taxcloud.net/ftpsl/ or http://taxcloud.net/ftpsl.pdf). 

Support: Questions about this file should be directed to service@taxcloud.net.
Author: John Milan (jmilan@fedtax.net)
Revision: 1.0.1
Released: 10/7/2013

*/

var TaxCloudHelper_States = Object.freeze({ "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "DC": "District of Columbia", "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming" });

var USPSVerifiedAddressURL = "https://taxcloud.net/imgs/usps_verified.png";
var USPSUnverifiedAddressURL = "https://taxcloud.net/imgs/usps_unverified.png";
var USPSVerifyAddressURL = "https://taxcloud.net/imgs/usps_verify.png";
var TaxCloudPurchaseButtonID = "TaxCloudPurchaseButton";
var TaxCloudPurchaseStepOneID = "TaxCloudPurchaseStepOne";
var TaxCloudPurchaseStepTwoID = "TaxCloudPurchaseStepTwo";
var TaxCloudPurchaseStepTwoCartItemsID = "TaxCloudPurchaseStepTwoCartItems";
var TaxCloudSalesTaxID = "TaxCloudSalesTask";
var TaxCloudGrandTotalID = "TaxCloudGrandTotal";
var TaxCloudCartItemDisplayNameID = "TaxCloudCartItemDisplayName";
var TaxCloudCartItemPriceID = "TaxCloudCartItemPrice";
var TaxCloudCartItemQuantityID = "TaxCloudCartItemQuantity";
var TaxCloudCartItemAmountID = "TaxCloudCartItemAmount";
var TaxCloudCartItemTaxID = "TaxCloudCartItemTax";
var TaxCloudCartItemTotalID = "TaxCloudCartItemTotal";
var TaxCloudAddress1ID = "TaxCloudAddress1";
var TaxCloudAddress2ID = "TaxCloudAddress2";
var TaxCloudCityID = "TaxCloudCity";
var TaxCloudStateID = "TaxCloudState";
var TaxCloudZip5ID = "TaxCloudZip5";
var TaxCloudZip4ID = "TaxCloudZip4";
var TaxCloudPurchaseStepOneVerifiedAddressID = "TaxCloudPurchaseStepOneVerifiedAddress";
var TaxCloudPurchaseStepTwoVerifiedAddressID = "TaxCloudPurchaseStepTwoVerifiedAddress";
var TaxCloudPurchaseStepOneVerifiedAddressImageID = "TaxCloudPurhaseStepOneVerifiedImage";
var TaxCloudPurchaseStepTwoVerifiedAddressImageID = "TaxCloudPurhaseStepTwoVerifiedImage";

var TaxCloudHelper_myTaxCloudInstance = null;

function TaxCloudHelper_QuantityChanged(e) {
    if (TaxCloudHelper_myTaxCloudInstance) {
        TaxCloudHelper_myTaxCloudInstance.UpdatePurchaseStep2();
        if (TaxCloudHelper_myTaxCloudInstance.OnPurchaseStep2UpdateClicked)
            TaxCloudHelper_myTaxCloudInstance.OnPurchaseStep2UpdateClicked(TaxCloudHelper_myTaxCloudInstance);
        else
            TaxCloudHelper_myTaxCloudInstance.Lookup(null, null);
    }
}

function TaxCloudHelper_ClearSelectElement(selectElement) {
    while (selectElement.childNodes.length > 0)
        selectElement.removeChild(selectElement.firstChild);
}

function TaxCloudHelper_AddOptionToSelectElement(selectElement, value, text) {
    var optionElement = document.createElement("option");
    optionElement.value = value;
    //if (value == '') {
    //    optionElement.Attributes.Add("style", "color: #cccccc;");
    //}
    optionElement.text = text;
    selectElement.appendChild(optionElement);
}

function TaxCloudHelper_AddStatesToSelectElement(selectElement) {
    TaxCloudHelper_ClearSelectElement(selectElement);
    var keys = Object.keys(TaxCloudHelper_States);
    var keyII = 0;
    TaxCloudHelper_AddOptionToSelectElement(selectElement, '', '[ - Select - ]');
    for (; keyII < keys.length; ++keyII) {
        var key = keys[keyII];
        TaxCloudHelper_AddOptionToSelectElement(selectElement, key, TaxCloudHelper_States[key]);
    }
}

function TaxCloudHelper_SelectState(selectElement, state) {
    var keys = Object.keys(TaxCloudHelper_States);
    var keyII = 0;
    for (; keyII < keys.length; ++keyII) {
        var key = keys[keyII];
        if (key == state) {
            selectElement.selectedIndex = keyII + 1;
            break;
        }
    }
}

function TaxCloudHelper_IsDefined(func) {
    if (func !== undefined)
        return true;
    else
        return false;
}

function TaxCloudHelper_RemoveLocalStorageItem(name) {
    if (typeof (localStorage) != "undefined")
        localStorage.removeItem(name);
}

function TaxCloudHelper_SetLocalStorageItem(name, value) {
    if (typeof (localStorage) != "undefined")
        localStorage.setItem(name, value);
}

function TaxCloudHelper_GetLocalStorageItem(name) {
    var result = null;
    if (typeof (localStorage) != "undefined")
        result = localStorage.getItem(name);
    return result;
}

function TaxCloudConnection(taxcloud) {
    this.taxcloud = taxcloud;
    this.request = this.newXhr();
    this.taxCloudUrl = "https://api.taxcloud.net/1.0/TaxCloud.asmx";
}

TaxCloudConnection.prototype.newXhr = function () {
    if (typeof (XMLHttpRequest) != "undefined") {
        return new XMLHttpRequest();
    } else if (typeof (ActiveXObject) != "undefined") {
        return new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        throw new Error("No XMLHTTPRequest support detected");
    }
}

TaxCloudConnection.prototype.get = function (proxy, callback) {
    if (proxy)
        this.execute("GET", proxy + "?" + this.taxCloudUrl, null, callback);
    else
        this.execute("GET", this.taxCloudUrl, null, callback);
}

TaxCloudConnection.prototype.post = function (proxy, soapAction, data, callback) {
    var options = {};
    options.headers = [];
    options.headers["Content-Type"] = "text/xml; charset=utf-8";
    options.headers["SOAPAction"] = "http://taxcloud.net/" + soapAction;
    options.body = data;
    if (proxy)
        this.execute("POST", proxy + "?" + this.taxCloudUrl, options, callback);
    else
        this.execute("POST", this.taxCloudUrl, options, callback);
}

TaxCloudConnection.prototype.postPurchase = function (url, formData, callback) {
    var options = {};
    options.headers = [];
    options.headers["Content-Length"] = formData.length.toString();
    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.body = formData;
    this.execute("POST", url, options, callback);
}

TaxCloudConnection.prototype.execute = function (method, uri, options, callback) {
    if (options == null)
        options = {};
    if (options.headers == null)
        options.headers = {};
    options.headers["Accept"] = options.headers["Accept"] || options.headers["accept"] || "text/xml";
    // set up the closure variables
    var self = this;
    this.request.onreadystatechange = function (oEvent) {
        self.handleResponse(oEvent, callback);
    };
    this.request.open(method, uri, true);
    if (options.headers) {
        var headers = options.headers;
        for (var headerName in headers) {
            if (!headers.hasOwnProperty(headerName)) { continue; }
            this.request.setRequestHeader(headerName, headers[headerName]);
        }
    }
    this.request.send(options.body || "");
}

// State  Description
// 0      The request is not initialized
// 1      The request has been set up
// 2      The request has been sent
// 3      The request is in process
// 4      The request is complete
TaxCloudConnection.prototype.handleResponse = function (oEvent, callback) {
    if (this.request.readyState == 4) {
        if (this.request.status == 404) {
            //global_ConsoleLog("null: ");
            this.taxcloud[callback](this);
        }
        else if (this.request.status == 409) {
            // the object might already exist
            this.taxcloud[callback](this);
        }
        else if (this.request.status == 200) {
            //global_ConsoleLog(this.request.responseText);
            this.taxcloud[callback](this);
        }
        else {
            //global_ConsoleLog("handleResponse Error: " + this.request.status.toString());
            //throw new Error(this.request.status.toString() + ": ");
        }
    }
}

TaxCloudConnection.prototype.GetResponseText = function () {
    return this.request.responseText;
}

TaxCloudConnection.prototype.parseResponse = function () {
    var xmlStr = this.GetResponseText();
    if (typeof window.DOMParser != "undefined") {
        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
    } else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
    } else {
        throw new Error("No XML parser found");
    }
}

TaxCloudConnection.prototype.GetResponseDOM = function () {
    return this.parseResponse();
}

function TaxCloudExemptionCertificate() {
}

function TaxCloudAddress(origin) {
    this.isVerified = false;
    this.origin = origin;
    this.address1 = "";
    this.address2 = "";
    this.city = "";
    this.state = "";
    this.zip5 = "";
    this.zip4 = "";
    this.commonVerifiedSoapPackage = "<Address1>$address1</Address1><Address2>$address2</Address2><City>$city</City><State>$state</State><Zip5>$zip5</Zip5><Zip4>$zip4</Zip4><ErrNumber>0</ErrNumber>";
    this.originVerifiedSoapPackage = "<origin xsi:type='VerifiedAddress'>" + this.commonVerifiedSoapPackage + "</origin>";
    this.destinationVerifiedSoapPackage = "<destination xsi:type='VerifiedAddress'>" + this.commonVerifiedSoapPackage + "</destination>";
}

TaxCloudAddress.prototype.AsCustomerID = function () {
    return this.address1.toUpperCase() + ":" + this.address2.toUpperCase() + ":" + this.city.toUpperCase() + ":" + this.state.toUpperCase() + ":" + this.zip5 + ":" + this.zip4;
}

TaxCloudAddress.prototype.getStorageName = function (customerID) {
    var suffix = (this.origin) ? "_TaxCloud_OriginAddress" : "_TaxCloud_DestinationAddress";
    return customerID + suffix;
}

TaxCloudAddress.prototype.hasLocalStorage = function (customerID) {
    var block = TaxCloudHelper_GetLocalStorageItem(this.getStorageName(customerID));
    return (block != null);
}

TaxCloudAddress.prototype.clearLocalStorage = function (customerID) {
    TaxCloudHelper_RemoveLocalStorageItem(this.getStorageName(customerID));
}

TaxCloudAddress.prototype.loadFromLocalStorage = function (customerID) {
    var block = TaxCloudHelper_GetLocalStorageItem(this.getStorageName(customerID));
    if (block) {
        block = JSON.parse(block);
        this.isVerified = block.isVerified;
        this.address1 = block.address1;
        this.address2 = block.address2;
        this.city = block.city;
        this.state = block.state;
        this.zip5 = block.zip5;
        this.zip4 = block.zip4;
    }
}

TaxCloudAddress.prototype.saveToLocalStorage = function (customerID) {
    var block = new Object();
    block.isVerified = this.isVerified;
    block.address1 = this.address1;
    block.address2 = this.address2;
    block.city = this.city;
    block.state = this.state;
    block.zip5 = this.zip5;
    block.zip4 = this.zip4;
    TaxCloudHelper_SetLocalStorageItem(this.getStorageName(customerID), JSON.stringify(block));
    TaxCloudHelper_SetLocalStorageItem("TaxCloudLastAddressAsCustomerID", this.AsCustomerID());
}

TaxCloudAddress.prototype.IsVerified = function () {
    return this.isVerified;
}

TaxCloudAddress.prototype.path = function () {
    var result = encodeURIComponent(this.address1);
    result += "/";
    if (this.address2)
        result += encodeURIComponent(this.address2);
    else
        result += "*";
    result += "/" + encodeURIComponent(this.city);
    result += "/" + encodeURIComponent(this.state);
    result += "/" + encodeURIComponent(this.zip5);
    result += "/";
    if (this.zip4)
        result += encodeURIComponent(this.zip4);
    else
        result += "*";
    return result;
}

TaxCloudAddress.prototype.SoapPackage = function () {
    var soapPackage = (this.origin) ? this.originVerifiedSoapPackage : this.destinationVerifiedSoapPackage;
    return soapPackage.replace("$address1", this.address1).replace("$address2", this.address2).replace("$city", this.city).replace("$state", this.state).replace("$zip5", this.zip5).replace("$zip4", this.zip4);
}

function TaxCloudCartItem(id, displayName, price, quantity, tic) {
    this.id = id;
    this.index = 0;
    this.displayName = displayName;
    this.tic = (tic) ? tic : 00000;
    this.price = price;
    this.quantity = quantity;
    this.tax = 0.0;
    this.lookupSoapPackage = "<CartItem><Index>$index</Index><ItemID>$itemID</ItemID><TIC>$tic</TIC><Price>$price</Price><Qty>$quantity</Qty></CartItem>";
}

TaxCloudCartItem.prototype.getStorageName = function (customerID) {
    return customerID + "_TaxCloud_CartItem_" + this.index.toString();
}

TaxCloudAddress.prototype.hasLocalStorage = function (customerID) {
    var block = TaxCloudHelper_GetLocalStorageItem(this.getStorageName(customerID));
    return (block != null);
}

TaxCloudCartItem.prototype.clearLocalStorage = function (customerID) {
    TaxCloudHelper_RemoveLocalStorageItem(this.getStorageName(customerID));
}

TaxCloudCartItem.prototype.loadFromLocalStorage = function (customerID) {
    var block = TaxCloudHelper_GetLocalStorageItem(this.getStorageName(customerID));
    if (block) {
        block = JSON.parse(block);
        this.id = block.id;
        this.index = block.index;
        this.displayName = block.displayName;
        this.tic = block.tic;
        this.price = block.price;
        this.quantity = block.quantity;
        this.tax = block.tax;
    }
}

TaxCloudCartItem.prototype.saveToLocalStorage = function (customerID) {
    var block = new Object();
    block.id = this.id;
    block.index = this.index;
    block.displayName = this.displayName;
    block.tic = this.tic;
    block.price = this.price;
    block.quantity = this.quantity;
    block.tax = this.tax;
    TaxCloudHelper_SetLocalStorageItem(this.getStorageName(customerID), JSON.stringify(block));
}

TaxCloudCartItem.prototype.PriceTotal = function () {
    var asCents = Math.floor(this.price * 100.0) * this.quantity;
    return (asCents / 100.0);
}

TaxCloudCartItem.prototype.TaxTotal = function () {
    var asCents = Math.floor(this.tax * 100.0);
    return (asCents / 100.0);
}

TaxCloudCartItem.prototype.PricePlusTaxTotal = function () {
    return this.PriceTotal() + this.TaxTotal();
}

TaxCloudCartItem.prototype.SoapPackage = function () {
    return this.lookupSoapPackage.replace("$index", this.index.toString()).replace("$itemID", this.id).replace("$tic", this.tic).replace("$price", this.price).replace("$quantity", this.quantity);
}

function TaxCloudCart(id) {
    this.id = id;
    this.items = [];
    this.exemptionCertificate = null;
    this.lookupSoapPackage = "<cartID>$id</cartID><cartItems>$cartItems</cartItems>";
    this.returnedSoapPackage = "<cartItems>$cartItems</cartItems>";
    this.observers = [];
}

TaxCloudCart.prototype.getStorageName = function (customerID) {
    return customerID + "_TaxCloud_Cart";
}

TaxCloudCart.prototype.hasLocalStorage = function (customerID) {
    var block = TaxCloudHelper_GetLocalStorageItem(this.getStorageName(customerID));
    return (block != null);
}

TaxCloudCart.prototype.clearLocalStorage = function (customerID) {
    TaxCloudHelper_RemoveLocalStorageItem(this.getStorageName(customerID));
    var itemII = 0;
    for (; itemII < this.items.length; ++itemII)
        this.items[itemII].clearLocalStorage(customerID);
}

TaxCloudCart.prototype.loadFromLocalStorage = function (customerID) {
    var block = TaxCloudHelper_GetLocalStorageItem(this.getStorageName(customerID));
    if (block) {
        block = JSON.parse(block);
        this.id = block.id;
        var itemsCount = block.itemsCount;
        var itemII = 0;
        this.items = [];
        for (; itemII < itemsCount; ++itemII) {
            var cartItem = new TaxCloudCartItem(null, null, 0, 0, 0);
            cartItem.index = itemII;
            cartItem.loadFromLocalStorage(customerID);
            this.AddItem(cartItem);
        }
    }
}

TaxCloudCart.prototype.saveToLocalStorage = function (customerID) {
    var block = new Object();
    block.id = this.id;
    block.itemsCount = this.items.length;
    TaxCloudHelper_SetLocalStorageItem(this.getStorageName(customerID), JSON.stringify(block));
    var itemII = 0;
    for (; itemII < this.items.length; ++itemII)
        this.items[itemII].saveToLocalStorage(customerID);
}

TaxCloudCart.prototype.PriceTotal = function () {
    var total = 0.0;
    var index = 0;
    for (; index < this.items.length; ++index) {
        total += this.items[index].PriceTotal();
    }
    return total;
}

TaxCloudCart.prototype.TaxTotal = function () {
    var total = 0.0;
    var index = 0;
    for (; index < this.items.length; ++index) {
        total += this.items[index].TaxTotal();
    }
    return total;
}

TaxCloudCart.prototype.GrandTotal = function () {
    return this.PriceTotal() + this.TaxTotal();
}


TaxCloudCart.prototype.AddItem = function (cartItem) {
    var cartItemII = 0;
    for (; cartItemII < this.items.length; ++cartItemII) {
        if (this.items[cartItemII] == cartItem)
            return;
    }
    cartItem.index = this.items.length;
    this.items.push(cartItem);
    this.NotifyObservers("CartItemAdded", cartItem);
}

TaxCloudCart.prototype.RemoveItem = function (cartItem) {
    var cartItemII = 0;
    for (; cartItemII < this.items.length; ++cartItemII) {
        if (this.items[cartItemII] == cartItem)
            break;
    }
    if (cartItemII == this.items.length)
        return;
    this.items.splice(cartItemII, 1);
    for (; cartItemII < this.items.length; ++cartItemII)
        this.items[cartItemII].index = cartItemII;
    this.NotifyObservers("CartItemRemoved", cartItem);

}

TaxCloudCart.prototype.ClearItems = function () {
    while (this.items.length > 0)
        this.RemoveItem(this.items[0]);
}

TaxCloudCart.prototype.LookupSoapPackage = function () {
    var cartItemsSoapPackage = "";
    index = 0;
    for (; index < this.items.length; ++index) {
        var cartItem = this.items[index];
        cartItemsSoapPackage += cartItem.SoapPackage();
    }
    return this.lookupSoapPackage.replace("$id", this.id).replace("$cartItems", cartItemsSoapPackage);
}

TaxCloudCart.prototype.ReturnedSoapPackage = function () {
    var cartItemsSoapPackage = "";
    index = 0;
    for (; index < this.items.length; ++index) {
        var cartItem = this.items[index];
        cartItemsSoapPackage += cartItem.SoapPackage();
    }
    return this.returnedSoapPackage.replace("$cartItems", cartItemsSoapPackage);
}

TaxCloudCart.prototype.AddObserver = function (observer) {
    var observerII = 0;
    for (; observerII < this.observers.length; ++observerII) {
        if (this.observers[observerII] == observer)
            return;
    }
    this.observers.push(observer);
}

TaxCloudCart.prototype.NotifyObservers = function (name, cartItem) {
    var observerII = 0;
    for (; observerII < this.observers.length; ++observerII) {
        var observer = this.observers[observerII];
        if (typeof (observer[name]) == "function")
            observer[name](cartItem);
    }
}

TaxCloudCart.prototype.RemoveObserver = function (observer) {
    var observerII = 0;
    for (; observerII < this.observers.length; ++observerII) {
        if (this.observers[observerII] == observer) {
            this.observers.splice(observerII, 1);
            return;
        }
    }
}

function TaxCloud(taxCloudPostUrl, purchasePostUrl) {
    this.localStorageEnabled = true;
    this.customerID = null;
    this.taxCloudPostUrl = taxCloudPostUrl;
    this.purchasePostUrl = purchasePostUrl;
    this.addressOrigin = new TaxCloudAddress(true);
    this.addressDestination = new TaxCloudAddress(false);
    this.cart = new TaxCloudCart(new Date().getTime());
    this.pingSoapPackage = "<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'><s:Body xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'><Ping xmlns='http://taxcloud.net'><apiLoginID>$apiLoginID</apiLoginID><apiKey>$apiKey</apiKey></Ping></s:Body></s:Envelope>";
    this.verifyAddressSoapPackage = "<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'><s:Body xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'><VerifyAddress xmlns='http://taxcloud.net'><uspsUserID>$uspsUserID</uspsUserID><address1>$address1</address1><address2>$address2</address2><city>$city</city><state>$state</state><zip5>$zip5</zip5><zip4>$zip4</zip4></VerifyAddress></s:Body></s:Envelope>";
    this.lookupSoapPackage = "<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'><s:Body xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'><Lookup xmlns='http://taxcloud.net'><apiLoginID>$apiLoginID</apiLoginID><apiKey>$apiKey</apiKey><customerID>$customerID</customerID>$cart$addressOrigin$addressDestination<deliveredBySeller>$deliveredBySeller</deliveredBySeller></Lookup></s:Body></s:Envelope>";
    this.authorizedSoapPackage = "<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'><s:Body xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'><Authorized xmlns='http://taxcloud.net'><apiLoginID>$apiLoginID</apiLoginID><apiKey>$apiKey</apiKey><customerID>$customerID</customerID><cartID>$cartID</cartID><orderID>$orderID</orderID><dateAuthorized>$dateAuthorized</dateAuthorized></Authorized></s:Body></s:Envelope>";
    this.capturedSoapPackage = "<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'><s:Body xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'><Captured xmlns='http://taxcloud.net'><apiLoginID>$apiLoginID</apiLoginID><apiKey>$apiKey</apiKey><customerID>$customerID</customerID><orderID>$orderID</orderID></Captured></s:Body></s:Envelope>";
    this.authorizedWithCaptureSoapPackage = "<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'><s:Body xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'><AuthorizedWithCapture xmlns='http://taxcloud.net'><apiLoginID>$apiLoginID</apiLoginID><apiKey>$apiKey</apiKey><customerID>$customerID</customerID><cartID>$cartID</cartID><orderID>$orderID</orderID><dateAuthorized>$dateAuthorized</dateAuthorized><dateCaptured>$dateCaptured</dateCaptured></AuthorizedWithCapture></s:Body></s:Envelope>";
    this.returnedSoapPackage = "<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/'><s:Body xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'><Returned xmlns='http://taxcloud.net'><apiLoginID>$apiLoginID</apiLoginID><apiKey>$apiKeyID</apiKey><orderID>$orderID</orderID>$cartItems<returnedDate>$dateReturned</returnedDate></Returned></s:Body></s:Envelope>";
    this.purchaseStep1Active = false;
    this.purchaseStep2Active = false;
    this.OnPurchasePageStep1VerifyAddressClicked = null;
    this.OnPurchasePageStep1NextClicked = null;
    this.OnPurchasePageStep1CancelClicked = null;
    this.OnPurchasePageStep2VerifyAddressClicked = null;
    this.OnPurchasePageStep2UpdateClicked = null;
    this.OnPurchasePageStep2PurchaseClicked = null;
    this.OnPurchasePageStep2CancelClicked = null;
    this.addingCartItem = false;
    this.pingResponseType = null;
    this.pingResponseMessage = null;
    this.lookupResponseType = null;
    this.lookupResponseMessage = null;
    this.authorizedResponseType = null;
    this.authorizedResponseMessage = null;
    this.capturedResponseType = null;
    this.capturedResponseMessage = null;
    this.authorizedWithCaptureResponseType = null;
    this.authorizedWithCaptureResponseMessage = null;
}

TaxCloud.prototype.padzero = function (n) {
    return n < 10 ? '0' + n : n;
}

TaxCloud.prototype.pad2zeros = function (n) {
    if (n < 100) {
        n = '0' + n;
    }

    if (n < 10) {
        n = '0' + n;
    }

    return n;
}


TaxCloud.prototype.ToISODateTime = function (d) {
    return d.getUTCFullYear() + '-' + this.padzero(d.getUTCMonth() + 1) + '-' + this.padzero(d.getUTCDate()) + 'T' + this.padzero(d.getUTCHours()) + ':' + this.padzero(d.getUTCMinutes()) + ':' + this.padzero(d.getUTCSeconds()) + 'Z';
}

TaxCloud.prototype.maximumDisplayName = function (displayName) {
    if (displayName) {
        if (displayName.length > 24)
            return displayName.substring(0, 21) + "...";
        else
            return displayName;
    }
    else
        "<No Display Name>";
}

TaxCloud.prototype.SetLocalStorageEnabled = function (flag) {
    this.localStorageEnabled = flag;
}

TaxCloud.prototype.GetLocalStorageEnabled = function () {
    return this.localStorageEnabled;
}

TaxCloud.prototype.SetCustomerID = function (customerID, loadFromStorage) {
    this.customerID = customerID;
    if (loadFromStorage)
        this.LoadFromLocalStorage();
}

TaxCloud.prototype.GetCustomerID = function () {
    if (this.customerID)
        return this.customerID;
    else if (this.addressDestination) {
        this.customerID = this.addressDestination.AsCustomerID();
        return this.customerID;
    }
    else {
        this.customerID = this.ToISODateTime(new DateTime());
        return customerID;
    }
}

TaxCloud.prototype.GetStorageName = function () {
    return this.GetCustomerID() + " TaxCloud_LastStoredOn";
}

TaxCloud.prototype.HasLocalStorage = function () {
    if (this.localStorageEnabled) {
        var lastStoredOn = TaxCloudHelper_GetLocalStorageItem(this.GetStorageName());
        if (lastStoredOn && lastStoredOn.length > 0) {
            var lastStoredOnDate = new Date(lastStoredOn);
            var difference = new Date() - lastStoredOnDate;
            if (difference > 24 * 60 * 60 * 1000) {
                this.addressDestination.clearLocalStorage(this.GetCustomerID());
                this.cart.clearLocalStorage(this.GetCustomerID());
                return false;
            }
            else
                return true;
        }
        else
            return false;
    }
    else
        return false;
}

TaxCloud.prototype.LoadFromLocalStorage = function () {
    if (this.HasLocalStorage()) {
        this.addressDestination.loadFromLocalStorage(this.GetCustomerID());
        this.cart.loadFromLocalStorage(this.GetCustomerID());
    }
}

TaxCloud.prototype.SaveToLocalStorage = function () {
    if (this.localStorageEnabled) {
        TaxCloudHelper_SetLocalStorageItem(this.GetStorageName(), this.ToISODateTime(new Date()));
        this.addressDestination.saveToLocalStorage(this.GetCustomerID());
        this.cart.saveToLocalStorage(this.GetCustomerID());
    }
}

TaxCloud.prototype.ClearLocalStorage = function () {
    if (this.localStorageEnabled) {
        TaxCloudHelper_RemoveLocalStorageItem(this.GetStorageName());
        this.addressDestination.clearLocalStorage(this.GetCustomerID());
        this.cart.clearLocalStorage(this.GetCustomerID());
    }
}

TaxCloud.prototype.prepareVerifiedAddress = function (imageID) {
    var verifiedImage = document.getElementById(imageID);
    if (this.addressDestination && this.addressDestination.IsVerified()) {
        verifiedImage.src = USPSVerifiedAddressURL;
    }
    else {
        if (this.addressDestination.address1.length > 0) {
            verifiedImage.src = USPSUnverifiedAddressURL;
        } else {
            verifiedImage.src = USPSVerifyAddressURL;
        }
    }
    $("#salestaxpolicy").html(this.addressDestination.state + " Sales Tax")
}

TaxCloud.prototype.PreparePurchaseStep1 = function () {
    var selectElement = document.getElementById(TaxCloudStateID);
    if (selectElement.options.length == 0)
        TaxCloudHelper_AddStatesToSelectElement(selectElement);
    var lastAddressAsCustomerID = TaxCloudHelper_GetLocalStorageItem("TaxCloudLastAddressAsCustomerID");
    if (lastAddressAsCustomerID) {
        this.addressDestination.loadFromLocalStorage(lastAddressAsCustomerID);
        this.DataToAddressUI(this.addressDestination);
    }
    this.prepareVerifiedAddress(TaxCloudPurchaseStepOneVerifiedAddressImageID);
}

TaxCloud.prototype.OpenPurchaseStep1 = function () {
    if (this.purchaseStep1Active)
        return;
    this.PreparePurchaseStep1();
    $("#" + TaxCloudPurchaseStepOneID).dialog("open");
    $("#" + TaxCloudAddress1ID).focus()
}

TaxCloud.prototype.AddressUIToData = function () {
    this.addressDestination = new TaxCloudAddress(false);
    this.addressDestination.address1 = document.getElementById(TaxCloudAddress1ID).value;
    this.addressDestination.address2 = document.getElementById(TaxCloudAddress2ID).value;
    this.addressDestination.city = document.getElementById(TaxCloudCityID).value;
    var states = document.getElementById(TaxCloudStateID);
    this.addressDestination.state = states.options[states.selectedIndex].value;
    this.addressDestination.zip5 = document.getElementById(TaxCloudZip5ID).value;
    this.addressDestination.zip4 = document.getElementById(TaxCloudZip4ID).value;
}

TaxCloud.prototype.DataToAddress = function (xmlDOM, address) {
    var verifyAddressResult = xmlDOM.documentElement.firstElementChild.firstElementChild.firstElementChild;
    var ErrNumberElementValue = this.getDOMChildElementTextContent(xmlDOM, "ErrNumber");
    if (ErrNumberElementValue == "0") {
        address.isVerified = true;
        address.address1 = this.getDOMChildElementTextContent(verifyAddressResult, 'Address1');
        address.address2 = this.getDOMChildElementTextContent(verifyAddressResult, 'Address2');
        address.city = this.getDOMChildElementTextContent(verifyAddressResult, 'City');
        address.state = this.getDOMChildElementTextContent(verifyAddressResult, 'State');
        address.zip5 = this.getDOMChildElementTextContent(verifyAddressResult, 'Zip5');
        address.zip4 = this.getDOMChildElementTextContent(verifyAddressResult, 'Zip4');
    }
    else
        address.isVerified = false;
}

TaxCloud.prototype.DataToAddressUI = function (address) {
    document.getElementById(TaxCloudAddress1ID).value = address.address1;
    document.getElementById(TaxCloudAddress2ID).value = address.address2;
    document.getElementById(TaxCloudCityID).value = address.city;
    TaxCloudHelper_SelectState(document.getElementById(TaxCloudStateID), address.state);
    document.getElementById(TaxCloudZip5ID).value = address.zip5;
    var zip4Element = document.getElementById(TaxCloudZip4ID);
    zip4Element.value = address.zip4;
}

TaxCloud.prototype.UpdatePurchaseStep1UI = function () {
    this.DataToAddressUI(this.addressDestination);
    this.prepareVerifiedAddress(TaxCloudPurchaseStepOneVerifiedAddressImageID);
}

TaxCloud.prototype.PurchaseStep1VerifyAddressClicked = function () {
    this.AddressUIToData();
    if (this.OnPurchasePageStep1VerifyAddressClicked)
        this.OnPurchasePageStep1VerifyAddressClicked(this);
    else
        this.VerifyDestinationAddress(this.taxCloudPostUrl, null);
}

TaxCloud.prototype.PurchaseStep1NextClicked = function () {
    this.AddressUIToData();
    this.ClosePurchaseStep1();
    if (this.OnPurchaseStep1NextClicked)
        this.OnPurchaseStep1NextClicked(this);
    else {
        if (this.OnPurchaseStep2UpdateClicked)
            this.VerifyDestinationAddress(this.taxCloudPostUrl, function () {
                if (this.HasLocalStorage() && this.cart.hasLocalStorage(this.GetCustomerID())) {
                    this.cart.ClearItems(this.GetCustomerID());
                    this.cart.loadFromLocalStorage(this.GetCustomerID());
                }
                TaxCloudHelper_myTaxCloudInstance.OpenPurchaseStep2();
                TaxCloudHelper_myTaxCloudInstance.OnPurchaseStep2UpdateClicked(TaxCloudHelper_myTaxCloudInstance);
            });
        else {
            var taxCloudPostUrl = this.taxCloudPostUrl;
            this.VerifyDestinationAddress(taxCloudPostUrl, function () {
                if (this.HasLocalStorage() && this.cart.hasLocalStorage(this.GetCustomerID())) {
                    this.cart.ClearItems(this.GetCustomerID());
                    this.cart.loadFromLocalStorage(this.GetCustomerID());
                }
                TaxCloudHelper_myTaxCloudInstance.OpenPurchaseStep2();
                TaxCloudHelper_myTaxCloudInstance.Lookup(taxCloudPostUrl, null)
            });
        }
    }
}

TaxCloud.prototype.PurchaseStep1CancelClicked = function () {
    this.AddressUIToData();
    if (this.purchaseStep1Active)
        this.ClosePurchaseStep1();
    if (this.OnPurchaseStep1CancelClicked)
        this.OnPurchaseStep1CancelClicked(this);
}

TaxCloud.prototype.ClosePurchaseStep1 = function () {
    $("#" + TaxCloudPurchaseStepOneID).dialog("close");
}

TaxCloud.prototype.addCartItem = function (cartItem) {
    this.addingCartItem = true;
    var divCartItemRowElement = document.createElement("div");
    divCartItemRowElement.style.textAlign = "left";
    divCartItemRowElement.style.padding = "auto";
    if (this.cart.items.length % 2) {
        divCartItemRowElement.className = "ui-widget-content";//
        divCartItemRowElement.style.border = "0px";
    }
    divCartItemRowElement.style.fontSize = "1em";
    divCartItemRowElement.style.width = "100%";
    divCartItemRowElement.style.verticalAlign = "middle";
    divCartItemRowElement.style.overflow = "hidden";

    var divCartItemColumn1 = document.createElement("div");
    divCartItemRowElement.appendChild(divCartItemColumn1);
    divCartItemColumn1.style.cssFloat = "left";
    divCartItemColumn1.style.width = "25%";

    var divCartItemColumn2 = document.createElement("div");
    divCartItemRowElement.appendChild(divCartItemColumn2);
    divCartItemColumn2.style.cssFloat = "left";
    divCartItemColumn2.style.textAlign = "center";
    divCartItemColumn2.style.width = "15%";

    var divCartItemColumn3 = document.createElement("div");
    divCartItemRowElement.appendChild(divCartItemColumn3);
    divCartItemColumn3.style.cssFloat = "left";
    divCartItemColumn3.style.textAlign = "center";
    divCartItemColumn3.style.width = "15%";

    var divCartItemColumn4 = document.createElement("div");
    divCartItemRowElement.appendChild(divCartItemColumn4);
    divCartItemColumn4.style.cssFloat = "left";
    divCartItemColumn4.style.textAlign = "center";
    divCartItemColumn4.style.width = "15%";

    var divCartItemColumn5 = document.createElement("div");
    divCartItemRowElement.appendChild(divCartItemColumn5);
    divCartItemColumn5.style.cssFloat = "left";
    divCartItemColumn5.style.textAlign = "center";
    divCartItemColumn5.style.width = "15%";

    var divCartItemColumn6 = document.createElement("div");
    divCartItemRowElement.appendChild(divCartItemColumn6);
    divCartItemColumn6.style.cssFloat = "left";
    divCartItemColumn6.style.textAlign = "center";
    divCartItemColumn6.style.width = "15%";

    var columnElement1 = document.createElement("span");
    divCartItemColumn1.appendChild(columnElement1);
    columnElement1.id = TaxCloudCartItemDisplayNameID + cartItem.index.toString();
    columnElement1.textContent = this.maximumDisplayName(cartItem.displayName);
    columnElement1.title = cartItem.displayName;

    var columnElement2 = document.createElement("span");
    divCartItemColumn2.appendChild(columnElement2);
    columnElement2.id = TaxCloudCartItemPriceID + cartItem.index.toString();
    columnElement2.textContent = "$" + cartItem.price.toFixed(2);

    var columnElement3 = document.createElement("input");
    divCartItemColumn3.appendChild(columnElement3);
    columnElement3.id = TaxCloudCartItemQuantityID + cartItem.index.toString();
    columnElement3.type = "number";
    columnElement3.min = 1;
    columnElement3.value = cartItem.quantity;
    columnElement3.textContent = cartItem.quantity.toString();
    columnElement3.style.width = "4em";
    columnElement3.style.fontSize = "13px";
    columnElement3.addEventListener("change", TaxCloudHelper_QuantityChanged, false);

    var columnElement4 = document.createElement("span");
    divCartItemColumn4.appendChild(columnElement4);
    columnElement4.id = TaxCloudCartItemAmountID + cartItem.index.toString();
    columnElement4.textContent = "$" + cartItem.PriceTotal().toFixed(2);

    var columnElement5 = document.createElement("span");
    divCartItemColumn5.appendChild(columnElement5);
    columnElement5.id = TaxCloudCartItemTaxID + cartItem.index.toString();
    if (cartItem.TaxTotal() == 0.0)
        columnElement5.textContent = "..";
    else
        columnElement5.textContent = "$" + cartItem.TaxTotal().toFixed(2);

    var columnElement6 = document.createElement("span");
    divCartItemColumn6.appendChild(columnElement6);
    columnElement6.id = TaxCloudCartItemTotalID + cartItem.index.toString();
    if (cartItem.TaxTotal() == 0.0)
        columnElement6.textContent = "..";
    else
        columnElement6.textContent = "$" + cartItem.PricePlusTaxTotal().toFixed(2);

    var divCartItemsElement = document.getElementById(TaxCloudPurchaseStepTwoCartItemsID);
    divCartItemsElement.appendChild(divCartItemRowElement);
    this.addingCartItem = false;
}

TaxCloud.prototype.removeCartItem = function (cartItem) {
    // taking the easy way out -- we use the cart item index to identify the elements. However, when an item is removed the index values can change. So regenerate the line items
    var divCartItemsElement = document.getElementById(TaxCloudPurchaseStepTwoCartItemsID);
    while (divCartItemsElement.hasChildNodes())
        divCartItemsElement.removeChild(divCartItemsElement.firstChild);
    var cartItemII = 0;
    for (; cartItemII < this.cart.items.length; ++cartItemII)
        this.addCartItem(this.cart.items[cartItemII]);
}

TaxCloud.prototype.PreparePurchaseStep2 = function () {
    this.prepareVerifiedAddress(TaxCloudPurchaseStepTwoVerifiedAddressImageID);
    this.UpdatePurchaseStep2UI();
}

TaxCloud.prototype.OpenPurchaseStep2 = function () {
    if (this.purchaseStep2Active)
        return;
    this.PreparePurchaseStep2();
    $("#" + TaxCloudPurchaseStepTwoID).dialog("open");
}

TaxCloud.prototype.UpdatePurchaseStep2 = function () {
    if (!this.addingCartItem) {
        for (var ii = 0; ii < this.cart.items.length; ++ii)
            this.UpdatePurchaseStep2CartItem(this.cart.items[ii]);
    }
}

TaxCloud.prototype.UpdatePurchaseStep2CartItem = function (cartItem) {
    var quantityElement = document.getElementById(TaxCloudCartItemQuantityID + cartItem.index.toString());
    if (quantityElement)
        cartItem.quantity = quantityElement.value;
}

TaxCloud.prototype.UpdatePurchaseStep2UI = function () {
    for (var ii = 0; ii < this.cart.items.length; ++ii)
        this.UpdatePurchaseStep2UICartItem(this.cart.items[ii]);
    var salesTaxElement = document.getElementById(TaxCloudSalesTaxID);
    if (salesTaxElement)
        salesTaxElement.textContent = "$" + this.cart.TaxTotal().toFixed(2);
    var grandTotalElement = document.getElementById(TaxCloudGrandTotalID);
    if (grandTotalElement)
        grandTotalElement.textContent = "$" + this.cart.GrandTotal().toFixed(2);
}

TaxCloud.prototype.UpdatePurchaseStep2UICartItem = function (cartItem) {
    var amountElement = document.getElementById(TaxCloudCartItemAmountID + cartItem.index.toString());
    if (amountElement)
        amountElement.textContent = "$" + cartItem.PriceTotal().toFixed(2);
    var taxElement = document.getElementById(TaxCloudCartItemTaxID + cartItem.index.toString());
    if (taxElement)
        taxElement.textContent = "$" + cartItem.TaxTotal().toFixed(2);
    var totalElement = document.getElementById(TaxCloudCartItemTotalID + cartItem.index.toString());
    if (totalElement)
        totalElement.textContent = "$" + cartItem.PricePlusTaxTotal().toFixed(2);
}

TaxCloud.prototype.PurchaseStep2UpdateClicked = function () {
    this.UpdatePurchaseStep2();
    if (this.OnPurchaseStep2UpdateClicked)
        this.OnPurchaseStep2UpdateClicked(this);
    else
        this.Lookup(this.taxCloudPostUrl, null);
}

TaxCloud.prototype.PurchaseStep2PurchaseClicked = function () {
    this.ClosePurchaseStep2();
    if (this.OnPurchaseStep2PurchaseClicked)
        this.OnPurchaseStep2PurchaseClicked(this);
}

TaxCloud.prototype.PurchaseStep2CancelClicked = function () {
    if (this.purchaseStep2Active)
        this.ClosePurchaseStep2();
    if (this.OnPurchaseStep2CancelClicked)
        this.OnPurchaseStep2CancelClicked(this);
}

TaxCloud.prototype.ClosePurchaseStep2 = function () {
    $("#" + TaxCloudPurchaseStepTwoID).dialog("close");
}

TaxCloud.prototype.BackToPurchaseStepOne = function () {

    this.ClosePurchaseStep2();
    this.OpenPurchaseStep1();
}

TaxCloud.prototype.CartItemAdded = function (cartItem) {
    this.addCartItem(cartItem);
}

TaxCloud.prototype.CartItemRemoved = function (cartItem) {
    this.removeCartItem(cartItem);
}

TaxCloud.prototype.getDOMChildElementTextContent = function (parentElement, childElementName) {
    var children = parentElement.getElementsByTagName(childElementName);
    if (!children || children.length == 0)
        return "";
    var child = children[0];
    if (child.textContent)
        return child.textContent;
    else
        return "";
}

TaxCloud.prototype.SetCart = function (cart) {
    this.cart = cart;
}

TaxCloud.prototype.Ping = function (taxCloudPostUrl, callback) {
    this.userPingCallback = callback;
    var request = new TaxCloudConnection(this);
    var soapPackage = this.pingSoapPackage;
    request.post((taxCloudPostUrl) ? taxCloudPostUrl : this.taxCloudPostUrl, "Ping", soapPackage, "PingCallback");
}

TaxCloud.prototype.PingCallback = function (request) {
    var xmlDOM = request.GetResponseDOM();
    this.pingResponseType = this.getDOMChildElementTextContent(xmlDOM, "ResponseType");
    this.pingResponseMessage = this.getDOMChildElementTextContent(xmlDOM, "Message");
    if (this.userPingCallback)
        this.userPingCallback(this);
}

TaxCloud.prototype.VerifyOriginAddress = function (taxCloudPostUrl, callback) {
    if (!this.addressOrigin) {
        alert("Please use a valid origin address");
        return false;
    }
    this.userVerifyOriginAddressCallback = callback;
    var request = new TaxCloudConnection(this);
    var soapPackage = this.verifyAddressSoapPackage.replace("$address1", this.addressOrigin.address1).replace("$address2", this.addressOrigin.address2).replace("$city", this.addressOrigin.city).replace("$state", this.addressOrigin.state).replace("$zip5", this.addressOrigin.zip5).replace("$zip4", this.addressOrigin.zip4);
    request.post((taxCloudPostUrl) ? taxCloudPostUrl : this.taxCloudPostUrl, "VerifyAddress", soapPackage, "VerifyOriginAddressCallback");
}

TaxCloud.prototype.VerifyOriginAddressCallback = function (request) {
    this.DataToAddress(request.GetResponseDOM(), this.addressOrigin);
    if (this.userVerifyOriginAddressCallback)
        this.userVerifyOriginAddressCallback(this);
}

TaxCloud.prototype.VerifyDestinationAddress = function (taxCloudPostUrl, callback) {
    if (!this.addressDestination) {
        alert("Please use a valid destination address");
        return false;
    }
    this.userVerifyDestinationAddressCallback = callback;
    var request = new TaxCloudConnection(this);
    var soapPackage = this.verifyAddressSoapPackage.replace("$address1", this.addressDestination.address1).replace("$address2", this.addressDestination.address2).replace("$city", this.addressDestination.city).replace("$state", this.addressDestination.state).replace("$zip5", this.addressDestination.zip5).replace("$zip4", this.addressDestination.zip4);
    request.post((taxCloudPostUrl) ? taxCloudPostUrl : this.taxCloudPostUrl, "VerifyAddress", soapPackage, "VerifyDestinationAddressCallback");
}

TaxCloud.prototype.VerifyDestinationAddressCallback = function (request) {
    this.DataToAddress(request.GetResponseDOM(), this.addressDestination);
    this.cart.addressDestination = this.addressDestination;
    this.UpdatePurchaseStep1UI();
    this.prepareVerifiedAddress(TaxCloudPurchaseStepTwoVerifiedAddressImageID);
    if (this.localStorageEnabled) {
        TaxCloudHelper_SetLocalStorageItem(this.GetStorageName(), this.ToISODateTime(new Date()));
        this.addressDestination.saveToLocalStorage(this.GetCustomerID());
    }
    if (this.userVerifyDestinationAddressCallback)
        this.userVerifyDestinationAddressCallback(this);
}

TaxCloud.prototype.Lookup = function (taxCloudPostUrl, callback) {
    this.userLookupCallback = callback;
    // verify the required fields are there
    if (!this.customerID) {
        alert("Customer ID needs to be set");
        return false;
    }
    if (!this.cart) {
        alert("Please generate a cart first");
        return false;
    }
    if (!this.addressOrigin) {
        alert("Please use a valid origin address");
        return false;
    }
    if (!this.addressDestination) {
        alert("Please use a valid destination address");
        return false;
    }
    var request = new TaxCloudConnection(this);
    var soapPackage = this.lookupSoapPackage.replace("$customerID", this.customerID).replace("$cart", this.cart.LookupSoapPackage()).replace("$addressOrigin", this.addressOrigin.SoapPackage()).replace("$addressDestination", this.addressDestination.SoapPackage()).replace("$deliveredBySeller", (this.deliveredBySeller) ? "true" : "false");
    request.post((taxCloudPostUrl) ? taxCloudPostUrl : this.taxCloudPostUrl, "Lookup", soapPackage, "LookupCallback");
}

TaxCloud.prototype.LookupCallback = function (request) {
    var xmlDOM = request.GetResponseDOM();
    this.lookupResponseType = this.getDOMChildElementTextContent(xmlDOM, "ResponseType");
    this.lookupResponseMessage = this.getDOMChildElementTextContent(xmlDOM, "Message");
    var cartItemResponses = xmlDOM.documentElement.getElementsByTagName("CartItemResponse");
    var index = 0;
    for (; index < cartItemResponses.length; ++index) {
        var responseElement = cartItemResponses[index];
        var cartItem = this.cart.items[index];
        if (cartItem.quantity > 0)
            cartItem.tax = parseFloat(this.getDOMChildElementTextContent(responseElement, 'TaxAmount'));
        else
            cartItem.tax = 0.0;
    }
    this.UpdatePurchaseStep2UI();
    if (this.localStorageEnabled) {
        TaxCloudHelper_SetLocalStorageItem(this.GetStorageName(), this.ToISODateTime(new Date()));
        this.cart.saveToLocalStorage(this.GetCustomerID());
    }
    if (this.userLookupCallback)
        this.userLookupCallback(this);
}

TaxCloud.prototype.Authorized = function (taxCloudPostUrl, callback) {
    if (!this.customerID) {
        alert("Customer ID needs to be set");
        return false;
    }
    if (!this.cart) {
        alert("Please generate a cart first");
        return false;
    }
    this.userAuthorizedCallback = callback;
    var request = new TaxCloudConnection(this);
    var soapPackage = this.authorizedSoapPackage.replace("$customerID", this.customerID).replace("$cartID", this.cart.id).replace("$orderID", orderID).replace("$dateAuthorized", authorizedDate);
    request.post((taxCloudPostUrl) ? taxCloudPostUrl : this.taxCloudPostUrl, "Authorized", soapPackage, "AuthorizedCallback");
}

TaxCloud.prototype.AuthorizedCallback = function (request) {
    var xmlDOM = request.GetResponseDOM();
    this.authorizedResponseType = this.getDOMChildElementTextContent(xmlDOM, "ResponseType");
    this.authorizedResponseMessage = this.getDOMChildElementTextContent(xmlDOM, "Message");
    if (this.UserAuthorizedCallback)
        this.userAuthorizedCallback(this);
}

TaxCloud.prototype.Captured = function (taxCloudPostUrl, callback) {
    if (!this.customerID) {
        alert("Customer ID needs to be set");
        return false;
    }
    if (!this.cart) {
        alert("Please generate a cart first");
        return false;
    }
    this.userCapturedCallback
    var request = new TaxCloudConnection(this);
    var soapPackage = this.capturedSoapPackage.replace("$orderID", orderID);
    request.post((taxCloudPostUrl) ? taxCloudPostUrl : this.taxCloudPostUrl, "Captured", soapPackage, "CapturedCallback");
}

TaxCloud.prototype.CapturedCallback = function (request) {
    var xmlDOM = request.GetResponseDOM();
    this.capturedResponseType = this.getDOMChildElementTextContent(xmlDOM, "ResponseType");
    this.capturedResponseMessage = this.getDOMChildElementTextContent(xmlDOM, "Message");
    if (this.userCapturedCallback)
        this.userCapturedCallback(this);
}

TaxCloud.prototype.AuthorizedWithCapture = function (taxCloudPostUrl, orderID, authorizedDate, capturedDate, callback) {
    if (!this.customerID) {
        alert("Customer ID needs to be set");
        return false;
    }
    if (!this.cart) {
        alert("Please generate a cart first");
        return false;
    }
    this.userAuthorizedWithCaptureCallback = callback;
    var request = new TaxCloudConnection(this);
    var soapPackage = this.authorizedWithCaptureSoapPackage.replace("$customerID", this.customerID).replace("$cartID", this.cart.id).replace("$orderID", orderID).replace("$dateAuthorized", this.ToISODateTime(authorizedDate)).replace("$dateCaptured", this.ToISODateTime(capturedDate));
    request.post((taxCloudPostUrl) ? taxCloudPostUrl : this.taxCloudPostUrl, "AuthorizedWithCapture", soapPackage, "AuthorizedWithCaptureCallback");
}

TaxCloud.prototype.AuthorizedWithCaptureCallback = function (request) {
    var xmlDOM = request.GetResponseDOM();
    this.authorizedWithCaptureResponseType = this.getDOMChildElementTextContent(xmlDOM, "ResponseType");
    this.authorizedWithCaptureResponseMessage = this.getDOMChildElementTextContent(xmlDOM, "Message");
    if (this.userAuthorizedWithCaptureCallback)
        this.userAuthorizedWithCaptureCallback(this);
}

TaxCloud.prototype.Returned = function (taxCloudPostUrl, orderID, returnedDate, callback) {
    this.userReturnedCallback = callback;
    var request = new TaxCloudConnection(this);
    var soapPackage = this.returnedSoapPackage.replace("$orderID", orderID).replace("$cartItems", this.cart.ReturnedSoapPackage()).replace("$dateReturned", this.ToISODateTime(returnedDate));
    request.post((taxCloudPostUrl) ? taxCloudPostUrl : this.taxCloudPostUrl, "Returned", soapPackage, "ReturnedCallback");
}

TaxCloud.prototype.ReturnedCallback = function (request) {
    var xmlDOM = request.GetResponseDOM();
    this.returnedResponseType = this.getDOMChildElementTextContent(xmlDOM, "ResponseType");
    this.returnedResponseMessage = this.getDOMChildElementTextContent(xmlDOM, "Message");
    if (this.userReturnedCallback)
        this.userReturnedCallback(this);
}

TaxCloud.prototype.Purchase = function (purchasePostUrl, attributes, callback) {
    this.userPurchaseCallback = callback;
    var request = new TaxCloudConnection(this);
    request.postPurchase((purchasePostUrl) ? purchasePostUrl : this.purchasePostUrl, attributes, "PurchaseCallback");
}

TaxCloud.prototype.PurchaseCallback = function (request) {
    if (this.userPurchaseCallback)
        this.userPurchaseCallback(this, request.GetResponseText());
}

TaxCloud.prototype.Install = function () {
    TaxCloudHelper_myTaxCloudInstance = this;
    this.cart.AddObserver(this);
    this.installStep1();
    this.installStep2();
}

var tcnotice = "<div style='z-index:10;font-size:xx-small;position:absolute;width:95%;bottom:0px;text-align:center;color:#aaaaaa;'>Powered by <a href='https://taxcloud.net' target='_blank' style='color:#73A6E9;text-decoration:none;' title='TaxCloud is the only FREE sales tax management service.\nVisit TaxCloud.com to learn more.'>TaxCloud</a>&reg;</div>";

TaxCloud.prototype.installStep1 = function () {
    //switched to JQuery
    var TaxCloudCartStyle = $("<style>.TaxCloudCart{min-width:400px;display:none;font-family:verdana,sans-serif;font-size:small;cursor:default;}</style>");
    $('html > head').append(TaxCloudCartStyle);
    //Construct our placeholder divs
    var TaxCloudDivs = $("<div id='TaxCloudPurchaseStepOne' class='TaxCloudCart'></div><div id='TaxCloudPurchaseStepTwo' class='TaxCloudCart'></div>");
    $('html > body').append(TaxCloudDivs);


    //var JQueryICSSreference = $("<link rel='stylesheet' href='https://taxcloud.net/downloads/TaxCloud.js/TaxCloud.js.css'/>");

    //$('html > head').append(JQueryICSSreference);

    //$('.TaxCloudCart').dialog({modal: true,closeOnEscape:true,autoOpen:false})
    //setup jquery dialog features
    $("#TaxCloudPurchaseStepOne").dialog({
        modal: true,
        closeOnEscape: true,
        autoOpen: false,
        resizable: false,
        title: storeName,
        width: '50%',
        open: function (event, ui) { TaxCloudHelper_myTaxCloudInstance.purchaseStep1Active = false; },
        close: function (event, ui) {
            TaxCloudHelper_myTaxCloudInstance.purchaseStep1Active = false;
            if (event.originalEvent)
                TaxCloudHelper_myTaxCloudInstance.PurchaseStep1CancelClicked();
        }
    });



    $("#TaxCloudPurchaseStepOne").html("<span class='ui-widget'>Please enter your shipping address:</span><input type='text' id='" + TaxCloudAddress1ID + "' class='ui-form' placeholder='Address 1' style='width: 100%' /><input type='text' id='" + TaxCloudAddress2ID + "' placeholder='Address 2' style='width: 100%;display:none;' /><br style='display:none;'/><input style='width:60%' type='text' id='" + TaxCloudCityID + "' placeholder='City' /><select style='width:40%' id='" + TaxCloudStateID + "'></select><br/><div style='float: right'><input type='text' style='clear:none;' size='5' id='" + TaxCloudZip5ID + "' placeholder='Zip'/><input size='4' style='clear:none;' disabled='true' type='text' id='" + TaxCloudZip4ID + "' placeholder='plus4' /></div><button type='button' id='" + TaxCloudPurchaseStepOneVerifiedAddressID + "' onclick='TaxCloudHelper_myTaxCloudInstance.PurchaseStep1VerifyAddressClicked()' style='float: left;cursor:pointer;'><img id='" + TaxCloudPurchaseStepOneVerifiedAddressImageID + "' src='" + USPSVerifyAddressURL + "' style='width: 80px; height: 24px' /></button><button class='ui-state-default' style='float: right;clear:both;margin:8px 0 0 0;width:100%;margin-bottom:12px;' type='button' onclick='TaxCloudHelper_myTaxCloudInstance.PurchaseStep1NextClicked()'>Next</button>");
    $("#TaxCloudPurchaseStepOne").append(tcnotice);
    $("#TaxCloudPurchaseStepOne input").change(function () {
        $("#" + TaxCloudZip4ID).val('');
        $("#" + TaxCloudPurchaseStepOneVerifiedAddressImageID).attr("src", USPSVerifyAddressURL)
    });
    $("#TaxCloudPurchaseStepOne button").button();
    $("#TaxCloudPurchaseStepOne input").css('border', '1px solid #cccccc');
    $("#TaxCloudPurchaseStepOne input").css('-moz-border-radius', '8px');
    $("#TaxCloudPurchaseStepOne input").css('-webkit-border-radius', '8px');
    $("#TaxCloudPurchaseStepOne input").css('-khtml-border-radius', '8px');
    $("#TaxCloudPurchaseStepOne input").css('border-radius', '8px');
    $("#TaxCloudPurchaseStepOne select").css('border', '1px solid #cccccc');
    $("#TaxCloudPurchaseStepOne select").css('-moz-border-radius', '8px');
    $("#TaxCloudPurchaseStepOne select").css('-webkit-border-radius', '8px');
    $("#TaxCloudPurchaseStepOne select").css('-khtml-border-radius', '8px');
    $("#TaxCloudPurchaseStepOne select").css('border-radius', '8px');
    //$("input[type=number]").spinner();
}

TaxCloud.prototype.installStep2 = function () {
    $("#TaxCloudPurchaseStepTwo").addClass("TaxCloudCart");
    $("#TaxCloudPurchaseStepTwo").html("<div style='width:95%;margin-left:1%;'><span style='display: inline-block; width: 25%;text-align:left;'>Item</span><span style='display: inline-block; width: 15%;text-align:center;'>Price</span><span style='display: inline-block; width:15%;text-align:center;' title='Quantity'>Qty</span><span style='display: inline-block; width:15%;text-align:center;'>Amount</span><span style='display: inline-block; width:15%;text-align:center;'>Tax</span><span style='display: inline-block; width:15%;text-align:center;'>Total</span></div><div id='" + TaxCloudPurchaseStepTwoCartItemsID + "' style='position: relative; margin-top: 5px; max-height:200px; height:60%; width: 100%; background-color: #FFFFFF;border:1px solid #cccccc;-moz-border-radius: 8px;-webkit-border-radius: 8px;-khtml-border-radius: 8px;border-radius: 8px;overflow: auto;'></div><br /><div style='float: right; text-align:right;margin-right:2em;'><div style='float:right;'><span id='" + TaxCloudSalesTaxID + "'>$0.00</span><br/><span style='font-weight:bold;' id='" + TaxCloudGrandTotalID + "'></div><div style='float:right;'><span id='salestaxpolicy'>Sales Tax to be collected</span>:&nbsp;<br/><b>Total:&nbsp;</b></div></div><div style='float: right;width:100%;margin:8px 0 0 0;'><button type='button' id='" + TaxCloudPurchaseStepTwoVerifiedAddressID + "' onclick='TaxCloudHelper_myTaxCloudInstance.BackToPurchaseStepOne()' style='float: left;clear:none;cursor:pointer;width:48%;'><img id='" + TaxCloudPurchaseStepTwoVerifiedAddressImageID + "' src='" + USPSVerifyAddressURL + "' style='width: 80px; height:24px' /></button><button type='button' onclick='TaxCloudHelper_myTaxCloudInstance.PurchaseStep2UpdateClicked()' style='float:right;clear:none;cursor:pointer;width:48%;'>Update</button></div><button type='button' style='font-weight:bold;cursor:pointer;width:100%;margin-bottom:12px;' class='ui-state-default' onclick='TaxCloudHelper_myTaxCloudInstance.PurchaseStep2PurchaseClicked()'>Purchase</button>");
    $("#TaxCloudPurchaseStepTwo").append(tcnotice);
    $("#TaxCloudPurchaseStepTwo button").button();
    $("#TaxCloudPurchaseStepTwo input").css('border', '1px solid #cccccc');
    $("#TaxCloudPurchaseStepTwo input").css('-moz-border-radius', '8px');
    $("#TaxCloudPurchaseStepTwo input").css('-webkit-border-radius', '8px');
    $("#TaxCloudPurchaseStepTwo input").css('-khtml-border-radius', '8px');
    $("#TaxCloudPurchaseStepTwo input").css('border-radius', '8px');

    $("#TaxCloudPurchaseStepTwo").dialog({
        modal: true,
        closeOnEscape: true,
        autoOpen: false,
        resizable: false,
        title: storeName,
        width: '50%',
        open: function (event, ui) { TaxCloudHelper_myTaxCloudInstance.purchaseStep2Active = false; },
        close: function (event, ui) {
            TaxCloudHelper_myTaxCloudInstance.purchaseStep2Active = false;
            if (event.originalEvent)
                TaxCloudHelper_myTaxCloudInstance.PurchaseStep2CancelClicked();
        }
    });
    //$(".TaxCloudCart button").button();
}
