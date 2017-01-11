

var fieldTpl = function(name, unit, id) {
    return '<div class="field ' + id + '" data-value="'+name+'">' +
            '<button class="btn btn-default btn-xs remove-' + id + '">' +
                '<i class="fa fa-minus"></i>' +
            '</button>' +
            '<div class="input-group input-group-sm">' +
                '<input class="form-control" placeholder="'+ name +'" id="yieldNano">' +
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
var $addFieldBtn = $('#add-field-btn');
var $fields = $('.fields');
var $filterSelect = $('#filter-select');

$addFieldBtn.on('click', function (e) {
    var name = $filterSelect.val();

    if (!name) {
        return;
    }
    var unit = $filterSelect.find('option:selected').data('unit');
    // disable selected option
    $filterSelect.find('option:selected').attr('disabled', 'disabled');

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
        $filterSelect.find('option[value="'+ value+'"]').removeAttr('disabled');
        fields -= 1;
        if (fields == 0) {
            $filterBtn.hide();
        }
    });

    $filterSelect.val('');
    $filterBtn.show();

});

$filterBtn.on('click', function (e) {
    // get fields

    // store fields

    // if fields modified call ajax
    console.log('FILTER!');
});


