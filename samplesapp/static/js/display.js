//adapt graph area to page
var $graph = $('#graph'),
    docH = $(document).height(),
    width = $graph.width(),
    height = $graph.height(docH * .8).height(),
    circleWidth = 20,
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


//Set up the force layout
var force = d3.layout.force()
    .linkDistance(100)
    // .gravity(.1)
    .charge(-400)
    .size([width, height])
    .on("tick", tick);

var drag = force.drag()
    .on("dragstart", dragstart);
    // .on("drag", dragmove)
    // .on("dragend", dragend);


//Append a SVG to the body of the html page. Assign this SVG as an object to svg
var svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height);

//Creates the graph data structure out of the json data
force.nodes(data.nodes)
    .links(data.links)
    .start();

//Create all the line svgs but without locations yet
var link = svg.selectAll(".link")
    .data(data.links)
    .enter().append("line")
    .attr("class", "link");

//Do the same with the circles for the nodes
var node = svg.selectAll(".node")
    .data(data.nodes)
    .enter().append("g")
    .attr("class", function (d) {
        return "node";
    })
    .on('click', onNodeClick)
    .on("dblclick", dblclick)
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

// $('body').on('click', resetNodes);

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

function dblclick(d) {
    d3.select(this).classed("fixed", d.fixed = false);
}

function dragstart(d) {

    // only left click
    if (d3.event.sourceEvent.button == 0) {
        // debugger;
        d3.select(this).classed("fixed", d.fixed = true);
    }
    // right click
    // if (d3.event.sourceEvent.button == 2) {
    //     //debugger
    //     d3.event.sourceEvent.preventDefault();
    //     // d3.select(this).classed("fixed", d.fixed = false);
    //     force.resume();
    // }
    // d3.event.sourceEvent
    // $('.msg').html('Double-click on the p[inned node to realise it').show(500);
    // setTimeout(function () {
    //     $('.msg').hide(1000).html('');
    // }, 4000);
}


function onNodeClick() {

}

/*
 * Attach a context menu to a D3 element
 */

var contextMenuShowing = false;

d3.select("body").on('contextmenu', function (d, i) {
    if (contextMenuShowing) {
        d3.event.preventDefault();
        d3.select(".popup").remove();
        contextMenuShowing = false;
    } else {
        if (d3.event.target.tagName == 'circle' ||
            d3.event.target.tagName == 'text' ||
            d3.event.target.tagName == 'g'
        ) {
            d3.event.preventDefault();
            contextMenuShowing = true;
            debugger
            // var d = d3.select(d3.event.target).datum();

            // Build the popup
            var graph = d3.select("#graph");
            var mousePosition = d3.mouse(graph.node());

            var popup = graph.append("div")
                .attr("class", "popup")
                .style("left", mousePosition[0] + "px")
                .style("top", mousePosition[1] + "px");
            popup.append("h2").text(d.name);
            // popup.append("p").text(
            //     "The " + d.display_division + " division (wearing " + d.display_color + " uniforms) had " + d.casualties + " casualties during the show's original run.");
            // popup.append("p")
            //     .append("a")
            //     .attr("href", d.link)
            //     .text(d.link_text);

            var canvasSize = [
                graph.node().offsetWidth,
                graph.node().offsetHeight
            ];

            var popupSize = [
                popup.node().offsetWidth,
                popup.node().offsetHeight
            ];

            if (popupSize[0] + mousePosition[0] > canvasSize[0]) {
                popup.style("left", "auto");
                popup.style("right", 0);
            }

            if (popupSize[1] + mousePosition[1] > canvasSize[1]) {
                popup.style("top", "auto");
                popup.style("bottom", 0);
            }
        }
    }
});

