var $graph = $('#graph'),
    docH = $(document).height(),
    w = $graph.width(),
    h = $graph.height(docH * .7).height(),
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

var dataNodes = data.nodes;
var dataLinks = data.links;

// define drawing area
var myChart = d3.select('#graph')
    .append('svg')
    .attr('width', w)
    .attr('height', h);

var svg = d3.select("#graph").append("svg")
    .attr("width", w).attr("height", h);

var force = d3.layout.force()
    .charge(-200).linkDistance(30).size([w, h]);
// create graph layout
// var force = d3.layout.force()
//     .nodes(dataNodes)
//     .links(dataLinks)
//     .gravity(.1)
//     .linkDistance(150)
//     .charge(-1000)
//     .size([w, h]);

// create graph's links
// var link = myChart.selectAll('line')
//     .data(dataLinks).enter().append('line')
//     .attr('stroke', palette.gray);
//
// // create nodes
// var node = myChart.selectAll('circle')
//     .data(dataNodes).enter()
//     .append('g')
//     .call(force.drag);

force.nodes(data.nodes).links(data.links).start();
var link = svg.selectAll(".link")
    .data(data.links).enter()
    .append("line").attr("class", "link");
var node = svg.selectAll(".node")
    .data(data.nodes).enter()
    .append("circle")
    .attr("class", function (d) {
        return "node " + d.label
    })
    .attr("r", 10)
    .call(force.drag);
// html title attribute
node.append("title")
    .text(function (d) {
        return d.title;
    })
// force feed algo ticks
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


// draw nodes
// node.append('circle')
//     .attr('cx', function (d) {
//         return d.x;
//     })
//     .attr('cy', function (d) {
//         return d.y;
//     })
//     .attr('r', circleWidth)
//     .attr('fill', function (d, i) {
//         if (i > 0) {
//             return palette.pink;
//         }
//         return palette.blue;
//     })
//     .attr('stroke', palette.lightgray)
//     .attr('stroke-width', 2);

// draw labels
// node.append('text')
//     .text(function (d) {
//         return d.name;
//     })
//     .attr('font-family', 'Roboto Slab')
//     .attr('fill', function (d, i) {
//         if (i == 0) {
//             return palette.yellowgreen;
//         }
//         return palette.mediumgray;
//     })
//     .attr('x', function (d, i) {
//         if (i == 0) {
//             return circleWidth * -2;
//         }
//         return circleWidth * 3 / 2;
//     })
//     .attr('y', function (d, i) {
//         return circleWidth / 2;
//     })
//     .attr('text-anchor', function (d, i) {
//         if (i == 0) {
//             return 'end';
//         }
//         return 'beginning'
//     })
//     .attr('font-size', function (d, i) {
//         if (i == 0) {
//             return '1.8em';
//         }
//         return '1em'
//     });

// define tick marks
// force.on('tick', function (e) {
//     debugger;
//     // update nodes position
//     nodes.attr('transform', function (d, i) {
//         debugger;
//         return 'translate(' + d.x + ', ' + d.y + ')';
//     });
//     // update links position
//     links
//         .attr('x1', function (d) {
//             debugger;
//             return d.source.x
//         })
//         .attr('y1', function (d) {
//             debugger;
//             return d.source.y
//         })
//         .attr('x2', function (d) {
//             debugger;
//             return d.target.x
//         })
//         .attr('y2', function (d) {
//             debugger;
//             return d.target.y
//         });
//
// });


force.start();

