from flask_assets import Bundle

common_css = Bundle(
    'vendor/bootstrap/css/bootstrap.css',
    # Bundle(
    #     'css/layout.less',
    #     filters = 'less'
    # ),
    'css/layout.css',
    filters = 'cssmin',
    output = 'public/css/common.css')

newsample_js = Bundle(
    'vendor/jquery/jquery-1.7.2.min.js',
    'vendor/bootstrap/js/bootstrap.min.js',
    Bundle(
        'js/newsample.js',
        filters = 'uglifyjs'
    ),
    output = 'public/js/common.js')