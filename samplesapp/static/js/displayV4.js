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

// set drawing area
var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var attractForce = d3.forceManyBody().strength(150).distanceMax(400).distanceMin(100);
var repelForce = d3.forceManyBody().strength(-150).distanceMax(500).distanceMin(100);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
        return d.id;
    }))
    .alphaDecay(.1)
    .force("attractForce", attractForce)
    .force("repelForce", repelForce)
    .force("charge", d3.forceManyBody(1))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("y", d3.forceY(0))
    .force("x", d3.forceX(0))
    .force("collide", d3.forceCollide(4));


var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(data.links)
    .enter().append("line");

var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(data.nodes)
    .enter().append("circle")
    .attr("r", circleWidth)
    .attr("fill", function (d) {
        return color(d.group);
    })
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged));
// .on("end", dragended));

node.append("label")
    .text(function (d) {
        debugger;
        return d.id;
    })
    .attr('x', function (d, i) {
        if (i == 0) {
            return circleWidth * -2;
        }
        return circleWidth * 3 / 2;
    })
    .attr('y', function (d, i) {
        return circleWidth / 2;
    });

simulation
    .nodes(data.nodes)
    .on("tick", ticked);

simulation.force("link")
    .links(data.links);


function ticked() {
    link
        .attr("x1", function (d) {
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

    node
        .attr("cx", function (d) {
            return d.x;
        })
        .attr("cy", function (d) {
            return d.y;
        });
}
//        });

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}
//
function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    debugger
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}