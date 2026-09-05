/*-----------------------------------------------------------------

Template Name: Inotek - IT Solutions HTML5 Template
Author:  Theme-vally
Author URI: https://themeforest.net/user/theme-vally
Version: 1.0.0
Description: Inotek - IT Solutions HTML5 Template

-------------------------------------------------------------------
JS TABLE OF CONTENTS
-------------------------------------------------------------------

01. Preloader
02. Scroll to Top
03. magnificPopup
04. Smooth Scrolling
05. Tilt Hover
06. Popup Search
07. Mobile Menu
08. Ajax Form
09. Masonary Function
10. Shape Mockup Function
11. Counter Odometer
12. Progress Line
13. Custom Select
14. Custom Date Select
15. Form Validation
16. Marquee Mode
17. Side Box
18. wow Animation
19.chart Container
20.title Animation
21.Swiper Slider

------------------------------------------------------------------*/

(function initMainJS() {
	if (typeof jQuery === "undefined" || typeof window.Lenis === "undefined" || typeof window.gsap === "undefined") {
		setTimeout(initMainJS, 50);
		return;
	}
	(function ($) {
	"use strict";

	/*===========================================
		=    On Load Function      =
	=============================================*/
	$(function () {
		preLoader();
	});

	function initTemplateOnLoad() {
		smoothScrolling();
		tiltHover();
		backgroundImage();
		ajaxForm();
		magnificPopup();
		masonaryFunction();
		shapeMockupFunction();
		counterOdometer();
		progressLine();
		countText();
		customSelect();
		customDateSelect();
		scrollDown();
		formValidation();
		marqueeMode();
		circleBoxAnimation();
		currentBox();
		masonryIsotope();
		commonJs();
		wowAnimation();
		accordionBox();
		titleAnimation();
		loadMore();
		allSlider();
		gsapController();
		dataItemHover();
	}

	window.PanzerTheme = window.PanzerTheme || {};
	window.PanzerTheme.init = initTemplateOnLoad;
	window.PanzerTheme.preloader = preLoader;

	if (document.readyState === "complete") {
		window.setTimeout(initTemplateOnLoad, 0);
	} else {
		$(window).on("load", initTemplateOnLoad);
	}

	scrollTop();



	/*===========================================
		=    Preloader      =
	=============================================*/
	function preLoader() {
		var $loader = $("#loading-screen");
		var hideLoader = function () {
			$(".loading-screen").stop(true, true).fadeOut(180, function () {
				// $(this).remove(); // Removed so React can safely unmount the component
			});
		};

		if ($loader.length) {
			window.setTimeout(hideLoader, 250);
		}

		$(".preloader-close").on("click", function () {
			hideLoader();
		});
	}








	/*===========================================
	=    Initialize Lenis / Smooth Scrolling    =
	=    + Scroll To Top Progress Indicator     =
	=============================================*/
	function smoothScrolling(retries = 0) {
		if (typeof Lenis === "undefined") {
			if (retries < 40) { // Try for 2 seconds (50ms * 40)
				setTimeout(() => smoothScrolling(retries + 1), 50);
			} else {
				console.warn("Lenis failed to load after 2 seconds. Smooth scrolling disabled.");
			}
			return;
		}

		// Prevent multiple Lenis instances from running at the same time
		if (window.lenisInstance) {
			// Destroy old instance to clean up RAF and event listeners
			window.lenisInstance.destroy();
			cancelAnimationFrame(window.lenisRafId);
		}

		// Create a single Lenis instance for all scrolling features
		// CSS 'scroll-behavior: smooth' has been removed so this won't conflict anymore
		const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
		window.lenisInstance = lenis;

		// Scroll progress and scroll-to-top button
		const scrollTopBox = document.querySelector(".scrollToTop");
		const water = scrollTopBox?.querySelector(".water");

		if (scrollTopBox && water) {
			// Update scroll progress indicator
			lenis.on('scroll', ({ scroll }) => {
				let percent = Math.min((scroll / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100);
				water.style.transform = `translateY(${100 - percent}%)`;
				scrollTopBox.style.display = scroll >= 200 ? 'block' : 'none';
			});

			// Scroll to top on click
			scrollTopBox.addEventListener('click', () => {
				lenis.scrollTo(0, { duration: 1.5, easing: (t) => 1 - Math.pow(2, -10 * t) });
			});
		}

		// Start the animation loop
		function raf(time) {
			lenis.raf(time);
			window.lenisRafId = requestAnimationFrame(raf);
		}
		window.lenisRafId = requestAnimationFrame(raf);
	}

	// Deprecated: scrollTop() merged into smoothScrolling()
	function scrollTop() {
		// This function is no longer needed - functionality merged into smoothScrolling()
		// Kept as empty function to avoid breaking existing code
	}


	/*===========================================
	=         Custom Tilt Js Start        =
	=============================================*/
	function tiltHover() {
		const tilt = document.querySelectorAll(".tilt");
		if (typeof VanillaTilt === "undefined" || !tilt.length) return;

		VanillaTilt.init(tilt, {
			reverse: true,
			max: 15,
			speed: 400,
			scale: 1.01,
			glare: true,
			reset: true,
			perspective: 800,
			transition: true,
			"max-glare": 0.45,
			"glare-prerender": false,
			gyroscope: true,
			gyroscopeMinAngleX: -45,
			gyroscopeMaxAngleX: 45,
			gyroscopeMinAngleY: -45,
			gyroscopeMaxAngleY: 45,
		});
	}


	/*===========================================
	=         Set Background Image         =
	=============================================*/
	function backgroundImage() {
		if ($("[data-bg-src]").length > 0) {
			$("[data-bg-src]").each(function () {
				var src = $(this).attr("data-bg-src");
				$(this).css("background-image", "url(" + src + ")");
				$(this).removeAttr("data-bg-src").addClass("background-image");
			});
		}
	}


	/*===========================================
	=         Ajax Contact Form         =
	=============================================*/
	function ajaxForm() {
		const handleFormSubmission = (form, formIndex) => {
			form.addEventListener("submit", ev => {
				ev.preventDefault();
				const data = new FormData(form);
				const submitButton = form.querySelector('button[type="submit"]');
				const originalButtonText = submitButton.querySelector('.btn-title').textContent;
				const loadingText = submitButton.dataset.loadingText;
				submitButton.querySelector('.btn-title').textContent = loadingText;
				submitButton.disabled = true;

				sendAjaxRequest("POST", form.action, data,
					response => handleSuccess(response, form, submitButton, originalButtonText),
					(statusCode, responseText) => handleError(statusCode, responseText, form, submitButton, originalButtonText)
				);
			});
		};

		const handleSuccess = (response, form, submitButton, originalButtonText) => {
			form.reset();
			let message = 'Success!';
			if (form.classList.contains('appointment-form')) {
				message = 'Appointment booked successfully!';
			} else if (form.classList.contains('contact_form')) {
				message = 'Contact submitted!';
			} else if (form.classList.contains('consulation-form')) {
				message = 'Consulation Submited!';
			} else if (form.classList.contains('comment-form')) {
				message = 'Comment Done!';
			} else if (form.classList.contains('subscribe-form')) {
				message = 'Subscribed!';
			} else if (form.classList.contains('newsletter-form')) {
				message = 'Subscribed!';
			}
			showPopup('success', message);
			submitButton.querySelector('.btn-title').textContent = originalButtonText;
			submitButton.disabled = false;
		};

		const handleError = (statusCode, responseText, form, submitButton, originalButtonText) => {
			let message = 'Oops! There was a problem.';
			if (form.classList.contains('appointment-form')) {
				message = 'Failed to book the appointment. Please try again.';
			} else if (form.classList.contains('comment-form')) {
				message = 'Somthing Mistake!';
			}
			showPopup('error', message);
			submitButton.querySelector('.btn-title').textContent = originalButtonText;
			submitButton.disabled = false;
		};

		const sendAjaxRequest = (method, url, data, successCallback, errorCallback) => {
			const xhr = new XMLHttpRequest();
			xhr.open(method, url);
			xhr.setRequestHeader("Accept", "application/json");
			xhr.onreadystatechange = () => {
				if (xhr.readyState !== XMLHttpRequest.DONE) return;
				if (xhr.status === 200) {
					successCallback(xhr.response);
				} else {
					errorCallback(xhr.status, xhr.responseText);
				}
			};
			xhr.send(data);
		};

		const showPopup = (status, message) => {
			const popup = document.createElement('div');
			popup.className = `popup-status ${status}`;
			popup.innerHTML = `<i class="far fa-${status === 'success' ? 'check-circle' : 'times-circle'}"></i> ${message}`;
			document.body.appendChild(popup);
			setTimeout(() => popup.remove(), 3000); // Remove the popup after 3 seconds
		};

		const forms = document.querySelectorAll(".appointment-form, .contact_form, .consulation-form, .comment-form, .subscribe-form, .newsletter-form");

		forms.forEach((form, index) => handleFormSubmission(form, index));
	}


	/*===========================================
	=         Magnific Popup         =
	=============================================*/
	function magnificPopup() {
		//Fancybox
		if (typeof Fancybox === "undefined" || !document.querySelector("[data-fancybox]")) return;

		Fancybox.bind("[data-fancybox]", {
			animated: true,
			transitionEffect: "fade",
		});


	}


	/*===========================================
	=        Masonary Active         =
	=============================================*/
	function masonaryFunction() {
		const elem = document.querySelector('.masonary-active');
		if (elem && typeof imagesLoaded !== "undefined" && typeof Isotope !== "undefined") {
			imagesLoaded(elem, () => {
				const iso = new Isotope(elem, {
					itemSelector: '.filter-item',
					layoutMode: 'fitRows'
				});

				document.querySelector('.portfolio-filter').addEventListener('click', (e) => {
					if (e.target.matches('li')) {
						iso.arrange({
							filter: e.target.getAttribute('data-filter')
						});
						document.querySelector('.current_menu_item')?.classList.remove('current_menu_item');
						e.target.classList.add('current_menu_item');
					}
				});
			});
		}

	}


	/*===========================================
	=         Shape Mockup         =
	=============================================*/
	function shapeMockupFunction() {
		$.fn.shapeMockup = function () {
			var $shape = $(this);
			$shape.each(function () {
				var $currentShape = $(this),
					shapeTop = $currentShape.data("top"),
					shapeRight = $currentShape.data("right"),
					shapeBottom = $currentShape.data("bottom"),
					shapeLeft = $currentShape.data("left");
				$currentShape
					.css({
						top: shapeTop,
						right: shapeRight,
						bottom: shapeBottom,
						left: shapeLeft,
					})
					.removeAttr("data-top")
					.removeAttr("data-right")
					.removeAttr("data-bottom")
					.removeAttr("data-left")
					.parent()
					.addClass("shape-mockup-wrap");
			});
		};

		if ($(".shape-mockup")) {
			$(".shape-mockup").shapeMockup();
		}
	}


	/*===========================================
	=         Counter Up Odometer         =
	=============================================*/
	function counterOdometer() {
		if ($('.count-number').length) {
			$('.count-number').appear(function () {
				var odo = $(this);
				var countNumber = odo.attr("data-count");

				odo.html(countNumber);

				setTimeout(function () {
					odo.html(countNumber);
				}, 500);
			}, {
				accY: 0
			});
		}
	}


	/*===========================================
	=         Skills progressLine         =
	=============================================*/
	function progressLine() {
		if ($('.progress-line').length) {
			$('.progress-line').appear(function () {
				let el = $(this);
				let percent = el.data('width');
				el.css('width', percent + '%');
			}, {
				accY: 0
			});
		}
	}

	/*===========================================
	=      Progress Counter + Text Count        =
	=============================================*/
	function countText() {
		if ($('.count-box').length) {
			$(".count-box").appear(
				function () {
					let $t = $(this),
						n = $t.find(".count-text").attr("data-stop"),
						r = parseInt($t.find(".count-text").attr("data-speed"), 10);

					if (!$t.hasClass("counted")) {
						$t.addClass("counted");
						$({
							countNum: $t.find(".count-text").text()
						}).animate({
							countNum: n,
						}, {
							duration: r,
							easing: "linear",
							step: function () {
								$t.find(".count-text").text(Math.floor(this.countNum));
							},
							complete: function () {
								$t.find(".count-text").text(this.countNum);
							},
						});
					}
				}, {
				accY: 0
			}
			);
		}
	}

	/*===========================================
	=        Select2 Active         =
	=============================================*/
	function customSelect() {
		$('.custom-select').select2({
			minimumResultsForSearch: 4,
		});
	}


	/*===========================================
	=        Custom Date & Time Picker         =
	=============================================*/
	function customDateSelect() {
		if ($.fn.datepicker && $(".datepicker").length) {
			$(".datepicker").datepicker({
				dateFormat: "mm/dd/yy",
				showAnim: "slideDown",
				changeMonth: true,
				changeYear: true
			});
		}
	}


	/*===========================================
	=        Scroll Down        =
	=============================================*/
	function scrollDown() {
		const scrollLink = document.getElementById("scrollLink");
		if (scrollLink) {
			scrollLink.addEventListener("click", function (event) {
				event.preventDefault();

				const targetSection = document.querySelector(this.getAttribute("href"));

				if (targetSection) {
					window.scrollTo({
						top: targetSection.offsetTop,
						behavior: "smooth"
					});
				}
			});
		}
	}


	/* =======================
	Form Validation
	======================= */
	function formValidation() {
		if ($("#appointment_form,#contact_form,#comment-form").length) {
			$("#appointment_form,#contact_form,#comment-form").validate({
				rules: {
					name: "required",
					email: {
						required: true,
						email: true
					},
					message: "required"
				},
				messages: {
					name: "Please enter your name",
					email: {
						required: "Please enter your email address",
						email: "Please enter a valid email address" // Modify this message as needed
					},
					message: "Please enter a message"
				}
				// Other options if needed
			});
		}
	}


	/*===========================================
	=         Marquee Active         =
	=============================================*/
	function marqueeMode() {
		if ($(".marquee_mode").length) {
			$('.marquee_mode').marquee({
				speed: 40,
				gap: 0,
				delayBeforeStart: 0,
				direction: 'left',
				duplicated: true,
				pauseOnHover: true,
				startVisible: true,
			});
		}
	}


	// Circle Box  Animation
	function circleBoxAnimation() {
		function createTextAnimation(textElement, circleBoxElement) {
			textElement.style.cssText = "animation: text-rotate 10s linear infinite;";

			const textRotateAnimation = textElement.animate(
				[{
					transform: "rotate(0deg)"
				}, {
					transform: "rotate(360deg)"
				}], {
				duration: 10000,
				iterations: Infinity,
				easing: "linear",
			}
			);

			circleBoxElement.addEventListener("mouseenter", () => textRotateAnimation.pause());
			circleBoxElement.addEventListener("mouseleave", () => textRotateAnimation.play());
		}

		// Apply text animation to elements with the class "circle-box"
		const circleBoxes = document.querySelectorAll(".circle-box");
		circleBoxes.forEach(circleBox => {
			const text = circleBox.querySelector(".text-inner");
			createTextAnimation(text, circleBox);
		});

		const chooseUsShapes = document.querySelectorAll(".section-shape > div > img");
		chooseUsShapes.forEach(chooseUsShape => {
			createTextAnimation(chooseUsShape, chooseUsShape.parentElement);
		});
	}


	// Current active Box
	function currentBox() {
		// Process box current
		if ($(".process-single-box").length) {
			$('.process-single-box').on('mouseenter', function () {
				$(this).addClass('current');
				$('.process-single-box').not(this).removeClass('current');
			});
		}

		// service-box-four current  use this project home4
		if ($(".service-box-four").length) {
			$('.service-box-four').on('mouseenter', function () {
				$(this).addClass('current');
				$('.service-box-four').not(this).removeClass('current');
			});
		}


		// testimonial itam current use this project home4
		if ($('.simple-testi-box').length) {
			$('.simple-testi-box').on('mouseenter', function () {
				$(this).addClass('active');
				$('.simple-testi-box').not(this).removeClass('active');
			});
		}


		// team box current
		if ($(".team-box-one").length) {
			$('.team-box-one').on('mouseenter', function () {
				$(this).addClass('current');
				$('.team-box-one').not(this).removeClass('current');
			});
		}

		// pricing box current
		if ($('.pricing-card').length) {
			$('.pricing-card').on('mouseenter', function () {
				$(this).addClass('active');
				$('.pricing-card').not(this).removeClass('active');
			});
		}


		// Project Item current
		if ($('.project-item-box').length) {
			$('.project-item-box').on('mouseenter', function () {
				$(this).addClass('active');
				$('.project-item-box').not(this).removeClass('active');
			});
		}

		if ($('.sidebar-service-list').length) {
			$('.sidebar-service-list ul li').on('mouseenter', function () {
				$(this).addClass('current');
				$('.sidebar-service-list ul li').not(this).removeClass('current');
			});
		}

	}

	if ($('.choose-tab-wrapper').length) {
		const tabButtons = document.querySelectorAll('.choose-card');
		const tabContents = document.querySelectorAll('.choose-tab-wrapper');

		tabButtons.forEach((button, index) => {
			button.addEventListener('click', () => {
				// Remove active class from all buttons and contents
				tabButtons.forEach(btn => btn.classList.remove('active'));
				tabContents.forEach(content => content.classList.remove('active'));

				// Add active class to clicked button
				button.classList.add('active');

				// Add active class to corresponding content
				const activeContent = tabContents[index];
				activeContent.classList.add('active');
			});
		});
	}

	// Project Slider
	if ($('#billingSwitch').length) {
		const billingSwitch = document.getElementById("billingSwitch");
		const monthlyPlans = document.getElementById("monthly");
		const yearlyPlans = document.getElementById("yearly");

		// Initialize state
		monthlyPlans.classList.add("active");
		yearlyPlans.classList.remove("active");

		// Toggle function
		billingSwitch.addEventListener("click", function () {
			const isYearlyActive = yearlyPlans.classList.contains("active");

			if (isYearlyActive) {
				yearlyPlans.classList.remove("active");
				monthlyPlans.classList.add("active");
			} else {
				yearlyPlans.classList.add("active");
				monthlyPlans.classList.remove("active");
			}

			// Add toggle animation to switch button
			billingSwitch.classList.add("toggled");
			setTimeout(() => billingSwitch.classList.remove("toggled"), 300);
		});

		// Toggle the 'active' class on click
		billingSwitch.addEventListener("click", function () {
			billingSwitch.classList.toggle("active");
		});
	}




	/*===========================================
	=         Masonary Isotope         =
	=============================================*/
	function masonryIsotope() {
		if ($(".image_load").length && $.fn.imagesLoaded && $.fn.isotope) {
			$('.image_load').imagesLoaded(function () {

					var $portfolio = $('.image_load'); // Fixed selector typo

					$portfolio.isotope({

						itemSelector: '.grid-item',
						filter: '*',
						layoutMode: 'masonry',
						transitionDuration: '0.8s'
					});

					// Menu filtering functionality
					$('.menu-filtering li').on('click', function () {

						$('.menu-filtering li').removeClass('active');
						$(this).addClass('active');

						var selector = $(this).attr('data-filter');
						$portfolio.isotope({
							filter: selector
						});
					});
			});
		}
	}


	/*===========================================
	=         Common Js         =
	=============================================*/
	function commonJs() {
		$("[data-background").each(function () {
			$(this).css("background-image", "url( " + $(this).attr("data-background") + "  )");
		});

		$("[data-cw]").each(function () {
			$(this).css("width", $(this).attr("data-cw"));
		});

		$("[data-left], [data-right], [data-top], [data-bottom]").each(function () {
			const directions = ["left", "right", "top", "bottom"];
			directions.forEach(direction => {
				const value = $(this).attr(`data-${direction}`);
				if (value) {
					$(this).css(direction, value); // Apply inline CSS
					$(this).removeAttr(`data-${direction}`); // Remove the attribute
				}
			});
		});

		$("[data-z-index]").each(function () {
			const value = $(this).attr("data-z-index");
			if (value) {
				$(this).css("z-index", value); // Apply the z-index as inline CSS
				$(this).removeAttr("data-z-index"); // Remove the data-z-index attribute
			}
		});



		$("[data-bg-color]").each(function () {
			$(this).css("background-color", $(this).attr("data-bg-color"));
		});

		$("[data-text-color]").each(function () {
			$(this).css("color", $(this).attr("data-text-color"));
		});

		$(".has-img").each(function () {
			var imgSrc = $(this).attr("data-menu-img");
			var img = `<img class="mega-menu-img" src="${imgSrc}" alt="img">`;
			$(this).append(img);

		});
	}


	/*===========================================
		=        Wow Active         =
	=============================================*/
	function wowAnimation() {
		if ($(".wow").length) {
			var wow = new WOW({
				boxClass: "wow",
				animateClass: "animated",
				mobile: false,
				live: true,
			});
			wow.init();
		}
	}

	/*===========================================
		=        Aos Active         =
	=============================================*/
	// AOS.init();


	/*===========================================
		=        Accordion Box         =
	=============================================*/
	function accordionBox() {
		if ($('.accordion-box').length) {
			$(".accordion-box").on('click', '.acc-btn', function () {

				var outerBox = $(this).parents('.accordion-box');
				var target = $(this).parents('.accordion');

				if ($(this).hasClass('active') !== true) {
					$(outerBox).find('.accordion .acc-btn').removeClass('active ');
				}

				if ($(this).next('.acc-content').is(':visible')) {
					return false;
				} else {
					$(this).addClass('active');
					$(outerBox).children('.accordion').removeClass('active-block');
					$(outerBox).find('.accordion').children('.acc-content').slideUp(300);
					target.addClass('active-block');
					$(this).next('.acc-content').slideDown(300);
				}
			});
		}
	}



	/*===========================================
		=        Title Animation         =
	=============================================*/
	function titleAnimation() {
		if (window.innerWidth < 767) return;

		const animatedTitles = document.querySelectorAll('.sec-title:not(.no-title-animation), .hero-content .title:not(.no-title-animation), .title-anim:not(.no-title-animation)');

		const setInitialStyles = (chars, animationType) => {
			gsap.set(chars, {
				opacity: 0,
				display: 'inline-block',
				transformOrigin: 'center center',
				...(() => {
					switch (animationType) {
						case 'slide-down': return { y: -20 };
						case 'rotate': return { rotation: -90 };
						case 'zoom-in': return { scale: 0 };
						case 'fade-up': return { y: 20 };
						case 'bounce-in': return { scale: 0.5 };
						case 'flip': return { rotationY: 90 };
						default: return { x: 20 };
					}
				})()
			});
		};

		const animateChars = (chars, animationType) => {
			gsap.to(chars, {
				opacity: 1,
				duration: 0.8,
				stagger: 0.03,
				ease: "back.out(1.7)",
				...(() => {
					switch (animationType) {
						case 'slide-down': return { y: 0 };
						case 'rotate': return { rotation: 0 };
						case 'zoom-in': return { scale: 1 };
						case 'fade-up': return { y: 0 };
						case 'bounce-in': return { scale: 1 };
						case 'flip': return { rotationY: 0 };
						default: return { x: 0 };
					}
				})()
			});
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const el = entry.target;
					const animationType = el.getAttribute('data-animation') || 'slide-right';
					const split = new SplitType(el, { types: 'chars' });
					setInitialStyles(split.chars, animationType);
					animateChars(split.chars, animationType);
					observer.unobserve(el); // Run once
				}
			});
		}, { threshold: 0.2 });

		animatedTitles.forEach(el => observer.observe(el));
	}



	/*===========================================
		=        Item Load More        =
	=============================================*/
	function loadMore() {
		if ($('#loadMore').length) {
			$('#loadMore').on('click', function () {
				const loadMoreButton = $(this);
				const originalButtonText = loadMoreButton.find('.btn-title').html();
				const loadingText = loadMoreButton.data('loading-text');

				loadMoreButton.find('.btn-title').html(loadingText);
				loadMoreButton.addClass('i-none');

				$('#loader').show();

				setTimeout(function () {
					$('#loader').hide();

					$('.more-items:hidden').slice(0, 3).slideDown();

					loadMoreButton.find('.btn-title').html(originalButtonText);
					loadMoreButton.removeClass('i-none');



				}, 1500);
			});
		}
	}


	/*===========================================
		=        All Slider        =
	=============================================*/
	function allSlider() {
		function getSlideCount(selector) {
			const slider = typeof selector === "string" ? document.querySelector(selector) : selector;
			return slider ? slider.querySelectorAll(".swiper-slide").length : 0;
		}

		function hasEnoughSlidesForLoop(selector, minimumSlides) {
			return getSlideCount(selector) > minimumSlides;
		}

		// Hero Slider
		if ($('.hero-slider1').length) {
			new Swiper(".hero-slider1", {
				loop: hasEnoughSlidesForLoop(".hero-slider1", 1),
				speed: 800,
				autoplay: {
					delay: 5000,
					disableOnInteraction: false,
				},
				effect: 'cube',
				cubeEffect: {
					shadow: true,
					slideShadows: true,
					shadowOffset: 20,
					shadowScale: 0.94,
				},
				navigation: {
					prevEl: ".array-prev",
					nextEl: ".array-next",
				},
				pagination: false,
				slidesPerView: 1
			});
		}

		// Brands Slider

		if ($('.brands-slider').length) {
			new Swiper(".brands-slider", {
				spaceBetween: 20,
				speed: 1500,
				loop: hasEnoughSlidesForLoop(".brands-slider", 6),
				autoplay: {
					delay: 7000,
					disableOnInteraction: false,
				},
				pagination: false,
				breakpoints: {
					1199: {
						slidesPerView: 6,
					},
					854: {
						slidesPerView: 4,
					},
					767: {
						slidesPerView: 3,
					},
					540: {
						slidesPerView: 2,
					},
					0: {
						slidesPerView: 1,
					}
				},
			});
		}

		// Brands Slider use this project Home page 3
		$(".brands-slider-three").not(".panzer-cyber-brand-panel .brands-slider-three").each(function () {
			const brandSlider = this;

			new Swiper(brandSlider, {
				slidesPerView: "auto",
				spaceBetween: 20,
				centeredSlides: false,
				loop: hasEnoughSlidesForLoop(brandSlider, 6),
				slidesPerGroup: 2,
				speed: 850,
				allowTouchMove: true,
				autoplay: {
					delay: 1200,
					disableOnInteraction: false,
					pauseOnMouseEnter: false,
				},
				navigation: {
					prevEl: ".panzer-brand-prev",
					nextEl: ".panzer-brand-next",
				},
				breakpoints: {
					1199: { slidesPerView: 6 },
					854: { slidesPerView: 4 },
					767: { slidesPerView: 3 },
					540: { slidesPerView: 2 },
					0: { slidesPerView: 1 },
				},
			});
		});

		// Brands Slider Two
		if ($('.brands-slider-two').length) {
			new Swiper(".brands-slider-two", {
				spaceBetween: 30,
				speed: 1500,
				loop: hasEnoughSlidesForLoop(".brands-slider-two", 5),
				autoplay: {
					delay: 7000,
					disableOnInteraction: false,
				},
				pagination: false,
				navigation: {
					prevEl: ".array-prev",
					nextEl: ".array-next",
				},
				breakpoints: {
					1200: {
						slidesPerView: 5,
					},
					992: {
						slidesPerView: 5,
					},
					767: {
						slidesPerView: 4,
					},
					575: {
						slidesPerView: 3,
					},
					0: {
						slidesPerView: 2,
					}
				},
			});
		}





		// Testimonial Slider   -------use this project home 1 --------
		if ($('.testi-slider').length) {
			new Swiper(".testi-slider", {
				spaceBetween: 24,
				speed: 1500,
				loop: hasEnoughSlidesForLoop(".testi-slider", 3),
				autoplay: false,
				pagination: false,
				navigation: {
					prevEl: ".array-prev",
					nextEl: ".array-next",
				},
				breakpoints: {
					1024: {
						slidesPerView: 3,
					},
					768: {
						slidesPerView: 2,
					},
					576: {
						slidesPerView: 2,
					},
					0: {
						slidesPerView: 1,
					},
				},
			});
		}


		// Testimonial Slider Two   use this project home2
		if ($('.testi-slider-two').length) {
			new Swiper(".testi-slider-two", {
				spaceBetween: 30,
				speed: 1500,
				loop: hasEnoughSlidesForLoop(".testi-slider-two", 2),
				autoplay: {
					delay: 3000,
					disableOnInteraction: false,
				},
				pagination: false,
				navigation: {
					prevEl: ".array-prev",
					nextEl: ".array-next",
				},
				breakpoints: {
					992: {
						slidesPerView: 1,
					},
					912: {
						slidesPerView: 2,
					},
					575: {
						slidesPerView: 1,
					},
					0: {
						slidesPerView: 1,
					},
				},
			});
		}

		// Testimonial Slider Three   use this project home3
		if ($('.testi-slider-three').length) {
			new Swiper(".testi-slider-three", {
				spaceBetween: 30,
				speed: 1500,
				loop: hasEnoughSlidesForLoop(".testi-slider-three", 2),
				autoplay: {
					delay: 3000,
					disableOnInteraction: false,
				},
				pagination: false,
				navigation: {
					prevEl: ".array-prev",
					nextEl: ".array-next",
				},
				breakpoints: {
					1199: {
						slidesPerView: 2,
					},
					1024: {
						slidesPerView: 1,
					},
					992: {
						slidesPerView: 1,
					},
					575: {
						slidesPerView: 1,
					},
					0: {
						slidesPerView: 1,
					},
				},
			});
		}

		// Testimonial Slider Four   use this project home7
		if ($('.testi-slider-four').length) {
			new Swiper(".testi-slider-four", {
				spaceBetween: 30,
				speed: 1500,
				loop: hasEnoughSlidesForLoop(".testi-slider-four", 2),
				autoplay: {
					delay: 3000,
					disableOnInteraction: false,
				},
				pagination: false,
				navigation: {
					prevEl: ".array-prev",
					nextEl: ".array-next",
				},
				breakpoints: {
					767: {
						slidesPerView: 2,
					},
					575: {
						slidesPerView: 1,
					},
					0: {
						slidesPerView: 1,
					},
				},
			});
		}



		// Team Slider
		if ($('.team-slider').length) {
			new Swiper(".team-slider", {
				spaceBetween: 24,
				speed: 1500,
				loop: hasEnoughSlidesForLoop(".team-slider", 3),
				autoplay: false,
				pagination: false,
				navigation: {
					prevEl: ".array-prev",
					nextEl: ".array-next",
				},
				breakpoints: {
					992: {
						slidesPerView: 3,
					},
					768: {
						slidesPerView: 2,
					},
					0: {
						slidesPerView: 1,
					},
				},
			});
		}

		// Service Slider use this project home2
		if ($('.service-slider:not(.panzer-scroll-service)').length) {
			new Swiper(".service-slider:not(.panzer-scroll-service)", {
				spaceBetween: 24,
				speed: 1500,
				loop: hasEnoughSlidesForLoop(".service-slider:not(.panzer-scroll-service)", 3),
				autoplay: false,
				pagination: false,
				navigation: {
					prevEl: ".array-prev",
					nextEl: ".array-next",
				},
				breakpoints: {
					1199: {
						slidesPerView: 3,
					},
					1024: {
						slidesPerView: 2,
					},
					768: {
						slidesPerView: 2,
					},
					576: {
						slidesPerView: 2,
					},
					0: {
						slidesPerView: 1,
					},
				},
			});
		}




		// hero slider Slider   Use this project
		if ($('.hero-slider').length) {
			new Swiper(".hero-slider", {
				spaceBetween: 24,
				speed: 1500,
				effect: 'fade',
				loop: hasEnoughSlidesForLoop(".hero-slider", 1),
				autoplay: {
					delay: 4000,
					disableOnInteraction: false,
				},
				autoplay: true,
				pagination: false,
				navigation: {
					prevEl: ".array-prev",
					nextEl: ".array-next",
				},
				breakpoints: {
					1024: {
						slidesPerView: 1,
					},
					768: {
						slidesPerView: 1,
					},
					576: {
						slidesPerView: 1,
					},
					0: {
						slidesPerView: 1,
					},
				},
			});
		}


		// hero slider Slider   Use this project home6
		if ($('.hero-slider-2').length) {
			new Swiper(".hero-slider-2", {
				spaceBetween: 24,
				speed: 1500,
				effect: 'fade',
				loop: hasEnoughSlidesForLoop(".hero-slider-2", 1),
				autoplay: {
					delay: 4000,
					disableOnInteraction: false,
				},
				autoplay: true,
				pagination: false,
				navigation: {
					prevEl: ".array-prev",
					nextEl: ".array-next",
				},
				breakpoints: {
					1024: {
						slidesPerView: 1,
					},
					768: {
						slidesPerView: 1,
					},
					576: {
						slidesPerView: 1,
					},
					0: {
						slidesPerView: 1,
					},
				},
			});
		}


	}




	// strategy-item  Use this project home2

	if ($(".strategy-item").length) {
		const $image = $("#strategy-img");
		$(".strategy-item").on("mouseenter", function () {
			$(".strategy-item").removeClass("active");
			$(this).addClass("active");

			const newImg = $(this).data("img");

			$image.addClass("fade-out");

			setTimeout(() => {
				$image.attr("src", newImg);
				$image.removeClass("fade-out");
			}, 300);
		});
	}




	// Team Slider One use this project home2
	if ($('.tv-team-slider').length) {
		new Swiper(".tv-team-slider", {
			spaceBetween: 24,
			speed: 1500,
			loop: document.querySelectorAll(".tv-team-slider .swiper-slide").length > 2,
			autoplay: false,
			pagination: false,
			navigation: {
				prevEl: ".array-prev",
				nextEl: ".array-next",
			},
			breakpoints: {
				1024: {
					slidesPerView: 2,
				},
				768: {
					slidesPerView: 1,
				},
				576: {
					slidesPerView: 2,
				},
				0: {
					slidesPerView: 1,
				},
			},
		});
	}




	// team hover style  use this project 
	if ($('.tv-team-card').length) {

		document.querySelectorAll('.tv-team-card').forEach(card => {
			const border = document.createElement('div');
			border.classList.add('svg-border');
			border.innerHTML = `
		<svg viewBox="0 0 100 100" preserveAspectRatio="none">
			<rect class="rect1" x="0.5" y="0.5" width="99" height="99" rx="6" ry="6" />
			<rect class="rect2" x="0.5" y="0.5" width="99" height="99" rx="6" ry="6" />
		</svg>`;
			card.prepend(border);
		});

	}


	// team hover style  use this project 
	if ($('.bg-thumb').length) {

		document.querySelectorAll('.bg-thumb').forEach(card => {
			const border = document.createElement('div');
			border.classList.add('svg-border');
			border.innerHTML = `
		<svg viewBox="0 0 100 100" preserveAspectRatio="none">
			<rect class="rect1" x="0.5" y="0.5" width="99" height="99" rx="6" ry="6" />
			<rect class="rect2" x="0.5" y="0.5" width="99" height="99" rx="6" ry="6" />
		</svg>`;
			card.prepend(border);
		});

	}



	// project box js use this project home3

	if ($('.tv-project-card').length) {
		$('.tv-project-card').on('mouseenter', function () {
			$(this).addClass('active');
			$('.tv-project-card').not(this).removeClass('active');
		});
	}


	// choose tab js use this project home3

	if ($('.choose-tab-wrapper').length) {
		const tabButtons = document.querySelectorAll('.choose-card');
		const tabContents = document.querySelectorAll('.choose-tab-wrapper');

		tabButtons.forEach((button, index) => {
			button.addEventListener('click', () => {
				if (button.classList.contains('active')) return;

				const currentActiveTab = document.querySelector('.choose-tab-wrapper.active');
				const currentActiveButton = document.querySelector('.choose-card.active');

				if (currentActiveTab) {
					currentActiveTab.classList.remove('active');
				}
				if (currentActiveButton) {
					currentActiveButton.classList.remove('active');
				}

				button.classList.add('active');

				setTimeout(() => {
					tabContents[index].classList.add('active');
				}, 50);
			});
		});
	};



	// choose section use this porject home5
	if ($('.title-box').length) {
		document.querySelectorAll('.title-box').forEach(titleBox => {
			titleBox.addEventListener('mouseenter', function () {
				document.querySelectorAll('.title-box').forEach(t => t.classList.remove('active'));
				document.querySelectorAll('.choose-right img').forEach(img => {
					img.classList.remove('active');
					img.style.opacity = '0';
				});

				this.classList.add('active');
				const targetImg = document.getElementById(this.getAttribute('data-target'));
				targetImg.classList.add('active');
				setTimeout(() => {
					targetImg.style.opacity = '1';
				}, 50);
			});
		});
	}





	// Case Slider
	if ($('.portfolio-slider').length) {
		new Swiper(".portfolio-slider", {
			direction: "horizontal",
			mousewheel: true,
			spaceBetween: 24,
			slideShadows: 3,
			speed: 1500,
			loop: document.querySelectorAll(".portfolio-slider .swiper-slide").length > 2,
			autoplay: false,
			pagination: {
				el: ".dot",
				clickable: true
			},
			navigation: {
				prevEl: ".array-prev",
				nextEl: ".array-next",
			},
			breakpoints: {
				854: {
					slidesPerView: 2,
				},
				0: {
					slidesPerView: 1,
				},
			},
		});
	}



	// project js use this project home6
	document.addEventListener('DOMContentLoaded', function () {
		const projectBoxes = document.querySelectorAll('.col-lg-3[data-thumb]');
		const thumbs = document.querySelectorAll('.thumb[data-thumb]');
		const container = document.querySelector('.row.gx-0.position-relative');
		const firstThumb = document.querySelector('.thumb[data-thumb="1"]');

		if (!projectBoxes.length || !thumbs.length || !container || !firstThumb) {
			return;
		}

		// Initialize first thumb as active
		thumbs.forEach(thumb => thumb.classList.remove('active'));
		firstThumb.classList.add('active');

		// Hover handler
		function handleHover(thumbNumber) {
			thumbs.forEach(thumb => {
				thumb.classList.remove('active');
				if (thumb.dataset.thumb === thumbNumber) {
					thumb.classList.add('active');
				}
			});
		}

		// Project box hover
		projectBoxes.forEach(box => {
			box.addEventListener('mouseenter', function () {
				handleHover(this.dataset.thumb);
			});
		});

		// Reset to first thumb when leaving container
		container.addEventListener('mouseleave', function () {
			thumbs.forEach(thumb => thumb.classList.remove('active'));
			firstThumb.classList.add('active');
		});
	});




	/* ------------- Gsap registration Js ------------- */
	const gsapPlugins = [];
	if (typeof ScrollTrigger !== "undefined") gsapPlugins.push(ScrollTrigger);
	if (typeof ScrollSmoother !== "undefined") gsapPlugins.push(ScrollSmoother);
	if (typeof ScrollToPlugin !== "undefined") gsapPlugins.push(ScrollToPlugin);
	if (gsapPlugins.length) gsap.registerPlugin.apply(gsap, gsapPlugins);

	if (typeof ScrollSmoother !== "undefined" && $("#smooth-wrapper").length && $("#smooth-content").length) {
		gsap.config({
			nullTargetWarn: false,
		});

		let smoother = ScrollSmoother.create({
			smooth: 1.5,
			effects: true,
			smoothTouch: 0.1,
			ignoreMobileResize: true,
		});
	}


	if ($('.from-left').length) {
		// Left Column Animation
		gsap.from(".from-left", {
			x: -200,
			opacity: 0,
			duration: 1,
			scrollTrigger: {
				trigger: ".from-left",
				start: "top 80%",
				scrub: true,
				markers: false
			}
		});
	}

	if ($('.from-right').length) {
		// Right Column Animation
		gsap.from(".from-right", {
			x: 200,
			opacity: 0,
			duration: 1,
			scrollTrigger: {
				trigger: ".from-right",
				start: "top 80%",
				scrub: true,
				markers: false
			}
		});
	}



	// হোম ৪ এর ইমেজ স্কলিং এর জন্য কিন্তু কাজ করে নাই পরে দেখবো
	document.addEventListener("scroll", function () {
		const images = document.querySelectorAll("[data-speed]");

		images.forEach(img => {
			let speed = parseFloat(img.dataset.speed);
			let offset = window.scrollY * speed;

			img.style.transform = `translateY(${offset}px)`;
		});
	});



	// Create scroll-driven 360-degree rotation for each .tm-gsap-animate-circle
	document.querySelectorAll(".tm-gsap-animate-circle").forEach((circle, i) => {

		let spinAnim = gsap.timeline({
			scrollTrigger: {
				trigger: circle,
				scrub: true,
				start: "top bottom",
				end: "bottom top",
				toggleActions: "play none none reverse",
				markers: false
			}
		});

		spinAnim.fromTo(circle,
			{ rotation: 0, transformOrigin: "50% 50%" },
			{ rotation: 360, duration: 6, ease: "power1.out", immediateRender: false }
		);
	});




	// industries section scroll animation use this project home4
	const cards = document.querySelectorAll(".industries-card");
	if (cards.length >= 3) {
		gsap.set(cards[1], { y: 100 });
		gsap.set(cards[2], { y: 200 });

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: ".industries-wrapper",
				start: "top 150%",
				end: "bottom bottom",
				scrub: 0.5,
			}
		});

		// stagger ব্যবহার করে একসাথে animate করানো
		tl.to(cards, {
			y: 0,
			ease: "power2.out",
			duration: 0.5,
			stagger: 0.2 // প্রতিটি কার্ড 0.2s delay সহ শুরু হবে
		});
	}



	// Index service cards use the same pinned-scroll behavior as the About service section.
	const indexServiceWrapper = document.querySelector(".panzer-scroll-service .swiper-wrapper");
	if (indexServiceWrapper && !indexServiceWrapper.classList.contains("panzer-service-rows-ready")) {
		const serviceSlides = Array.from(indexServiceWrapper.querySelectorAll(":scope > .swiper-slide"));
		const cardsPerRow = window.innerWidth >= 992 ? 3 : window.innerWidth >= 576 ? 2 : 1;
		const totalRows = Math.ceil(serviceSlides.length / cardsPerRow);

		serviceSlides.forEach((slide, index) => {
			if (index % cardsPerRow === 0) {
				const row = document.createElement("div");
				row.className = "panzer-service-row service-item-wrap";

				if (Math.floor(index / cardsPerRow) < totalRows - 1) {
					row.classList.add("service-item-pin");
				}

				indexServiceWrapper.appendChild(row);
			}

			indexServiceWrapper.lastElementChild.appendChild(slide);
		});

		indexServiceWrapper.classList.add("panzer-service-rows-ready");
	}

	const panzerServiceSlider = document.querySelector(".panzer-scroll-service");
	if (panzerServiceSlider && !panzerServiceSlider.dataset.panzerServiceReady) {
		panzerServiceSlider.dataset.panzerServiceReady = "true";
		const prevButton = document.querySelector(".panzer-service-prev");
		const nextButton = document.querySelector(".panzer-service-next");
		const getServiceScrollStep = () => {
			const firstSlide = panzerServiceSlider.querySelector(".swiper-slide");
			const sliderStyles = window.getComputedStyle(indexServiceWrapper || panzerServiceSlider);
			const gap = parseFloat(sliderStyles.columnGap || sliderStyles.gap) || 0;

			return firstSlide ? firstSlide.getBoundingClientRect().width + gap : panzerServiceSlider.clientWidth;
		};

		if (prevButton) {
			prevButton.addEventListener("click", () => {
				panzerServiceSlider.scrollBy({
					left: -getServiceScrollStep(),
					behavior: "smooth",
				});
			});
		}

		if (nextButton) {
			nextButton.addEventListener("click", () => {
				panzerServiceSlider.scrollBy({
					left: getServiceScrollStep(),
					behavior: "smooth",
				});
			});
		}
	}

	// service slider style use this project home one 
	let device_width = window.innerWidth;
	const serviceStack = gsap.utils.toArray(".service-item-pin");
	if (serviceStack.length > 0) {
		if (device_width > 992) {
			serviceStack.forEach(item => {
				gsap.to(item, {
					opacity: 0,
					scale: 0.9,
					y: 50,
					scrollTrigger: {
						trigger: item,
						scrub: true,
						start: "top 150px",
						pin: true,
						pinSpacing: false,
						markers: false,
					},
				});
			});
		}
	}






	// Run immediately instead of waiting for DOMContentLoaded which breaks on client-side routing
	let device_width2 = window.innerWidth;
	const projectStack = gsap.utils.toArray(".project-item-pin");

	if (projectStack.length > 0) {
		if (device_width2 > 992) {
			projectStack.forEach(item => {
				gsap.to(item, {
					opacity: 0,
					scale: 0.9,
					y: 50,
					scrollTrigger: {
						trigger: item,
						scrub: true,
						start: "top 150px",
						pin: true,
						pinSpacing: false,
						markers: false,
					},
				});
			});
		}
	}



	/* ------------- Gsap Js ------------- */
	function gsapController() {
		let mediaMatch = gsap.matchMedia();

		function rtlValue(value) {
			const isRTL = document.documentElement.dir === "rtl";
			return isRTL ? -value : value;
		}

	}

	/* Image Hover Effect Start */
	const dataItemHover = () => {
		const initHoverEffect = (container, images) => {
			if (container.data("hover-ready")) {
				return;
			}

			if (typeof hoverEffect === "undefined" || typeof THREE === "undefined") {
				return;
			}

			const firstImage = images.eq(0);
			const imageElement = firstImage.get(0);
			const imageSource = firstImage.attr("src");
			const imageWidth = imageElement ? (imageElement.naturalWidth || imageElement.width) : 0;
			const imageHeight = imageElement ? (imageElement.naturalHeight || imageElement.height) : 0;
			const parentElement = container.get(0);

			if (!parentElement || !imageSource || !imageWidth || !imageHeight || !parentElement.offsetWidth || !parentElement.offsetHeight) {
				return;
			}

			const styleNumber = container.data("style") || "01";
			const displacementPath = `assets/images/displacement/${styleNumber}.webp`;

			try {
				const hoverInstance = new hoverEffect({
					parent: parentElement,
					intensity: container.data("intensity") || 0.2,
					speedIn: container.data("speedin") || 1,
					speedOut: container.data("speedout") || 1,
					image1: imageSource,
					image2: imageSource,
					displacementImage: displacementPath,
					imagesRatio: imageWidth / imageHeight,
					hover: false,
				});

				container.data("hover-ready", true);
				container.closest(".data-item-hover")
					.on("mouseenter", () => hoverInstance.next && hoverInstance.next())
					.on("mouseleave", () => hoverInstance.previous && hoverInstance.previous());
			} catch (error) {
				if (window.console && console.warn) {
					console.warn("Panzer hover effect skipped:", error);
				}
			}
		};

		const setupHoverAnimations = () => {
			$(".data-img-hover").each(function () {
				const currentContainer = $(this);
				const imageElements = currentContainer.find("img");
				const firstImage = imageElements.eq(0);

				if (!firstImage.length) {
					return;
				}

				if (firstImage[0].complete) {
					initHoverEffect(currentContainer, imageElements);
				} else {
					firstImage.on("load", () => initHoverEffect(currentContainer, imageElements));
				}
			});
		};

		setupHoverAnimations();
	};



	})(jQuery);
})();
