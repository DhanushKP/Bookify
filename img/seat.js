setPassengerNumber(10);

// SVG labels localization
var translatedLabels = [];
translatedLabels['label_salita'] = 'Salita';
translatedLabels['label_salita_left'] = 'Salita';
translatedLabels['label_salita_right'] = 'Salita';
translatedLabels['label_legenda_lavandino'] = 'Lavandino';
translatedLabels['label_legenda_wc'] = 'WC';
translatedLabels['label_cabina_riga1'] = '';
translatedLabels['label_cabina_riga2'] = '';

var seatToHighlight = null; // is used in svg by highlightSelected(wagonNumber)
var normalNavigation = true; // is used in svg by highlightSelected(wagonNumber)

var wagonId = null; // must be setted by the channel (is used in selectSeat and unselectSeat)
var provideAll = true; // false if seat selection is in only one wagon 

/*
 * Sets passengers number in the form
 */
function setPassengerNumber(passengers) {
  console.log("IN setPassengerNumber > " + passengers )
  document.getElementById('passenger').value = passengers;
  maxsel = passengers;
}

/**
 * Loads SVG image from URL and inserts it on the page
 * @url URL of SVG image
 */
// function loadSvg(url) {
//     var obj = document.getElementById('seatmap_svg');
//     obj.outerHTML = obj.outerHTML.replace(/src="(.+?)"/, 'src="' + url + '"');
//     $("#seatMapPopup").popup( "reposition", {positionTo : "window"} );
//     checkSvgLoadStatus(0);
// }

/**
 * Loads new SVG and reset values
 * @wagonId Wagon number
 * @url URL of SVG image
 */
function loadWagon(wagonId, svgUrl) {
  this.wagonId = wagonId;
  var selNum = document.getElementById('selNum');

  // Seat reservation in multiple wagons
  if (this.provideAll) {
    var selectedSeatsInWagon = this.seatSequence.getSelectedSeatsInWagon(wagonId);
    selNum.value = selNum.value - selectedSeatsInWagon.length;
    seatToHighlight = selectedSeatsInWagon;
  } else {
    resetSeatmapValues();
  }

  loadSvg(svgUrl);
}


function resetSeatmapValues() {
  // reset values in the form
  var selNum = document.getElementById('selNum');
  selNum.value = 0;
  document.getElementById('seatSequence').value = '';
  // reset seatSequence Object
  seatSequence = new SeatSequence();
}


/**
 * Adds selected seat to sequence
 * @param seatId
 * @param wagonId Wagon number
 * @param aircraftNumber Alphanumeric seat value
 */
function selectSeat(seatId, wagonId, aircraftNumber) {
  console.log("IN selectSeat > " + seatId + ", " + wagonId +", " + aircraftNumber);
  this.seatSequence.addSeat(this.wagonId, seatId, aircraftNumber);
  confirmSeat();
}


/**
 * Removes selected seat from sequence
 * @param seatId
 * @param wagonId Wagon number
 */
function unselectSeat(seatId, wagonId) {
  console.log("IN unselectSeat > " + seatId + ", " + wagonId);
  this.seatSequence.removeSeat(this.wagonId, seatId);
  confirmSeat();
}




/* === SEAT SEQUENCE MANAGEMENT === */

/**
 * Seat object
 * @param wagonId Wagon number
 * @param seatId
 * @param aircraftNumber Alphanumeric seat value
 * @constructor
 */
var Seat = function(wagonId, seatId, aircraftNumber) {
  this.wagonId = wagonId;
  this.seatId = seatId;
  if (aircraftNumber) {
    this.aircraftNumber = aircraftNumber;
  }
};


/**
 * Getter for seat identifier
 * @returns {string} seat ID in format {wagonId-seatId}
 */
Seat.prototype.getSeatId = function() {
  return this.wagonId + '-' + this.seatId;
};


/**
 * Container for reserved seats
 * @constructor
 */
var SeatSequence = function() {
  this.reservedSeats = []; // array of Seat objects
};


/**
 * Adds seat to sequence
 * @param wagonId Wagon number
 * @param seatId
 * @param aircraftName alphanumeric seat value
 */
SeatSequence.prototype.addSeat = function(wagonId, seatId, aircraftName) {
  // add element only if not exists
  if (this.indexOf(wagonId, seatId) == -1) {
    if (seatId == aircraftName) {
      this.reservedSeats.push(new Seat(wagonId, seatId));
    } else {
      this.reservedSeats.push(new Seat(wagonId, seatId, aircraftName));
    }
  }
};


/**
 * Searches for seat by wagonId and seatId
 * @param wagonId Wagon number
 * @param seatId
 * @returns {number} index of element in the sequence;
 *          -1 if element not exists
 */
SeatSequence.prototype.indexOf = function(wagonId, seatId) {
  return this.reservedSeats.map(
    function(el) {
      return el.wagonId + '-' + el.seatId;
    }
  ).indexOf(wagonId + '-' + seatId);
};

SeatSequence.prototype.getSelectedSeatsInWagon = function(wagonId) {
  var selectedSeats = [];
  for (var i = 0; i < this.reservedSeats.length; i++) {
    if (this.reservedSeats[i].wagonId == wagonId) {
      selectedSeats.push(this.reservedSeats[i].seatId);
    }
  }
  return selectedSeats;
};


/**
 * Removes seat from sequence
 * @param wagonId Wagon number
 * @param seatId
 * @returns {boolean} true if the seat was removed, false if
 *          there is no reserved seat with specified ID
 */
SeatSequence.prototype.removeSeat = function(wagonId, seatId) {
  var i = this.indexOf(wagonId, seatId);
  if (i == -1) return false; // there is no reserved seat with this ID
  this.reservedSeats.splice(i, 1);
  return true;
};


/**
 * Generates seat sequence separated by comma
 * @returns {string} Seat sequence in format {wagonId-seatId}
 */
SeatSequence.prototype.toString = function() {
  var seatSequenceStr = '';

  for (var i = 0; i < this.reservedSeats.length; i++) {
    if (i != 0) {
      seatSequenceStr += ',' + this.reservedSeats[i].getSeatId();
    } else {
      seatSequenceStr = this.reservedSeats[i].getSeatId();
    }
  }

  return seatSequenceStr;
};

var seatSequence = new SeatSequence(); //init seatSequence





function loadSvg(url) {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", url, true);
  oReq.onreadystatechange = function() {
    if (oReq.readyState === 4) {
      if (oReq.status === 200 || oReq.status === 0) {
        if (oReq.response !== "") {
          var svg = oReq.response.match(/(<svg[\s\S\n\r]*<\/svg>)/)[0];

          $("#seatmap_svg").html(svg);
          highlightSelected(seatToHighlight);
        }
      } else {
        console.log("Error on loading seatmap svg");
      }
    }
  };

  oReq.send();
}


/**
 * Updates seatSequence in the form and control confirm button activation
 */
function confirmSeat() {
  $("#seatSequence").val(this.seatSequence.toString())
    .attr("data-sequence", JSON.stringify(this.seatSequence))
    .change();

  // enable button if at least one seat is selected
  if (this.seatSequence.reservedSeats.length == $('#passenger').val()) {
    $("#continueButton").removeClass("TI_disabledButton");
  } else {
    $("#continueButton").addClass("TI_disabledButton");
  }
}

function finalizeSeat() {
  return seatSequence;
}

function checkSvgLoadStatus() {}


var selCompClass = "selected";

var selclass = 'sedileevid';
var placeClass = 'sedile';


function highlightComp(x) {
  var orig = document.getElementById(x).getAttribute("class");
  var newc = selCompClass + " ";
  var indexc = orig.indexOf(newc);
  if (indexc > -1) //remove selected class
  {
    document.getElementById(x).setAttribute("class", orig.substring(newc.length));
  } else //add selected class
  {
    document.getElementById(x).setAttribute("class", newc + orig);
  }
}



function abilitaIntero(flagint, flagcom, op, po, cc) {
  var comparr = [].slice.call(document.getElementsByClassName("compLayer"));
  var comunarr = [].slice.call(document.getElementsByClassName("comunLayer"));
  if (document.getElementsByClassName("doors").length > 0) document.getElementsByClassName("doors")[0].style.display = (flagcom) ? "block" : "none";
  document.getElementsByClassName("compLayers")[0].style.display = (flagcom || flagint) ? "block" : "none";
  if (flagcom) {
    comunarr.forEach(function(y, index) {
      y.addEventListener("click", compComunHandler, true);
    });
  } else if (flagint) {
    comparr.forEach(function(y, index) {
      y.addEventListener("click", compHandler, true);
    });
  }
  //	document.getElementById("op").innerHTML=op;
  //	document.getElementById("po").innerHTML=po;
  //	document.getElementById("cc").innerHTML=cc;
}


function setLabel(ph, text) {
  if (document.getElementById(ph))
    document.getElementById(ph).innerHTML = text
}


function selectComp(nodeId, selected) {
  var classe = (selected) ? "lettoevid" : "letto";
  var index = nodeId.substr(9);
  [].slice.call(document.getElementById("compartimento_" + index).getElementsByClassName(classe)).forEach(
    function(x) {
      if (x.id.indexOf("_sel") == -1)
        x.onclick();
    });

}

function compHandler(e) {
  selectComp(e.currentTarget.id, (e.currentTarget.getAttribute("class").indexOf(selCompClass) > -1));
  highlightComp(e.currentTarget.id);
}

function compComunHandler(e) {
  [].slice.call(e.currentTarget.getElementsByTagName("rect")).forEach(function(x) {
    selectComp(x.id, (e.currentTarget.getAttribute("class").indexOf(selCompClass) > -1))
  })
  highlightComp(e.currentTarget.id);
}



function translateLabel(arr) {
  if (arr)
    for (var key in arr) {
      setLabel(key, arr[key]);
    }
}

function highlightSelected(wagonNumber) {
  var str = null;
  var sequence;
  var valueOfSequ;
  var myseatWithWagonArray;
  var myseatNumber;
  var currentWagon;

  str = seatToHighlight;
  sequence = document.getElementById("seatSequence");
  if ((str != null) && (str.length > 0)) {
    for (var i = 0; i < str.length; i++) {
      highlight(str[i])
    }
  } else {
    if (sequence != null) {
      currentWagon = sequence.value.substring(0, sequence.value.indexOf("-"));
      if (currentWagon == wagonNumber) {
        valueOfSequ = sequence.value;
        myseatWithWagonArray = valueOfSequ.split(",");
        for (i = 0; i < myseatWithWagonArray.length; i++) {
          if (myseatWithWagonArray[i].indexOf("-") > 0) {
            myseatNumber = myseatWithWagonArray[i].substring(myseatWithWagonArray[i].indexOf('-') + 1);
            normalNavigation = false;
            highlight(myseatNumber);
          }
        }
      }
    }
  }
}

function scaleObject(evt, factor) {
  //reference to the currently selected object
  var element = evt.getTarget();

  //query old transform value (we need the translation value)
  var curTransform = element.getAttribute("transform");
  curTransform = new String(curTransform); //Wert in ein String umwandeln
  //no fear from Regular expressions ... just copy it, I copied it either ...
  var translateRegExp = /translate\(([-+]?[\d.]+)(\s*[\s,]\s*)([-+]?[\d.]+)\)\s*/;

  //This part extracts the translation-value from the whole transform-string
  if (curTransform.length != 0) {
    var result = curTransform.match(translateRegExp);
    if (result == null || result.index == -1) {
      oldTranslateX = 0;
      oldTranslateY = 0;
    } else {
      oldTranslateX = result[1];
      oldTranslateY = result[3];
    }
    //concatenate the string again, add scale-factor
    var newtransform = "translate(" + oldTranslateX + " " +
      oldTranslateY + ") " + "scale(" + factor + ")";
  }
  //set transform-factor
  element.setAttribute('transform', newtransform);
}


/**
 * Show an error when max seats number is reached
 */
function showMessage() {
  alert($.i18n.t("seatmap.maxSeatNumberReached"));
}

/**
 *
 * @param someText
 * @returns text decode
 */
function decodeHTMLEntities(someText) {
  if (someText != null) {
    oDiv = document.createElement("DIV");
    if (someText.match(/&.+?;/gim)) {
      oDiv.innerHTML = someText;
      someText = oDiv.innerText || oDiv.firstChild.nodeValue;
    }
  }
  return someText;
}



var selCompClass = "selected";

function highlightComp(x) {
  var orig = document.getElementById(x).getAttribute("class");
  var newc = selCompClass + " ";
  var indexc = orig.indexOf(newc);
  if (indexc > -1) //remove selected class
  {
    document.getElementById(x).setAttribute("class", orig.substring(newc.length));
  } else //add selected class
  {
    document.getElementById(x).setAttribute("class", newc + orig);
  }
}



function abilitaIntero(flagint, flagcom, op, po, cc) {
  var comparr = [].slice.call(document.getElementsByClassName("compLayer"));
  var comunarr = [].slice.call(document.getElementsByClassName("comunLayer"));
  if (document.getElementsByClassName("doors").length > 0) document.getElementsByClassName("doors")[0].style.display = (flagcom) ? "block" : "none";
  document.getElementsByClassName("compLayers")[0].style.display = (flagcom || flagint) ? "block" : "none";
  if (flagcom) {
    comunarr.forEach(function(y, index) {
      y.addEventListener("click", compComunHandler, true);
    });
  } else if (flagint) {
    comparr.forEach(function(y, index) {
      y.addEventListener("click", compHandler, true);
    });
  }
  //	document.getElementById("op").innerHTML=op;
  //	document.getElementById("po").innerHTML=po;
  //	document.getElementById("cc").innerHTML=cc;
}


function setLabel(ph, text) {
  if (document.getElementById(ph))
    document.getElementById(ph).innerHTML = text
}


function selectComp(nodeId, selected) {
  var classe = (selected) ? "lettoevid" : "letto";
  var index = nodeId.substr(9);
  [].slice.call(document.getElementById("compartimento_" + index).getElementsByClassName(classe)).forEach(
    function(x) {
      if (x.id.indexOf("_sel") == -1)
        x.onclick();
    });

}

function compHandler(e) {
  selectComp(e.currentTarget.id, (e.currentTarget.getAttribute("class").indexOf(selCompClass) > -1));
  highlightComp(e.currentTarget.id);
}

function compComunHandler(e) {
  [].slice.call(e.currentTarget.getElementsByTagName("rect")).forEach(function(x) {
    selectComp(x.id, (e.currentTarget.getAttribute("class").indexOf(selCompClass) > -1))
  })
  highlightComp(e.currentTarget.id);
}



function translateLabel(arr) {
  if (arr)
    for (var key in arr) {
      setLabel(key, arr[key]);
    }
}

function highlightSelected(wagonNumber) {
  console.log("IN highlightSelected");
  var str = null;
  var sequence;
  var valueOfSequ;
  var myseatWithWagonArray;
  var myseatNumber;
  var currentWagon;

  str = seatToHighlight;
  sequence = document.getElementById("seatSequence");
  if ((str != null) && (str.length > 0)) {
    for (var i = 0; i < str.length; i++) {
      highlight(str[i])
    }
  } else {
    if (sequence != null) {
      currentWagon = sequence.value.substring(0, sequence.value.indexOf("-"));
      if (currentWagon == wagonNumber) {
        valueOfSequ = sequence.value;
        myseatWithWagonArray = valueOfSequ.split(",");
        for (i = 0; i < myseatWithWagonArray.length; i++) {
          if (myseatWithWagonArray[i].indexOf("-") > 0) {
            myseatNumber = myseatWithWagonArray[i].substring(myseatWithWagonArray[i].indexOf('-') + 1);
            normalNavigation = false;
            highlight(myseatNumber);
          }
        }
      }
    }
  }
}

function highlight(str, valToShow) {
  console.log("IN highlight"); 
  var selNum = eval(document.getElementById("selNum").value);
  console.log("IN highlight > " + selNum);
  console.log("IN highlight > " + maxsel);
  if (selNum < maxsel) {
    var node = document.getElementById("seat_" + str);
    selSeat = node.cloneNode(true);
    selSeat.setAttributeNS(null, 'id', 'seat_' + str + '_sel')
    selSeat.setAttributeNS(null, "onclick", "removeSeat('" + str + "','" + valToShow + "')");
    selSeat.setAttributeNS(null, 'class', selclass);
    node.setAttributeNS(null, "onclick", "removeSeat('" + str + "','" + valToShow + "')");
    node.setAttributeNS(null, 'class', selclass);

    node.parentNode.appendChild(selSeat);
    document.getElementById("selNum").value++;
    if (selectSeat) {
      selectSeat(str, this.document.URL.substring(this.document.URL.lastIndexOf('_') + 1, this.document.URL.lastIndexOf('.')), valToShow);
    }
  } else {
    showMessage();
  }
}

function removeSeat(str, valToShow) {

  console.log("IN removeSeat");
  var node = document.getElementById("seat_" + str + "_sel");
  var selSeat = document.getElementById("seat_" + str);
  selSeat.setAttributeNS(null, "onclick", "highlight('" + str + "','" + valToShow + "')");
  selSeat.setAttributeNS(null, 'class', placeClass);
  node.parentNode.removeChild(node);
  document.getElementById("selNum").value--;
  if (unselectSeat) unselectSeat(str, this.document.URL.substring(this.document.URL.lastIndexOf('_') + 1, this.document.URL.lastIndexOf('.')));
}

function scaleObject(evt, factor) {
  //reference to the currently selected object
  var element = evt.getTarget();

  //query old transform value (we need the translation value)
  var curTransform = element.getAttribute("transform");
  curTransform = new String(curTransform); //Wert in ein String umwandeln
  //no fear from Regular expressions ... just copy it, I copied it either ...
  var translateRegExp = /translate\(([-+]?[\d.]+)(\s*[\s,]\s*)([-+]?[\d.]+)\)\s*/;

  //This part extracts the translation-value from the whole transform-string
  if (curTransform.length != 0) {
    var result = curTransform.match(translateRegExp);
    if (result == null || result.index == -1) {
      oldTranslateX = 0;
      oldTranslateY = 0;
    } else {
      oldTranslateX = result[1];
      oldTranslateY = result[3];
    }
    //concatenate the string again, add scale-factor
    var newtransform = "translate(" + oldTranslateX + " " +
      oldTranslateY + ") " + "scale(" + factor + ")";
  }
  //set transform-factor
  element.setAttribute('transform', newtransform);
}