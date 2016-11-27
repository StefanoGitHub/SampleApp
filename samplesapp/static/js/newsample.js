

$('.input-group.date').datepicker({
    calendarWeeks: true,
    todayHighlight: true,
    beforeShowDay: function (date) {
        if (date.getMonth() == (new Date()).getMonth())
            switch (date.getDate()) {
                case 4:
                    return {
                        tooltip: 'Example tooltip',
                        classes: 'active'
                    };
                case 8:
                    return false;
                case 12:
                    return "green";
            }
    },
    beforeShowMonth: function (date) {
        if (date.getMonth() == 8) {
            return false;
        }
    },
    datesDisabled: ['11/06/2016', '11/21/2016'],
    toggleActive: true,
    defaultViewDate: {year: 2016, month: 11, day: 25}
});


