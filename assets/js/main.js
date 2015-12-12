$(function(){
    var LeapMouse = function() {

        this.config = {
            cursorSize: 20,
            mainColor: 'black',
            activeColor: 'red',
            scrollSpeed: 16,
            grabThreshold: 0.5,
            pinchThreshold: 0.8
        };

        this.updatePosition = function(left, top) {
            this.elm.style.left = left + 'px';
            this.elm.style.top = top + 'px';
        };

        this.activeEffect = function() {
            this.elm.style.backgroundColor = this.config.activeColor;

            var setToNormal = function() {
                this.elm.style.backgroundColor = this.config.mainColor;
            };
            setTimeout(setToNormal.bind(this), 500);
        };

        this.$target = null;

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
            if (hand.pinchStrength > this.config.pinchThreshold) {
                this.activeEffect();

                var pointedElement = document.elementsFromPoint(left + (this.config.cursorSize / 2), top + (this.config.cursorSize / 2))[1];
                if (pointedElement){
                    //console.log(pointedElement);
                    this.$target = $(pointedElement);
                    if(this.$target.hasClass('zodiac-component')){
                        var id = this.$target.closest('.menu-item').data('id');
                        window.location.href = 'puzzle.html?id=' + id;
                    }else if(this.$target.hasClass('close')){
                        //close the panel
                        $('.panel').fadeOut('fast');
                    }
                }
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
        };


        //initilize
        this.elm = document.createElement('div');
        this.elm.style.position = 'fixed';
        this.elm.style.opacity = 0.7;
        this.elm.style.width = this.config.cursorSize + 'px';
        this.elm.style.height = this.config.cursorSize + 'px';
        this.elm.style.borderRadius = this.config.cursorSize / 2 + 'px';
        this.elm.style.backgroundColor = this.config.mainColor;
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