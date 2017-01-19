
// templates
// ---------
var fieldTpl = function(name, unit, id) {
    return '<div class="field ' + id + '" data-value="'+name+'">' +
            '<button class="btn btn-default btn-xs remove-' + id + '">' +
                '<i class="fa fa-minus"></i>' +
            '</button>' +
            '<div class="input-group input-group-sm">' +
                '<input class="form-control" placeholder="'+ name +'..." id="yieldNano">' +
                '<span class="input-group-addon">' + unit + '</span>' +
            '</div>' +
        '</div>';
};

var fieldTplNoUnit = function(name, id) {
    return '<div class="field ' + id + '" data-value="' + name + '">' +
            '<button class="btn btn-default btn-xs remove-' + id + '">' +
                '<i class="fa fa-minus"></i>' +
            '</button>' +
            '<div class="form-group no-unit">' +
                '<input class="form-control" placeholder="' + name + '..." id="yieldNano">' +
            '</div>' +
        '</div>';
};

var fields = 0;
var $filterBtn = $('#filter-btn');
var $fields = $('.fields');
var $filterSelect = $('#filter-select');
var $removeBtn = $('#remove-fields-btn');

$filterSelect.on('change', function (e) {
    var name = $filterSelect.val();
    if (!name) { return; }

    var unit = $filterSelect.find('option:selected').data('unit');
    // disable selected option
    $filterSelect.find('option:selected').prop('disabled', true);
    $filterSelect.selectpicker('refresh');

    fields += 1;
    var id = 'f' + fields;

    if (unit) {
        $fields.append(fieldTpl(name, unit, id));
    } else {
        $fields.append(fieldTplNoUnit(name, id));
    }

    // add event listener to the new field
    $fields.find('.remove-' + id).on('click', function () {
        var $target = $('.field.' + id);
        var value = $target.data('value');
        $target.remove();
        $filterSelect.find('option[value="'+ value+'"]').prop('disabled', false);
        $filterSelect.selectpicker('refresh');
        fields -= 1;
        if (fields == 0) {
            $filterBtn.hide();
            $removeBtn.prop('disabled', true);
        }
    });

    $removeBtn.prop('disabled', false);
    $filterSelect.val('');
    $filterBtn.show();
});

$removeBtn.on('click', function (e) {
    $fields.find('.field').remove();
    $filterSelect.find('option').prop('disabled', false);
    $filterSelect.selectpicker('refresh');
    $filterBtn.hide();
    fields = 0;
    $removeBtn.prop('disabled', true);
});

$filterBtn.on('click', function (e) {
    // get fields

    // store fields

    // if fields modified call ajax
    console.log('FILTER!');
});


