$(window).load(function(){
    $("#map").load("/static/map2.svg", function(){
	main();
	reloadData();
    });
});

function getResourceImg(resource){
    return "/static/" + {"Овцы": "sheep", "Зерно": "grain", "Вино": "grape", "Металл": "rock"}[resource] + ".png";
}

function callback(data){
    g_data = data;
    renderResources();
}

function reloadData(){
    //$.getScript("http://senat-billing.info/provins_data.js");
    $.getScript("/data.js");
    setTimeout(reloadData, 1000 * 60); // reload is unrelated to the actual callback
}

function setData(node, key, value){
    var data = $(node).data();
    data[key] = value;
}
function getData(node, key){
    var data = $(node).data();
    if (data){
	return data[key];
    }
    return null;
}

var g_data = new Object();

function clone(templateStr){
    var ret = $("#" + templateStr).clone();
    ret.removeAttr("id");
    ret.addClass(templateStr.replace(/Template$/, ""));
    return ret[0];
}

function createHint(key, left, top){
    var data = g_data[key];
    if (data){
	var element = clone("hintTemplate");
	$(element).css({left: left, top: top});
	for (var k in data){
	    $("." + k, element).text(data[k]);
	}
	icon = $(clone("iconTemplate"));
	icon.attr("src", getResourceImg(data.resource));
	$(element).append(icon);
	return element;
    }
}

function getKey(tspan){
    // recreate full text by joining all siblings
    var text = $(tspan).parent().find("tspan").text();
    var ret = text.match(/\d+/)
    if (ret){
	return ret[0];
    }
    return null;
}

function showHint(tspan){
    if (getData(tspan, "hint")){
	var timer = getData(tspan, "hintTimer");
	if (timer){
	    clearTimeout(timer);
	    setData(tspan, "hintTimer");
	}
    } else{
	var left = $(tspan).parent().position().left;
	var top = $(tspan).parent().position().top;
	var wnd = createHint(getKey(tspan), left + 20, top - 20);
	if (wnd){
	$("body").append(wnd);
	    setData(tspan, "hint", $(wnd));
	}
    }
}
function hideHint(tspan){
    setData(tspan, "hintTimer");
    var wnd = getData(tspan, "hint");
    if (wnd && wnd.remove){
	wnd.remove();
	setData(tspan, "hint");
    }
}

function renderResources(){
    $("tspan").each(function(){
	var key = getKey(this);
	if (g_data[key]){
	    var icon = getData(this, "res");
	    var exists = true;
	    if (!icon){
		icon = $(clone("iconTemplate"));
		exists = false;
	    }
	    icon.attr("src", getResourceImg(g_data[key].resource));
	    setData(this, "res", $(icon));
	    if (!exists){
		var left = $(this).parent().position().left;
		var top = $(this).parent().position().top + 4;
		$(icon).css({position: "absolute", left: left, top: top});
		$("body").append(icon);
	    }
	}
    });
    var roaded = new Object();
    for (var p_id in g_data){
	var p = g_data[p_id];
	if (p["road"] == "1"){
	    roaded[p_id] = 1;
	}
    }
    $("g").filter(function(){return $(this).attr("inkscape:label") == "roads2"}).find("path").each(function(){
	var ids = $(this).attr("id").match(/r(\d+)-(\d+)/);
	if (ids){
	    var p1 = ids[0];
	    var p2 = ids[1];
	    if (!(roaded[p1] && roaded[p2])){
		$(this).hide();
	    }
	}
    });
    for (var p_id in roaded){
	for (var p2_id in roaded){
	    var e = $("#r" + p_id + "-" + p2_id);
	    if (!e){
		e = $("#r" + p2_id + "-" + p_id)
	    }
	    if (e){
		e.show();
	    }
	}
    }
}

function main(root){
    var svg = $("#map svg");
    svg.width(2000);
    $("g", svg).filter(function(){return $(this).attr("inkscape:label") == "roads2"}).find("path").hide();
    $("image", svg).remove();
    $("tspan", svg).hover(function(e){
	showHint($(this));
    }, function(){
	var self = this;
	setData($(self), "hintTimer", setTimeout(function(){hideHint($(self));}, 1));
    });
}

