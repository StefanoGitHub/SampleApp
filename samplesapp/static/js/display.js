//adapt graph area to page
var $graph = $('#graph'),
    docH = $(document).height(),
    width = $graph.width(),
    height = $graph.height(docH * .8).height(),
    circleWidth = 10,
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
    // .charge(-120)
    .linkDistance(100)
    // .gravity(.5)
    .charge(-150)

    .size([width, height]);

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
    .attr("class", "link")
    .style("stroke-width", function (d) {
        return Math.sqrt(d.value);
    });

//Do the same with the circles for the nodes - no
var node = svg.selectAll(".node")
    .data(data.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", circleWidth)
    .style("fill", function (d) {
        return color(d.group);
    })
    .call(force.drag);


// Now we are giving the SVGs co-ordinates - the force layout
// is generating the co-ordinates which this code is using
// to update the attributes of the SVG elements
force.on("tick", function () {
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

    node.attr("cx", function (d) {
        return d.x;
    })
        .attr("cy", function (d) {
            return d.y;
        });
});