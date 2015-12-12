$(function(){
    var radius = 20;
    var planetRadius = 40;
    var canvasWidth = 800;
    var canvasHeight = 600;
    var ww = $(window).width();
    var wh = $(window).height();
    var offsetX = (ww - canvasWidth)/2;
    var offsetY = (wh - canvasHeight)/2;
    var horoscope = new Horoscope();
    var id = horoscope.getUrlParameter('id');

    var LeapMouse = function() {

        this.config = {
            cursorSize: 20,
            mainColor: 'white',
            activeColor: 'red',
            normalCursor: 'assets/img/cursor/spread.png',
            dragCursor: 'assets/img/cursor/drag.png',
            scrollSpeed: 16,
            grabThreshold: 0.5,
            pinchThreshold: 0.5
        };

        this.updatePosition = function(left, top) {
            this.elm.style.left = left + 'px';
            this.elm.style.top = top + 'px';
        };


        this.activeEffect = function() {
            //this.elm.style.backgroundColor = this.config.activeColor;
            this.elm.style.backgroundImage = 'url(' + this.config.dragCursor + ')';

            var setToNormal = function() {
                //this.elm.style.backgroundColor = this.config.mainColor;
                $(this.elm).css({background: 'url(' + this.config.normalCursor + ') center no-repeat', backgroundSize: this.config.cursorSize + 'px'});
            };
            setTimeout(setToNormal.bind(this), 500);
        };

        this.lastDraggedTime = 0;
        this.lastReleasedTime = 0;
        this.$target = null;
        this.$currentFramePlanet = null;
        this.isEnd = false; //avoid activating multiple times after finishing
        this.isDetailShown = false;
        this.hoverDuration = {};
        this.lastHoverTime = 0;

        var loopHandler = function(frame) {
            var hand = frame.hands[0];

            if (!hand) {
                this.updatePosition(-this.config.cursorSize, -this.config.cursorSize);
                return;
            }

            var normalizedPoint = frame.interactionBox.normalizePoint(hand.palmPosition);
            var leftNormalized = Math.min(Math.max(normalizedPoint[0], 0), 1);
            var topNormalized = 1 - Math.min(Math.max(normalizedPoint[1], 0), 1);

            var left = leftNormalized * (window.document.documentElement.clientWidth - this.config.cursorSize);
            var top = topNormalized * (window.document.documentElement.clientHeight - this.config.cursorSize);

            this.updatePosition(left, top);

            //trigger drag
            var pointedElements = elementsFromPoint(left + (this.config.cursorSize / 2), top + (this.config.cursorSize / 2));
            if (hand.pinchStrength > this.config.pinchThreshold) {
                this.lastDraggedTime = new Date();
                this.activeEffect();

                //get the element on the first layer
                var pointedElement = pointedElements[1];
                if (pointedElement){
                    if($(pointedElement).hasClass('planet')){
                        var planetLeft = left - planetRadius + radius/2;
                        var planetTop = top - planetRadius + radius/2;

                        this.$target = $(pointedElement);
                        this.$target.css({'opacity': 0.5, 'left': planetLeft, 'top': planetTop});

                        //test whether the layer under the planet is the destination of the planet
                        if($(pointedElements[2]).hasClass('frame-planet')){
                            this.$currentFramePlanet = $(pointedElements[2]);
                            this.$currentFramePlanet.addClass('active');
                        }
                    }else{
                        if($(pointedElement).hasClass('logo')){ //click the logo
                            if(horoscope.isDirty()){
                                horoscope.destination = 'index.html';
                            }else{
                                window.location.href = 'index.html';
                            }
                        }else if($(pointedElement).hasClass('close')){
                            //close the panel
                            $('.panel').fadeOut('fast');
                            this.isDetailShown = false;
                        }else if($(pointedElement).hasClass('btn-feed') && !this.isDetailShown){
                            var type = $(pointedElement).data('type');
                            horoscope.showFeed(id, type);
                            this.isDetailShown = true;
                        }else if($(pointedElement).hasClass('btn-characteristics') && !this.isDetailShown){
                            horoscope.showCharacteristics(id);
                            this.isDetailShown = true;
                        }else if($(pointedElement).hasClass('submit')){
                            window.location.href = horoscope.destination;
                        }
                    }
                }
            }else if(hand.pinchStrength < this.config.pinchThreshold && (this.lastDraggedTime != 0 && Date.now() - this.lastDraggedTime > 200)){
                //release drag
                this.lastReleasedTime = new Date();
                if(this.$target){
                    this.$target.css({'opacity': 1});

                    if($(pointedElements[2]).hasClass('active')){

                        var left = parseInt(this.$currentFramePlanet.css('left')) + offsetX - 10;
                        var top = parseInt(this.$currentFramePlanet.css('top')) + offsetY - 10;

                        //glue to the destination
                        this.$target.css({'left': left, 'top': top});
                        this.$target.removeClass('planet').addClass('planet-over');
                        this.$currentFramePlanet.addClass('over')
                    }
                    $('.frame-planet').removeClass('active');
                    //release the target planet
                    this.$target = null;
                }
            }
            //click event
            //else if()

            //detect finishing, after finishing, show detail panel
            if($('.planet').length == 0 && !this.isEnd){
                //after finishing, show origin, date and menu
                $('#zodiac-meaning').addClass('active');
                horoscope.activeLines();
                $('#menu').fadeIn();
                this.isEnd = true;
            }

            //vertical scroll
            if (topNormalized === 1) {
                window.scroll(window.scrollX, window.scrollY + this.config.scrollSpeed);
            } else if (topNormalized === 0) {
                window.scroll(window.scrollX, window.scrollY - this.config.scrollSpeed);
            }

            //horizontal scroll
            if (leftNormalized === 1) {
                window.scroll(window.scrollX + this.config.scrollSpeed, window.scrollY);
            } else if (leftNormalized === 0) {
                window.scroll(window.scrollX - this.config.scrollSpeed, window.scrollY);
            }

            //swipe controller
            if (frame.gestures.length > 0 && hand.pinchStrength < this.config.pinchThreshold) {
                for (var i = 0; i < frame.gestures.length; i++) {
                    var gesture = frame.gestures[i];
                    if(gesture.type == "swipe") {
                        //Classify swipe as either horizontal or vertical
                        var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
                        //Classify as right-left or up-down

                        if(isHorizontal){
                            var $nav = $('#nav');
                            var $currentItem = $nav.find('.active');
                            var $preItem = $currentItem.closest('li').prev().find('.nav-item');
                            var $nextItem = $currentItem.closest('li').next().find('.nav-item');

                            if($preItem.length == 0){
                                $preItem = $nav.find('.nav-item').eq(11);
                            }
                            if($nextItem.length == 0){
                                $nextItem = $nav.find('.nav-item').eq(0);
                            }

                            if(gesture.direction[0] > 0){
                                if(horoscope.isDirty()){
                                    horoscope.destination = 'puzzle.html?id=' + $nextItem.data('id');
                                }else{
                                    window.location.href = 'puzzle.html?id=' + $nextItem.data('id');
                                }
                            } else {
                                if(horoscope.isDirty()){
                                    horoscope.destination = 'puzzle.html?id=' + $preItem.data('id');
                                }else{
                                    window.location.href = 'puzzle.html?id=' + $preItem.data('id');
                                }
                            }
                        } else {
                            /*if(gesture.direction[1] > 0){
                                window.location.href = 'puzzle.html?id=' + $preItem.data('id');
                            } else {
                                window.location.href = 'puzzle.html?id=' + $nextItem.data('id');
                            }*/
                        }
                    }
                }

            }

        };

        //initilize
        this.elm = document.createElement('div');
        this.elm.style.position = 'fixed';
        this.elm.style.opacity = 0.7;
        this.elm.style.width = this.config.cursorSize + 'px';
        this.elm.style.height = this.config.cursorSize + 'px';
        //this.elm.style.borderRadius = this.config.cursorSize / 2 + 'px';
        //this.elm.style.backgroundColor = this.config.mainColor;
        $(this.elm).css({background: 'url(' + this.config.normalCursor + ') center no-repeat', backgroundSize: this.config.cursorSize + 'px'});


        document.body.appendChild(this.elm);

        var controllerOptions = {
            enableGestures: true
        };
        Leap.loop(controllerOptions, loopHandler.bind(this));
    };

    /*if(window) {
        window.LeapMouse = LeapMouse;
    }*/

    var leapMouse = new LeapMouse();

});