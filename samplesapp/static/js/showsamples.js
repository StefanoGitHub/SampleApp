
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

var nodes = [
    {name: "Parent"},
    {name: "child1"},
    {name: "child2", target: [0]},
    {name: "child3", target: [0]},
    {name: "child4", target: [1]},
    {name: "child5", target: [0, 1, 2, 3]}
];

var links = [];
nodes.forEach(function(node, i) {
    if (node.target !== undefined) {
        node.target.forEach(function (tgt, x) {
            links.push({
                source: node,
                target: nodes[node.target[x]]
            });
        });
    }
});

// define drawing area
var myChart = d3.select('#graph')
    .append('svg')
    .attr('width', w)
    .attr('height', h);

// create graph layout
var force = d3.layout.force()
    .nodes(nodes)
    .links([])
    .gravity(.1)
    .linkDistance(150)
    .charge(-1000)
    .size([w, h]);

// create graph's links
var link = myChart.selectAll('line')
    .data(links).enter().append('line')
    .attr('stroke', palette.gray);

// create nodes
var node = myChart.selectAll('circle')
    .data(nodes).enter()
    .append('g')
    .call(force.drag);

// draw nodes
node.append('circle')
    .attr('cx', function (d) {
        return d.x;
    })
    .attr('cy', function (d) {
        return d.y;
    })
    .attr('r', circleWidth)
    .attr('fill', function (d, i) {
        if (i > 0) {
            return palette.pink;
        }
        return palette.blue;
    })
    .attr('stroke', palette.lightgray)
    .attr('stroke-width', 2);

// draw labels
node.append('text')
    .text(function (d) {
        return d.name;
    })
    .attr('font-family', 'Roboto Slab')
    .attr('fill', function (d, i) {
        if (i == 0) {
            return palette.yellowgreen;
        }
        return palette.mediumgray;
    })
    .attr('x', function (d, i) {
        if (i == 0) {
            return circleWidth * -2;
        }
        return circleWidth * 3/2;
    })
    .attr('y', function (d, i) {
        return circleWidth / 2;
    })
    .attr('text-anchor', function (d, i) {
        if (i == 0) {
            return 'end';
        }
        return 'beginning'
    })
    .attr('font-size', function (d, i) {
        if (i == 0) {
            return '1.8em';
        }
        return '1em'
    });

// define tick marks
force.on('tick', function (e) {
    // update nodes position
    node.attr('transform', function (d, i) {
        return 'translate(' + d.x + ', ' + d.y + ')';
    });
    // update links position
    link
        .attr('x1', function (d) {
            return d.source.x
        })
        .attr('y1', function (d) {
            return d.source.y
        })
        .attr('x2', function (d) {
            return d.target.x
        })
        .attr('y2', function (d) {
            return d.target.y
        });

    // var q = d3.geom.quadtree(nodes);
    //
    // nodes.forEach(function(n) {
    //     q.visit(collide(n));
    // });
});

// node.on('click', function (e) {
//     force.gravity(0)
//         .charge(0);
// });

// function collide(node) {
//     var r = node.radius + 16,
//         nx1 = node.x - r,
//         nx2 = node.x + r,
//         ny1 = node.y - r,
//         ny2 = node.y + r;
//     return function (quad, x1, y1, x2, y2) {
//         if (quad.point && (quad.point !== node)) {
//             var x = node.x - quad.point.x,
//                 y = node.y - quad.point.y,
//                 l = Math.sqrt(x * x + y * y),
//                 r = node.radius + quad.point.radius;
//             if (l < r) {
//                 l = (l - r) / l * .5;
//                 node.x -= x *= l;
//                 node.y -= y *= l;
//                 quad.point.x += x;
//                 quad.point.y += y;
//             }
//         }
//         return x1 > nx2
//             || x2 < nx1
//             || y1 > ny2
//             || y2 < ny1;
//     };
// }

force.start();

