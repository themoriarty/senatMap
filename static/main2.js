$(window).load(function(){
    $("#map").load("/static/map2.svg", function(){
	main();
	reloadData();
    });
});

function reloadData(){
    $.getJSON("/data.js", function(data){
	g_data = data;
	renderResources();
    });
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
	icon.attr("src", "/static/" + data.resource + ".png");
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
    $("#layer1 tspan").each(function(){
	var key = getKey(this);
	if (g_data[key]){
	    var icon = getData(this, "res");
	    var exists = true;
	    if (!icon){
		icon = $(clone("iconTemplate"));
		exists = false;
	    }
	    icon.attr("src", "/static/" + g_data[key].resource + ".png");
	    setData(this, "res", $(icon));
	    if (!exists){
		var left = $(this).parent().position().left;
		var top = $(this).parent().position().top + 4;
		$(icon).css({position: "absolute", left: left, top: top});
		$("body").append(icon);
	    }
	}
    });
}

function main(root){
    var svg = $("#map svg");
    svg.width(1000);
    $("#layer1 image").remove();
    $("#layer1 tspan", svg).hover(function(e){
	showHint($(this));
    }, function(){
	var self = this;
	setData($(self), "hintTimer", setTimeout(function(){hideHint($(self));}, 1));
    });
}

