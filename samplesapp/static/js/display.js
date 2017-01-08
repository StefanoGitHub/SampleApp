// inspired by: http://bl.ocks.org/eyaler/10586116

//adapt graph area to page
var $graph = $('#graph'),
    docH = $(document).height(),
    circleWidth = 20,
    $details = $('#details-panel'),

    palette = {
        "lightgray": "#819090",
        "gray": "#708284",
        "mediumgray": "#536870",
        "darkgray": "#475B62",
        "darkblue": "#0A2933",
        "darkerblue": "#042029",
        "paleryellow": "#FCF4DC",
        "paleyellow": "#EAE3CB",
        "yellow": "#A57706",
        "orange": "#BD3613",
        "red": "#D11C24",
        "pink": "#C61C6F",
        "purple": "#595AB7",
        "blue": "#2176C7",
        "green": "#259286",
        "yellowgreen": "#738A05"
    };
//Set up the colour scale
var color = d3.scale.category20();

// adapt links to D3 format
data.links.forEach(function(el) {
    var sourceId = el.source;
    var targetId = el.target;
    var sourceNode = function(element){
        return element.id == sourceId
    };
    var targetNode = function(element){
        return element.id == targetId
    };
    el.source = data.nodes.findIndex(sourceNode);
    el.target = data.nodes.findIndex(targetNode);
});

var margin = {top: -5, right: -5, bottom: -5, left: -5},
    width = $graph.width(),// - margin.left - margin.right,
    height = $graph.height(docH * .8).height(); // - margin.top - margin.bottom;

//Set up the force layout
var force = d3.layout.force()
    .linkDistance(130)
    .gravity(.3)
    // .friction(.05)
    // .linkStrength(1)
    .charge(-1000)
    .size([width, height])
    .on("tick", tick);

var zoom = d3.behavior.zoom()
    .scaleExtent([0.2, 5])
    .on("zoom", zoomed);

var drag = force.drag()
    .on("dragstart", dragstart)
    // .on("drag", dragmove)
    .on("dragend", dragend);


//Append a SVG to the body of the html page. Assign this SVG as an object to svg
var svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height);
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom);
var g = svg.append("g");

    svg.call(zoom)
        .on("dblclick.zoom", null);

    resize();

//Creates the graph data structure out of the json data
force.nodes(data.nodes)
    .links(data.links)
    .start();

//Create all the line svgs but without locations yet
var link = g.selectAll(".link")
    .data(data.links)
    .enter().append("line")
    .attr("class", "link");

//Do the same with the circles for the nodes
var node = g.selectAll(".node")
    .data(data.nodes)
    .enter().append("g")
    .attr("class", function (d) {
        return "node";
    })
    // .on('click', onNodeClick)
    .on("dblclick", nodeDblclick)
    .on("contextmenu", nodeRightClick)
    .call(drag);

node.append("circle")
    .attr("r", circleWidth);
    // node.append("image")
    //     .attr("xlink:href", "https://github.com/favicon.ico")
    //     .attr("x", -8)
    //     .attr("y", -8)
    //     .attr("width", 16)
    //     .attr("height", 16);
node.append("text")
    .attr("dx", "-.3em")
    .attr("dy", ".3em")
    .text(function (d) {
        return d.name; // define label
    });

//Now we are giving the SVGs co-ordinates - the force layout
// is generating the co-ordinates which this code is using
// to update the attributes of the SVG elements
function tick() {
    link.attr("x1", function (d) {
        return d.source.x;
    })
        .attr("y1", function (d) {
            return d.source.y;
        })
        .attr("x2", function (d) {
            return d.target.x;
        })
        .attr("y2", function (d) {
            return d.target.y;
        });
    d3.selectAll("circle").attr("cx", function (d) {
        return d.x;
    })
        .attr("cy", function (d) {
            return d.y;
        });
    d3.selectAll("text").attr("x", function (d) {
        return d.x;
    })
        .attr("y", function (d) {
            return d.y;
        });
}

function zoomed() {
    // add drag and zoom to g
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

d3.select(window).on("resize", resize); //.on("keydown", keydown);

function resize() {
    var w = $graph.width(),
        h = $graph.height(docH * .8).height(),
        delW = w - width,
        delH = h - height;

    svg.attr("width", w).attr("height", h);
    force.size([
        force.size()[0] + delW / zoom.scale(),
        force.size()[1] + delH / zoom.scale()
    ]).resume();

    width = w;
    height = h;
}

function nodeDblclick(d) {
    d3.select(this).classed("fixed", d.fixed = false);
}

function dragstart(d) {
    d3.event.sourceEvent.stopPropagation();
}

function dragend(d) {
    // left click
    if (d3.event.sourceEvent.button == 0) {
        d3.event.sourceEvent.preventDefault();
        d3.select(this).classed("fixed", d.fixed = true);
    }
    // right click
    if (d3.event.sourceEvent.button == 2) {
        d3.event.sourceEvent.preventDefault();
        d3.select(this).classed("fixed", d.fixed = true);
        populateInfoCol(d);
        showDetails(true);
    }
}

function nodeRightClick(d, i) {
    d3.event.preventDefault();
}

$('body').click(function (e) {
    if (e.button == 0 &&
        e.target.nodeName != 'circle' && e.target.nodeName != 'g' &&
        e.target.nodeName != 'text' && e.target.nodeName != 'line' ) {
        showDetails(false);
    }
});

$details.click(function (e) {
    e.stopPropagation();
});

function populateInfoCol(d) {
    $details.find('#details-title').html(d.id);
}

function showDetails(show) {
    if (show) {
        $details.show();
    } else {
        $details.hide();
    }
}

function keydown() {
    if (d3.event.keyCode == 32) {
        force.stop();
    }
    else if (d3.event.keyCode >= 48 && d3.event.keyCode <= 90 && !d3.event.ctrlKey && !d3.event.altKey && !d3.event.metaKey) {
        switch (String.fromCharCode(d3.event.keyCode)) {
            case "C":
                keyc = !keyc;
                break;
            case "S":
                keys = !keys;
                break;
            case "T":
                keyt = !keyt;
                break;
            case "R":
                keyr = !keyr;
                break;
            case "X":
                keyx = !keyx;
                break;
            case "D":
                keyd = !keyd;
                break;
            case "L":
                keyl = !keyl;
                break;
            case "M":
                keym = !keym;
                break;
            case "H":
                keyh = !keyh;
                break;
            case "1":
                key1 = !key1;
                break;
            case "2":
                key2 = !key2;
                break;
            case "3":
                key3 = !key3;
                break;
            case "0":
                key0 = !key0;
                break;
        }

        link.style("display", function (d) {
            var flag = vis_by_type(d.source.type) && vis_by_type(d.target.type) && vis_by_node_score(d.source.score) && vis_by_node_score(d.target.score) && vis_by_link_score(d.score);
            linkedByIndex[d.source.index + "," + d.target.index] = flag;
            return flag ? "inline" : "none";
        });
        node.style("display", function (d) {
            return (key0 || hasConnections(d)) && vis_by_type(d.type) && vis_by_node_score(d.score) ? "inline" : "none";
        });
        text.style("display", function (d) {
            return (key0 || hasConnections(d)) && vis_by_type(d.type) && vis_by_node_score(d.score) ? "inline" : "none";
        });

        if (highlight_node !== null) {
            if ((key0 || hasConnections(highlight_node)) && vis_by_type(highlight_node.type) && vis_by_node_score(highlight_node.score)) {
                if (focus_node !== null) set_focus(focus_node);
                set_highlight(highlight_node);
            }
            else {
                exit_highlight();
            }
        }

    }
}
