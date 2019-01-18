import { TweenLite } from 'gsap';
import { tns } from '../vendors/tiny-slider/tiny-slider';

export default class SliderCarousel {
    constructor(option = {}) {

        this.container = option.container || null;

        this.use_autoPlay = option.autoPlay || false;
        this.use_controls = option.controls || false;
        this.use_progress = option.progress || false;

        this.config_id = option.id || '#slider-carousel';
        this.config_width = option.width || 200;
        this.config_gutter = option.gutter || 20;

        this.time_wait = option.wait || 5000;
        this.time_duration = option.duration || 1000;

        this.autoplay_switch = 0;

        this.isPlaying = null;
        this.is_anim = true;
        this.isClicked = true;
        this.isTouch = true;

        this.route = document.querySelector(this.container) || false;

        this.controls_container = null;
        this.controls_prev = null;
        this.controls_next = null;

        this.progress_container = null;
        this.progress_bar = null;
        this.progress_current = null;
        this.progress_total = null;

        this.slide_config = null;
        this.slide_info = null;
        this.slide_total = null;
        this.slide_current = null;

    }

    run() {

        if(!this.route) return;

        this.slide_config = tns({
            'container': this.config_id,
            'speed': this.time_duration,
            'gutter': this.config_gutter,
            'fixedWidth': this.config_width,
            'touch': true,
            'nav': false,
            'swipeAngle': false,
            'autoplay': false,
            'controls': false,
            'mouseDrag': false,
            // 'responsive': {
            //     769: {
            //     },
            // }
        });

        this.slide_info = this.slide_config.getInfo();
        this.slide_total = this.slide_info.slideCount;

        if(this.use_controls) {
            
            this.controls_container = this.route.querySelector(this.container + '__controls');
            this.controls_prev = this.controls_container.querySelector(this.container + '__controls--prev');
            this.controls_next = this.controls_container.querySelector(this.container + '__controls--next');

        }

        if(this.use_progress) {
            
            this.progress_container = this.route.querySelector('');
            this.progress_bar = this.progress_container.querySelector('');
            this.progress_current = this.progress_container.querySelector('');
            this.progress_total = this.progress_container.querySelector('');

            this.progressTotal.innerHTML = this.slide_total;

        }
        
        this.route.style.visibility = 'visible';

        this._setActive();
        this._controls();
        this._progress('next');
        this._autoPlay();
        this._touch();

    }

    _slideGoTo(direction) {

        this.slide_config.goTo(direction);

        this._setActive();

    }

    _setActive() {

        this.isClicked = false;

        this.slide_info = this.slide_config.getInfo();
        this.slide_current = this.slide_info.index;

        this._reset();

    }

    _reset() {

        this.is_anim = false;
        this.autoplay_switch = 0;

        if(this.progress) {

            TweenLite.to(this.progress_bar, this.time_duration * .001 * .5, {
                width: '100%',
                ease: this.getCubicCurve(.65, .01, .1, .95),
                onComplete: () => {

                    TweenLite.to(this.progressBar, this.time_duration * .001 * .5, {
                        left: '100%',
                        ease: this.getCubicCurve(.65, .01, .1, .95),
                        onComplete: () => {
                            
                            TweenLite.set(this.progressBar, {
                                left: 0,
                            });

                            this.is_anim = true;
                            this.isClicked = true;
                            this._autoPlay();

                        }
                    });

                }
            });

        } else {

            setTimeout(() => {
                
                this.is_anim = true;
                this.isClicked = true;
                this._autoPlay();

            }, this.time_duration);

        }

    }

    _progress(direction) {

        if(!this.progress) return;

        let before = null;
        let after = null;

        if(direction == 'prev') {
            before = '-100%';
            after = '100%';
        }

        if(direction == 'next') {
            before = '100%';
            after = '-100%';
        }

        if($('.is-append').length){
            let target = this.progress_current.querySelector('.is-append') || false;
            if(target) target.parentNode.removeChild(target);
        }

        let active = this.progress_current.querySelector('.is-active') || false;

        let append = document.createElement('div');
            append.classList.add('is-append');
            append.textContent = this.slide_info.disPlayingIndex;

        TweenLite.set(append, {
            y: after,
            onComplete: () => {

                this.progress_current.appendChild(append);

                TweenLite.to(active, this.time_duration * .001, {
                    y: before,
                    ease: this.getCubicCurve(.65, .01, .1, .95),
                    onComplete: () => {
                        active.parentNode.removeChild(active);
                    }
                });

                TweenLite.to(append, this.time_duration * .001, {
                    y: '0%',
                    ease: this.getCubicCurve(.65, .01, .1, .95),
                    onComplete: () => {
                        append.className = 'is-active';
                    }
                });

            }
        });

    }

    _controls() {

        this.controls_container.addEventListener('click',(e) => {
            e.preventDefault();

            if(!this.isClicked) return;

            let target = e.target;
            let direction = (target == this.controls_prev) ? 'prev' : ((target == this.controls_next) ? 'next' : null);

            this._slideGoTo(direction);
            this._progress(direction);

        }, false);

    }

    _autoPlay() {

        if(!this.use_autoPlay) return;
        if(!this.is_anim) return;

        let time = this.time_wait * .06;
        this.autoplay_switch += 1;

        if(this.progress) {
            this.progressBar.style.width = this.autoplay_switch / time * 100 + '%';
        }

        if(this.autoplay_switch >= time) {
            this._slideGoTo('next');
            this._progress('next');
        }

        if (this.isPlaying) cancelAnimationFrame(this.isPlaying);
        this.isPlaying = requestAnimationFrame(this._autoPlay.bind(this));

    }

    _touch() {

        this.slide_config.events.on('touchStart', () => {

            this.is_anim = false;

        });

        this.slide_config.events.on('touchEnd', () => {

            this.is_anim = true;

            this._slideGoTo('next');
            this._progress('next');

            this.route.style.pointerEvents = 'none';

            setTimeout(() => { 

                this.route.style.pointerEvents = 'auto';

            }, this.time_duration);

        });

    }

    static getCubicCurve(a, b, c, d) {
        return CustomEase.create('custom', `M0,0 C${Number(a)},${Number(b)} ${Number(c)},${Number(d)} 1,1`);
    }

}