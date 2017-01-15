// very useful doc
// https://leanpub.com/D3-Tips-and-Tricks/read#leanpub-auto-transform-translatexy-scalek-rotatea


//adapt graph area to page
var $graph = $('#graph'),
    docH = $(document).height(),
    radius = 20,
    iconSide = 30,
    $details = $('#details-modal'),
    $pdfBtn = $('#pdf-btn'),
    $txtBtn = $('#txt-btn'),
    $tooltip = $('#tooltip'),
    // D3 colour scale
    color = d3.scale.category20(),
    // margin = {top: -5, right: -5, bottom: -5, left: -5},
    svgWidth = $graph.width(),
    svgHeight = $graph.height(docH * .8).height(),
    svgOffset = $graph.offset()
;


// -----------------------------
// adapt links data to D3 format
// -----------------------------
data.links.forEach(function (el) {
    var sourceId = el.source;
    var targetId = el.target;
    var sourceNode = function (element) {
        return element.id == sourceId
    };
    var targetNode = function (element) {
        return element.id == targetId
    };
    el.source = data.nodes.findIndex(sourceNode);
    el.target = data.nodes.findIndex(targetNode);
});


// ---------------------------------
// set up D3 force layout components
// ---------------------------------
var force = d3.layout.force()
    .linkDistance(130)
    .gravity(.2)
    // .friction(.05)
    // .linkStrength(1)
    .charge(-1000)
    .size([svgWidth, svgHeight])
    .on('tick', tick);

var zoom = d3.behavior.zoom()
    .scaleExtent([0.2, 5])
    .on('zoom', zoomed);

var drag = force.drag()
    .on('dragstart', dragstart)
    // .on('drag', dragmove)
    .on('dragend', dragend);


// ---------------------------------------
// draw graph's components
// the order in which are added does count
// ---------------------------------------

// append a SVG to #graph of the html page
var svg = d3.select('#graph').append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);
    svg.call(zoom)
    .on('dblclick.zoom', null);

// create arrow head
svg.append('marker')
    .attr({
        'id': 'arrow',
        'class': 'arrow',
        'viewBox': '-0 -5 10 10',
        'refX': 30,
        'refY': 0,
        'orient': 'auto',
        'markerWidth': 10,
        'markerHeight': 10,
        'xoverflow': 'visible'
    })
    .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        // Force style as CSS doesn't work
        .attr('fill', 'darkgrey')
        .attr('stroke', 'darkgrey');

// create a g(roup) tag container for each node
var g = svg.append('g');

// add link lines
var link = g.selectAll('.link')
    .data(data.links)
    .enter().append('g')
    .attr('class', 'link')
    .append('line')
    .attr('class', 'link-line')
    .attr('marker-end', 'url(#arrow)'); // append arrow head

var linkLable = g.selectAll('.link')
    .append('text')
    .attr('class', 'link-label')
    .attr('dy', '-.2em')
    .attr('text-anchor', 'middle')
    .text(function (d) { return d.type; });


// create nodes
var node = g.selectAll('.node')
    .data(data.nodes)
    .enter().append('g')
    .attr('class', 'node' );

// add circles
var circle = node.append('circle')
    .attr('r', radius);

// add labels
var nodeLabel = node.append('text')
    .attr('class', 'node-label')
    .text(function (d) { return d.name; });

var image = node.append('image')
    .attr('xlink:href', iconLink)
    .attr('width', iconSide)
    .attr('height', iconSide);


var mouseDown = false;

node.on('dblclick', nodeDblclick)
    // .on('click', onNodeClick)
    .on('contextmenu', nodeRightClick)
    // track mouse button
    // mainly to avoid wrong behaviour on mouseover/out
    .on('mousedown', function (d, i) { mouseDown = true; })
    .on('mouseup', function (d, i) { mouseDown = false; })
    .on('mouseover', function (d, i) {
        if (!mouseDown) {
            // debugger;
            d3.select(this).classed('fixed', d.fixed = true);
            d3.select(this).selectAll('circle')
                .transition()
                .duration(50)
                .attr('r', radius + 5);
        }
    })
    .on('mouseout', function (d, i) {
        if (!d.selected && !mouseDown) {
            d3.select(this).classed('fixed', d.fixed = false);
            d3.select(this).selectAll('circle')
                .transition()
                .duration(50)
                .attr('r', radius);
        }
    })
    .call(drag);


//Creates the graph data structure out of the json data
force.nodes(data.nodes)
    .links(data.links)
    .start();


// RESIZE FUNCTIONS
// ----------------
$(window).on('resize', resize); //.on('keydown', keydown);
resize();


//
function tick() {
    circle.attr('cx', function (d) { return d.x ; })
        .attr('cy', function (d) { return d.y ; });

    nodeLabel.attr('x', function (d) { return d.x + radius })
        .attr('y', function (d) { return d.y });

    image.attr('x', function (d) { return d.x  - iconSide / 2; })
        .attr('y', function (d) { return d.y - iconSide / 2; });

    // link at last so their position is bound to circles
    link.attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; });

    linkLable
        .attr('transform', function (d) {
            var a = d.source.x - d.target.x;
            var b = d.source.y - d.target.y;
            var alpha = Math.atan(b/a) * (180 / Math.PI);
            var midX = (d.source.x + d.target.x) / 2;
            var midY = (d.source.y + d.target.y) / 2;
            return 'translate(' + midX + ',' + midY + ') rotate(' + alpha + ')';
        });
}

// curved links
// ------------
// http://bl.ocks.org/mfolnovic/6269308/086c505caa848750ab9916bd48906b4057e6f288
// function arcPath(leftHand, d) {
//     var start = leftHand ? d.source : d.target,
//         end = leftHand ? d.target : d.source,
//         dx = end.x - start.x,
//         dy = end.y - start.y,
//         dr = Math.sqrt(dx * dx + dy * dy),
//         sweep = leftHand ? 0 : 1;
//     return 'M' + start.x + ',' + start.y + 'A' + dr + ',' + dr + ' 0 0,' + sweep + ' ' + end.x + ',' + end.y;
// }

function zoomed() {
    // todo integrate tooltip with zoom
    g.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    var id = $tooltip.find('#add-sample-btn').data('sampleid');
    if (id) {
        var t = d3.select(this);
        debugger;
        positionTooltip(d)
    }
}



// NODES METHODS
// -------------
function nodeDblclick(d) {
    d3.select(this).classed('fixed', d.fixed = false);
    d3.select(this).classed('selected', d.selected = false);
    d3.select(this).selectAll('circle')
        .attr('r', radius);
    if (noNodeSelected()) {
        $pdfBtn.addClass('disabled');
        $txtBtn.addClass('disabled');
    }
    hideTooltip();
    force.resume();
}

function nodeRightClick(d, i) {
    d3.event.preventDefault();
}


// DRAGS METHODS
// -------------
function dragstart(d) {
    d3.event.sourceEvent.stopPropagation();
}

function dragend(d) {
    d3.select(this).classed('fixed', d.fixed = true);
    d3.select(this).classed('selected', d.selected = true);
    d3.select(this).selectAll('circle')
        .attr('r', radius + 5);
    // left click
    if (d3.event.sourceEvent.button == 0) {
        d3.event.sourceEvent.preventDefault();
        // d3.select(this).classed('fixed', d.fixed = true);
        // d3.select(this).classed('selected', d.selected = true);
        // d3.select(this).selectAll('circle')
        //     .attr('r', radius + 5);

        $pdfBtn.removeClass('disabled');
        $txtBtn.removeClass('disabled');
    }
    // right click
    if (d3.event.sourceEvent.button == 2) {
        d3.event.sourceEvent.preventDefault();
        populateDetails(d);
        showTooltip(d);
    }
}


// TOOLTIP
// -------
// hide tooltip when clicking anywhere but a graph component
$('body').click(function (e) {
    if (e.button == 0 &&
        (e.target.nodeName == 'svg' || e.target.parentElement.className == 'page')) {
        hideTooltip();
    }
});
$tooltip.find('#details-btn').on('click', function (e) {
    $details.modal('show');
});
$tooltip.find('#add-sample-btn').on('click', function (e) {
    var id = $(e.target).data('sampleid');
    var url = '//' + window.location.host + '/add?id=' + id;
    window.open(url);
});
$tooltip.find('#lineage-btn').on('click', function (e) {
// todo implement behaviour
});

function showTooltip(d) {
    $tooltip.find('#add-sample-btn').data('sampleid', d.id);
    positionTooltip(d);
    $tooltip.show();
}
function positionTooltip(d){
    var deltaX = $tooltip.width() / 2 - svgOffset.left;
    var deltaY = $tooltip.height() - svgOffset.top + 15;
    $tooltip.css('top', (d.y - deltaY) + 'px');
    $tooltip.css('left', (d.x - deltaX) + 'px');
}

function hideTooltip() {
    $tooltip.hide();
}

function populateDetails(d) {
    // todo complete details
    $details.find('#details-title').html(d.id);
}



// UTILITIES
// ---------

function noNodeSelected() {
    for (var i = 0; i < data.nodes.length; i++) {
        if (data.nodes[i].fixed) {
            return false;
        }
    }
    return true;
}


// inspired by: http://bl.ocks.org/eyaler/10586116
function keydown() {
    // if (d3.event.keyCode == 32) {
    //     force.stop();
    // }
    // else if (d3.event.keyCode >= 48 && d3.event.keyCode <= 90 && !d3.event.ctrlKey && !d3.event.altKey && !d3.event.metaKey) {
    //     switch (String.fromCharCode(d3.event.keyCode)) {
    //         case 'C':
    //             keyc = !keyc;
    //             break;
    //         case 'S':
    //             keys = !keys;
    //             break;
    //         case 'T':
    //             keyt = !keyt;
    //             break;
    //         case 'R':
    //             keyr = !keyr;
    //             break;
    //         case 'X':
    //             keyx = !keyx;
    //             break;
    //         case 'D':
    //             keyd = !keyd;
    //             break;
    //         case 'L':
    //             keyl = !keyl;
    //             break;
    //         case 'M':
    //             keym = !keym;
    //             break;
    //         case 'H':
    //             keyh = !keyh;
    //             break;
    //         case '1':
    //             key1 = !key1;
    //             break;
    //         case '2':
    //             key2 = !key2;
    //             break;
    //         case '3':
    //             key3 = !key3;
    //             break;
    //         case '0':
    //             key0 = !key0;
    //             break;
    //     }
    //
    //     link.style('display', function (d) {
    //         var flag = vis_by_type(d.source.type) && vis_by_type(d.target.type) && vis_by_node_score(d.source.score) && vis_by_node_score(d.target.score) && vis_by_link_score(d.score);
    //         linkedByIndex[d.source.index + ',' + d.target.index] = flag;
    //         return flag ? 'inline' : 'none';
    //     });
    //     node.style('display', function (d) {
    //         return (key0 || hasConnections(d)) && vis_by_type(d.type) && vis_by_node_score(d.score) ? 'inline' : 'none';
    //     });
    //     text.style('display', function (d) {
    //         return (key0 || hasConnections(d)) && vis_by_type(d.type) && vis_by_node_score(d.score) ? 'inline' : 'none';
    //     });
    //
    //     if (highlight_node !== null) {
    //         if ((key0 || hasConnections(highlight_node)) && vis_by_type(highlight_node.type) && vis_by_node_score(highlight_node.score)) {
    //             if (focus_node !== null) set_focus(focus_node);
    //             set_highlight(highlight_node);
    //         }
    //         else {
    //             exit_highlight();
    //         }
    //     }
    //
    // }
}

function resize() {
    var w = $graph.width(),
        h = $graph.height(docH * .8).height(),
        delW = w - svgWidth,
        delH = h - svgHeight;

    svg.attr('width', w).attr('height', h);
    force.size([
        force.size()[0] + delW / zoom.scale(),
        force.size()[1] + delH / zoom.scale()
    ]).resume();

    svgWidth = w;
    svgHeight = h;
}

// var mousemoved = false;
// $graph.on('mousedown', function (e) {
//         mousemoved = false;
//     })
//     .on('mousemove', function (e) {
//         mousemoved = true;
//     })
//     .on('mouseup', function (e) {
//         if (mousemoved === false) {
//             // click
//             if (e.button == 0 && // right button
//                 e.target.nodeName != 'circle' && e.target.nodeName != 'g' &&
//                 e.target.nodeName != 'text' && e.target.nodeName != 'line') {
//                 // showDetails(false);
//             }
//         } else {
//             // drag
//         }
//         mousemoved = false;
//     });

// palette = {
//     'lightgray': '#819090',
//     'gray': '#708284',
//     'mediumgray': '#536870',
//     'darkgray': '#475B62',
//     'darkblue': '#0A2933',
//     'darkerblue': '#042029',
//     'paleryellow': '#FCF4DC',
//     'paleyellow': '#EAE3CB',
//     'yellow': '#A57706',
//     'orange': '#BD3613',
//     'red': '#D11C24',
//     'pink': '#C61C6F',
//     'purple': '#595AB7',
//     'blue': '#2176C7',
//     'green': '#259286',
//     'yellowgreen': '#738A05'
// };

