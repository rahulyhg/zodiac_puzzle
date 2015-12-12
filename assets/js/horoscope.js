function Horoscope(options){
    var defaults = {
        radius: 20,
        lineWidth: 0,
        canvasId: 'zodiac-canvas'
    };

    this.opts = $.extend({}, defaults, options);
    this.data = {
        economic: {},
        demographic: {}
    };
    this.id = this.getUrlParameter('id');
    this.init();
}

Horoscope.prototype = {
    constructor: Horoscope,
    init: function () {
        this.hideOverlayLoading();
        this.initLoading();
        this.initPlanet();
        this.initListeners();
    },
    initListeners: function () {
        var that = this;
        $('#menu')
            .on('click', '.btn-characteristics', function(e){
                e.preventDefault();
                that.showCharacteristics(that.id);
            }).
            on('click', '.btn-feed', function(e){
                e.preventDefault();
                that.showFeed(that.id, $(this).data('type'));
            });
        $('.panel').on('click', '.close', function (e) {
            e.preventDefault();
            $('.panel').fadeOut('fast');
        });
    },
    isDirty: function(){
        if($('.planet-over').length > 0 && $('.planet').length !== 0 && $('.planet').length < 5){
            var $confirmWin = $('.confirm-window');
            $confirmWin.fadeIn();
            return true;
        }
        return false;
    },
    initNav: function(data){
        //var id = this.getUrlParameter('id');
        $('#nav').html(template('tpl-nav', {data: data, id: this.id}));
    },
    initZodiacTitle: function(data){
        $('#zodiac-title').html(template('tpl-zodiac-title', {data: data}));
    },
    getUrlParameter: function(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    },
    initLoading: function() {
        NProgress.configure({ showSpinner: false });
        NProgress.configure({ minimum: 0.1 });
        $(document)
            .ajaxStart(function() {
                NProgress.start();
            })
            .ajaxComplete(function(event, request, settings) {
                NProgress.done();
            });
    },
    hideOverlayLoading: function(){
        //hide preloading layer
        $('#preload').imagesLoaded( function() {
            $(".preloader").delay(200).fadeOut('slow');
        });
    },
    initPlanet: function(){
        var that = this;
        var canvas = document.getElementById(that.opts.canvasId);
        var ctx = canvas.getContext('2d');
        var planetRadius = 40;
        var planetImgNum = 5;
        var errorMargin = 10;
        var id = that.getUrlParameter('id');
        // get window dimentions
        var canvasWidth = 800;
        var canvasHeight = 600;
        var ww = $(window).width();
        var wh = $(window).height();
        var offsetX = (ww - canvasWidth)/2;
        var offsetY = (wh - canvasHeight)/2;

        //setting the zodiac meaning bg
        $('#zodiac-meaning').addClass('zodiac-' + id);

        $.getJSON('data/horoscope.json', function(resp) {
            var zodiacData = {};

            $.each(resp, function(key, item){
                if(item.name.toLowerCase() === id){
                    zodiacData = item;
                }
            });
            var points = zodiacData.points;
            var lines = zodiacData.lines;
            var planetStr = '';
            var framePlanetStr = '';
            that.lines = lines;
            that.points = points;
            that.initNav(resp);
            that.initZodiacTitle(zodiacData);

            $.each(lines, function (i, line) {
                var startIndex = line.start;
                var endIndex = line.end;
                var start = that.getCircleCenter(points[startIndex].x, points[startIndex].y);
                var end = that.getCircleCenter(points[endIndex].x, points[endIndex].y);

                ctx.setLineDash([5, 15]);

                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();

                ctx.strokeStyle = '#768090';
                ctx.stroke();
            });

            var pointLength = points.length;
            $.each(points, function (index, value) {
                if(pointLength > 5 && index < pointLength - 5){
                    var posx = value.x + offsetX - 20;
                    var posy = value.y + offsetY - 20;
                    framePlanetStr += '<div class="frame-planet over" style="left: ' + (value.x - errorMargin) + 'px; top: ' + (value.y - errorMargin) + 'px;"></div>';
                    planetStr += '<div class="planet-over" style="left: ' + posx + 'px; top: ' + posy + 'px"></div>';
                }else{
                    //random position other planets on the screen
                    var randomLocation = getRandomLocation();
                    var posx = randomLocation.posx;
                    var posy = randomLocation.posy;
                    var currentImgNum = index % planetImgNum;
                    framePlanetStr += '<div class="frame-planet" style="left: ' + (value.x - errorMargin) + 'px; top: ' + (value.y - errorMargin) + 'px;"></div>';
                    planetStr += '<div class="planet planet_' + currentImgNum + '" style="left: ' + posx + 'px; top: ' + posy + 'px"></div>';
                }

            });


            $('#frame-planets').html(framePlanetStr);
            $('#planets').html(planetStr);

            //that.activeLines()
        });


        function getRandomLocation(){
            var posx = Math.round(Math.random() * ww);
            var posy = Math.round(Math.random() * wh);

            //cannot locate in the center of the screen
            //var centerRange = 400;
            //var centerRange = 400;
            var marginRange = 200;
            //if(posx < ww/2 - centerRange/2 || posx > ww/2 + centerRange/2){
            if(posx > marginRange && posx < ww - marginRange && posy > marginRange && posy < wh - marginRange){
                //can't locate outside of the screen
                /*if(posx + planetRadius * 2 > ww || posy + planetRadius * 2 > wh){
                    return getRandomLocation();
                }else if(posx < 160 && posy < 160){
                    return getRandomLocation();
                }else{
                    return {
                        posx: posx,
                        posy: posy
                    }
                }*/
                return {
                    posx: posx,
                    posy: posy
                }
            }else{
                return getRandomLocation();
            }
        }
    },
    getCircleCenter: function(x, y, radius, lineWidth){
        var that = this;
        var radius = radius || that.opts.radius;
        var lineWidth = lineWidth || that.opts.lineWidth;
        return {
            x: parseInt(x) + radius + lineWidth,
            y: parseInt(y) + radius + lineWidth
        }
    },
    showMenu: function(){
    },
    showFeed: function(id, type){
        var url = 'lib/getFeed.php';
        var words = {
            'today': 'daily',
            'week': 'weekly',
            'month': 'monthly'
        };

        $.getJSON(url, {id: id, type: type}, function(resp){
            $('.panel').hide();
            $('#panel-detail .panel-cnt').html(template('tpl-detail-content', {data: JSON.parse(resp), word: words[type]}));
            $('#panel-detail').fadeIn();
        });
    },
    showDailyFeed: function(id){
        var url = 'lib/getDailyFeed.php';
        $.getJSON(url, {id: id}, function(resp){
            $('#panel-detail .panel-cnt').html(template('tpl-detail-content', {data: JSON.parse(resp)}));
            $('#panel-detail').fadeIn();
        });
    },
    showCharacteristics: function(id){
        var url = 'data/characteristics.json';
        var data = {};
        $.getJSON(url, function(resp){
            $.each(resp, function(key, item){
                if(item.sunsign.toLowerCase() == id){
                    data = item;
                }
            });
            $('.panel').hide();
            $('#panel-characteristics .panel-cnt').html(template('tpl-characteristics', {data: data}));
            $('#panel-characteristics').fadeIn();
        });
    },
    activeLines: function(){
        var that = this;
        var canvas = document.getElementById(that.opts.canvasId);
        var ctx = canvas.getContext('2d');
        var lines = that.lines;
        var points = that.points;
        ctx.strokeStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.lineWidth = 1;
        ctx.setLineDash([0,0]);
        $.each(lines, function (i, line) {
            var startIndex = line.start;
            var endIndex = line.end;
            var start = that.getCircleCenter(points[startIndex].x, points[startIndex].y);
            var end = that.getCircleCenter(points[endIndex].x, points[endIndex].y);

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        });
    }
};